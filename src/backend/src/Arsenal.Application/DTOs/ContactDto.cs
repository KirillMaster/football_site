namespace Arsenal.Application.DTOs;

public record CreateContactMessageRequest(
    string Name,
    string Phone,
    string? Email,
    string Message,
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null,
    string? UtmContent = null,
    string? UtmTerm = null,
    string? YmClientId = null
);

public record CreateTryoutRequestRequest(
    string ChildName,
    int ChildAge,
    string ParentName,
    string Phone,
    string? Email = null,
    string? Message = null,
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null,
    string? UtmContent = null,
    string? UtmTerm = null,
    string? YmClientId = null
);

public record SitemapDataDto(
    IReadOnlyList<SitemapEntry> Pages,
    IReadOnlyList<SitemapEntry> News
);

public record SitemapEntry(string Slug, DateTime UpdatedAt);
