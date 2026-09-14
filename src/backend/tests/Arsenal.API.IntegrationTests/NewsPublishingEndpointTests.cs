using Arsenal.API.Controllers;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Контроллер вызывается напрямую (минуя [Authorize]), как в NewsCoverImageEndpointTests —
// авторизация покрыта AuthEndpointTests.
public class NewsPublishingEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public NewsPublishingEndpointTests(WebAppFactory factory) => _factory = factory;

    private static AdminNewsController MakeAdminController(WebAppFactory factory, out ArsenalDbContext db)
    {
        var scope = factory.Services.CreateScope();
        db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        var queryHandler = scope.ServiceProvider.GetRequiredService<GetNewsQueryHandler>();
        var createValidator = scope.ServiceProvider.GetRequiredService<IValidator<CreateNewsCommand>>();
        var updateValidator = scope.ServiceProvider.GetRequiredService<IValidator<UpdateNewsCommand>>();
        return new AdminNewsController(queryHandler, db, createValidator, updateValidator);
    }

    private static NewsController MakePublicController(WebAppFactory factory)
    {
        var scope = factory.Services.CreateScope();
        var queryHandler = scope.ServiceProvider.GetRequiredService<GetNewsQueryHandler>();
        return new NewsController(queryHandler);
    }

    [Fact]
    [Trait("scenario", "US3-AS-9")]
    public async Task Create_WithInvalidSlugFormat_ReturnsBadRequestWithMessage()
    {
        var controller = MakeAdminController(_factory, out _);
        var cmd = new CreateNewsCommand("Invalid Slug!", "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.Value.Should().NotBeNull();
    }

    [Fact]
    [Trait("scenario", "US3-EC-4")]
    public async Task Create_WithSlugAlreadyTaken_ReturnsConflictWithMessage()
    {
        var controller = MakeAdminController(_factory, out _);
        var slug = "taken-slug-" + Guid.NewGuid().ToString("N")[..8];
        var first = new CreateNewsCommand(slug, "Первая новость", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        var createResult = await controller.Create(first, CancellationToken.None);
        createResult.Should().BeOfType<CreatedAtActionResult>();

        var second = new CreateNewsCommand(slug, "Вторая новость", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        var result = await controller.Create(second, CancellationToken.None);

        var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
        conflict.Value.Should().NotBeNull();
    }

    [Fact]
    [Trait("scenario", "US3-AS-10")]
    public async Task PublicList_ExcludesUnpublishedNews()
    {
        var controller = MakeAdminController(_factory, out _);
        var slug = "unpublished-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Неопубликованная новость", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        await controller.Create(cmd, CancellationToken.None);

        var publicController = MakePublicController(_factory);
        var result = await publicController.GetAll(1, 100, null, CancellationToken.None);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var page = ok.Value.Should().BeOfType<Arsenal.Application.Common.PagedResult<Arsenal.Application.DTOs.NewsSummaryDto>>().Subject;
        page.Items.Should().NotContain(n => n.Slug == slug);
    }

    [Fact]
    [Trait("scenario", "US3-AS-11")]
    public async Task Update_ChangingOnlyContent_KeepsTagsAndPublishStatus()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "keep-tags-" + Guid.NewGuid().ToString("N")[..8];
        var createCmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", ["новости", "школа"], true, DateTime.UtcNow);
        await controller.Create(createCmd, CancellationToken.None);
        var news = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);

        var updateCmd = new UpdateNewsCommand(news.Id, "Обновлённый заголовок", "",
            "Excerpt", "", "Обновлённый текст", "", "", "",
            ["новости", "школа"], true, null);
        var result = await controller.Update(news.Id, updateCmd, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
        var updated = await db.News.AsNoTracking().FirstAsync(n => n.Id == news.Id);
        updated.Tags.Should().BeEquivalentTo(["новости", "школа"]);
        updated.IsPublished.Should().BeTrue();
        updated.ContentRu.Should().Be("Обновлённый текст");
    }

    [Fact]
    [Trait("scenario", "US3-FR-013")]
    public async Task Update_WithMetaTitleOver160Chars_ReturnsBadRequest()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "meta-limit-" + Guid.NewGuid().ToString("N")[..8];
        var createCmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        await controller.Create(createCmd, CancellationToken.None);
        var news = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);

        var updateCmd = new UpdateNewsCommand(news.Id, "Заголовок", "",
            "Excerpt", "", "Content", "", new string('a', 161), "",
            [], false, null);
        var result = await controller.Update(news.Id, updateCmd, CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Theory]
    [InlineData("Invalid Slug!", "должен отказать на спецсимволы в slug")]
    [InlineData("UPPERCASE", "должен отказать на верхний регистр в slug")]
    [InlineData("slug_underscore", "должен отказать на подчёркивание в slug")]
    [InlineData("кириллица-slug", "должен отказать на кириллицу в slug")]
    [InlineData("slug с пробелами", "должен отказать на пробелы в slug")]
    [Trait("scenario", "US3-AS-9")]
    public async Task Create_WithVaryingInvalidSlugFormats_ReturnsBadRequest(string invalidSlug, string _)
    {
        var controller = MakeAdminController(_factory, out var db);
        var cmd = new CreateNewsCommand(invalidSlug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    [Trait("scenario", "US3-FR-013")]
    [Trait("boundary", "meta-title-160")]
    public async Task Create_WithMetaTitleExactly160Chars_Succeeds()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "meta-160-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", new string('a', 160), "", [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.MetaTitle.Should().HaveLength(160);
    }

    [Fact]
    [Trait("scenario", "US3-FR-013")]
    [Trait("boundary", "meta-title-159")]
    public async Task Create_WithMetaTitleExactly159Chars_Succeeds()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "meta-159-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", new string('a', 159), "", [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
    }

    [Fact]
    [Trait("scenario", "US3-FR-013")]
    [Trait("boundary", "meta-description-300")]
    public async Task Create_WithMetaDescriptionExactly300Chars_Succeeds()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "meta-desc-300-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", new string('b', 300), [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        saved.MetaDescription.Should().HaveLength(300);
    }

    [Fact]
    [Trait("scenario", "US3-FR-013")]
    [Trait("boundary", "meta-description-301")]
    public async Task Create_WithMetaDescriptionOver300Chars_ReturnsBadRequest()
    {
        var controller = MakeAdminController(_factory, out _);
        var slug = "meta-desc-301-" + Guid.NewGuid().ToString("N")[..8];
        var cmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", new string('b', 301), [], false, null);

        var result = await controller.Create(cmd, CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    [Trait("scenario", "US3-AS-11")]
    public async Task Update_WithPublishTrue_SetsPublishedAtToNonNull()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "pub-test-" + Guid.NewGuid().ToString("N")[..8];
        var createCmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        await controller.Create(createCmd, CancellationToken.None);
        var news = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        news.PublishedAt.Should().BeNull();

        var updateCmd = new UpdateNewsCommand(news.Id, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], true, null);
        await controller.Update(news.Id, updateCmd, CancellationToken.None);

        var updated = await db.News.AsNoTracking().FirstAsync(n => n.Id == news.Id);
        updated.IsPublished.Should().BeTrue();
        updated.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    [Trait("scenario", "US3-AS-11")]
    public async Task Update_WithPublishFalse_SetsIsPublishedFalse()
    {
        var controller = MakeAdminController(_factory, out var db);
        var slug = "unpub-test-" + Guid.NewGuid().ToString("N")[..8];
        var publishedAt = DateTime.UtcNow.AddDays(-1);
        var createCmd = new CreateNewsCommand(slug, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], true, publishedAt);
        await controller.Create(createCmd, CancellationToken.None);
        var news = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);
        news.IsPublished.Should().BeTrue();

        var updateCmd = new UpdateNewsCommand(news.Id, "Заголовок", "",
            "Excerpt", "", "Content", "", "", "", [], false, null);
        await controller.Update(news.Id, updateCmd, CancellationToken.None);

        var updated = await db.News.AsNoTracking().FirstAsync(n => n.Id == news.Id);
        updated.IsPublished.Should().BeFalse();
    }
}
