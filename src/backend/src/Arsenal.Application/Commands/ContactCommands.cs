using Arsenal.Application.Common;
using Arsenal.Application.DTOs;
using Arsenal.Application.Interfaces;
using Arsenal.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Arsenal.Application.Commands;

public class CreateContactMessageCommandHandler
{
    private readonly IArsenalDbContext _db;
    private readonly ILogger<CreateContactMessageCommandHandler> _logger;

    public CreateContactMessageCommandHandler(IArsenalDbContext db,
        ILogger<CreateContactMessageCommandHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> HandleAsync(CreateContactMessageRequest request, CancellationToken ct = default)
    {
        var message = ContactMessage.Create(request.Name, request.Phone, request.Message, request.Email);
        _db.ContactMessages.Add(message);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Contact message created: {Id}", message.Id);
        return Result<Guid>.Success(message.Id);
    }
}

public class CreateTryoutRequestCommandHandler
{
    private readonly IArsenalDbContext _db;
    private readonly ILogger<CreateTryoutRequestCommandHandler> _logger;

    public CreateTryoutRequestCommandHandler(IArsenalDbContext db,
        ILogger<CreateTryoutRequestCommandHandler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> HandleAsync(CreateTryoutRequestRequest request, CancellationToken ct = default)
    {
        var tryout = TryoutRequest.Create(request.ChildName, request.ChildAge,
            request.ParentName, request.Phone, request.Email, request.Message);
        _db.TryoutRequests.Add(tryout);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Tryout request created: {Id}", tryout.Id);
        return Result<Guid>.Success(tryout.Id);
    }
}
