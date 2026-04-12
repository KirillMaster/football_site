namespace Arsenal.Application.DTOs;

public record NewsDto(
    Guid Id,
    string Slug,
    string TitleRu,
    string TitleEn,
    string ExcerptRu,
    string ExcerptEn,
    string ContentRu,
    string ContentEn,
    string? CoverImage,
    string MetaTitle,
    string MetaDescription,
    List<string> Tags,
    bool IsPublished,
    DateTime? PublishedAt
);

public record NewsSummaryDto(
    Guid Id,
    string Slug,
    string TitleRu,
    string TitleEn,
    string ExcerptRu,
    string? CoverImage,
    List<string> Tags,
    DateTime? PublishedAt
);
