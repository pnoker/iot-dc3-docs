---
title: API 文档
---

<script setup>
import ApiDocFlowDiagram from '../../.vitepress/theme/components/ApiDocFlowDiagram.vue'
import ApiDocSequenceDiagram from '../../.vitepress/theme/components/ApiDocSequenceDiagram.vue'
</script>

# API 文档

IoT DC3 的 REST 接口文档由代码注解自动生成，每个中心服务各自暴露一份在线文档。读完这页，你能在开发环境打开各中心的在线文档、用默认凭据走完"取盐 → 取 token → 带鉴权头调用"的登录流、看懂
CRUD 路径约定与错误响应的 R 码目录，并理解每个接口上的 `x-dc3-ai` 风险元数据是怎么喂给 AI/MCP 工具的。

> 你在这里：准备调用或调试后端接口。要先把环境跑起来，看 [第一个设备](../quickstart/first-device)
> ；要理解鉴权头背后的租户与权限，看 [鉴权·租户·RBAC](../architecture/auth-rbac)。

## 文档从哪来：注解生成，按中心自持

平台不维护任何手写的 API 规格文件。每个接口的标题、参数、请求/响应模型，全部来自 Controller 上的 `springdoc-openapi` 注解（
`@Tag`、`@Operation`、`@Parameter`、`@Schema`），运行时由各中心服务在 WebFlux 栈上生成自己的 OpenAPI JSON。

四个业务中心——鉴权中心（Auth Center / `dc3-center-auth`）、管理中心（Manager Center / `dc3-center-manager`）、数据中心（Data
Center / `dc3-center-data`）、智能中心（Agentic Center / `dc3-center-agentic`）——各自暴露一份文档。网关（Gateway /
`dc3-gateway`）本身没有业务 Controller；它的配置里仍保留一个指向 `/v3/api-docs/{svc}` 的服务下拉选择器，但对应的网关聚合路由已被移除，该入口当前不可用（见下文警告）。

<ApiDocFlowDiagram lang="zh" />

分组靠两层配置完成：`dc3-common-web` 的 `SpringDocConfig` 提供全局元信息（标题、版本、联系人、许可证、安全方案），各业务模块在自己已扫描的包下声明
`GroupedOpenApi` Bean，只扫描本模块 Controller。各中心服务的 `spring.webflux.base-path`（如 `/auth`、`/manager`）会加到文档路径前，例如
`/auth/v3/api-docs`；访问文档时必须带上这层 base-path 直连各中心——网关不再提供抹平差异的聚合路径。

::: info dc3-center-single 模式
`dc3-center-single` 把多个业务模块打进一个进程，所以它的 Swagger UI 里会同时出现多个分组——这是预期行为，不是配置重复。
:::

## 访问入口

开发环境下直连各中心的 Swagger UI（记得带 base-path 前缀）；导出或调试契约时同样走各中心的 `/{svc}/v3/api-docs`。

| 目标               | URL                                             |
|------------------|-------------------------------------------------|
| 鉴权中心直连（推荐）       | `http://<auth>:8300/auth/swagger-ui.html`       |
| 管理中心直连（推荐）       | `http://<manager>:8400/manager/swagger-ui.html` |
| 数据中心直连（推荐）       | `http://<data>:8500/data/swagger-ui.html`       |
| 智能中心直连（推荐）       | `http://<agentic>:8600/agentic/swagger-ui.html` |
| 单中心 OpenAPI JSON | `http://<center>:<port>/<svc>/v3/api-docs`      |

::: warning 网关聚合入口当前不可用
`dc3-gateway` 的 `application.yml` 仍配置着指向 `/v3/api-docs/{svc}` 的聚合 Swagger UI（`http://<gateway>:8000/swagger-ui.html`），但
`dc3-common/dc3-common-gateway` 的 `application-gateway.yml` 里对应的聚合代理路由已被移除（现存路由只有 OAuth 与 `/api/v3/**` 业务路由）。打开该 UI 后，服务下拉框的每一项都会报
"Failed to load API definition"。在聚合路由恢复之前，请一律直连各中心。
:::

