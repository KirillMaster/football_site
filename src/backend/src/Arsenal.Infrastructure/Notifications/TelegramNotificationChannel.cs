using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Arsenal.Application.Notifications;
using Microsoft.Extensions.Configuration;

namespace Arsenal.Infrastructure.Notifications;

public class TelegramNotificationChannel : IFeedbackNotificationChannel
{
    private readonly HttpClient _httpClient;
    private readonly string? _botToken;
    private readonly string? _chatId;

    public TelegramNotificationChannel(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _botToken = configuration["TELEGRAM_BOT_TOKEN"];
        _chatId = configuration["TELEGRAM_CHAT_ID"];
    }

    public string Name => "Telegram";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_botToken) && !string.IsNullOrWhiteSpace(_chatId);

    public async Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken)
    {
        var text = FeedbackNotificationFormatter.Format(notification);
        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";
        var payload = new TelegramSendMessageRequest(_chatId!, text);

        using var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("Telegram API request failed");

        var body = await response.Content.ReadFromJsonAsync<TelegramSendMessageResponse>(cancellationToken);
        if (body is null || !body.Ok)
            throw new InvalidOperationException("Telegram API returned ok=false");
    }

    private record TelegramSendMessageRequest(
        [property: JsonPropertyName("chat_id")] string ChatId,
        [property: JsonPropertyName("text")] string Text);

    private record TelegramSendMessageResponse(
        [property: JsonPropertyName("ok")] bool Ok);
}
