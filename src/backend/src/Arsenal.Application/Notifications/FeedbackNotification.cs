using Arsenal.Domain.Entities;

namespace Arsenal.Application.Notifications;

public enum FeedbackKind
{
    ContactMessage,
    TryoutRequest
}

public record FeedbackNotification(
    FeedbackKind Kind,
    string Title,
    DateTime CreatedAtMoscow,
    IReadOnlyList<(string Label, string Value)> Fields,
    IReadOnlyList<(string Label, string Value)> Utm)
{
    private static readonly TimeZoneInfo MoscowTimeZone = ResolveMoscowTimeZone();

    public static FeedbackNotification FromContactMessage(ContactMessage entity)
    {
        var fields = new List<(string, string)>
        {
            ("Имя", entity.Name),
            ("Телефон", entity.Phone),
            ("Email", entity.Email ?? string.Empty),
            ("Сообщение", entity.Message)
        };

        return new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Новое сообщение с сайта",
            ToMoscowTime(entity.CreatedAt),
            fields,
            BuildUtm(entity.UtmSource, entity.UtmMedium, entity.UtmCampaign, entity.UtmContent, entity.UtmTerm));
    }

    public static FeedbackNotification FromTryoutRequest(TryoutRequest entity)
    {
        var fields = new List<(string, string)>
        {
            ("Имя ребёнка", entity.ChildName),
            ("Возраст", entity.ChildAge.ToString()),
            ("Имя родителя", entity.ParentName),
            ("Телефон", entity.Phone),
            ("Email", entity.Email ?? string.Empty),
            ("Сообщение", entity.Message ?? string.Empty)
        };

        return new FeedbackNotification(
            FeedbackKind.TryoutRequest,
            "Заявка на пробную тренировку",
            ToMoscowTime(entity.CreatedAt),
            fields,
            BuildUtm(entity.UtmSource, entity.UtmMedium, entity.UtmCampaign, entity.UtmContent, entity.UtmTerm));
    }

    private static IReadOnlyList<(string, string)> BuildUtm(
        string? utmSource, string? utmMedium, string? utmCampaign, string? utmContent, string? utmTerm)
    {
        return new List<(string, string)>
        {
            ("utm_source", utmSource ?? string.Empty),
            ("utm_medium", utmMedium ?? string.Empty),
            ("utm_campaign", utmCampaign ?? string.Empty),
            ("utm_content", utmContent ?? string.Empty),
            ("utm_term", utmTerm ?? string.Empty)
        };
    }

    private static DateTime ToMoscowTime(DateTime createdAtUtc)
    {
        var utc = createdAtUtc.Kind == DateTimeKind.Utc
            ? createdAtUtc
            : DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc);
        return TimeZoneInfo.ConvertTimeFromUtc(utc, MoscowTimeZone);
    }

    private static TimeZoneInfo ResolveMoscowTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Europe/Moscow");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Russian Standard Time");
        }
    }
}