## 登录与鉴权：取盐 → 取 token → 带 X-Auth-* 头

除 `/api/v3/auth/token/**`（取盐、生成 token、改密）这类公开端点外，网关后的所有业务接口都要求携带三个鉴权头：`X-Auth-Tenant`、
`X-Auth-Login`、`X-Auth-Token`。登录本身是一个两步握手：先用用户名+租户向服务端要一枚随机盐（建议 5 分钟内使用，服务端不强制过期），再把
**明文密码**连同这枚盐一起提交换取 token（12 小时有效）。盐不参与密码哈希，也不参与 JWT 签名——token 的 HMAC-SHA256
签名密钥只由服务端密钥 `DC3_SECURITY_KEY`（环境变量，回退 `dc3.security.key` 系统属性）派生，盐只是登录握手中要求回传的一次性随机串；密码本身以明文提交（依赖
HTTPS 保护传输），由后端 `PasswordUtil.verify` 用 Argon2id（不可用时回退 BCrypt）校验。

<ApiDocSequenceDiagram lang="zh" />

实际调用形如下面这样（示例值仅作演示，`default`/`dc3` 是种子数据自带的默认租户与用户）：

::: code-group

```bash [curl]
# 1. 取盐
curl -X POST http://localhost:8000/api/v3/auth/token/salt \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3"}'
# → 2026.10 镜像线（及 main）返回 JSON 对象 {"salt":"f3a9c1..."}（无 R 封装）；2026.9 及更早镜像线返回 text/plain 裸盐字符串。建议 5 分钟内使用

# 2. 连同 salt 一起提交明文密码（依赖 HTTPS 保护传输）换 token
curl -X POST http://localhost:8000/api/v3/auth/token/generate \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3","salt":"f3a9c1...","password":"<明文密码>"}'
# → 2026.10 镜像线（及 main）返回 JSON 对象 {"token":"eyJ..."}（无 R 封装）；2026.9 及更早镜像线返回 text/plain 裸 token。两者都下发 httpOnly Cookie，12 小时有效

# 3. 带鉴权头调用业务接口
curl -X POST http://localhost:8000/api/v3/manager/device/list \
  -H 'X-Auth-Tenant: default' \
  -H 'X-Auth-Login: dc3' \
  -H 'X-Auth-Token: {"salt":"f3a9c1...","token":"eyJ..."}' \
  -H 'Content-Type: application/json' \
  -d '{"offset":0,"limit":10}'
```

```bash [dc3 CLI]
# CLI 封装了取盐→换 token→保存凭据的全过程
dc3 config set gateway http://localhost:8000
dc3 auth login --tenant default --username dc3
```

:::

在 Swagger UI 里调试受保护接口时，点右上角 **Authorize**，按下表填入鉴权头即可：

| Header          | 示例值                            |
|-----------------|--------------------------------|
| `X-Auth-Tenant` | `default`                      |
| `X-Auth-Login`  | `dc3`                          |
| `X-Auth-Token`  | `{"salt":"...","token":"..."}` |

::: danger 不要把真实凭据写进文档/日志/issue
token、password、salt、api key 一律不入库到文档、提交记录或工单。示例里的哈希值、token 都用占位符代替。
:::

## 另一条认证路：网关 OAuth RS256（默认关）

`X-Auth-*` 三件套之外，网关还能接受第二种凭据：`Authorization: Bearer <JWT>`（RS256 签名，经 JWKS 验签）。它由 `DC3_GATEWAY_OAUTH_ENABLED` 控制，**默认关闭**，开了之后两种凭据并存：

- 请求带 `Authorization: Bearer …` 且开关开启 → 网关验 JWT（校验签发者/受众，JWKS 缓存 5 分钟，遇到未知 `kid` 立即刷新一次），验过的主体注入 `X-Auth-Principal` 下发；
- 没有 Bearer（或开关没开）→ 走上面经典的 `X-Auth-*` 链路；
- 两种都没有 → 401（problem+json）。

