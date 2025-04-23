using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

using Web3D.DataAccess.Abstractions;

namespace Web3D.BusinessLogic.BackgroundServices;

public class UserCleanupService(IServiceProvider serviceProvider) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CleanupInactiveUsers();
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

    private async Task CleanupInactiveUsers()
    {
        using var scope = serviceProvider.CreateAsyncScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var inactiveUsers = await userRepository.GetAllAsync(DateTime.UtcNow.AddYears(-1));

        foreach (var user in inactiveUsers)
        {
            await userRepository.DeleteAsync(user);
        }
    }
}
