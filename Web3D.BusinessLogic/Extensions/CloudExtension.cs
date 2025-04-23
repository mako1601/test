using CloudinaryDotNet;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Web3D.BusinessLogic.Extensions;

public static class CloudExtension
{
    public static IServiceCollection AddCloudinary(this IServiceCollection servicesCollection, IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            throw new Exception("Cloudinary settings are missing");
        }

        var cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));

        servicesCollection.AddSingleton(cloudinary);

        return servicesCollection;
    }
}
