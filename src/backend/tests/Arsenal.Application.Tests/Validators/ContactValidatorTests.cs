using Arsenal.Application.DTOs;
using Arsenal.Application.Validators;
using FluentAssertions;

namespace Arsenal.Application.Tests.Validators;

public class ContactMessageValidatorTests
{
    private readonly CreateContactMessageValidator _validator = new();

    [Fact]
    public async Task Valid_Request_ShouldPass()
    {
        var req = new CreateContactMessageRequest("Иван", "+7-978-813-09-82", null, "Хочу записать ребенка");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Empty_Name_ShouldFail()
    {
        var req = new CreateContactMessageRequest("", "+79780000000", null, "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public async Task Empty_Phone_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "", null, "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Phone");
    }

    [Fact]
    public async Task Invalid_Phone_Format_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "abc-not-a-phone", null, "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task Empty_Message_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "+79780000000", null, "");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Message");
    }

    [Fact]
    public async Task Invalid_Email_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "+79780000000", "not-an-email", "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public async Task Valid_Email_ShouldPass()
    {
        var req = new CreateContactMessageRequest("Name", "+79780000000", "test@example.com", "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeTrue();
    }
}
