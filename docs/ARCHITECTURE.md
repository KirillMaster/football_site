# FC Arsenal-92 -- System Architecture Document

Version: 1.0
Date: 2026-04-12
Status: Approved for implementation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [.NET 9 API -- Clean Architecture](#2-net-9-api----clean-architecture)
3. [Next.js 15 Frontend Architecture](#3-nextjs-15-frontend-architecture)
4. [Database Design](#4-database-design)
5. [SEO Architecture](#5-seo-architecture)
6. [Docker and Deployment Architecture](#6-docker-and-deployment-architecture)
7. [Security Architecture](#7-security-architecture)

---

## 1. System Overview

### High-Level Architecture

```
                           +------------------+
                           |     Browser      |
                           +--------+---------+
                                    |
                                    | HTTPS (443)
                                    v
                     +-----------------------------+
                     |    Nginx (Reverse Proxy)     |
                     |  SSL / HTTP2 / Brotli / Gzip |
                     +----+-------+-------+--------+
                          |       |       |
               +----------+  +----+----+  +-----------+
               |             |         |              |
               v             v         v              v
         /api/v1/*      /*        /admin/*      /uploads/*
               |             |         |              |
               v             v         v              v
        +-----------+  +-----------+              (static)
        | .NET API  |  | Next.js   |               Nginx
        | :5000     |  | :3000     |              direct
        +-----------+  +-----------+
               |
               v
        +-----------+
        | PostgreSQL|
        | :5432     |
        +-----------+
```

### Container Topology

| Container    | Image                  | Port  | Purpose                        |
|-------------|------------------------|-------|-------------------------------|
| nginx       | nginx:1.27-alpine      | 80/443| Reverse proxy, SSL, static     |
| nextjs      | node:22-alpine         | 3000  | SSR frontend + admin SPA       |
| dotnet-api  | mcr.microsoft.com/dotnet/aspnet:9.0 | 5000 | REST API     |
| postgres    | postgres:16-alpine     | 5432  | Database                       |

---

## 2. .NET 9 API -- Clean Architecture

### 2.1 Layer Dependency Diagram

```
+--------------------------------------------------+
|                   Arsenal.API                     |
|   Controllers, Middleware, Filters, DI Setup      |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|              Arsenal.Application                  |
|   Commands, Queries, DTOs, Interfaces, Validators |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|               Arsenal.Domain                      |
|   Entities, Value Objects, Enums, Domain Events   |
+--------------------------------------------------+
                        ^
                        |
+--------------------------------------------------+
|            Arsenal.Infrastructure                 |
|   EF Core, Repos, YooKassa, Email, FileStorage   |
+--------------------------------------------------+

Dependency Rule: All layers depend inward toward Domain.
Infrastructure and API reference Application.
Application references only Domain.
Domain references nothing.
```

### 2.2 Domain Layer (`src/backend/Arsenal.Domain/`)

#### Entities

```
Arsenal.Domain/
  Entities/
    Page.cs
    News.cs
    Coach.cs
    TrainingGroup.cs
    Schedule.cs
    PricingPlan.cs
    Booking.cs
    Review.cs
    Gallery.cs
    GalleryItem.cs
    Partner.cs
    Contact.cs
    SiteSettings.cs
    Payment.cs
    AdminUser.cs
    RefreshToken.cs
  ValueObjects/
    LocalizedString.cs      -- { Ru: string, En: string }
    LocalizedText.cs        -- { Ru: string, En: string } (for long HTML content)
    Money.cs                -- { Amount: decimal, Currency: string }
    PhoneNumber.cs
    EmailAddress.cs
    MapCoordinates.cs       -- { Latitude: double, Longitude: double }
    TimeSlot.cs             -- { Start: TimeOnly, End: TimeOnly }
    ImageUrl.cs
    Slug.cs
  Enums/
    BookingStatus.cs        -- New, Confirmed, Cancelled
    PaymentStatus.cs        -- Pending, Success, Failed, Refunded
    AdminRole.cs            -- SuperAdmin, Editor
    DayOfWeekRu.cs          -- Monday..Sunday (for schedule)
    GalleryItemType.cs      -- Photo, Video
    ReviewAuthorRole.cs     -- Parent, Player
  Events/
    BookingCreatedEvent.cs
    BookingStatusChangedEvent.cs
    PaymentCompletedEvent.cs
    NewsPublishedEvent.cs
  Common/
    BaseEntity.cs           -- Id (Guid), CreatedAt, UpdatedAt
    IAuditableEntity.cs
    IDomainEvent.cs
```

#### Key Entity Definitions

```csharp
// Arsenal.Domain/Entities/Page.cs
public class Page : BaseEntity
{
    public Slug Slug { get; private set; }
    public LocalizedString Title { get; private set; }
    public LocalizedText Content { get; private set; }
    public LocalizedString MetaTitle { get; private set; }
    public LocalizedString MetaDescription { get; private set; }
    public ImageUrl? OgImage { get; private set; }
    public bool IsPublished { get; private set; }
    public int SortOrder { get; private set; }
}

// Arsenal.Domain/Entities/Booking.cs
public class Booking : BaseEntity
{
    public string ParentName { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public EmailAddress? Email { get; private set; }
    public string ChildName { get; private set; }
    public int ChildBirthYear { get; private set; }
    public DateOnly? PreferredDate { get; private set; }
    public string? PreferredTimeSlot { get; private set; }
    public Guid? GroupId { get; private set; }
    public TrainingGroup? Group { get; private set; }
    public BookingStatus Status { get; private set; }
    public string? AdminNotes { get; private set; }

    public void Confirm(string? notes)
    {
        Status = BookingStatus.Confirmed;
        AdminNotes = notes;
        AddDomainEvent(new BookingStatusChangedEvent(Id, Status));
    }
}

// Arsenal.Domain/ValueObjects/LocalizedString.cs
public record LocalizedString(string Ru, string En);

// Arsenal.Domain/ValueObjects/Slug.cs
public record Slug
{
    public string Value { get; }
    public Slug(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !Regex.IsMatch(value, @"^[a-z0-9\-]+$"))
            throw new DomainException("Invalid slug format.");
        Value = value;
    }
}
```

### 2.3 Application Layer (`src/backend/Arsenal.Application/`)

```
Arsenal.Application/
  Common/
    Interfaces/
      IApplicationDbContext.cs
      ICurrentUserService.cs
      IDateTimeProvider.cs
      IFileStorageService.cs
      IEmailService.cs
      IPaymentGateway.cs
    Behaviors/
      ValidationBehavior.cs       -- MediatR pipeline, runs FluentValidation
      LoggingBehavior.cs
    Models/
      PaginatedList.cs
      Result.cs                   -- Result<T> pattern for error handling
    Mappings/
      MappingProfile.cs           -- AutoMapper profile
    Exceptions/
      NotFoundException.cs
      ValidationException.cs
      ForbiddenException.cs
  Features/
    Pages/
      Queries/
        GetPageBySlug/
          GetPageBySlugQuery.cs
          GetPageBySlugHandler.cs
          PageDto.cs
        GetAllPages/
          GetAllPagesQuery.cs
          GetAllPagesHandler.cs
      Commands/
        UpsertPage/
          UpsertPageCommand.cs
          UpsertPageHandler.cs
          UpsertPageValidator.cs
    News/
      Queries/
        GetNewsList/
          GetNewsListQuery.cs       -- includes: page, pageSize, tag filter
          GetNewsListHandler.cs
          NewsListItemDto.cs
        GetNewsBySlug/
          GetNewsBySlugQuery.cs
          GetNewsBySlugHandler.cs
          NewsDetailDto.cs
      Commands/
        CreateNews/
          CreateNewsCommand.cs
          CreateNewsHandler.cs
          CreateNewsValidator.cs
        UpdateNews/
          UpdateNewsCommand.cs
          UpdateNewsHandler.cs
        DeleteNews/
          DeleteNewsCommand.cs
          DeleteNewsHandler.cs
    Coaches/
      Queries/
        GetAllCoaches/
          GetAllCoachesQuery.cs
          GetAllCoachesHandler.cs
          CoachDto.cs
      Commands/
        UpsertCoach/
          UpsertCoachCommand.cs
          UpsertCoachHandler.cs
          UpsertCoachValidator.cs
    Schedule/
      Queries/
        GetSchedule/
          GetScheduleQuery.cs
          GetScheduleHandler.cs
          ScheduleDto.cs
      Commands/
        UpsertScheduleEntry/
          UpsertScheduleEntryCommand.cs
          UpsertScheduleEntryHandler.cs
    Pricing/
      Queries/
        GetPricingPlans/
          GetPricingPlansQuery.cs
          GetPricingPlansHandler.cs
          PricingPlanDto.cs
      Commands/
        UpsertPricingPlan/
          UpsertPricingPlanCommand.cs
          UpsertPricingPlanHandler.cs
    Bookings/
      Queries/
        GetBookingsList/
          GetBookingsListQuery.cs
          GetBookingsListHandler.cs
          BookingDto.cs
        GetBookingById/
          GetBookingByIdQuery.cs
          GetBookingByIdHandler.cs
      Commands/
        CreateBooking/
          CreateBookingCommand.cs     -- public-facing, no auth required
          CreateBookingHandler.cs
          CreateBookingValidator.cs
        UpdateBookingStatus/
          UpdateBookingStatusCommand.cs
          UpdateBookingStatusHandler.cs
    Reviews/
      Queries/
        GetPublishedReviews/
          GetPublishedReviewsQuery.cs
          GetPublishedReviewsHandler.cs
          ReviewDto.cs
      Commands/
        UpsertReview/
          UpsertReviewCommand.cs
          UpsertReviewHandler.cs
    Gallery/
      Queries/
        GetGalleries/
          GetGalleriesQuery.cs
          GetGalleriesHandler.cs
          GalleryDto.cs
        GetGalleryItems/
          GetGalleryItemsQuery.cs
          GetGalleryItemsHandler.cs
          GalleryItemDto.cs
      Commands/
        UpsertGallery/
          UpsertGalleryCommand.cs
          UpsertGalleryHandler.cs
        UpsertGalleryItem/
          UpsertGalleryItemCommand.cs
          UpsertGalleryItemHandler.cs
    Partners/
      Queries/
        GetPartners/
          GetPartnersQuery.cs
          GetPartnersHandler.cs
          PartnerDto.cs
      Commands/
        UpsertPartner/
          UpsertPartnerCommand.cs
          UpsertPartnerHandler.cs
    Contacts/
      Queries/
        GetContacts/
          GetContactsQuery.cs
          GetContactsHandler.cs
          ContactsDto.cs
      Commands/
        UpdateContacts/
          UpdateContactsCommand.cs
          UpdateContactsHandler.cs
    SiteSettings/
      Queries/
        GetSiteSettings/
          GetSiteSettingsQuery.cs
          GetSiteSettingsHandler.cs
          SiteSettingsDto.cs
      Commands/
        UpdateSiteSettings/
          UpdateSiteSettingsCommand.cs
          UpdateSiteSettingsHandler.cs
    Auth/
      Commands/
        Login/
          LoginCommand.cs
          LoginHandler.cs
          LoginValidator.cs
          AuthTokenDto.cs         -- { AccessToken, RefreshToken, ExpiresAt }
        RefreshToken/
          RefreshTokenCommand.cs
          RefreshTokenHandler.cs
        ChangePassword/
          ChangePasswordCommand.cs
          ChangePasswordHandler.cs
      Queries/
        GetCurrentUser/
          GetCurrentUserQuery.cs
          GetCurrentUserHandler.cs
          AdminUserDto.cs
    Payments/
      Commands/
        InitiatePayment/
          InitiatePaymentCommand.cs
          InitiatePaymentHandler.cs
        ProcessWebhook/
          ProcessPaymentWebhookCommand.cs
          ProcessPaymentWebhookHandler.cs
      Queries/
        GetPaymentsList/
          GetPaymentsListQuery.cs
          GetPaymentsListHandler.cs
          PaymentDto.cs
    FileUpload/
      Commands/
        UploadFile/
          UploadFileCommand.cs
          UploadFileHandler.cs
          UploadedFileDto.cs        -- { Url, ThumbnailUrl }
    Dashboard/
      Queries/
        GetDashboardStats/
          GetDashboardStatsQuery.cs
          GetDashboardStatsHandler.cs
          DashboardStatsDto.cs    -- { NewBookingsCount, TotalStudents, RecentPayments, ... }
```

#### Key Interface Definitions

```csharp
// Arsenal.Application/Common/Interfaces/IApplicationDbContext.cs
public interface IApplicationDbContext
{
    DbSet<Page> Pages { get; }
    DbSet<News> News { get; }
    DbSet<Coach> Coaches { get; }
    DbSet<TrainingGroup> TrainingGroups { get; }
    DbSet<Schedule> Schedules { get; }
    DbSet<PricingPlan> PricingPlans { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Review> Reviews { get; }
    DbSet<Gallery> Galleries { get; }
    DbSet<GalleryItem> GalleryItems { get; }
    DbSet<Partner> Partners { get; }
    DbSet<Contact> Contacts { get; }
    DbSet<SiteSettings> SiteSettings { get; }
    DbSet<Payment> Payments { get; }
    DbSet<AdminUser> AdminUsers { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

// Arsenal.Application/Common/Interfaces/IFileStorageService.cs
public interface IFileStorageService
{
    Task<UploadedFileDto> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct);
    Task DeleteAsync(string filePath, CancellationToken ct);
    string GetPublicUrl(string filePath);
}

// Arsenal.Application/Common/Interfaces/IPaymentGateway.cs
public interface IPaymentGateway
{
    Task<PaymentInitResult> InitiatePaymentAsync(decimal amount, string currency, string description, string returnUrl, CancellationToken ct);
    Task<PaymentStatusResult> GetPaymentStatusAsync(string providerPaymentId, CancellationToken ct);
    bool ValidateWebhookSignature(string body, string signature);
}

// Arsenal.Application/Common/Interfaces/IEmailService.cs
public interface IEmailService
{
    Task SendBookingConfirmationAsync(string toEmail, string parentName, string childName, CancellationToken ct);
    Task SendBookingNotificationToAdminAsync(Booking booking, CancellationToken ct);
}
```

#### Validator Example

```csharp
// Arsenal.Application/Features/Bookings/Commands/CreateBooking/CreateBookingValidator.cs
public class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.ParentName)
            .NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone)
            .NotEmpty().Matches(@"^\+7\d{10}$").WithMessage("Phone must be in +7XXXXXXXXXX format.");
        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
        RuleFor(x => x.ChildName)
            .NotEmpty().MaximumLength(200);
        RuleFor(x => x.ChildBirthYear)
            .InclusiveBetween(2005, DateTime.UtcNow.Year - 3);
    }
}
```

### 2.4 Infrastructure Layer (`src/backend/Arsenal.Infrastructure/`)

```
Arsenal.Infrastructure/
  Persistence/
    ApplicationDbContext.cs
    Configurations/
      PageConfiguration.cs
      NewsConfiguration.cs
      CoachConfiguration.cs
      TrainingGroupConfiguration.cs
      ScheduleConfiguration.cs
      PricingPlanConfiguration.cs
      BookingConfiguration.cs
      ReviewConfiguration.cs
      GalleryConfiguration.cs
      GalleryItemConfiguration.cs
      PartnerConfiguration.cs
      ContactConfiguration.cs
      SiteSettingsConfiguration.cs
      PaymentConfiguration.cs
      AdminUserConfiguration.cs
      RefreshTokenConfiguration.cs
    Migrations/
    Interceptors/
      AuditableEntityInterceptor.cs   -- auto-sets CreatedAt, UpdatedAt
    Seed/
      DatabaseSeeder.cs               -- seeds initial admin user + default site settings
  Services/
    LocalFileStorageService.cs        -- saves to /uploads/ directory
    YooKassaPaymentGateway.cs
    SmtpEmailService.cs
    DateTimeProvider.cs
    CurrentUserService.cs             -- reads from HttpContext.User claims
  DependencyInjection.cs             -- IServiceCollection.AddInfrastructure()
```

#### DbContext Definition

```csharp
// Arsenal.Infrastructure/Persistence/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _auditInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor auditInterceptor)
        : base(options)
    {
        _auditInterceptor = auditInterceptor;
    }

    public DbSet<Page> Pages => Set<Page>();
    public DbSet<News> News => Set<News>();
    public DbSet<Coach> Coaches => Set<Coach>();
    public DbSet<TrainingGroup> TrainingGroups => Set<TrainingGroup>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<PricingPlan> PricingPlans => Set<PricingPlan>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Gallery> Galleries => Set<Gallery>();
    public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

#### Entity Configuration Example (Value Object Mapping)

```csharp
// Arsenal.Infrastructure/Persistence/Configurations/PageConfiguration.cs
public class PageConfiguration : IEntityTypeConfiguration<Page>
{
    public void Configure(EntityTypeBuilder<Page> builder)
    {
        builder.ToTable("pages");
        builder.HasKey(p => p.Id);

        builder.OwnsOne(p => p.Slug, slug =>
        {
            slug.Property(s => s.Value)
                .HasColumnName("slug")
                .HasMaxLength(200)
                .IsRequired();
            slug.HasIndex(s => s.Value).IsUnique();
        });

        builder.OwnsOne(p => p.Title, t =>
        {
            t.Property(x => x.Ru).HasColumnName("title_ru").HasMaxLength(300).IsRequired();
            t.Property(x => x.En).HasColumnName("title_en").HasMaxLength(300);
        });

        builder.OwnsOne(p => p.Content, c =>
        {
            c.Property(x => x.Ru).HasColumnName("content_ru").HasColumnType("text");
            c.Property(x => x.En).HasColumnName("content_en").HasColumnType("text");
        });

        builder.OwnsOne(p => p.MetaTitle, m =>
        {
            m.Property(x => x.Ru).HasColumnName("meta_title_ru").HasMaxLength(200);
            m.Property(x => x.En).HasColumnName("meta_title_en").HasMaxLength(200);
        });

        builder.OwnsOne(p => p.MetaDescription, m =>
        {
            m.Property(x => x.Ru).HasColumnName("meta_description_ru").HasMaxLength(500);
            m.Property(x => x.En).HasColumnName("meta_description_en").HasMaxLength(500);
        });

        builder.Property(p => p.IsPublished).HasColumnName("is_published").HasDefaultValue(false);
        builder.Property(p => p.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);
    }
}
```

### 2.5 API Layer (`src/backend/Arsenal.API/`)

```
Arsenal.API/
  Controllers/
    Public/
      PagesController.cs           -- GET /api/v1/pages/{slug}
      NewsController.cs            -- GET /api/v1/news, GET /api/v1/news/{slug}
      CoachesController.cs         -- GET /api/v1/coaches
      ScheduleController.cs        -- GET /api/v1/schedule
      PricingController.cs         -- GET /api/v1/pricing
      ReviewsController.cs         -- GET /api/v1/reviews
      GalleryController.cs         -- GET /api/v1/galleries, GET /api/v1/galleries/{id}/items
      PartnersController.cs        -- GET /api/v1/partners
      ContactsController.cs        -- GET /api/v1/contacts
      SiteSettingsController.cs    -- GET /api/v1/settings
      BookingsController.cs        -- POST /api/v1/bookings (public submission)
      SeoController.cs             -- GET /api/v1/seo/sitemap-data
    Admin/
      AdminPagesController.cs      -- CRUD /api/v1/admin/pages
      AdminNewsController.cs       -- CRUD /api/v1/admin/news
      AdminCoachesController.cs    -- CRUD /api/v1/admin/coaches
      AdminScheduleController.cs   -- CRUD /api/v1/admin/schedule
      AdminPricingController.cs    -- CRUD /api/v1/admin/pricing
      AdminBookingsController.cs   -- GET/PATCH /api/v1/admin/bookings
      AdminReviewsController.cs    -- CRUD /api/v1/admin/reviews
      AdminGalleryController.cs    -- CRUD /api/v1/admin/galleries
      AdminPartnersController.cs   -- CRUD /api/v1/admin/partners
      AdminContactsController.cs   -- PUT /api/v1/admin/contacts
      AdminSettingsController.cs   -- PUT /api/v1/admin/settings
      AdminPaymentsController.cs   -- GET /api/v1/admin/payments
      AdminDashboardController.cs  -- GET /api/v1/admin/dashboard
      AdminUsersController.cs      -- CRUD /api/v1/admin/users (superadmin only)
      FileUploadController.cs      -- POST /api/v1/admin/upload
    AuthController.cs              -- POST /api/v1/auth/login, /refresh, /logout
  Middleware/
    ExceptionHandlingMiddleware.cs   -- catches all exceptions, returns ProblemDetails (RFC 7807)
    FeatureGateMiddleware.cs         -- checks SiteSettings.features_enabled, returns 404 if feature off
    RequestLoggingMiddleware.cs      -- logs request/response metadata via Serilog
  Filters/
    ApiKeyOrJwtAuthFilter.cs         -- allows either API key or JWT for admin endpoints
    FeatureRequiredAttribute.cs      -- [FeatureRequired("booking")] attribute for controllers
  Configuration/
    JwtSettings.cs
    YooKassaSettings.cs
    SmtpSettings.cs
    CorsSettings.cs
    FileStorageSettings.cs
  DependencyInjection.cs            -- IServiceCollection.AddApi()
  Program.cs
  appsettings.json
  appsettings.Development.json
```

#### Controller Example

```csharp
// Arsenal.API/Controllers/Public/NewsController.cs
[ApiController]
[Route("api/v1/news")]
[FeatureRequired("blog")]
public class NewsController : ControllerBase
{
    private readonly ISender _mediator;

    public NewsController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<PaginatedList<NewsListItemDto>>> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tag = null)
    {
        var query = new GetNewsListQuery(page, pageSize, tag);
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("{slug}")]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<NewsDetailDto>> GetBySlug(string slug)
    {
        var query = new GetNewsBySlugQuery(slug);
        var result = await _mediator.Send(query);
        return result is null ? NotFound() : Ok(result);
    }
}
```

#### DI Registration (Program.cs structure)

```csharp
// Arsenal.API/Program.cs (key registration order)
var builder = WebApplication.CreateBuilder(args);

// 1. Application layer: MediatR, AutoMapper, FluentValidation
builder.Services.AddApplication();

// 2. Infrastructure layer: DbContext, Repositories, External Services
builder.Services.AddInfrastructure(builder.Configuration);

// 3. API layer: Controllers, Auth, CORS, Swagger
builder.Services.AddApi(builder.Configuration);

// 4. Serilog
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

var app = builder.Build();

// Middleware pipeline (order matters)
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("DefaultPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply migrations on startup in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(db);
}

app.Run();
```

### 2.6 NuGet Dependencies

| Package                              | Layer          | Purpose                      |
|--------------------------------------|---------------|------------------------------|
| MediatR                             | Application    | CQRS command/query dispatch  |
| FluentValidation.DependencyInjectionExtensions | Application | Input validation     |
| AutoMapper                          | Application    | Entity-to-DTO mapping        |
| Npgsql.EntityFrameworkCore.PostgreSQL | Infrastructure | PostgreSQL provider         |
| Microsoft.EntityFrameworkCore.Design | Infrastructure | Migration tooling            |
| BCrypt.Net-Next                     | Infrastructure | Password hashing             |
| Microsoft.AspNetCore.Authentication.JwtBearer | API | JWT authentication          |
| Serilog.AspNetCore                  | API            | Structured logging           |
| Swashbuckle.AspNetCore              | API            | Swagger/OpenAPI docs         |

---

## 3. Next.js 15 Frontend Architecture

### 3.1 App Router Structure

```
src/frontend/
  app/
    [locale]/                         # Dynamic segment: 'ru' | 'en'
      layout.tsx                      # Root layout: html lang, fonts, analytics, nav, footer
      page.tsx                        # Home (/)
      loading.tsx                     # Loading skeleton (shared)
      not-found.tsx                   # 404 page
      about/
        page.tsx                      # /about
      coaches/
        page.tsx                      # /coaches
      schedule/
        page.tsx                      # /schedule
      pricing/
        page.tsx                      # /pricing
      news/
        page.tsx                      # /news (list)
        [slug]/
          page.tsx                    # /news/some-article
      gallery/
        page.tsx                      # /gallery (albums list)
        [id]/
          page.tsx                    # /gallery/123 (album detail)
      booking/
        page.tsx                      # /booking
      contacts/
        page.tsx                      # /contacts
    admin/                            # Route group -- NO [locale] wrapper
      layout.tsx                      # Admin shell: sidebar, topbar, auth guard
      login/
        page.tsx
      dashboard/
        page.tsx
      pages/
        page.tsx
        [id]/
          page.tsx                    # Edit page
      news/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
      coaches/
        page.tsx
        [id]/
          page.tsx
      schedule/
        page.tsx
      pricing/
        page.tsx
        [id]/
          page.tsx
      bookings/
        page.tsx
        [id]/
          page.tsx
      reviews/
        page.tsx
        [id]/
          page.tsx
      gallery/
        page.tsx
        [id]/
          page.tsx
      partners/
        page.tsx
      contacts/
        page.tsx
      settings/
        page.tsx
      payments/
        page.tsx
      users/
        page.tsx
    sitemap.ts                        # Dynamic sitemap generation (route handler)
    robots.ts                         # Robots.txt generation (route handler)
  components/
    shared/
      Header.tsx                      # Main navigation, logo, locale switch, phone CTA
      Footer.tsx                      # Contacts, social links, copyright
      LocaleSwitcher.tsx
      Breadcrumbs.tsx
      SEOHead.tsx                     # Generates meta tags, OG, JSON-LD per page
      HeroSection.tsx                 # Reusable hero with background image + overlay
      SectionHeading.tsx
      Card.tsx
      Button.tsx
      Modal.tsx
      Pagination.tsx
      FormField.tsx
      PhoneInput.tsx
      LoadingSkeleton.tsx
      ImageOptimized.tsx              # Wraps next/image with blur placeholder
      VideoEmbed.tsx                  # YouTube lazy-load embed
      YandexMap.tsx                   # Yandex Maps widget (contacts page)
      GoogleMap.tsx                   # Google Maps embed (contacts page)
      AnimatedSection.tsx             # Intersection Observer fade-in
      FeatureGate.tsx                 # Conditionally renders children based on features_enabled
    pages/
      home/
        HeroHome.tsx                  # Full-screen hero with CTA
        AdvantagesList.tsx            # 10 advantages from spec
        QuickStats.tsx                # "Regular training", "Sports complex", "Tournaments"
        ReviewsCarousel.tsx           # Slider of reviews
        CTABooking.tsx                # "Book a free trial" section
        LatestNews.tsx                # 3 most recent news cards
        PartnersStrip.tsx             # Partner logos horizontal scroll
      about/
        AboutContent.tsx              # Rich text content from CMS
        CoachHighlight.tsx            # Director / head coach card
        PhilosophyBlock.tsx
      coaches/
        CoachCard.tsx                 # Photo, name, position, certifications
        CoachGrid.tsx
      schedule/
        ScheduleTable.tsx             # Grouped by day, filterable by group
        ScheduleFilters.tsx
      pricing/
        PricingCard.tsx               # 3 plans: Standard, Standard+, Pro
        PricingGrid.tsx
        PricingFeatureList.tsx
      news/
        NewsCard.tsx
        NewsGrid.tsx
        NewsArticle.tsx               # Full article view with cover image
        NewsTagFilter.tsx
      gallery/
        GalleryAlbumCard.tsx
        GalleryGrid.tsx
        GalleryLightbox.tsx           # Fullscreen photo viewer
      booking/
        BookingForm.tsx               # Multi-step: child info -> date picker -> confirm
        DateSlotPicker.tsx
        BookingConfirmation.tsx
      contacts/
        ContactInfo.tsx               # Phones, email, address, transport
        SocialLinks.tsx
        ContactForm.tsx               # "Callback request" form
        MapSection.tsx                # Yandex + Google maps
    admin/
      AdminLayout.tsx                 # Sidebar + topbar shell
      AdminSidebar.tsx
      AdminTopbar.tsx
      DataTable.tsx                   # Generic sortable/filterable table
      FormBuilder.tsx                 # Generic form with fields from schema
      RichTextEditor.tsx              # WYSIWYG for content_ru / content_en
      ImageUploader.tsx               # Drag-drop, preview, upload to /api/v1/admin/upload
      LocalizedFieldPair.tsx          # Side-by-side RU / EN inputs
      StatusBadge.tsx                 # Booking status, payment status badges
      StatsCard.tsx                   # Dashboard metric card
      ConfirmDialog.tsx
      FeatureToggle.tsx               # On/off switch for SiteSettings.features_enabled
  lib/
    api/
      client.ts                       # Base fetch wrapper with auth token injection
      types.ts                        # TypeScript types matching backend DTOs
      pages.ts                        # getPageBySlug(slug): Promise<PageDto>
      news.ts                         # getNewsList(params), getNewsBySlug(slug)
      coaches.ts                      # getCoaches(): Promise<CoachDto[]>
      schedule.ts                     # getSchedule(): Promise<ScheduleDto[]>
      pricing.ts                      # getPricingPlans(): Promise<PricingPlanDto[]>
      reviews.ts                      # getPublishedReviews(): Promise<ReviewDto[]>
      gallery.ts                      # getGalleries(), getGalleryItems(id)
      partners.ts                     # getPartners(): Promise<PartnerDto[]>
      contacts.ts                     # getContacts(): Promise<ContactsDto>
      settings.ts                     # getSiteSettings(): Promise<SiteSettingsDto>
      bookings.ts                     # createBooking(data), admin CRUD
      auth.ts                         # login(email, password), refresh(), logout()
      upload.ts                       # uploadFile(file): Promise<UploadedFileDto>
      payments.ts                     # admin: getPayments()
      dashboard.ts                    # admin: getDashboardStats()
    hooks/
      useAuth.ts                      # Auth context: token, user, login/logout
      useSiteSettings.ts              # Fetches and caches site settings
      useFeatureEnabled.ts            # Check if feature is enabled
      useLocale.ts                    # Current locale from next-intl
      usePagination.ts
      useDebounce.ts
    utils/
      formatDate.ts
      formatPhone.ts
      formatPrice.ts
      cn.ts                           # clsx + tailwind-merge helper
      generateJsonLd.ts              # Schema.org JSON-LD builder functions
  messages/
    ru.json                           # All UI strings in Russian
    en.json                           # All UI strings in English
  middleware.ts                       # next-intl middleware: locale detection, redirect
  i18n.ts                             # next-intl config
  tailwind.config.ts
  next.config.ts
```

### 3.2 Rendering Strategy Per Page

| Route              | Strategy     | Revalidation | Rationale                                    |
|--------------------|-------------|-------------|----------------------------------------------|
| `/`                | SSG + ISR   | 300s (5min) | Mostly static, CTA hero, advantages          |
| `/about`           | SSG + ISR   | 3600s (1hr) | Content changes rarely                       |
| `/coaches`         | SSG + ISR   | 3600s       | Coach roster changes infrequently            |
| `/schedule`        | SSR          | --          | Must reflect real-time schedule               |
| `/pricing`         | SSG + ISR   | 1800s       | Price changes are admin-triggered            |
| `/news`            | SSR          | --          | Paginated, filterable list                    |
| `/news/[slug]`     | SSR          | --          | Individual articles, SEO-critical             |
| `/gallery`         | SSR          | --          | Dynamic album listing                         |
| `/gallery/[id]`    | SSR          | --          | Album contents change with uploads            |
| `/booking`         | SSR          | --          | Needs live schedule slot data                 |
| `/contacts`        | SSG + ISR   | 3600s       | Rarely changes                                |
| `/admin/*`         | CSR (SPA)   | --          | Client-only, auth-gated, no SSR needed        |
| `/sitemap.xml`     | Dynamic     | --          | Generated on every request                    |
| `/robots.txt`      | Static      | --          | Fixed rules                                   |

ISR pages use `revalidate` in the page's fetch call:

```typescript
// app/[locale]/page.tsx (Home)
export default async function HomePage({ params }: { params: { locale: string } }) {
  const [settings, reviews, news, partners, coaches] = await Promise.all([
    getSiteSettings({ next: { revalidate: 300 } }),
    getPublishedReviews({ next: { revalidate: 300 } }),
    getNewsList({ page: 1, pageSize: 3 }, { next: { revalidate: 300 } }),
    getPartners({ next: { revalidate: 300 } }),
    getCoaches({ next: { revalidate: 300 } }),
  ]);

  return (
    <>
      <SEOHead page="home" settings={settings} locale={params.locale} />
      <HeroHome />
      <AdvantagesList />
      <QuickStats />
      <FeatureGate feature="reviews"><ReviewsCarousel reviews={reviews} /></FeatureGate>
      <FeatureGate feature="blog"><LatestNews news={news.items} /></FeatureGate>
      <PartnersStrip partners={partners} />
      <CTABooking />
    </>
  );
}
```

### 3.3 API Client Layer

```typescript
// src/frontend/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://dotnet-api:5000';
const INTERNAL_API_BASE = process.env.API_INTERNAL_URL || 'http://dotnet-api:5000';

type FetchOptions = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
  isServerSide = false,
): Promise<T> {
  const base = isServerSide ? INTERNAL_API_BASE : API_BASE;
  const url = `${base}/api/v1${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Inject auth token for admin requests (client-side)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(res.status, problem?.title || res.statusText, problem);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public problemDetails?: ProblemDetails,
  ) {
    super(message);
  }
}

// src/frontend/lib/api/types.ts
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}

export interface PageDto {
  id: string;
  slug: string;
  titleRu: string;
  titleEn: string;
  contentRu: string;
  contentEn: string;
  metaTitleRu: string;
  metaDescriptionRu: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  ogImage: string | null;
  isPublished: boolean;
  sortOrder: number;
}

// ... all other DTOs mirror backend exactly
```

### 3.4 Admin Panel Architecture

The admin panel is a client-side rendered SPA within the Next.js app using a route group.

```
/admin/layout.tsx  -- checks auth, redirects to /admin/login if no token
/admin/login/page.tsx  -- standalone page, no sidebar
/admin/dashboard/page.tsx  -- protected, shows stats
```

#### Auth Guard Pattern

```typescript
// app/admin/layout.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) return <LoadingSkeleton />;

  if (!user && pathname !== '/admin/login') {
    router.replace('/admin/login');
    return null;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
```

#### Admin Sidebar Navigation

```typescript
const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'News', href: '/admin/news', icon: Newspaper, feature: 'blog' },
  { label: 'Coaches', href: '/admin/coaches', icon: Users },
  { label: 'Schedule', href: '/admin/schedule', icon: Calendar },
  { label: 'Pricing', href: '/admin/pricing', icon: CreditCard },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList, feature: 'booking' },
  { label: 'Reviews', href: '/admin/reviews', icon: Star, feature: 'reviews' },
  { label: 'Gallery', href: '/admin/gallery', icon: Image, feature: 'gallery' },
  { label: 'Partners', href: '/admin/partners', icon: Handshake },
  { label: 'Contacts', href: '/admin/contacts', icon: Phone },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Payments', href: '/admin/payments', icon: Wallet, feature: 'payments' },
  { label: 'Users', href: '/admin/users', icon: Shield, role: 'superadmin' },
];
```

### 3.5 i18n Configuration

```typescript
// src/frontend/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',  // /about = ru, /en/about = en
});

export const config = {
  matcher: ['/((?!api|admin|_next|uploads|.*\\..*).*)'],
};
```

The `localePrefix: 'as-needed'` means Russian URLs have no prefix (clean `/about`), while English URLs get `/en/about`. The `/admin` route is excluded from locale middleware entirely.

### 3.6 Key Frontend Dependencies

| Package              | Purpose                              |
|---------------------|--------------------------------------|
| next@15             | Framework                            |
| react@19            | UI library                           |
| next-intl           | i18n routing + translations          |
| tailwindcss         | Utility-first CSS                    |
| @headlessui/react   | Accessible unstyled components       |
| lucide-react        | Icons                                |
| react-hook-form     | Form management                      |
| zod                 | Client-side validation               |
| date-fns            | Date formatting                      |
| swiper              | Reviews carousel                     |
| yet-another-react-lightbox | Gallery lightbox              |
| tiptap              | Rich text editor (admin)             |

---

## 4. Database Design

### 4.1 Complete Schema with Indexes and Constraints

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for full-text search

-- ============================================================
-- PAGES
-- ============================================================
CREATE TABLE pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(200) NOT NULL,
    title_ru        VARCHAR(300) NOT NULL,
    title_en        VARCHAR(300),
    content_ru      TEXT,
    content_en      TEXT,
    meta_title_ru   VARCHAR(200),
    meta_description_ru VARCHAR(500),
    meta_title_en   VARCHAR(200),
    meta_description_en VARCHAR(500),
    og_image        VARCHAR(500),
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pages_slug UNIQUE (slug),
    CONSTRAINT ck_pages_slug_format CHECK (slug ~ '^[a-z0-9\-]+$')
);

CREATE INDEX idx_pages_is_published ON pages (is_published) WHERE is_published = TRUE;
CREATE INDEX idx_pages_sort_order ON pages (sort_order);

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE news (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(300) NOT NULL,
    title_ru        VARCHAR(500) NOT NULL,
    title_en        VARCHAR(500),
    excerpt_ru      VARCHAR(1000),
    excerpt_en      VARCHAR(1000),
    content_ru      TEXT,
    content_en      TEXT,
    cover_image     VARCHAR(500),
    meta_title      VARCHAR(200),
    meta_description VARCHAR(500),
    tags            TEXT[] DEFAULT '{}',
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_news_slug UNIQUE (slug),
    CONSTRAINT ck_news_slug_format CHECK (slug ~ '^[a-z0-9\-]+$')
);

CREATE INDEX idx_news_published ON news (published_at DESC) WHERE is_published = TRUE;
CREATE INDEX idx_news_tags ON news USING GIN (tags);
CREATE INDEX idx_news_slug ON news (slug);

-- ============================================================
-- COACHES
-- ============================================================
CREATE TABLE coaches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ru         VARCHAR(300) NOT NULL,
    name_en         VARCHAR(300),
    position_ru     VARCHAR(300),
    position_en     VARCHAR(300),
    bio_ru          TEXT,
    bio_en          TEXT,
    photo           VARCHAR(500),
    certifications  TEXT[] DEFAULT '{}',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_active_sort ON coaches (sort_order) WHERE is_active = TRUE;

-- ============================================================
-- TRAINING GROUPS
-- ============================================================
CREATE TABLE training_groups (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    age_range       VARCHAR(50),
    level           VARCHAR(100),
    max_capacity    INTEGER,
    description_ru  TEXT,
    description_en  TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_training_groups_capacity CHECK (max_capacity IS NULL OR max_capacity > 0)
);

CREATE INDEX idx_training_groups_active ON training_groups (is_active) WHERE is_active = TRUE;

-- ============================================================
-- SCHEDULE
-- ============================================================
CREATE TABLE schedule (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id        UUID NOT NULL REFERENCES training_groups(id) ON DELETE CASCADE,
    coach_id        UUID REFERENCES coaches(id) ON DELETE SET NULL,
    day_of_week     SMALLINT NOT NULL,  -- 0=Monday .. 6=Sunday
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    location        VARCHAR(300),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT ck_schedule_day CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT ck_schedule_time CHECK (end_time > start_time)
);

CREATE INDEX idx_schedule_group ON schedule (group_id) WHERE is_active = TRUE;
CREATE INDEX idx_schedule_coach ON schedule (coach_id) WHERE is_active = TRUE;
CREATE INDEX idx_schedule_day ON schedule (day_of_week) WHERE is_active = TRUE;

-- ============================================================
-- PRICING PLANS
-- ============================================================
CREATE TABLE pricing_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ru         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    price           DECIMAL(10, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'RUB',
    sessions_count  INTEGER,
    description_ru  TEXT,
    description_en  TEXT,
    features_ru     TEXT[] DEFAULT '{}',
    features_en     TEXT[] DEFAULT '{}',
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_pricing_price CHECK (price >= 0),
    CONSTRAINT ck_pricing_sessions CHECK (sessions_count IS NULL OR sessions_count > 0)
);

CREATE INDEX idx_pricing_active_sort ON pricing_plans (sort_order) WHERE is_active = TRUE;

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_name         VARCHAR(200) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    email               VARCHAR(255),
    child_name          VARCHAR(200) NOT NULL,
    child_birth_year    INTEGER NOT NULL,
    preferred_date      DATE,
    preferred_time_slot VARCHAR(100),
    group_id            UUID REFERENCES training_groups(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'new',
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_bookings_status CHECK (status IN ('new', 'confirmed', 'cancelled')),
    CONSTRAINT ck_bookings_birth_year CHECK (child_birth_year BETWEEN 2000 AND 2025)
);

CREATE INDEX idx_bookings_status ON bookings (status, created_at DESC);
CREATE INDEX idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX idx_bookings_phone ON bookings (phone);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name     VARCHAR(200) NOT NULL,
    author_role     VARCHAR(20) NOT NULL DEFAULT 'parent',
    text_ru         TEXT NOT NULL,
    text_en         TEXT,
    rating          SMALLINT NOT NULL DEFAULT 5,
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT ck_reviews_role CHECK (author_role IN ('parent', 'player'))
);

CREATE INDEX idx_reviews_published ON reviews (sort_order) WHERE is_published = TRUE;

-- ============================================================
-- GALLERY
-- ============================================================
CREATE TABLE galleries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ru        VARCHAR(300) NOT NULL,
    title_en        VARCHAR(300),
    description_ru  TEXT,
    description_en  TEXT,
    cover_image     VARCHAR(500),
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_galleries_published ON galleries (created_at DESC) WHERE is_published = TRUE;

CREATE TABLE gallery_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id      UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    type            VARCHAR(10) NOT NULL DEFAULT 'photo',
    url             VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    caption_ru      VARCHAR(500),
    caption_en      VARCHAR(500),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_gallery_items_type CHECK (type IN ('photo', 'video'))
);

CREATE INDEX idx_gallery_items_gallery ON gallery_items (gallery_id, sort_order);

-- ============================================================
-- PARTNERS
-- ============================================================
CREATE TABLE partners (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    logo_url        VARCHAR(500),
    website_url     VARCHAR(500),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_active ON partners (sort_order) WHERE is_active = TRUE;

-- ============================================================
-- CONTACTS (singleton row)
-- ============================================================
CREATE TABLE contacts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phones              TEXT[] NOT NULL DEFAULT '{}',
    emails              TEXT[] DEFAULT '{}',
    address_ru          TEXT,
    address_en          TEXT,
    map_latitude        DOUBLE PRECISION,
    map_longitude       DOUBLE PRECISION,
    transport_info_ru   TEXT,
    transport_info_en   TEXT,
    vk_url              VARCHAR(500),
    telegram_url        VARCHAR(500),
    youtube_url         VARCHAR(500),
    instagram_url       VARCHAR(500),
    dzen_url            VARCHAR(500),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SITE SETTINGS (singleton row)
-- ============================================================
CREATE TABLE site_settings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name_ru            VARCHAR(300) NOT NULL DEFAULT 'ДФК Арсенал',
    site_name_en            VARCHAR(300) DEFAULT 'FC Arsenal Youth Academy',
    logo_url                VARCHAR(500),
    favicon_url             VARCHAR(500),
    primary_color           VARCHAR(7) DEFAULT '#E10005',
    secondary_color         VARCHAR(7) DEFAULT '#101A7A',
    yandex_metrika_id       VARCHAR(50),
    google_analytics_id     VARCHAR(50),
    yandex_verification     VARCHAR(200),
    google_verification     VARCHAR(200),
    features_enabled        JSONB NOT NULL DEFAULT '{"booking": true, "blog": true, "gallery": true, "payments": false, "reviews": true, "i18n": false}',
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id              UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount                  DECIMAL(10, 2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'RUB',
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending',
    provider_payment_id     VARCHAR(200),
    provider_data           JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_payments_status CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    CONSTRAINT ck_payments_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_booking ON payments (booking_id);
CREATE INDEX idx_payments_status ON payments (status, created_at DESC);
CREATE INDEX idx_payments_provider_id ON payments (provider_payment_id) WHERE provider_payment_id IS NOT NULL;

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'editor',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_admin_users_email UNIQUE (email),
    CONSTRAINT ck_admin_users_role CHECK (role IN ('superadmin', 'editor'))
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ,

    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;
```

### 4.2 Entity Relationship Diagram

```
admin_users 1---* refresh_tokens          (user has many tokens)
training_groups 1---* schedule             (group has many schedule entries)
coaches 1---* schedule                     (coach assigned to schedule entries)
training_groups 1---* bookings             (booking optionally linked to group)
bookings 1---* payments                    (booking can have payment attempts)
galleries 1---* gallery_items              (album contains many items)
contacts -- singleton                      (single row, always id=1)
site_settings -- singleton                 (single row, always id=1)

All other tables (pages, news, coaches, pricing_plans, reviews, partners)
are standalone -- no FK relationships to each other.
```

### 4.3 Migration Strategy

EF Core code-first migrations, managed via dotnet CLI.

**Workflow:**

1. Modify entity or configuration class
2. Generate migration: `dotnet ef migrations add <MigrationName> -p Arsenal.Infrastructure -s Arsenal.API`
3. Review generated SQL in migration file
4. Apply locally: `dotnet ef database update -s Arsenal.API`
5. On deployment: `ApplicationDbContext.Database.MigrateAsync()` runs automatically at container startup (production mode uses a one-time init container or startup migration)

**Migration naming convention:** `YYYYMMDD_HHMMSS_DescriptiveName` (e.g., `20260412_120000_InitialCreate`)

**Seed data** applied after migration via `DatabaseSeeder.SeedAsync()`:
- Default superadmin user (email: admin@arsenal92.ru, bcrypt password)
- Default SiteSettings row with Arsenal colors and feature flags
- Default Contacts row with phone numbers and social links from spec

---

## 5. SEO Architecture

### 5.1 Schema.org JSON-LD Generation Strategy

Each page type generates specific JSON-LD schemas. Generation happens server-side in Next.js layout/page components.

```typescript
// src/frontend/lib/utils/generateJsonLd.ts

export function generateSportsClubJsonLd(
  settings: SiteSettingsDto,
  contacts: ContactsDto,
): SportsClubSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    '@id': `${SITE_URL}/#organization`,
    name: 'ДФК Арсенал',
    alternateName: 'FC Arsenal-92',
    description: 'Детский футбольный клуб в Севастополе для детей от 6 до 14 лет',
    url: SITE_URL,
    logo: `${SITE_URL}${settings.logoUrl}`,
    telephone: contacts.phones[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Косарева, д.12',
      addressLocality: 'Севастополь',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: contacts.mapLatitude,
      longitude: contacts.mapLongitude,
    },
    sport: 'Football',
    sameAs: [
      contacts.vkUrl,
      contacts.telegramUrl,
      contacts.youtubeUrl,
    ].filter(Boolean),
  };
}

export function generateCourseJsonLd(plan: PricingPlanDto): CourseSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: plan.nameRu,
    description: plan.descriptionRu,
    provider: { '@type': 'SportsClub', '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      price: plan.price.toString(),
      priceCurrency: plan.currency,
      availability: 'https://schema.org/InStock',
    },
  };
}

export function generatePersonJsonLd(coach: CoachDto): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: coach.nameRu,
    jobTitle: coach.positionRu,
    image: coach.photo ? `${SITE_URL}${coach.photo}` : undefined,
    worksFor: { '@type': 'SportsClub', '@id': `${SITE_URL}/#organization` },
  };
}

export function generateReviewJsonLd(reviews: ReviewDto[]): AggregateRatingSchema {
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    '@id': `${SITE_URL}/#organization`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
      },
      reviewBody: r.textRu,
    })),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateNewsArticleJsonLd(news: NewsDetailDto): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.titleRu,
    image: news.coverImage ? `${SITE_URL}${news.coverImage}` : undefined,
    datePublished: news.publishedAt,
    dateModified: news.updatedAt,
    author: { '@type': 'SportsClub', '@id': `${SITE_URL}/#organization` },
    publisher: {
      '@type': 'Organization',
      name: 'ДФК Арсенал',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };
}
```

**Page-to-Schema mapping:**

| Page             | JSON-LD Schemas                                 |
|-----------------|--------------------------------------------------|
| `/` (Home)       | SportsClub, LocalBusiness, AggregateRating       |
| `/about`         | SportsClub, BreadcrumbList                       |
| `/coaches`       | Person (per coach), BreadcrumbList               |
| `/pricing`       | Course (per plan), BreadcrumbList                |
| `/news`          | ItemList (news), BreadcrumbList                  |
| `/news/[slug]`   | NewsArticle, BreadcrumbList                      |
| `/contacts`      | LocalBusiness, BreadcrumbList                    |
| `/booking`       | BreadcrumbList                                   |
| `/gallery`       | ImageGallery, BreadcrumbList                     |

### 5.2 Sitemap and Robots Generation

```typescript
// src/frontend/app/sitemap.ts
import { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, news, galleries] = await Promise.all([
    apiFetch<PageDto[]>('/pages', {}, true),
    apiFetch<NewsListItemDto[]>('/news?pageSize=1000', {}, true),
    apiFetch<GalleryDto[]>('/galleries', {}, true),
  ]);

  const staticRoutes = [
    '', '/about', '/coaches', '/schedule', '/pricing',
    '/news', '/gallery', '/booking', '/contacts',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages in both locales
  for (const route of staticRoutes) {
    entries.push({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: { ru: `${SITE_URL}${route}`, en: `${SITE_URL}/en${route}` },
      },
    });
  }

  // Dynamic news pages
  for (const article of news) {
    entries.push({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: article.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          ru: `${SITE_URL}/news/${article.slug}`,
          en: `${SITE_URL}/en/news/${article.slug}`,
        },
      },
    });
  }

  // Gallery albums
  for (const album of galleries) {
    entries.push({
      url: `${SITE_URL}/gallery/${album.id}`,
      lastModified: album.createdAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return entries;
}

// src/frontend/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

### 5.3 Meta Tags Management

Meta tags are stored in the database per page/entity and rendered server-side.

```typescript
// src/frontend/app/[locale]/news/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsBySlug(params.slug);
  if (!news) return {};

  const isRu = params.locale === 'ru';
  const title = isRu ? news.metaTitle || news.titleRu : news.metaTitleEn || news.titleEn || news.titleRu;
  const description = isRu ? news.metaDescription : news.metaDescriptionEn || news.metaDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: news.coverImage ? [{ url: `${SITE_URL}${news.coverImage}` }] : [],
      type: 'article',
      locale: isRu ? 'ru_RU' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${params.locale}/news/${params.slug}`,
      languages: {
        ru: `${SITE_URL}/news/${params.slug}`,
        en: `${SITE_URL}/en/news/${params.slug}`,
      },
    },
  };
}
```

The root layout injects Yandex Metrika and Google Analytics scripts using SiteSettings:

```typescript
// src/frontend/app/[locale]/layout.tsx
export default async function RootLayout({ children, params }: Props) {
  const settings = await getSiteSettings({ next: { revalidate: 3600 } });

  return (
    <html lang={params.locale}>
      <head>
        {settings.yandexVerification && (
          <meta name="yandex-verification" content={settings.yandexVerification} />
        )}
        {settings.googleVerification && (
          <meta name="google-site-verification" content={settings.googleVerification} />
        )}
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        {settings.yandexMetrikaId && <YandexMetrika id={settings.yandexMetrikaId} />}
        {settings.googleAnalyticsId && <GoogleAnalytics id={settings.googleAnalyticsId} />}
      </body>
    </html>
  );
}
```

### 5.4 Core Web Vitals Optimization Strategy

| Metric | Target    | Strategy                                                    |
|--------|----------|-------------------------------------------------------------|
| LCP    | < 2.5s   | Hero images: `priority` prop on next/image, preload key images in `<head>`, WebP/AVIF via next/image, CDN caching via Nginx 30-day cache headers |
| FID/INP| < 100ms  | Minimal JS on initial load, defer analytics scripts, use `dynamic()` imports for heavy components (lightbox, rich editor, maps), code-split admin from public |
| CLS    | < 0.1    | All images have explicit `width`/`height` or `aspect-ratio`, font-display: swap with preloaded WOFF2, skeleton placeholders match final layout dimensions |

**Image optimization pipeline:**
1. Admin uploads image via `FileUploadController`
2. Backend generates thumbnail (400px width) using ImageSharp
3. Original stored as-is; Next.js `<Image>` component handles WebP/AVIF conversion at serve time
4. Nginx caches `/uploads/*` with 30-day max-age

**Font loading:**
```css
/* Preload primary font in layout head */
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

**Analytics script deferral:**
- Yandex Metrika and Google Analytics loaded via `<Script strategy="afterInteractive" />`

---

## 6. Docker and Deployment Architecture

### 6.1 Docker Compose

```yaml
# docker-compose.yml (development)
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: arsenal-postgres
    environment:
      POSTGRES_DB: arsenal_db
      POSTGRES_USER: arsenal
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arsenal -d arsenal_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - arsenal-net

  dotnet-api:
    build:
      context: ./src/backend
      dockerfile: Arsenal.API/Dockerfile
    container_name: arsenal-api
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:5000
      ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=arsenal_db;Username=arsenal;Password=${POSTGRES_PASSWORD}"
      Jwt__Key: ${JWT_SECRET}
      Jwt__Issuer: arsenal-api
      Jwt__Audience: arsenal-web
      Jwt__AccessTokenExpirationMinutes: 30
      Jwt__RefreshTokenExpirationDays: 7
      YooKassa__ShopId: ${YOOKASSA_SHOP_ID}
      YooKassa__SecretKey: ${YOOKASSA_SECRET_KEY}
      Smtp__Host: ${SMTP_HOST}
      Smtp__Port: ${SMTP_PORT}
      Smtp__Username: ${SMTP_USERNAME}
      Smtp__Password: ${SMTP_PASSWORD}
      FileStorage__BasePath: /app/uploads
      FileStorage__MaxFileSizeMb: 10
    volumes:
      - uploads_data:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    restart: unless-stopped
    networks:
      - arsenal-net

  nextjs:
    build:
      context: ./src/frontend
      dockerfile: Dockerfile
    container_name: arsenal-nextjs
    environment:
      NODE_ENV: production
      API_INTERNAL_URL: http://dotnet-api:5000
      NEXT_PUBLIC_API_URL: /api/v1
      NEXT_PUBLIC_SITE_URL: ${SITE_URL}
    ports:
      - "3000:3000"
    depends_on:
      dotnet-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - arsenal-net

  nginx:
    image: nginx:1.27-alpine
    container_name: arsenal-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/conf.d:/etc/nginx/conf.d:ro
      - uploads_data:/var/www/uploads:ro
      - certbot_certs:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    depends_on:
      - nextjs
      - dotnet-api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped
    networks:
      - arsenal-net

  certbot:
    image: certbot/certbot
    container_name: arsenal-certbot
    volumes:
      - certbot_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local
  certbot_certs:
    driver: local
  certbot_www:
    driver: local

networks:
  arsenal-net:
    driver: bridge
```

### 6.2 Dockerfiles

#### .NET API Dockerfile

```dockerfile
# src/backend/Arsenal.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Arsenal.Domain/Arsenal.Domain.csproj Arsenal.Domain/
COPY Arsenal.Application/Arsenal.Application.csproj Arsenal.Application/
COPY Arsenal.Infrastructure/Arsenal.Infrastructure.csproj Arsenal.Infrastructure/
COPY Arsenal.API/Arsenal.API.csproj Arsenal.API/
RUN dotnet restore Arsenal.API/Arsenal.API.csproj

COPY . .
RUN dotnet publish Arsenal.API/Arsenal.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/publish .
RUN mkdir -p /app/uploads

EXPOSE 5000
ENTRYPOINT ["dotnet", "Arsenal.API.dll"]
```

#### Next.js Dockerfile

```dockerfile
# src/frontend/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 6.3 Nginx Configuration

```nginx
# config/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/xml+rss
        application/x-javascript
        image/svg+xml;

    # Brotli compression (requires ngx_brotli module or freenginx)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css text/xml text/javascript
    #              application/json application/javascript application/xml
    #              application/xml+rss image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_zone:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=login_zone:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=booking_zone:10m rate=3r/m;

    # Upstream definitions
    upstream nextjs_upstream {
        server nextjs:3000;
        keepalive 32;
    }

    upstream api_upstream {
        server dotnet-api:5000;
        keepalive 32;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name fcarsenal92.ru www.fcarsenal92.ru;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location /health {
            access_log off;
            return 200 'ok';
            add_header Content-Type text/plain;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS main server
    server {
        listen 443 ssl http2;
        server_name fcarsenal92.ru;

        # SSL
        ssl_certificate /etc/letsencrypt/live/fcarsenal92.ru/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/fcarsenal92.ru/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mc.yandex.ru https://www.google-analytics.com; frame-src https://www.youtube.com https://api-maps.yandex.ru https://maps.google.com;" always;

        # Static uploads (served directly by Nginx)
        location /uploads/ {
            alias /var/www/uploads/;
            expires 30d;
            add_header Cache-Control "public, immutable";
            add_header Access-Control-Allow-Origin "*";
            try_files $uri =404;
        }

        # API proxy
        location /api/v1/ {
            limit_req zone=api_zone burst=50 nodelay;

            proxy_pass http://api_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";

            # No caching for API
            proxy_no_cache 1;
            proxy_cache_bypass 1;
        }

        # Auth login endpoint (strict rate limit)
        location /api/v1/auth/login {
            limit_req zone=login_zone burst=3 nodelay;

            proxy_pass http://api_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Booking submission (rate limit)
        location /api/v1/bookings {
            limit_req zone=booking_zone burst=2 nodelay;

            proxy_pass http://api_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Next.js static assets
        location /_next/static/ {
            proxy_pass http://nextjs_upstream;
            expires 365d;
            add_header Cache-Control "public, immutable";
        }

        # Next.js everything else
        location / {
            proxy_pass http://nextjs_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }

    # www redirect
    server {
        listen 443 ssl http2;
        server_name www.fcarsenal92.ru;

        ssl_certificate /etc/letsencrypt/live/fcarsenal92.ru/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/fcarsenal92.ru/privkey.pem;

        return 301 https://fcarsenal92.ru$request_uri;
    }
}
```

### 6.4 Backup Strategy for PostgreSQL

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER="arsenal-postgres"
DB_NAME="arsenal_db"
DB_USER="arsenal"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Create compressed backup
docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom \
  | gzip > "$BACKUP_DIR/arsenal_${TIMESTAMP}.dump.gz"

# Verify backup file size (should be > 0)
FILESIZE=$(stat -c%s "$BACKUP_DIR/arsenal_${TIMESTAMP}.dump.gz" 2>/dev/null || echo 0)
if [ "$FILESIZE" -lt 100 ]; then
  echo "ERROR: Backup file is too small ($FILESIZE bytes). Backup may have failed."
  exit 1
fi

echo "Backup created: arsenal_${TIMESTAMP}.dump.gz ($FILESIZE bytes)"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "arsenal_*.dump.gz" -mtime +${RETENTION_DAYS} -delete

echo "Old backups cleaned (retention: ${RETENTION_DAYS} days)"
```

**Cron schedule** (on the host or as a Docker cron container):

```cron
# Daily backup at 3:00 AM
0 3 * * * /opt/arsenal/scripts/backup-db.sh >> /var/log/arsenal-backup.log 2>&1
```

**Restore procedure:**

```bash
# Restore from backup
gunzip < /backups/postgres/arsenal_20260412_030000.dump.gz \
  | docker exec -i arsenal-postgres pg_restore -U arsenal -d arsenal_db --clean --if-exists
```

---

## 7. Security Architecture

### 7.1 JWT Authentication for Admin Panel

```
Login Flow:
1. POST /api/v1/auth/login { email, password }
2. Server validates bcrypt hash
3. Returns { accessToken (JWT, 30min), refreshToken (opaque, 7 days) }
4. Client stores accessToken in memory, refreshToken in httpOnly cookie
5. All admin API calls include: Authorization: Bearer <accessToken>

Token Refresh Flow:
1. Client detects 401 response
2. POST /api/v1/auth/refresh { refreshToken } (from cookie)
3. Server validates refresh token in DB, issues new pair
4. Old refresh token revoked (rotation)

Logout Flow:
1. POST /api/v1/auth/logout
2. Server revokes all refresh tokens for user
3. Client clears accessToken from memory
```

**JWT Configuration:**

```csharp
// Arsenal.API/Configuration/JwtSettings.cs
public class JwtSettings
{
    public string Key { get; set; }           // Min 256 bits, from env var
    public string Issuer { get; set; }        // "arsenal-api"
    public string Audience { get; set; }      // "arsenal-web"
    public int AccessTokenExpirationMinutes { get; set; } = 30;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
```

**JWT token claims:**

| Claim              | Value                    |
|-------------------|--------------------------|
| `sub`             | AdminUser.Id (GUID)      |
| `email`           | AdminUser.Email          |
| `role`            | AdminUser.Role           |
| `iat`             | Issued at timestamp      |
| `exp`             | Expiration timestamp     |

**Authorization policies:**

```csharp
// In Program.cs / DI registration
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser());
    options.AddPolicy("SuperAdminOnly", policy =>
        policy.RequireRole("superadmin"));
});

// On admin controllers:
[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/v1/admin/news")]
public class AdminNewsController : ControllerBase { }

// On user management (superadmin only):
[Authorize(Policy = "SuperAdminOnly")]
[ApiController]
[Route("api/v1/admin/users")]
public class AdminUsersController : ControllerBase { }
```

### 7.2 CORS Policy

```csharp
// Arsenal.API/DependencyInjection.cs
services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", builder =>
    {
        builder
            .WithOrigins(
                "https://fcarsenal92.ru",
                "https://www.fcarsenal92.ru"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Required for httpOnly refresh token cookie
    });

    // Development policy
    if (env.IsDevelopment())
    {
        options.AddPolicy("DefaultPolicy", builder =>
        {
            builder
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    }
});
```

### 7.3 Rate Limiting

Rate limiting is applied at two levels:

**Level 1: Nginx** (see nginx.conf above)
- General API: 30 req/s per IP with burst of 50
- Login endpoint: 5 req/min per IP with burst of 3
- Booking submission: 3 req/min per IP with burst of 2

**Level 2: .NET API** (for defense in depth)

```csharp
// Arsenal.API/Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("general", limiter =>
    {
        limiter.PermitLimit = 100;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 10;
    });

    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 5;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("booking", limiter =>
    {
        limiter.PermitLimit = 3;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

// Applied via attribute: [EnableRateLimiting("auth")]
```

### 7.4 Input Validation

Validation happens at multiple layers:

1. **FluentValidation** in Application layer (see section 2.3) -- validates all commands and queries
2. **Model binding validation** in ASP.NET Core (automatic for `[Required]`, `[MaxLength]`, etc.)
3. **Domain validation** in value objects (Slug, PhoneNumber, EmailAddress throw on invalid input)
4. **Database constraints** (CHECK constraints as last line of defense)

**Global validation middleware:**

```csharp
// Arsenal.API/Middleware/ExceptionHandlingMiddleware.cs
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Application.Common.Exceptions.ValidationException ex)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Validation Error",
                Status = 400,
                Detail = "One or more validation errors occurred.",
                Extensions = { ["errors"] = ex.Errors }
            });
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Not Found",
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (ForbiddenException)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Forbidden",
                Status = 403
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Internal Server Error",
                Status = 500
            });
        }
    }
}
```

### 7.5 File Upload Security

```csharp
// Arsenal.Infrastructure/Services/LocalFileStorageService.cs
public class LocalFileStorageService : IFileStorageService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"
    };

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    public async Task<UploadedFileDto> UploadAsync(
        Stream stream, string fileName, string contentType, CancellationToken ct)
    {
        // 1. Validate extension
        var ext = Path.GetExtension(fileName);
        if (!AllowedExtensions.Contains(ext))
            throw new ValidationException("File type not allowed.");

        // 2. Validate MIME type
        if (!AllowedMimeTypes.Contains(contentType))
            throw new ValidationException("MIME type not allowed.");

        // 3. Validate file size
        if (stream.Length > MaxFileSizeBytes)
            throw new ValidationException($"File size exceeds {MaxFileSizeBytes / 1024 / 1024}MB limit.");

        // 4. Validate magic bytes (file header)
        if (!await ValidateMagicBytesAsync(stream, ext))
            throw new ValidationException("File content does not match extension.");
        stream.Position = 0;

        // 5. Generate safe filename (UUID + original extension)
        var safeFileName = $"{Guid.NewGuid()}{ext}";
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var relativePath = $"/{dateFolder}/{safeFileName}";

        // 6. Sanitize path (prevent directory traversal)
        var fullPath = Path.Combine(_basePath, dateFolder, safeFileName);
        var normalizedBase = Path.GetFullPath(_basePath);
        var normalizedFull = Path.GetFullPath(fullPath);
        if (!normalizedFull.StartsWith(normalizedBase))
            throw new ForbiddenException("Invalid file path.");

        // 7. Save file
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        await using var fileStream = File.Create(fullPath);
        await stream.CopyToAsync(fileStream, ct);

        // 8. Generate thumbnail for images (400px width)
        var thumbnailPath = await GenerateThumbnailAsync(fullPath, ct);

        return new UploadedFileDto
        {
            Url = $"/uploads{relativePath}",
            ThumbnailUrl = thumbnailPath is not null ? $"/uploads{thumbnailPath}" : null,
        };
    }
}
```

**Additional file upload protections:**
- Nginx `client_max_body_size 20M` prevents oversized requests at proxy level
- Files stored outside the web root with UUID names (no user-controlled paths)
- SVG files are sanitized to remove embedded scripts (or rejected if SVG is not needed)
- Exif metadata is stripped from JPEG/PNG on upload
- The `/uploads/` directory is served by Nginx with `X-Content-Type-Options: nosniff`

### 7.6 Security Summary Matrix

| Threat                     | Mitigation                                          |
|---------------------------|-----------------------------------------------------|
| SQL Injection             | EF Core parameterized queries, no raw SQL           |
| XSS                       | React auto-escaping, CSP header, no dangerouslySetInnerHTML (except trusted admin content via DOMPurify) |
| CSRF                      | SameSite cookies, CORS policy, token-based auth     |
| Brute force login         | Rate limiting (5/min), account lockout after 10 fails, bcrypt cost factor 12 |
| JWT theft                 | Short-lived access tokens (30min), httpOnly refresh cookies, token rotation |
| File upload attacks       | Extension whitelist, MIME validation, magic bytes check, UUID rename, path sanitization |
| Directory traversal       | Path normalization checks in file upload and static serving |
| DDoS                      | Nginx rate limiting, connection limits, fail2ban on host |
| Data exposure             | No secrets in code, .env file only, ProblemDetails hides stack traces in production |
| Dependency vulnerabilities| Dependabot alerts, `dotnet list package --vulnerable`, `npm audit` in CI |

---

## Appendix A: CI/CD Pipeline Overview

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '9.0.x' }
      - run: dotnet test src/backend/Arsenal.sln

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd src/frontend && npm ci && npm test

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: |
          docker build -t ghcr.io/${{ github.repository }}/api:latest ./src/backend
          docker build -t ghcr.io/${{ github.repository }}/nextjs:latest ./src/frontend
          echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}/api:latest
          docker push ghcr.io/${{ github.repository }}/nextjs:latest
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: 147.45.229.110
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/arsenal
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

## Appendix B: Environment Variables Reference

| Variable                    | Container   | Example                            |
|-----------------------------|------------|-------------------------------------|
| `POSTGRES_PASSWORD`         | postgres   | (generated, 32+ chars)              |
| `JWT_SECRET`                | dotnet-api | (generated, 64+ chars)              |
| `YOOKASSA_SHOP_ID`         | dotnet-api | 123456                              |
| `YOOKASSA_SECRET_KEY`      | dotnet-api | test_...                            |
| `SMTP_HOST`                | dotnet-api | smtp.yandex.ru                      |
| `SMTP_PORT`                | dotnet-api | 465                                 |
| `SMTP_USERNAME`            | dotnet-api | noreply@fcarsenal92.ru              |
| `SMTP_PASSWORD`            | dotnet-api | (app password)                      |
| `SITE_URL`                 | nextjs     | https://fcarsenal92.ru              |
| `API_INTERNAL_URL`         | nextjs     | http://dotnet-api:5000              |
| `NEXT_PUBLIC_API_URL`      | nextjs     | /api/v1                             |

All secrets stored in `.env` file on the server (never committed to git).
GitHub Actions secrets used for CI/CD credentials.

## Appendix C: Monitoring and Logging

**Logging stack:**
- .NET API: Serilog with structured JSON output to stdout
- Next.js: Console logger to stdout
- Nginx: Access and error logs to `/var/log/nginx/`
- All container logs collected via `docker logs` or forwarded to a log aggregator

**Health check endpoints:**
- Nginx: `GET /health` returns 200
- .NET API: `GET /health` (includes DB connectivity check)
- Next.js: `GET /api/health` returns 200

**Key metrics to monitor:**
- Response times (p50, p95, p99) per endpoint
- Error rate (5xx responses)
- PostgreSQL connection pool utilization
- Disk usage (uploads volume, postgres volume)
- SSL certificate expiry (certbot auto-renews, but monitor)
- Booking submission count (business metric)
