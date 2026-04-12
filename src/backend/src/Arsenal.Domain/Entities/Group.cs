using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Group : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string AgeRange { get; private set; } = string.Empty;
    public string Level { get; private set; } = string.Empty;
    public int MaxCapacity { get; private set; }
    public string DescriptionRu { get; private set; } = string.Empty;
    public string DescriptionEn { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<Schedule> Schedules { get; private set; } = [];

    private Group() { }

    public static Group Create(string name, string ageRange, string level,
        int maxCapacity, string descriptionRu, string descriptionEn, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required", nameof(name));
        if (maxCapacity <= 0) throw new ArgumentOutOfRangeException(nameof(maxCapacity), "Capacity must be positive");

        return new Group
        {
            Name = name,
            AgeRange = ageRange,
            Level = level,
            MaxCapacity = maxCapacity,
            DescriptionRu = descriptionRu,
            DescriptionEn = descriptionEn,
            IsActive = isActive
        };
    }

    public void Update(string name, string ageRange, string level,
        int maxCapacity, string descriptionRu, string descriptionEn, bool isActive)
    {
        Name = name;
        AgeRange = ageRange;
        Level = level;
        MaxCapacity = maxCapacity;
        DescriptionRu = descriptionRu;
        DescriptionEn = descriptionEn;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
