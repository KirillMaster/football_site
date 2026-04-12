using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class PageConfiguration : IEntityTypeConfiguration<Page>
{
    public void Configure(EntityTypeBuilder<Page> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.TitleRu).HasMaxLength(500).IsRequired();
        builder.Property(p => p.TitleEn).HasMaxLength(500);
        builder.Property(p => p.MetaTitleRu).HasMaxLength(160);
        builder.Property(p => p.MetaDescriptionRu).HasMaxLength(300);
        builder.Property(p => p.MetaTitleEn).HasMaxLength(160);
        builder.Property(p => p.MetaDescriptionEn).HasMaxLength(300);
        builder.Property(p => p.OgImage).HasMaxLength(500);
        builder.ToTable("pages");
    }
}
