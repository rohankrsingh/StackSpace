#!/bin/bash
HOST=${PUBLIC_IP:-$(curl -sf --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)}
HOST=${HOST:-localhost}
ON_ECS=false
[[ "$HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] && ON_ECS=true
LISTENING_PORTS=$(ss -tlnp 2>/dev/null | tail -n +2 | awk '{n=split($4,a,":"); if(n>0) {print a[n]}}' | sort -un | grep -v "^3000$")
echo ""
if [ -z "$LISTENING_PORTS" ]; then
  echo "  No app ports detected yet."
  echo "  Start your app (e.g., npm run dev), then run \"show-url\" again."
else
  echo "  🚀 App running! Access it here:"
  for PORT in $LISTENING_PORTS; do
    if [ "$ON_ECS" = true ] && [ "$PORT" -ge 3001 ] && [ "$PORT" -le 3010 ]; then
      echo "  ✅ http://$HOST:$PORT"
    elif [ "$ON_ECS" = true ]; then
      echo "  ⚠️  http://$HOST:$PORT (port $PORT not in open range 3001-3010)"
    else
      echo "  →  http://localhost:$PORT"
    fi
  done
fi
echo ""
