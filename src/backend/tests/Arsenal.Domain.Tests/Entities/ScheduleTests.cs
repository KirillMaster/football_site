using Arsenal.Domain.Entities;

namespace Arsenal.Domain.Tests.Entities;

public class ScheduleTests
{
    private static Schedule MakeSchedule(Guid coachId) =>
        Schedule.Create(Guid.NewGuid(), coachId, DayOfWeek.Tuesday,
            new TimeOnly(18, 0), new TimeOnly(19, 30), "Стадион");

    [Fact]
    public void ReassignCoach_SetsNewCoachAndTouchesUpdatedAt()
    {
        var schedule = MakeSchedule(Guid.NewGuid());
        var before = schedule.UpdatedAt;
        var newCoachId = Guid.NewGuid();

        schedule.ReassignCoach(newCoachId);

        schedule.CoachId.Should().Be(newCoachId);
        schedule.UpdatedAt.Should().BeOnOrAfter(before);
    }

    [Fact]
    public void ReassignCoach_WithEmptyId_Throws()
    {
        var schedule = MakeSchedule(Guid.NewGuid());

        var act = () => schedule.ReassignCoach(Guid.Empty);

        act.Should().Throw<ArgumentException>();
    }
}
