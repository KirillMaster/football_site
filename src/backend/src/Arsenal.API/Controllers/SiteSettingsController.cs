using Arsenal.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/sitesettings")]
public class SiteSettingsController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    public SiteSettingsController(IArsenalDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var s = await _db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        return Ok(new
        {
            phones = new[] { "+7-978-813-09-82", "+7-978-812-64-32", "+7-978-10-40-940" },
            email = "info@arsenal92.ru",
            address = "г. Севастополь, ул. Косарева, д.12, Спорткомплекс школы №61",
            socials = new
            {
                vk = "https://vk.com/arsenal_92",
                telegram = "https://t.me/arsenal_sevastopol",
                youtube = (string?)null,
                dzen = (string?)null,
            },
            heroVideoRutubeId = s?.HeroVideoRutubeId,
        });
    }
}
