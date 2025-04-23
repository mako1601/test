using Web3D.Domain.Models;
using Web3D.Domain.Filters;

namespace Web3D.DataAccess.Abstractions;

public interface IArticleRepository
{
    public Task CreateAsync(Article article, CancellationToken cancellationToken = default);
    public Task<Article?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<PageResult<Article>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task UpdateAsync(Article article, CancellationToken cancellationToken = default);
    public Task DeleteAsync(Article article, CancellationToken cancellationToken = default);
}
