/**
 * 3D模型预加载器 / 3D Model Preloader
 * 预加载大型GLB文件以提升用户体验
 */

const PRELOAD_MODELS = [
  '/generated-models/porsche-911-turbo-s.glb',
  '/generated-models/mercedes-amg-g63.glb',
  '/generated-models/tesla-model-s-plaid.glb',
  '/generated-models/ford-f150-raptor.glb',
  '/generated-models/toyota-gr-supra.glb',
  '/generated-models/bmw-i8-roadster.glb',
  '/generated-models/dodge-challenger-hellcat.glb',
]

class ModelPreloader {
  constructor() {
    this.cache = new Map()
    this.loading = new Map()
    this.progress = new Map()
    this.totalProgress = 0
    this.listeners = new Set()
  }

  /**
   * 预加载所有模型
   */
  async preloadAll() {
    const promises = PRELOAD_MODELS.map((url) => this.preload(url))
    await Promise.allSettled(promises)
  }

  /**
   * 预加载单个模型
   */
  async preload(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    if (this.loading.has(url)) {
      return this.loading.get(url)
    }

    const promise = this._fetchModel(url)
    this.loading.set(url, promise)

    try {
      const blob = await promise
      this.cache.set(url, blob)
      this.loading.delete(url)
      this.progress.set(url, 100)
      this._notifyProgress()
      return blob
    } catch (error) {
      this.loading.delete(url)
      this.progress.set(url, -1)
      this._notifyProgress()
      throw error
    }
  }

  /**
   * 获取缓存的模型
   */
  getCached(url) {
    return this.cache.get(url)
  }

  /**
   * 检查模型是否已缓存
   */
  isCached(url) {
    return this.cache.has(url)
  }

  /**
   * 获取总体加载进度 (0-100)
   */
  getTotalProgress() {
    if (PRELOAD_MODELS.length === 0) return 100

    let total = 0
    for (const url of PRELOAD_MODELS) {
      const progress = this.progress.get(url) || 0
      total += Math.max(0, progress)
    }

    return Math.round(total / PRELOAD_MODELS.length)
  }

  /**
   * 监听加载进度
   */
  onProgress(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * 获取加载状态
   */
  getStatus() {
    const total = PRELOAD_MODELS.length
    const cached = PRELOAD_MODELS.filter((url) => this.cache.has(url)).length
    const loading = PRELOAD_MODELS.filter((url) => this.loading.has(url)).length
    const failed = PRELOAD_MODELS.filter((url) => this.progress.get(url) === -1).length

    return {
      total,
      cached,
      loading,
      failed,
      pending: total - cached - loading - failed,
      progress: this.getTotalProgress(),
    }
  }

  /**
   * 清除缓存
   */
  clear() {
    this.cache.clear()
    this.loading.clear()
    this.progress.clear()
    this._notifyProgress()
  }

  async _fetchModel(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load model: ${url}`)
    }

    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (!total || !response.body) {
      // 无法跟踪进度，直接返回blob
      return await response.blob()
    }

    const reader = response.body.getReader()
    const chunks = []
    let loaded = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      loaded += value.length

      const progress = Math.round((loaded / total) * 100)
      this.progress.set(url, progress)
      this._notifyProgress()
    }

    return new Blob(chunks)
  }

  _notifyProgress() {
    const status = this.getStatus()
    this.listeners.forEach((callback) => {
      try {
        callback(status)
      } catch (error) {
        console.error('Preloader progress callback error:', error)
      }
    })
  }
}

// 单例实例
export const modelPreloader = new ModelPreloader()

/**
 * 在应用启动时开始预加载
 */
export function startPreloading() {
  if (typeof window === 'undefined') return

  // 延迟启动预加载，避免阻塞初始渲染
  setTimeout(() => {
    modelPreloader.preloadAll().catch((error) => {
      console.warn('Model preloading failed:', error)
    })
  }, 1000)
}