JWT 由鉴权中心那套 OAuth2 授权服务器签发——就是为 [MCP](../ai/mcp) 建的那套：`/.well-known/oauth-authorization-server`、`/oauth2/jwks`、`/oauth2/register`（动态注册）、`/oauth2/authorize`（OAuth 2.1 + PKCE）、`/oauth2/token`、`/oauth2/revoke`，经网关都在 `/api/v3/auth/` 前缀下。支持的授权方式：`authorization_code`、`client_credentials`、`refresh_token`。访问令牌 15 分钟（携带 `mcp:tools:call` 类 scope）或 1 小时（只读 scope），刷新令牌 30 天；授予的 scope 以主体 RBAC 绑定为上限。

机器对机器调用最省事的是 client_credentials，CLI 直接支持：

```bash
dc3 auth login --oauth --client-id <id> --client-secret <secret>
# 之后的请求自动带 Authorization: Bearer
```

网关配置项（`dc3.gateway.oauth.*`）：`enabled`、`jwks-url`、`issuer`、`audience`（默认 `dc3-mcp`）、`jwks-cache-ttl`。对应环境变量 `DC3_GATEWAY_OAUTH_ENABLED` / `DC3_GATEWAY_OAUTH_JWKS_URL`（见[环境变量](../quickstart/environment)）。无论走哪种凭据，下游各中心的 `@PreAuthorize` 权限校验都照常生效。

## CRUD 路径约定：动词反映结果基数

所有业务接口的命名遵循同一条规则——HTTP 路径、Java 方法、gRPC RPC、前端函数上的动词，必须反映**返回结果的基数**。读单条用
`getXxx`，读集合用 `listXxx`，写入三件套是 `add`/`update`/`delete`。这让你看到路径就能判断它返回一条还是一批、是读还是写。

| 动作   | Java 方法        | HTTP 路径     | gRPC RPC  | 前端函数             |
|------|----------------|-------------|-----------|------------------|
| 单条记录 | `getXxx(...)`  | `/get_xxx`  | `GetXxx`  | `getXxx(...)`    |
| 集合   | `listXxx(...)` | `/list_xxx` | `ListXxx` | `listXxx(...)`   |
| 新增   | `add(BO)`      | `/add`      | n/a       | `addXxx(...)`    |
| 更新   | `update(BO)`   | `/update`   | n/a       | `updateXxx(...)` |
| 删除   | `delete(Long)` | `/delete`   | n/a       | `deleteXxx(...)` |

::: tip 保留动词的专用语义
`select*` 一族在代码库中并不存在——`dc3-db-*` 存储层（`R2dbc*Store`）的原生存取同样用 `get`/`list`/`insert`/`update`/`delete` 动词，Service/Controller/Facade 上也不会出现 `select*`。业务删除一律用
`delete*`。`find*`/`query*`/`fetch*` 不作为主 CRUD 动词。
:::

举一个走管理中心的真实例子（黄金路径中"新增设备"一步）：接口是 `POST /api/v3/manager/device/add`，请求体是 `DeviceVO`，关键字段
`deviceName`、`driverId`、`profileId`、`enableFlag`（字符串 `"ENABLE"`），成功返回 `201 Created` 与新建实体的 `DeviceVO`（含 id）；对应的删除接口
`DELETE /api/v3/manager/device/delete` 需要同时传 `id` 与乐观锁 `version` 两个查询参数。需要 `device:add`
权限（`@PreAuthorize("@perm.can('device', 'add')")`）。接口直接返回业务对象或分页对象，没有统一信封；分页接口（如 `device/list`）的请求体是**扁平的**
`offset`/`limit`（零基 offset，默认 `offset=0`、`limit=50`，上限 200），响应是 `OffsetPage`（`items`/`offset`/`limit`/`total`/`hasNext`）。注意：写成嵌套的
`page` 对象会被静默忽略——全局 `fail-on-unknown-properties=false` 不报错，但分页落在默认值上。错误响应统一为 RFC 9457 problem
details（`application/problem+json`）。

