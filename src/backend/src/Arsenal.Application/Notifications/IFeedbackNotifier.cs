namespace Arsenal.Application.Notifications;

public interface IFeedbackNotifier
{
    void Notify(FeedbackNotification notification);
}
