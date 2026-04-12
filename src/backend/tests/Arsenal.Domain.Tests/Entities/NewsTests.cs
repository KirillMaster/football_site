using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Domain.Tests.Entities;

public class NewsTests
{
    [Fact]
    public void Create_WithValidData_ShouldSucceed()
    {
        var news = News.Create("winter-cup-2023", "Зимний кубок", "Winter Cup",
            "Excerpt", "", "Content", "", "Meta", "Desc",
            tags: ["турнир"], isPublished: true, publishedAt: DateTime.UtcNow);

        news.Slug.Should().Be("winter-cup-2023");
        news.Tags.Should().Contain("турнир");
        news.IsPublished.Should().BeTrue();
        news.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Create_WithEmptySlug_ShouldThrow()
    {
        var act = () => News.Create("", "Title", "", "", "", "", "", "", "");
        act.Should().Throw<ArgumentException>().WithParameterName("slug");
    }

    [Fact]
    public void Publish_ShouldSetIsPublishedAndPublishedAt()
    {
        var news = News.Create("slug", "Title", "", "", "", "Content", "", "Meta", "");
        news.IsPublished.Should().BeFalse();

        news.Publish();

        news.IsPublished.Should().BeTrue();
        news.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Unpublish_ShouldSetIsPublishedFalse()
    {
        var news = News.Create("slug", "Title", "", "", "", "Content", "", "Meta", "",
            isPublished: true);
        news.Unpublish();
        news.IsPublished.Should().BeFalse();
    }

    [Fact]
    public void Slug_ShouldBeLowercased()
    {
        var news = News.Create("WINTER-CUP", "Title", "", "", "", "", "", "", "");
        news.Slug.Should().Be("winter-cup");
    }
}
