# 图表设计规范（DIAGRAM_SPEC）

以 TopologyDiagram / FourLayersDiagram / LayeredDiagram 为标杆。所有重绘的图表组件必须遵循本规范。

## 1. 信息架构（先于视觉）

每张图回答一个核心问题（"数据怎么流""谁调用谁""状态怎么变"）。绘制前先从正文中提取：

- **主链路**：这张图要讲的那条"故事线"
- **参与方**：哪些服务/组件/角色在链路上
- **语义分组**：哪些参与方属于同一域（如"中心服务""驱动""存储"）
- **方向与协议**：每条连线传递什么（HTTP/gRPC/MQTT/JDBC）、朝哪个方向

**禁止流水账式"A→B→C"单链**——如果只有三个节点一条线，那张图不值得画。要么补充上下文（周围还有谁），要么用分组+区域让结构自明。

## 2. 视觉语言

### 2.1 画布

```html
<div class="dc3-diagram">
  <svg viewBox="0 0 <宽> <高>" role="img" :aria-label="s.aria">
```

- 根元素 `div.dc3-diagram`（站级样式提供边框/背景/内边距/圆角）
- viewBox 宽度 1040~1400，高度按内容自然展开（300~800）
- `role="img"` + `:aria-label`（双语）

### 2.2 背景

```html
<pattern id="<id>-grid" width="40" height="40" patternUnits="userSpaceOnUse">
  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
</pattern>
<rect fill="url(#<id>-grid)" width="100%" height="100%"/>
```

### 2.3 语义区域（region）

```html
<rect fill="var(--dc3-region-be)" rx="12"
      stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3" stroke-width="1"
      x="..." y="..." width="..." height="..."/>
<text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="...+12" y="...+18">区域标签</text>
```

- 用区域把相关节点框在一起（如"中心服务""驱动""存储"）
- 区域有浅色底 + 虚线边框 + 左上角标签
- 可用色系：`--dc3-region-be`（后端绿）、`--dc3-region-amber`（运维琥珀）

### 2.4 节点（box）

```html
<rect fill="var(--dc3-fe-fill)" rx="6"
      stroke="var(--dc3-fe-stroke)" stroke-width="1"
      x="..." y="..." width="..." height="..."/>
<text fill="var(--dc3-box-name)" font-size="12" font-weight="600"
      text-anchor="middle" x="中心x" y="标题baseline">标题</text>
<text fill="var(--dc3-text2)" font-size="9"
      text-anchor="middle" x="中心x" y="副标题baseline">副标题</text>
```

- 每个节点必须有**标题 + 副标题**（副标题补充角色/端口/协议）
- 色彩按角色分：
  - `fe`（前端/客户端）：`--dc3-fe-fill/stroke`
  - `be`（后端服务）：`--dc3-be-fill/stroke`
  - `db`（数据库）：`--dc3-db-fill/stroke`
  - `bus`（消息总线）：`--dc3-bus-fill/stroke`
  - `amber`（告警/运维）：`--dc3-amber-fill/stroke`
  - `rose`（安全/异常）：`--dc3-rose-fill/stroke`
  - `ext`（外部/设备）：`--dc3-ext-fill/stroke`
- 同域节点等宽等高等距

### 2.5 连线（arrow）

```html
<line marker-end="url(#<id>-ah)"
      stroke="var(--dc3-arrow)" stroke-width="1"
      x1="..." y1="..." x2="..." y2="..."/>
<text fill="var(--dc3-arrow-label)" font-size="8-9"
      x="..." y="...">协议/方向标注</text>
```

- **每条线必须有语义标注**（协议名/数据类型/方向），font-size 8~9
- 箭头 marker 定义在 `<defs>` 里，id 带组件前缀避免全局冲突
- 主链路 stroke-width 1~1.5；弱化线用 `stroke-dasharray="4,4"` + stroke-width 0.8
- 不同语义可用不同色：主数据流 `--dc3-arrow`、安全流 `--dc3-rose-stroke`、运维流 `--dc3-amber-stroke`
- **禁止线穿过节点或文字**——先画线再画节点（SVG 后画覆盖前画），或调整布局

### 2.6 图例（legend）

如果图中有 3 种以上颜色/线型，底部加图例：

```html
<rect x="..." y="底部" width="..." height="24" fill="none"/>
<rect x="..." y="..." width="10" height="10" fill="var(--dc3-fe-fill)" rx="2"/>
<text font-size="9" fill="var(--dc3-text2)">前端</text>
<!-- ... 每种色彩一行 -->
```

## 3. 代码结构

```vue
<script lang="ts" setup>
import {computed} from 'vue'
const props = defineProps<{ lang: 'zh' | 'en' }>()
const DICT = {
  zh: { /* 全部中文文案 */ },
  en: { /* 全部英文文案 */ }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg ...>...</svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* 只放本图特有的布局微调；色值/语义色一律用 --dc3-* 变量 */
</style>
```

- DICT 的 key 语义命名（如 `webName`、`httpApi`），不要 `t1`/`t2`
- `aria` 字段给一段完整的无障碍描述
- marker/pattern id 必须带组件前缀（如 `dc3-arch-ah`），避免多图同页冲突

## 4. 明确禁止

- ❌ 光晕/发光效果（`drop-shadow`、`filter: glow`）
- ❌ 线穿过节点或文字
- ❌ 无标注的连线
- ❌ 单层平面布局（无区域分组、无层次）
- ❌ "A→B→C" 三节点一条线的流水账
- ❌ 深色/渐变底、阴影、3D 效果
- ❌ 花哨动画
