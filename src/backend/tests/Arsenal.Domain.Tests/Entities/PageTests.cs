using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Domain.Tests.Entities;

public class PageTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var page = Page.Create("about", "О клубе", "About", "<p>Content</p>", "",
            "Meta Title RU", "Meta Desc RU", "Meta Title EN", "Meta Desc EN");

        page.Should().NotBeNull();
        page.Slug.Should().Be("about");
        page.TitleRu.Should().Be("О клубе");
        page.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void Create_SlugShouldBeLowercase()
    {
        var page = Page.Create("ABOUT-US", "Title", "", "", "", "", "", "", "");
        page.Slug.Should().Be("about-us");
    }

    [Fact]
    public void Create_WithEmptySlug_ShouldThrow()
    {
        var act = () => Page.Create("", "Title", "", "", "", "", "", "", "");
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    [Fact]
    public void Create_WithEmptyTitleRu_ShouldThrow()
    {
        var act = () => Page.Create("slug", "", "", "", "", "", "", "", "");
        act.Should().Throw<ArgumentException>().WithParameterName("titleRu");
    }

    [Fact]
    public void Update_ShouldChangeFields()
    {
        var page = Page.Create("about", "Old", "", "", "", "", "", "", "");
        page.Update("New Title", "", "", "", "", "", "", "", true, 1, null);

        page.TitleRu.Should().Be("New Title");
    }

    [Fact]
    public void Create_IsPublished_DefaultsToTrue()
    {
        var page = Page.Create("slug", "Title", "", "", "", "", "", "", "");
        page.IsPublished.Should().BeTrue();
    }
}
