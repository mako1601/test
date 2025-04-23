using Web3D.Domain.Models;

namespace Web3D.DataAccess.Abstractions;

public interface ITokenRepository
{
    public Task CreateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
    public Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    public Task<RefreshToken?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    public Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
    public Task DeleteAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
}
