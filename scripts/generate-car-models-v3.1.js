import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPO_API_KEY = process.env.TRIPO_API_KEY || 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

const carModels = [
  {
    name: 'porsche-911-turbo-s',
    imagePath: 'public/generated-models/car-reference-images/porsche-911-turbo-s.png',
    outputPath: 'public/generated-models/porsche-911-turbo-s.glb'
  },
  {
    name: 'mercedes-amg-g63',
    imagePath: 'public/generated-models/car-reference-images/mercedes-amg-g63.png',
    outputPath: 'public/generated-models/mercedes-amg-g63.glb'
  },
  {
    name: 'tesla-model-s-plaid',
    imagePath: 'public/generated-models/car-reference-images/tesla-model-s-plaid.png',
    outputPath: 'public/generated-models/tesla-model-s-plaid.glb'
  },
  {
    name: 'ford-f150-raptor',
    imagePath: 'public/generated-models/car-reference-images/ford-f150-raptor.png',
    outputPath: 'public/generated-models/ford-f150-raptor.glb'
  },
  {
    name: 'toyota-gr-supra',
    imagePath: 'public/generated-models/car-reference-images/toyota-gr-supra.png',
    outputPath: 'public/generated-models/toyota-gr-supra.glb'
  },
  {
    name: 'bmw-i8-roadster',
    imagePath: 'public/generated-models/car-reference-images/bmw-i8-roadster.png',
    outputPath: 'public/generated-models/bmw-i8-roadster.glb'
  },
  {
    name: 'dodge-challenger-hellcat',
    imagePath: 'public/generated-models/car-reference-images/dodge-challenger-hellcat.png',
    outputPath: 'public/generated-models/dodge-challenger-hellcat.glb'
  }
];

function makeRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function uploadImage(imagePath) {
  console.log(`Uploading image: ${imagePath}`);

  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${path.basename(imagePath)}"`,
    'Content-Type: image/png',
    '',
    imageBuffer.toString('binary'),
    `--${boundary}--`
  ].join('\r\n');

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(formData, 'binary')
    }
  };

  const result = await makeRequest(`${TRIPO_BASE_URL}/upload`, options, formData);

  if (result.statusCode !== 200 || result.data.code !== 0) {
    throw new Error(`Upload failed: ${JSON.stringify(result.data)}`);
  }

  console.log(`✓ Image uploaded, token: ${result.data.data.image_token}`);
  return result.data.data.image_token;
}

async function createTask(imageToken) {
  console.log('Creating image-to-3D task with v3.1 Ultra settings...');

  const taskData = JSON.stringify({
    type: 'image_to_model',
    file: {
      type: 'png',
      file_token: imageToken
    },
    model_version: 'v3.1-20260211',
    texture: true,
    pbr: true,
    texture_quality: 'detailed',
    geometry_quality: 'detailed',
    enable_image_autofix: true
  });

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(taskData)
    }
  };

  const result = await makeRequest(`${TRIPO_BASE_URL}/task`, options, taskData);

  if (result.statusCode !== 200 || result.data.code !== 0) {
    throw new Error(`Task creation failed: ${JSON.stringify(result.data)}`);
  }

  console.log(`✓ Task created: ${result.data.data.task_id}`);
  return result.data.data.task_id;
}

async function pollTask(taskId) {
  console.log('Polling task status...');

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`
    }
  };

  while (true) {
    const result = await makeRequest(`${TRIPO_BASE_URL}/task/${taskId}`, options);

    if (result.statusCode !== 200 || result.data.code !== 0) {
      throw new Error(`Task polling failed: ${JSON.stringify(result.data)}`);
    }

    const task = result.data.data;
    console.log(`  Status: ${task.status}, Progress: ${task.progress}%`);

    if (task.status === 'success') {
      console.log(`✓ Task completed! Credits consumed: ${task.consumed_credit}`);
      return task.output;
    }

    if (task.status === 'failed' || task.status === 'banned' || task.status === 'expired') {
      throw new Error(`Task ${task.status}: ${JSON.stringify(task)}`);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

async function downloadModel(url, outputPath) {
  console.log(`Downloading model to: ${outputPath}`);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed with status ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        const stats = fs.statSync(outputPath);
        console.log(`✓ Model downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        resolve();
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function generateCarModel(car) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating: ${car.name}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const imageToken = await uploadImage(car.imagePath);
    const taskId = await createTask(imageToken);
    const output = await pollTask(taskId);
    await downloadModel(output.model, car.outputPath);

    console.log(`✓ ${car.name} completed successfully!`);
    return { success: true, car: car.name };
  } catch (error) {
    console.error(`✗ ${car.name} failed: ${error.message}`);
    return { success: false, car: car.name, error: error.message };
  }
}

async function main() {
  console.log('Starting Tripo3D v3.1 Ultra quality car model generation...');
  console.log(`Total cars to generate: ${carModels.length}`);
  console.log(`Expected cost: ${carModels.length * 50} credits (50 credits per car)\n`);

  const results = [];

  for (const car of carModels) {
    const result = await generateCarModel(car);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('GENERATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ Successful: ${successful.length}/${carModels.length}`);
  successful.forEach(r => console.log(`  - ${r.car}`));

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}/${carModels.length}`);
    failed.forEach(r => console.log(`  - ${r.car}: ${r.error}`));
  }

  console.log(`\nTotal credits consumed: ~${successful.length * 50} credits`);
}

main().catch(console.error);
