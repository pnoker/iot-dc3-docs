---
title: Agentic 中心：AI 辅助运营
---

<script setup>
import AgenticSequenceDiagram from '../../.vitepress/theme/components/AgenticSequenceDiagram.vue'
import AgenticErDiagram from '../../.vitepress/theme/components/AgenticErDiagram.vue'
</script>

# Agentic 中心：AI 辅助运营

智能中心（Agentic Center / `dc3-center-agentic`）把一个 OpenAI 兼容的大模型接到 IoT DC3
的设备、位号、数据与命令上：你用自然语言提问，模型按需调用平台内置工具去读元数据、查实时值，甚至在受控授权下触发设备读写。这页讲清这条链路怎么走、有哪些工具、会话存在哪、以及哪些动作需要人工确认。

> 你在这里：已经[接入设备](../operation/device-onboarding)、能[查数据下命令](../operation/data-commands)
> ，现在想让模型帮你运营。下一步可看 [AI Agent / MCP 集成](./mcp) 把外部 Agent 接进来。

## 为什么需要一个智能中心

设备接好、数据落库之后，日常运营往往是一连串"先查再判断"的小动作：哪台设备掉线了？这个位号最近一小时的值怎么走的？要不要把某个开关写回去？这些动作每一步都对应一个
HTTP 接口，但人工串起来既慢又容易出错。

智能中心把这层"理解意图 → 选对工具 → 取数 → 回答"交给大模型：它基于 Spring AI 的 `ChatClient`，对外暴露一个 OpenAI
兼容的聊天接口，对内挂着一组**租户隔离的内置工具**。模型在一次对话里自己决定调哪些工具、按什么顺序调，最后用自然语言把结论讲给你听。

AI 能力不是设备接入的前置条件。建议先跑通设备、位号、数据和命令链路，再启用智能中心——它消费的正是这些链路产生的数据和接口。

::: warning 工具调用默认开，但可关
内置工具调用由 `AGENTIC_TOOL_CALLING_ENABLED` 控制，默认 `true`。把它设为 `false`
，模型就退化成纯对话，不再触碰任何设备/数据接口。需要在受限环境里只放开问答时，关掉它。
:::

## OpenAI 兼容的聊天入口

智能中心对外只有一个核心入口，形态和 OpenAI 的 Chat Completions 一致，方便任何 OpenAI 客户端直接对接：

- 路径：经网关对外为 `POST /api/v3/agentic/chat/completions`（网关 `StripPrefix=2` 去掉 `/api/v3` 后，转发到智能中心的
  `/agentic/chat/completions`——服务 `spring.webflux.base-path=/agentic` 叠加控制器映射 `/chat/completions`，直连
  `:8600/chat/completions` 会 404）。
- 两种返回：`stream=true` 时走 **SSE** 流式逐字返回；否则返回一次性 **JSON**。
- 权限：`@PreAuthorize("@perm.can('chat', 'list')")`，调用方需带平台鉴权头 `X-Auth-Tenant` / `X-Auth-Login` /
  `X-Auth-Token`。
- 该接口自身的 AI 风险元数据标注为 `riskLevel=MEDIUM`、`destructive=false`、`idempotent=false`、`openWorld=true`。

下面是一次非流式问答的形态（示例值仅供示意，鉴权头需替换为你登录后拿到的真实 token）：

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v3/agentic/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Auth-Tenant: <tenant>" \
  -H "X-Auth-Login: <login>" \
  -H 'X-Auth-Token: {"salt":"<salt>","token":"<token>"}' \
  -d '{
        "model": "gpt-4o",
        "stream": false,
        "messages": [
          { "role": "user", "content": "1 号锅炉温度位号最近的值是多少？" }
        ]
      }'
