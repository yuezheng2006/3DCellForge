#!/bin/bash

TRIPO_API_KEY="tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
PROXY="http://127.0.0.1:7897"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_DIR="$BASE_DIR/public/generated-models/car-reference-images"
OUTPUT_DIR="$BASE_DIR/public/generated-models"

declare -a cars=(
  "porsche-911-turbo-s:Porsche 911 Turbo S"
  "mercedes-amg-g63:Mercedes-AMG G63"
  "tesla-model-s-plaid:Tesla Model S Plaid"
  "ford-f150-raptor:Ford F-150 Raptor"
  "toyota-gr-supra:Toyota GR Supra"
  "bmw-i8-roadster:BMW i8 Roadster"
  "dodge-challenger-hellcat:Dodge Challenger SRT Hellcat"
)

total_credits=0
success_count=0

for car_entry in "${cars[@]}"; do
  IFS=':' read -r car_name car_display <<< "$car_entry"

  echo ""
  echo "[$car_display] Starting generation..."

  # Step 1: Upload image
  echo "  1. Uploading image..."
  upload_response=$(curl --proxy "$PROXY" -s -X POST "https://api.tripo3d.ai/v2/openapi/upload" \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -F "file=@$IMAGE_DIR/${car_name}.png")

  image_token=$(echo "$upload_response" | grep -o '"image_token":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$image_token" ]; then
    echo "     ✗ Upload failed: $upload_response"
    continue
  fi

  echo "     ✓ Image token: $image_token"

  # Step 2: Create task
  echo "  2. Creating 3D generation task..."
  task_response=$(curl --proxy "$PROXY" -s -X POST "https://api.tripo3d.ai/v2/openapi/task" \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"image_to_model\",
      \"file\": {
        \"type\": \"png\",
        \"file_token\": \"$image_token\"
      },
      \"model_version\": \"v2.5-20250123\",
      \"texture\": true,
      \"pbr\": true
    }")

  task_id=$(echo "$task_response" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$task_id" ]; then
    echo "     ✗ Task creation failed: $task_response"
    continue
  fi

  echo "     ✓ Task ID: $task_id"

  # Step 3: Poll for completion
  echo "  3. Waiting for generation to complete..."
  max_attempts=60
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    sleep 10

    status_response=$(curl --proxy "$PROXY" -s -X GET "https://api.tripo3d.ai/v2/openapi/task/$task_id" \
      -H "Authorization: Bearer $TRIPO_API_KEY")

    status=$(echo "$status_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    progress=$(echo "$status_response" | grep -o '"progress":[0-9]*' | cut -d':' -f2)

    echo "     Status: $status, Progress: ${progress}%"

    if [ "$status" = "success" ]; then
      model_url=$(echo "$status_response" | grep -o '"model":"[^"]*"' | sed 's/\\//g' | cut -d'"' -f4)
      credits=$(echo "$status_response" | grep -o '"consumed_credit":[0-9]*' | cut -d':' -f2)

      echo "  4. Downloading GLB model..."
      curl --proxy "$PROXY" -s -o "$OUTPUT_DIR/${car_name}.glb" "$model_url"

      echo "     ✓ Saved to: $OUTPUT_DIR/${car_name}.glb"
      echo "     Credits consumed: $credits"

      total_credits=$((total_credits + credits))
      success_count=$((success_count + 1))
      break
    elif [ "$status" = "failed" ] || [ "$status" = "banned" ]; then
      echo "     ✗ Task failed with status: $status"
      break
    fi

    attempt=$((attempt + 1))
  done

  if [ $attempt -eq $max_attempts ]; then
    echo "     ✗ Task timed out"
  fi
done

echo ""
echo "=== Generation Summary ==="
echo "Total models generated: $success_count/7"
echo "Total credits consumed: $total_credits"
