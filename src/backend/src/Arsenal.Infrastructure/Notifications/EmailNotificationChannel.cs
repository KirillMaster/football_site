using Arsenal.Application.Notifications;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace Arsenal.Infrastructure.Notifications;

public class EmailNotificationChannel : IFeedbackNotificationChannel
{
    private const string DefaultSmtpHost = "smtp.mail.ru";
    private const int DefaultSmtpPort = 465;
    private const string DefaultFeedbackEmailTo = "ars2011sev@mail.ru";

    private readonly IConfiguration _configuration;

    public EmailNotificationChannel(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Name => "Email";

    private string? SmtpUser => _configuration["SMTP_USER"];
    private string? SmtpPassword => _configuration["SMTP_PASSWORD"];

    public bool IsConfigured => !string.IsNullOrWhiteSpace(SmtpUser) && !string.IsNullOrWhiteSpace(SmtpPassword);

    public async Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken)
    {
        var host = _configuration["SMTP_HOST"];
        host = string.IsNullOrWhiteSpace(host) ? DefaultSmtpHost : host;

        var port = DefaultSmtpPort;
        var portRaw = _configuration["SMTP_PORT"];
        if (!string.IsNullOrWhiteSpace(portRaw) && int.TryParse(portRaw, out var parsedPort))
            port = parsedPort;

        var to = _configuration["FEEDBACK_EMAIL_TO"];
        to = string.IsNullOrWhiteSpace(to) ? DefaultFeedbackEmailTo : to;

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(SmtpUser));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = $"[fcarsenal92.ru] {notification.Title}";
        message.Body = new TextPart("plain") { Text = FeedbackNotificationFormatter.Format(notification) };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect, cancellationToken);
        try
        {
            await client.AuthenticateAsync(SmtpUser, SmtpPassword, cancellationToken);
            await client.SendAsync(message, cancellationToken);
        }
        finally
        {
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}
