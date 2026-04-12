using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = "admin";
    public bool IsActive { get; private set; } = true;
    public DateTime? LastLoginAt { get; private set; }

    public ICollection<RefreshToken> RefreshTokens { get; private set; } = [];

    private User() { }

    public static User Create(string email, string passwordHash, string role = "admin")
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("Password hash is required");

        return new User
        {
            Email = email.ToLowerInvariant().Trim(),
            PasswordHash = passwordHash,
            Role = role
        };
    }

    public void RecordLogin() { LastLoginAt = DateTime.UtcNow; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
    public void UpdatePasswordHash(string hash) { PasswordHash = hash; UpdatedAt = DateTime.UtcNow; }
}
