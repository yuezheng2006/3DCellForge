export const ASSET_CATEGORIES = [
  {
    id: 'artifact',
    label: '博物馆文物',
    motionProfile: 'artifact',
    sceneProfile: 'artifact',
    keywords: ['artifact', 'bronze', 'gold mask', 'golden mask', 'mask', 'statue', 'relic', 'sanxingdui', '三星堆', '青铜', '金器', '金面', '黄金面具', '面具', '文物', '器物', '人像'],
    strongKeywords: ['sanxingdui', '三星堆', 'bronze mask', 'gold mask', 'golden mask', '青铜人头像', '戴金面罩', '黄金面具'],
    material: '金属、铜绿、浮雕和陈旧表面细节',
    scale: '参考派生的物体比例',
    inspectionFocus: '轮廓、铜绿、浮雕、边缘轮廓',
    description: '博物馆风格的文物资产。重要的视觉信号是轮廓、表面浮雕、材质老化和可读的符号细节，而非机械精度。',
    value: '最适合慢速检查演示，配合侧光、近距离环绕和面部、边缘轮廓及风化材质过渡的细节暂停。',
    tags: ['文物', '铜绿', '浮雕细节', '博物馆展示', '检查'],
  },
  {
    id: 'road',
    label: '性能车辆',
    motionProfile: 'road',
    sceneProfile: 'road',
    keywords: ['supercar', 'sports car', 'race car', 'ferrari', 'lamborghini', 'porsche', 'vehicle', 'automobile', 'car', 'truck', 'suv', 'motorcycle', '跑车', '赛车', '汽车', '法拉利', '兰博基尼', '保时捷', '卡车', '摩托'],
    strongKeywords: ['supercar', 'sports car', 'race car', 'ferrari', 'lamborghini', 'porsche', '跑车', '赛车', '法拉利', '兰博基尼', '保时捷'],
    material: '喷漆车身面板、玻璃、橡胶、合金和深色装饰',
    scale: '单车资产',
    inspectionFocus: '姿态、轮毂、玻璃顶篷、前脸轮廓',
    description: '道路车辆资产，姿态、轮毂位置、前脸轮廓、玻璃顶篷和车身高光决定模型是否令人信服。',
    value: '使用低角度相机、道路推进和前四分之三取景。演示应展现运动感、光泽和质量感，而非将其视为静态标本。',
    tags: ['车辆', '道路通过', '低角度相机', '漆面光泽', '展示'],
  },
  {
    id: 'vessel',
    label: '海军舰艇',
    motionProfile: 'vessel',
    sceneProfile: 'vessel',
    keywords: ['aircraft carrier', 'aircraft car', 'carrier', 'warship', 'destroyer', 'ship', 'vessel', 'naval', 'submarine', '航母', '航空母舰', '军舰', '驱逐舰', '舰', '船', '潜艇'],
    strongKeywords: ['aircraft carrier', 'aircraft car', '航母', '航空母舰', 'warship', 'destroyer'],
    material: '喷漆钢材、甲板表面、塔形结构、天线细节和水线质量',
    scale: '大型舰艇资产',
    inspectionFocus: '船体长度、甲板平面、岛式建筑、水线',
    description: '海军舰艇资产。关键读取是长船体、甲板平面、岛式/上层建筑和厚重轮廓，而非小装饰部件。',
    value: '使用慢速侧面巡航、宽广的相机距离、水/尾流提示和更沉重的节奏，使物体不会感觉像小玩具。',
    tags: ['海军', '船体', '甲板', '水线', '慢速巡航'],
  },
  {
    id: 'aircraft',
    label: '飞行器',
    motionProfile: 'aircraft',
    sceneProfile: 'aircraft',
    keywords: ['fighter jet', 'fighter', 'airplane', 'aeroplane', 'aircraft', 'plane', 'jet', 'drone', 'helicopter', 'missile', '战斗机', '飞机', '歼', '轰炸机', '无人机', '直升机', '导弹'],
    strongKeywords: ['fighter jet', 'fighter', 'airplane', 'aircraft', '战斗机', '飞机', '无人机'],
    material: '喷漆机身、座舱玻璃、机翼边缘、进气口和排气几何',
    scale: '单架飞行器资产',
    inspectionFocus: '机身、机翼、尾翼、座舱、发动机区域',
    description: '飞行器资产，机身中心线、机翼、尾翼、座舱和发动机区域必须从多个角度保持一致。',
    value: '使用飞行通过相机，配合倾斜、尾迹和前向漂移。演示应使方向和升力显而易见。',
    tags: ['飞行器', '飞行通过', '倾斜', '座舱', '气动形态'],
  },
  {
    id: 'product',
    label: '产品物体',
    motionProfile: 'product',
    sceneProfile: 'product',
    keywords: ['watch', 'phone', 'camera', 'shoe', 'bag', 'chair', 'lamp', 'bottle', 'headphone', 'jewelry', 'ring', '手表', '手机', '相机', '鞋', '包', '椅子', '灯', '瓶', '耳机', '戒指'],
    strongKeywords: ['watch', 'phone', 'camera', 'shoe', 'handbag', '手表', '手机', '相机'],
    material: '混合产品材料、边缘高光、纹理断裂和品牌式表面区域',
    scale: '单个产品资产',
    inspectionFocus: '轮廓、材质区域、可识别的特征布局',
    description: '产品资产。模型质量取决于轮廓、主要材质区域和可识别特征布局是否在生成中幸存。',
    value: '使用干净的工作室转盘、柔和反射和可识别产品特征的短暂缩放暂停。',
    tags: ['产品', '转盘', '工作室灯光', '材质区域', '细节暂停'],
  },
  {
    id: 'specimen',
    label: '概念车辆',
    motionProfile: 'specimen',
    sceneProfile: 'specimen',
    keywords: ['concept', 'prototype', 'design', 'study', 'experimental', 'showcase', 'demo', 'preview', '概念', '原型', '设计', '展示'],
    strongKeywords: ['concept', 'prototype', 'experimental', 'showcase', '概念', '原型'],
    material: '实验性表面、创新形式、颜色分离的设计元素',
    scale: '概念车辆资产',
    inspectionFocus: '整体形式、表面处理、设计细节',
    description: '概念/实验车辆资产。有用的读取是整体形式语言、表面处理和创新设计细节，而非生产精度。',
    value: '使用近距离环绕、干净的边缘光和较慢的缩放。这最适合作为设计展示视图。',
    tags: ['概念', '实验性', '检查环绕', '设计研究', '展示'],
  },
]

