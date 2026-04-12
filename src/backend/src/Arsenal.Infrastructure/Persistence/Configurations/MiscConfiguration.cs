using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class PricingPlanConfiguration : IEntityTypeConfiguration<PricingPlan>
{
    public void Configure(EntityTypeBuilder<PricingPlan> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.NameRu).HasMaxLength(200).IsRequired();
        builder.Property(p => p.NameEn).HasMaxLength(200);
        builder.Property(p => p.Price).HasPrecision(10, 2);
        builder.Property(p => p.Currency).HasMaxLength(10);
        builder.Property(p => p.FeaturesRu).HasColumnType("text[]");
        builder.Property(p => p.FeaturesEn).HasColumnType("text[]");
        builder.ToTable("pricing_plans");
    }
}

public class PartnerConfiguration : IEntityTypeConfiguration<Partner>
{
    public void Configure(EntityTypeBuilder<Partner> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.LogoUrl).HasMaxLength(500);
        builder.Property(p => p.WebsiteUrl).HasMaxLength(500);
        builder.ToTable("partners");
    }
}

public class AchievementConfiguration : IEntityTypeConfiguration<Achievement>
{
    public void Configure(EntityTypeBuilder<Achievement> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.TitleRu).HasMaxLength(500).IsRequired();
        builder.Property(a => a.TitleEn).HasMaxLength(500);
        builder.Property(a => a.ImageUrl).HasMaxLength(500);
        builder.ToTable("achievements");
    }
}

public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.FileName).HasMaxLength(300).IsRequired();
        builder.Property(m => m.StorageKey).HasMaxLength(500).IsRequired();
        builder.HasIndex(m => m.StorageKey).IsUnique();
        builder.Property(m => m.Url).HasMaxLength(500).IsRequired();
        builder.Property(m => m.ContentType).HasMaxLength(100);
        builder.Property(m => m.AltText).HasMaxLength(300);
        builder.ToTable("media_files");
    }
}

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(t => t.Slug).IsUnique();
        builder.ToTable("tags");
    }
}

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(50).IsRequired();
        builder.Property(c => c.Email).HasMaxLength(256);
        builder.Property(c => c.Message).HasMaxLength(2000).IsRequired();
        builder.ToTable("contact_messages");
    }
}

public class TryoutRequestConfiguration : IEntityTypeConfiguration<TryoutRequest>
{
    public void Configure(EntityTypeBuilder<TryoutRequest> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.ChildName).HasMaxLength(200).IsRequired();
        builder.Property(t => t.ParentName).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Phone).HasMaxLength(50).IsRequired();
        builder.Property(t => t.Email).HasMaxLength(256);
        builder.ToTable("tryout_requests");
    }
}

public class PlayerRegistrationConfiguration : IEntityTypeConfiguration<PlayerRegistration>
{
    public void Configure(EntityTypeBuilder<PlayerRegistration> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PlayerFirstName).HasMaxLength(100).IsRequired();
        builder.Property(p => p.PlayerLastName).HasMaxLength(100).IsRequired();
        builder.Property(p => p.ParentName).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Phone).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Email).HasMaxLength(256);
        builder.HasOne(p => p.Group).WithMany()
            .HasForeignKey(p => p.GroupId).OnDelete(DeleteBehavior.SetNull);
        builder.ToTable("player_registrations");
    }
}

public class SiteSettingsConfiguration : IEntityTypeConfiguration<SiteSettings>
{
    public void Configure(EntityTypeBuilder<SiteSettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.SiteNameRu).HasMaxLength(300);
        builder.Property(s => s.SiteNameEn).HasMaxLength(300);
        builder.Property(s => s.PrimaryColor).HasMaxLength(20);
        builder.Property(s => s.SecondaryColor).HasMaxLength(20);
        builder.ToTable("site_settings");
    }
}
