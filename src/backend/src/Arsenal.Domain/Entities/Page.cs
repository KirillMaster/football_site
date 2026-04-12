using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Page : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string TitleRu { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string ContentRu { get; private set; } = string.Empty;
    public string ContentEn { get; private set; } = string.Empty;
    public string MetaTitleRu { get; private set; } = string.Empty;
    public string MetaDescriptionRu { get; private set; } = string.Empty;
    public string MetaTitleEn { get; private set; } = string.Empty;
    public string MetaDescriptionEn { get; private set; } = string.Empty;
    public string? OgImage { get; private set; }
    public bool IsPublished { get; private set; }
    public int SortOrder { get; private set; }

    private Page() { }

    public static Page Create(string slug, string titleRu, string titleEn,
        string contentRu, string contentEn, string metaTitleRu,
        string metaDescriptionRu, string metaTitleEn, string metaDescriptionEn,
        bool isPublished = true, int sortOrder = 0, string? ogImage = null)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new ArgumentException("Slug is required", nameof(slug));
        if (string.IsNullOrWhiteSpace(titleRu)) throw new ArgumentException("Title (RU) is required", nameof(titleRu));

        var page = new Page
        {
            Slug = slug.ToLowerInvariant().Trim(),
            TitleRu = titleRu,
            TitleEn = titleEn,
            ContentRu = contentRu,
            ContentEn = contentEn,
            MetaTitleRu = metaTitleRu,
            MetaDescriptionRu = metaDescriptionRu,
            MetaTitleEn = metaTitleEn,
            MetaDescriptionEn = metaDescriptionEn,
            IsPublished = isPublished,
            SortOrder = sortOrder,
            OgImage = ogImage
        };
        return page;
    }

    public void Update(string titleRu, string titleEn, string contentRu,
        string contentEn, string metaTitleRu, string metaDescriptionRu,
        string metaTitleEn, string metaDescriptionEn, bool isPublished,
        int sortOrder, string? ogImage)
    {
        TitleRu = titleRu;
        TitleEn = titleEn;
        ContentRu = contentRu;
        ContentEn = contentEn;
        MetaTitleRu = metaTitleRu;
        MetaDescriptionRu = metaDescriptionRu;
        MetaTitleEn = metaTitleEn;
        MetaDescriptionEn = metaDescriptionEn;
        IsPublished = isPublished;
        SortOrder = sortOrder;
        OgImage = ogImage;
        UpdatedAt = DateTime.UtcNow;
    }
}