```

```json [响应 JSON 形态（示例）]
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "1 号锅炉温度位号当前值为 86.4 ℃，采集于 2 分钟前。"
      },
      "finish_reason": "stop"
    }
  ]
}
```

:::

要拿到上面用到的鉴权 token，先 `POST /api/v3/auth/token/salt` 取盐、再 `POST /api/v3/auth/token/generate` 换 12 小时有效的
access token，详见[第一个设备：端到端](../quickstart/first-device)里的登录步骤。

## 一次 AI 辅助操作怎么走

模型不是凭空回答的——它在对话过程中调用内置工具去读真实数据。下图是一次"读 + 写"混合操作的时序：读类工具直接执行，写类（高风险）工具会先停下来等人工确认，再继续。

<AgenticSequenceDiagram lang="zh" />

关键链路上的事实锚点：

- 工具只有一个注册源：`ReactiveAgenticToolRegistry` 以编程式 `ToolDefinition`（name + description + inputSchema）注册
  全部 68 个工具（12 个工具类，实现返回 `Mono`，全程不阻塞事件循环）；`ChatClientConfig` 把注册表里的每个工具经
  `ReactiveAgenticToolCallback` 桥接成 `ToolCallbackProvider` 交给 ChatClient。2026.10 的注册路径收敛之后已无反射式
  `@Tool` 通道——OpenAI 兼容与 Anthropic 原生两条链路看到的是同一份工具面，不会漂移。
- 每个工具方法进来第一件事就是 `AgenticToolContextUtil.requireTenantId(toolContext)` 取出当前租户 ID，所有查询都带租户作用域——模型
  **看不到也碰不到别的租户**的数据。
- 写类动作（命令下发）由智能中心经 `PointCommandFacade`（gRPC 实现 `PointCommandGrpcFacade` / 本地
  `PointCommandLocalFacade`）下发到**数据中心**的命令平面，并非调用 HTTP `POST /point_command/write` 端点（那是数据中心面向
  Web/CLI 的另一调用面，终点命令平面相同）。命令本身有 10 秒 TTL（`PointCommandDTO.expireAt` 默认 `now+10s`），过期不再执行。

## 内置工具：单一注册表，68 个工具

平台给模型准备的工具面共 **12 个工具类、68 个工具**，全部在 `ReactiveAgenticToolRegistry` 一处注册。2026.10 的
注册路径收敛把早期的双通道结构合并成了一条：每个工具方法必须在注册表里登记，契约测试
逐个核对，两条模型链路之间的工具面不可能漂移。

12 个工具类按域覆盖：

工具方法主要用 `lookup*`（按 ID 取单条/批量）与 `search*`（分页查询）动词，辅以 `list*ByXxxId`（按归属枚举）与洞察类的
`get*` / `analytics*` / `page*`，并非 REST 层那套 `getXxx`/`listXxx`——这是工具给模型用的语义化命名，与对外
HTTP CRUD 约定相互独立。

先按域理解它们各自能干什么，再看表：模型拿到一个问题后，会把它拆成"先查模板有哪些位号 → 再查这些位号的最新值 →
最后判断要不要下命令"这样的工具序列，自动编排。

| 工具类              | 域   | 代表方法                                                                                          | 典型用途                 |
|------------------|-----|-----------------------------------------------------------------------------------------------|----------------------|
| `TenantTool`     | 租户  | `getCurrentTenantInfo()`                                                                      | 确认当前租户上下文            |
| `UserTool`       | 用户  | `getCurrentUserProfile()`                                                                     | 查当前用户信息              |
| `SystemTool`     | 系统  | `getSystemHealth()` / `getDeviceStatuses()` / `getDriverStatuses()`                           | 看平台健康度、设备/驱动在线态      |
| `DeviceTool`     | 设备  | `lookupDeviceById()` / `searchDevices()` / `getDeviceLatestPointValues()`                     | 查某台设备、按条件检索、设备最新值快照 |
| `DriverTool`     | 驱动  | `lookupDriverById()` / `searchDrivers()`                                                      | 查协议驱动接入情况            |
| `ProfileTool`    | 模板  | `lookupProfileById()` / `searchProfiles()` / `listProfilesByDeviceId()`                       | 查模板及其能力、按设备列模板       |
| `PointTool`      | 位号  | `lookupPointById()` / `searchPoints()` / `listPointsByDevice()`                               | 查位号、读写方向、按设备/模板列位号   |
| `PointValueTool` | 位号值 | `getLatestPointValue()` / `getPointValueHistory()` / `readPointValue()` / `writePointValue()` | 读实时值、查历史曲线、下发读/写命令   |
| `CommandTool`    | 命令  | `lookupCommandById()` / `searchCommands()` / `listCommandsByDeviceId()`                      | 查自定义命令、按设备/模板列命令     |
| `EventTool`      | 事件  | `lookupEventById()` / `searchEvents()` / `listEventsByDeviceId()`                            | 查设备上报事件              |
| `InsightTool`    | 洞察  | `getAlertStats()` / `getTodayStats()` / `analyticsQueryHistory()`（共 25 个）                    | 告警统计、看板指标、聚合分析、命令状态  |
| `HistoryTool`    | 历史  | `searchCommandHistories()` / `searchEventHistories()`                                        | 查命令/事件执行记录           |

::: info 风险元数据标在 REST 端点上，不在工具方法上
`x-dc3-ai` 风险元数据（`riskLevel` / `destructive` / `idempotent` / `openWorld`）是在 Controller 的 `@Operation` 扩展里**手工标注**的（如 `ChatController` 的聊天端点），供 OpenAPI / MCP 目录消费。智能中心的工具方法不带风险等级：注册表里的 `ToolDefinition` 只有 name / description / inputSchema 三个字段——别把端点上的风险元数据当成每个工具方法的属性。
:::

## 会话不是内存里的，而是落库的

很多 AI 服务把会话上下文放在内存里，进程一重启就丢。智能中心不是——它把每一轮对话**持久化在 `dc3_agentic` schema** 里，
`ReactiveMessageStore.loadHistory` 按 `conversation_id` 从 `dc3_message` 读回最近 `historyWindowSize` 条消息。会话因此能跨重启续上，也能被审计。

三张表的关系如下：

<AgenticErDiagram lang="zh" />

- 取回历史的窗口大小由 `dc3.agentic.historyWindowSize`（默认 `30`）控制：只把最近 30 条消息（user/assistant 各占一条，约合 15 轮对话）喂给模型，既省 token 又保留上下文。
- `dc3_session.session_ext` 是一段 JSON，存这次会话的模型选择、温度、`maxTokens` 等偏好，下一轮沿用。
- 附件上传后落到 `AGENTIC_ATTACHMENT_STORAGE_PATH` 指向的目录，元数据记在 `dc3_attachment`。

::: warning 记忆表结构默认不自动建
持久化会话依赖数据库表，`AGENTIC_MEMORY_SCHEMA_INIT` 经 compose / `dev.env` 注入，默认是 `never`。其语义是不自动初始化
Spring AI 的记忆表结构；如需自动建表，预期做法是首次临时设为 `always`（或 `create_if_not_exists`）建一次表，之后调回 `never`
。注意：仓库内当前未见 `application*.yml` 把该变量绑定到 Spring AI 的 `initialize-schema`，是否真正接线**以代码为准**
，必要时手工初始化记忆表更稳妥。
:::

## 高风险动作的两阶段确认

不是所有工具调用都该让模型一气呵成。读类工具（`lookup*` / `search*` / `getLatest*`）安全、可直接执行；写类一旦做错就难以回退。智能中心唯一的写工具
`PointValueTool.writePointValue` **从不直接写**，而是走两阶段确认：

1. 模型调用 `writePointValue` 时，服务调用 `ActionService.createWritePointValueAction(...)` 生成一个待确认 **Action**（
   `actionId` 为 UUID），状态置为 `AgenticActionStatusEnum.PENDING`，过期时间为 `now + 10 分钟`；工具结果带
   `pendingConfirmation=true` 与该 `actionId`，并不下发命令。
2. 用户看清动作内容后，携带 `action_id` 调 `POST /api/v3/agentic/action/confirm` 确认（或 `POST /api/v3/agentic/action/reject`
   拒绝；`action_id` 是 query 参数）；确认通过后服务才经
   `PointCommandFacade.submitWrite(...)` 真正执行。

这条机制保证"AI 提议、人来拍板"，把不可逆的物理世界动作留在人工授权之内。

::: info 这是 Agentic 自己的 Action 机制，不是 MCP 网关的风险门控
确认流用的是 `actionId` + `POST /api/v3/agentic/action/confirm|reject`，**不是** `CONFIRM_REQUIRED` / `confirmId`，也不是按
`riskLevel=HIGH` 的通用风险策略门控——后者属于 [MCP 网关](./mcp)的 `dc3_mcp_tool_confirmation` 子系统，与这里的聊天链路是两套实现，别混用。
:::

::: danger 命令写失败不回显伪造值
经工具下发的写命令最终走数据中心命令平面。命令带 10 秒 TTL（`PointCommandDTO.expireAt` 默认 `now+10s`），且**写命令失败时 `responseValue` 为 `null`、不回显任何值**——不要把"没报错"当成"写成功"
。详见[命令平面](../architecture/command-plane)。
:::

## 模型从哪来：数据库优先，env 兜底

智能中心支持多个模型提供方。`ChatClientFactory` 优先从数据库表 **`dc3_model_provider`** 读取启用的提供方配置（
`provider_type`：`0` openai-compatible / `1` anthropic、`base_url`、`api_key`、`default_flag`
等，按租户隔离）；只有当表里没有可用提供方时，才回退到一组环境变量兜底配置。

也就是说：生产环境推荐在数据库里集中管理 provider；env 里的 `AGENTIC_FALLBACK_*` 只是没有 DB 配置时的最后防线。

| 变量                                    | 默认值                            | 用途                                                |
|---------------------------------------|--------------------------------|---------------------------------------------------|
| `AGENTIC_FALLBACK_OPENAI_BASE_URL`    | `https://api.openai.com`       | 兜底的 OpenAI 兼容 API 地址                              |
| `AGENTIC_FALLBACK_OPENAI_API_KEY`     | *(空)*                          | 兜底 API key（端点需要鉴权时）                               |
| `AGENTIC_FALLBACK_OPENAI_MODEL`       | `gpt-4o`                       | 兜底模型名                                             |
| `AGENTIC_FALLBACK_OPENAI_TEMPERATURE` | `0.7`                          | 采样温度（0.0–2.0）                                     |
| `AGENTIC_FALLBACK_OPENAI_MAX_TOKENS`  | `2048`                         | 最大输出 token                                        |
| `AGENTIC_TOOL_CALLING_ENABLED`        | `true`                         | 是否启用工具调用                                          |
| `AGENTIC_MEMORY_ENABLED`              | `true`                         | 是否启用持久化会话记忆                                       |
| `AGENTIC_MEMORY_MAX_MESSAGES`         | `50`                           | 单会话窗口最大消息数                                        |
| `AGENTIC_MEMORY_SCHEMA_INIT`          | `never`                        | 记忆表结构初始化（`always`/`never`/`create_if_not_exists`） |
| `AGENTIC_ATTACHMENT_STORAGE_PATH`     | `dc3/data/agentic/attachments` | 附件存储目录                                            |

