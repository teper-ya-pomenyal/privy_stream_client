#!/bin/sh
# Запускается nginx-образом перед стартом (docker-entrypoint.d).
# Пишет config.json и заголовки безопасности из переменных окружения:
#   PRIVY_NODE_URL  — адрес узла, например https://node.example или https://example.com/api
#   PRIVY_NODE_NAME — имя узла в интерфейсе (необязательно, по умолчанию — домен)
set -eu

HTML=/usr/share/nginx/html
url="${PRIVY_NODE_URL:-}"
name="${PRIVY_NODE_NAME:-}"
origin=""

json_str() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

if [ -n "$url" ]; then
  origin=$(printf '%s' "$url" | sed -nE 's|^(https?://[^/?#]+).*|\1|p')
  [ -n "$origin" ] || echo "privy: PRIVY_NODE_URL должен начинаться с https:// (получено: $url)" >&2
fi

if [ -n "$origin" ]; then
  printf '{ "node": { "url": "%s", "name": "%s" } }\n' "$(json_str "$url")" "$(json_str "$name")" > "$HTML/config.json"
  echo "privy: узел $url"
else
  # Приложение покажет экран «веб-версия не настроена».
  printf '{ "node": null }\n' > "$HTML/config.json"
  echo "privy: узел не задан (PRIVY_NODE_URL)" >&2
fi

# Страница может ходить только на свой узел.
csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: $origin; media-src 'self' blob: $origin; connect-src 'self' $origin; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"

cat > /etc/nginx/privy/security-headers.conf <<CONF
add_header Content-Security-Policy "$csp" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
CONF
