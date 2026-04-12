# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder

WORKDIR /src

# Copy solution + NuGet config + all csproj files (preserving dir structure)
# so dotnet restore can cache this layer independently from source changes.
COPY Arsenal.sln NuGet.config ./
COPY src/Arsenal.API/Arsenal.API.csproj                         src/Arsenal.API/
COPY src/Arsenal.Application/Arsenal.Application.csproj         src/Arsenal.Application/
COPY src/Arsenal.Domain/Arsenal.Domain.csproj                   src/Arsenal.Domain/
COPY src/Arsenal.Infrastructure/Arsenal.Infrastructure.csproj   src/Arsenal.Infrastructure/

RUN dotnet restore src/Arsenal.API/Arsenal.API.csproj

# Copy full source and publish
COPY . ./
RUN dotnet publish src/Arsenal.API/Arsenal.API.csproj \
        -c Release --no-restore -o /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system arsenal && adduser --system --ingroup arsenal arsenal

# Copy published output only
COPY --from=builder --chown=arsenal:arsenal /app/publish ./

# Uploads directory
RUN mkdir -p /app/uploads && chown arsenal:arsenal /app/uploads
VOLUME ["/app/uploads"]

USER arsenal

EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000 \
    DOTNET_RUNNING_IN_CONTAINER=true

HEALTHCHECK --interval=15s --timeout=10s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "Arsenal.API.dll"]
