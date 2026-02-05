#!/usr/bin/env bash
set -euo pipefail

cd /srv/srv/2ndgen

if [ -d .git ]; then
  git fetch origin main
  git reset --hard origin/main
  git clean -fd
fi

docker compose up -d --build api api_nginx queue web

docker exec 2ndgen_api sh -lc "php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan cache:clear"
docker exec 2ndgen_api sh -lc "php artisan config:cache && php artisan route:cache && php artisan view:cache"

./_scripts/health.sh
