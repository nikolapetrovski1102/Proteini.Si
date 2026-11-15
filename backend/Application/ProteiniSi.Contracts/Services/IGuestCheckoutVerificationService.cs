using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

/// <summary>Email codes that guests must confirm before placing a cash-on-delivery order.</summary>
public interface IGuestCheckoutVerificationService
{
    Task<GuestCheckoutCodeSentDto> SendCodeAsync(GuestCheckoutCodeRequestDto request);
    GuestCheckoutVerifiedDto ConfirmCode(GuestCheckoutCodeConfirmDto request);
    bool IsVerified(string? email, string? verificationToken);
}