## 错误响应：RFC 9457 与 R 码目录

业务错误统一是 `application/problem+json`，字段固定八个：`type`（恒为 `about:blank`）、`title`、`status`、`code`（`R###` 字符串）、`detail`、`instance`、`traceId`（关联服务日志）、`errors`（校验失败时的逐字段信息）。一个 422 的样子：

```json
{
  "type": "about:blank",
  "title": "validation",
  "status": 422,
  "code": "R422",
  "detail": "deviceName must not be blank",
  "instance": "/api/v3/manager/device/add",
  "traceId": "a1b2c3d4",
  "errors": {"deviceName": "must not be blank"}
}
```

`code` 与 HTTP 状态一一对应，目录如下：

| code | HTTP | 触发场景 |
|------|------|---------|
| `R401` | 401 | 未认证、token 无效、来源 IP 不合法 |
| `R403` | 403 | 权限不足（RBAC 拒绝） |
| `R4031` / `R4032` | 403 | 首次登录需改密 / 密码已过期 |
| `R404` | 404 | 目标不存在（或跨租户不可见——不区分"不存在"与"无权看"） |
| `R4090` / `R4091` | 409 | 已存在（唯一键冲突）/ 状态冲突（如乐观锁 version 不符） |
| `R422` | 422 | 参数校验失败、超出取值范围 |
| `R500` | 500 | 其余一切未分类失败 |

参数绑定/校验失败（`BindException`、`MethodArgumentNotValidException`）固定 422 并带 `errors` 逐字段明细；网关侧的错误（无凭据 401、下游连不上 503）同样是 problem+json 形态。错误码枚举在 `dc3-common-constant` 的 `ErrorCode`，写客户端时按 `code` 分支、按 `traceId` 对日志。

## x-dc3-ai：给 AI/MCP 工具的风险标注

每个接口的 `@Operation` 上可以挂一段 `x-dc3-ai` OpenAPI 扩展，用四个布尔/枚举属性描述这次调用对 AI Agent
意味着什么风险。这段元数据不是写给人看的注释——它会被 MCP 工具目录聚合器读取，落进 `dc3_mcp_tool_catalog` 表，进而决定一个工具在
`tools/list` 里是否对某个 AI 连接可见、调用时是否需要二次确认。

```java
@Extension(name = "x-dc3-ai", properties = {
    @ExtensionProperty(name = "riskLevel",   value = "MEDIUM"),  // LOW / MEDIUM / HIGH
    @ExtensionProperty(name = "destructive", value = "false"),   // 是否破坏数据/配置
    @ExtensionProperty(name = "idempotent",  value = "false"),   // 是否可安全重试
    @ExtensionProperty(name = "openWorld",   value = "true")     // 是否触达外部/物理世界
})
```

各属性的含义：

- `riskLevel`：`LOW`/`MEDIUM`/`HIGH`，**按动词语义约定人工标注**（不是由代码从 HTTP 方法自动推导）——惯例上 `delete` 标
  `HIGH`、`add`/`update` 标 `MEDIUM`、`get`/`list` 标 `LOW`，但最终取值来自每个 `@Operation` 上手写的注解，聚合器只在缺失或非法时兜底为
  `HIGH`。`HIGH` 风险工具默认对 AI 隐藏，需显式启用，且调用走两阶段确认。
- `destructive`：调用是否会破坏既有数据或设置（如改密、取消 token）。
- `idempotent`：同样参数重复调用是否安全（决定失败后能否自动重试）。
- `openWorld`：是否会触达平台之外的外部系统或物理设备（如下发写命令）。

