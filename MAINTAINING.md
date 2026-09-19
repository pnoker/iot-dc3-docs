# 维护手册（MAINTAINING）

本文件写给 iot-dc3-docs 的维护者（含 AI 协作者），记录这套文档的**口径决策、构建守卫与版本线追平清单**。改文档前先读这里，可以避免重新踩一遍已经裁决过的坑。

## 1. 口径决策（已拍板，勿反复）

| 主题 | 口径 | 决策时间 |
|------|------|---------|
| 驱动数量 | **全站统一 36**（官方叙事，与驱动总览 36 行表、dc3.site 定价页一致）。上游 release 分支/2026.5 镜像实际只含 28 个，8 个新驱动（dlt645/dnp3/iec61850/kafka/knx/lorawan/mbus/redis）随下一版本线发布——**不在文档里写 28** | 2026-09-19 |
| 文档基线 | 事实性描述锁定 **release 分支**（2026.5.x 线）。main 分支的超前变化只进"第 4 节追平清单"，不提前改文档 | 2026-09-19 |
| 商业叙事 | 社区版免费（AGPL-3.0）+ 专业版按位号订阅 + 企业版商业授权，见 dc3.site/zh/pricing/。联系邮箱 **pnokers@icloud.com**（不用 gmail） | 2026-09-19 |
| 产品定位 | **Physical AI Runtime**：位于智能体意图与物理世界之间的执行层（看见/理解/决策/行动/追溯），与 dc3.site 一致 | 2026-09-19 |
| 镜像 tag | `DC3_IMAGE_TAG` 默认 `2026.6` 尚未发布到 Docker Hub（当前线 tag `2026.5`）——guide/usage.md 已有警告框，2026.6 发布后删除该框 | 2026-09-19 |
| 鉴权口径 | 登录提交**明文密码**（服务端 Argon2 校验，盐不参与密码哈希）；`X-Auth-Token` 是 JSON `{"salt","token"}`（裸 token 401）；`X-Auth-Tenant` 传租户名（如 `default`） | 2026-09-19（源码定论） |
| 启动顺序 | Auth → Manager → Data → Agentic → Gateway → Driver（驱动可与网关并行） | 2026-09-19 |
| compose 内置驱动 | docker-compose.yml 内置**全部 36** 个驱动容器（main 分支事实；release 只内置 8 个，属版本线差异不展开写） | 2026-09-19 |

## 2. 构建守卫（.vitepress/sidebar-check.mts）

`vitepress dev/build` 载入 config 时自动执行，违规即 fail：

| 守卫 | 防什么 |
|------|--------|
| `assertSidebarRegistersAllPages` | 孤儿页：zh/en 下每个 md 必须能从侧栏到达。**新增页面必须同时改 PILLARS（config.mts）+ locales/{zh,en}.json** |
| `assertHeadingParity` | zh/en 每对镜像页标题数必须相等——单语新增整节会被拦。改 zh 必查 en |
| `assertLocaleParity` | locales/zh.json 与 en.json 键集必须一致 |
| `assertMarkdownHygiene` | 断行切断的 `**粗体**`（渲染出裸星号）与单行 `::: info … :::` 容器（闭合必须独占一行） |

新增守卫的模式：在 sidebar-check.mts 加 `assertXxx()`，config.mts 的 assert 链里调用。写完必须做**负向测试**（注入一个缺陷确认 fail，再还原）。

## 3. 事实扫描（scripts/scan-facts.mjs）

```bash
node scripts/scan-facts.mjs              # 扫描文档，输出漂移报告
node scripts/scan-facts.mjs --ci         # 有漂移时退出码 1（可挂 CI）
node scripts/scan-facts.mjs --upstream D:/path/iot-dc3   # 指定上游仓库（默认 ../iot-dc3）
```

两类检查：
1. **上游提取**：驱动目录数、`.env.example` 的 `DC3_IMAGE_TAG`、pom 版本——直接从上游源码读，与本站口径比对；
2. **禁用串**：历史上出现过的事实错误残留（`<hashed>`、`PASSWORD_HASH`、裸 `X-Auth-Token: <token>'`、`Gateway → Auth →`、` 22 个驱动`、` 28 个驱动` 等）。

