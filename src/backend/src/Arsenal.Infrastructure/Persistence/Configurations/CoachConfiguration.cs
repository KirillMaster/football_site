using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class CoachConfiguration : IEntityTypeConfiguration<Coach>
{
    public void Configure(EntityTypeBuilder<Coach> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.NameRu).HasMaxLength(200).IsRequired();
        builder.Property(c => c.NameEn).HasMaxLength(200);
        builder.Property(c => c.PositionRu).HasMaxLength(300);
        builder.Property(c => c.PositionEn).HasMaxLength(300);
        builder.Property(c => c.Photo).HasMaxLength(500);
        builder.Property(c => c.Certifications)
            .HasColumnType("text[]");
        builder.ToTable("coaches");
    }
}
