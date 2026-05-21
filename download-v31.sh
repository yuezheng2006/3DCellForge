#!/bin/bash

API_KEY="tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
PROXY="http://127.0.0.1:7897"
OUT_DIR="/Users/vincentyangmbp/Documents/github/3DCellForge/public/generated-models"

# Task IDs from the generation run
TASK_IDS=(
  "a2d68c72-2235-4bef-9410-83d605e0fdb9"
  "22ccaa24-8d9a-4839-81a4-6a87e309d4dc"
  "9c1ab47a-9bfa-49da-a3ec-15d86192a50b"
  "9085b394-ccd4-423a-913c-ac2fadbd8f95"
  "296227bc-481e-40e6-afdc-cd79ea6e9fb3"
  "2aa8abef-c607-4a25-a505-8e80dfe91fa2"
  "93f833e1-13a6-426d-9b4d-7ee441038cae"
)
NAMES=(
  "porsche-911-turbo-s"
  "mercedes-amg-g63"
  "tesla-model-s-plaid"
  "ford-f150-raptor"
  "toyota-gr-supra"
  "bmw-i8-roadster"
  "dodge-challenger-hellcat"
)

SUCCESS=0
FAIL=0

for i in 0 1 2 3 4 5 6; do
  TID="${TASK_IDS[$i]}"
  NAME="${NAMES[$i]}"
  OUT="${OUT_DIR}/${NAME}.glb"

  echo "[$((i+1))/7] ${NAME}"

  URL=$(curl -s --proxy "$PROXY" --max-time 30 \
    -H "Authorization: Bearer ${API_KEY}" \
    "https://api.tripo3d.ai/v2/openapi/task/${TID}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
output = d['data'].get('output', {})
url = output.get('pbr_model') or output.get('model') or ''
print(url)
" 2>/dev/null)

  if [ -z "$URL" ]; then
    echo "  No download URL found"
    FAIL=$((FAIL+1))
    echo ""
    continue
  fi

  echo "  Downloading..."
  curl -s --proxy "$PROXY" --connect-timeout 15 --max-time 300 -o "$OUT" "$URL"

  SIZE=$(stat -f%z "$OUT" 2>/dev/null || echo 0)
  if [ "$SIZE" -gt 1000000 ]; then
    SIZE_MB=$(echo "scale=1; $SIZE / 1048576" | bc)
    echo "  OK (${SIZE_MB}MB)"
    SUCCESS=$((SUCCESS+1))
  else
    echo "  FAILED (${SIZE} bytes), trying without proxy..."
    curl -s --connect-timeout 15 --max-time 300 -o "$OUT" "$URL"
    SIZE=$(stat -f%z "$OUT" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 1000000 ]; then
      SIZE_MB=$(echo "scale=1; $SIZE / 1048576" | bc)
      echo "  OK (${SIZE_MB}MB)"
      SUCCESS=$((SUCCESS+1))
    else
      echo "  FAILED (${SIZE} bytes)"
      FAIL=$((FAIL+1))
    fi
  fi
  echo ""
done

echo "Done! Success: ${SUCCESS}/7, Failed: ${FAIL}/7"
