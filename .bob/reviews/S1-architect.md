# S1 notifications-core — architect review

Verdict: **pass**, no changes.

Checked:
- Arsenal.Application (`IFeedbackNotifier`, `IFeedbackNotificationChannel`, `FeedbackNotifier`, `FeedbackNotification`, `FeedbackNotificationFormatter`) has no reference to Arsenal.Infrastructure or transports — confirmed via `Arsenal.Application.csproj` (no MailKit/HttpClient package refs).
- `TelegramNotificationChannel` / `EmailNotificationChannel` live in `Arsenal.Infrastructure/Notifications`, implement `IFeedbackNotificationChannel` from Application.
- DI registration in `Arsenal.Infrastructure/Extensions/ServiceCollectionExtensions.cs` (HttpClient for Telegram, singletons for both channels + notifier).
- `ContactCommands.cs`: both handlers call `_notifier.Notify(...)` after `await _db.SaveChangesAsync(ct)`.
- Contracts (`feedback_notifier`, `notification_channel`, `telegram_channel`, `email_channel`) match implementation (fire-and-forget via `Task.Run`, per-channel 10s timeout, skip-unconfigured with warning log, failure logged without propagating).
- No secrets in code (bot token/SMTP creds read from `IConfiguration`; hardcoded values are non-secret defaults — SMTP host/port, feedback recipient address).

No mechanical or structural fixes needed.
