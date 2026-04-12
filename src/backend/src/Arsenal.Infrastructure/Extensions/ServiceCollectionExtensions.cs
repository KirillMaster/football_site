using Amazon.S3;
using Arsenal.Application.Interfaces;
using Arsenal.Infrastructure.Identity;
using Arsenal.Infrastructure.Persistence;
using Arsenal.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // PostgreSQL / EF Core
        var connectionString = configuration["DATABASE_URL"]
            ?? throw new InvalidOperationException("DATABASE_URL not configured");

        services.AddDbContext<ArsenalDbContext>(opts =>
            opts.UseNpgsql(connectionString, npg =>
                npg.MigrationsAssembly(typeof(ArsenalDbContext).Assembly.FullName)));

        services.AddScoped<IArsenalDbContext>(sp => sp.GetRequiredService<ArsenalDbContext>());
        services.AddScoped<DbInitializer>();

        // JWT
        services.AddScoped<IJwtService, JwtService>();

        // S3
        var s3Endpoint = configuration["S3_ENDPOINT"] ?? "https://s3.twcstorage.ru";
        var s3AccessKey = configuration["S3_ACCESS_KEY"] ?? string.Empty;
        var s3SecretKey = configuration["S3_SECRET_KEY"] ?? string.Empty;

        services.AddSingleton<IAmazonS3>(_ =>
        {
            var s3Config = new AmazonS3Config
            {
                ServiceURL = s3Endpoint,
                ForcePathStyle = true
            };
            return new AmazonS3Client(s3AccessKey, s3SecretKey, s3Config);
        });

        services.AddScoped<IStorageService, S3StorageService>();

        return services;
    }
}
