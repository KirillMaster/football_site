using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arsenal.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "achievements",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                TitleRu = table.Column<string>(maxLength: 500, nullable: false),
                TitleEn = table.Column<string>(maxLength: 500, nullable: false),
                DescriptionRu = table.Column<string>(nullable: false),
                DescriptionEn = table.Column<string>(nullable: false),
                Year = table.Column<int>(nullable: false),
                ImageUrl = table.Column<string>(maxLength: 500, nullable: true),
                IsPublished = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_achievements", x => x.Id));

        migrationBuilder.CreateTable(
            name: "coaches",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                NameRu = table.Column<string>(maxLength: 200, nullable: false),
                NameEn = table.Column<string>(maxLength: 200, nullable: false),
                PositionRu = table.Column<string>(maxLength: 300, nullable: false),
                PositionEn = table.Column<string>(maxLength: 300, nullable: false),
                BioRu = table.Column<string>(nullable: false),
                BioEn = table.Column<string>(nullable: false),
                Photo = table.Column<string>(maxLength: 500, nullable: true),
                Certifications = table.Column<string[]>(type: "text[]", nullable: false),
                SortOrder = table.Column<int>(nullable: false),
                IsActive = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_coaches", x => x.Id));

        migrationBuilder.CreateTable(
            name: "contact_messages",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Name = table.Column<string>(maxLength: 200, nullable: false),
                Phone = table.Column<string>(maxLength: 50, nullable: false),
                Email = table.Column<string>(maxLength: 256, nullable: true),
                Message = table.Column<string>(maxLength: 2000, nullable: false),
                IsRead = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_contact_messages", x => x.Id));

        migrationBuilder.CreateTable(
            name: "groups",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Name = table.Column<string>(maxLength: 200, nullable: false),
                AgeRange = table.Column<string>(maxLength: 100, nullable: false),
                Level = table.Column<string>(maxLength: 50, nullable: false),
                MaxCapacity = table.Column<int>(nullable: false),
                DescriptionRu = table.Column<string>(nullable: false),
                DescriptionEn = table.Column<string>(nullable: false),
                IsActive = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_groups", x => x.Id));

        migrationBuilder.CreateTable(
            name: "media_files",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                FileName = table.Column<string>(maxLength: 300, nullable: false),
                StorageKey = table.Column<string>(maxLength: 500, nullable: false),
                Url = table.Column<string>(maxLength: 500, nullable: false),
                ContentType = table.Column<string>(maxLength: 100, nullable: false),
                SizeBytes = table.Column<long>(nullable: false),
                FileType = table.Column<int>(nullable: false),
                AltText = table.Column<string>(maxLength: 300, nullable: true),
                UploadedByUserId = table.Column<Guid>(nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_media_files", x => x.Id));

        migrationBuilder.CreateTable(
            name: "news",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Slug = table.Column<string>(maxLength: 200, nullable: false),
                TitleRu = table.Column<string>(maxLength: 500, nullable: false),
                TitleEn = table.Column<string>(maxLength: 500, nullable: false),
                ExcerptRu = table.Column<string>(maxLength: 1000, nullable: false),
                ExcerptEn = table.Column<string>(maxLength: 1000, nullable: false),
                ContentRu = table.Column<string>(nullable: false),
                ContentEn = table.Column<string>(nullable: false),
                CoverImage = table.Column<string>(maxLength: 500, nullable: true),
                MetaTitle = table.Column<string>(maxLength: 160, nullable: false),
                MetaDescription = table.Column<string>(maxLength: 300, nullable: false),
                Tags = table.Column<string[]>(type: "text[]", nullable: false),
                IsPublished = table.Column<bool>(nullable: false),
                PublishedAt = table.Column<DateTime>(nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_news", x => x.Id));

        migrationBuilder.CreateTable(
            name: "pages",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Slug = table.Column<string>(maxLength: 200, nullable: false),
                TitleRu = table.Column<string>(maxLength: 500, nullable: false),
                TitleEn = table.Column<string>(maxLength: 500, nullable: false),
                ContentRu = table.Column<string>(nullable: false),
                ContentEn = table.Column<string>(nullable: false),
                MetaTitleRu = table.Column<string>(maxLength: 160, nullable: false),
                MetaDescriptionRu = table.Column<string>(maxLength: 300, nullable: false),
                MetaTitleEn = table.Column<string>(maxLength: 160, nullable: false),
                MetaDescriptionEn = table.Column<string>(maxLength: 300, nullable: false),
                OgImage = table.Column<string>(maxLength: 500, nullable: true),
                IsPublished = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_pages", x => x.Id));

        migrationBuilder.CreateTable(
            name: "partners",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Name = table.Column<string>(maxLength: 200, nullable: false),
                DescriptionRu = table.Column<string>(nullable: false),
                LogoUrl = table.Column<string>(maxLength: 500, nullable: true),
                WebsiteUrl = table.Column<string>(maxLength: 500, nullable: true),
                SortOrder = table.Column<int>(nullable: false),
                IsActive = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_partners", x => x.Id));

        migrationBuilder.CreateTable(
            name: "photos",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Url = table.Column<string>(maxLength: 500, nullable: false),
                ThumbnailUrl = table.Column<string>(maxLength: 500, nullable: false),
                AltRu = table.Column<string>(maxLength: 300, nullable: false),
                AltEn = table.Column<string>(maxLength: 300, nullable: false),
                Tags = table.Column<string[]>(type: "text[]", nullable: false),
                IsPublished = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_photos", x => x.Id));

        migrationBuilder.CreateTable(
            name: "pricing_plans",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                NameRu = table.Column<string>(maxLength: 200, nullable: false),
                NameEn = table.Column<string>(maxLength: 200, nullable: false),
                Price = table.Column<decimal>(precision: 10, scale: 2, nullable: false),
                Currency = table.Column<string>(maxLength: 10, nullable: false),
                SessionsCount = table.Column<int>(nullable: false),
                DescriptionRu = table.Column<string>(nullable: false),
                DescriptionEn = table.Column<string>(nullable: false),
                FeaturesRu = table.Column<string[]>(type: "text[]", nullable: false),
                FeaturesEn = table.Column<string[]>(type: "text[]", nullable: false),
                IsFeatured = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false),
                IsActive = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_pricing_plans", x => x.Id));

        migrationBuilder.CreateTable(
            name: "site_settings",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                SiteNameRu = table.Column<string>(maxLength: 300, nullable: false),
                SiteNameEn = table.Column<string>(maxLength: 300, nullable: false),
                LogoUrl = table.Column<string>(nullable: true),
                FaviconUrl = table.Column<string>(nullable: true),
                PrimaryColor = table.Column<string>(maxLength: 20, nullable: false),
                SecondaryColor = table.Column<string>(maxLength: 20, nullable: false),
                YandexMetrikaId = table.Column<string>(nullable: true),
                GoogleAnalyticsId = table.Column<string>(nullable: true),
                YandexVerification = table.Column<string>(nullable: true),
                GoogleVerification = table.Column<string>(nullable: true),
                HeroVideoRutubeId = table.Column<string>(nullable: true),
                FeatureBooking = table.Column<bool>(nullable: false),
                FeatureBlog = table.Column<bool>(nullable: false),
                FeatureGallery = table.Column<bool>(nullable: false),
                FeaturePayments = table.Column<bool>(nullable: false),
                FeatureReviews = table.Column<bool>(nullable: false),
                FeatureI18n = table.Column<bool>(nullable: false),
                FeatureShop = table.Column<bool>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_site_settings", x => x.Id));

        migrationBuilder.CreateTable(
            name: "tags",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Name = table.Column<string>(maxLength: 100, nullable: false),
                Slug = table.Column<string>(maxLength: 100, nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_tags", x => x.Id));

        migrationBuilder.CreateTable(
            name: "tryout_requests",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                ChildName = table.Column<string>(maxLength: 200, nullable: false),
                ChildAge = table.Column<int>(nullable: false),
                ParentName = table.Column<string>(maxLength: 200, nullable: false),
                Phone = table.Column<string>(maxLength: 50, nullable: false),
                Email = table.Column<string>(maxLength: 256, nullable: true),
                Message = table.Column<string>(nullable: true),
                Status = table.Column<int>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_tryout_requests", x => x.Id));

        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                Email = table.Column<string>(maxLength: 256, nullable: false),
                PasswordHash = table.Column<string>(maxLength: 500, nullable: false),
                Role = table.Column<string>(maxLength: 50, nullable: false),
                IsActive = table.Column<bool>(nullable: false),
                LastLoginAt = table.Column<DateTime>(nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_users", x => x.Id));

        migrationBuilder.CreateTable(
            name: "videos",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                TitleRu = table.Column<string>(maxLength: 500, nullable: false),
                TitleEn = table.Column<string>(maxLength: 500, nullable: false),
                RutubeId = table.Column<string>(maxLength: 100, nullable: false),
                YoutubeId = table.Column<string>(maxLength: 100, nullable: true),
                ThumbnailUrl = table.Column<string>(maxLength: 500, nullable: true),
                Tags = table.Column<string[]>(type: "text[]", nullable: false),
                IsPublished = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_videos", x => x.Id));

        migrationBuilder.CreateTable(
            name: "schedules",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                GroupId = table.Column<Guid>(nullable: false),
                CoachId = table.Column<Guid>(nullable: false),
                DayOfWeek = table.Column<int>(nullable: false),
                StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                Location = table.Column<string>(maxLength: 500, nullable: false),
                IsActive = table.Column<bool>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_schedules", x => x.Id);
                table.ForeignKey("FK_schedules_groups_GroupId", x => x.GroupId, "groups", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_schedules_coaches_CoachId", x => x.CoachId, "coaches", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "player_registrations",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                PlayerFirstName = table.Column<string>(maxLength: 100, nullable: false),
                PlayerLastName = table.Column<string>(maxLength: 100, nullable: false),
                BirthDate = table.Column<DateOnly>(nullable: false),
                ParentName = table.Column<string>(maxLength: 200, nullable: false),
                Phone = table.Column<string>(maxLength: 50, nullable: false),
                Email = table.Column<string>(maxLength: 256, nullable: true),
                GroupId = table.Column<Guid>(nullable: true),
                Status = table.Column<int>(nullable: false),
                Notes = table.Column<string>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_player_registrations", x => x.Id);
                table.ForeignKey("FK_player_registrations_groups_GroupId", x => x.GroupId, "groups", "Id", onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "refresh_tokens",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                UserId = table.Column<Guid>(nullable: false),
                Token = table.Column<string>(maxLength: 500, nullable: false),
                ExpiresAt = table.Column<DateTime>(nullable: false),
                IsRevoked = table.Column<bool>(nullable: false),
                ReplacedByToken = table.Column<string>(maxLength: 500, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                table.ForeignKey("FK_refresh_tokens_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
            });

        // Indexes
        migrationBuilder.CreateIndex("IX_pages_slug", "pages", "Slug", unique: true);
        migrationBuilder.CreateIndex("IX_news_slug", "news", "Slug", unique: true);
        migrationBuilder.CreateIndex("IX_news_published_at", "news", "PublishedAt");
        migrationBuilder.CreateIndex("IX_news_is_published", "news", "IsPublished");
        migrationBuilder.CreateIndex("IX_users_email", "users", "Email", unique: true);
        migrationBuilder.CreateIndex("IX_refresh_tokens_token", "refresh_tokens", "Token");
        migrationBuilder.CreateIndex("IX_media_files_storage_key", "media_files", "StorageKey", unique: true);
        migrationBuilder.CreateIndex("IX_tags_slug", "tags", "Slug", unique: true);
        migrationBuilder.CreateIndex("IX_schedules_group_id", "schedules", "GroupId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("refresh_tokens");
        migrationBuilder.DropTable("player_registrations");
        migrationBuilder.DropTable("schedules");
        migrationBuilder.DropTable("users");
        migrationBuilder.DropTable("videos");
        migrationBuilder.DropTable("tryout_requests");
        migrationBuilder.DropTable("tags");
        migrationBuilder.DropTable("site_settings");
        migrationBuilder.DropTable("pricing_plans");
        migrationBuilder.DropTable("photos");
        migrationBuilder.DropTable("partners");
        migrationBuilder.DropTable("pages");
        migrationBuilder.DropTable("news");
        migrationBuilder.DropTable("media_files");
        migrationBuilder.DropTable("groups");
        migrationBuilder.DropTable("contact_messages");
        migrationBuilder.DropTable("coaches");
        migrationBuilder.DropTable("achievements");
    }
}
