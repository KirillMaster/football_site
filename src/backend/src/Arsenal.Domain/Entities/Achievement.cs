using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Achievement : BaseEntity
{
    public string TitleRu { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string DescriptionRu { get; private set; } = string.Empty;
    public string DescriptionEn { get; private set; } = string.Empty;
    public int Year { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsPublished { get; private set; }
    public int SortOrder { get; private set; }

    private Achievement() { }

    public static Achievement Create(string titleRu, string titleEn,
        string descriptionRu, string descriptionEn, int year,
        string? imageUrl = null, bool isPublished = true, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(titleRu)) throw new ArgumentException("Title (RU) is required");

        return new Achievement
        {
            TitleRu = titleRu,
            TitleEn = titleEn,
            DescriptionRu = descriptionRu,
            DescriptionEn = descriptionEn,
            Year = year,
            ImageUrl = imageUrl,
            IsPublished = isPublished,
            SortOrder = sortOrder
        };
    }

    public void Update(string titleRu, string titleEn, string descriptionRu,
        string descriptionEn, int year, string? imageUrl, bool isPublished, int sortOrder)
    {
        TitleRu = titleRu;
        TitleEn = titleEn;
        DescriptionRu = descriptionRu;
        DescriptionEn = descriptionEn;
        Year = year;
        ImageUrl = imageUrl;
        IsPublished = isPublished;
        SortOrder = sortOrder;
        UpdatedAt = DateTime.UtcNow;
    }
}
