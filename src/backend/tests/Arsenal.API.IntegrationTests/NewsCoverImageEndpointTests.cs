using Arsenal.API.Controllers;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Controller actions are unit-invoked directly (bypassing the [Authorize] middleware,
// which is already covered by AuthEndpointTests), following the NewsMediaEndpointTests pattern.
public class NewsCoverImageEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public NewsCoverImageEndpointTests(WebAppFactory factory) => _factory = factory;

    private static AdminNewsController MakeController(WebAppFactory factory, out ArsenalDbContext db)
    {
        var scope = factory.Services.CreateScope();
        db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var queryHandler = scope.ServiceProvider.GetRequiredService<GetNewsQueryHandler>();
        return new AdminNewsController(queryHandler, db);
    }

    [Fact]
    [Trait("scenario", "US1-AS-1")]
    public async Task Create_WithCoverImage_SavedNewsReturnsSameUrl()
    {
        var controller = MakeController(_factory, out var db);
        var slug = "cover-test-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок с обложкой", "",
            "Excerpt", "", "Content", "", "", "", [], false, null,
            "https://cdn.example.com/cover.jpg");

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.CoverImage.Should().Be("https://cdn.example.com/cover.jpg");
    }

    [Fact]
    [Trait("scenario", "US1-AS-2")]
    public async Task Create_WithoutCoverImage_SavedNewsHasEmptyCover()
    {
        var controller = MakeController(_factory, out var db);
        var slug = "no-cover-test-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок без обложки", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.CoverImage.Should().BeNullOrEmpty();
    }

    [Fact]
    [Trait("scenario", "US1-AS-1")]
    [Trait("boundary", "length-boundary")]
    public async Task Create_CoverImage_Exactly500Chars_Saved()
    {
        var controller = MakeController(_factory, out var db);
        var slug = "cover-500-" + Guid.NewGuid().ToString("N")[..8];
        var baseUrl = "https://cdn.example.com/";
        var coverUrl = baseUrl + new string('x', 500 - baseUrl.Length);
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null, coverUrl);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.CoverImage.Should().Be(coverUrl);
        saved.CoverImage.Length.Should().Be(500);
    }

    [Fact]
    [Trait("scenario", "US1-AS-1")]
    [Trait("boundary", "empty-string")]
    public async Task Create_CoverImage_EmptyString_Saved()
    {
        var controller = MakeController(_factory, out var db);
        var slug = "cover-empty-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null, "");

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.CoverImage.Should().BeNullOrEmpty();
    }

    [Fact]
    [Trait("scenario", "US1-AS-1")]
    public async Task Create_WithCoverImage_GetNewsReturnsSameUrl()
    {
        var controller = MakeController(_factory, out var db);
        var slug = "get-cover-test-" + Guid.NewGuid().ToString("N")[..8];
        var coverUrl = "https://cdn.example.com/verified-cover.jpg";
        var cmd = new CreateNewsCommand(slug, "Заголовок с обложкой", "",
            "Excerpt", "", "Content", "", "", "", [], false, null, coverUrl);

        await controller.Create(cmd, CancellationToken.None);

        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.CoverImage.Should().Be(coverUrl);
    }
}
