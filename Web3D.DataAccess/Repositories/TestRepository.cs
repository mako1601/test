using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Extensions;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class TestRepository(Web3DDbContext context) : ITestRepository
{
    public async Task CreateAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken)
            ?? throw new UserNotFoundException();

        user.LastActivity = DateTime.UtcNow;
        context.Users.Update(user);

        await context.Tests.AddAsync(test, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.Tests
            .Include(x => x.Questions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<PageResult<Test>> GetAllAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        return await context.Tests
            .Include(x => x.Questions)
            .Filter(filter, context)
            .Sort(sortParams, context)
            .ToPagedAsync(pageParams, cancellationToken);
    }

    public async Task UpdateAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken)
            ?? throw new UserNotFoundException();

        user.LastActivity = DateTime.UtcNow;
        context.Users.Update(user);

        context.Tests.Update(test);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken)
            ?? throw new UserNotFoundException();

        user.LastActivity = DateTime.UtcNow;
        context.Users.Update(user);

        context.Tests.Remove(test);
        await context.SaveChangesAsync(cancellationToken);
    }
}
