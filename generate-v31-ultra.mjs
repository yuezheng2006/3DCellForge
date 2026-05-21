import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';
const BASE_URL = 'https://api.tripo3d.ai/v2/openapi';
const REF_DIR = path.join(__dirname, 'public/generated-models/car-reference-images');
const OUT_DIR = path.join(__dirname, 'public/generated-models');
const PROXY = 'http://127.0.0.1:7897';

const env = { ...process.env, https_proxy: PROXY, http_proxy: PROXY };

function curlGet(url) {
  const result = execSync(`curl -s -m 30 -H "Authorization: Bearer ${API_KEY}" "${url}"`, { env, encoding: 'utf-8' });
  return JSON.parse(result);
}

function curlPostJSON(url, body) {
  const result = execSync(`curl -s -m 30 -H "Authorization: Bearer ${API_KEY}" -H "Content-Type: application/json" -d '${JSON.stringify(body)}' "${url}"`, { env, encoding: 'utf-8' });
  return JSON.parse(result);
}

function curlUpload(url, filePath) {
  const result = execSync(`curl -s -m 60 -H "Authorization: Bearer ${API_KEY}" -F "file=@${filePath}" "${url}"`, { env, encoding: 'utf-8' });
  return JSON.parse(result);
}

function curlDownload(url, outputPath) {
  execSync(`curl -s -m 300 -o "${outputPath}" "${url}"`, { env });
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`  Downloaded: ${path.basename(outputPath)} (${sizeMB}MB)`);
}

const cars = [
  { name: 'porsche-911-turbo-s', prompt: 'A Porsche 911 Turbo S sports car, silver metallic paint, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'mercedes-amg-g63', prompt: 'A Mercedes-AMG G 63 luxury SUV, black, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'tesla-model-s-plaid', prompt: 'A Tesla Model S Plaid electric sedan, red, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'ford-f150-raptor', prompt: 'A Ford F-150 Raptor pickup truck, olive green, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'toyota-gr-supra', prompt: 'A Toyota GR Supra sports car, yellow, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'bmw-i8-roadster', prompt: 'A BMW i8 Roadster hybrid sports car, blue, studio lighting, 3/4 front view, photorealistic, high detail' },
  { name: 'dodge-challenger-hellcat', prompt: 'A Dodge Challenger SRT Hellcat muscle car, red with white stripes, studio lighting, 3/4 front view, photorealistic, high detail' },
];

function uploadImage(imagePath) {
  const json = curlUpload(`${BASE_URL}/upload/sts`, imagePath);
  if (json.code !== 0) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  console.log(`  Uploaded: ${json.data.image_token}`);
  return json.data.image_token;
}

function createTask(imageToken, prompt) {
  const body = {
    type: 'image_to_model',
    file: { type: 'jpg', file_token: imageToken },
    model_version: 'v3.1-20260211',
    texture: true,
    pbr: true,
    texture_quality: 'detailed',
    geometry_quality: 'detailed',
    enable_image_autofix: true,
    face_limit: 2000000,
    prompt: prompt,
  };
  const json = curlPostJSON(`${BASE_URL}/task`, body);
  if (json.code !== 0) throw new Error(`Task creation failed: ${JSON.stringify(json)}`);
  console.log(`  Task created: ${json.data.task_id}`);
  return json.data.task_id;
}

function pollTask(taskId) {
  for (let i = 0; i < 120; i++) {
    const json = curlGet(`${BASE_URL}/task/${taskId}`);
    if (json.code !== 0) throw new Error(`Poll failed: ${JSON.stringify(json)}`);

    const { status, progress } = json.data;
    if (i % 3 === 0 || status === 'success' || status === 'failed') {
      console.log(`  Status: ${status} (${progress}%)`);
    }

    if (status === 'success') {
      return {
        modelUrl: json.data.output.model,
        pbrModelUrl: json.data.output.pbr_model,
        renderedImage: json.data.output.rendered_image,
        credits: json.data.consumed_credit,
      };
    }
    if (status === 'failed' || status === 'banned' || status === 'expired') {
      throw new Error(`Task ${status}: ${JSON.stringify(json.data)}`);
    }
    execSync('sleep 10');
  }
  throw new Error('Polling timeout after 20 minutes');
}

function generateCar(car) {
  console.log(`\n=== Generating ${car.name} (v3.1 Ultra) ===`);
  const imagePath = path.join(REF_DIR, `${car.name}.png`);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Reference image not found: ${imagePath}`);
  }

  const imageToken = uploadImage(imagePath);
  const taskId = createTask(imageToken, car.prompt);
  const result = pollTask(taskId);
  console.log(`  Credits consumed: ${result.credits}`);

  const modelUrl = result.pbrModelUrl || result.modelUrl;
  const outputPath = path.join(OUT_DIR, `${car.name}-v31.glb`);
  curlDownload(modelUrl, outputPath);

  if (result.renderedImage) {
    const previewPath = path.join(OUT_DIR, `${car.name}-v31-preview.png`);
    try { curlDownload(result.renderedImage, previewPath); } catch(e) { console.log(`  Preview download skipped: ${e.message}`); }
  }

  return { name: car.name, credits: result.credits, file: `${car.name}-v31.glb` };
}

function main() {
  console.log('Starting v3.1 Ultra regeneration for 7 cars...\n');
  const results = [];

  for (const car of cars) {
    try {
      const result = generateCar(car);
      results.push(result);
    } catch (e) {
      console.error(`FAILED: ${car.name}: ${e.message}`);
      results.push({ name: car.name, error: e.message });
    }
  }

  console.log('\n=== Summary ===');
  let totalCredits = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`FAIL: ${r.name}: ${r.error}`);
    } else {
      totalCredits += r.credits;
      console.log(`OK: ${r.name}: ${r.file} (${r.credits} credits)`);
    }
  }
  console.log(`Total credits: ${totalCredits}`);
}

main();
