import { motion } from 'framer-motion'
import { Box, CheckCircle2, Clock3, Copy, Download, Edit3, Image, Layers3, RefreshCw, RotateCcw, Trash2, X } from 'lucide-react'

import { FAL_MODEL_OPTIONS, GENERATION_MODE_OPTIONS, LANGUAGE_OPTIONS, SCREENSHOT_SCALE_OPTIONS } from '../config/appConfig.js'
import { CELL_TYPES, WORKSPACE_PANELS } from '../domain/cellData.js'
import { getCell, getCellProfile, getOrganelleDetail } from '../domain/cellCatalog.js'
import { getProviderLabel } from '../services/modelApi.js'
import { CellThumb } from './CellThumb.jsx'

const READY_STATUSES = new Set(['success', 'local'])
const ACTIVE_STATUSES = new Set(['uploading', 'processing', 'queued', 'running', 'pending'])

function findCell(cells, cellId) {
  return cells.find((cell) => cell.id === cellId) ?? getCell(cellId)
}

function formatDate(value) {
  if (!value) return '未保存'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function formatDuration(ms) {
  if (!Number.isFinite(ms)) return 'n/a'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${Math.round(ms / 1000)} s`
}

function getModelUrl(cell) {
  return cell.generation?.modelUrl || ''
}

function getModelSource(cell) {
  if (cell.reference) return 'Khronos glTF 示例模型'
  if (cell.generation?.provider === 'local') return '本地 GLB 导入'
  if (cell.generation?.provider === 'cinematic') return '浏览器 JS 深度'
  if (cell.custom) return `${cell.generation?.provider || 'AI'} 生成`
  return '程序化 Three.js 场景'
}

function getQualityLabel(cell) {
  if (cell.reference) return '参考 GLB'
  if (cell.generation?.modelUrl) return 'GLB 就绪'
  if (cell.generation?.status === 'failed') return '失败'
  if (cell.generation?.status) return cell.generation.status
  return '交互式'
}

function getAssetPreviewUrl(cell) {
  return cell.thumbnailUrl || cell.imageUrl || ''
}

function formatAssetStatus(cell) {
  const status = String(cell.generation?.status || '').toLowerCase()
  if (cell.reference) return 'reference'
  if (READY_STATUSES.has(status) || cell.generation?.modelUrl) return 'ready'
  if (status === 'failed') return 'failed'
  if (ACTIVE_STATUSES.has(status)) return 'generating'
  if (cell.custom) return 'queued'
  return 'starter'
}

function getAssetTone(cell) {
  const status = formatAssetStatus(cell)
  if (status === 'ready' || status === 'reference') return 'ready'
  if (status === 'failed') return 'failed'
  if (status === 'generating' || status === 'queued') return 'active'
  return 'starter'
}

function getAssetKind(cell) {
  if (cell.reference) return '参考 GLB'
  if (cell.generation?.provider === 'local') return '本地导入'
  if (cell.generation?.provider === 'cinematic') return 'JS 深度预览'
  if (cell.generation?.modelUrl) return '已生成 GLB'
  if (cell.custom) return '已生成资产'
  return '预设场景'
}

function getAssetRuntime(cell, generationHistory) {
  const match = generationHistory.find((entry) => entry.cellId === cell.id && Number.isFinite(entry.durationMs))
  return match ? formatDuration(match.durationMs) : 'n/a'
}

function formatLogSummary(entry) {
  const parts = [
    entry.method,
    entry.path,
    entry.provider,
    entry.status ? `status=${entry.status}` : '',
    entry.progress !== undefined && entry.progress !== null ? `progress=${entry.progress}` : '',
    entry.taskId ? `task=${String(entry.taskId).slice(0, 18)}` : '',
    entry.durationMs !== undefined ? `duration=${formatDuration(entry.durationMs)}` : '',
    entry.error?.message || entry.error || '',
  ].filter(Boolean)

  return parts.join(' · ') || JSON.stringify(entry).slice(0, 160)
}

export function WorkspaceDrawer({
  activePanel,
  selectedCell,
  selectedOrganelle,
  compareCell,
  allCells = CELL_TYPES,
  customCells = [],
  galleryItems,
  generationHistory = [],
  notes,
  settings,
  projects = [],
  crossSection,
  selectedMicroscope,
  uploadedImage,
  favoriteKey,
  onClose,
  onSelectCell,
  onSelectOrganelle,
  onSetCompareCell,
  onSaveGallery,
  onClearGallery,
  onRestoreGalleryItem,
  onRenameGalleryItem,
  onDeleteGalleryItem,
  onDownloadGalleryImage,
  onExportGallery,
  onDeleteCustomCell,
  onClearGenerationHistory,
  onUpdateNote,
  onGenerateNote,
  onCopyNote,
  onExportNote,
  onUpdateSettings,
  onSetCrossSection,
  onExport,
  exportAvailable,
  exportReason,
  apiHealth,
  serverLogs,
  onRefreshApiHealth,
  onRefreshServerLogs,
  onExportDiagnostics,
  onClearWorkspaceCache,
  onResetWorkspace,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  onExportProject,
  onRunProviderCompare,
  onCopyText,
}) {
  if (!activePanel) return null

  const cell = findCell(allCells, selectedCell)
  const compare = findCell(allCells, compareCell)
  const detail = getOrganelleDetail(selectedCell, selectedOrganelle, customCells)
  const profile = getCellProfile(selectedCell, customCells)
  const noteKey = `${selectedCell}:${selectedOrganelle}`
  const noteValue = notes[noteKey] ?? ''
  const savedFavorite = favoriteKey ? favoriteKey.replace(':', ' / ') : 'None'
  const generatedAssets = allCells.filter((item) => item.custom && !item.reference)
  const referenceAssets = allCells.filter((item) => item.reference)
  const starterAssets = allCells.filter((item) => !item.custom && !item.reference)
  const readyGeneratedAssets = generatedAssets.filter((item) => formatAssetStatus(item) === 'ready')

  function renderAssetCard(item, { compact = false } = {}) {
    const modelUrl = getModelUrl(item)
    const previewUrl = getAssetPreviewUrl(item)
    const providerLabel = getProviderLabel(item.generation?.provider || item.generation?.requestedProvider || (item.reference ? 'reference' : 'built-in'))
    const canDelete = customCells.some((candidate) => candidate.id === item.id) && !item.reference
    const canCompare = item.custom && !item.reference && Boolean(item.imageUrl)
    const status = formatAssetStatus(item)
    const taskId = item.generation?.taskId || ''

    return (
      <article key={item.id} className={`${selectedCell === item.id ? 'asset-library-card active' : 'asset-library-card'} tone-${getAssetTone(item)}${compact ? ' compact' : ''}`}>
        <button type="button" className="asset-preview-frame" onClick={() => onSelectCell(item.id)} aria-label={`Open ${item.name}`}>
          {previewUrl ? <img src={previewUrl} alt={`${item.name} source preview`} /> : <CellThumb cell={item} selected={selectedCell === item.id} />}
        </button>
        <div className="asset-library-body">
          <div className="asset-library-title">
            <span>
              <strong title={item.fullName || item.name}>{item.fullName || item.name}</strong>
              <small>{getAssetKind(item)} · {providerLabel}</small>
            </span>
            <span className={`asset-status-pill ${status}`}>
              {status === 'ready' || status === 'reference' ? <CheckCircle2 size={12} /> : status === 'failed' ? <X size={12} /> : <Clock3 size={12} />}
              {status}
            </span>
          </div>
          <div className="asset-stat-grid">
            <span><strong>{modelUrl ? 'GLB' : '预览'}</strong><small>资产</small></span>
            <span><strong>{getAssetRuntime(item, generationHistory)}</strong><small>耗时</small></span>
            <span><strong>{taskId ? String(taskId).slice(0, 8) : '无'}</strong><small>任务</small></span>
          </div>
          <code className="asset-model-url">{modelUrl || item.referenceSource || item.type || '仅程序化预览'}</code>
          <div className="asset-library-actions">
            <button type="button" onClick={() => onSelectCell(item.id)}>打开</button>
            <button type="button" disabled={!modelUrl} onClick={() => onCopyText(modelUrl, 'Model URL copied')}>
              <Copy size={12} />
              URL
            </button>
            <button type="button" disabled={!canCompare} onClick={() => onRunProviderCompare(item.id)}>
              <RotateCcw size={12} />
              对比
            </button>
            {canDelete && (
              <button type="button" className="danger" onClick={() => onDeleteCustomCell?.(item.id)}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </article>
    )
  }

  function renderContent() {
    if (activePanel === 'Gallery') {
      return (
        <div className="drawer-content">
          <div className="gallery-hero">
            <CellThumb cell={cell} selected />
            <div>
              <strong>{cell.name}</strong>
              <span>{detail.title} · {selectedMicroscope}</span>
            </div>
          </div>
          <div className="drawer-actions">
            <button type="button" className="drawer-primary" onClick={onSaveGallery}>保存视图</button>
            <button type="button" className="drawer-secondary" onClick={onExport} disabled={!exportAvailable} title={exportReason}>导出 GLB</button>
          </div>
          {uploadedImage && (
            <div className="uploaded-tile" style={{ '--upload-preview': `url(${uploadedImage.url})` }}>
              <span />
              <div>
                <strong>{uploadedImage.name}</strong>
                <small>已附加的参考来源</small>
              </div>
            </div>
          )}
          <div className="drawer-list">
            {galleryItems.length === 0 ? (
              <p className="empty-state">暂无保存的视图。</p>
            ) : (
              galleryItems.map((item) => {
                const itemCell = findCell(allCells, item.cellId)
                const itemDetail = getOrganelleDetail(item.cellId, item.organelleId, customCells)
                return (
                  <article key={item.id} className="gallery-shot-card">
                    <button type="button" className="gallery-shot-preview" onClick={() => onRestoreGalleryItem(item)}>
                      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={`${item.title || itemCell.name} saved view`} /> : <CellThumb cell={itemCell} selected={item.cellId === selectedCell} />}
                    </button>
                    <div className="gallery-shot-body">
                      <strong>{item.title || `${itemCell.name} / ${itemDetail.title}`}</strong>
                      <small>{itemCell.name} · {itemDetail.title} · {item.microscope}</small>
                      <small>{getQualityLabel({ generation: { provider: item.generationProvider, modelUrl: item.modelUrl } })} · {formatDate(item.createdAt)}</small>
                    </div>
                    <div className="gallery-shot-actions">
                      <button type="button" onClick={() => onRestoreGalleryItem(item)}>打开</button>
                      <button
                        type="button"
                        onClick={() => {
                          const title = window.prompt('重命名保存的视图', item.title || `${itemCell.name} / ${itemDetail.title}`)
                          if (title !== null) onRenameGalleryItem(item.id, title)
                        }}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button type="button" onClick={() => onDownloadGalleryImage(item)} disabled={!item.thumbnailUrl}>
                        <Download size={12} />
                      </button>
                      <button type="button" onClick={() => onDeleteGalleryItem(item.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
          {galleryItems.length > 0 && (
            <div className="drawer-actions">
              <button type="button" className="drawer-secondary" onClick={onExportGallery}>导出展厅</button>
              <button type="button" className="drawer-secondary" onClick={onClearGallery}>清空展厅</button>
            </div>
          )}
        </div>
      )
    }

    if (activePanel === 'Library') {
      return (
        <div className="drawer-content asset-library-drawer">
          <div className="asset-library-summary">
            <span><strong>{generatedAssets.length}</strong><small>已生成/导入</small></span>
            <span><strong>{readyGeneratedAssets.length}</strong><small>就绪 GLB</small></span>
            <span><strong>{referenceAssets.length}</strong><small>参考模型</small></span>
          </div>

          <section className="asset-library-section">
            <header className="asset-section-head">
              <span>
                <Box size={15} />
                <strong>已生成和导入的资产</strong>
              </span>
              <small>{readyGeneratedAssets.length}/{generatedAssets.length} 就绪</small>
            </header>
            {generatedAssets.length === 0 ? (
              <div className="asset-library-empty">
                <Image size={18} />
                <span>暂无已生成的资产。</span>
                <small>从「资产来源」上传图片或导入 GLB 文件。</small>
              </div>
            ) : (
              <div className="asset-card-grid">
                {generatedAssets.map((item) => renderAssetCard(item))}
              </div>
            )}
          </section>

          <section className="asset-library-section">
            <header className="asset-section-head">
              <span>
                <Layers3 size={15} />
                <strong>Khronos 参考 GLB</strong>
              </span>
              <small>材质检查</small>
            </header>
            <div className="asset-card-grid compact">
              {referenceAssets.map((item) => renderAssetCard(item, { compact: true }))}
            </div>
          </section>

          <details className="asset-library-section starter-assets">
            <summary>
              <span>预设程序化场景</span>
              <small>{starterAssets.length}</small>
            </summary>
            <div className="starter-asset-grid">
              {starterAssets.map((item) => (
                <button key={item.id} type="button" className={selectedCell === item.id ? 'starter-asset active' : 'starter-asset'} onClick={() => onSelectCell(item.id)}>
                  <CellThumb cell={item} selected={selectedCell === item.id} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.type}</small>
                  </span>
                </button>
              ))}
            </div>
          </details>
        </div>
      )
    }

    if (activePanel === 'Notebooks') {
      const noteEntries = Object.entries(notes)
      return (
        <div className="drawer-content">
          <label className="note-editor">
            <span>{cell.name} / {detail.title}</span>
            <textarea
              value={noteValue}
              onChange={(event) => onUpdateNote(noteKey, event.target.value)}
              placeholder="记录观察、问题或说明笔记..."
            />
          </label>
          <div className="drawer-actions three">
            <button type="button" className="drawer-primary" onClick={onGenerateNote}>生成草稿</button>
            <button type="button" className="drawer-secondary" onClick={onCopyNote}>复制</button>
            <button type="button" className="drawer-secondary" onClick={onExportNote}>导出 MD</button>
          </div>
          <div className="drawer-meta inline">
            <span>{noteValue.length} 字符</span>
            <span>本地自动保存</span>
            <span>{Object.keys(notes).length} 条笔记</span>
          </div>
          <div className="note-archive">
            <strong>归档</strong>
            {noteEntries.length === 0 ? (
              <p className="empty-state">暂无归档笔记。</p>
            ) : (
              noteEntries.slice(0, 8).map(([key, value]) => {
                const [cellId, organelleId] = key.split(':')
                const noteCell = findCell(allCells, cellId)
                const noteDetail = getOrganelleDetail(cellId, organelleId, customCells)
                return (
                  <button
                    key={key}
                    type="button"
                    className={key === noteKey ? 'note-archive-row active' : 'note-archive-row'}
                    onClick={() => {
                      onSelectCell(cellId)
                      onSelectOrganelle(organelleId)
                    }}
                  >
                    <span>
                      <strong>{noteCell.name} / {noteDetail.title}</strong>
                      <small>{value.slice(0, 90)}</small>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )
    }

    if (activePanel === 'Logs') {
      const entries = serverLogs?.entries || []
      return (
        <div className="drawer-content">
          <div className="settings-health">
            <div>
              <strong>诊断日志</strong>
              <small>{serverLogs?.file || '.logs/3d-model-studio-api.log'} · {entries.length} 条记录</small>
            </div>
            <button type="button" className="drawer-secondary" onClick={onRefreshServerLogs}>
              <RefreshCw size={13} />
              刷新
            </button>
            {serverLogs?.error && <p className="empty-state">{serverLogs.error}</p>}
            <div className="drawer-actions">
              <button type="button" className="drawer-primary" onClick={onExportDiagnostics}>导出诊断信息</button>
              <button type="button" className="drawer-secondary" onClick={onRefreshApiHealth}>检查 API</button>
            </div>
          </div>
          <div className="log-list">
            {entries.length === 0 ? (
              <p className="empty-state">暂无服务器日志。</p>
            ) : (
              entries.slice().reverse().map((entry, index) => (
                <article key={`${entry.ts}-${entry.requestId || index}`} className={`log-row ${entry.level || 'info'}`}>
                  <div>
                    <strong>{entry.event || 'log.event'}</strong>
                    <small>{entry.ts ? formatDate(entry.ts) : 'unknown time'} · {entry.requestId || 'no request id'}</small>
                  </div>
                  <code>{formatLogSummary(entry)}</code>
                </article>
              ))
            )}
          </div>
          <div className="history-panel">
            <div className="project-manager-head">
              <div>
                <strong>前端生成历史</strong>
                <small>{generationHistory.length} 条本地生成记录。</small>
              </div>
              <button type="button" className="drawer-secondary" disabled={generationHistory.length === 0} onClick={onClearGenerationHistory}>清空</button>
            </div>
            {generationHistory.length === 0 ? (
              <p className="empty-state">暂无前端生成历史。</p>
            ) : (
              <div className="history-list">
                {generationHistory.slice(0, 10).map((item) => (
                  <button key={item.id} type="button" className={`history-row ${item.status}`} onClick={() => onSelectCell(item.cellId)}>
                    <span>
                      <strong>{item.cellName || item.cellId}</strong>
                      <small>{item.provider} · {item.status} · {formatDuration(item.durationMs)}</small>
                    </span>
                    <small>{formatDate(item.finishedAt || item.startedAt)}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (activePanel === 'Settings') {
      return (
        <div className="drawer-content settings-list">
          <label className="settings-row">
            <span>
              <strong>剖面视图</strong>
              <small>保持剖面视图开启。</small>
            </span>
            <input type="checkbox" checked={crossSection} onChange={(event) => onSetCrossSection(event.target.checked)} />
          </label>
          <div className="settings-row">
            <span>
              <strong>渲染质量</strong>
              <small>均衡模式更快；高质量使用更高 DPR。</small>
            </span>
            <div className="segmented">
              {['balanced', 'high'].map((quality) => (
                <button
                  key={quality}
                  type="button"
                  className={settings.quality === quality ? 'active' : ''}
                  onClick={() => onUpdateSettings({ ...settings, quality })}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>
          <label className="settings-row">
            <span>
              <strong>默认生成方式</strong>
              <small>上传按钮在选择文件前使用的默认方式。</small>
            </span>
            <select
              className="settings-select"
              value={settings.generationMode}
              onChange={(event) => onUpdateSettings({ ...settings, generationMode: event.target.value })}
            >
              {GENERATION_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="settings-row">
            <span>
              <strong>截图尺寸</strong>
              <small>从 WebGL 画布导出更大的 PNG。</small>
            </span>
            <div className="segmented segmented-three">
              {SCREENSHOT_SCALE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={settings.screenshotScale === option.id ? 'active' : ''}
                  onClick={() => onUpdateSettings({ ...settings, screenshotScale: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span>
              <strong>语言</strong>
              <small>存储工作区首选的界面语言。</small>
            </span>
            <div className="segmented">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={settings.language === option.id ? 'active' : ''}
                  onClick={() => onUpdateSettings({ ...settings, language: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <label className="settings-row">
            <span>
              <strong>紧凑界面</strong>
              <small>为小屏幕稍微收紧面板间距。</small>
            </span>
            <input type="checkbox" checked={settings.compactUi} onChange={(event) => onUpdateSettings({ ...settings, compactUi: event.target.checked })} />
          </label>
          <label className="settings-row">
            <span>
              <strong>Fal 模型</strong>
              <small>当 Fal 或 Auto 服务商使用 Fal 时选用的模型。</small>
            </span>
            <select
              className="settings-select"
              value={settings.falModelId}
              onChange={(event) => onUpdateSettings({ ...settings, falModelId: event.target.value })}
            >
              {FAL_MODEL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id} title={option.description}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="settings-health">
            <div>
              <strong>API 健康状态</strong>
              <small>{apiHealth?.checkedAt ? `已检查 ${formatDate(apiHealth.checkedAt)}` : '尚未检查'}</small>
            </div>
            <button type="button" className="drawer-secondary" onClick={onRefreshApiHealth}>
              <RefreshCw size={13} />
              刷新
            </button>
            {apiHealth?.error ? (
              <p className="empty-state">{apiHealth.error}</p>
            ) : (
              <div className="health-grid">
                {Object.entries(apiHealth?.providers || {}).map(([id, provider]) => (
                  <span key={id} className={provider.configured ? 'healthy' : 'missing'}>
                    <strong>{id}</strong>
                    <small>{provider.configured ? '已配置' : '缺少密钥/服务器'}</small>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="drawer-actions">
            <button type="button" className="drawer-secondary" onClick={onClearWorkspaceCache}>清除缓存</button>
            <button type="button" className="drawer-secondary danger" onClick={onResetWorkspace}>重置数据</button>
          </div>
        </div>
      )
    }

    if (activePanel === 'Compare') {
      return (
        <div className="drawer-content">
          <div className="compare-drawer-grid">
            {[cell, compare].map((item) => {
              const itemProfile = getCellProfile(item.id, customCells)
              return (
                <div key={item.id} className="compare-card">
                  <CellThumb cell={item} selected={item.id === selectedCell} />
                  <strong>{item.name}</strong>
                  <small>{itemProfile.summary}</small>
                </div>
              )
            })}
          </div>
          <p className="drawer-copy">{profile.comparison}</p>
          <div className="cell-chip-grid">
            {allCells.filter((item) => item.id !== selectedCell).map((item) => (
              <button key={item.id} type="button" className={item.id === compareCell ? 'active' : ''} onClick={() => onSetCompareCell(item.id)}>
                {item.name.replace(' Cell', '')}
              </button>
            ))}
          </div>
          <div className="drawer-actions">
            <button type="button" className="drawer-primary" onClick={() => onSelectCell(compareCell)}>打开对比模型</button>
            <button type="button" className="drawer-secondary" onClick={() => onSetCompareCell(profile.compareTarget)}>重置目标</button>
          </div>
        </div>
      )
    }

    const modelUrl = getModelUrl(cell)
    const latestHistory = generationHistory.slice(0, 6)

    return (
      <div className="drawer-content">
        <div className="profile-stats">
          <span><strong>{allCells.length}</strong><small>模型</small></span>
          <span><strong>{galleryItems.length}</strong><small>已保存</small></span>
          <span><strong>{generationHistory.length}</strong><small>运行次数</small></span>
        </div>
        <div className="model-inspector">
          <div>
            <strong>模型检查器</strong>
            <small>{cell.name} · {getQualityLabel(cell)}</small>
          </div>
          <dl>
            <dt>来源</dt>
            <dd>{getModelSource(cell)}</dd>
            <dt>服务商</dt>
            <dd>{cell.generation?.provider || 'built-in'}</dd>
            <dt>状态</dt>
            <dd>{cell.generation?.status || 'interactive'}</dd>
            <dt>模型 URL</dt>
            <dd>{modelUrl || 'procedural scene'}</dd>
            <dt>任务</dt>
            <dd>{cell.generation?.taskId || 'none'}</dd>
          </dl>
          <div className="drawer-actions">
            <button type="button" className="drawer-secondary" disabled={!modelUrl} onClick={() => onCopyText(modelUrl, 'Model URL copied')}>复制 URL</button>
            <button type="button" className="drawer-primary" disabled={!cell.custom || !cell.imageUrl} onClick={() => onRunProviderCompare(cell.id)}>服务商对比</button>
          </div>
        </div>
        <div className="project-manager">
          <div className="project-manager-head">
            <div>
              <strong>项目</strong>
              <small>完整工作区的 IndexedDB 快照。</small>
            </div>
            <button type="button" className="drawer-primary" onClick={onSaveProject}>保存项目</button>
          </div>
          {projects.length === 0 ? (
            <p className="empty-state">暂无保存的项目。</p>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <article key={project.id} className="project-row">
                  {project.thumbnailUrl ? <img src={project.thumbnailUrl} alt={`${project.name} project thumbnail`} /> : <CellThumb cell={cell} />}
                  <div>
                    <strong>{project.name}</strong>
                    <small>{project.summary || '3D 模型工作室工作区'} · {formatDate(project.savedAt)}</small>
                  </div>
                  <div className="project-actions">
                    <button type="button" onClick={() => onLoadProject(project.id)}>加载</button>
                    <button type="button" onClick={() => onExportProject(project)}>
                      <Download size={12} />
                    </button>
                    <button type="button" onClick={() => onDeleteProject(project.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="history-panel">
          <div className="project-manager-head">
            <div>
              <strong>生成历史</strong>
              <small>服务商、耗时、结果和重试上下文。</small>
            </div>
            <button type="button" className="drawer-secondary" disabled={generationHistory.length === 0} onClick={onClearGenerationHistory}>清空</button>
          </div>
          {latestHistory.length === 0 ? (
            <p className="empty-state">暂无生成记录。</p>
          ) : (
            <div className="history-list">
              {latestHistory.map((item) => (
                <button key={item.id} type="button" className={`history-row ${item.status}`} onClick={() => onSelectCell(item.cellId)}>
                  <span>
                    <strong>{item.cellName || item.cellId}</strong>
                    <small>{item.provider} · {item.status} · {formatDuration(item.durationMs)}</small>
                  </span>
                  <small>{formatDate(item.finishedAt || item.startedAt)}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="drawer-copy">固定部件: {savedFavorite}</p>
        <p className="drawer-copy">来源: {profile.occurs}</p>
      </div>
    )
  }

  return (
    <motion.section className={`workspace-drawer drawer-${String(activePanel).toLowerCase()}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <header>
        <div>
          <strong>{activePanel}</strong>
          <span>{WORKSPACE_PANELS[activePanel]}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭面板">
          <X size={15} />
        </button>
      </header>
      <div className="drawer-meta">
        <span>{cell.name}</span>
        <span>{detail.title}</span>
        <span>查看器就绪</span>
      </div>
      {renderContent()}
    </motion.section>
  )
}
