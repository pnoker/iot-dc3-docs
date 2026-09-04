# IoT DC3 对外内容中心（dc3/blog）

> 系列名：**开源工业物联网手记**（栏目 tag：`#开源工业物联网手记#`）
> 主体：IoT DC3 —— 多协议接入、云原生、AI 赋能的开源工业物联网平台，面向智能体演进
> 事实基线：2026-08-30 定稿，全部数字与口径已对照仓库 / 官网核实（见 §5）

## 1. 仓库定位

本目录（iot-dc3-docs 仓库的 `dc3/blog/`）是 IoT DC3 对外技术内容的单一真相源：文章源稿、配图源文件、发布产物与发布登记集中于此，**一次创作、多平台发布**。目标渠道为微信公众号、知乎、CSDN。

内容定位为技术品牌型，不做营销号。三条内容线交替：

| 内容线 | 目的 | 对应篇目 |
| --- | --- | --- |
| 趋势借势 | 以行业热点引出项目定位，负责拉新 | 01、07、09 |
| 硬核技术 | 展示工程质量与真实设计取舍，负责建立专业信任 | 02–06 |
| 上手转化 | 降低参与门槛，负责沉淀用户与贡献者 | 08、10 |

每篇文章文末固定统一推广块（源稿以令牌表示，发布时由流水线替换为真实图链；站点与仓库文件引用一律 Markdown 链接，不用纯文本或行内代码）：

```
---

PROMO_CARD

**IoT DC3** · [GitHub](https://github.com/pnoker/iot-dc3) | [Gitee](https://gitee.com/pnoker/iot-dc3) | [文档 docs.dc3.site](https://docs.dc3.site) | [在线书 book.dc3.site](https://book.dc3.site) | [演示 demo.dc3.site](https://demo.dc3.site) | [官网 dc3.site](https://dc3.site)
```

- `PROMO_CARD` 令牌在发布时替换为 `[![IoT DC3 · 多协议 · 云原生 · 开源工业物联网平台](卡片URL)](https://github.com/pnoker/iot-dc3)`——整图可点击直达 GitHub 仓库
- 卡片图源 `tools/assets/promo-card.svg`（取自 iot-dc3 官方品牌 banner，过时的"28+ 协议驱动"已修正为"36+"），已上传图床，URL 与链接行配置在 `tools/promo.json`，全站所有文章复用同一 URL
- 链接行覆盖六个入口：GitHub · Gitee · docs · book · demo · dc3.site；仓库文件引用链接到 `github.com/pnoker/iot-dc3/blob/main/<路径>`

## 2. 目录结构

```
dc3/blog/               iot-dc3-docs 仓库内的对外内容中心
├── README.md             本文档：定位 / 清单 / 工作流 / 内容红线 / 配图规范
├── notes/                手记（开源工业物联网手记 01–10、概念解读 17–21），每篇一个自包含目录
│   └── <文章名>/
│       ├── index.md          文章源稿（固定文件名，目录名即文章名）
│       ├── images/           渲染导出的 2x PNG（封面 + 内部图）
│       └── slides/           配图 HTML 源文件（slides-images 技能）
├── release/              发版快讯（Release News，11–16，目录结构同上）
├── tools/
│   ├── _gen_covers.py    封面生成器（品牌骨架 + 逐篇母题，产出至各文章 slides/cover.html）
│   └── assets/           logo 资产（dc3-logo.svg，封面内以 ../../../tools/assets/ 引用）
└── .csdn-registry.json   CSDN 发布登记表（articleId / 标题 / 标签 / 图床 URL）
```

文章目录名即文章名（`YYYYMMDD-<slug>`，日期为定稿日，不带篇号；篇目序号仅在 §3 清单中维护）；目录内源稿固定命名 `index.md`，与 `images/`、`slides/` 同级。分类规则：手记系列入 `notes/`，发版快讯入 `release/`——两类内容风格不同，新增内容线时按风格增设同级分类目录。

## 3. 内容清单与发布状态

两条系列共 16 篇。手记系列的阅读弧线：01 定调 → 02–05 讲"接得进、跑得稳、存得住" → 06–07 讲"用得智能" → 08 上手 → 09 信任 → 10 收口转化；发版快讯以版本为锚，把 2025 年度收敛到 v2026.8.19 的主干演进衔接成完整叙事。

### 3.1 手记系列（01–10，已完结）