export const SCENE_PROFILES = {
  road: {
    id: 'road',
    label: '道路展示',
    summary: '低角度道路平台、移动车道标记和前推相机。',
    environment: '道路平台',
    badges: ['低角度相机', '移动车道', '光泽读取'],
  },
  aircraft: {
    id: 'aircraft',
    label: '天空飞行通过',
    summary: '明亮的天空体积、尾迹条纹和倾斜飞行动作。',
    environment: '天空通过',
    badges: ['倾斜', '尾迹', '前向漂移'],
  },
  vessel: {
    id: 'vessel',
    label: '海军水线',
    summary: '水面、宽阔尾流和慢速侧面跟踪相机。',
    environment: '水线',
    badges: ['尾流', '侧面巡航', '厚重比例'],
  },
  artifact: {
    id: 'artifact',
    label: '博物馆转盘',
    summary: '黑暗画廊舞台、温暖聚光灯和近距离材质检查。',
    environment: '博物馆基座',
    badges: ['聚光灯', '铜绿', '近距离环绕'],
  },
  product: {
    id: 'product',
    label: '工作室转盘',
    summary: '干净的反射工作室地板、柔光箱和受控产品展示。',
    environment: '工作室扫描',
    badges: ['转盘', '反射', '细节暂停'],
  },
  specimen: {
    id: 'specimen',
    label: '设计工作室',
    summary: '干净的工作室照明、设计检查角度和近距离细节环绕。',
    environment: '设计工作室',
    badges: ['边缘光', '检查', '细节聚焦'],
  },
}

export function getAssetIntelligence(cell = {}) {
  const category = inferAssetCategory(cell)
  return {
    category,
    scene: getSceneProfile(category.sceneProfile),
  }
}

