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
    public async Task Whitespace_Only_Name_ShouldFail()
    {
        var req = new CreateContactMessageRequest("   ", "+79780000000", null, "Message");
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
    public async Task Whitespace_Only_Phone_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "   ", null, "Message");
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
    public async Task Valid_Phone_Formats_ShouldPass()
    {
        var validPhones = new[] { "+79780000000", "+7 978 000 0000", "79780000000", "8 (978) 000-00-00" };
        foreach (var phone in validPhones)
        {
            var req = new CreateContactMessageRequest("Name", phone, null, "Message");
            var result = await _validator.ValidateAsync(req);
            result.IsValid.Should().BeTrue($"phone '{phone}' should be valid");
        }
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
    public async Task Whitespace_Only_Message_ShouldFail()
    {
        var req = new CreateContactMessageRequest("Name", "+79780000000", null, "   ");
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

    [Fact]
    public async Task Null_Email_ShouldPass()
    {
        var req = new CreateContactMessageRequest("Name", "+79780000000", null, "Message");
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task VeryLongMessage_UpTo2000Chars_ShouldPass()
    {
        var longMsg = new string('х', 2000);
        var req = new CreateContactMessageRequest("Name", "+79780000000", null, longMsg);
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeTrue("message with exactly 2000 chars should be accepted");
    }

    [Fact]
    public async Task MessageExceeds2000Chars_ShouldFail()
    {
        var tooLongMsg = new string('х', 2001);
        var req = new CreateContactMessageRequest("Name", "+79780000000", null, tooLongMsg);
        var result = await _validator.ValidateAsync(req);
        result.IsValid.Should().BeFalse("message exceeding 2000 chars should be rejected");
        result.Errors.Should().Contain(e => e.PropertyName == "Message");
    }
}
