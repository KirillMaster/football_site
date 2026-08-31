using Arsenal.API.Controllers;
using Arsenal.Domain.Entities;
using Arsenal.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Arsenal.API.IntegrationTests;

// Controller actions are unit-invoked directly (bypassing the [Authorize] middleware,
// which is already covered by AuthEndpointTests) to verify the admin query itself
// returns the UTM/ymClientId fields alongside each заявка.
public class AdminInboxUtmTests : IClassFixture<WebAppFactory>
{
    private readonly WebAppFactory _factory;

    public AdminInboxUtmTests(WebAppFactory factory) => _factory = factory;

    [Fact]
    [Trait("scenario", "US3-AS2")]
    public async Task GetTryouts_WithSavedUtm_ReturnsUtmFieldsAlongsideRequest()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();

        var tryout = TryoutRequest.Create("Ольга", 10, "Ольга Смирнова", "+79780000003",
            utmSource: "vk", utmMedium: "social", utmCampaign: "spring", utmContent: "post1",
            utmTerm: "arsenal", ymClientId: "555444333.222111000");
        db.TryoutRequests.Add(tryout);
        await db.SaveChangesAsync();

        var controller = new AdminInboxController(db);
        var result = await controller.GetTryouts(CancellationToken.None);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var list = ok.Value.Should().BeAssignableTo<IEnumerable<TryoutRequest>>().Subject;
        var saved = list.Should().ContainSingle(t => t.Id == tryout.Id).Subject;

        saved.UtmSource.Should().Be("vk");
        saved.UtmMedium.Should().Be("social");
        saved.UtmCampaign.Should().Be("spring");
        saved.UtmContent.Should().Be("post1");
        saved.UtmTerm.Should().Be("arsenal");
        saved.YmClientId.Should().Be("555444333.222111000");
    }

    [Fact]
    [Trait("scenario", "US3-AS2")]
    public async Task GetContacts_WithSavedUtm_ReturnsUtmFieldsAlongsideMessage()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ArsenalDbContext>();

        var message = ContactMessage.Create("Виктор Волков", "+79780000004", "Вопрос по абонементу",
            utmSource: "vk", utmMedium: "social", utmCampaign: "spring", utmContent: "post1",
            utmTerm: "arsenal", ymClientId: "999888777.666555444");
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();

        var controller = new AdminInboxController(db);
        var result = await controller.GetContacts(unreadOnly: false, ct: CancellationToken.None);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var list = ok.Value.Should().BeAssignableTo<IEnumerable<ContactMessage>>().Subject;
        var saved = list.Should().ContainSingle(c => c.Id == message.Id).Subject;

        saved.UtmSource.Should().Be("vk");
        saved.UtmMedium.Should().Be("social");
        saved.UtmCampaign.Should().Be("spring");
        saved.UtmContent.Should().Be("post1");
        saved.UtmTerm.Should().Be("arsenal");
        saved.YmClientId.Should().Be("999888777.666555444");
    }
}
