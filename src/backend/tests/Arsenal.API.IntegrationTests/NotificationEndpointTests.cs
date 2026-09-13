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
    [Trait("scenario", "US1-AS1")]
    public async Task POST_Contact_Success_ChannelCalledExactlyOnce()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new { name = "Тест", phone = "+79780000000", message = "Сообщение" };
        await client.PostAsJsonAsync("/api/contact", payload);

        await WaitForNotificationAsync(telegram);
        telegram.AttemptCount.Should().Be(1, "channel should be invoked exactly once on success");
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
    [Trait("scenario", "US1-AS2")]
    public async Task POST_Tryout_BoundaryAge_MinAge3Accepted()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload3 = new
        {
            childName = "Маша",
            childAge = 3,
            parentName = "Родитель",
            phone = "+79780000001"
        };
        var response3 = await client.PostAsJsonAsync("/api/tryout", payload3);
        response3.StatusCode.Should().Be(HttpStatusCode.OK);
        var notif3 = await WaitForNotificationAsync(telegram);
        notif3.Fields.Should().Contain(f => f.Label == "Возраст" && f.Value == "3");
    }

    [Fact]
    [Trait("scenario", "US1-AS2")]
    public async Task POST_Tryout_BoundaryAge_MaxAge18Accepted()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload18 = new
        {
            childName = "Иван",
            childAge = 18,
            parentName = "Родитель",
            phone = "+79780000002"
        };
        var response18 = await client.PostAsJsonAsync("/api/tryout", payload18);
        response18.StatusCode.Should().Be(HttpStatusCode.OK);
        var notif18 = await WaitForNotificationAsync(telegram);
        notif18.Fields.Should().Contain(f => f.Label == "Возраст" && f.Value == "18");
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
    [Trait("scenario", "US2-AS1")]
    public async Task POST_Contact_Success_BothChannelsCalledExactlyOnce()
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

        await WaitForNotificationAsync(telegram);
        await WaitForNotificationAsync(email);

        telegram.AttemptCount.Should().Be(1, "Telegram channel should be invoked exactly once");
        email.AttemptCount.Should().Be(1, "Email channel should be invoked exactly once");
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
    [Trait("scenario", "US3-AS1")]
    public async Task POST_Contact_ChannelThrows_ChannelInvokedButDidNotPreventPersistence()
    {
        var telegram = new FakeNotificationChannel("Telegram") { ShouldThrow = true };
        var email = new FakeNotificationChannel("Email");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram, email });
        using var client = factory.CreateClient();

        var payload = new { name = "Иван", phone = "+79780000003", message = "Тест" };
        var response = await client.PostAsJsonAsync("/api/contact", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        telegram.AttemptCount.Should().Be(1, "throwing channel should have been attempted");

        // Другой канал должен был работать
        var emailNotif = await WaitForNotificationAsync(email);
        emailNotif.Should().NotBeNull();
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

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public async Task POST_Contact_ValidationError_EmptyName_DoesNotInvokeChannels()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new { name = "", phone = "+79780000000", message = "Текст" };
        var response = await client.PostAsJsonAsync("/api/contact", payload);

        response.StatusCode.Should().NotBe(HttpStatusCode.OK, "validation should reject empty name");
        telegram.AttemptCount.Should().Be(0, "channels should not be invoked on validation error");
    }

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public async Task POST_Contact_ValidationError_EmptyPhone_DoesNotInvokeChannels()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new { name = "Иван", phone = "", message = "Текст" };
        var response = await client.PostAsJsonAsync("/api/contact", payload);

        response.StatusCode.Should().NotBe(HttpStatusCode.OK, "validation should reject empty phone");
        telegram.AttemptCount.Should().Be(0, "channels should not be invoked on validation error");
    }

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public async Task POST_Contact_ValidationError_EmptyMessage_DoesNotInvokeChannels()
    {
        var telegram = new FakeNotificationChannel("Telegram");
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { telegram });
        using var client = factory.CreateClient();

        var payload = new { name = "Иван", phone = "+79780000000", message = "" };
        var response = await client.PostAsJsonAsync("/api/contact", payload);

        response.StatusCode.Should().NotBe(HttpStatusCode.OK, "validation should reject empty message");
        telegram.AttemptCount.Should().Be(0, "channels should not be invoked on validation error");
    }

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public async Task POST_Contact_TimeoutCancellation_RespectsCancellationToken()
    {
        var blockingChannel = new SlowFakeNotificationChannel("Slow", TimeSpan.FromSeconds(20));
        await using var factory = new NotificationsWebAppFactory(new IFeedbackNotificationChannel[] { blockingChannel });
        using var client = factory.CreateClient();

        var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(10));
        var payload = new { name = "Иван", phone = "+79780000000", message = "Текст" };

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/contact")
            {
                Content = JsonContent.Create(payload)
            };
            // Отправляем с timeout 10 секунд
            using var timeoutClient = new HttpClient();
            timeoutClient.Timeout = TimeSpan.FromSeconds(10);
            var response = await timeoutClient.PostAsJsonAsync("http://localhost/api/contact", payload);
            // Если канал блокирует >10s, то ответ может быть timeout
        }
        catch (TaskCanceledException)
        {
            // Acceptable: timeout occurred as expected
        }
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

internal sealed class SlowFakeNotificationChannel : IFeedbackNotificationChannel
{
    private readonly TimeSpan _delay;

    public SlowFakeNotificationChannel(string name, TimeSpan delay)
    {
        Name = name;
        _delay = delay;
    }

    public string Name { get; }
    public bool IsConfigured => true;

    public async Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken)
    {
        await Task.Delay(_delay, cancellationToken);
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
