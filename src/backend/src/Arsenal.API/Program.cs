using Arsenal.Application.Commands;
using Arsenal.Application.Queries;
using Arsenal.Application.Validators;
using Arsenal.Infrastructure.Extensions;
using Arsenal.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Infrastructure (DB, JWT, S3)
builder.Services.AddInfrastructure(builder.Configuration);

// Application handlers
builder.Services.AddScoped<GetPagesQueryHandler>();
builder.Services.AddScoped<GetNewsQueryHandler>();
builder.Services.AddScoped<GetCoachesQueryHandler>();
builder.Services.AddScoped<GetGroupsQueryHandler>();
builder.Services.AddScoped<GetSitemapDataQueryHandler>();
builder.Services.AddScoped<CreateContactMessageCommandHandler>();
builder.Services.AddScoped<CreateTryoutRequestCommandHandler>();
builder.Services.AddScoped<AuthCommandHandler>();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateContactMessageValidator>();

// CORS
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                builder.Configuration["FRONTEND_URL"] ?? "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));

// JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"]
    ?? throw new InvalidOperationException("JWT_SECRET not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT_ISSUER"] ?? "arsenal-api",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT_AUDIENCE"] ?? "arsenal-frontend",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FC Arsenal-92 API",
        Version = "v1",
        Description = "Backend API for FC Arsenal-92 children football school website"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// DB init on startup
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    var seedPath = app.Configuration["SEED_DATA_PATH"]
        ?? Path.Combine(Directory.GetCurrentDirectory(), "seed-data.json");
    await initializer.InitializeAsync(seedPath);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Arsenal API v1"));
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

// Expose for integration tests
public partial class Program { }
