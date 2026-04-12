using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

namespace Arsenal.API.IntegrationTests;

public class ContactEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;

    public ContactEndpointTests(WebAppFactory factory)
        => _client = factory.CreateClient();

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
}
