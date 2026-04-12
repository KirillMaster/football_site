using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Video : BaseEntity
{
    public string TitleRu { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string RutubeId { get; private set; } = string.Empty;
    public string? YoutubeId { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public List<string> Tags { get; private set; } = [];
    public bool IsPublished { get; private set; }
    public int SortOrder { get; private set; }

    private Video() { }

    public static Video Create(string titleRu, string titleEn, string rutubeId,
        string? youtubeId = null, string? thumbnailUrl = null,
        List<string>? tags = null, bool isPublished = true, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(rutubeId)) throw new ArgumentException("Rutube ID is required", nameof(rutubeId));

        return new Video
        {
            TitleRu = titleRu,
            TitleEn = titleEn,
            RutubeId = rutubeId,
            YoutubeId = youtubeId,
            ThumbnailUrl = thumbnailUrl,
            Tags = tags ?? [],
            IsPublished = isPublished,
            SortOrder = sortOrder
        };
    }

    public void Update(string titleRu, string titleEn, string rutubeId,
        string? youtubeId, string? thumbnailUrl, List<string> tags,
        bool isPublished, int sortOrder)
    {
        TitleRu = titleRu;
        TitleEn = titleEn;
        RutubeId = rutubeId;
        YoutubeId = youtubeId;
        ThumbnailUrl = thumbnailUrl;
        Tags = tags;
        IsPublished = isPublished;
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }
}
