using Arsenal.Application.Notifications;
using Microsoft.Extensions.Logging;

namespace Arsenal.Application.Tests.Notifications;

public class FeedbackNotifierTests
{
    private static FeedbackNotification SampleNotification() => new(
        FeedbackKind.ContactMessage,
        "Новое сообщение с сайта",
        DateTime.UtcNow,
        new List<(string, string)> { ("Имя", "Тест") },
        new List<(string, string)>());

    [Fact]
    [Trait("scenario", "US1-EC1")]
    public async Task Notify_ChannelNotConfigured_SkipsSendAndLogsWarning()
    {
        var channel = new Mock<IFeedbackNotificationChannel>();
        channel.SetupGet(c => c.Name).Returns("Telegram");
        channel.SetupGet(c => c.IsConfigured).Returns(false);

        var logger = new Mock<ILogger<FeedbackNotifier>>();
        var done = new TaskCompletionSource();
        logger.Setup(l => l.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback(() => done.TrySetResult());

        var notifier = new FeedbackNotifier(new[] { channel.Object }, logger.Object, TimeSpan.FromSeconds(1));

        notifier.Notify(SampleNotification());
        await WaitAsync(done.Task);

        channel.Verify(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    [Trait("scenario", "US3-AS1")]
    public async Task Notify_ChannelThrows_DoesNotEscapeAndLogsError()
    {
        var channel = new Mock<IFeedbackNotificationChannel>();
        channel.SetupGet(c => c.Name).Returns("Telegram");
        channel.SetupGet(c => c.IsConfigured).Returns(true);
        channel.Setup(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("boom"));

        var logger = new Mock<ILogger<FeedbackNotifier>>();
        var done = new TaskCompletionSource();
        logger.Setup(l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback(() => done.TrySetResult());

        var notifier = new FeedbackNotifier(new[] { channel.Object }, logger.Object, TimeSpan.FromSeconds(1));

        var exception = await Record.ExceptionAsync(() =>
        {
            notifier.Notify(SampleNotification());
            return WaitAsync(done.Task);
        });

        exception.Should().BeNull();
        channel.Verify(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    [Trait("scenario", "US3-AS2")]
    public async Task Notify_NoChannelsConfigured_LogsWarningForEachAndSendsNothing()
    {
        var channel1 = new Mock<IFeedbackNotificationChannel>();
        channel1.SetupGet(c => c.Name).Returns("Telegram");
        channel1.SetupGet(c => c.IsConfigured).Returns(false);

        var channel2 = new Mock<IFeedbackNotificationChannel>();
        channel2.SetupGet(c => c.Name).Returns("Email");
        channel2.SetupGet(c => c.IsConfigured).Returns(false);

        var logger = new Mock<ILogger<FeedbackNotifier>>();
        var warningCount = 0;
        var done = new TaskCompletionSource();
        logger.Setup(l => l.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback(() =>
            {
                if (Interlocked.Increment(ref warningCount) >= 2)
                    done.TrySetResult();
            });

        var notifier = new FeedbackNotifier(new[] { channel1.Object, channel2.Object }, logger.Object, TimeSpan.FromSeconds(1));

        notifier.Notify(SampleNotification());
        await WaitAsync(done.Task);

        channel1.Verify(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()), Times.Never);
        channel2.Verify(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()), Times.Never);
        warningCount.Should().Be(2);
    }

    [Fact]
    [Trait("scenario", "US3-EC4")]
    public async Task Notify_ChannelExceedsTimeout_IsCancelledAndLoggedAsError()
    {
        var channel = new Mock<IFeedbackNotificationChannel>();
        channel.SetupGet(c => c.Name).Returns("Telegram");
        channel.SetupGet(c => c.IsConfigured).Returns(true);
        channel.Setup(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()))
            .Returns((FeedbackNotification _, CancellationToken ct) => Task.Delay(Timeout.Infinite, ct));

        var logger = new Mock<ILogger<FeedbackNotifier>>();
        var done = new TaskCompletionSource();
        logger.Setup(l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception?>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()))
            .Callback(() => done.TrySetResult());

        var notifier = new FeedbackNotifier(new[] { channel.Object }, logger.Object, TimeSpan.FromMilliseconds(200));

        notifier.Notify(SampleNotification());
        await WaitAsync(done.Task);

        channel.Verify(c => c.SendAsync(It.IsAny<FeedbackNotification>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static async Task WaitAsync(Task task)
    {
        var timeout = Task.Delay(TimeSpan.FromSeconds(5));
        var completed = await Task.WhenAny(task, timeout);
        completed.Should().Be(task, "the notifier's dispatch was expected to complete within the test timeout");
    }
}
