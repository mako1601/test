using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Web3D.DataAccess.Contexts;

namespace Web3D.BusinessLogic.Extensions;

public static class MigrationExtension
{
    public static void ApplyMigrations(this IApplicationBuilder applicationBuilder)
    {
        using var scope = applicationBuilder.ApplicationServices.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<Web3DDbContext>();
        context.Database.Migrate();
    }
}