::: tip 默认值以 compose / `dev.env` 为准
上表默认值取自 compose / `dev.env` 注入值，与 `AgenticProperties` 的 Spring 裸默认值**不完全一致**：`AGENTIC_MEMORY_ENABLED`
的 Spring 默认与 compose 注入一致（都是 `true`），但 `AGENTIC_ATTACHMENT_STORAGE_PATH` 的 Spring 默认是
`dc3/data/upload/agentic/attachment`（compose 注入 `dc3/data/agentic/attachments`）。经 compose / `make up-*` 启动时以上表为准；若在
IDE 里直接跑 Spring 而不经过 compose，则用的是 Spring 裸默认值。
:::

完整环境变量说明见 [环境变量](../quickstart/environment)。

::: danger 永远不要泄露 API key
不在文档、截图、日志、issue 或提交里出现真实 `api_key` / `token` / `password`。`dc3_model_provider.api_key`
存在数据库内，访问受租户隔离约束；env 兜底的 key 也只应通过 `dc3/env/dev.env` 等本地文件注入，不入库到代码仓库。
:::

## 生产安全清单

智能中心手里握着第三方模型的 API key，还会按用户的意图去调外部接口。上生产之前，把这一节过一遍。

### API key 怎么加密存

`dc3_model_provider.api_key` 不以明文落库，写入前先用 AES-256-GCM 加密。加密用的主密钥按顺序取：

