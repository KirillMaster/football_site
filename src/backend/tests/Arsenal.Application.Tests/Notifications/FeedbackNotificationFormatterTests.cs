using Arsenal.Application.Notifications;
using Arsenal.Domain.Entities;
using FluentAssertions;

namespace Arsenal.Application.Tests.Notifications;

public class FeedbackNotificationFormatterTests
{
    [Fact]
    [Trait("scenario", "US1-AS1")]
    public void Format_ContactMessage_ContainsTitleFieldsMoscowDateAndUtm()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Новое сообщение с сайта",
            new DateTime(2026, 1, 15, 12, 30, 0),
            new List<(string, string)>
            {
                ("Имя", "Иван Иванов"),
                ("Телефон", "+79780000000"),
                ("Email", "ivan@example.com"),
                ("Сообщение", "Хочу записать ребёнка")
            },
            new List<(string, string)>
            {
                ("utm_source", "yandex"),
                ("utm_medium", "cpc"),
                ("utm_campaign", "spring"),
                ("utm_content", "banner1"),
                ("utm_term", "football")
            });

        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().StartWith("Новое сообщение с сайта");
        text.Should().Contain("Имя: Иван Иванов");
        text.Should().Contain("Телефон: +79780000000");
        text.Should().Contain("Email: ivan@example.com");
        text.Should().Contain("Сообщение: Хочу записать ребёнка");
        text.Should().Contain("15.01.2026 12:30");
        text.Should().Contain("UTM:");
        text.Should().Contain("utm_source: yandex");
        text.Should().Contain("utm_medium: cpc");
        text.Should().Contain("utm_campaign: spring");
        text.Should().Contain("utm_content: banner1");
        text.Should().Contain("utm_term: football");
    }

    [Fact]
    [Trait("scenario", "US1-AS2")]
    public void Format_TryoutRequest_ContainsChildAndParentFields()
    {
        var tryout = TryoutRequest.Create("Пётр", 9, "Анна Петрова", "+79780000001", "anna@example.com",
            "Хотим на пробную тренировку");

        var notification = FeedbackNotification.FromTryoutRequest(tryout);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().StartWith("Заявка на пробную тренировку");
        text.Should().Contain("Имя ребёнка: Пётр");
        text.Should().Contain("Возраст: 9");
        text.Should().Contain("Имя родителя: Анна Петрова");
        text.Should().Contain("Телефон: +79780000001");
        text.Should().Contain("Сообщение: Хотим на пробную тренировку");
    }

    [Fact]
    [Trait("scenario", "US1-EC2")]
    public void Format_EmptyEmailAndUtm_OmitsThoseLines()
    {
        var contact = ContactMessage.Create("Сергей", "+79780000002", "Вопрос по расписанию");

        var notification = FeedbackNotification.FromContactMessage(contact);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().NotContain("Email:");
        text.Should().NotContain("UTM:");
        text.Should().Contain("Имя: Сергей");
        text.Should().Contain("Сообщение: Вопрос по расписанию");
    }

    [Fact]
    [Trait("scenario", "US1-EC3")]
    public void Format_SpecialMarkupCharacters_ArePreservedVerbatim()
    {
        const string raw = "* _ [ ] < > & <b>bold</b>";
        var contact = ContactMessage.Create("Клиент", "+79780000003", raw);

        var notification = FeedbackNotification.FromContactMessage(contact);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().Contain($"Сообщение: {raw}");
    }

    [Fact]
    [Trait("scenario", "US2-AS1")]
    public void Format_UsedAsEmailBody_ContainsAllFilledFields()
    {
        var tryout = TryoutRequest.Create("Мария", 7, "Ольга Смирнова", "+79780000004", "olga@example.com",
            "Просим перезвонить");

        var notification = FeedbackNotification.FromTryoutRequest(tryout);
        var body = FeedbackNotificationFormatter.Format(notification);

        body.Should().Contain("Заявка на пробную тренировку");
        body.Should().Contain("Имя ребёнка: Мария");
        body.Should().Contain("Имя родителя: Ольга Смирнова");
        body.Should().Contain("Email: olga@example.com");
        body.Should().Contain("Сообщение: Просим перезвонить");
    }
}
