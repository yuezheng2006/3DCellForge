import { getProviderLabel } from '../services/modelApi.js'
import { getAssetIntelligence } from './assetIntelligence.js'
import { inferMotionProfile } from './motionProfiles.js'

export function getAssetMetadata(cell = {}) {
  const { category, scene } = getAssetIntelligence(cell)
  const provider = getAssetProviderLabel(cell)
  const status = normalizeStatus(cell)
  const motion = inferMotionProfile(cell)
  const title = cell.fullName || cell.name || '未命名资产'
  const task = cell.generation?.taskId ? String(cell.generation.taskId).slice(0, 14) : '无'
  const source = getSourceLabel(cell)

  return {
    title,
    subtitle: category.label,
    accent: cell.accent || '#72a4bf',
    insightSource: cell.intelligence?.configured ? `${cell.intelligence.provider || 'AI'} 视觉分析` : '资产名称、源文件和生成元数据',
    facts: [
      ['类别', category.label],
      ['来源', source],
      ['提供商', provider],
      ['状态', status],
      ['场景', scene.label],
      ['分析器', cell.intelligence?.configured ? `${cell.intelligence.provider || 'AI'} 视觉` : '本地规则'],
      ['比例', category.scale],
      ['任务', task],
    ],
    description: buildDescription(cell, category, scene),
    value: buildValue(cell, category, scene, motion),
    tags: dedupeTags([...category.tags, ...scene.badges, provider.toLowerCase(), status.toLowerCase().replace(/\s+/g, '-')]).slice(0, 8),
  }
}

function buildDescription(cell, category, scene) {
  if (cell.reference) {
    return cell.referenceSummary || category.description
  }

  const modelState = cell.generation?.modelUrl
    ? '已生成 GLB 模型，查看器正在显示实际的缓存 3D 模型。'
    : cell.generation?.provider === 'cinematic'
    ? '这是浏览器端深度预览，而非完整的 GLB 网格。'
    : '查看器可能使用程序化预览，直到生成的 GLB 准备就绪。'

  return `${category.description} ${modelState} 选定的展示场景是${scene.label}：${scene.summary}`
}

function buildValue(cell, category, scene, motion) {
  const material = `材质重点：${category.material}。`
  const structure = `检查重点：${category.inspectionFocus}。`
  const demo = `推荐展示：${motion.label}。${scene.summary} ${category.value}`
  const warning = cell.generation?.status === 'failed'
    ? ' 当前生成失败，在重试之前不应将此资产用于最终演示。'
    : ''

  return `${material} ${structure} ${demo}${warning}`
}

function getSourceLabel(cell) {
  if (cell.reference) return 'Khronos 参考模型'
  if (cell.generation?.provider === 'local') return '本地 GLB 导入'
  if (cell.imageUrl || cell.thumbnailUrl) return '上传的参考图片'
  if (cell.custom) return '生成的工作区资产'
  return '内置启动场景'
}

function getAssetProviderLabel(cell) {
  if (cell.reference) return 'Khronos 参考'
  if (!cell.custom && !cell.generation?.provider && !cell.generation?.requestedProvider) return '内置'
  return getProviderLabel(cell.generation?.provider || cell.generation?.requestedProvider)
}

function normalizeStatus(cell) {
  if (cell.reference) return '参考就绪'
  if (cell.generation?.modelUrl) return 'GLB 就绪'
  if (cell.generation?.status === 'failed') return '生成失败'
  if (cell.generation?.status) return String(cell.generation.status)
  return cell.custom ? '排队中' : '交互式启动器'
}

function dedupeTags(tags) {
  return [...new Set(tags.filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean))]
}
