namespace Arsenal.Application.DTOs;

public record PhotoDto(
    Guid Id,
    string Url,
    string ThumbnailUrl,
    string AltRu,
    string AltEn,
    List<string> Tags,
    bool IsPublished,
    int SortOrder
);
