using Arsenal.Application.Common;
using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Arsenal.Application.Queries;

public record GetPagesQuery(bool PublishedOnly = true);

public record GetPageBySlugQuery(string Slug);

public class GetPagesQueryHandler
{
    private readonly IArsenalDbContext _db;
    private readonly ILogger<GetPagesQueryHandler> _logger;

    public GetPagesQueryHandler(IArsenalDbContext db, ILogger<GetPagesQueryHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IReadOnlyList<PageSummaryDto>> HandleAsync(
        GetPagesQuery query, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching pages, publishedOnly={PublishedOnly}", query.PublishedOnly);

        var q = _db.Pages.AsNoTracking();
        if (query.PublishedOnly) q = q.Where(p => p.IsPublished);

        return await q
            .OrderBy(p => p.SortOrder)
            .Select(p => new PageSummaryDto(p.Id, p.Slug, p.TitleRu, p.TitleEn, p.IsPublished, p.SortOrder))
            .ToListAsync(ct);
    }

    public async Task<Result<PageDto>> HandleAsync(GetPageBySlugQuery query, CancellationToken ct = default)
    {
        var page = await _db.Pages.AsNoTracking()
            .Where(p => p.Slug == query.Slug && p.IsPublished)
            .Select(p => new PageDto(p.Id, p.Slug, p.TitleRu, p.TitleEn, p.ContentRu, p.ContentEn,
                p.MetaTitleRu, p.MetaDescriptionRu, p.MetaTitleEn, p.MetaDescriptionEn,
                p.OgImage, p.IsPublished, p.SortOrder, p.UpdatedAt))
            .FirstOrDefaultAsync(ct);

        return page is null
            ? Result<PageDto>.Failure($"Page '{query.Slug}' not found")
            : Result<PageDto>.Success(page);
    }
}
