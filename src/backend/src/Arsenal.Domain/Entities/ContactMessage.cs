using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class ContactMessage : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }

    private ContactMessage() { }

    public static ContactMessage Create(string name, string phone, string message, string? email = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required");
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Phone is required");
        if (string.IsNullOrWhiteSpace(message)) throw new ArgumentException("Message is required");

        return new ContactMessage
        {
            Name = name.Trim(),
            Phone = phone.Trim(),
            Email = email?.Trim(),
            Message = message.Trim()
        };
    }

    public void MarkAsRead() { IsRead = true; UpdatedAt = DateTime.UtcNow; }
}