1. 配置项 `dc3.agentic.security-master-key`；
2. 环境变量 `DC3_AGENTIC_MASTER_KEY`；
3. 都没设时，从平台安全密钥 `DC3_SECURITY_KEY` 经 HKDF-SHA256 派生一个。派生只适合本地跑，日志里会有告警。

主密钥是 Base64 的 256 位（32 字节）值，格式或长度不对，服务起不来。生成一个：`openssl rand -base64 32`。换主密钥后旧密文解不开，轮换前把各 provider 的 API key 准备好重新录入。

::: danger 生产环境单独设一把主密钥
不设 `DC3_AGENTIC_MASTER_KEY`，加密密钥就从 `DC3_SECURITY_KEY` 派生（带告警日志）。能用是能用，但两把锁串在了一起：平台密钥泄露，provider 的 key 跟着遭殃。生产给 agentic 单独设一把。
:::

### 出口管控

provider 的 `base_url` 在保存和调用前都要过 `AgenticBaseUrlValidator`：

- 必须 HTTPS（`dc3.agentic.security-base-url-https-only`，默认开，关掉只该出现在测试里）；
- 主机必须解析到公网地址。回环、链路本地、站点本地（`10/8`、`172.16/12`、`192.168/16`）、IPv6 唯一本地、组播，一律拒绝，没有白名单。内网的模型网关（Ollama、vLLM 这类）要经公网域名暴露出来才能配进来；
- DNS 解析判定缓存约 30 秒；连通性检查按解析期固定下的地址（DNS pinning）去探测，探测窗口内解析结果换了也不受影响。

