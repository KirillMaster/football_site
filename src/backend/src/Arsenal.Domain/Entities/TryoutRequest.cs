using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public enum TryoutStatus { New, Contacted, Scheduled, Completed, Cancelled }

public class TryoutRequest : BaseEntity
{
    public string ChildName { get; private set; } = string.Empty;
    public int ChildAge { get; private set; }
    public string ParentName { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Message { get; private set; }
    public TryoutStatus Status { get; private set; } = TryoutStatus.New;

    private TryoutRequest() { }

    public static TryoutRequest Create(string childName, int childAge,
        string parentName, string phone, string? email = null, string? message = null)
    {
        if (string.IsNullOrWhiteSpace(childName)) throw new ArgumentException("Child name is required");
        if (childAge < 3 || childAge > 18) throw new ArgumentOutOfRangeException(nameof(childAge), "Age must be 3-18");
        if (string.IsNullOrWhiteSpace(parentName)) throw new ArgumentException("Parent name is required");
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Phone is required");

        return new TryoutRequest
        {
            ChildName = childName,
            ChildAge = childAge,
            ParentName = parentName,
            Phone = phone,
            Email = email,
            Message = message
        };
    }

    public void UpdateStatus(TryoutStatus status) { Status = status; UpdatedAt = DateTime.UtcNow; }
}
