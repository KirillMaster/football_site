using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Arsenal.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUtmFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UtmCampaign",
                table: "tryout_requests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmContent",
                table: "tryout_requests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmMedium",
                table: "tryout_requests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmSource",
                table: "tryout_requests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmTerm",
                table: "tryout_requests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YmClientId",
                table: "tryout_requests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmCampaign",
                table: "contact_messages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmContent",
                table: "contact_messages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmMedium",
                table: "contact_messages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmSource",
                table: "contact_messages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UtmTerm",
                table: "contact_messages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YmClientId",
                table: "contact_messages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UtmCampaign",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "UtmContent",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "UtmMedium",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "UtmSource",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "UtmTerm",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "YmClientId",
                table: "tryout_requests");

            migrationBuilder.DropColumn(
                name: "UtmCampaign",
                table: "contact_messages");

            migrationBuilder.DropColumn(
                name: "UtmContent",
                table: "contact_messages");

            migrationBuilder.DropColumn(
                name: "UtmMedium",
                table: "contact_messages");

            migrationBuilder.DropColumn(
                name: "UtmSource",
                table: "contact_messages");

            migrationBuilder.DropColumn(
                name: "UtmTerm",
                table: "contact_messages");

            migrationBuilder.DropColumn(
                name: "YmClientId",
                table: "contact_messages");
        }
    }
}
