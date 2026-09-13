namespace Arsenal.Application.Notifications;

public interface IFeedbackNotificationChannel
{
    string Name { get; }
    bool IsConfigured { get; }
    Task SendAsync(FeedbackNotification notification, CancellationToken cancellationToken);
}
