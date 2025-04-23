using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Models.Dto;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class UserService(
    IUserRepository userRepository,
    ITokenRepository tokenRepository,
    JwtService jwtService,
    IHttpContextAccessor httpContextAccessor)
    : IUserService
{
    public async Task<(string, string)> RegisterAsync(
        string login,
        string password,
        string lastName,
        string firstName,
        string? middleName,
        Role role,
        CancellationToken cancellationToken = default)
    {
        if (await userRepository.IsLoginTakenAsync(login, cancellationToken))
        {
            throw new LoginAlreadyTakenException();
        }

        var user = new User
        {
            Login = login,
            LastName = lastName,
            FirstName = firstName,
            MiddleName = middleName,
            Role = role,
            LastActivity = DateTime.UtcNow,
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, password);
        await userRepository.RegisterAsync(user, cancellationToken);

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = JwtService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent,
        };
        await tokenRepository.CreateAsync(refreshToken, cancellationToken);

        return (jwtService.GenerateAccessToken(user), refreshToken.Token);
    }

    public async Task<(string, string)> LoginAsync(
        string login,
        string password,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.LoginAsync(login, cancellationToken)
            ?? throw new InvalidLoginOrPasswordException();
        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, password);

        if (result is PasswordVerificationResult.Success)
        {
            user.LastActivity = DateTime.UtcNow;
            await userRepository.UpdateAsync(user, cancellationToken);

            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = JwtService.GenerateRefreshToken(),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent
            };
            await tokenRepository.CreateAsync(refreshToken, cancellationToken);

            return (jwtService.GenerateAccessToken(user), refreshToken.Token);
        }
        else
        {
            throw new InvalidLoginOrPasswordException();
        }
    }

    public async Task<UserDto> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new UserNotFoundException();

        return new UserDto
        {
            Id = user.Id,
            LastName = user.LastName,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            Role = user.Role
        };
    }

    public async Task<PageResult<UserDto>> GetAllAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        var users = await userRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return users;
    }

    public async Task UpdateAsync(
        long id,
        string newLastName,
        string newFirstName,
        string? newMiddleName,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new UserNotFoundException();

        user.LastName = newLastName;
        user.FirstName = newFirstName;
        user.MiddleName = newMiddleName;
        user.LastActivity = DateTime.UtcNow;

        await userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new UserNotFoundException();
        await userRepository.DeleteAsync(user, cancellationToken);
    }

    public async Task UpdatePasswordAsync(
        long id,
        string oldPassword,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken) 
            ?? throw new UserNotFoundException();
        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, oldPassword);

        if (result is PasswordVerificationResult.Success)
        {
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, newPassword);
            await userRepository.UpdateAsync(user, cancellationToken);
        }
        else
        {
            throw new InvalidLoginOrPasswordException();
        }
    }

    public async Task UpdateRoleAsync(
        long callerUserId,
        long targetUserId,
        Role newRole,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(targetUserId, cancellationToken)
            ?? throw new UserNotFoundException();

        user.Role = newRole;

        await userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task<string> RefreshAccessTokenAsync(long userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new UserNotFoundException();
        return jwtService.GenerateAccessToken(user);
    }
}
