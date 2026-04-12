using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Application.Interfaces;

public interface IArsenalDbContext
{
    DbSet<Page> Pages { get; }
    DbSet<Coach> Coaches { get; }
    DbSet<Group> Groups { get; }
    DbSet<Schedule> Schedules { get; }
    DbSet<News> News { get; }
    DbSet<Photo> Photos { get; }
    DbSet<Video> Videos { get; }
    DbSet<PlayerRegistration> PlayerRegistrations { get; }
    DbSet<TryoutRequest> TryoutRequests { get; }
    DbSet<ContactMessage> ContactMessages { get; }
    DbSet<Achievement> Achievements { get; }
    DbSet<Partner> Partners { get; }
    DbSet<PricingPlan> PricingPlans { get; }
    DbSet<SiteSettings> SiteSettings { get; }
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<MediaFile> MediaFiles { get; }
    DbSet<Tag> Tags { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
