export const SETTINGS_STORAGE_KEY = 'auto-showroom-settings'
export const GALLERY_STORAGE_KEY = 'auto-showroom-gallery'
export const GENERATION_HISTORY_STORAGE_KEY = 'auto-showroom-generation-history'
export const NOTES_STORAGE_KEY = 'auto-showroom-notes'
export const PROJECT_FALLBACK_STORAGE_KEY = 'auto-showroom-projects'
const VITE_ENV = import.meta.env || {}
export const SETTINGS_STORAGE_VERSION = 5
export const UI_STATE_STORAGE_KEY = 'auto-showroom-ui-state'
export const UI_STATE_STORAGE_VERSION = 1
export const FAL_MODEL_OPTIONS = [
  { id: 'fal-ai/hunyuan3d/v2', label: 'Hunyuan3D v2', description: '通过 Fal 使用腾讯 Hunyuan3D v2。' },
  { id: 'fal-ai/trellis', label: 'TRELLIS', description: '图片转 3D，带纹理网格输出。' },
  { id: 'fal-ai/triposr', label: 'TripoSR', description: '通过 Fal 快速图片重建。' },
  { id: 'tripo3d/tripo/v2.5/image-to-3d', label: 'Tripo3D v2.5', description: 'Fal 托管的 Tripo3D 图片转 3D。' },
  { id: 'fal-ai/hyper3d/rodin', label: 'Hyper3D Rodin', description: 'Fal 托管的 Rodin 图片转 3D。' },
]
export const FAL_MODEL_IDS = new Set(FAL_MODEL_OPTIONS.map((option) => option.id))
export const DEFAULT_FAL_MODEL = FAL_MODEL_OPTIONS[0].id
export const DEFAULT_SETTINGS = {
  quality: 'balanced',
  compactUi: false,
  generationProvider: 'rodin',
  generationMode: 'rodin',
  falModelId: DEFAULT_FAL_MODEL,
  screenshotScale: 2,
  language: 'en',
  settingsVersion: SETTINGS_STORAGE_VERSION,
}

export const SCREENSHOT_SCALE_OPTIONS = [
  { id: 1, label: '1x' },
  { id: 2, label: '2x' },
  { id: 3, label: '3x' },
]

export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
]
export const LANGUAGE_IDS = new Set(LANGUAGE_OPTIONS.map((option) => option.id))

export const CUSTOM_CELL_STORAGE_KEY = 'auto-showroom-custom-vehicles'
export const MAX_PERSISTED_IMAGE_EDGE = 1280
export const COMPACT_PERSISTED_IMAGE_EDGE = 900
export const MAX_PERSISTED_IMAGE_CHARS = 3_200_000
export const MODEL_API_BASE = VITE_ENV.VITE_MODEL_API_BASE || VITE_ENV.VITE_TRIPO_API_BASE || 'http://127.0.0.1:8787'
export const GENERATION_POLL_INTERVAL_MS = 3500
export const GENERATION_TIMEOUT_MS = 8 * 60 * 1000
export const GENERATION_PROVIDER_OPTIONS = [
  { id: 'rodin', label: 'Hyper3D', description: 'Hyper3D Rodin 云端生成。' },
  { id: 'auto', label: 'Auto', description: '优先 Hyper3D，然后 Tripo、Fal、Hunyuan 和 JS Depth 备选。' },
  { id: 'tripo', label: 'Tripo', description: '云端生成。' },
  { id: 'fal', label: 'Fal', description: 'Fal 队列，可选 3D 模型。' },
  { id: 'hunyuan', label: 'Hunyuan', description: '本地 Hunyuan3D 服务器。' },
]
export const GENERATION_PROVIDER_IDS = new Set(GENERATION_PROVIDER_OPTIONS.map((provider) => provider.id))
export const GENERATION_MODE_OPTIONS = [
  { id: 'rodin', label: 'Hyper3D', description: 'Hyper3D Rodin GLB 生成。' },
  { id: 'tripo', label: 'Tripo', description: '云端 GLB 生成。' },
  { id: 'fal', label: 'Fal', description: 'Fal.ai 队列，可选模型。' },
  { id: 'hunyuan', label: 'Hunyuan', description: '本地 Hunyuan3D GLB 生成。' },
  { id: 'cinematic', label: 'JS Depth', description: '浏览器端图片深度浮雕，分层 PNG 备选。' },
  { id: 'auto', label: 'Auto', description: 'Hyper3D、Tripo、Fal、Hunyuan，然后 JS Depth 备选。' },
  { id: 'local', label: '本地 GLB', description: '导入已有的 GLB 或 GLTF 文件。' },
]
export const GENERATION_MODE_IDS = new Set(GENERATION_MODE_OPTIONS.map((mode) => mode.id))