export function inferAssetCategory(cell = {}) {
  const overrideId = normalizeCategoryOverride(cell.intelligence?.categoryId)
  if (overrideId) return buildCategoryWithInsight(ASSET_CATEGORIES.find((rule) => rule.id === overrideId), cell.intelligence)

  const primaryText = normalizeSearchText([
    cell.id,
    cell.fullName,
    cell.sourceFileName,
    cell.name,
    cell.type,
    cell.template,
  ])
  const secondaryText = normalizeSearchText([
    cell.referenceSummary,
    cell.referenceSource,
    cell.imageUrl,
    cell.thumbnailUrl,
    cell.generation?.provider,
    cell.generation?.message,
    cell.generation?.modelUrl,
    cell.generation?.rawModelUrl,
  ])

  const scored = ASSET_CATEGORIES
    .map((rule) => ({
      rule,
      score:
        scoreKeywords(primaryText, rule.keywords, 6) +
        scoreKeywords(secondaryText, rule.keywords, 2) +
        scoreKeywords(primaryText, rule.strongKeywords, 18) +
        scoreKeywords(secondaryText, rule.strongKeywords, 5),
    }))
    .map((entry) => applyCategoryOverrides(entry, primaryText))
    .sort((a, b) => b.score - a.score)

  if (scored[0]?.score > 0) return buildCategoryWithInsight(scored[0].rule, cell.intelligence)
  return ASSET_CATEGORIES.find((rule) => rule.id === 'product')
}

export function getSceneProfile(input = 'product') {
  const profileId = typeof input === 'string'
    ? input
    : input.sceneProfile || input.motionProfile || inferAssetCategory(input).sceneProfile

  return SCENE_PROFILES[profileId] || SCENE_PROFILES.product
}

function applyCategoryOverrides(entry, primaryText) {
  const score = entry.score

  if (entry.rule.id === 'vessel' && hasKeyword(primaryText, ['aircraft carrier', 'aircraft car', '航母', '航空母舰'])) {
    return { ...entry, score: score + 32 }
  }

  if (entry.rule.id === 'aircraft' && hasKeyword(primaryText, ['aircraft carrier', 'aircraft car', '航母', '航空母舰'])) {
    return { ...entry, score: score - 18 }
  }

  if (entry.rule.id === 'road' && hasKeyword(primaryText, ['supercar', 'sports car', 'race car', 'ferrari', 'lamborghini', 'porsche', '跑车', '赛车', '法拉利', '兰博基尼', '保时捷'])) {
    return { ...entry, score: score + 24 }
  }

  if (entry.rule.id === 'artifact' && hasKeyword(primaryText, ['sanxingdui', '三星堆', 'bronze mask', 'gold mask', '青铜人头像', '戴金面罩'])) {
    return { ...entry, score: score + 28 }
  }

  return entry
}

function buildCategoryWithInsight(category, insight) {
  if (!category || !insight?.configured) return category

  return {
    ...category,
    label: insight.categoryLabel || category.label,
    material: insight.material || category.material,
    description: insight.description || category.description,
    value: insight.presentation || category.value,
    inspectionFocus: insight.inspectionFocus || category.inspectionFocus,
    tags: [...(Array.isArray(insight.tags) ? insight.tags : []), ...category.tags],
  }
}

function normalizeCategoryOverride(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return ASSET_CATEGORIES.some((rule) => rule.id === normalized) ? normalized : ''
}

function normalizeSearchText(parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => matchesKeyword(text, keyword))
}

function scoreKeywords(text, keywords = [], weight) {
  return keywords.reduce((score, keyword) => (matchesKeyword(text, keyword) ? score + getKeywordWeight(keyword, weight) : score), 0)
}

function matchesKeyword(text, keyword) {
  if (!text || !keyword) return false
  const normalizedKeyword = keyword.toLowerCase()
  if (/[a-z0-9]/i.test(normalizedKeyword)) {
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text)
  }

  return text.includes(normalizedKeyword)
}

function getKeywordWeight(keyword, baseWeight) {
  return keyword.length > 5 ? baseWeight + 2 : baseWeight
}