改 provider 的 `base_url` 必须同时提交新的 API key，留空只在 `base_url` 没动时才沿用旧密文。这条挡的是把 A 家的 key 发到 B 家去。

### 限流与兜底

| 变量                                                | 默认  | 语义                                                    |
|---------------------------------------------------|-----|-------------------------------------------------------|
| `AGENTIC_TRANSPORT_ACQUIRE_TIMEOUT_SECONDS`        | `30`  | 等待模型并发槽位的秒数，超时按 UNAVAILABLE 报错而非无限排队          |
| `AGENTIC_TRANSPORT_GLOBAL_MAX_CONCURRENT_REQUESTS` | `16`  | 全局在途模型请求上限（兜底模型与未缓存配置走这条信号量）            |
| `AGENTIC_TRANSPORT_PER_TENANT_QPS`                 | `0`   | 每租户每秒聊天请求数，`0` 关闭                                |
| `AGENTIC_TRANSPORT_CACHE_TTL_SECONDS`              | `300` | provider / 模型 / 客户端进程内缓存 TTL，多副本部署下界定期外修改的陈旧窗口 |
| `AGENTIC_TRANSPORT_FALLBACK_ENABLED`               | `false` | 平台级兜底模型开关                                          |

::: warning 生产保持 `AGENTIC_TRANSPORT_FALLBACK_ENABLED=false`
开着兜底，没配模型的租户会悄悄共用同一个上游 provider，用量算不到哪个租户头上；关着，这些租户拿到的是明确报错。默认就是 `false`，别动。
:::

### 附件与可观测性

附件上传先查扩展名白名单（`AGENTIC_ATTACHMENT_ALLOWED_EXTENSIONS`，默认 `png,jpg,jpeg,gif,webp,csv,txt,json,md,pdf`），过了才落盘。租户配额三件套：条数（`AGENTIC_ATTACHMENT_TENANT_MAX_COUNT`，默认 `2000`）、总字节（`AGENTIC_ATTACHMENT_TENANT_MAX_BYTES`，默认 1 GiB）、文件名长度（`AGENTIC_ATTACHMENT_NAME_MAX_LENGTH`，默认 `128` 字符），超限报错时会把租户当前用量一起带上。

模型侧的 token 用量随请求链路透传回调用方，每个工具的调用次数和耗时以 `agentic.tool.calls` / `agentic.tool.duration` 指标暴露。所有端点都挂 `@PreAuthorize("@perm.can(...)")`，权限码种子在 `dc3-center-agentic:*` 名下，chat / session / message / attachment / action / model / provider 共 21 个。

## 使用前检查

启用智能中心前，确认这些前置条件，避免"模型答得头头是道但数据是错的"：

1. 智能中心已启动并可经网关 `8000` 端口访问。
2. 鉴权中心、管理中心、数据中心基础能力正常——工具最终调的是它们的接口。
3. 至少有一个设备和位号在产生数据，否则查值类工具返回空。
4. 模型提供方（DB 或 env 兜底）可访问，且 API key 未写入文档或日志。
5. 工具调用只对可信用户、明确的业务场景开放；不需要时用 `AGENTIC_TOOL_CALLING_ENABLED=false` 关闭。
6. 要上生产，先把上面的安全清单过一遍：主密钥、HTTPS 公网 provider、限流和兜底开关。

## 延伸阅读

- [AI Agent / MCP 集成](./mcp) — 把外部 AI Agent 经 OAuth 2.1 + MCP 安全接入平台工具
- [核心概念](../introduction/concepts) — 驱动 / 模板 / 设备 / 位号 / 位号值的对象模型，看懂工具在查什么
- [命令平面](../architecture/command-plane) — 工具下发的读写命令如何流转、为何写失败不回显