以鉴权中心 `TokenController` 为例，取盐接口标注 `riskLevel=LOW, destructive=false, idempotent=false, openWorld=false`，而生成
token 接口标注 `riskLevel=HIGH`——两者都属公开端点、对 AI 工具目录隐藏（`hidden=true`），但风险等级如实区分。智能中心的
`POST /api/v3/agentic/chat/completions` 则标注
`riskLevel=MEDIUM, destructive=false, idempotent=false, openWorld=true`。

聚合器还会从 HTTP 方法补出 `read_only_hint`（`GET` → 1，`POST` → 0），把全部提示位（`destructive_hint`/`idempotent_hint`/
`open_world_hint`/`read_only_hint`，取值 0/1）连同 `risk_level` 一起持久化。AI Agent 通过 MCP 看到的工具风险，就是这套标注的最终呈现。完整的
MCP 工具暴露、过滤与确认机制见 [AI Agent / MCP 集成](../ai/mcp)。

## 导出 OpenAPI JSON

需要离线契约快照、或喂给客户端代码生成器时，从运行中的开发/测试栈导出各中心的 OpenAPI JSON。注意：`make openapi`（`dc3/bin/export_openapi.sh`）默认经网关聚合路径
`/v3/api-docs/{svc}` 拉取，而聚合路由已移除，四个服务会全部 404——在聚合路由恢复之前，直接逐中心导出：

```bash
curl -s http://localhost:8300/auth/v3/api-docs    -o openapi-auth.json
curl -s http://localhost:8400/manager/v3/api-docs -o openapi-manager.json
curl -s http://localhost:8500/data/v3/api-docs    -o openapi-data.json
curl -s http://localhost:8600/agentic/v3/api-docs -o openapi-agentic.json
```

## 新增接口时的文档要求

给后端加接口时，文档不是事后补的——注解就是文档源：

1. Controller 类加 `@Tag(name = "...", description = "...")`。
2. 方法加 `@Operation(summary = "...", description = "...")`，摘要遵循 CRUD 动词约定（`add`/`delete`/`update`/`getXxx`/
   `listXxx`）。
3. 路径、查询、请求体参数加 `@Parameter`。
4. 请求/响应 DTO 字段加 `@Schema(description = ...)`，必要时补 `example` 与 `requiredMode = REQUIRED`。
5. 涉及 AI/MCP 可调用的接口，按真实风险补 `x-dc3-ai` 扩展；补完可本地跑 `make validate-annotations` 校验注解完整性（Controller/Manager/Data/Agentic/Auth
   五个 AnnotationGateTest，与 CI 单测跑的是同一批门禁用例）。
6. 新增业务模块时，补 `GroupedOpenApi` Bean（分组随各中心自己的 base-path 暴露，无需网关侧配置）。

::: warning 注解文字一律用英文
注解里的 `summary`/`description` 属于用户可见代码文本，按工程规则用英文书写；同时不要在 `@Schema` 的 `example` 里放
`apiKey`、`password`、`secret`、`token` 等敏感值。
:::

::: danger 生产环境关闭 Swagger / OpenAPI 暴露
API 文档仅在 `dev`、`test`、`pre` 环境可用，生产环境（`pro` profile）由每个中心服务各自的 `application-pro.yml`
（auth/manager/data/agentic/single 各一份）关闭：

```yaml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

共享的 `application-web.yml` 只设 springdoc 的基线路径，不负责禁用——它的注释也写明禁用动作落在各服务的
`application-pro.yml`。生产环境中 springdoc 端点根本不存在，因此不会暴露任何文档内容。
:::

## 延伸阅读

- [鉴权·租户·RBAC](../architecture/auth-rbac) — 鉴权头背后的取盐/token/HMAC 与租户隔离、权限模型
- [第一个设备](../quickstart/first-device) — 用 `dc3` CLI 走完黄金路径，把这些接口实际跑一遍
- [AI Agent / MCP 集成](../ai/mcp) — `x-dc3-ai` 元数据如何变成 MCP 工具风险策略与两阶段确认
- [测试](./testing) — 接口契约与集成测试如何验证这些路径
