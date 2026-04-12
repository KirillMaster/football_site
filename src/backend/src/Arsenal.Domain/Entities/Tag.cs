using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class Tag : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;

    private Tag() { }

    public static Tag Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required");

        return new Tag
        {
            Name = name.Trim(),
            Slug = name.Trim().ToLowerInvariant().Replace(' ', '-')
        };
    }
}
