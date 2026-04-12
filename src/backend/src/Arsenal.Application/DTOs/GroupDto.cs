namespace Arsenal.Application.DTOs;

public record GroupDto(
    Guid Id,
    string Name,
    string AgeRange,
    string Level,
    int MaxCapacity,
    string DescriptionRu,
    string DescriptionEn,
    bool IsActive
);

public record ScheduleDto(
    Guid Id,
    Guid GroupId,
    string GroupName,
    Guid CoachId,
    string CoachName,
    string DayOfWeek,
    string StartTime,
    string EndTime,
    string Location,
    bool IsActive
);
