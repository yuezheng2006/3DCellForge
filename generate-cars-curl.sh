#!/usr/bin/env bash

set -e

TRIPO_API_KEY="tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
BASE_URL="https://api.tripo3d.ai/v2/openapi"

generate_car() {
    local car_name=$1
    local image_path=$2
    local output_path="public/generated-models/${car_name}.glb"

    echo "=== Generating ${car_name} ==="

    # Step 1: Upload image
    echo "1. Uploading image..."
    upload_response=$(curl -s -X POST "${BASE_URL}/upload" \
        -H "Authorization: Bearer ${TRIPO_API_KEY}" \
        -F "file=@${image_path}")

    image_token=$(echo "$upload_response" | grep -o '"image_token":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$image_token" ]; then
        echo "   ✗ Upload failed: $upload_response"
        return 1
    fi

    echo "   Image token: ${image_token}"

    # Step 2: Create task
    echo "2. Creating 3D generation task..."
    task_response=$(curl -s -X POST "${BASE_URL}/task" \
        -H "Authorization: Bearer ${TRIPO_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"image_to_model\",
            \"file\": {
                \"type\": \"png\",
                \"file_token\": \"${image_token}\"
            },
            \"model_version\": \"v2.5-20250123\",
            \"texture\": true,
            \"pbr\": true
        }")

    task_id=$(echo "$task_response" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$task_id" ]; then
        echo "   ✗ Task creation failed: $task_response"
        return 1
    fi

    echo "   Task ID: ${task_id}"

    # Step 3: Poll for completion
    echo "3. Waiting for generation to complete..."
    while true; do
        status_response=$(curl -s -X GET "${BASE_URL}/task/${task_id}" \
            -H "Authorization: Bearer ${TRIPO_API_KEY}")

        status=$(echo "$status_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        progress=$(echo "$status_response" | grep -o '"progress":[0-9]*' | cut -d':' -f2)

        echo "   Status: ${status} (${progress}%)"

        if [ "$status" = "success" ]; then
            model_url=$(echo "$status_response" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
            echo "   Model URL: ${model_url}"

            # Step 4: Download model
            echo "4. Downloading GLB model..."
            curl -s -o "${output_path}" "${model_url}"

            file_size=$(ls -lh "${output_path}" | awk '{print $5}')
            echo "   ✓ Saved to ${output_path} (${file_size})"
            break
        elif [ "$status" = "failed" ] || [ "$status" = "banned" ] || [ "$status" = "expired" ]; then
            echo "   ✗ Task failed with status: ${status}"
            return 1
        fi

        sleep 5
    done

    echo ""
}

echo "Starting car model generation..."
echo ""

generate_car "bmw-i8-roadster" "public/generated-models/car-reference-images/bmw-i8-roadster.png"
generate_car "dodge-challenger-hellcat" "public/generated-models/car-reference-images/dodge-challenger-hellcat.png"

echo "=== Generation Complete ==="
