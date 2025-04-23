using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.Dto;

namespace Web3D.BusinessLogic.Abstractions;

public interface ITestService
{
    public Task CreateAsync(long userId, string title, string description, ICollection<Question> questions, CancellationToken cancellationToken = default);
    public Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default);
    public Task<Test?> GetForPassingByIdAsync(long testId, CancellationToken cancellationToken = default);
    public Task<PageResult<Test>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
    public Task UpdateAsync(long testId, string newTitle, string newDescription, ICollection<Question> questions, CancellationToken cancellationToken = default);
    public Task DeleteAsync(long testId, CancellationToken cancellationToken = default);
    public Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default);
    public Task FinishTestAsync(long testResultId, ICollection<AnswerResultDto> answerResults, CancellationToken cancellationToken = default);
    public Task<TestResult?> GetTestResultByIdAsync(long testResultId, CancellationToken cancellationToken = default);
    public Task<PageResult<TestResult>> GetAllTestResultsAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default);
}
