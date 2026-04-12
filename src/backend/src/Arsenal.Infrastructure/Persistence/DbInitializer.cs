using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Arsenal.Infrastructure.Persistence;

public class DbInitializer
{
    private readonly ArsenalDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializer(ArsenalDbContext db, IConfiguration config, ILogger<DbInitializer> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task InitializeAsync(string seedDataPath, CancellationToken ct = default)
    {
        if (_db.Database.IsRelational())
        {
            _logger.LogInformation("Applying migrations...");
            await _db.Database.MigrateAsync(ct);
        }

        await SeedAdminUserAsync(ct);
        await SeedSiteSettingsAsync(ct);

        if (!File.Exists(seedDataPath))
        {
            _logger.LogWarning("Seed data file not found at {Path}", seedDataPath);
            return;
        }

        await using var stream = File.OpenRead(seedDataPath);
        var seedData = await JsonSerializer.DeserializeAsync<JsonElement>(stream, cancellationToken: ct);

        await SeedPagesAsync(seedData, ct);
        await SeedCoachesAsync(seedData, ct);
        await SeedGroupsAndSchedulesAsync(seedData, ct);
        await SeedPricingPlansAsync(seedData, ct);
        await SeedPartnersAsync(seedData, ct);
        await SeedNewsAsync(seedData, ct);
        await SeedGalleryAsync(seedData, ct);

        _logger.LogInformation("Database seeding complete.");
    }

    private async Task SeedAdminUserAsync(CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(ct)) return;

        var email = _config["ADMIN_EMAIL"] ?? "admin@arsenal92.ru";
        var password = _config["ADMIN_PASSWORD"] ?? "ChangeMe123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = User.Create(email, hash, "admin");
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin user created: {Email}", email);
    }

    private async Task SeedSiteSettingsAsync(CancellationToken ct)
    {
        if (await _db.SiteSettings.AnyAsync(ct)) return;
        _db.SiteSettings.Add(SiteSettings.CreateDefault());
        await _db.SaveChangesAsync(ct);
    }

