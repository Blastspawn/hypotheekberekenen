#!/usr/bin/env bash

set -euo pipefail

# Kopieer dit bestand naar deploy.sh en vervang beide placeholders.
# Controleer het script voor gebruik; er wordt bewust niets automatisch gedeployed.
HOST="replace-with-ssh-host"
APP_DIR="/opt/apps/hypotheekberekenen"

ssh "$HOST" bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail

APP_DIR="$1"
cd "$APP_DIR"

git fetch origin
git checkout main
git pull --ff-only origin main
docker compose -f compose.production.yaml config --quiet
docker compose -f compose.production.yaml build
docker compose -f compose.production.yaml up -d
docker compose -f compose.production.yaml ps
docker compose -f compose.production.yaml logs --tail=30
REMOTE
