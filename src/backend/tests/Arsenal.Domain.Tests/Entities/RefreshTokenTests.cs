using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Domain.Tests.Entities;

public class RefreshTokenTests
{
    [Fact]
    public void Create_WithFutureExpiry_IsActive_ShouldBeTrue()
    {
        var token = RefreshToken.Create(Guid.NewGuid(), "token-value", DateTime.UtcNow.AddDays(7));
        token.IsActive.Should().BeTrue();
        token.IsRevoked.Should().BeFalse();
    }

    [Fact]
    public void Create_WithPastExpiry_IsActive_ShouldBeFalse()
    {
        var token = RefreshToken.Create(Guid.NewGuid(), "token-value", DateTime.UtcNow.AddDays(-1));
        token.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Revoke_ShouldSetIsRevoked()
    {
        var token = RefreshToken.Create(Guid.NewGuid(), "token-value", DateTime.UtcNow.AddDays(7));
        token.Revoke("new-token");
        token.IsRevoked.Should().BeTrue();
        token.IsActive.Should().BeFalse();
        token.ReplacedByToken.Should().Be("new-token");
    }

    [Fact]
    public void Create_WithEmptyToken_ShouldThrow()
    {
        var act = () => RefreshToken.Create(Guid.NewGuid(), "", DateTime.UtcNow.AddDays(7));
        act.Should().Throw<ArgumentException>().WithParameterName("token");
    }
}
