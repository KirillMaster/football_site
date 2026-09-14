using System.Text;
using Arsenal.API.Controllers;
using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Controller actions are unit-invoked directly (bypassing the [Authorize] middleware,
// which is already covered by AuthEndpointTests), following the AdminInboxUtmTests pattern.
// IStorageService is replaced by an in-memory fake so no network calls to S3 happen in tests.
public class NewsMediaEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public NewsMediaEndpointTests(WebAppFactory factory) => _factory = factory;

    private static IFormFile MakeFile(string fileName, string contentType, int sizeBytes)
    {
        var bytes = new byte[sizeBytes];
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    [Fact]
    [Trait("scenario", "US4-AS-12")]
    public async Task UploadNewsMedia_DoesNotIncreasePublicPhotoGalleryCount()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();

        var before = db.Photos.Count();

        var controller = new NewsMediaController(new FakeStorageService());
        var file = MakeFile("news1.jpg", "image/jpeg", 1024);
        var result = await controller.Upload(file, CancellationToken.None);

        result.Should().BeOfType<OkObjectResult>();

        var after = db.Photos.Count();
        after.Should().Be(before);
    }

    [Fact]
    [Trait("scenario", "US4-AS-13")]
    public async Task UploadPhotoGallery_StillAddsPhotoToPublicGallery()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();

        var before = db.Photos.Count();

        var controller = new AdminPhotosController(db, new FakeStorageService());
        var file = MakeFile("gallery1.jpg", "image/jpeg", 1024);
        var result = await controller.Upload(file, CancellationToken.None);

        result.Should().BeOfType<OkObjectResult>();

        var after = db.Photos.Count();
        after.Should().Be(before + 1);
    }

    [Fact]
    [Trait("scenario", "US4-FR-017")]
    public async Task UploadNewsMedia_WithMp4File_ReturnsMediaTypeVideo()
    {
        var controller = new NewsMediaController(new FakeStorageService());
        var file = MakeFile("clip.mp4", "video/mp4", 2048);

        var result = await controller.Upload(file, CancellationToken.None);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value!.GetType().GetProperty("mediaType")!.GetValue(ok.Value).Should().Be("video");
    }

    [Fact]
    [Trait("scenario", "US2-EC-3")]
    public async Task UploadNewsMedia_WithUnsupportedContentType_ReturnsBadRequestWithMessage()
    {
        var controller = new NewsMediaController(new FakeStorageService());
        var file = MakeFile("doc.pdf", "application/pdf", 1024);

        var result = await controller.Upload(file, CancellationToken.None);

        var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        bad.Value.Should().NotBeNull();
    }
}

internal class FakeStorageService : IStorageService
{
    public Task<string> UploadAsync(Stream stream, string fileName, string contentType,
        CancellationToken cancellationToken = default)
        => Task.FromResult("fake-key/" + fileName);

    public Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public string GetPublicUrl(string storageKey) => "https://fake-cdn.example.com/" + storageKey;
}
