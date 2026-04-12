namespace Arsenal.Application.DTOs;

public record CoachDto(
    Guid Id,
    string NameRu,
    string NameEn,
    string PositionRu,
    string PositionEn,
    string BioRu,
    string BioEn,
    string? Photo,
    List<string> Certifications,
    int SortOrder,
    bool IsActive
);
