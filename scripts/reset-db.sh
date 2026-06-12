#!/usr/bin/env bash
set -euo pipefail
docker compose down -v
docker compose up -d
echo "Base reiniciada. Ejecuta: docker compose ps"
