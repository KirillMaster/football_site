using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class PhotoConfiguration : IEntityTypeConfiguration<Photo>
{
    public void Configure(EntityTypeBuilder<Photo> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Url).HasMaxLength(500).IsRequired();
        builder.Property(p => p.ThumbnailUrl).HasMaxLength(500);
        builder.Property(p => p.AltRu).HasMaxLength(300);
        builder.Property(p => p.AltEn).HasMaxLength(300);
        builder.Property(p => p.Tags).HasColumnType("text[]");
        builder.ToTable("photos");
    }
}

public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.TitleRu).HasMaxLength(500);
        builder.Property(v => v.TitleEn).HasMaxLength(500);
        builder.Property(v => v.RutubeId).HasMaxLength(100).IsRequired();
        builder.Property(v => v.YoutubeId).HasMaxLength(100);
        builder.Property(v => v.ThumbnailUrl).HasMaxLength(500);
        builder.Property(v => v.Tags).HasColumnType("text[]");
        builder.ToTable("videos");
    }
}
