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
    public string? UtmSource { get; private set; }
    public string? UtmMedium { get; private set; }
    public string? UtmCampaign { get; private set; }
    public string? UtmContent { get; private set; }
    public string? UtmTerm { get; private set; }
    public string? YmClientId { get; private set; }

    private TryoutRequest() { }

    public static TryoutRequest Create(string childName, int childAge,
        string parentName, string phone, string? email = null, string? message = null,
        string? utmSource = null, string? utmMedium = null, string? utmCampaign = null,
        string? utmContent = null, string? utmTerm = null, string? ymClientId = null)
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
            Message = message,
            UtmSource = utmSource,
            UtmMedium = utmMedium,
            UtmCampaign = utmCampaign,
            UtmContent = utmContent,
            UtmTerm = utmTerm,
            YmClientId = ymClientId
        };
    }

    public void UpdateStatus(TryoutStatus status) { Status = status; UpdatedAt = DateTime.UtcNow; }
}
