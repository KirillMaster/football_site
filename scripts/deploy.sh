#!/usr/bin/env bash
# deploy.sh — pull latest images and restart services
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPLOY_DIR"

echo "==> Pulling latest images..."
docker compose pull

echo "==> Bringing up nextjs and dotnet-api (no downtime for postgres/nginx)..."
docker compose up -d --no-deps --build nextjs dotnet-api

echo "==> Running EF Core migrations..."
docker compose exec -T dotnet-api dotnet Arsenal.API.dll --migrate

echo "==> Health check..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "==> Health check passed (HTTP $HTTP_STATUS). Deploy complete."
else
    echo "ERROR: Health check failed (HTTP $HTTP_STATUS). Rolling back..."
    docker compose up -d --no-deps dotnet-api
    exit 1
fi
