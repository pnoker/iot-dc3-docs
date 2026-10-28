# 维护手册（MAINTAINING）

本文件写给 iot-dc3-docs 的维护者（含 AI 协作者），记录这套文档的**口径决策、构建守卫与维护流程**。改文档前先读这里，可以避免重新踩一遍已经裁决过的坑。

> **2026-10-11 重定锚**：原"事实基线锁定 release 分支（2026.5.x 线）"的政策已废弃——release 分支自 2026-06-26 停更（落后 main 1200+ commit），且 app 镜像从未按 release 线发布（Docker Hub 上 app 服务镜像从 2025.9.3 直接跳 2026.9，不存在 2026.5/2026.6 tag）。本站事实源改为 **main 分支 + Docker Hub 已发布 tag**（见下表第 2 行）。原第 4 节"release 追平清单"已随重定锚整体应用于正文并归档（第 4 节）。

## 1. 口径决策（已拍板，勿反复）

| 主题 | 口径 | 决策时间 |
|------|------|---------|
| 驱动数量 | **全站统一 36**（官方叙事，与驱动总览 36 行表、dc3.site 定价页一致）。v2026.9.22 起的发布镜像实含全部 36 个驱动模块——**不在文档里写 28**（中英文都不许，含 meta description） | 2026-09-19，2026-10-11 重申英文变体 |
| 文档基线 | **main 分支 + Docker Hub 已发布 tag**。用户按文档操作实际拿到的是 main 检出或 Docker Hub 镜像，文档必须与之自洽。上游核对：本地 `C:\Users\pnoker\Code\github\iot-dc3`（main）+ Docker Hub API | 2026-10-11（取代 2026-09-19 的 release 基线） |
| 版本线叙事 | **最新发布 2026.10.10**（git tag 2026-10-17、镜像 2026-10-19 推送成功，`latest` 指向它，含 `-native` 变体；本版起 33/36 驱动加入 native 线，例外 dnp3/ble/opc-da 永久 JVM、opc-ua 暂未发布）；**仓库默认 `DC3_IMAGE_TAG=2026.9`**（.env.example 与 compose fallback 一致，2026.9.22 于 2026-09-23 发布）——两者开箱即用。历史事实：app 镜像线 2025.9.3 → 2026.9 跳变，从无 2026.5/2026.6。发版后按此模板更新，**不写"尚未发布"的猜测** | 2026-10-24 |
| 商业叙事 | 社区版免费（AGPL-3.0）+ 专业版按位号订阅 + 企业版商业授权，见 dc3.site/zh/pricing/。联系邮箱 **pnokers@icloud.com**（不用 gmail） | 2026-09-19 |
| 产品定位 | **Physical AI Runtime**：位于智能体意图与物理世界之间的执行层（看见/理解/决策/行动/追溯），与 dc3.site 一致 | 2026-09-19 |
| 鉴权口径 | 登录提交**明文密码**（服务端 Argon2 校验，盐不参与密码哈希、不参与 JWT HMAC 密钥）；`X-Auth-Token` 是 JSON `{"salt","token"}`（裸 token 401）；`X-Auth-Tenant` 传租户名（如 `default`）。全站 curl 示例统一用 `zh/guide/index.md` 与 `zh/development/api-documentation.md` 里的正确形态，`enableFlag` 一律写字符串 `"ENABLE"` | 2026-09-19（源码定论），2026-10-11 强化示例统一 |
| 启动顺序 | Auth → Manager → Data → Agentic → Gateway → Driver（驱动可与网关并行） | 2026-09-19 |
| compose 内置驱动 | docker-compose.yml 内置**全部 36** 个驱动容器（main 分支事实） | 2026-09-19 |
| 容器工具口径 | Makefile 的 `COMPOSE` **自动探测**：`docker compose` 可用则优先，其次 `podman compose`，兜底 `docker compose`；可用 `COMPOSE=podman compose` 显式指定。验证命令优先写 `make ps STACK=<stack>`（与实现无关） | 2026-10-11 |
| dc3-cli 基线 | dc3-cli 只存在于 main、快速演进 → **cli.md 跟随 main 当前源码**，CLI 改动后同期更新文档；命令面纳入 scan-facts 机械比对（见第 3 节） | 2026-10-11 |
| dc3-web 开发拓扑基线 | 前端 dev 端口/代理/环境变量近月多次调整 → frontend 文档以 `dc3-web/vite.config.ts` + `src/config/env/*` 当前状态为准，改前端构建配置后同期更新 | 2026-10-11 |
| 上游 release 分支残留 | origin/release 仍保留拆分前的旧文档站（`docs/` 228 文件，写"28 驱动"，已过期）。**以 docs.dc3.site 为准**；待下次动 release 分支时删除该目录（待办）。全站不得链接到 release 分支的 docs/ 路径 | 2026-10-11 |

