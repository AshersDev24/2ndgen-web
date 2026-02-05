#!/usr/bin/env bash
set -euo pipefail

cd /srv/srv/2ndgen

docker compose ps

echo
echo "== internal api =="
docker exec infra_caddy sh -lc "wget -qO- http://2ndgen_api_nginx/api/health"
echo

echo "== public api =="
curl -fsS https://api.2ndgen.uk/api/health | cat
echo

echo "== internal web (status + title) =="
docker exec infra_caddy sh -lc "wget -S -qO- http://2ndgen_web:3000 2>&1 | awk '/HTTP\\//{code=\$2} /<title>/{print \"HTTP \" code \": \" \$0; exit} END{if(!code) print \"NO_HTTP_STATUS\"}'"
echo

echo "== public web (status + title) =="
curl -fsS -D - https://2ndgen.uk -o /tmp/_2ndgen_home.html | awk "NR==1{print} END{}"
grep -m1 -o "<title>[^<]*</title>" /tmp/_2ndgen_home.html || true
echo
