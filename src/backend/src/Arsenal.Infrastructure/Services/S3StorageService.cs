using Amazon.S3;
using Amazon.S3.Model;
using Arsenal.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Arsenal.Infrastructure.Services;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;
    private readonly string _endpoint;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IAmazonS3 s3, IConfiguration config, ILogger<S3StorageService> logger)
    {
        _s3 = s3;
        _bucket = config["S3_BUCKET"] ?? throw new InvalidOperationException("S3_BUCKET not configured");
        _endpoint = config["S3_ENDPOINT"] ?? "https://s3.twcstorage.ru";
        _logger = logger;
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType,
        CancellationToken cancellationToken = default)
    {
        var key = $"{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid():N}_{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _bucket,
            Key = key,
            InputStream = stream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        await _s3.PutObjectAsync(request, cancellationToken);
        _logger.LogInformation("Uploaded file to S3: {Key}", key);
        return key;
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        await _s3.DeleteObjectAsync(_bucket, storageKey, cancellationToken);
        _logger.LogInformation("Deleted file from S3: {Key}", storageKey);
    }

    public string GetPublicUrl(string storageKey)
        => $"{_endpoint.TrimEnd('/')}/{_bucket}/{storageKey}";
}
