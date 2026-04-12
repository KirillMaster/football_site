using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Application.Queries;

public class GetSitemapDataQueryHandler
{
    private readonly IArsenalDbContext _db;

    public GetSitemapDataQueryHandler(IArsenalDbContext db) => _db = db;

    public async Task<SitemapDataDto> HandleAsync(CancellationToken ct = default)
    {
        var pages = await _db.Pages.AsNoTracking()
            .Where(p => p.IsPublished)
            .Select(p => new SitemapEntry(p.Slug, p.UpdatedAt))
            .ToListAsync(ct);

        var news = await _db.News.AsNoTracking()
            .Where(n => n.IsPublished)
            .Select(n => new SitemapEntry(n.Slug, n.UpdatedAt))
            .ToListAsync(ct);

        return new SitemapDataDto(pages, news);
    }
}
