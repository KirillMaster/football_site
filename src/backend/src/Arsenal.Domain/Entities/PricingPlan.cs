using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class PricingPlan : BaseEntity
{
    public string NameRu { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "RUB";
    public int SessionsCount { get; private set; }
    public string DescriptionRu { get; private set; } = string.Empty;
    public string DescriptionEn { get; private set; } = string.Empty;
    public List<string> FeaturesRu { get; private set; } = [];
    public List<string> FeaturesEn { get; private set; } = [];
    public bool IsFeatured { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }

    private PricingPlan() { }

    public static PricingPlan Create(string nameRu, string nameEn, decimal price,
        string currency, int sessionsCount, string descriptionRu, string descriptionEn,
        List<string> featuresRu, List<string> featuresEn,
        bool isFeatured = false, int sortOrder = 0, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(nameRu)) throw new ArgumentException("Name (RU) is required");
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price), "Price must be non-negative");
        if (sessionsCount <= 0) throw new ArgumentOutOfRangeException(nameof(sessionsCount), "Sessions count must be positive");

        return new PricingPlan
        {
            NameRu = nameRu,
            NameEn = nameEn,
            Price = price,
            Currency = currency,
            SessionsCount = sessionsCount,
            DescriptionRu = descriptionRu,
            DescriptionEn = descriptionEn,
            FeaturesRu = featuresRu,
            FeaturesEn = featuresEn,
            IsFeatured = isFeatured,
            SortOrder = sortOrder,
            IsActive = isActive
        };
    }

    public void Update(string nameRu, string nameEn, decimal price, string currency,
        int sessionsCount, string descriptionRu, string descriptionEn,
        List<string> featuresRu, List<string> featuresEn,
        bool isFeatured, int sortOrder, bool isActive)
    {
        NameRu = nameRu;
        NameEn = nameEn;
        Price = price;
        Currency = currency;
        SessionsCount = sessionsCount;
        DescriptionRu = descriptionRu;
        DescriptionEn = descriptionEn;
        FeaturesRu = featuresRu;
        FeaturesEn = featuresEn;
        IsFeatured = isFeatured;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
