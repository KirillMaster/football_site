using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class News : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string TitleRu { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string ExcerptRu { get; private set; } = string.Empty;
    public string ExcerptEn { get; private set; } = string.Empty;
    public string ContentRu { get; private set; } = string.Empty;
    public string ContentEn { get; private set; } = string.Empty;
    public string? CoverImage { get; private set; }
    public string MetaTitle { get; private set; } = string.Empty;
    public string MetaDescription { get; private set; } = string.Empty;
    public List<string> Tags { get; private set; } = [];
    public bool IsPublished { get; private set; }
    public DateTime? PublishedAt { get; private set; }

    private News() { }

    public static News Create(string slug, string titleRu, string titleEn,
        string excerptRu, string excerptEn, string contentRu, string contentEn,
        string metaTitle, string metaDescription, List<string>? tags = null,
        bool isPublished = false, DateTime? publishedAt = null)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new ArgumentException("Slug is required", nameof(slug));
        if (string.IsNullOrWhiteSpace(titleRu)) throw new ArgumentException("Title (RU) is required", nameof(titleRu));

        return new News
        {
            Slug = slug.ToLowerInvariant().Trim(),
            TitleRu = titleRu,
            TitleEn = titleEn,
            ExcerptRu = excerptRu,
            ExcerptEn = excerptEn,
            ContentRu = contentRu,
            ContentEn = contentEn,
            MetaTitle = metaTitle,
            MetaDescription = metaDescription,
            Tags = tags ?? [],
            IsPublished = isPublished,
            PublishedAt = isPublished ? (publishedAt ?? DateTime.UtcNow) : null
        };
    }

    public void Publish()
    {
        IsPublished = true;
        PublishedAt ??= DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unpublish()
    {
        IsPublished = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCoverImage(string? url)
    {
        CoverImage = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(string titleRu, string titleEn, string excerptRu,
        string excerptEn, string contentRu, string contentEn,
        string metaTitle, string metaDescription, List<string> tags,
        string? coverImage)
    {
        TitleRu = titleRu;
        TitleEn = titleEn;
        ExcerptRu = excerptRu;
        ExcerptEn = excerptEn;
        ContentRu = contentRu;
        ContentEn = contentEn;
        MetaTitle = metaTitle;
        MetaDescription = metaDescription;
        Tags = tags;
        CoverImage = coverImage;
        UpdatedAt = DateTime.UtcNow;
    }
}
