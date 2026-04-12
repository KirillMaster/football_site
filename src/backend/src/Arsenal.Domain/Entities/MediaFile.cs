using Arsenal.Domain.Common;

namespace Arsenal.Domain.Entities;

public enum MediaFileType { Image, Video, Document }

public class MediaFile : BaseEntity
{
    public string FileName { get; private set; } = string.Empty;
    public string StorageKey { get; private set; } = string.Empty;
    public string Url { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long SizeBytes { get; private set; }
    public MediaFileType FileType { get; private set; }
    public string? AltText { get; private set; }
    public Guid? UploadedByUserId { get; private set; }

    private MediaFile() { }

    public static MediaFile Create(string fileName, string storageKey, string url,
        string contentType, long sizeBytes, MediaFileType fileType,
        string? altText = null, Guid? uploadedByUserId = null)
    {
        if (string.IsNullOrWhiteSpace(storageKey)) throw new ArgumentException("Storage key is required");
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL is required");
        if (sizeBytes < 0) throw new ArgumentOutOfRangeException(nameof(sizeBytes));

        return new MediaFile
        {
            FileName = fileName,
            StorageKey = storageKey,
            Url = url,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            FileType = fileType,
            AltText = altText,
            UploadedByUserId = uploadedByUserId
        };
    }

    public void SetAltText(string? altText) { AltText = altText; UpdatedAt = DateTime.UtcNow; }
}
