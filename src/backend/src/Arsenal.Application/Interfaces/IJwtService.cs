using Arsenal.Domain.Entities;

namespace Arsenal.Application.Interfaces;

public record TokenPair(string AccessToken, string RefreshToken, DateTime AccessTokenExpiry);

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Guid? ValidateAccessToken(string token);
}
