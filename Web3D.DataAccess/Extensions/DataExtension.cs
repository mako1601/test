using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;
using Web3D.DataAccess.Repositories;
using Microsoft.Extensions.Configuration;

namespace Web3D.DataAccess.Extensions;

public static class DataExtension
{
    public static IServiceCollection AddDataAccess(this IServiceCollection servicesCollection, IConfiguration configuration)
    {
        servicesCollection.AddScoped<IUserRepository, UserRepository>();
        servicesCollection.AddScoped<ITestRepository, TestRepository>();
        servicesCollection.AddScoped<IArticleRepository, ArticleRepository>();
        servicesCollection.AddScoped<ITestResultRepository, TestResultRepository>();
        servicesCollection.AddScoped<ITokenRepository, TokenRepository>();

        servicesCollection.AddDbContext<Web3DDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection") ?? throw new Exception("DefaultConnection is null"));
        });

        return servicesCollection;
    }
}
