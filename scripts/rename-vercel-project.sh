#!/bin/bash
# Rename Vercel project from tip-me to fu-pay-me via API
# Requires Vercel token: https://vercel.com/account/tokens
# Run: VERCEL_TOKEN=your_token ./scripts/rename-vercel-project.sh
# Or: export VERCEL_TOKEN=your_token && ./scripts/rename-vercel-project.sh

TOKEN="${VERCEL_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "Error: VERCEL_TOKEN not set."
  echo "Get a token from https://vercel.com/account/tokens"
  echo "Then run: VERCEL_TOKEN=your_token ./scripts/rename-vercel-project.sh"
  exit 1
fi

TEAM_ID="team_BW87IOUHsfYA4GjNGob8TIt2"
PROJECT_ID="prj_afkzyg90hJzmd2ZEPpFrVyIzZtva"

curl -s -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"fu-pay-me"}' | head -20

echo ""
echo "If successful, your project URL will be https://fu-pay-me.vercel.app"