上游发版后先跑它，再照第 4 节清单改文档。

## 4. release 追平清单（main → release 时逐项执行）

以下变化已在 main 分支落地，release 追平后需要同步文档（核对方法：`git log origin/release..origin/main` 或跑 scan-facts）：

1. 调度开关属性名 `enabled` → `enable`（commit dc2164f46）——driver-authoring.md 的 YAML 示例与 warning 框整体反转
2. 盐不再参与 JWT HMAC 签名密钥（`KeyUtil.generateToken` 不再收 salt）——api-documentation.md、auth-rbac.md 的"盐与 DC3_SECURITY_KEY 拼接"段改写
3. CI 工作流拆分 ci-backend/ci-web/ci-cli，分支列表改为 [develop, main]——testing.md 的 CI 表
4. R2DBC 全面替代 MyBatis-Plus——introduction/index.md 技术栈、tenant.md 的 `MybatisPlusConfig` 句
5. 时序保留策略 180 天 → 30 天 + 1min（1 年）/1h（永久）分层聚合 + `dc3_point_latest` 投影表——point-value.md、data-plane.md、foundations/data-pipeline.md
6. 位号批处理变量 `POINT_BATCH_SPEED/INTERVAL` → 9 个新变量（`POINT_BATCH_SIZE` 等）——environment.md、data-plane.md
7. `POST /tenant/delete`、`POST /profile/delete` → `@DeleteMapping`——concepts/tenant.md、concepts/profile.md
8. `GET /point_value/list_history_by_device_id_and_point_id` → `GET /point_value/history`——point-value.md
9. append-only → natural upsert（幂等字段 messageId/schemaVersion/driverNode/sequence/fencingToken）——point-value.md 字段表
10. facade 单开关 `DC3_FACADE_MODE` → 按目标多开关 `dc3.facade.{auth,manager,data}.mode`——facade-modes.md、edge-cloud.md
11. Agentic 工具注册从 `@Tool`×40 → `ReactiveAgenticToolRegistry`（25 个编程式 ToolDefinition + 3 个 `@Tool`）——ai/agentic.md、ai/index.md、spring-ai-deep-dive.md
12. `OAuthMcpRuntimeServiceImpl` → `ReactiveOAuthMcpRuntimeServiceImpl`——ai/mcp.md
13. demo seed `iot-dc3-demo.sql` 已删除——paths.md 若引用需移除（已处理，防复发）
14. main 驱动目录已达 37（多了 1 个待确认新模块）——发布时驱动总览表、模块清单、全站 36 口径统一 +1
15. env 新增 `DC3_MQ_TYPE` + 6 个 `DC3_MQ_*`（可插拔消息中间件）、R2DBC 迁移契约 3 个、Jaeger 2 个——environment.md 补表；模块清单 dc3-mq 组去掉"前瞻"标注

## 5. 日常改动流程

1. 改 zh → **必须同步 en**（守卫拦标题数，但内容级漂移守卫不拦——表格行数、默认值要人工对齐）
2. `pnpm build` 过四道守卫 + 死链检查
3. 事实类改动跑 `node scripts/scan-facts.mjs`
4. 新增页面：建 md（zh+en）→ PILLARS 注册 → locales/{zh,en}.json 加键 → build
5. 涉及上游事实且拿不准的，对照 `C:\Users\pnoker\Code\github\iot-dc3`（main）与 `origin/release` 双分支核实，**release 优先**

## 6. 已知待补缺口（按读者价值排序）

1. 控制台手册——前端 40+ 设置页面，已有 设备/位号模板/用户租户 三篇（operation/console-*）；下一批：告警视图（settings/alarm）、MCP 连接与审计、分组/标签
2. ~~MQ 全景拓扑页~~ 已完成（architecture/mq-topology，2026-09-20）
3. 身份与租户运营（auth 中心 17 个 controller）
4. 数据中心 6 个业务域（Analytics/Dashboard 确认/事件历史/通知消息等）
5. Manager 侧 Group/Label/Topic（MQTT 主题管理）
6. 8 个紧凑型驱动页（58-68 行）升级到展开型模板（135-192 行）
