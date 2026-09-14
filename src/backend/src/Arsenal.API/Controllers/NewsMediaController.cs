using Arsenal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

// Медиа-загрузка для текста новости (US4). Сохраняет файл в хранилище и возвращает
// { url, key, mediaType }, не создавая записи Photo/MediaFile — публичная фотогалерея
// не должна меняться (FR-016, см. tasks.yaml T001 шаг 3).
[ApiController]
[Route("api/admin/news/media")]
[Authorize(Roles = "admin")]
public class NewsMediaController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "video/mp4"
    };

    private const long MaxSizeBytes = 20 * 1024 * 1024;

    private readonly IStorageService _storage;

    public NewsMediaController(IStorageService storage) => _storage = storage;

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Файл не выбран" });

        if (file.Length > MaxSizeBytes)
            return BadRequest(new { message = "Файл слишком большой. Максимальный размер — 20 МБ" });

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Недопустимый тип файла. Разрешены: JPEG, PNG, WEBP, MP4" });

        await using var stream = file.OpenReadStream();
        var key = await _storage.UploadAsync(stream, file.FileName, file.ContentType, ct);
        var url = _storage.GetPublicUrl(key);

        var mediaType = file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
            ? "video"
            : "image";

        return Ok(new { url, key, mediaType });
    }
}
