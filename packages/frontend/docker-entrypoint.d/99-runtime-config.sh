#!/bin/sh
set -e

# Determine API host from environment (no default)
API_URL="${API_URL}"

HTML_DIR=/usr/share/nginx/html
ENV_FILE="$HTML_DIR/env-config.js"

if [ -n "$API_URL" ]; then
	cat > "$ENV_FILE" <<EOF
// Generated at container start
window.__API_BASE_URL__ = "${API_URL}";
EOF
else
	# No API_URL provided — expose undefined so frontend can apply its own fallback
	cat > "$ENV_FILE" <<EOF
// Generated at container start
// No API_URL provided; frontend should use its internal defaults.
window.__API_BASE_URL__ = undefined;
EOF
fi

exec "$@"
