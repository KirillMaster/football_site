using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.API.Controllers;

/// <summary>
/// Admin endpoints for entities not covered by dedicated controllers:
/// PricingPlans, Partners, Achievements, TryoutRequests, ContactMessages,
/// PlayerRegistrations, SiteSettings, Videos
/// </summary>
[ApiController]
[Authorize(Roles = "admin")]
public class AdminPricingController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    public AdminPricingController(IArsenalDbContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet("api/pricing")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _db.PricingPlans.AsNoTracking().OrderBy(p => p.SortOrder).ToListAsync(ct));

    [HttpPost("api/admin/pricing")]
    public async Task<IActionResult> Create([FromBody] PricingRequest req, CancellationToken ct)
    {
        var plan = PricingPlan.Create(req.NameRu, req.NameEn, req.Price, req.Currency,
            req.SessionsCount, req.DescriptionRu, req.DescriptionEn,
            req.FeaturesRu, req.FeaturesEn, req.IsFeatured, req.SortOrder, req.IsActive);
        _db.PricingPlans.Add(plan);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = plan.Id });
    }

    [HttpPut("api/admin/pricing/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PricingRequest req, CancellationToken ct)
    {
        var plan = await _db.PricingPlans.FindAsync([id], ct);
        if (plan is null) return NotFound();
        plan.Update(req.NameRu, req.NameEn, req.Price, req.Currency, req.SessionsCount,
            req.DescriptionRu, req.DescriptionEn, req.FeaturesRu, req.FeaturesEn,
            req.IsFeatured, req.SortOrder, req.IsActive);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("api/admin/pricing/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var plan = await _db.PricingPlans.FindAsync([id], ct);
        if (plan is null) return NotFound();
        _db.PricingPlans.Remove(plan);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

[ApiController]
[Authorize(Roles = "admin")]
public class AdminPartnersController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    public AdminPartnersController(IArsenalDbContext db) => _db = db;

    [HttpPost("api/admin/partners")]
    public async Task<IActionResult> Create([FromBody] PartnerRequest req, CancellationToken ct)
    {
        var partner = Partner.Create(req.Name, req.DescriptionRu, req.LogoUrl, req.WebsiteUrl, req.SortOrder, req.IsActive);
        _db.Partners.Add(partner);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(null, new { id = partner.Id });
    }

    [HttpPut("api/admin/partners/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PartnerRequest req, CancellationToken ct)
    {
        var partner = await _db.Partners.FindAsync([id], ct);
        if (partner is null) return NotFound();
        partner.Update(req.Name, req.DescriptionRu, req.LogoUrl, req.WebsiteUrl, req.SortOrder, req.IsActive);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("api/admin/partners/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var partner = await _db.Partners.FindAsync([id], ct);
        if (partner is null) return NotFound();
        _db.Partners.Remove(partner);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

[ApiController]
[Authorize(Roles = "admin")]
public class AdminInboxController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    public AdminInboxController(IArsenalDbContext db) => _db = db;

    [HttpGet("api/admin/contact-messages")]
    public async Task<IActionResult> GetContacts([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        var q = _db.ContactMessages.AsNoTracking();
        if (unreadOnly) q = q.Where(m => !m.IsRead);
        return Ok(await q.OrderByDescending(m => m.CreatedAt).ToListAsync(ct));
    }

    [HttpPatch("api/admin/contact-messages/{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var msg = await _db.ContactMessages.FindAsync([id], ct);
        if (msg is null) return NotFound();
        msg.MarkAsRead();
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("api/admin/tryout-requests")]
    public async Task<IActionResult> GetTryouts(CancellationToken ct)
        => Ok(await _db.TryoutRequests.AsNoTracking()
            .OrderByDescending(t => t.CreatedAt).ToListAsync(ct));

    [HttpPatch("api/admin/tryout-requests/{id:guid}/status")]
    public async Task<IActionResult> UpdateTryoutStatus(Guid id, [FromBody] TryoutStatusRequest req, CancellationToken ct)
    {
        var tryout = await _db.TryoutRequests.FindAsync([id], ct);
        if (tryout is null) return NotFound();
        tryout.UpdateStatus(req.Status);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/admin/site-settings")]
[Authorize(Roles = "admin")]
public class AdminSiteSettingsController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    public AdminSiteSettingsController(IArsenalDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var settings = await _db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        return settings is null ? NotFound() : Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SiteSettingsRequest req, CancellationToken ct)
    {
        var settings = await _db.SiteSettings.FirstOrDefaultAsync(ct);
        if (settings is null) return NotFound();
        settings.Update(req.SiteNameRu, req.SiteNameEn, req.LogoUrl, req.FaviconUrl,
            req.PrimaryColor, req.SecondaryColor, req.YandexMetrikaId, req.GoogleAnalyticsId,
            req.YandexVerification, req.GoogleVerification, req.HeroVideoRutubeId,
            req.FeatureBooking, req.FeatureBlog, req.FeatureGallery, req.FeaturePayments,
            req.FeatureReviews, req.FeatureI18n, req.FeatureShop);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

// Request records
public record PricingRequest(
    string NameRu, string NameEn, decimal Price, string Currency, int SessionsCount,
    string DescriptionRu, string DescriptionEn, List<string> FeaturesRu, List<string> FeaturesEn,
    bool IsFeatured, int SortOrder, bool IsActive);

public record PartnerRequest(
    string Name, string DescriptionRu, string? LogoUrl, string? WebsiteUrl, int SortOrder, bool IsActive);

public record TryoutStatusRequest(Arsenal.Domain.Entities.TryoutStatus Status);

public record SiteSettingsRequest(
    string SiteNameRu, string SiteNameEn, string? LogoUrl, string? FaviconUrl,
    string PrimaryColor, string SecondaryColor, string? YandexMetrikaId,
    string? GoogleAnalyticsId, string? YandexVerification, string? GoogleVerification,
    string? HeroVideoRutubeId, bool FeatureBooking, bool FeatureBlog,
    bool FeatureGallery, bool FeaturePayments, bool FeatureReviews,
    bool FeatureI18n, bool FeatureShop);
