using Arsenal.Application.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/pages")]
public class PagesController : ControllerBase
{
    private readonly GetPagesQueryHandler _handler;

    public PagesController(GetPagesQueryHandler handler) => _handler = handler;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var pages = await _handler.HandleAsync(new GetPagesQuery(PublishedOnly: true), ct);
        return Ok(pages);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _handler.HandleAsync(new GetPageBySlugQuery(slug), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}

[ApiController]
[Route("api/admin/pages")]
[Authorize(Roles = "admin")]
public class AdminPagesController : ControllerBase
{
    private readonly GetPagesQueryHandler _queryHandler;
    private readonly Arsenal.Application.Interfaces.IArsenalDbContext _db;

    public AdminPagesController(GetPagesQueryHandler queryHandler,
        Arsenal.Application.Interfaces.IArsenalDbContext db)
    {
        _queryHandler = queryHandler;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var pages = await _queryHandler.HandleAsync(new GetPagesQuery(PublishedOnly: false), ct);
        return Ok(pages);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _queryHandler.HandleAsync(new GetPageBySlugQuery(slug), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePageRequest req, CancellationToken ct)
    {
        var page = Arsenal.Domain.Entities.Page.Create(
            req.Slug, req.TitleRu, req.TitleEn, req.ContentRu, req.ContentEn,
            req.MetaTitleRu, req.MetaDescriptionRu, req.MetaTitleEn, req.MetaDescriptionEn,
            req.IsPublished, req.SortOrder, req.OgImage);
        _db.Pages.Add(page);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetBySlug), new { slug = page.Slug }, new { id = page.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreatePageRequest req, CancellationToken ct)
    {
        var page = await _db.Pages.FindAsync([id], ct);
        if (page is null) return NotFound();
        page.Update(req.TitleRu, req.TitleEn, req.ContentRu, req.ContentEn,
            req.MetaTitleRu, req.MetaDescriptionRu, req.MetaTitleEn, req.MetaDescriptionEn,
            req.IsPublished, req.SortOrder, req.OgImage);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var page = await _db.Pages.FindAsync([id], ct);
        if (page is null) return NotFound();
        _db.Pages.Remove(page);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record CreatePageRequest(
    string Slug, string TitleRu, string TitleEn,
    string ContentRu, string ContentEn,
    string MetaTitleRu, string MetaDescriptionRu,
    string MetaTitleEn, string MetaDescriptionEn,
    bool IsPublished, int SortOrder, string? OgImage
);
