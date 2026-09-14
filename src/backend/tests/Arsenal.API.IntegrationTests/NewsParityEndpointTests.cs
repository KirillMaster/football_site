using Arsenal.API.Controllers;
using Arsenal.Application.DTOs;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Сквозная проверка паритета с программно созданными новостями (004-admin-news-rich-editor,
// слайс slice-parity). Контроллеры вызываются напрямую, как в NewsPublishingEndpointTests —
// авторизация покрыта AuthEndpointTests.
public class NewsParityEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public NewsParityEndpointTests(WebAppFactory factory) => _factory = factory;

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

    // Эталонная разметка галереи и видео (задана командой на слайс) — та же,
    // что производит NewsGallery/NewsVideo tiptap-узлы на фронтенде.
    private static string ReferenceContent(string paragraphText) =>
        "<h2>Заголовок раздела</h2>" +
        "<p><strong>" + paragraphText + "</strong></p>" +
        "<div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px\">" +
        "<img loading=\"lazy\" style=\"width:100%;height:auto;border-radius:12px\" src=\"https://cdn.example.com/photo1.jpg\" alt=\"Фото 1\">" +
        "<img loading=\"lazy\" style=\"width:100%;height:auto;border-radius:12px\" src=\"https://cdn.example.com/photo2.jpg\" alt=\"Фото 2\">" +
        "<img loading=\"lazy\" style=\"width:100%;height:auto;border-radius:12px\" src=\"https://cdn.example.com/photo3.jpg\" alt=\"Фото 3\">" +
        "</div>" +
        "<video controls preload=\"metadata\" playsinline style=\"width:100%;border-radius:12px;background:#000\">" +
        "<source src=\"https://cdn.example.com/clip.mp4\" type=\"video/mp4\" />" +
        "Ваш браузер не поддерживает воспроизведение видео." +
        "</video>";

    [Fact]
    [Trait("scenario", "SC-001")]
    [Trait("scenario", "quickstart-scenario-1")]
    public async Task Create_FullReferenceNews_PublicPageComposesCoverGalleryVideoTags()
    {
        var admin = MakeAdminController(_factory, out _);
        var slug = "parity-full-" + Guid.NewGuid().ToString("N")[..8];
        var content = ReferenceContent("Первый абзац с выделением.");
        var cmd = new CreateNewsCommand(
            slug, "Новость с полным составом", "",
            "Экспресс-описание", "", content, "",
            "SEO заголовок", "SEO описание",
            ["новости", "школа"], true, DateTime.UtcNow,
            "https://cdn.example.com/cover.jpg");

        var createResult = await admin.Create(cmd, CancellationToken.None);
        createResult.Should().BeOfType<CreatedAtActionResult>();

        var publicController = MakePublicController(_factory);
        var getResult = await publicController.GetBySlug(slug, CancellationToken.None);
        var ok = getResult.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<NewsDto>().Subject;

        dto.CoverImage.Should().Be("https://cdn.example.com/cover.jpg");
        dto.Tags.Should().BeEquivalentTo(["новости", "школа"]);
        dto.IsPublished.Should().BeTrue();
        dto.ContentRu.Should().Contain("grid-template-columns");
        dto.ContentRu.Should().Contain("https://cdn.example.com/photo1.jpg");
        dto.ContentRu.Should().Contain("https://cdn.example.com/photo2.jpg");
        dto.ContentRu.Should().Contain("https://cdn.example.com/photo3.jpg");
        dto.ContentRu.Should().Contain("<video");
        dto.ContentRu.Should().Contain("https://cdn.example.com/clip.mp4");
        dto.ContentRu.Should().Contain("<strong>Первый абзац с выделением.</strong>");
    }

    [Fact]
    [Trait("scenario", "SC-003")]
    [Trait("scenario", "quickstart-scenario-2")]
    [Trait("scenario", "FR-020")]
    public async Task Update_ProgrammaticallyCreatedNews_PreservesCoverTagsPublishGalleryVideo()
    {
        // Новость создана "программно" — напрямую через API, без участия редактора,
        // как это делают уже опубликованные 9 эталонных новостей (FR-020/EC-7).
        var admin = MakeAdminController(_factory, out var db);
        var slug = "parity-reedit-" + Guid.NewGuid().ToString("N")[..8];
        var originalContent = ReferenceContent("Исходный абзац.");
        var createCmd = new CreateNewsCommand(
            slug, "Программная новость", "",
            "Описание", "", originalContent, "",
            "Мета", "Описание для поиска",
            ["события"], true, DateTime.UtcNow,
            "https://cdn.example.com/orig-cover.jpg");
        await admin.Create(createCmd, CancellationToken.None);
        var news = await db.News.AsNoTracking().FirstAsync(n => n.Slug == slug);

        // Повторное открытие в редакторе и сохранение без потери загруженных
        // ранее медиа: меняется только текст абзаца, остальное редактор
        // передаёт обратно как есть (как делает NewsEditor.handleSave).
        var editedContent = ReferenceContent("Отредактированный абзац.");
        var updateCmd = new UpdateNewsCommand(
            news.Id, news.TitleRu, news.TitleEn,
            news.ExcerptRu, news.ExcerptEn, editedContent, news.ContentEn,
            news.MetaTitle, news.MetaDescription,
            news.Tags, news.IsPublished, news.CoverImage);

        var updateResult = await admin.Update(news.Id, updateCmd, CancellationToken.None);
        updateResult.Should().BeOfType<NoContentResult>();

        var updated = await db.News.AsNoTracking().FirstAsync(n => n.Id == news.Id);
        updated.CoverImage.Should().Be("https://cdn.example.com/orig-cover.jpg");
        updated.Tags.Should().BeEquivalentTo(["события"]);
        updated.IsPublished.Should().BeTrue();
        updated.ContentRu.Should().Contain("grid-template-columns");
        updated.ContentRu.Should().Contain("https://cdn.example.com/photo1.jpg");
        updated.ContentRu.Should().Contain("https://cdn.example.com/photo2.jpg");
        updated.ContentRu.Should().Contain("https://cdn.example.com/photo3.jpg");
        updated.ContentRu.Should().Contain("<video");
        updated.ContentRu.Should().Contain("https://cdn.example.com/clip.mp4");
        updated.ContentRu.Should().Contain("Отредактированный абзац.");
    }
}
