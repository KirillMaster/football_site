using Arsenal.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController : ControllerBase
{
    private readonly IArsenalDbContext _db;

    public PartnersController(IArsenalDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var partners = await _db.Partners
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                id = p.Id,
                name = p.Name,
                descriptionRu = p.DescriptionRu,
                logoUrl = p.LogoUrl,
                websiteUrl = p.WebsiteUrl,
            })
            .ToListAsync(ct);

        return Ok(partners);
    }
}
