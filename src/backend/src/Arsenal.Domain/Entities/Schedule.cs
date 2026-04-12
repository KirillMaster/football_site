using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Schedule : BaseEntity
{
    public Guid GroupId { get; private set; }
    public Group? Group { get; private set; }
    public Guid CoachId { get; private set; }
    public Coach? Coach { get; private set; }
    public DayOfWeek DayOfWeek { get; private set; }
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public string Location { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    private Schedule() { }

    public static Schedule Create(Guid groupId, Guid coachId, DayOfWeek dayOfWeek,
        TimeOnly startTime, TimeOnly endTime, string location, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(location)) throw new ArgumentException("Location is required", nameof(location));
        if (endTime <= startTime) throw new ArgumentException("End time must be after start time");

        return new Schedule
        {
            GroupId = groupId,
            CoachId = coachId,
            DayOfWeek = dayOfWeek,
            StartTime = startTime,
            EndTime = endTime,
            Location = location,
            IsActive = isActive
        };
    }

    public void Update(DayOfWeek dayOfWeek, TimeOnly startTime, TimeOnly endTime,
        string location, bool isActive)
    {
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
        Location = location;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
