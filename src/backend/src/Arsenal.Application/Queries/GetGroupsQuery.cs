using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Application.Queries;

public record GetGroupsQuery(bool ActiveOnly = true);
public record GetGroupByIdQuery(Guid Id);
public record GetSchedulesQuery(Guid? GroupId = null, bool ActiveOnly = true);

public class GetGroupsQueryHandler
{
    private readonly IArsenalDbContext _db;

    public GetGroupsQueryHandler(IArsenalDbContext db) => _db = db;

    public async Task<IReadOnlyList<GroupDto>> HandleAsync(GetGroupsQuery query, CancellationToken ct = default)
    {
        var q = _db.Groups.AsNoTracking();
        if (query.ActiveOnly) q = q.Where(g => g.IsActive);

        return await q
            .Select(g => new GroupDto(g.Id, g.Name, g.AgeRange, g.Level,
                g.MaxCapacity, g.DescriptionRu, g.DescriptionEn, g.IsActive))
            .ToListAsync(ct);
    }

    public async Task<GroupDto?> HandleAsync(GetGroupByIdQuery query, CancellationToken ct = default)
    {
        return await _db.Groups.AsNoTracking()
            .Where(g => g.Id == query.Id)
            .Select(g => new GroupDto(g.Id, g.Name, g.AgeRange, g.Level,
                g.MaxCapacity, g.DescriptionRu, g.DescriptionEn, g.IsActive))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<ScheduleDto>> HandleSchedulesAsync(
        GetSchedulesQuery query, CancellationToken ct = default)
    {
        IQueryable<Schedule> q = _db.Schedules
            .AsNoTracking()
            .Include(s => s.Group)
            .Include(s => s.Coach);

        if (query.GroupId.HasValue)
            q = q.Where(s => s.GroupId == query.GroupId.Value);

        if (query.ActiveOnly)
            q = q.Where(s => s.IsActive);

        return await q
            .Select(s => new ScheduleDto(s.Id, s.GroupId, s.Group!.Name, s.CoachId,
                s.Coach!.NameRu, s.DayOfWeek.ToString(), s.StartTime.ToString("HH:mm"),
                s.EndTime.ToString("HH:mm"), s.Location, s.IsActive))
            .ToListAsync(ct);
    }
}
