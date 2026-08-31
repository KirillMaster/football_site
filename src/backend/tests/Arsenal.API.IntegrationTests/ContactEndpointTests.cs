using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace Arsenal.API.IntegrationTests;

public class ContactEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;
    private readonly HttpClient _client;

    public ContactEndpointTests(WebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task POST_Contact_WithValidData_Returns200()
    {
        var payload = new
        {
            name = "Тест Тестов",
            phone = "+79780000000",
            email = (string?)null,
            message = "Хочу записать ребенка на тренировку"
        };

        var response = await _client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Contact_WithEmptyName_Returns400()
    {
        var payload = new { name = "", phone = "+79780000000", message = "Message" };
        var response = await _client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Tryout_WithValidData_Returns200()
    {
        var payload = new
        {
            childName = "Иван",
            childAge = 8,
            parentName = "Мария Иванова",
            phone = "+79780000000",
            email = (string?)null,
            message = (string?)null
        };

        var response = await _client.PostAsJsonAsync("/api/tryout", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Tryout_WithInvalidAge_Returns400()
    {
        var payload = new { childName = "Иван", childAge = 25, parentName = "Parent", phone = "+79780000000" };
        var response = await _client.PostAsJsonAsync("/api/tryout", payload);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public async Task POST_Tryout_WithUtmAndYmClientId_PersistsAllFields()
    {
        var payload = new
        {
            childName = "Пётр",
            childAge = 9,
            parentName = "Анна Петрова",
            phone = "+79780000001",
            utmSource = "yandex",
            utmMedium = "cpc",
            utmCampaign = "tryout",
            utmContent = "banner1",
            utmTerm = "football",
            ymClientId = "111222333.444555666"
        };

        var response = await _client.PostAsJsonAsync("/api/tryout", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var saved = await db.TryoutRequests.FindAsync(created!.Id);
        saved.Should().NotBeNull();

        saved!.UtmSource.Should().Be("yandex");
        saved.UtmMedium.Should().Be("cpc");
        saved.UtmCampaign.Should().Be("tryout");
        saved.UtmContent.Should().Be("banner1");
        saved.UtmTerm.Should().Be("football");
        saved.YmClientId.Should().Be("111222333.444555666");
    }

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public async Task POST_Contact_WithUtmAndYmClientId_PersistsAllFields()
    {
        var payload = new
        {
            name = "Сергей Сергеев",
            phone = "+79780000002",
            email = (string?)null,
            message = "Хочу узнать про расписание",
            utmSource = "google",
            utmMedium = "cpc",
            utmCampaign = "contact",
            utmContent = "banner2",
            utmTerm = "arsenal92",
            ymClientId = "777888999.000111222"
        };

        var response = await _client.PostAsJsonAsync("/api/contact", payload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var created = await response.Content.ReadFromJsonAsync<CreatedResponse>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var saved = await db.ContactMessages.FindAsync(created!.Id);
        saved.Should().NotBeNull();

        saved!.UtmSource.Should().Be("google");
        saved.UtmMedium.Should().Be("cpc");
        saved.UtmCampaign.Should().Be("contact");
        saved.UtmContent.Should().Be("banner2");
        saved.UtmTerm.Should().Be("arsenal92");
        saved.YmClientId.Should().Be("777888999.000111222");
    }
}

file record CreatedResponse(Guid Id, string Message);
