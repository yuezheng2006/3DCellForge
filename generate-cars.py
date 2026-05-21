#!/usr/bin/env python3
import requests
import json
import time
import os

TRIPO_API_KEY = "tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM"
BASE_URL = "https://api.tripo3d.ai/v2/openapi"

# Use proxy if available
proxies = {
    'http': 'http://127.0.0.1:7897',
    'https': 'http://127.0.0.1:7897'
}

headers = {
    'Authorization': f'Bearer {TRIPO_API_KEY}'
}

cars = [
    {
        'name': 'BMW i8 Roadster',
        'image_path': 'public/generated-models/car-reference-images/bmw-i8-roadster.png',
        'output_path': 'public/generated-models/bmw-i8-roadster.glb'
    },
    {
        'name': 'Dodge Challenger Hellcat',
        'image_path': 'public/generated-models/car-reference-images/dodge-challenger-hellcat.png',
        'output_path': 'public/generated-models/dodge-challenger-hellcat.glb'
    }
]

def upload_image(image_path):
    print(f"1. Uploading image...")
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f'{BASE_URL}/upload',
            headers=headers,
            files=files,
            proxies=proxies,
            timeout=60
        )

    result = response.json()
    if result.get('code') == 0:
        image_token = result['data']['image_token']
        print(f"   Image token: {image_token}")
        return image_token
    else:
        print(f"   ✗ Upload failed: {result}")
        return None

def create_task(image_token):
    print(f"2. Creating 3D generation task...")
    payload = {
        'type': 'image_to_model',
        'file': {
            'type': 'png',
            'file_token': image_token
        },
        'model_version': 'v2.5-20250123',
        'texture': True,
        'pbr': True
    }

    response = requests.post(
        f'{BASE_URL}/task',
        headers={**headers, 'Content-Type': 'application/json'},
        json=payload,
        proxies=proxies,
        timeout=60
    )

    result = response.json()
    if result.get('code') == 0:
        task_id = result['data']['task_id']
        print(f"   Task ID: {task_id}")
        return task_id
    else:
        print(f"   ✗ Task creation failed: {result}")
        return None

def poll_task(task_id):
    print(f"3. Waiting for generation to complete...")
    while True:
        response = requests.get(
            f'{BASE_URL}/task/{task_id}',
            headers=headers,
            proxies=proxies,
            timeout=60
        )

        result = response.json()
        if result.get('code') == 0:
            status = result['data']['status']
            progress = result['data'].get('progress', 0)
            print(f"   Status: {status} ({progress}%)")

            if status == 'success':
                output_data = result['data'].get('output', {})
                # Try different possible paths for the model URL
                model_url = (output_data.get('model') or
                           output_data.get('rendered_image') or
                           output_data.get('base_model_url'))

                if not model_url:
                    print(f"   Full output data: {output_data}")
                    print(f"   ✗ Could not find model URL in response")
                    return None

                print(f"   Model URL: {model_url}")
                return model_url
            elif status in ['failed', 'banned', 'expired']:
                print(f"   ✗ Task failed with status: {status}")
                return None
        else:
            print(f"   ✗ Poll failed: {result}")
            return None

        time.sleep(5)

def download_model(model_url, output_path):
    print(f"4. Downloading GLB model...")
    response = requests.get(model_url, proxies=proxies, timeout=120)

    with open(output_path, 'wb') as f:
        f.write(response.content)

    file_size = os.path.getsize(output_path)
    print(f"   ✓ Saved to {output_path} ({file_size / 1024 / 1024:.1f}MB)")

def generate_car(car):
    print(f"\n=== Generating {car['name']} ===")

    try:
        image_token = upload_image(car['image_path'])
        if not image_token:
            return False

        task_id = create_task(image_token)
        if not task_id:
            return False

        model_url = poll_task(task_id)
        if not model_url:
            return False

        download_model(model_url, car['output_path'])
        return True
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

if __name__ == '__main__':
    print("Starting car model generation...\n")

    for car in cars:
        generate_car(car)

    print("\n=== Generation Complete ===")