## 2. 构建守卫（.vitepress/sidebar-check.mts）

`vitepress dev/build` 载入 config 时自动执行，违规即 fail：

| 守卫 | 防什么 |
|------|--------|
| `assertSidebarRegistersAllPages` | 孤儿页：zh/en 下每个 md 必须能从侧栏到达。**新增页面必须同时改 PILLARS（config.mts）+ locales/{zh,en}.json** |
| `assertHeadingParity` | zh/en 每对镜像页标题数必须相等——单语新增整节会被拦。改 zh 必查 en |
| `assertLocaleParity` | locales/zh.json 与 en.json 键集必须一致 |
| `assertMarkdownHygiene` | 断行切断的 `**粗体**`（渲染出裸星号）与单行 `::: info … :::` 容器（闭合必须独占一行） |
| `assertVersionAnchors` | 版本锚点漂移：以 `dc3/doc/CHANGE.md` 快照首个 `### 📌 <版本>` 为唯一事实源，校验 `public/versions.json` 的 `latest`（系列号口径，如 `2026.10`）与 zh/en guide/usage、zh/en community/security、MAINTAINING 里的"最新发布"声明都指向它。**发版流程：同步 CHANGE.md 快照 → 改 versions.json → 改上述页面的版本号**，任何一步漏掉即 build fail |
| `fix-diagram-anchors`（构建链内） | 图表索引深链锚点以 dist 实际渲染出的 id 为准回填（两遍构建），失靶即 build fail | 

图表组件的视觉与语义规范见 `.vitepress/theme/DIAGRAM_SPEC.md`——新增或修改图表前必读。

新增守卫的模式：在 sidebar-check.mts 加 `assertXxx()`，config.mts 的 assert 链里调用。写完必须做**负向测试**（注入一个缺陷确认 fail，再还原；禁用串类守卫要同时测中英文变体与近义措辞，防止字面量匹配被绕过）。

## 3. 事实扫描（scripts/scan-facts.mjs）

```bash
node scripts/scan-facts.mjs              # 扫描文档，输出漂移报告
node scripts/scan-facts.mjs --ci         # 有漂移时退出码 1（已接入 .github/workflows/docs.yml，build 前强制）
node scripts/scan-facts.mjs --upstream D:/path/iot-dc3   # 指定上游仓库（默认 ../iot-dc3）
```

三类检查：
1. **上游提取**：驱动目录数、`.env.example` 的 `DC3_IMAGE_TAG` 与 `DC3_MQ_*`/批量变量集、pom 版本、dc3-cli 顶层命令面——直接从上游 main 读，与本站口径比对（`DC3_IMAGE_TAG` 只拦"声称默认值"；命令前缀式覆盖 `DC3_IMAGE_TAG=x docker compose …` 是显式覆盖不算声称，豁免——native 栈文档依赖它）；
2. **禁用串（语义正则）**：历史事实错误的残留家族（哈希后密码/`hashed password`/`hash the password with the salt`、裸 `X-Auth-Token: <token>`、`"enableFlag": true`、`Gateway → Auth →`、`28 个驱动`/`28 drivers`/`28 built-in` 等；2026-10-24 增补：`28 协议驱动`/`28+ 协议驱动`/`+24 协议`、Agentic 两层注册与 `@Tool` 反射通道叙事（现口径：68 工具单一注册表）、`330+`/`347`（现口径 348，与构建期快照一致）、`AgenticToolMetadata` 已删除的注解）——**按语义家族匹配而非字面量**，中英文变体都要覆盖；
3. **扫描范围**：zh/、en/、根 index.md、README.md，以及 **`.vitepress/theme/components/*.vue`**（图表组件的 DICT 字符串会渲染成页面上 SVG 文字，2026-10-24 图表审计发现"28 协议驱动""10 @Tool"只存在于组件里，markdown 扫描看不见）。

