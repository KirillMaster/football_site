using Arsenal.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Arsenal.API.IntegrationTests;

public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Replace real Postgres with InMemory
            services.RemoveAll<DbContextOptions<ArsenalDbContext>>();
            services.RemoveAll<ArsenalDbContext>();

            services.AddDbContext<ArsenalDbContext>(opts =>
                opts.UseInMemoryDatabase("ArsenalTest_" + Guid.NewGuid()));

            // Override env vars for JWT
            Environment.SetEnvironmentVariable("JWT_SECRET", "test-secret-key-minimum-32-characters-long!");
            Environment.SetEnvironmentVariable("DATABASE_URL", "Host=localhost;Database=test");
            Environment.SetEnvironmentVariable("S3_BUCKET", "test-bucket");
            Environment.SetEnvironmentVariable("S3_ACCESS_KEY", "test-key");
            Environment.SetEnvironmentVariable("S3_SECRET_KEY", "test-secret");

            // Ensure DB is created
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