    private async Task SeedPagesAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.Pages.AnyAsync(ct)) return;
        if (!root.TryGetProperty("Pages", out var pagesEl)) return;

        foreach (var el in pagesEl.EnumerateArray())
        {
            var page = Page.Create(
                slug: el.GetString("slug"),
                titleRu: el.GetString("title_ru"),
                titleEn: el.GetString("title_en"),
                contentRu: el.GetString("content_ru"),
                contentEn: el.GetString("content_en"),
                metaTitleRu: el.GetString("meta_title_ru"),
                metaDescriptionRu: el.GetString("meta_description_ru"),
                metaTitleEn: el.GetString("meta_title_en"),
                metaDescriptionEn: el.GetString("meta_description_en"),
                isPublished: el.TryGetProperty("is_published", out var pub) && pub.GetBoolean(),
                sortOrder: el.TryGetProperty("sort_order", out var so) ? so.GetInt32() : 0
            );
            _db.Pages.Add(page);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Pages seeded.");
    }

    private async Task SeedCoachesAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.Coaches.AnyAsync(ct)) return;
        if (!root.TryGetProperty("Coaches", out var coachesEl)) return;

        foreach (var el in coachesEl.EnumerateArray())
        {
            var certs = new List<string>();
            if (el.TryGetProperty("certifications", out var certsEl))
                foreach (var c in certsEl.EnumerateArray())
                    certs.Add(c.GetString() ?? string.Empty);

            string? photoUrl = null;
            if (el.TryGetProperty("photo", out var photoEl) && photoEl.ValueKind == JsonValueKind.String)
                photoUrl = photoEl.GetString();

            var coach = Coach.Create(
                nameRu: el.GetString("name_ru"),
                nameEn: el.GetString("name_en"),
                positionRu: el.GetString("position_ru"),
                positionEn: el.GetString("position_en"),
                bioRu: el.GetString("bio_ru"),
                bioEn: el.GetString("bio_en"),
                certifications: certs,
                sortOrder: el.TryGetProperty("sort_order", out var so) ? so.GetInt32() : 0,
                isActive: el.TryGetProperty("is_active", out var ia) && ia.GetBoolean()
            );
            if (photoUrl != null) coach.SetPhoto(photoUrl);
            _db.Coaches.Add(coach);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Coaches seeded.");
    }

    private async Task SeedGroupsAndSchedulesAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.Groups.AnyAsync(ct)) return;
        if (!root.TryGetProperty("TrainingGroups", out var groupsEl)) return;

        var groupMap = new Dictionary<string, Guid>();

        foreach (var el in groupsEl.EnumerateArray())
        {
            var name = el.GetString("name");
            var group = Group.Create(
                name: name,
                ageRange: el.GetString("age_range"),
                level: el.GetString("level"),
                maxCapacity: el.TryGetProperty("max_capacity", out var mc) ? mc.GetInt32() : 20,
                descriptionRu: el.GetString("description_ru"),
                descriptionEn: el.GetString("description_en"),
                isActive: el.TryGetProperty("is_active", out var ia) && ia.GetBoolean()
            );
            _db.Groups.Add(group);
            groupMap[name] = group.Id;
        }
        await _db.SaveChangesAsync(ct);

        // Seed schedules
        if (!root.TryGetProperty("Schedule", out var scheduleEl)) return;
        var firstCoach = await _db.Coaches.FirstOrDefaultAsync(ct);
        if (firstCoach is null) return;

        foreach (var el in scheduleEl.EnumerateArray())
        {
            var groupRef = el.GetString("group_ref");
            if (!groupMap.TryGetValue(groupRef, out var groupId)) continue;

            if (!Enum.TryParse<DayOfWeek>(el.GetString("day_of_week"), out var dow)) continue;
            var start = TimeOnly.Parse(el.GetString("start_time"));
            var end = TimeOnly.Parse(el.GetString("end_time"));

            var schedule = Schedule.Create(
                groupId: groupId,
                coachId: firstCoach.Id,
                dayOfWeek: dow,
                startTime: start,
                endTime: end,
                location: el.GetString("location"),
                isActive: el.TryGetProperty("is_active", out var ia) && ia.GetBoolean()
            );
            _db.Schedules.Add(schedule);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Groups and schedules seeded.");
    }

    private async Task SeedPricingPlansAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.PricingPlans.AnyAsync(ct)) return;
        if (!root.TryGetProperty("PricingPlans", out var plansEl)) return;

        foreach (var el in plansEl.EnumerateArray())
        {
            var featuresRu = ParseStringArray(el, "features_ru");
            var featuresEn = ParseStringArray(el, "features_en");

            var plan = PricingPlan.Create(
                nameRu: el.GetString("name_ru"),
                nameEn: el.GetString("name_en"),
                price: el.TryGetProperty("price", out var price) ? price.GetDecimal() : 0,
                currency: el.TryGetProperty("currency", out var cur) ? cur.GetString() ?? "RUB" : "RUB",
                sessionsCount: el.TryGetProperty("sessions_count", out var sc) ? sc.GetInt32() : 1,
                descriptionRu: el.GetString("description_ru"),
                descriptionEn: el.GetString("description_en"),
                featuresRu: featuresRu,
                featuresEn: featuresEn,
                isFeatured: el.TryGetProperty("is_featured", out var feat) && feat.GetBoolean(),
                sortOrder: el.TryGetProperty("sort_order", out var so) ? so.GetInt32() : 0,
                isActive: el.TryGetProperty("is_active", out var ia) && ia.GetBoolean()
            );
            _db.PricingPlans.Add(plan);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Pricing plans seeded.");
    }

    private async Task SeedPartnersAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.Partners.AnyAsync(ct)) return;
        if (!root.TryGetProperty("Partners", out var partnersEl)) return;

        foreach (var el in partnersEl.EnumerateArray())
        {
            var partner = Partner.Create(
                name: el.GetString("name"),
                descriptionRu: el.GetString("description_ru"),
                logoUrl: el.TryGetProperty("logo_url", out var logo) && logo.ValueKind != JsonValueKind.Null
                    ? logo.GetString() : null,
                websiteUrl: el.TryGetProperty("website_url", out var site) && site.ValueKind != JsonValueKind.Null
                    ? site.GetString() : null,
                sortOrder: el.TryGetProperty("sort_order", out var so) ? so.GetInt32() : 0,
                isActive: el.TryGetProperty("is_active", out var ia) && ia.GetBoolean()
            );
            _db.Partners.Add(partner);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Partners seeded.");
    }

    private async Task SeedNewsAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.News.AnyAsync(ct)) return;
        if (!root.TryGetProperty("News", out var newsEl)) return;

        foreach (var el in newsEl.EnumerateArray())
        {
            var tags = ParseStringArray(el, "tags");
            DateTime? publishedAt = null;
            if (el.TryGetProperty("published_at", out var pa) && pa.ValueKind != JsonValueKind.Null)
                publishedAt = pa.GetDateTime();

            var news = News.Create(
                slug: el.GetString("slug"),
                titleRu: el.GetString("title_ru"),
                titleEn: el.GetString("title_en"),
                excerptRu: el.GetString("excerpt_ru"),
                excerptEn: el.GetString("excerpt_en"),
                contentRu: el.GetString("content_ru"),
                contentEn: el.GetString("content_en"),
                metaTitle: el.GetString("meta_title"),
                metaDescription: el.GetString("meta_description"),
                tags: tags,
                isPublished: el.TryGetProperty("is_published", out var pub) && pub.GetBoolean(),
                publishedAt: publishedAt
            );
            _db.News.Add(news);
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("News seeded.");
    }

    private async Task SeedGalleryAsync(JsonElement root, CancellationToken ct)
    {
        if (await _db.Photos.AnyAsync(ct)) return;
        if (!root.TryGetProperty("Gallery", out var galleryEl)) return;

        int sortOrder = 0;
        foreach (var albumEl in galleryEl.EnumerateArray())
        {
            var albumName = albumEl.TryGetProperty("album", out var an) ? an.GetString() ?? "Галерея" : "Галерея";
            if (!albumEl.TryGetProperty("photos", out var photosEl)) continue;

            foreach (var p in photosEl.EnumerateArray())
            {
                var url = p.TryGetProperty("url", out var u) ? u.GetString() ?? string.Empty : string.Empty;
                if (string.IsNullOrWhiteSpace(url)) continue;
                var altRu = p.TryGetProperty("alt_ru", out var a) ? a.GetString() ?? albumName : albumName;

                var photo = Photo.Create(url, url, altRu, string.Empty, [albumName], true, sortOrder++);
                _db.Photos.Add(photo);
            }
        }
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Gallery photos seeded.");
    }

    private static List<string> ParseStringArray(JsonElement el, string property)
    {
        var result = new List<string>();
        if (el.TryGetProperty(property, out var arr) && arr.ValueKind == JsonValueKind.Array)
            foreach (var item in arr.EnumerateArray())
                result.Add(item.GetString() ?? string.Empty);
        return result;
    }
}

internal static class JsonElementExtensions
{
    public static string GetString(this JsonElement el, string property)
    {
        if (el.TryGetProperty(property, out var val) && val.ValueKind == JsonValueKind.String)
            return val.GetString() ?? string.Empty;
        return string.Empty;
    }
}
