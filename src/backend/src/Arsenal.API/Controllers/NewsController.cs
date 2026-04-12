using Arsenal.Application.Commands;
using Arsenal.Application.Interfaces;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly GetNewsQueryHandler _handler;

    public NewsController(GetNewsQueryHandler handler) => _handler = handler;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tag = null,
        CancellationToken ct = default)
        => Ok(await _handler.HandleAsync(new GetNewsQuery(page, pageSize, tag, PublishedOnly: true), ct));

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _handler.HandleAsync(new GetNewsBySlugQuery(slug), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}

[ApiController]
[Route("api/admin/news")]
[Authorize(Roles = "admin")]
public class AdminNewsController : ControllerBase
{
    private readonly GetNewsQueryHandler _queryHandler;
    private readonly IArsenalDbContext _db;

    public AdminNewsController(GetNewsQueryHandler queryHandler, IArsenalDbContext db)
    {
        _queryHandler = queryHandler;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _queryHandler.HandleAsync(new GetNewsQuery(page, pageSize, null, PublishedOnly: false), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNewsCommand req, CancellationToken ct)
    {
        var news = News.Create(req.Slug, req.TitleRu, req.TitleEn,
            req.ExcerptRu, req.ExcerptEn, req.ContentRu, req.ContentEn,
            req.MetaTitle, req.MetaDescription, req.Tags, req.IsPublished, req.PublishedAt);
        _db.News.Add(news);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = news.Id, slug = news.Slug });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsCommand req, CancellationToken ct)
    {
        var news = await _db.News.FindAsync([id], ct);
        if (news is null) return NotFound();
        news.Update(req.TitleRu, req.TitleEn, req.ExcerptRu, req.ExcerptEn,
            req.ContentRu, req.ContentEn, req.MetaTitle, req.MetaDescription,
            req.Tags, req.CoverImage);
        if (req.IsPublished) news.Publish(); else news.Unpublish();
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var news = await _db.News.FindAsync([id], ct);
        if (news is null) return NotFound();
        _db.News.Remove(news);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
