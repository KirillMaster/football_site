using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Arsenal.Infrastructure.Persistence;

public class ArsenalDbContextFactory : IDesignTimeDbContextFactory<ArsenalDbContext>
{
    public ArsenalDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? "Host=localhost;Port=5432;Database=football;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<ArsenalDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ArsenalDbContext(optionsBuilder.Options);
    }
}
