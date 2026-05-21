#!/bin/bash

set -e

TRIPO_API_KEY="tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
BASE_URL="https://api.tripo3d.ai/v2/openapi"

echo "🚗 Regenerating all 7 car models with v3.1 Ultra quality"
echo ""
echo "Settings:"
echo "  - Model: v3.1-20260211 (latest)"
echo "  - Texture: HD (detailed)"
echo "  - Geometry: Ultra (up to 2M polygons)"
echo "  - Cost: 50 credits per model, 350 credits total"
echo ""

# Car images
declare -a cars=(
  "porsche-911-turbo-s:Porsche 911 Turbo S"
  "mercedes-amg-g63:Mercedes-AMG G63"
  "tesla-model-s-plaid:Tesla Model S Plaid"
  "ford-f150-raptor:Ford F-150 Raptor"
  "toyota-gr-supra:Toyota GR Supra"
  "bmw-i8-roadster:BMW i8 Roadster"
  "dodge-challenger-hellcat:Dodge Challenger Hellcat"
)

IMAGES_DIR="public/generated-models/car-reference-images"
OUTPUT_DIR="public/generated-models"

success_count=0
fail_count=0
total=${#cars[@]}

for car_info in "${cars[@]}"; do
  IFS=':' read -r car_name display_name <<< "$car_info"
  current=$((success_count + fail_count + 1))

  echo ""
  echo "📸 [$current/$total] $display_name"

  image_file="$IMAGES_DIR/${car_name}.png"

  if [ ! -f "$image_file" ]; then
    echo "   ⚠️  Image not found: ${car_name}.png"
    ((fail_count++))
    continue
  fi

  # Upload image
  echo -n "   Uploading image..."
  upload_response=$(curl -s -X POST "$BASE_URL/upload" \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -F "file=@$image_file")

  image_token=$(echo "$upload_response" | grep -o '"image_token":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$image_token" ]; then
    echo " ❌"
    echo "   Error: $upload_response"
    ((fail_count++))
    continue
  fi
  echo " ✓"

  # Create task with v3.1 Ultra settings
  echo -n "   Creating 3D generation task..."
  task_response=$(curl -s -X POST "$BASE_URL/task" \
    -H "Authorization: Bearer $TRIPO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"image_to_model\",
      \"file\": {
        \"type\": \"png\",
        \"file_token\": \"$image_token\"
      },
      \"model_version\": \"v3.1-20260211\",
      \"texture\": true,
      \"pbr\": true,
      \"texture_quality\": \"detailed\",
      \"geometry_quality\": \"detailed\",
      \"enable_image_autofix\": true
    }")

  task_id=$(echo "$task_response" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$task_id" ]; then
    echo " ❌"
    echo "   Error: $task_response"
    ((fail_count++))
    continue
  fi
  echo " ✓"
  echo "   Task ID: $task_id"

  # Poll for completion
  echo -n "   Generating 3D model..."
  while true; do
    sleep 5

    status_response=$(curl -s -X GET "$BASE_URL/task/$task_id" \
      -H "Authorization: Bearer $TRIPO_API_KEY")

    status=$(echo "$status_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    progress=$(echo "$status_response" | grep -o '"progress":[0-9]*' | cut -d':' -f2)

    if [ "$status" = "success" ]; then
      echo " ✓ (100%)"
      model_url=$(echo "$status_response" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
      break
    elif [ "$status" = "failed" ] || [ "$status" = "banned" ] || [ "$status" = "expired" ]; then
      echo " ❌"
      echo "   Task $status: $status_response"
      ((fail_count++))
      continue 2
    fi

    echo -ne "\r   Generating 3D model... ${progress}%"
  done

  # Download GLB
  echo -n "   Downloading GLB..."
  output_file="$OUTPUT_DIR/${car_name}.glb"

  curl -s -o "$output_file" "$model_url"

  if [ -f "$output_file" ]; then
    size=$(du -h "$output_file" | cut -f1)
    echo " ✓ ($size)"
    echo "   ✅ Success!"
    ((success_count++))
  else
    echo " ❌"
    echo "   Failed to download"
    ((fail_count++))
  fi
done

echo ""
echo "============================================================"
echo ""
echo "✨ Generation complete!"
echo "   Success: $success_count/$total"
echo "   Failed: $fail_count/$total"

if [ $success_count -gt 0 ]; then
  echo ""
  echo "📦 Models saved to: $OUTPUT_DIR/"
  echo ""
  echo "🚀 Next steps:"
  echo "   1. Review the generated models"
  echo "   2. git add $OUTPUT_DIR/*.glb"
  echo "   3. git commit -m \"Upgrade to v3.1 Ultra quality models\""
  echo "   4. git push"
fi
