using Arsenal.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Arsenal.API.IntegrationTests;

public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Inject test config BEFORE services are built (so AddInfrastructure can read them)
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DATABASE_URL"] = "Host=localhost;Database=arsenaltest",
                ["JWT_SECRET"] = "test-secret-key-minimum-32-characters-long!",
                ["JWT_ISSUER"] = "arsenal-api",
                ["JWT_AUDIENCE"] = "arsenal-frontend",
                ["S3_ENDPOINT"] = "https://s3.example.com",
                ["S3_BUCKET"] = "test-bucket",
                ["S3_ACCESS_KEY"] = "test-key",
                ["S3_SECRET_KEY"] = "test-secret"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Replace real Postgres with InMemory
            services.RemoveAll<DbContextOptions<ArsenalDbContext>>();
            services.RemoveAll<ArsenalDbContext>();
            services.AddDbContext<ArsenalDbContext>(opts =>
                opts.UseInMemoryDatabase("ArsenalTest_" + Guid.NewGuid()));

            // Ensure DB is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
