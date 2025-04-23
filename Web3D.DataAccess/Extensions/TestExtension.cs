using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class TestExtension
{
    public static IQueryable<Test> Filter(this IQueryable<Test> query, Filter filter, Web3DDbContext context)
    {
        if (!string.IsNullOrWhiteSpace(filter.SearchText))
        {
            var searchText = filter.SearchText.Trim();
            var keywords = searchText.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                     .Select(x => x.ToLower())
                                     .ToList();

            query = query
                .Join(
                    context.Users,
                    test => test.UserId,
                    user => user.Id,
                    (test, user) => new { test, user }
                )
                .Where(x => keywords.All(y =>
                    x.test.Title.ToLower().Contains(y) ||
                    (x.test.Description != null && x.test.Description.ToLower().Contains(y)) ||
                    string.Join(" ", x.user.LastName, x.user.FirstName, x.user.MiddleName)
                        .ToLower()
                        .Contains(y)
                ))
                .Select(x => x.test);
        }

        if (filter.TestId != null && filter.TestId.Count != 0)
        {
            query = query.Where(x => filter.TestId.Contains(x.Id));
        }

        if (filter.UserId != null && filter.UserId.Count != 0)
        {
            query = query.Where(x => filter.UserId.Contains(x.UserId));
        }

        return query;
    }

    public static IQueryable<Test> Sort(this IQueryable<Test> query, SortParams sortParams, Web3DDbContext context)
    {
        var testResults = context.TestResults
            .Select(tr => new
            {
                tr.TestId,
                tr.EndedAt,
                tr.Score,
                QuestionCount = context.Questions
                    .Where(q => q.TestId == tr.TestId)
                    .Count()
            });

        var testQuery = query
            .Join(context.Users,
                  test => test.UserId,
                  user => user.Id,
                  (test, user) => new
                  {
                      Test = test,
                      UserFullName = user.MiddleName == null
                          ? user.LastName + " " + user.FirstName
                          : user.LastName + " " + user.FirstName + " " + user.MiddleName
                  })
            .Select(x => new
            {
                x.Test,
                x.UserFullName,
                CompletedCount = testResults.Count(y => y.TestId == x.Test.Id && y.EndedAt != null),
                UnfinishedCount = testResults.Count(y => y.TestId == x.Test.Id && y.EndedAt == null),
                AverageScore = testResults
                    .Where(y => y.TestId == x.Test.Id && y.EndedAt != null && y.Score != null && y.QuestionCount != 0)
                    .Select(y => (double)(y.Score ?? 0) / y.QuestionCount)
                    .Any()
                        ? testResults
                            .Where(y => y.TestId == x.Test.Id && y.EndedAt != null && y.Score != null && y.QuestionCount != 0)
                            .Average(y => (double)(y.Score ?? 0) / y.QuestionCount)
                        : 0
            });

        testQuery = sortParams.OrderBy switch
        {
            "Title" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.Test.Title)
                : testQuery.OrderBy(x => x.Test.Title),

            "CreatedAt" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.Test.CreatedAt)
                : testQuery.OrderBy(x => x.Test.CreatedAt),

            "UpdatedAt" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.Test.UpdatedAt ?? x.Test.CreatedAt)
                : testQuery.OrderBy(x => x.Test.UpdatedAt ?? x.Test.CreatedAt),

            "QuestionCount" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.Test.Questions.Count)
                : testQuery.OrderBy(x => x.Test.Questions.Count),

            "User" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.UserFullName)
                : testQuery.OrderBy(x => x.UserFullName),

            "CompletedCount" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.CompletedCount)
                : testQuery.OrderBy(x => x.CompletedCount),

            "UnfinishedCount" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.UnfinishedCount)
                : testQuery.OrderBy(x => x.UnfinishedCount),

            "AverageScore" => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.AverageScore)
                : testQuery.OrderBy(x => x.AverageScore),

            _ => sortParams.SortDirection == SortDirection.Descending
                ? testQuery.OrderByDescending(x => x.Test.CreatedAt)
                : testQuery.OrderBy(x => x.Test.CreatedAt),
        };

        return testQuery.Select(x => x.Test);
    }

    public static async Task<PageResult<Test>> ToPagedAsync(this IQueryable<Test> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<Test>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? 10;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<Test>(result, count);
    }
}
