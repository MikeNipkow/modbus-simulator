#!/bin/sh
set -e

# Determine API host from environment
API_URL="${API_URL:-http://127.0.0.1:3000/api/v1}"

HTML_DIR=/usr/share/nginx/html
ENV_FILE="$HTML_DIR/env-config.js"

cat > "$ENV_FILE" <<EOF
// Generated at container start
window.__API_BASE_URL__ = "${API_URL}";
EOF

exec "$@"
