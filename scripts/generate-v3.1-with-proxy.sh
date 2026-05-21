#!/bin/bash

set -e

TRIPO_API_KEY="${TRIPO_API_KEY:-tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM}"
PROXY="http://127.0.0.1:7897"
BASE_URL="https://api.tripo3d.ai/v2/openapi"

CARS=(
  "porsche-911-turbo-s"
  "mercedes-amg-g63"
  "tesla-model-s-plaid"
  "ford-f150-raptor"
  "toyota-gr-supra"
  "bmw-i8-roadster"
  "dodge-challenger-hellcat"
)

echo "Starting Tripo3D v3.1 Ultra quality generation..."
echo "Total cars: ${#CARS[@]}"
echo "Expected cost: $((${#CARS[@]} * 50)) credits"
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

for car in "${CARS[@]}"; do
  echo "============================================================"
  echo "Generating: $car"
  echo "============================================================"

  IMAGE_PATH="public/generated-models/car-reference-images/${car}.png"
  OUTPUT_PATH="public/generated-models/${car}.glb"

  if [ ! -f "$IMAGE_PATH" ]; then
    echo "✗ Image not found: $IMAGE_PATH"
    ((FAIL_COUNT++))
    continue
  fi

  # Step 1: Upload image
  echo "Uploading image..."
  UPLOAD_RESPONSE=$(curl -x "$PROXY" -s -X POST \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -F "file=@${IMAGE_PATH}" \
    "${BASE_URL}/upload")

  IMAGE_TOKEN=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.image_token')

  if [ "$IMAGE_TOKEN" = "null" ] || [ -z "$IMAGE_TOKEN" ]; then
    echo "✗ Upload failed: $UPLOAD_RESPONSE"
    ((FAIL_COUNT++))
    continue
  fi

  echo "✓ Image uploaded, token: $IMAGE_TOKEN"

  # Step 2: Create task with v3.1 Ultra settings
  echo "Creating task with v3.1 Ultra settings..."
  TASK_RESPONSE=$(curl -x "$PROXY" -s -X POST \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"image_to_model\",
      \"file\": {
        \"type\": \"png\",
        \"file_token\": \"$IMAGE_TOKEN\"
      },
      \"model_version\": \"v3.1-20260211\",
      \"texture\": true,
      \"pbr\": true,
      \"texture_quality\": \"detailed\",
      \"geometry_quality\": \"detailed\",
      \"enable_image_autofix\": true
    }" \
    "${BASE_URL}/task")

  TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.data.task_id')

  if [ "$TASK_ID" = "null" ] || [ -z "$TASK_ID" ]; then
    echo "✗ Task creation failed: $TASK_RESPONSE"
    ((FAIL_COUNT++))
    continue
  fi

  echo "✓ Task created: $TASK_ID"

  # Step 3: Poll for completion
  echo "Polling task status..."
  MAX_ATTEMPTS=120
  ATTEMPT=0

  while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    sleep 5

    STATUS_RESPONSE=$(curl -x "$PROXY" -s -X GET \
      -H "Authorization: Bearer $TRIPO_API_KEY" \
      "${BASE_URL}/task/${TASK_ID}")

    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.data.status')
    PROGRESS=$(echo "$STATUS_RESPONSE" | jq -r '.data.progress')

    echo "  Status: $STATUS, Progress: $PROGRESS%"

    if [ "$STATUS" = "success" ]; then
      MODEL_URL=$(echo "$STATUS_RESPONSE" | jq -r '.data.output.model')
      CREDITS=$(echo "$STATUS_RESPONSE" | jq -r '.data.consumed_credit')

      echo "✓ Task completed! Credits consumed: $CREDITS"

      # Step 4: Download model
      echo "Downloading model..."
      curl -x "$PROXY" -s -o "$OUTPUT_PATH" "$MODEL_URL"

      FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
      echo "✓ Model downloaded: $OUTPUT_PATH ($FILE_SIZE)"
      echo "✓ $car completed successfully!"

      ((SUCCESS_COUNT++))
      break
    elif [ "$STATUS" = "failed" ] || [ "$STATUS" = "banned" ] || [ "$STATUS" = "expired" ]; then
      echo "✗ Task $STATUS: $STATUS_RESPONSE"
      ((FAIL_COUNT++))
      break
    fi

    ((ATTEMPT++))
  done

  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "✗ Task timeout after $MAX_ATTEMPTS attempts"
    ((FAIL_COUNT++))
  fi

  echo ""
done

echo "============================================================"
echo "GENERATION SUMMARY"
echo "============================================================"
echo "✓ Successful: $SUCCESS_COUNT/${#CARS[@]}"
echo "✗ Failed: $FAIL_COUNT/${#CARS[@]}"
echo "Total credits consumed: ~$((SUCCESS_COUNT * 50)) credits"
