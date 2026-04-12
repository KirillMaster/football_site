using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

namespace Arsenal.API.IntegrationTests;

public class AuthEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointTests(WebAppFactory factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task POST_Login_WithInvalidCredentials_Returns401()
    {
        var payload = new { email = "wrong@example.com", password = "WrongPassword1!" };
        var response = await _client.PostAsJsonAsync("/api/admin/auth/login", payload);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task POST_Login_WithEmptyEmail_Returns400()
    {
        var payload = new { email = "", password = "Password1!" };
        var response = await _client.PostAsJsonAsync("/api/admin/auth/login", payload);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GET_AdminPages_WithoutAuth_Returns401()
    {
        var response = await _client.GetAsync("/api/admin/pages");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_PublicPages_WithoutAuth_Returns200()
    {
        var response = await _client.GetAsync("/api/pages");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_SitemapData_Returns200()
    {
        var response = await _client.GetAsync("/api/sitemap-data");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
