#!/usr/bin/env bash

set -euo pipefail

HOST="web-prod"
APP_DIR="/opt/apps/hypotheekberekenen"

echo "Deploying Hypotheekberekenen production..."

ssh "$HOST" bash -s -- "$APP_DIR" << 'REMOTE'
set -euo pipefail

APP_DIR="$1"
cd "$APP_DIR"

echo "Fetching latest source..."
git fetch origin

echo "Updating main..."
git checkout main
git pull --ff-only origin main

echo "Validating Compose..."
docker compose -f compose.production.yaml config --quiet

echo "Building..."
docker compose -f compose.production.yaml build

echo "Starting updated container..."
docker compose -f compose.production.yaml up -d

echo "Container status:"
docker compose -f compose.production.yaml ps

echo "Recent logs:"
docker compose -f compose.production.yaml logs --tail=30

REMOTE

echo "Hypotheekberekenen deployment complete."
