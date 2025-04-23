using Web3D.Domain.Models;
using Web3D.Domain.Filters;

namespace Web3D.DataAccess.Abstractions;

public interface ITestRepository
{
    public Task CreateAsync(Test test, CancellationToken cancellationToken = default);
    public Task<Test?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<PageResult<Test>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task UpdateAsync(Test test, CancellationToken cancellationToken = default);
    public Task DeleteAsync(Test test, CancellationToken cancellationToken = default);
}
