using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public class SiteSettings : BaseEntity
{
    public string SiteNameRu { get; private set; } = string.Empty;
    public string SiteNameEn { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? FaviconUrl { get; private set; }
    public string PrimaryColor { get; private set; } = "#E10005";
    public string SecondaryColor { get; private set; } = "#101A7A";
    public string? YandexMetrikaId { get; private set; }
    public string? GoogleAnalyticsId { get; private set; }
    public string? YandexVerification { get; private set; }
    public string? GoogleVerification { get; private set; }
    public string? HeroVideoRutubeId { get; private set; }
    public bool FeatureBooking { get; private set; } = true;
    public bool FeatureBlog { get; private set; } = true;
    public bool FeatureGallery { get; private set; } = true;
    public bool FeaturePayments { get; private set; } = false;
    public bool FeatureReviews { get; private set; } = true;
    public bool FeatureI18n { get; private set; } = true;
    public bool FeatureShop { get; private set; } = true;

    private SiteSettings() { }

    public static SiteSettings CreateDefault()
    {
        return new SiteSettings
        {
            SiteNameRu = "ДФК Арсенал — Детская футбольная школа Севастополь",
            SiteNameEn = "FC Arsenal-92 — Youth Football School Sevastopol"
        };
    }

    public void Update(string siteNameRu, string siteNameEn, string? logoUrl,
        string? faviconUrl, string primaryColor, string secondaryColor,
        string? yandexMetrikaId, string? googleAnalyticsId,
        string? yandexVerification, string? googleVerification,
        string? heroVideoRutubeId, bool featureBooking, bool featureBlog,
        bool featureGallery, bool featurePayments, bool featureReviews,
        bool featureI18n, bool featureShop)
    {
        SiteNameRu = siteNameRu;
        SiteNameEn = siteNameEn;
        LogoUrl = logoUrl;
        FaviconUrl = faviconUrl;
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        YandexMetrikaId = yandexMetrikaId;
        GoogleAnalyticsId = googleAnalyticsId;
        YandexVerification = yandexVerification;
        GoogleVerification = googleVerification;
        HeroVideoRutubeId = heroVideoRutubeId;
        FeatureBooking = featureBooking;
        FeatureBlog = featureBlog;
        FeatureGallery = featureGallery;
        FeaturePayments = featurePayments;
        FeatureReviews = featureReviews;
        FeatureI18n = featureI18n;
        FeatureShop = featureShop;
        UpdatedAt = DateTime.UtcNow;
    }
}
