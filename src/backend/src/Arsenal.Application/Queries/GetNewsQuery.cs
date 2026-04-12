using Arsenal.Application.Common;
using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Application.Queries;

public record GetNewsQuery(int Page = 1, int PageSize = 20, string? Tag = null, bool PublishedOnly = true);

public record GetNewsBySlugQuery(string Slug);

public class GetNewsQueryHandler
{
    private readonly IArsenalDbContext _db;

    public GetNewsQueryHandler(IArsenalDbContext db) => _db = db;

    public async Task<PagedResult<NewsSummaryDto>> HandleAsync(GetNewsQuery query, CancellationToken ct = default)
    {
        var q = _db.News.AsNoTracking();
        if (query.PublishedOnly) q = q.Where(n => n.IsPublished);
        if (!string.IsNullOrWhiteSpace(query.Tag)) q = q.Where(n => n.Tags.Contains(query.Tag));

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(n => n.PublishedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(n => new NewsSummaryDto(n.Id, n.Slug, n.TitleRu, n.TitleEn,
                n.ExcerptRu, n.CoverImage, n.Tags, n.PublishedAt))
            .ToListAsync(ct);

        return new PagedResult<NewsSummaryDto>(items, query.Page, query.PageSize, total);
    }

    public async Task<Result<NewsDto>> HandleAsync(GetNewsBySlugQuery query, CancellationToken ct = default)
    {
        var news = await _db.News.AsNoTracking()
            .Where(n => n.Slug == query.Slug && n.IsPublished)
            .Select(n => new NewsDto(n.Id, n.Slug, n.TitleRu, n.TitleEn,
                n.ExcerptRu, n.ExcerptEn, n.ContentRu, n.ContentEn,
                n.CoverImage, n.MetaTitle, n.MetaDescription, n.Tags,
                n.IsPublished, n.PublishedAt))
            .FirstOrDefaultAsync(ct);

        return news is null
            ? Result<NewsDto>.Failure($"News '{query.Slug}' not found")
            : Result<NewsDto>.Success(news);
    }
}
