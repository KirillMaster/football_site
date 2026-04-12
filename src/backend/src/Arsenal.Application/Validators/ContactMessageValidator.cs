using Arsenal.Application.DTOs;
using FluentValidation;

namespace Arsenal.Application.Validators;

public class CreateContactMessageValidator : AbstractValidator<CreateContactMessageRequest>
{
    public CreateContactMessageValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200);

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^[\+\d\s\-\(\)]{7,20}$").WithMessage("Invalid phone format");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required")
            .MaximumLength(2000);
    }
}

public class CreateTryoutRequestValidator : AbstractValidator<CreateTryoutRequestRequest>
{
    public CreateTryoutRequestValidator()
    {
        RuleFor(x => x.ChildName)
            .NotEmpty().WithMessage("Child name is required")
            .MaximumLength(200);

        RuleFor(x => x.ChildAge)
            .InclusiveBetween(3, 18).WithMessage("Child age must be between 3 and 18");

        RuleFor(x => x.ParentName)
            .NotEmpty().WithMessage("Parent name is required")
            .MaximumLength(200);

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^[\+\d\s\-\(\)]{7,20}$").WithMessage("Invalid phone format");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format");

        RuleFor(x => x.Message)
            .MaximumLength(1000).When(x => x.Message is not null);
    }
}
