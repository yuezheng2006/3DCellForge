#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPO_API_KEY = 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

const carImages = [
  { name: 'porsche-911-turbo-s', file: 'porsche-911-turbo-s.png' },
  { name: 'mercedes-amg-g63', file: 'mercedes-amg-g63.png' },
  { name: 'tesla-model-s-plaid', file: 'tesla-model-s-plaid.png' },
  { name: 'ford-f150-raptor', file: 'ford-f150-raptor.png' },
  { name: 'toyota-gr-supra', file: 'toyota-gr-supra.png' },
  { name: 'bmw-i8-roadster', file: 'bmw-i8-roadster.png' },
  { name: 'dodge-challenger-hellcat', file: 'dodge-challenger-hellcat.png' }
];

async function uploadImage(imagePath) {
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));

  const response = await fetch(`${TRIPO_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const result = await response.json();
  if (result.code !== 0) {
    throw new Error(`Upload failed: ${JSON.stringify(result)}`);
  }
  return result.data.image_token;
}

async function createTask(imageToken) {
  const response = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'image_to_model',
      file: {
        type: 'png',
        file_token: imageToken
      },
      model_version: 'v2.5-20250123',
      texture: true,
      pbr: true
    })
  });

  const result = await response.json();
  if (result.code !== 0) {
    throw new Error(`Task creation failed: ${JSON.stringify(result)}`);
  }
  return result.data.task_id;
}

async function pollTask(taskId) {
  while (true) {
    const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      }
    });

    const result = await response.json();
    if (result.code !== 0) {
      throw new Error(`Task polling failed: ${JSON.stringify(result)}`);
    }

    const { status, progress, output } = result.data;
    console.log(`  Status: ${status}, Progress: ${progress}%`);

    if (status === 'success') {
      return output.model;
    } else if (status === 'failed' || status === 'banned' || status === 'expired') {
      throw new Error(`Task ${status}: ${JSON.stringify(result.data)}`);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

async function downloadModel(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

async function generateCarModel(carImage) {
  const imagePath = path.join(__dirname, 'public/generated-models/car-reference-images', carImage.file);
  const outputPath = path.join(__dirname, 'public/generated-models', `${carImage.name}.glb`);

  console.log(`\n🚗 Processing ${carImage.name}...`);

  console.log('  1. Uploading image...');
  const imageToken = await uploadImage(imagePath);
  console.log(`  ✓ Image uploaded: ${imageToken}`);

  console.log('  2. Creating 3D generation task...');
  const taskId = await createTask(imageToken);
  console.log(`  ✓ Task created: ${taskId}`);

  console.log('  3. Waiting for generation to complete...');
  const modelUrl = await pollTask(taskId);
  console.log(`  ✓ Model generated: ${modelUrl}`);

  console.log('  4. Downloading GLB model...');
  await downloadModel(modelUrl, outputPath);
  console.log(`  ✓ Saved to: ${outputPath}`);
}

async function main() {
  console.log('🎨 Starting car 3D model generation with Tripo API...\n');

  for (const carImage of carImages) {
    try {
      await generateCarModel(carImage);
    } catch (error) {
      console.error(`❌ Failed to generate ${carImage.name}:`, error.message);
    }
  }

  console.log('\n✅ All car models generated successfully!');
}

main().catch(console.error);
