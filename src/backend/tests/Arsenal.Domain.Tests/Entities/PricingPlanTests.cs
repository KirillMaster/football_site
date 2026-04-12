using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Domain.Tests.Entities;

public class PricingPlanTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var plan = PricingPlan.Create("СТАНДАРТ", "STANDARD", 4000m, "RUB", 12,
            "12 занятий", "12 sessions",
            ["3 занятия в неделю"], ["3 per week"],
            isFeatured: false, sortOrder: 1);

        plan.NameRu.Should().Be("СТАНДАРТ");
        plan.Price.Should().Be(4000m);
        plan.SessionsCount.Should().Be(12);
    }

    [Fact]
    public void Create_WithNegativePrice_ShouldThrow()
    {
        var act = () => PricingPlan.Create("Name", "", -1, "RUB", 12, "", "", [], []);
        act.Should().Throw<ArgumentOutOfRangeException>().WithParameterName("price");
    }

    [Fact]
    public void Create_WithZeroSessions_ShouldThrow()
    {
        var act = () => PricingPlan.Create("Name", "", 100, "RUB", 0, "", "", [], []);
        act.Should().Throw<ArgumentOutOfRangeException>().WithParameterName("sessionsCount");
    }
}
