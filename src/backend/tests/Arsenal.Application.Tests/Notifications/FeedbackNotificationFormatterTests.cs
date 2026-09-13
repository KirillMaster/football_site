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
    [Trait("scenario", "US1-AS1")]
    public void Format_ContactMessage_DateFormatIsExactlyDdMmYyyyHhMm()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Тест",
            new DateTime(2026, 9, 5, 23, 59, 45), // 5 сентября, 23:59:45
            new List<(string, string)> { ("Имя", "Test") },
            new List<(string, string)>());

        var text = FeedbackNotificationFormatter.Format(notification);

        // Проверяем что дата в формате ровно dd.MM.yyyy HH:mm, без секунд
        text.Should().Contain("05.09.2026 23:59");
        text.Should().NotContain("45"); // не должно быть секунд
    }

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public void Format_DateAppearsAtEnd()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Заголовок",
            new DateTime(2026, 5, 10, 14, 30, 0),
            new List<(string, string)> { ("Поле", "значение") },
            new List<(string, string)>());

        var text = FeedbackNotificationFormatter.Format(notification);

        // Дата должна быть последней строкой до UTM (если есть)
        var lines = text.TrimEnd().Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
        lines[lines.Length - 1].Should().Be("10.05.2026 14:30");
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
    [Trait("scenario", "US1-AS2")]
    public void Format_TryoutRequest_BoundaryAges()
    {
        // Возраст 3 (минимум)
        var tryout3 = TryoutRequest.Create("Маша", 3, "Родитель", "+79780000001", null, null);
        var notif3 = FeedbackNotification.FromTryoutRequest(tryout3);
        var text3 = FeedbackNotificationFormatter.Format(notif3);
        text3.Should().Contain("Возраст: 3");

        // Возраст 18 (максимум)
        var tryout18 = TryoutRequest.Create("Иван", 18, "Родитель", "+79780000002", null, null);
        var notif18 = FeedbackNotification.FromTryoutRequest(tryout18);
        var text18 = FeedbackNotificationFormatter.Format(notif18);
        text18.Should().Contain("Возраст: 18");
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
    [Trait("scenario", "US1-EC2")]
    public void Format_TryoutRequestWithNullMessage_OmitsMessageLine()
    {
        var tryout = TryoutRequest.Create("Ребёнок", 7, "Родитель", "+79780000005", null, null);
        var notification = FeedbackNotification.FromTryoutRequest(tryout);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().NotContain("Сообщение:");
        text.Should().Contain("Имя ребёнка: Ребёнок");
        text.Should().Contain("Возраст: 7");
    }

    [Fact]
    [Trait("scenario", "US1-EC2")]
    public void Format_AllUtmFieldsEmpty_NoUtmSection()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Тест",
            new DateTime(2026, 1, 1, 0, 0, 0),
            new List<(string, string)> { ("Поле", "Значение") },
            new List<(string, string)>
            {
                ("utm_source", ""),
                ("utm_medium", ""),
                ("utm_campaign", ""),
                ("utm_content", ""),
                ("utm_term", "")
            });

        var text = FeedbackNotificationFormatter.Format(notification);
        text.Should().NotContain("UTM:");
    }

    [Fact]
    [Trait("scenario", "US1-EC2")]
    public void Format_PartialUtmFields_OnlyShowNonEmpty()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Тест",
            new DateTime(2026, 1, 1, 0, 0, 0),
            new List<(string, string)> { ("Поле", "Значение") },
            new List<(string, string)>
            {
                ("utm_source", "google"),
                ("utm_medium", ""),
                ("utm_campaign", "campaign1"),
                ("utm_content", ""),
                ("utm_term", "")
            });

        var text = FeedbackNotificationFormatter.Format(notification);
        text.Should().Contain("UTM:");
        text.Should().Contain("utm_source: google");
        text.Should().Contain("utm_campaign: campaign1");
        text.Should().NotContain("utm_medium:");
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
    [Trait("scenario", "US1-EC3")]
    public void Format_VeryLongMessage_FullyIncluded()
    {
        var longMsg = new string('х', 500);
        var contact = ContactMessage.Create("Клиент", "+79780000003", longMsg);
        var notification = FeedbackNotification.FromContactMessage(contact);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().Contain(longMsg);
    }

    [Fact]
    [Trait("scenario", "US1-EC3")]
    public void Format_NewlinesInMessage_Preserved()
    {
        var msgWithNewlines = "Строка 1\nСтрока 2\nСтрока 3";
        var contact = ContactMessage.Create("Клиент", "+79780000003", msgWithNewlines);
        var notification = FeedbackNotification.FromContactMessage(contact);
        var text = FeedbackNotificationFormatter.Format(notification);

        text.Should().Contain(msgWithNewlines);
    }

    [Fact]
    [Trait("scenario", "US1-EC3")]
    public void Format_WhitespaceOnlyField_Omitted()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Тест",
            new DateTime(2026, 1, 1, 0, 0, 0),
            new List<(string, string)>
            {
                ("Имя", "Иван"),
                ("Email", "   "), // только пробелы
                ("Сообщение", "Текст")
            },
            new List<(string, string)>());

        var text = FeedbackNotificationFormatter.Format(notification);
        text.Should().NotContain("Email:");
        text.Should().Contain("Имя: Иван");
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

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public void Format_UtmSectionAppearsOnlyOnce()
    {
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Тест",
            new DateTime(2026, 1, 1, 0, 0, 0),
            new List<(string, string)> { ("Поле", "Значение") },
            new List<(string, string)>
            {
                ("utm_source", "google"),
                ("utm_medium", "cpc")
            });

        var text = FeedbackNotificationFormatter.Format(notification);
        var utmCount = text.Split(new[] { "UTM:" }, StringSplitOptions.None).Length - 1;
        utmCount.Should().Be(1, "UTM section should appear exactly once");
    }

    [Fact]
    [Trait("scenario", "US1-AS1")]
    public void Format_FieldOrderMatchesInputOrder()
    {
        var fields = new List<(string, string)>
        {
            ("Z-field", "last"),
            ("A-field", "first"),
            ("M-field", "middle")
        };
        var notification = new FeedbackNotification(
            FeedbackKind.ContactMessage,
            "Заголовок",
            new DateTime(2026, 1, 1, 0, 0, 0),
            fields,
            new List<(string, string)>());

        var text = FeedbackNotificationFormatter.Format(notification);
        var lines = text.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);

        // Заголовок, затем поля в порядке
        lines[0].Should().Be("Заголовок");
        lines[1].Should().Contain("Z-field");
        lines[2].Should().Contain("A-field");
        lines[3].Should().Contain("M-field");
    }
}
