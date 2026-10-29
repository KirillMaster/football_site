using Arsenal.API.Controllers;
using Arsenal.Application.Queries;
using Arsenal.Domain.Entities;
using Arsenal.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Контроллер вызывается напрямую (минуя [Authorize]), как в NewsPublishingEndpointTests.
public class CoachDeleteEndpointTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public CoachDeleteEndpointTests(WebAppFactory factory) => _factory = factory;

    private AdminCoachesController MakeController(out ArsenalDbContext db)
    {
        var scope = _factory.Services.CreateScope();
        db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();
        return new AdminCoachesController(scope.ServiceProvider.GetRequiredService<GetCoachesQueryHandler>(), db);
    }

    private static async Task<(Coach from, Coach to, Schedule slot)> SeedAsync(ArsenalDbContext db)
    {
        var from = Coach.Create("Кива Евгений", "", "Тренер", "", "", "");
        var to = Coach.Create("Новый Тренер", "", "Тренер", "", "", "");
        var group = Group.Create("U-10", "8-10", "base", 20, "", "");
        db.AddRange(from, to, group);
        await db.SaveChangesAsync();
        var slot = Schedule.Create(group.Id, from.Id, DayOfWeek.Tuesday,
            new TimeOnly(18, 0), new TimeOnly(19, 30), "Стадион");
        db.Add(slot);
        await db.SaveChangesAsync();
        return (from, to, slot);
    }

    [Fact]
    public async Task Delete_CoachWithoutSchedules_ReturnsNoContent()
    {
        var controller = MakeController(out var db);
        var coach = Coach.Create("Свободный", "", "Тренер", "", "", "");
        db.Add(coach);
        await db.SaveChangesAsync();

        var result = await controller.Delete(coach.Id, null, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
        (await db.Coaches.AnyAsync(c => c.Id == coach.Id)).Should().BeFalse();
    }

    [Fact]
    public async Task Delete_CoachWithSchedules_WithoutReassign_ReturnsConflictAndKeepsCoach()
    {
        var controller = MakeController(out var db);
        var (from, _, _) = await SeedAsync(db);

        var result = await controller.Delete(from.Id, null, CancellationToken.None);

        result.Should().BeOfType<ConflictObjectResult>().Subject.Value.Should().NotBeNull();
        (await db.Coaches.AnyAsync(c => c.Id == from.Id)).Should().BeTrue();
    }

    [Fact]
    public async Task Delete_WithReassign_MovesSchedulesAndDeletesCoach()
    {
        var controller = MakeController(out var db);
        var (from, to, slot) = await SeedAsync(db);

        var result = await controller.Delete(from.Id, to.Id, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
        (await db.Coaches.AnyAsync(c => c.Id == from.Id)).Should().BeFalse();
        (await db.Schedules.AsNoTracking().SingleAsync(s => s.Id == slot.Id)).CoachId.Should().Be(to.Id);
    }

    [Fact]
    public async Task Delete_WithReassignToSelf_ReturnsBadRequest()
    {
        var controller = MakeController(out var db);
        var (from, _, _) = await SeedAsync(db);

        var result = await controller.Delete(from.Id, from.Id, CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Delete_WithReassignToUnknownCoach_ReturnsBadRequest()
    {
        var controller = MakeController(out var db);
        var (from, _, _) = await SeedAsync(db);

        var result = await controller.Delete(from.Id, Guid.NewGuid(), CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
        (await db.Coaches.AnyAsync(c => c.Id == from.Id)).Should().BeTrue();
    }
}
