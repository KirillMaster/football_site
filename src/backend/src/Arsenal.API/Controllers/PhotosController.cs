using Arsenal.Application.Interfaces;
using Arsenal.Application.Common;
using Arsenal.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api/photos")]
public class PhotosController : ControllerBase
{
    private readonly IArsenalDbContext _db;

    public PhotosController(IArsenalDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tag = null,
        CancellationToken ct = default)
    {
        var q = _db.Photos.AsNoTracking().Where(p => p.IsPublished);
        if (!string.IsNullOrWhiteSpace(tag)) q = q.Where(p => p.Tags.Contains(tag));

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(p => p.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new Arsenal.Application.DTOs.PhotoDto(
                p.Id, p.Url, p.ThumbnailUrl, p.AltRu, p.AltEn, p.Tags, p.IsPublished, p.SortOrder))
            .ToListAsync(ct);

        return Ok(new PagedResult<Arsenal.Application.DTOs.PhotoDto>(items, page, pageSize, total));
    }
}

[ApiController]
[Route("api/admin/photos")]
[Authorize(Roles = "admin")]
public class AdminPhotosController : ControllerBase
{
    private readonly IArsenalDbContext _db;
    private readonly IStorageService _storage;

    public AdminPhotosController(IArsenalDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest("No file provided");
        if (file.Length > 20 * 1024 * 1024) return BadRequest("File too large (max 20 MB)");

        await using var stream = file.OpenReadStream();
        var key = await _storage.UploadAsync(stream, file.FileName, file.ContentType, ct);
        var url = _storage.GetPublicUrl(key);

        var photo = Photo.Create(url, url, string.Empty, string.Empty);
        var media = MediaFile.Create(file.FileName, key, url, file.ContentType,
            file.Length, MediaFileType.Image);

        _db.Photos.Add(photo);
        _db.MediaFiles.Add(media);
        await _db.SaveChangesAsync(ct);

        return Ok(new { id = photo.Id, url, key });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PhotoUpdateRequest req, CancellationToken ct)
    {
        var photo = await _db.Photos.FindAsync([id], ct);
        if (photo is null) return NotFound();
        photo.Update(req.AltRu, req.AltEn, req.Tags, req.IsPublished, req.SortOrder);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var photo = await _db.Photos.FindAsync([id], ct);
        if (photo is null) return NotFound();
        _db.Photos.Remove(photo);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record PhotoUpdateRequest(string AltRu, string AltEn, List<string> Tags, bool IsPublished, int SortOrder);