上游发版或 main 大改后先跑它，再按第 5 节流程改文档。

## 4. 已归档：release 追平清单（2026-10-11 重定锚时整体应用于正文）

下列 main→release 差异曾按"release 基线"政策搁置；重定锚后**已全部落入正文**，此处仅存目备查：①调度开关 `enabled`→`enable`；②盐退出 JWT HMAC 密钥；③CI 拆分 ci-backend/ci-web/ci-cli；④R2DBC 取代 MyBatis-Plus；⑤时序保留 30 天 + 分层聚合 + `dc3_point_latest`；⑥`POINT_BATCH_SIZE` 等 9 变量；⑦tenant/profile 改 `@DeleteMapping`；⑧`GET /point_value/history`；⑨natural upsert 幂等字段；⑩facade 按目标多开关 `dc3.facade.{auth,manager,data}.mode`；⑪`ReactiveAgenticToolRegistry` 编程式工具注册；⑫`ReactiveOAuthMcpRuntimeServiceImpl`；⑬demo seed `iot-dc3-demo.sql` 引用已从 paths.md 移除（防复发：scan-facts 禁用串含该文件名）；⑭~~main 驱动目录 37~~ **系误数，实为 36**（曾把构建产物计入），全站维持 36；⑮`DC3_MQ_TYPE` + 4 个 `DC3_MQ_*` 连接变量、modules 页 dc3-mq 去"前瞻"标注。

**2026-09-22 之后 main 的用户可见变化（2026-10-11 已核实）**：单中心拓扑部署模式（网关单中心路由 profile）、`OperationController`（/operations 持久化异步操作）、网关 MCP Resource Server（`McpGatewayController`）、app compose 纳入 `dc3-web`、CLI 硬化（退出码 0/1/2/3、`--count`→`--limit`、`tools`/`analytics`/`session`/`action` 命令组）、dc3-web dev 端口拓扑调整（`APP_CLI_PORT=8081`）。相关页面已同步；后续新变化照第 5 节流程处理。

## 5. 日常改动流程

1. 改 zh → **必须同步 en**（守卫拦标题数，但内容级漂移守卫不拦——表格行数、默认值、命令要人工对齐）
2. `pnpm build` 过守卫 + 死链检查 + 图表锚点回填（两遍构建，第二遍以回填后的 index 为准）
3. 事实类改动跑 `node scripts/scan-facts.mjs`（CI 也会跑）
4. 新增页面：建 md（zh+en）→ PILLARS 注册 → locales/{zh,en}.json 加键 → build
5. **上游发版后**：跑 scan-facts → 更新版本线叙事（§1 模板）→ **运行 `bash scripts/sync-external.sh` 刷新 `dc3/doc/` 三份快照**（CHANGE/USAGE/DEPLOYMENT——此脚本不跑快照必过期，2026-10 审计曾发现 CHANGE.md 落后上游 5000 行）→ build
6. CLI 或 dc3-web 构建配置改动 → 同期更新 `zh/automation/cli.md` / `zh/frontend/index.md`（这两个面跟随 main，无版本缓冲）

## 6. 已知待补缺口（按读者价值排序）

1. 控制台手册余量——已有 6 篇；余量：模型提供方管理、仪表盘定制、字典/事件/指令定义、租户成员、本地凭据、API 端点注册
2. 数据中心业务域——Analytics（聚合分析）、EventHistory（事件历史查询）、MessageController（通知消息）无系统说明
3. docs-as-tested——quickstart/CLI 命令序列未做过真实执行验证（建议 WSL 干净环境走查）
4. zh/en 正文级语义比对仅覆盖关键页（代码块级 diff 已全量）；余量按分歧度排名补做
5. 36 个驱动页中 26 个仅名册级核对（属性表/默认值未逐项对码）
6. 上游 release 分支残留旧 docs/ 目录待删除（见 §1 末行）
