#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/TRIPO_API_KEY=(.+)/);
const TRIPO_API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

if (!TRIPO_API_KEY) {
  console.error('❌ TRIPO_API_KEY not found in .env.local');
  process.exit(1);
}

const BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

// Car reference images
const carImages = [
  {
    name: 'porsche-911-turbo-s',
    file: 'porsche-911-turbo-s.png',
    displayName: 'Porsche 911 Turbo S'
  },
  {
    name: 'mercedes-amg-g63',
    file: 'mercedes-amg-g63.png',
    displayName: 'Mercedes-AMG G63'
  },
  {
    name: 'tesla-model-s-plaid',
    file: 'tesla-model-s-plaid.png',
    displayName: 'Tesla Model S Plaid'
  },
  {
    name: 'ford-f150-raptor',
    file: 'ford-f150-raptor.png',
    displayName: 'Ford F-150 Raptor'
  },
  {
    name: 'toyota-gr-supra',
    file: 'toyota-gr-supra.png',
    displayName: 'Toyota GR Supra'
  },
  {
    name: 'bmw-i8-roadster',
    file: 'bmw-i8-roadster.png',
    displayName: 'BMW i8 Roadster'
  },
  {
    name: 'dodge-challenger-hellcat',
    file: 'dodge-challenger-hellcat.png',
    displayName: 'Dodge Challenger Hellcat'
  }
];

// Upload image to Tripo
async function uploadImage(imagePath) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      ...form.getHeaders()
    },
    body: form
  });

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Upload failed: ${JSON.stringify(data)}`);
  }

  return data.data.image_token;
}

// Create image-to-3D task with v3.1 Ultra quality
async function createTask(imageToken) {
  const response = await fetch(`${BASE_URL}/task`, {
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
      model_version: 'v3.1-20260211',  // Latest model
      texture: true,
      pbr: true,
      texture_quality: 'detailed',      // HD textures
      geometry_quality: 'detailed',     // Ultra geometry (up to 2M polygons)
      enable_image_autofix: true        // Auto-optimize input images
    })
  });

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Task creation failed: ${JSON.stringify(data)}`);
  }

  return data.data.task_id;
}

// Poll task status
async function pollTask(taskId) {
  while (true) {
    const response = await fetch(`${BASE_URL}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      }
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`Task polling failed: ${JSON.stringify(data)}`);
    }

    const { status, progress, output } = data.data;

    if (status === 'success') {
      return output.model;
    } else if (status === 'failed' || status === 'banned' || status === 'expired') {
      throw new Error(`Task ${status}: ${JSON.stringify(data.data)}`);
    }

    process.stdout.write(`\r   Progress: ${progress}%`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Download GLB file
async function downloadGLB(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

// Main function
async function main() {
  console.log('🚗 Regenerating all 7 car models with v3.1 Ultra quality\n');
  console.log('Settings:');
  console.log('  - Model: v3.1-20260211 (latest)');
  console.log('  - Texture: HD (detailed)');
  console.log('  - Geometry: Ultra (up to 2M polygons)');
  console.log('  - Cost: 50 credits per model, 350 credits total\n');

  const imagesDir = path.join(__dirname, 'public', 'generated-models', 'car-reference-images');
  const outputDir = path.join(__dirname, 'public', 'generated-models');

  let successCount = 0;
  let failCount = 0;

  for (const car of carImages) {
    try {
      console.log(`\n📸 [${successCount + failCount + 1}/7] ${car.displayName}`);

      const imagePath = path.join(imagesDir, car.file);
      if (!fs.existsSync(imagePath)) {
        console.log(`   ⚠️  Image not found: ${car.file}`);
        failCount++;
        continue;
      }

      // Upload image
      process.stdout.write('   Uploading image...');
      const imageToken = await uploadImage(imagePath);
      console.log(' ✓');

      // Create task
      process.stdout.write('   Creating 3D generation task...');
      const taskId = await createTask(imageToken);
      console.log(' ✓');
      console.log(`   Task ID: ${taskId}`);

      // Poll for completion
      process.stdout.write('   Generating 3D model...');
      const modelUrl = await pollTask(taskId);
      console.log('\r   Generating 3D model... ✓ (100%)');

      // Download GLB
      const outputPath = path.join(outputDir, `${car.name}.glb`);
      process.stdout.write('   Downloading GLB...');
      await downloadGLB(modelUrl, outputPath);

      const stats = fs.statSync(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      console.log(` ✓ (${sizeMB}MB)`);

      successCount++;
      console.log(`   ✅ Success!`);

    } catch (error) {
      console.log(`\n   ❌ Failed: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✨ Generation complete!`);
  console.log(`   Success: ${successCount}/7`);
  console.log(`   Failed: ${failCount}/7`);

  if (successCount > 0) {
    console.log(`\n📦 Models saved to: public/generated-models/`);
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Review the generated models`);
    console.log(`   2. git add public/generated-models/*.glb`);
    console.log(`   3. git commit -m "Upgrade to v3.1 Ultra quality models"`);
    console.log(`   4. git push`);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
