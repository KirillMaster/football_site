using System.Text;

namespace Arsenal.Application.Notifications;

public static class FeedbackNotificationFormatter
{
    public static string Format(FeedbackNotification notification)
    {
        var sb = new StringBuilder();
        sb.AppendLine(notification.Title);

        foreach (var (label, value) in notification.Fields)
        {
            if (!string.IsNullOrWhiteSpace(value))
                sb.AppendLine($"{label}: {value}");
        }

        sb.AppendLine(notification.CreatedAtMoscow.ToString("dd.MM.yyyy HH:mm"));

        var utmLines = notification.Utm.Where(u => !string.IsNullOrWhiteSpace(u.Value)).ToList();
        if (utmLines.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("UTM:");
            foreach (var (label, value) in utmLines)
                sb.AppendLine($"{label}: {value}");
        }

        return sb.ToString().TrimEnd();
    }
}
