using Microsoft.Extensions.Logging;

namespace Arsenal.Application.Notifications;

public class FeedbackNotifier : IFeedbackNotifier
{
    private static readonly TimeSpan DefaultChannelTimeout = TimeSpan.FromSeconds(10);

    private readonly IEnumerable<IFeedbackNotificationChannel> _channels;
    private readonly ILogger<FeedbackNotifier> _logger;
    private readonly TimeSpan _channelTimeout;

    public FeedbackNotifier(IEnumerable<IFeedbackNotificationChannel> channels, ILogger<FeedbackNotifier> logger,
        TimeSpan? channelTimeout = null)
    {
        _channels = channels;
        _logger = logger;
        _channelTimeout = channelTimeout ?? DefaultChannelTimeout;
    }

    public void Notify(FeedbackNotification notification)
    {
        Task.Run(() => DispatchAsync(notification));
    }

    private async Task DispatchAsync(FeedbackNotification notification)
    {
        foreach (var channel in _channels)
        {
            if (!channel.IsConfigured)
            {
                _logger.LogWarning(
                    "Feedback notification channel {Channel} is not configured, skipping", channel.Name);
                continue;
            }

            using var cts = new CancellationTokenSource(_channelTimeout);
            try
            {
                await channel.SendAsync(notification, cts.Token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send feedback notification via {Channel}", channel.Name);
            }
        }
    }
}
