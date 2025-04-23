using Microsoft.AspNetCore.Http;

using Web3D.Domain.Models;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class TokenService(
    ITokenRepository tokenRepository,
    IHttpContextAccessor httpContextAccessor)
    : ITokenService
{
    public async Task CreateAsync(long userId, CancellationToken cancellationToken = default)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = JwtService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent
        };

        await tokenRepository.CreateAsync(refreshToken, cancellationToken);
    }
    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await tokenRepository.GetByTokenAsync(token, cancellationToken)
            ?? throw new RefreshTokenNotFoundException();
        return refreshToken;
    }

    public async Task<RefreshToken?> UpdateByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await tokenRepository.GetByTokenAsync(token, cancellationToken)
            ?? throw new RefreshTokenNotFoundException();

        refreshToken.Token = JwtService.GenerateRefreshToken();
        refreshToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
        refreshToken.IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        refreshToken.UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent;

        await tokenRepository.UpdateAsync(refreshToken, cancellationToken);
        return refreshToken;
    }

    public async Task DeleteAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await tokenRepository.GetByTokenAsync(token, cancellationToken)
            ?? throw new RefreshTokenNotFoundException();
        await tokenRepository.DeleteAsync(refreshToken, cancellationToken);
    }
}
