using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.Dto;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Extensions;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class UserRepository(Web3DDbContext context) : IUserRepository
{
    public async Task RegisterAsync(User user, CancellationToken cancellationToken = default)
    {
        await context.Users.AddAsync(user, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<User?> LoginAsync(string login, CancellationToken cancellationToken = default)
    {
        return await context.Users.FirstOrDefaultAsync(x => x.Login.Equals(login), cancellationToken: cancellationToken);
    }

    public async Task<bool> IsLoginTakenAsync(string login, CancellationToken cancellationToken = default)
    {
        return await context.Users.AnyAsync(x => x.Login.Equals(login), cancellationToken: cancellationToken);
    }

    public async Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
    }

    public async Task<PageResult<UserDto>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .Filter(filter)
            .Sort(sortParams)
            .ToPagedAsync(pageParams, cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .Where(x => x.LastActivity < cutoffDate && x.Role != Role.Admin)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        context.Users.Remove(user);
        await context.SaveChangesAsync(cancellationToken);
    }
}
