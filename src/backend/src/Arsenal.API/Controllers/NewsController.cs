using Arsenal.Application.Commands;
using Arsenal.Application.Interfaces;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Domain.Entities;
using FluentValidation;
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
    private readonly IValidator<CreateNewsCommand> _createValidator;
    private readonly IValidator<UpdateNewsCommand> _updateValidator;

    public AdminNewsController(
        GetNewsQueryHandler queryHandler,
        IArsenalDbContext db,
        IValidator<CreateNewsCommand> createValidator,
        IValidator<UpdateNewsCommand> updateValidator)
    {
        _queryHandler = queryHandler;
        _db = db;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _queryHandler.HandleAsync(new GetNewsQuery(page, pageSize, null, PublishedOnly: false), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _queryHandler.HandleAsync(new GetNewsByIdQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNewsCommand req, CancellationToken ct)
    {
        // US3 @AS-9 @FR-012 / @EC-4: формат адреса и прочие поля валидируются
        // FluentValidation до сохранения — сообщение уходит клиенту как есть.
        var validation = await _createValidator.ValidateAsync(req, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });

        // US3 @EC-4: занятый адрес — явная проверка перед вставкой, иначе бы
        // упал необработанный DbUpdateException из-за уникального индекса.
        if (await _db.News.AnyAsync(n => n.Slug == req.Slug, ct))
            return Conflict(new { message = "Адрес уже занят другой новостью" });

        var news = News.Create(req.Slug, req.TitleRu, req.TitleEn,
            req.ExcerptRu, req.ExcerptEn, req.ContentRu, req.ContentEn,
            req.MetaTitle, req.MetaDescription, req.Tags, req.IsPublished, req.PublishedAt);
        if (!string.IsNullOrEmpty(req.CoverImage)) news.SetCoverImage(req.CoverImage);
        _db.News.Add(news);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = news.Id, slug = news.Slug });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsCommand req, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(req, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });

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
