using Web3D.Domain.Models;

namespace Web3D.BusinessLogic.Abstractions;

public interface ITokenService
{
    public Task CreateAsync(long userId, CancellationToken cancellationToken = default);
    public Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellation = default);
    public Task<RefreshToken?> UpdateByTokenAsync(string token, CancellationToken cancellationToken = default);
    public Task DeleteAsync(string token, CancellationToken cancellationToken = default);
}
