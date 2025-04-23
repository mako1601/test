using Web3D.Domain.Models;
using Web3D.Domain.Filters;

namespace Web3D.DataAccess.Abstractions;

public interface ITestResultRepository
{
    public Task<long> StartTestAsync(TestResult testResult, CancellationToken cancellationToken = default);
    public Task UpdateAsync(TestResult testResult, CancellationToken cancellationToken = default);
    public Task<TestResult?> GetTestResultByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<long> GetAttemptAsync(long testId, long userId, CancellationToken cancellationToken = default);
    public Task<PageResult<TestResult>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
}
