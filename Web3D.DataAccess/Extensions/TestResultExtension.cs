using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class TestResultExtension
{
    public static IQueryable<TestResult> Filter(this IQueryable<TestResult> query, Filter filter)
    {
        if (filter.TestId != null && filter.TestId.Count != 0)
        {
            query = query.Where(x => filter.TestId.Contains(x.TestId));
        }

        if (filter.UserId != null && filter.UserId.Count != 0)
        {
            query = query.Where(x => filter.UserId.Contains(x.UserId));
        }

        return query;
    }

    public static IQueryable<TestResult> Sort(this IQueryable<TestResult> query, SortParams sortParams, Web3DDbContext context)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy, context))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy, context));
    }

    public static async Task<PageResult<TestResult>> ToPagedAsync(this IQueryable<TestResult> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<TestResult>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? count;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<TestResult>(result, count);
    }

    private static Expression<Func<TestResult, object>> GetKeySelector(string? orderBy, Web3DDbContext context)
    {
        if (string.IsNullOrEmpty(orderBy)) return x => x.StartedAt;

        return orderBy switch
        {
            "StartedAt" => x => x.StartedAt,
            "EndedAt" => x => x.EndedAt ?? x.StartedAt,
            "Score" => x => x.Score ?? 0,
            "Attempt" => x => x.Attempt,
            "Duration" => x => (x.EndedAt ?? x.StartedAt) - x.StartedAt,
            _ => x => x.StartedAt
        };
    }
}
