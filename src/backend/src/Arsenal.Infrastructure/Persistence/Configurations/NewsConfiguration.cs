using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class NewsConfiguration : IEntityTypeConfiguration<News>
{
    public void Configure(EntityTypeBuilder<News> builder)
    {
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(n => n.Slug).IsUnique();
        builder.Property(n => n.TitleRu).HasMaxLength(500).IsRequired();
        builder.Property(n => n.TitleEn).HasMaxLength(500);
        builder.Property(n => n.ExcerptRu).HasMaxLength(1000);
        builder.Property(n => n.ExcerptEn).HasMaxLength(1000);
        builder.Property(n => n.MetaTitle).HasMaxLength(160);
        builder.Property(n => n.MetaDescription).HasMaxLength(300);
        builder.Property(n => n.CoverImage).HasMaxLength(500);
        builder.Property(n => n.Tags).HasColumnType("text[]");
        builder.HasIndex(n => n.PublishedAt);
        builder.HasIndex(n => n.IsPublished);
        builder.ToTable("news");
    }
}
