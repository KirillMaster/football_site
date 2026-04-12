FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Arsenal.API/Arsenal.API.csproj", "src/Arsenal.API/"]
COPY ["src/Arsenal.Application/Arsenal.Application.csproj", "src/Arsenal.Application/"]
COPY ["src/Arsenal.Domain/Arsenal.Domain.csproj", "src/Arsenal.Domain/"]
COPY ["src/Arsenal.Infrastructure/Arsenal.Infrastructure.csproj", "src/Arsenal.Infrastructure/"]

RUN dotnet restore "src/Arsenal.API/Arsenal.API.csproj"

COPY . .
RUN dotnet build "src/Arsenal.API/Arsenal.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "src/Arsenal.API/Arsenal.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Arsenal.API.dll"]