| # | 标题 | 内容线 | CSDN |
| --- | --- | --- | --- |
| 01 | [十年了，我们把工业物联网平台交给了智能体](notes/20260830-agent-era-10years/index.md) | 趋势 | [164192605](https://blog.csdn.net/Pnoter/article/details/164192605) |
| 02 | [36 个驱动模块背后：协议碎片化的长期战争](notes/20260830-36-drivers/index.md) | 硬核 | [164193344](https://blog.csdn.net/Pnoter/article/details/164193344) |
| 03 | [拆开一个开源工业物联网平台：六层微服务架构全解析](notes/20260830-architecture/index.md) | 硬核 | [164193373](https://blog.csdn.net/Pnoter/article/details/164193373) |
| 04 | [换个消息队列，不改一行业务代码：DC3 的六适配器实践](notes/20260830-mq-adapters/index.md) | 硬核 | [164193388](https://blog.csdn.net/Pnoter/article/details/164193388) |
| 05 | [测点数据存哪？四款时序数据库可插拔背后的工程决策](notes/20260830-tsdb-choice/index.md) | 硬核 | [164193443](https://blog.csdn.net/Pnoter/article/details/164193443) |
| 06 | [把大模型接进车间：DC3 AI Agentic Center 的能力与边界](notes/20260830-agentic-center/index.md) | 硬核 | [164193490](https://blog.csdn.net/Pnoter/article/details/164193490) |
| 07 | [MCP 落地工业平台：从大模型对话到设备点位的一次调用](notes/20260830-mcp-interface/index.md) | 趋势 | [164193501](https://blog.csdn.net/Pnoter/article/details/164193501) |
| 08 | [从零部署 IoT DC3：四步快速启动实录](notes/20260830-quickstart/index.md) | 上手 | [164193516](https://blog.csdn.net/Pnoter/article/details/164193516) |
| 09 | [当智能体也能调设备接口：工业数据的安全账本](notes/20260830-security-ledger/index.md) | 趋势 | [164193536](https://blog.csdn.net/Pnoter/article/details/164193536) |
| 10 | [一本书、一个 Demo、一个 CLI：参与开源项目 DC3 的完整地图](notes/20260830-ecosystem-map/index.md) | 上手 | [164193561](https://blog.csdn.net/Pnoter/article/details/164193561) |

> CSDN 线上标题按平台调性适度精简，以登记表与线上页面为准。

### 3.1b 概念解读系列（17–21）

由 2025-02 的四篇存量概念文章升级重写而来（物模型方向、单绑定口径），替换发布到原 articleId（设备篇因旧 ID 被平台标记改发新文）：

| # | 标题 | CSDN |
| --- | --- | --- |
| 17 | [IoT DC3 概念解读：驱动——协议接入的统一抽象](notes/20260901-driver-concept/index.md) | [145554846](https://blog.csdn.net/Pnoter/article/details/145554846) |
| 18 | [IoT DC3 概念解读：设备——物理实体的平台建模](notes/20260901-device-concept/index.md) | 待重发（见下注） |
| 19 | [IoT DC3 概念解读：位号——工业数据的最小语义单元](notes/20260901-point-concept/index.md) | [145551126](https://blog.csdn.net/Pnoter/article/details/145551126) |
| 20 | [IoT DC3 概念解读：模板——加强版的物模型](notes/20260901-profile-concept/index.md) | [145551051](https://blog.csdn.net/Pnoter/article/details/145551051) |
| 21 | [IoT DC3 概念解读：把设备抽象成一套语义模板——位号、指令、事件与面向智能体的设备建模](notes/20260901-device-to-profile/index.md) | [164342634](https://blog.csdn.net/Pnoter/article/details/164342634) |

> 18 注：2026-09-01 根因实验确认两层原因——设备篇内容含真实审核触发点（同期同构的 19/20 过审），且当日高频发布后账号进入"全拒状态"（中性对照文亦拒）。待账号冷却后定位触发词并在旧文 145553624 上重发修正版。2026-09-04 复验：21 篇（设备到模板全链路，含 AI 章节表述）当日发布即时过审并上线，账号状态已恢复。

### 3.2 发版快讯（11–16，R1–R6）

文体参照开源社区 Release News，每篇多特性、每特性按"做了什么 / 怎么做的 / 为什么"展开：

| # | 版本锚点 | 主题 |
| --- | --- | --- |
| 11（R1） | [dc3.release.20250425（2025 年度版）](release/20260830-release-2025-annual/index.md) | 架构瘦身与数据底座收敛 |
| 12（R2） | [v2026.6.19](release/20260830-release-v2026.6.19/index.md) | AI Chat 流式体验与 OpenAPI 文档化 |
| 13（R3） | [v2026.6.26](release/20260830-release-v2026.6.26/index.md) | Spring AI 2.0 正式版迁移与文档站重构 |
| 14（R4） | [v2026.7.3](release/20260830-release-v2026.7.3/index.md) | 聚合大版本：前端入仓与 MCP 管理面 |
| 15（R5） | [v2026.7.27](release/20260830-release-v2026.7.27/index.md) | 数据链路可靠性与可观测性 |
| 16（R6） | [v2026.8.19（当前最新发布版）](release/20260830-release-v2026.8.19/index.md) | 八个新驱动、租约遥测与部署矩阵 |

### 3.3 发布进度

- **CSDN**：手记 01–10 已全部上线并经线上验证（2026-08-30 首发、2026-09-01 两轮更新：内容质量重写 + URL 链接化）；概念解读 17–20 已于 2026-09-01 上线（19 原为 VIP 付费文，已改全部可见）；21（设备到模板全链路）于 2026-09-04 首发。登记于 `.csdn-registry.json`
- **知乎、公众号**：待发布
- **发版快讯 11–16**：待发布
- **推广卡片**：图床版已制作（`tools/promo.json`），但 CSDN 机审对文末带链推广图敏感（17 篇首提即拒）；当前线上统一使用六链接行方案，卡片图暂缓，重设计方案见记忆

## 4. 创作与发布工作流

新增或修订一篇内容，按以下四步执行。

### 4.1 写作

在 `<分类>/` 下以文章名建立目录，源稿固定命名 `index.md`——目录名 `YYYYMMDD-<slug>`，前缀为文章定稿日期，slug 用小写短横线主题词，不带篇号（篇目序号仅在 §3 清单中维护，新增内容顺延清单序号即可）。文首以引用块登记元信息（摘要、热点挂钩、发布渠道建议、配图引用清单），正文遵循 §5 内容红线。文章是唯一真相源，各平台发布物均由源稿适配而来，不在平台侧单独维护副本；`images/` 与 `slides/` 子目录随文章目录建立。

### 4.2 配图

配图全部以 slides-images 技能绘制：HTML/CSS 单文件为源（`<分类>/<文章名>/slides/<图名>.html`），Playwright 2x 渲染导出 PNG 至同文章的 `images/` 目录，文章内以相对路径 `images/<图名>.png` 引用。样式与色板规范见 §6。

```bash
# 渲染单张或多张信息图（输出至该文章的 images 子目录）
python3 ~/.zcode/skills/slides-images/scripts/render.py <分类>/<文章名>/slides/<图名>.html --images <分类>/<文章名>/images
```

### 4.3 三审与门禁

发布前对源稿做三轮审查（完整规范与口语改写对照表见 `~/.zcode/skills/csdn-publish/SKILL.md` §8）：

1. **一审（结构性自言自语，整段删除）**：内部排期、栏目规划、期数说明等读者无从理解的规划信息一律移除；
2. **二审（口吻与自指，改写）**：口语、语气词、第一人称创作叙述改写为正式书面语；
3. **三审（严谨性核查）**：技术表述、版本号、数字逐项对照事实口径清单（§5.2）。

机械项由 `csdn-helpers.mjs prep` 预处理，改写完成后 `csdn-helpers.mjs audit` 门禁必须 PASS：

```bash
node ~/.zcode/skills/csdn-publish/scripts/csdn-helpers.mjs audit <article.md>
```

### 4.4 发布与登记

- **CSDN**：走 csdn-publish 技能的 browser-pipeline 流水线，一次调用完成标题注入、正文合成粘贴、配图上传、标签设置、发布与登记，并以 verifyLive 做线上验证。修订已发布文章时以 `articleId` 打开编辑页更新，登记表中已上传图床的配图按 `reuseUrls` 复用，不重复上传。
- **知乎、公众号**：手动发布，源稿取 `notes/`、`release/`，配图取 `images/`。公众号正文外链不可点击，文末 CTA 链接以文字展示或"阅读原文"承载；封面直接使用 2.35:1 封面图。
- **登记**：发布结果回填 `.csdn-registry.json`（articleId、标题、标签、图床 URL、发布时间），作为重传复用与发布状态查询的依据。

## 5. 内容红线

### 5.1 文风规范

公开技术内容的底线：读者阅读的是技术内容，不是作者的自言自语。全部文章在创作与修订时执行以下标准：

- **正式书面语**：不出现口语、网络用语、语气词；技术名词以官方文档口径为准。
- **逻辑连贯**：每段有明确的论证义务——要么陈述事实，要么推进论证；段间以内容衔接，不依赖"接下来""上面说到"类过程性过渡。
- **无自言自语结构**：内部排期、选题规划、创作心路、思考过程一律不入正文；栏目规划类信息只存在于本 README。
- **无自指叙述**：不以第一人称叙述创作行为；第一人称仅用于表述项目团队的技术决策（如"我们在 v2026.7.3 将前端并入主仓库"）。
- **插入语收敛**：破折号口语插入语改写为独立句子。
- **章节命名**：标题直接以内容命名（名词性短语或"对象：要点"结构），不用疑问句、第二人称与自我指涉的态度声明（"先说清楚""如实说""刻意不做"一类）；技术类文章的范围边界章节统一命名"适用范围与限制"，结尾章节统一命名"结语"。

### 5.2 事实口径清单（已核实数字，可直接使用）

- 36 个驱动模块：工业协议 17、IoT 协议 7、数据桥接 5、基础通信 5、仿真调试 2（README 分 Category 表）
- MQ 六适配器 + core + TCK；TSDB 四适配器（24 例契约套件，跳过数如实声明）；DB 三引擎（PostgreSQL / MySQL / MariaDB，另有 R2DBC 响应式变体）
- 四大中心服务：agentic / auth / data / manager（另有 center-single 单体形态）
- 技术栈：Java 21、Spring Boot 4、Spring Cloud 2025、Spring AI 2、gRPC/Protobuf、Vue 3 + TypeScript + Vite、PostgreSQL（TimescaleDB + pgvector + AGE）
- 社区：Gitee 9,736 star / 4,076 fork（GVP）；GitHub 1,118 star / 236 fork；项目始于 2016 年（favicon 版权头 2016-present）；GitHub 仓库 2018-08-28 创建
- 站点：dc3.site · docs.dc3.site · book.dc3.site · demo.dc3.site
- 许可：AGPL 3.0（个人学习 / 内部使用免费；修改需开源；闭源商用需商业授权）

### 5.3 禁用表述

- ❌ "分布式"（品牌口径已退役，用"云原生 / 微服务"）
- ❌ "AI 驱动"（官方口径为"AI 赋能"）
- ❌ 任何未实测性能承诺（"百万并发""毫秒级响应"等一律不写）
- ❌ 虚构客户案例 / 部署规模；场景只讲 README Use Cases 四类（智慧工厂、能源监测、智慧农业、智慧城市）
- ❌ 把"告警根因 AI 分析"写成"自动处置"——官方口径是**辅助**分析（AI assists），处置仍走命令下发与人工确认
- ❌ 图内避免文学化动词（托举 / 撑起等），用支撑 / 承载 / 提供 / 封装 / 贯通

### 5.4 发版文事实红线

- 全部 commit 号、版本号、特性行为与仓库实际历史逐窗口核对（git log 整理），不凭记忆引用
- R1 锚点为 2025 年唯一正式发布波（dc3.release.20250425）；年内后续收敛工作如实标注"合入主干、随下版本线发布"
- R2 的 M5 / M6 为 Spring AI 里程碑版本，正式版迁移归入 R3 表述
- R6 结尾的主干预告（存储家族 / 令牌统一 / MCP / CLI）在发布当天按 main 最新状态刷新

### 5.5 合规边界

- 政策条文只引用公开发布原文，注明发文单位与时间，不做政策解读延伸
- AGPL 3.0 的表述以仓库 LICENSE 原文为准

## 6. 配图规范（slides-images 技能 × DC3 品牌色）

### 6.1 工具链与画布体系

源文件位于各文章目录的 `slides/<图名>.html`，渲染导出 2x PNG 至同文章的 `images/<图名>.png`。双画布体系：

- **封面 1280×545**（公众号信息流 2.35:1 精确比例）：官方品牌 V4 液态玻璃风，规范取自 `iot-dc3/.github/brand/svg/banner.zh.svg`——`#f6fbff→#edf5fd→#e7eef9` 底 + `#7fd4f2`/`#b7a5f5` 双光晕 + 白玻璃卡 + 底部 protocol mesh 曲线带。封面由 `tools/_gen_covers.py` 生成器统一产出至各文章目录的 `slides/cover.html`（共享品牌骨架 + 逐篇母题，连线端点按坐标表落在卡片边缘），修改封面文案后重跑脚本再渲染；logo 为 `dc3-web/public/favicon.svg` 蜂窝点阵按品牌 `logoword` 渐变（`#08a9de→#3c8de2→#6662d7`）填充，资产在 `tools/assets/dc3-logo.svg`（封面内以 `../../../tools/assets/dc3-logo.svg` 引用）。
- **内部信息图 1280×720**：浅底高密度，一屏最多 2~4 个视觉分区，每个分区有明确浮层标签。

品牌渐变词（标题高亮 / wordmark）：`#07549a→#149ed7→#4f52bf`。

### 6.2 主题色令牌

内部信息图以 iot-dc3-book 与 iot-dc3-online 两站共用的 VitePress 品牌变量为准（`--vp-c-brand-1/2/3`）：

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--brand` | `#0a6cb2` | 主强调（brand-1） |
| `--brand-mid` | `#1183c9` | 渐变端 / 次强调（brand-2） |
| `--brand-bright` | `#1296db` | 亮强调（brand-3） |
| `--brand-deep` | `#07549a` | 深底 / kicker 条（hero 渐变起点） |
| `--brand-tint` | `#ecf5fc` | 品牌浅底 |
| `--brand-line` | `#bcd9f0` | 品牌描边 |
| `--cyan` / `--indigo` | `#9beeff` / `#5558c9` | 仅作 hero 渐变端点与 AI 线类别色 |
| `--ink` | `#1b2733` | 主文字（text-1） |
| `--ink-2/--ink-3` | `#475563` / `#6b7a89` | 次级 / 弱化文字 |
| `--line` | `#e2e7ec` | 分隔线（divider） |
| `--bg-0/--bg-1` | `#f8fafc` / `#eef5fb` | 三层背景底 |

类别色语义（全系列固定）：蓝 = 平台 / 结构，青 `#0e9384` = 数据，靛 `#5558c9` = AI / 智能体，琥珀 `#f79009` = 协议 / 信号，灰 `#8a98a8` = 规划中，红 `#e5484d` 仅用于反面对比。

状态图例四档统一：**默认启用 / 可选适配 / 契约认证 / 规划中**。

### 6.3 产出物清单

共 52 张 = 16 封面 + 36 内部图（手记 10 篇每篇 1 封面 + 2 内部图，发版线 6 篇共 6 封面 + 16 内部图），归档于各文章目录的 `images/` 与 `slides/`，下表图名为目录内文件名（省略扩展名）：

| 篇 | 封面 | 内部图 |
| --- | --- | --- |
| 01 | cover 三阶梯+轨道环 | evolution 三阶段演进 · positioning 三支柱定位卡 |
| 02 | cover 36 格驱动矩阵 | driver-landscape 五分类全景 · driver-sdk 统一建模与 SDK |
| 03 | cover 六层悬浮栈 | architecture 六层链路 · facade-layers Facade+DO/BO/VO |
| 04 | cover 六管汇流 | mq-family core+TCK 全景 · mq-swap 选型表+换型三步 |
| 05 | cover 四库圆柱 | tsdb-matrix 能力矩阵 · tsdb-swap 换型+诚实降级 |
| 06 | cover AI 核心+工具轨道 | ai-stack 三层能力栈 · ai-chat-scene 对话调用路径 |
| 07 | cover /mcp 枢纽 | mcp-pipeline 四站旅程 · mcp-token 令牌统一+TTL 阶梯 |
| 08 | cover 四步阶梯 | deploy-flow 四步部署 · deploy-verify 验证清单 |
| 09 | cover 同心防御环 | security-layers 四层纵深 · tenant-path 租户数据路径 |
| 10 | cover 生态星座 | ecosystem-map 资源地图 · contribution-flow 贡献+许可 |
| 11 | cover | slimdown 瘦身收敛 · data-foundation 数据底座 · release-eng 发布工程 |
| 12 | cover | chat-streaming 流式会话 · openapi-enums OpenAPI+枚举 · eng-modern 工程现代化 |
| 13 | cover | agentic-springai Spring AI 2.0 · docs-ia 文档站 IA |
| 14 | cover | web-monorepo 前端入仓 · tenant-interceptor 租户拦截器 |
| 15 | cover | ingest-buffer 摄取缓冲 · driver-localbuffer 驱动暂存 · otel-observability OTel 观测 |
| 16 | cover | eight-drivers 八驱动 · lease-telemetry 租约遥测 · deploy-contract 部署矩阵 |

各文章目录中另有 6 份未定稿源文件（11 篇目录：driver-cloud、release-highlights；12 篇目录：storage-families、swap-upgrade；13 篇目录：alignment-matrix、cli-mcp），未渲染导出、未被文章引用，留作后续设计探索。
