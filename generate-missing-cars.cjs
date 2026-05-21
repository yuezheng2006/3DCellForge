const https = require('https');
const fs = require('fs');
const path = require('path');

const TRIPO_API_KEY = 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';

const carsToGenerate = [
  {
    name: 'BMW i8 Roadster',
    imagePath: 'public/generated-models/car-reference-images/bmw-i8-roadster.png',
    outputPath: 'public/generated-models/bmw-i8-roadster.glb'
  },
  {
    name: 'Dodge Challenger Hellcat',
    imagePath: 'public/generated-models/car-reference-images/dodge-challenger-hellcat.png',
    outputPath: 'public/generated-models/dodge-challenger-hellcat.glb'
  }
];

function uploadImage(imagePath) {
  return new Promise((resolve, reject) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(imagePath)}"\r\nContent-Type: image/png\r\n\r\n`),
      imageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const options = {
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data.image_token);
          } else {
            reject(new Error(`Upload failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function createTask(imageToken) {
  return new Promise((resolve, reject) => {
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

    const options = {
      hostname: 'api.tripo3d.ai',
      path: '/v2/openapi/task',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data.task_id);
          } else {
            reject(new Error(`Task creation failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function pollTask(taskId) {
  return new Promise((resolve, reject) => {
    const checkStatus = () => {
      const options = {
        hostname: 'api.tripo3d.ai',
        path: `/v2/openapi/task/${taskId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.code === 0) {
              const status = result.data.status;
              console.log(`Task ${taskId}: ${status} (${result.data.progress}%)`);

              if (status === 'success') {
                resolve(result.data.output.model);
              } else if (status === 'failed' || status === 'banned' || status === 'expired') {
                reject(new Error(`Task failed with status: ${status}`));
              } else {
                setTimeout(checkStatus, 5000);
              }
            } else {
              reject(new Error(`Poll failed: ${data}`));
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    };

    checkStatus();
  });
}

function downloadModel(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function generateCar(car) {
  console.log(`\n=== Generating ${car.name} ===`);

  try {
    console.log('1. Uploading image...');
    const imageToken = await uploadImage(car.imagePath);
    console.log(`   Image token: ${imageToken}`);

    console.log('2. Creating 3D generation task...');
    const taskId = await createTask(imageToken);
    console.log(`   Task ID: ${taskId}`);

    console.log('3. Waiting for generation to complete...');
    const modelUrl = await pollTask(taskId);
    console.log(`   Model URL: ${modelUrl}`);

    console.log('4. Downloading GLB model...');
    await downloadModel(modelUrl, car.outputPath);
    console.log(`   ✓ Saved to ${car.outputPath}`);

    return true;
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting car model generation...\n');

  for (const car of carsToGenerate) {
    await generateCar(car);
  }

  console.log('\n=== Generation Complete ===');
}

main().catch(console.error);
