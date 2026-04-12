using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Coach : BaseEntity
{
    public string NameRu { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string PositionRu { get; private set; } = string.Empty;
    public string PositionEn { get; private set; } = string.Empty;
    public string BioRu { get; private set; } = string.Empty;
    public string BioEn { get; private set; } = string.Empty;
    public string? Photo { get; private set; }
    public List<string> Certifications { get; private set; } = [];
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }

    private Coach() { }

    public static Coach Create(string nameRu, string nameEn, string positionRu,
        string positionEn, string bioRu, string bioEn,
        List<string>? certifications = null, int sortOrder = 0, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(nameRu)) throw new ArgumentException("Name (RU) is required", nameof(nameRu));

        return new Coach
        {
            NameRu = nameRu,
            NameEn = nameEn,
            PositionRu = positionRu,
            PositionEn = positionEn,
            BioRu = bioRu,
            BioEn = bioEn,
            Certifications = certifications ?? [],
            SortOrder = sortOrder,
            IsActive = isActive
        };
    }

    public void Update(string nameRu, string nameEn, string positionRu,
        string positionEn, string bioRu, string bioEn,
        string? photo, List<string> certifications, int sortOrder, bool isActive)
    {
        NameRu = nameRu;
        NameEn = nameEn;
        PositionRu = positionRu;
        PositionEn = positionEn;
        BioRu = bioRu;
        BioEn = bioEn;
        Photo = photo;
        Certifications = certifications;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPhoto(string? photoUrl)
    {
        Photo = photoUrl;
        UpdatedAt = DateTime.UtcNow;
    }
}
