# См. статью по ссылке https://aka.ms/customizecontainer, чтобы узнать как настроить контейнер отладки и как Visual Studio использует этот Dockerfile для создания образов для ускорения отладки.

# Этот этап используется при запуске из VS в быстром режиме (по умолчанию для конфигурации отладки)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

# Этот этап используется для сборки проекта службы
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Web3D.API/Web3D.API.csproj", "Web3D.API/"]
COPY ["Web3D.BusinessLogic/Web3D.BusinessLogic.csproj", "Web3D.BusinessLogic/"]
COPY ["Web3D.DataAccess/Web3D.DataAccess.csproj", "Web3D.DataAccess/"]
COPY ["Web3D.Domain/Web3D.Domain.csproj", "Web3D.Domain/"]
RUN dotnet restore "./Web3D.API/Web3D.API.csproj"
COPY . .
WORKDIR "/src/Web3D.API"
RUN dotnet build "./Web3D.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этот этап используется для публикации проекта службы, который будет скопирован на последний этап
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Web3D.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Этот этап используется в рабочей среде или при запуске из VS в обычном режиме (по умолчанию, когда конфигурация отладки не используется)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Web3D.API.dll"]