using Arsenal.Application.Interfaces;
using Arsenal.Application.Queries;
using Arsenal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/groups")]
public class GroupsController : ControllerBase
{
    private readonly GetGroupsQueryHandler _handler;

    public GroupsController(GetGroupsQueryHandler handler) => _handler = handler;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _handler.HandleAsync(new GetGroupsQuery(ActiveOnly: true), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var group = await _handler.HandleAsync(new GetGroupByIdQuery(id), ct);
        return group is null ? NotFound() : Ok(group);
    }

    [HttpGet("schedules")]
    public async Task<IActionResult> GetSchedules([FromQuery] Guid? groupId, CancellationToken ct)
        => Ok(await _handler.HandleSchedulesAsync(new GetSchedulesQuery(groupId, ActiveOnly: true), ct));
}

[ApiController]
[Route("api/admin/groups")]
[Authorize(Roles = "admin")]
public class AdminGroupsController : ControllerBase
{
    private readonly IArsenalDbContext _db;

    public AdminGroupsController(IArsenalDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GroupRequest req, CancellationToken ct)
    {
        var group = Group.Create(req.Name, req.AgeRange, req.Level,
            req.MaxCapacity, req.DescriptionRu, req.DescriptionEn, req.IsActive);
        _db.Groups.Add(group);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = group.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] GroupRequest req, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([id], ct);
        if (group is null) return NotFound();
        group.Update(req.Name, req.AgeRange, req.Level, req.MaxCapacity,
            req.DescriptionRu, req.DescriptionEn, req.IsActive);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([id], ct);
        if (group is null) return NotFound();
        _db.Groups.Remove(group);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record GroupRequest(
    string Name, string AgeRange, string Level,
    int MaxCapacity, string DescriptionRu, string DescriptionEn, bool IsActive
);
