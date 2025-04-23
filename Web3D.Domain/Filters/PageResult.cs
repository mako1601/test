namespace Web3D.Domain.Filters;

public class PageResult<T>(T[] data, int totalCount) where T : class
{
    public T[] Data { get; } = data;
    public int TotalCount { get; } = totalCount;
}
