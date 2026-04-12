namespace Arsenal.Application.DTOs;

public record PricingPlanDto(
    Guid Id,
    string NameRu,
    string NameEn,
    decimal Price,
    string Currency,
    int SessionsCount,
    string DescriptionRu,
    string DescriptionEn,
    List<string> FeaturesRu,
    List<string> FeaturesEn,
    bool IsFeatured,
    int SortOrder,
    bool IsActive
);
