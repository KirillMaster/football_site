using Arsenal.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api")]
public class SitemapController : ControllerBase
{
    private readonly GetSitemapDataQueryHandler _handler;

    public SitemapController(GetSitemapDataQueryHandler handler) => _handler = handler;

    [HttpGet("sitemap-data")]
    public async Task<IActionResult> GetSitemapData(CancellationToken ct)
        => Ok(await _handler.HandleAsync(ct));
}
