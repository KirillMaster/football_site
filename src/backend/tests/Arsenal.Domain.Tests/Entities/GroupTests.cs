using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Domain.Tests.Entities;

public class GroupTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var group = Group.Create("Основная группа", "6-14 лет", "all", 20,
            "Описание RU", "Description EN");

        group.Name.Should().Be("Основная группа");
        group.MaxCapacity.Should().Be(20);
        group.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_WithZeroCapacity_ShouldThrow()
    {
        var act = () => Group.Create("Name", "6-14", "all", 0, "", "");
        act.Should().Throw<ArgumentOutOfRangeException>().WithParameterName("maxCapacity");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrow()
    {
        var act = () => Group.Create("", "6-14", "all", 10, "", "");
        act.Should().Throw<ArgumentException>().WithParameterName("name");
    }
}

public class TryoutRequestTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var tryout = TryoutRequest.Create("Иван", 8, "Мария Иванова", "+7-978-813-09-82");
        tryout.ChildName.Should().Be("Иван");
        tryout.Status.Should().Be(TryoutStatus.New);
    }

    [Fact]
    public void Create_WithAgeOutOfRange_ShouldThrow()
    {
        var act = () => TryoutRequest.Create("Иван", 20, "Parent", "+7900000000");
        act.Should().Throw<ArgumentOutOfRangeException>().WithParameterName("childAge");
    }

    [Fact]
    public void Create_WithEmptyPhone_ShouldThrow()
    {
        var act = () => TryoutRequest.Create("Иван", 8, "Parent", "");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void UpdateStatus_ShouldChangeStatus()
    {
        var tryout = TryoutRequest.Create("Иван", 8, "Parent", "+79780000000");
        tryout.UpdateStatus(TryoutStatus.Scheduled);
        tryout.Status.Should().Be(TryoutStatus.Scheduled);
    }
}
