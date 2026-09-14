using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Arsenal.Application.Notifications;
using Microsoft.Extensions.Configuration;

namespace Arsenal.Infrastructure.Notifications;

public class TelegramNotificationChannel : IFeedbackNotificationChannel
{
    private readonly HttpClient _httpClient;
    private readonly string? _botToken;
    private readonly IReadOnlyList<string> _chatIds;

    public TelegramNotificationChannel(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _botToken = configuration["TELEGRAM_BOT_TOKEN"];
        // Несколько получателей через запятую: "-100123,456789"
        _chatIds = (configuration["TELEGRAM_CHAT_ID"] ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    public string Name => "Telegram";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_botToken) && _chatIds.Count > 0;

    public async Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken)
    {
        var text = FeedbackNotificationFormatter.Format(notification);
        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";

        var failures = new List<string>();
        foreach (var chatId in _chatIds)
        {
            try
            {
                var payload = new TelegramSendMessageRequest(chatId, text);
                using var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    failures.Add($"{chatId}: HTTP {(int)response.StatusCode}");
                    continue;
                }

                var body = await response.Content.ReadFromJsonAsync<TelegramSendMessageResponse>(cancellationToken);
                if (body is null || !body.Ok)
                    failures.Add($"{chatId}: ok=false");
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                failures.Add($"{chatId}: {ex.GetType().Name}");
            }
        }

        if (failures.Count > 0)
            throw new InvalidOperationException($"Telegram send failed for {failures.Count}/{_chatIds.Count} recipient(s): {string.Join("; ", failures)}");
    }

    private record TelegramSendMessageRequest(
        [property: JsonPropertyName("chat_id")] string ChatId,
        [property: JsonPropertyName("text")] string Text);

    private record TelegramSendMessageResponse(
        [property: JsonPropertyName("ok")] bool Ok);
}
