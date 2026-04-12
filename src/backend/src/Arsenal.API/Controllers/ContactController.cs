using Arsenal.Application.Commands;
using Arsenal.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Arsenal.API.Controllers;

[ApiController]
[Route("api")]
public class ContactController : ControllerBase
{
    private readonly CreateContactMessageCommandHandler _contactHandler;
    private readonly CreateTryoutRequestCommandHandler _tryoutHandler;
    private readonly IValidator<CreateContactMessageRequest> _contactValidator;
    private readonly IValidator<CreateTryoutRequestRequest> _tryoutValidator;

    public ContactController(
        CreateContactMessageCommandHandler contactHandler,
        CreateTryoutRequestCommandHandler tryoutHandler,
        IValidator<CreateContactMessageRequest> contactValidator,
        IValidator<CreateTryoutRequestRequest> tryoutValidator)
    {
        _contactHandler = contactHandler;
        _tryoutHandler = tryoutHandler;
        _contactValidator = contactValidator;
        _tryoutValidator = tryoutValidator;
    }

    [HttpPost("contact")]
    public async Task<IActionResult> Contact([FromBody] CreateContactMessageRequest request, CancellationToken ct)
    {
        var validation = await _contactValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }));

        var result = await _contactHandler.HandleAsync(request, ct);
        return result.IsSuccess
            ? Ok(new { id = result.Value, message = "Message received" })
            : StatusCode(500, new { error = result.Error });
    }

    [HttpPost("tryout")]
    public async Task<IActionResult> Tryout([FromBody] CreateTryoutRequestRequest request, CancellationToken ct)
    {
        var validation = await _tryoutValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }));

        var result = await _tryoutHandler.HandleAsync(request, ct);
        return result.IsSuccess
            ? Ok(new { id = result.Value, message = "Tryout request received" })
            : StatusCode(500, new { error = result.Error });
    }
}
