using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Photo : BaseEntity
{
    public string Url { get; private set; } = string.Empty;
    public string ThumbnailUrl { get; private set; } = string.Empty;
    public string AltRu { get; private set; } = string.Empty;
    public string AltEn { get; private set; } = string.Empty;
    public List<string> Tags { get; private set; } = [];
    public bool IsPublished { get; private set; }
    public int SortOrder { get; private set; }

    private Photo() { }

    public static Photo Create(string url, string thumbnailUrl, string altRu,
        string altEn, List<string>? tags = null, bool isPublished = true, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL is required", nameof(url));

        return new Photo
        {
            Url = url,
            ThumbnailUrl = string.IsNullOrWhiteSpace(thumbnailUrl) ? url : thumbnailUrl,
            AltRu = altRu,
            AltEn = altEn,
            Tags = tags ?? [],
            IsPublished = isPublished,
            SortOrder = sortOrder
        };
    }

    public void Update(string altRu, string altEn, List<string> tags, bool isPublished, int sortOrder)
    {
        AltRu = altRu;
        AltEn = altEn;
        Tags = tags;
        IsPublished = isPublished;
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }
}
