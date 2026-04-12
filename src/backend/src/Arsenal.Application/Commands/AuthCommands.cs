using Arsenal.Application.Common;
using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Arsenal.Application.Commands;

public class AuthCommandHandler
{
    private readonly IArsenalDbContext _db;
    private readonly IJwtService _jwt;
    private readonly ILogger<AuthCommandHandler> _logger;

    private const int RefreshTokenDays = 7;

    public AuthCommandHandler(IArsenalDbContext db, IJwtService jwt,
        ILogger<AuthCommandHandler> logger)
    {
        _db = db;
        _jwt = jwt;
        _logger = logger;
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant() && u.IsActive, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for {Email}", request.Email);
            return Result<AuthResponse>.Failure("Invalid email or password");
        }

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshTokenValue = _jwt.GenerateRefreshToken();
        var expiry = DateTime.UtcNow.AddDays(RefreshTokenDays);
        var refreshToken = RefreshToken.Create(user.Id, refreshTokenValue, expiry);

        // Attach and record login
        var trackedUser = await _db.Users.FindAsync([user.Id], ct);
        trackedUser?.RecordLogin();
        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(ct);

        var accessExpiry = DateTime.UtcNow.AddMinutes(15);
        return Result<AuthResponse>.Success(new AuthResponse(
            accessToken, refreshTokenValue, accessExpiry, user.Email, user.Role));
    }

    public async Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var token = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken, ct);

        if (token is null || !token.IsActive || token.User is null)
            return Result<AuthResponse>.Failure("Invalid or expired refresh token");

        var newRefreshValue = _jwt.GenerateRefreshToken();
        var newExpiry = DateTime.UtcNow.AddDays(RefreshTokenDays);
        var newRefreshToken = RefreshToken.Create(token.UserId, newRefreshValue, newExpiry);

        token.Revoke(newRefreshValue);
        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync(ct);

        var accessToken = _jwt.GenerateAccessToken(token.User);
        var accessExpiry = DateTime.UtcNow.AddMinutes(15);
        return Result<AuthResponse>.Success(new AuthResponse(
            accessToken, newRefreshValue, accessExpiry, token.User.Email, token.User.Role));
    }
}
