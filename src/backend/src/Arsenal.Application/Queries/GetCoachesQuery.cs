using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Application.Queries;

public record GetCoachesQuery(bool ActiveOnly = true);

public record GetCoachByIdQuery(Guid Id);

public class GetCoachesQueryHandler
{
    private readonly IArsenalDbContext _db;

    public GetCoachesQueryHandler(IArsenalDbContext db) => _db = db;

    public async Task<IReadOnlyList<CoachDto>> HandleAsync(GetCoachesQuery query, CancellationToken ct = default)
    {
        var q = _db.Coaches.AsNoTracking();
        if (query.ActiveOnly) q = q.Where(c => c.IsActive);

        return await q
            .OrderBy(c => c.SortOrder)
            .Select(c => new CoachDto(c.Id, c.NameRu, c.NameEn, c.PositionRu, c.PositionEn,
                c.BioRu, c.BioEn, c.Photo, c.Certifications, c.SortOrder, c.IsActive))
            .ToListAsync(ct);
    }

    public async Task<CoachDto?> HandleAsync(GetCoachByIdQuery query, CancellationToken ct = default)
    {
        return await _db.Coaches.AsNoTracking()
            .Where(c => c.Id == query.Id)
            .Select(c => new CoachDto(c.Id, c.NameRu, c.NameEn, c.PositionRu, c.PositionEn,
                c.BioRu, c.BioEn, c.Photo, c.Certifications, c.SortOrder, c.IsActive))
            .FirstOrDefaultAsync(ct);
    }
}
