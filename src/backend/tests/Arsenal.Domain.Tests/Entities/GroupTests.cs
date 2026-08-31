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

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public void Create_WithUtmAndYmClientId_ShouldPersistAllFields()
    {
        var tryout = TryoutRequest.Create("Иван", 8, "Мария Иванова", "+79780000000",
            utmSource: "yandex", utmMedium: "cpc", utmCampaign: "tryout", utmContent: "banner1",
            utmTerm: "football", ymClientId: "123456789.0987654321");

        tryout.UtmSource.Should().Be("yandex");
        tryout.UtmMedium.Should().Be("cpc");
        tryout.UtmCampaign.Should().Be("tryout");
        tryout.UtmContent.Should().Be("banner1");
        tryout.UtmTerm.Should().Be("football");
        tryout.YmClientId.Should().Be("123456789.0987654321");
    }
}

public class ContactMessageTests
{
    [Fact]
    [Trait("scenario", "US3-AS1")]
    public void Create_WithUtmAndYmClientId_ShouldPersistAllFields()
    {
        var message = ContactMessage.Create("Иван", "+79780000000", "Хочу записать ребенка",
            utmSource: "yandex", utmMedium: "cpc", utmCampaign: "tryout", utmContent: "banner1",
            utmTerm: "football", ymClientId: "123456789.0987654321");

        message.UtmSource.Should().Be("yandex");
        message.UtmMedium.Should().Be("cpc");
        message.UtmCampaign.Should().Be("tryout");
        message.UtmContent.Should().Be("banner1");
        message.UtmTerm.Should().Be("football");
        message.YmClientId.Should().Be("123456789.0987654321");
    }
}
