# 汽车展厅清理笔记 / Auto Showroom Cleanup Notes

## 已完成 / Completed ✅

### 1. 3D模型预加载功能
- ✅ 创建 `src/lib/modelPreloader.js` 预加载器
- ✅ 支持7个汽车GLB模型的后台预加载（每个55-57MB）
- ✅ 提供加载进度跟踪API
- ✅ 在应用启动时自动开始预加载（延迟1秒避免阻塞初始渲染）

### 2. 配置更新
- ✅ localStorage keys 从 `bio-demo-*` 改为 `auto-showroom-*`
- ✅ HTML标题改为中文「3D汽车展厅 - Auto Showroom 3D」
- ✅ 添加中文meta描述
- ✅ 初始toast消息改为中文

### 3. 数据内容
- ✅ 车型数据已更新（Porsche, Mercedes, Tesla等）
- ✅ 零件描述已更新为汽车部件（动力总成、轮刹、排气、车身、内饰）

## 待处理 / TODO 🔧

### 代码术语清理（变量/函数名）
虽然数据内容已更新为汽车相关，但代码中仍使用生物学术语：

1. **Cell → Vehicle/Car**
   - `customCells` → `customVehicles`
   - `selectedCell` → `selectedVehicle`
   - `CELL_TYPES` → `VEHICLE_TYPES`
   - `cellData.js` → `vehicleData.js`
   - `cellCatalog.js` → `vehicleCatalog.js`
   - `CellViewer.jsx` → `VehicleViewer.jsx`
   - `CellThumb.jsx` → `VehicleThumb.jsx`

2. **Organelle → Part/Component**
   - `selectedOrganelle` → `selectedPart`
   - `ORGANELLES` → `VEHICLE_PARTS`
   - `getOrganelleDetail` → `getPartDetail`

3. **Microscope → View Mode**
   - `selectedMicroscope` → `selectedViewMode`
   - `MICROSCOPE_IMAGES` → `VIEW_MODES`

4. **其他生物学术语**
   - `specimen` → `vehicle`
   - 移除所有 "biology", "cellular" 等引用

### 界面文本中文化
需要添加中文翻译到以下位置：
- 按钮文本
- 面板标题
- 错误消息
- Toast通知
- 帮助文本

## 建议 / Recommendations

### 短期（立即）
1. 重命名核心文件和变量以移除生物学术语
2. 添加中文界面文本（至少主要按钮和标题）

### 中期
1. 创建完整的i18n系统支持中英文切换
2. 优化预加载策略（按需加载 vs 全部预加载）
3. 添加加载进度UI指示器

### 长期
1. 考虑使用Git LFS管理大型GLB文件（每个55-57MB）
2. 实现模型压缩或LOD（细节层次）系统
3. 添加更多汽车品牌和车型

## 技术债务 / Technical Debt

- 文件名仍包含 "Cell" (如 `3DCellForge`)
- 仓库名称仍为 `3DCellForge`（需要GitHub重命名）
- 许多注释仍引用生物学概念
- localStorage中的旧数据可能与新key不兼容

