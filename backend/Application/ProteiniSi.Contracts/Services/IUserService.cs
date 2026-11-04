using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IUserService
{
    Task<AuthResponseDto> RegisterAsync(UserForRegistrationDto registration);
    Task<AuthResponseDto> LoginAsync(UserForLoginDto login);
    Task<StatusMessageDto> ForgotPasswordAsync(ForgotPasswordDto request);
    Task<StatusMessageDto> ResetPasswordAsync(ResetPasswordDto request);
    Task<UserProfileDto> GetCurrentAsync(int userId);
    Task<BillingUpdateResponseDto> UpdateBillingInfoAsync(int userId, UserForUpdateDto info);
}
