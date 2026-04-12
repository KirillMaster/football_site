namespace Arsenal.Application.DTOs;

public record PageDto(
    Guid Id,
    string Slug,
    string TitleRu,
    string TitleEn,
    string ContentRu,
    string ContentEn,
    string MetaTitleRu,
    string MetaDescriptionRu,
    string MetaTitleEn,
    string MetaDescriptionEn,
    string? OgImage,
    bool IsPublished,
    int SortOrder,
    DateTime UpdatedAt
);

public record PageSummaryDto(
    Guid Id,
    string Slug,
    string TitleRu,
    string TitleEn,
    bool IsPublished,
    int SortOrder
);
