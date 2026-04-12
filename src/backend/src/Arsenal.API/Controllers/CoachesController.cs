using Arsenal.Application.Interfaces;
using Arsenal.Application.Queries;
using Arsenal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/coaches")]
public class CoachesController : ControllerBase
{
    private readonly GetCoachesQueryHandler _handler;

    public CoachesController(GetCoachesQueryHandler handler) => _handler = handler;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _handler.HandleAsync(new GetCoachesQuery(ActiveOnly: true), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var coach = await _handler.HandleAsync(new GetCoachByIdQuery(id), ct);
        return coach is null ? NotFound() : Ok(coach);
    }
}

[ApiController]
[Route("api/admin/coaches")]
[Authorize(Roles = "admin")]
public class AdminCoachesController : ControllerBase
{
    private readonly GetCoachesQueryHandler _queryHandler;
    private readonly IArsenalDbContext _db;

    public AdminCoachesController(GetCoachesQueryHandler queryHandler, IArsenalDbContext db)
    {
        _queryHandler = queryHandler;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _queryHandler.HandleAsync(new GetCoachesQuery(ActiveOnly: false), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CoachRequest req, CancellationToken ct)
    {
        var coach = Coach.Create(req.NameRu, req.NameEn, req.PositionRu, req.PositionEn,
            req.BioRu, req.BioEn, req.Certifications, req.SortOrder, req.IsActive);
        _db.Coaches.Add(coach);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = coach.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CoachRequest req, CancellationToken ct)
    {
        var coach = await _db.Coaches.FindAsync([id], ct);
        if (coach is null) return NotFound();
        coach.Update(req.NameRu, req.NameEn, req.PositionRu, req.PositionEn,
            req.BioRu, req.BioEn, null, req.Certifications ?? [], req.SortOrder, req.IsActive);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var coach = await _db.Coaches.FindAsync([id], ct);
        if (coach is null) return NotFound();
        _db.Coaches.Remove(coach);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record CoachRequest(
    string NameRu, string NameEn,
    string PositionRu, string PositionEn,
    string BioRu, string BioEn,
    List<string>? Certifications,
    int SortOrder, bool IsActive
);
