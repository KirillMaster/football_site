using Arsenal.Application.Notifications;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Arsenal.API.IntegrationTests;

public class NotificationEndpointTests
{
    [Fact]
    [Trait("scenario", "US1-AS1")]
    public async Task POST_Contact_Success_DeliversNotificationToConfiguredChannel()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new
        {
            name = "Иван Иванов",
            phone = "+79780000000",
            email = "ivan@example.com",
            message = "Хочу записать ребёнка",
            utmSource = "yandex"
        };

        var response = await client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var notification = await WaitForNotificationAsync(telegram);
        notification.Title.Should().Be("Новое сообщение с сайта");
        notification.Fields.Should().Contain(f => f.Label == "Имя" && f.Value == "Иван Иванов");
        notification.Utm.Should().Contain(f => f.Label == "utm_source" && f.Value == "yandex");
    }

    [Fact]
    [Trait("scenario", "US1-AS2")]
    public async Task POST_Tryout_Success_DeliversNotificationWithChildAndParentFields()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new
        {
            childName = "Пётр",
            childAge = 9,
            parentName = "Анна Петрова",
            phone = "+79780000001"
        };

        var response = await client.PostAsJsonAsync("/api/tryout", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var notification = await WaitForNotificationAsync(telegram);
        notification.Fields.Should().Contain(f => f.Label == "Имя ребёнка" && f.Value == "Пётр");
        notification.Fields.Should().Contain(f => f.Label == "Имя родителя" && f.Value == "Анна Петрова");
    }

    [Fact]
    [Trait("scenario", "US2-AS1")]
    public async Task POST_Contact_Success_FansOutToAllConfiguredChannels()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        var email = new FakeNotificationChannel("Email");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram, email });
        using var client = factory.CreateClient();

        var payload = new
        {
            name = "Мария",
            phone = "+79780000004",
            message = "Просим перезвонить"
        };

        var response = await client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var telegramNotification = await WaitForNotificationAsync(telegram);
        var emailNotification = await WaitForNotificationAsync(email);
        telegramNotification.Title.Should().Be(emailNotification.Title);
    }

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public async Task POST_Contact_AllChannelsThrow_StillPersistsAndReturns200()
    {
        var telegram = new FakeNotificationChannel("Telegram") { ShouldThrow = true };
        var email = new FakeNotificationChannel("Email") { ShouldThrow = true };
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram, email });
        using var client = factory.CreateClient();

        var payload = new
        {
            name = "Сергей",
            phone = "+79780000002",
            message = "Вопрос по расписанию"
        };

        var response = await client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        await WaitForAttemptAsync(telegram);
        await WaitForAttemptAsync(email);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var saved = await db.ContactMessages.FindAsync(created!.Id);
        saved.Should().NotBeNull();
    }

    [Fact]
    [Trait("scenario", "US3-AS2")]
    public async Task POST_Tryout_NoChannelsConfigured_StillPersistsAndNeverSends()
    {
        var telegram = new FakeNotificationChannel("Telegram") { IsConfigured = false };
        var email = new FakeNotificationChannel("Email") { IsConfigured = false };
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram, email });
        using var client = factory.CreateClient();

        var payload = new
        {
            childName = "Мария",
            childAge = 7,
            parentName = "Ольга Смирнова",
            phone = "+79780000004"
        };

        var response = await client.PostAsJsonAsync("/api/tryout", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var saved = await db.TryoutRequests.FindAsync(created!.Id);
        saved.Should().NotBeNull();

        telegram.AttemptCount.Should().Be(0);
        email.AttemptCount.Should().Be(0);
    }

    private static async Task<FeedbackNotification> WaitForNotificationAsync(FakeNotificationChannel channel)
    {
        var timeout = Task.Delay(TimeSpan.FromSeconds(5));
        var completed = await Task.WhenAny(channel.Received, timeout);
        completed.Should().Be(channel.Received, "the fake channel was expected to receive a notification within the test timeout");
        return await channel.Received;
    }

    private static async Task WaitForAttemptAsync(FakeNotificationChannel channel)
    {
        var timeout = Task.Delay(TimeSpan.FromSeconds(5));
        var completed = await Task.WhenAny(channel.Attempted, timeout);
        completed.Should().Be(channel.Attempted, "the fake channel was expected to be invoked within the test timeout");
    }
}

file record CreatedResponse(Guid Id, string Message);

internal sealed class FakeNotificationChannel : IFeedbackNotificationChannel
{
    private readonly TaskCompletionSource<FeedbackNotification> _received = new();
    private readonly TaskCompletionSource _attempted = new();
    private int _attemptCount;

    public FakeNotificationChannel(string name) => Name = name;

    public string Name { get; }
    public bool IsConfigured { get; set; } = true;
    public bool ShouldThrow { get; set; }
    public int AttemptCount => _attemptCount;
    public Task<FeedbackNotification> Received => _received.Task;
    public Task Attempted => _attempted.Task;

    public Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref _attemptCount);
        _attempted.TrySetResult();

        if (ShouldThrow)
            throw new InvalidOperationException("Simulated channel failure");

        _received.TrySetResult(notification);
        return Task.CompletedTask;
    }
}

file sealed class NotificationsWebAppFactory : Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>
{
    private readonly string _dbName = "ArsenalNotifTest_" + Guid.NewGuid();
    private readonly IReadOnlyList<IFeedbackNotificationChannel> _channels;

    public NotificationsWebAppFactory(IReadOnlyList<IFeedbackNotificationChannel> channels)
    {
        _channels = channels;

        Environment.SetEnvironmentVariable("DATABASE_URL", "Host=localhost;Database=arsenaltest");
        Environment.SetEnvironmentVariable("JWT_SECRET", "test-secret-key-minimum-32-characters-long!");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "arsenal-api");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "arsenal-frontend");
        Environment.SetEnvironmentVariable("S3_ENDPOINT", "https://s3.example.com");
        Environment.SetEnvironmentVariable("S3_BUCKET", "test-bucket");
        Environment.SetEnvironmentVariable("S3_ACCESS_KEY", "test-key");
        Environment.SetEnvironmentVariable("S3_SECRET_KEY", "test-secret");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ArsenalDbContext>>();
            services.RemoveAll<ArsenalDbContext>();

            var configType = typeof(IDbContextOptionsConfiguration<ArsenalDbContext>);
            foreach (var d in services.Where(d => d.ServiceType == configType).ToList())
                services.Remove(d);

            services.AddDbContext<ArsenalDbContext>(opts => opts.UseInMemoryDatabase(_dbName));

            services.RemoveAll<IFeedbackNotificationChannel>();
            foreach (var channel in _channels)
                services.AddSingleton(channel);

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
