#!/bin/bash

API_KEY="tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
BASE_URL="https://api.tripo3d.ai/v2/openapi"
PROXY="http://127.0.0.1:7897"
IMAGES_DIR="public/generated-models/car-reference-images"
OUTPUT_DIR="public/generated-models"

CARS=("porsche-911-turbo-s" "mercedes-amg-g63" "tesla-model-s-plaid" "ford-f150-raptor" "toyota-gr-supra" "bmw-i8-roadster" "dodge-challenger-hellcat")
NAMES=("Porsche 911 Turbo S" "Mercedes-AMG G63" "Tesla Model S Plaid" "Ford F-150 Raptor" "Toyota GR Supra" "BMW i8 Roadster" "Dodge Challenger Hellcat")

echo "Regenerating all 7 car models with v3.1 Ultra quality"
echo ""

SUCCESS=0
FAIL=0

for i in "${!CARS[@]}"; do
  CAR="${CARS[$i]}"
  NAME="${NAMES[$i]}"
  IMG="${IMAGES_DIR}/${CAR}.png"
  OUT="${OUTPUT_DIR}/${CAR}.glb"

  echo "[$((i+1))/7] ${NAME}"

  if [ ! -f "$IMG" ]; then
    echo "  SKIP: image not found"
    FAIL=$((FAIL+1))
    echo ""
    continue
  fi

  # Step 1: Upload image
  echo "  Uploading image..."
  UPLOAD_RESP=$(curl -s --proxy "$PROXY" --connect-timeout 15 --max-time 60 \
    -H "Authorization: Bearer ${API_KEY}" \
    -F "file=@${IMG}" \
    "${BASE_URL}/upload" 2>&1)

  TOKEN=$(echo "$UPLOAD_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['image_token'])" 2>/dev/null)

  if [ -z "$TOKEN" ]; then
    echo "  Upload FAILED: $UPLOAD_RESP"
    FAIL=$((FAIL+1))
    echo ""
    continue
  fi
  echo "  Upload OK (token: ${TOKEN:0:8}...)"

  # Step 2: Create task with v3.1 Ultra
  echo "  Creating v3.1 Ultra task..."
  TASK_RESP=$(curl -s --proxy "$PROXY" --connect-timeout 15 --max-time 60 \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "image_to_model",
      "file": {"type": "png", "file_token": "'"$TOKEN"'"},
      "model_version": "v3.1-20260211",
      "texture": true,
      "pbr": true,
      "texture_quality": "detailed",
      "geometry_quality": "detailed",
      "enable_image_autofix": true
    }' \
    "${BASE_URL}/task" 2>&1)

  TASK_ID=$(echo "$TASK_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['task_id'])" 2>/dev/null)

  if [ -z "$TASK_ID" ]; then
    echo "  Task creation FAILED: $TASK_RESP"
    FAIL=$((FAIL+1))
    echo ""
    continue
  fi
  echo "  Task created (id: ${TASK_ID})"

  # Step 3: Poll for completion
  echo "  Polling for completion..."
  MAX_POLLS=120
  POLL_COUNT=0
  MODEL_URL=""
  LAST_PROGRESS=0

  while [ $POLL_COUNT -lt $MAX_POLLS ]; do
    sleep 10
    POLL_COUNT=$((POLL_COUNT+1))

    STATUS_RESP=$(curl -s --proxy "$PROXY" --connect-timeout 10 --max-time 30 \
      -H "Authorization: Bearer ${API_KEY}" \
      "${BASE_URL}/task/${TASK_ID}" 2>&1)

    STATUS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['status'])" 2>/dev/null)
    PROGRESS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['progress'])" 2>/dev/null)

    if [ -n "$PROGRESS" ] && [ "$PROGRESS" != "$LAST_PROGRESS" ]; then
      echo "  Progress: ${PROGRESS}%"
      LAST_PROGRESS="$PROGRESS"
    fi

    if [ "$STATUS" = "success" ]; then
      MODEL_URL=$(echo "$STATUS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['output']['model'])" 2>/dev/null)
      echo "  Generation complete!"
      break
    elif [ "$STATUS" = "failed" ] || [ "$STATUS" = "banned" ] || [ "$STATUS" = "expired" ]; then
      echo "  Generation FAILED: task ${STATUS}"
      MODEL_URL=""
      break
    fi
  done

  if [ -z "$MODEL_URL" ]; then
    if [ $POLL_COUNT -ge $MAX_POLLS ]; then
      echo "  TIMEOUT after ${MAX_POLLS} polls"
    fi
    FAIL=$((FAIL+1))
    echo ""
    continue
  fi

  # Step 4: Download GLB - try without proxy first (CDN URL), then with proxy
  echo "  Downloading GLB..."
  DL_STATUS=$(curl -s --connect-timeout 15 --max-time 180 -o "$OUT" -w "%{http_code}|%{size_download}" "$MODEL_URL" 2>&1)

  HTTP_CODE=$(echo "$DL_STATUS" | cut -d'|' -f1)
  DL_SIZE=$(echo "$DL_STATUS" | cut -d'|' -f2)

  if [ "$DL_SIZE" -lt 1000000 ] 2>/dev/null; then
    echo "  Direct download got ${DL_SIZE} bytes, trying with proxy..."
    DL_STATUS=$(curl -s --proxy "$PROXY" --connect-timeout 15 --max-time 180 -o "$OUT" -w "%{http_code}|%{size_download}" "$MODEL_URL" 2>&1)
    HTTP_CODE=$(echo "$DL_STATUS" | cut -d'|' -f1)
    DL_SIZE=$(echo "$DL_STATUS" | cut -d'|' -f2)
  fi

  SIZE=$(stat -f%z "$OUT" 2>/dev/null || echo 0)
  if [ "$SIZE" -gt 1000000 ]; then
    SIZE_MB=$(echo "scale=1; $SIZE / 1048576" | bc)
    echo "  Download OK (${SIZE_MB}MB)"
    SUCCESS=$((SUCCESS+1))
  else
    echo "  Download FAILED (got ${SIZE} bytes, HTTP ${HTTP_CODE})"
    FAIL=$((FAIL+1))
  fi

  echo ""
done

echo "========================================"
echo "Done! Success: ${SUCCESS}/7, Failed: ${FAIL}/7"
