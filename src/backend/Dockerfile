# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder

WORKDIR /src

# Restore dependencies first (layer cache)
COPY *.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . ./
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release --no-build -o /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

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

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "Arsenal.API.dll"]
