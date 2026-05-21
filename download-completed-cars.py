#!/usr/bin/env python3
import requests
import os
import json

API_KEY = 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM'
BASE_URL = 'https://api.tripo3d.ai/v2/openapi'

headers = {
    'Authorization': f'Bearer {API_KEY}'
}

# Use proxy if available
proxies = {
    'http': os.environ.get('HTTP_PROXY', ''),
    'https': os.environ.get('HTTPS_PROXY', '')
} if os.environ.get('HTTP_PROXY') else None

tasks = {
    'BMW i8 Roadster': 'ea62a254-6052-47b0-b2e7-327e95f3042a',
    'Dodge Challenger Hellcat': '9cd6d675-a230-4a9d-bb21-65a122f4bd07'
}

for car_name, task_id in tasks.items():
    print(f"\n=== Fetching {car_name} ===")
    print(f"Task ID: {task_id}")

    try:
        response = requests.get(
            f'{BASE_URL}/task/{task_id}',
            headers=headers,
            proxies=proxies,
            timeout=60
        )

        result = response.json()
        print(f"Full response: {json.dumps(result, indent=2)}")

        if result.get('code') == 0:
            data = result['data']
            status = data.get('status')
            print(f"Status: {status}")

            if status == 'success':
                output = data.get('output', {})
                print(f"Output keys: {list(output.keys())}")

                # Try to find the model URL
                model_url = None
                for key in ['model', 'base_model_url', 'rendered_image', 'glb_url']:
                    if key in output:
                        model_url = output[key]
                        print(f"Found model at key '{key}': {model_url}")
                        break

                if model_url:
                    # Download the model
                    print(f"Downloading model...")
                    model_response = requests.get(model_url, proxies=proxies, timeout=120)

                    filename = f"public/models/{car_name.lower().replace(' ', '-')}.glb"
                    with open(filename, 'wb') as f:
                        f.write(model_response.content)
                    print(f"✓ Saved to {filename}")
                else:
                    print(f"✗ Could not find model URL in output")
        else:
            print(f"✗ API error: {result}")

    except Exception as e:
        print(f"✗ Error: {e}")

print("\n=== Complete ===")
