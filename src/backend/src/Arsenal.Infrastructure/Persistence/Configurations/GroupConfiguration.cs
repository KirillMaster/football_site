using Arsenal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arsenal.Infrastructure.Persistence.Configurations;

public class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).HasMaxLength(200).IsRequired();
        builder.Property(g => g.AgeRange).HasMaxLength(100);
        builder.Property(g => g.Level).HasMaxLength(50);
        builder.ToTable("groups");
    }
}

public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Location).HasMaxLength(500).IsRequired();
        builder.Property(s => s.StartTime).HasColumnType("time");
        builder.Property(s => s.EndTime).HasColumnType("time");
        builder.HasOne(s => s.Group).WithMany(g => g.Schedules)
            .HasForeignKey(s => s.GroupId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(s => s.Coach).WithMany()
            .HasForeignKey(s => s.CoachId).OnDelete(DeleteBehavior.Restrict);
        builder.ToTable("schedules");
    }
}
