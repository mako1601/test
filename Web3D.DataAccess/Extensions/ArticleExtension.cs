using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class ArticleExtension
{
    public static IQueryable<Article> Filter(this IQueryable<Article> query, Filter filter, Web3DDbContext context)
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
                    article => article.UserId,
                    user => user.Id,
                    (article, user) => new { article, user }
                )
                .Where(x => keywords.All(y =>
                    x.article.Title.ToLower().Contains(y) ||
                   (x.article.Description != null && x.article.Description.ToLower().Contains(y)) ||
                    string.Join(" ", x.user.LastName, x.user.FirstName, x.user.MiddleName)
                        .ToLower()
                        .Contains(y)
                ))
                .Select(x => x.article);
        }

        if (filter.UserId != null && filter.UserId.Count != 0)
        {
            query = query.Where(x => filter.UserId.Contains(x.UserId));
        }

        return query;
    }

    public static IQueryable<Article> Sort(this IQueryable<Article> query, SortParams sortParams, Web3DDbContext context)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy, context))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy, context));
    }

    public static async Task<PageResult<Article>> ToPagedAsync(this IQueryable<Article> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<Article>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? 10;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<Article>(result, count);
    }

    private static Expression<Func<Article, object>> GetKeySelector(string? orderBy, Web3DDbContext context)
    {
        if (string.IsNullOrEmpty(orderBy)) return x => x.Title;

        return orderBy switch
        {
            nameof(Article.CreatedAt) => x => x.CreatedAt,
            nameof(Article.UpdatedAt) => x => x.UpdatedAt ?? x.CreatedAt,
            nameof(Article.UserId) => x =>
                context.Users
                    .Where(y => y.Id == x.UserId)
                    .Select(y => y.MiddleName == null ? y.LastName + " " + y.FirstName : y.LastName + " " + y.FirstName + " " + y.MiddleName)
                    .FirstOrDefault() ?? string.Empty,
            _ => x => x.Title
        };
    }
}
