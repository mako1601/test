using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class TokenRepository(Web3DDbContext context) : ITokenRepository
{
    public async Task CreateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await context.RefreshTokens.FirstOrDefaultAsync(x => x.Token.Equals(token), cancellationToken);
    }

    public async Task<RefreshToken?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await context.RefreshTokens.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        context.RefreshTokens.Update(refreshToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        context.RefreshTokens.Remove(refreshToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
