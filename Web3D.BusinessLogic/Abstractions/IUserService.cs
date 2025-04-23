using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.Dto;

namespace Web3D.BusinessLogic.Abstractions;

public interface IUserService
{
    public Task<(string, string)> RegisterAsync(string login, string password, string lastName, string firstName, string? middleName, Role role, CancellationToken cancellationToken = default);
    public Task<(string, string)> LoginAsync(string login, string password, CancellationToken cancellationToken = default);
    public Task<UserDto> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<PageResult<UserDto>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task UpdateAsync(long id, string newLastName, string newFirstName, string? newMiddleName, CancellationToken cancellationToken = default);
    public Task DeleteAsync(long id, CancellationToken cancellationToken = default);
    public Task UpdatePasswordAsync(long id, string oldPassword, string newPassword, CancellationToken cancellationToken = default);
    public Task UpdateRoleAsync(long callerUserId, long targetUserId, Role newRole, CancellationToken cancellationToken = default);
    public Task<string> RefreshAccessTokenAsync(long userId, CancellationToken cancellationToken = default);
}
