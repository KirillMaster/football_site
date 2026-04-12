using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public enum RegistrationStatus { Pending, Confirmed, Rejected, Cancelled }

public class PlayerRegistration : BaseEntity
{
    public string PlayerFirstName { get; private set; } = string.Empty;
    public string PlayerLastName { get; private set; } = string.Empty;
    public DateOnly BirthDate { get; private set; }
    public string ParentName { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public Guid? GroupId { get; private set; }
    public Group? Group { get; private set; }
    public RegistrationStatus Status { get; private set; } = RegistrationStatus.Pending;
    public string? Notes { get; private set; }

    private PlayerRegistration() { }

    public static PlayerRegistration Create(string playerFirstName, string playerLastName,
        DateOnly birthDate, string parentName, string phone, string? email = null,
        Guid? groupId = null, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(playerFirstName)) throw new ArgumentException("Player first name is required");
        if (string.IsNullOrWhiteSpace(playerLastName)) throw new ArgumentException("Player last name is required");
        if (string.IsNullOrWhiteSpace(parentName)) throw new ArgumentException("Parent name is required");
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Phone is required");

        return new PlayerRegistration
        {
            PlayerFirstName = playerFirstName,
            PlayerLastName = playerLastName,
            BirthDate = birthDate,
            ParentName = parentName,
            Phone = phone,
            Email = email,
            GroupId = groupId,
            Notes = notes
        };
    }

    public void Confirm() { Status = RegistrationStatus.Confirmed; UpdatedAt = DateTime.UtcNow; }
    public void Reject() { Status = RegistrationStatus.Rejected; UpdatedAt = DateTime.UtcNow; }
    public void Cancel() { Status = RegistrationStatus.Cancelled; UpdatedAt = DateTime.UtcNow; }
}
