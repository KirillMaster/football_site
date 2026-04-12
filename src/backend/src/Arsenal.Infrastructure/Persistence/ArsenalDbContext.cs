using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.Infrastructure.Persistence;

public class ArsenalDbContext : DbContext, IArsenalDbContext
{
    public ArsenalDbContext(DbContextOptions<ArsenalDbContext> options) : base(options) { }

    public DbSet<Page> Pages => Set<Page>();
    public DbSet<Coach> Coaches => Set<Coach>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<News> News => Set<News>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<PlayerRegistration> PlayerRegistrations => Set<PlayerRegistration>();
    public DbSet<TryoutRequest> TryoutRequests => Set<TryoutRequest>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PricingPlan> PricingPlans => Set<PricingPlan>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ArsenalDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>()
            .Where(e => e.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
