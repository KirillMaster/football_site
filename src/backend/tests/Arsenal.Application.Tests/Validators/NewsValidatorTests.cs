using Arsenal.Application.Validators;
using FluentAssertions;

namespace Arsenal.Application.Tests.Validators;

public class CreateNewsCommandValidatorTests
{
    private readonly CreateNewsCommandValidator _validator = new();

    [Fact]
    public async Task Valid_Command_ShouldPass()
    {
        var cmd = new CreateNewsCommand("winter-cup-2023", "Зимний кубок", "",
            "Excerpt", "", "Content here", "", "Meta Title", "Meta Desc",
            ["турнир"], true, null);
        var result = await _validator.ValidateAsync(cmd);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Invalid_Slug_Uppercase_ShouldFail()
    {
        var cmd = new CreateNewsCommand("UPPER-CASE", "Title", "",
            "", "", "Content", "", "", "", [], false, null);
        var result = await _validator.ValidateAsync(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Slug");
    }

    [Fact]
    public async Task Empty_TitleRu_ShouldFail()
    {
        var cmd = new CreateNewsCommand("valid-slug", "", "",
            "", "", "Content", "", "", "", [], false, null);
        var result = await _validator.ValidateAsync(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "TitleRu");
    }

    [Fact]
    public async Task Empty_ContentRu_ShouldFail()
    {
        var cmd = new CreateNewsCommand("valid-slug", "Title", "",
            "", "", "", "", "", "", [], false, null);
        var result = await _validator.ValidateAsync(cmd);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ContentRu");
    }
}
