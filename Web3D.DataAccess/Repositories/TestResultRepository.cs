using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Extensions;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class TestResultRepository(Web3DDbContext context) : ITestResultRepository
{
    public async Task<long> StartTestAsync(TestResult testResult, CancellationToken cancellationToken = default)
    {
        await context.TestResults.AddAsync(testResult, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return testResult.Id;
    }

    public async Task UpdateAsync(TestResult testResult, CancellationToken cancellationToken = default)
    {
        context.TestResults.Update(testResult);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<TestResult?> GetTestResultByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.TestResults.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<long> GetAttemptAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        var testResult = await context.TestResults
            .Where(x => x.TestId == testId && x.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken);

        return testResult is null ? 1 : await context.TestResults
            .Where(x => x.TestId == testId && x.UserId == userId)
            .MaxAsync(x => x.Attempt + 1, cancellationToken);
    }

    public async Task<PageResult<TestResult>> GetAllAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        return await context.TestResults
            .Filter(filter)
            .Sort(sortParams, context)
            .ToPagedAsync(pageParams, cancellationToken);
    }
}
