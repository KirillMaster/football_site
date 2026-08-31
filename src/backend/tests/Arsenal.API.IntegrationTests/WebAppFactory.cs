using Arsenal.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Arsenal.API.IntegrationTests;

public class WebAppFactory : WebApplicationFactory<Program>
{
    // Fixed per-factory-instance name: ConfigureWebHost can run more than once for a single
    // WebApplicationFactory (minimal-hosting apps may build the host twice — once for .Services,
    // once for the request-serving TestServer). A Guid generated inline inside ConfigureWebHost
    // would then point .Services and the real HTTP pipeline at two different InMemory databases.
    private readonly string _dbName = "ArsenalTest_" + Guid.NewGuid();

    public WebAppFactory()
    {
        // Set env vars BEFORE host builds — WebApplication.CreateBuilder reads them
        // as a standard config source, so AddInfrastructure won't throw on startup.
        Environment.SetEnvironmentVariable("DATABASE_URL", "Host=localhost;Database=arsenaltest");
        Environment.SetEnvironmentVariable("JWT_SECRET", "test-secret-key-minimum-32-characters-long!");
        Environment.SetEnvironmentVariable("JWT_ISSUER", "arsenal-api");
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", "arsenal-frontend");
        Environment.SetEnvironmentVariable("S3_ENDPOINT", "https://s3.example.com");
        Environment.SetEnvironmentVariable("S3_BUCKET", "test-bucket");
        Environment.SetEnvironmentVariable("S3_ACCESS_KEY", "test-key");
        Environment.SetEnvironmentVariable("S3_SECRET_KEY", "test-secret");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // In EF Core 8+, AddDbContext registers IDbContextOptionsConfiguration<T>
            // which holds the provider action. Removing only DbContextOptions<T> is not
            // enough — we must also remove the configuration actions to prevent dual-provider
            // registration (Npgsql from AddInfrastructure + InMemory added below).
            services.RemoveAll<DbContextOptions<ArsenalDbContext>>();
            services.RemoveAll<ArsenalDbContext>();

            var configType = typeof(IDbContextOptionsConfiguration<ArsenalDbContext>);
            var toRemove = services.Where(d => d.ServiceType == configType).ToList();
            foreach (var d in toRemove)
                services.Remove(d);

            // Register InMemory provider
            services.AddDbContext<ArsenalDbContext>(opts =>
                opts.UseInMemoryDatabase(_dbName));

            // Ensure DB schema is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
