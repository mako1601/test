using Web3D.Domain.Models;
using Web3D.Domain.Filters;

namespace Web3D.BusinessLogic.Abstractions;

public interface IArticleService
{
    public Task CreateAsync(long authorId, string title, string? description, string contentUrl, CancellationToken cancellationToken = default);
    public Task<Article?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<PageResult<Article>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task UpdateAsync(long id, string title, string? description, string contentUrl, CancellationToken cancellationToken = default);
    public Task DeleteAsync(long id, CancellationToken cancellationToken = default);
}
