using FluentValidation;

namespace Arsenal.Application.Validators;

public record CreateNewsCommand(
    string Slug,
    string TitleRu,
    string TitleEn,
    string ExcerptRu,
    string ExcerptEn,
    string ContentRu,
    string ContentEn,
    string MetaTitle,
    string MetaDescription,
    List<string> Tags,
    bool IsPublished,
    DateTime? PublishedAt
);

public class CreateNewsCommandValidator : AbstractValidator<CreateNewsCommand>
{
    public CreateNewsCommandValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug must be lowercase with hyphens only")
            .MaximumLength(200);

        RuleFor(x => x.TitleRu)
            .NotEmpty().WithMessage("Title (RU) is required")
            .MaximumLength(500);

        RuleFor(x => x.ContentRu)
            .NotEmpty().WithMessage("Content (RU) is required");

        RuleFor(x => x.MetaTitle)
            .MaximumLength(160);

        RuleFor(x => x.MetaDescription)
            .MaximumLength(300);
    }
}

public record UpdateNewsCommand(
    Guid Id,
    string TitleRu,
    string TitleEn,
    string ExcerptRu,
    string ExcerptEn,
    string ContentRu,
    string ContentEn,
    string MetaTitle,
    string MetaDescription,
    List<string> Tags,
    bool IsPublished,
    string? CoverImage
);

public class UpdateNewsCommandValidator : AbstractValidator<UpdateNewsCommand>
{
    public UpdateNewsCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.TitleRu).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ContentRu).NotEmpty();
        RuleFor(x => x.MetaTitle).MaximumLength(160);
        RuleFor(x => x.MetaDescription).MaximumLength(300);
    }
}
