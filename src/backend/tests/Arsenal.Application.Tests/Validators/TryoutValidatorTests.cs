using Arsenal.Application.DTOs;
using Arsenal.Application.Validators;
using FluentAssertions;

namespace Arsenal.Application.Tests.Validators;

public class TryoutRequestValidatorTests
{
    private readonly CreateTryoutRequestValidator _validator = new();

    [Fact]
    public async Task Valid_Request_ShouldPass()
    {
        var req = new CreateTryoutRequestRequest("Иван", 8, "Мария Иванова", "+79780000000");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Age_TooLow_ShouldFail()
    {
        var req = new CreateTryoutRequestRequest("Иван", 2, "Parent", "+79780000000");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ChildAge");
    }

    [Fact]
    public async Task Age_TooHigh_ShouldFail()
    {
        var req = new CreateTryoutRequestRequest("Иван", 19, "Parent", "+79780000000");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task Empty_ChildName_ShouldFail()
    {
        var req = new CreateTryoutRequestRequest("", 8, "Parent", "+79780000000");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ChildName");
    }
}
