using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.Dto;

namespace Web3D.DataAccess.Abstractions;

public interface IUserRepository
{
    public Task RegisterAsync(User user, CancellationToken cancellationToken = default);
    public Task<User?> LoginAsync(string login, CancellationToken cancellationToken = default);
    public Task<bool> IsLoginTakenAsync(string login, CancellationToken cancellationToken = default);
    public Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<PageResult<UserDto>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task<List<User>> GetAllAsync(DateTime cutoffDate, CancellationToken cancellationToken = default);
    public Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    public Task DeleteAsync(User user, CancellationToken cancellationToken = default);
}
