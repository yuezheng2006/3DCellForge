import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPO_API_KEY = process.env.TRIPO_API_KEY || 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

const carImages = [
  { name: 'porsche-911-turbo-s', displayName: 'Porsche 911 Turbo S' },
  { name: 'mercedes-amg-g63', displayName: 'Mercedes-AMG G63' },
  { name: 'tesla-model-s-plaid', displayName: 'Tesla Model S Plaid' },
  { name: 'ford-f150-raptor', displayName: 'Ford F-150 Raptor' },
  { name: 'toyota-gr-supra', displayName: 'Toyota GR Supra' },
  { name: 'bmw-i8-roadster', displayName: 'BMW i8 Roadster' },
  { name: 'dodge-challenger-hellcat', displayName: 'Dodge Challenger SRT Hellcat' }
];

async function uploadImage(imagePath) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/upload',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        ...form.getHeaders()
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data.image_token);
          } else {
            reject(new Error(`Upload failed: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

async function createTask(imageToken) {
  const postData = JSON.stringify({
    type: 'image_to_model',
    file: {
      type: 'png',
      file_token: imageToken
    },
    model_version: 'v2.5-20250123',
    texture: true,
    pbr: true
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/task',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data.task_id);
          } else {
            reject(new Error(`Task creation failed: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function pollTask(taskId) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'api.tripo3d.ai',
      path: `/v2/openapi/task/${taskId}`,
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data);
          } else {
            reject(new Error(`Poll failed: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function downloadModel(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function generateModel(carImage) {
  const imagePath = path.join(__dirname, 'public/generated-models/car-reference-images', `${carImage.name}.png`);

  console.log(`\n[${carImage.displayName}] Starting generation...`);

  console.log(`  1. Uploading image...`);
  const imageToken = await uploadImage(imagePath);
  console.log(`     ✓ Image token: ${imageToken}`);

  console.log(`  2. Creating 3D generation task...`);
  const taskId = await createTask(imageToken);
  console.log(`     ✓ Task ID: ${taskId}`);

  console.log(`  3. Waiting for generation to complete...`);
  let taskData;
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    taskData = await pollTask(taskId);

    console.log(`     Status: ${taskData.status}, Progress: ${taskData.progress}%`);

    if (taskData.status === 'success') {
      break;
    } else if (taskData.status === 'failed' || taskData.status === 'banned') {
      throw new Error(`Task failed with status: ${taskData.status}`);
    }

    attempts++;
  }

  if (taskData.status !== 'success') {
    throw new Error('Task timed out');
  }

  console.log(`  4. Downloading GLB model...`);
  const outputPath = path.join(__dirname, 'public/generated-models', `${carImage.name}.glb`);
  await downloadModel(taskData.output.model, outputPath);
  console.log(`     ✓ Saved to: ${outputPath}`);
  console.log(`     Credits consumed: ${taskData.consumed_credit}`);

  return {
    name: carImage.name,
    displayName: carImage.displayName,
    modelPath: outputPath,
    creditsUsed: taskData.consumed_credit
  };
}

async function main() {
  console.log('Starting 3D model generation from car images...\n');
  console.log(`Processing ${carImages.length} car images\n`);

  const results = [];
  let totalCredits = 0;

  for (const carImage of carImages) {
    try {
      const result = await generateModel(carImage);
      results.push(result);
      totalCredits += result.creditsUsed;
      console.log(`✓ ${carImage.displayName} completed!\n`);
    } catch (error) {
      console.error(`✗ ${carImage.displayName} failed: ${error.message}\n`);
      results.push({
        name: carImage.name,
        displayName: carImage.displayName,
        error: error.message
      });
    }
  }

  console.log('\n=== Generation Summary ===');
  console.log(`Total models generated: ${results.filter(r => !r.error).length}/${carImages.length}`);
  console.log(`Total credits consumed: ${totalCredits}`);
  console.log('\nResults:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ✗ ${r.displayName}: ${r.error}`);
    } else {
      console.log(`  ✓ ${r.displayName}: ${r.creditsUsed} credits`);
    }
  });
}

main().catch(console.error);
