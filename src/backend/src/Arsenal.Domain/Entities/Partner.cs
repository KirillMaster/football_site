using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Partner : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string DescriptionRu { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? WebsiteUrl { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }

    private Partner() { }

    public static Partner Create(string name, string descriptionRu,
        string? logoUrl = null, string? websiteUrl = null,
        int sortOrder = 0, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required");

        return new Partner
        {
            Name = name,
            DescriptionRu = descriptionRu,
            LogoUrl = logoUrl,
            WebsiteUrl = websiteUrl,
            SortOrder = sortOrder,
            IsActive = isActive
        };
    }

    public void Update(string name, string descriptionRu,
        string? logoUrl, string? websiteUrl, int sortOrder, bool isActive)
    {
        Name = name;
        DescriptionRu = descriptionRu;
        LogoUrl = logoUrl;
        WebsiteUrl = websiteUrl;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
