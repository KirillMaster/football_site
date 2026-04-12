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
            email = "fcarsenal-92@ya.ru",
            address = "г. Севастополь, ул. Косарева, д.12, Спорткомплекс школы №61",
            socials = new
            {
                vk = "https://vk.com/arsenal_92",
                telegram = "https://t.me/arsenal_sevastopol",
                youtube = "https://www.youtube.com/@arsenal92",
                dzen = "https://dzen.ru/arsenal92",
            },
            heroVideoRutubeId = s?.HeroVideoRutubeId ?? "1335a9553dac12ea586c0ce0a90456cf",
            mapEmbedUrl = "https://yandex.ru/map-widget/v1/?ll=33.522167%2C44.586567&z=17&l=map&pt=33.522167%2C44.586567%2Cpm2rdl~Спорткомплекс+школы+№61",
        });
    }
}
