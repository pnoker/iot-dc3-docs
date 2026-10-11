---
title: CLI 使用指南
---

<script setup>
import CliSequenceDiagram from '../../.vitepress/theme/components/CliSequenceDiagram.vue'
import CliCredentialFlowDiagram from '../../.vitepress/theme/components/CliCredentialFlowDiagram.vue'
import CliClassDiagram from '../../.vitepress/theme/components/CliClassDiagram.vue'
</script>

# CLI 使用指南

`dc3-cli` 是 IoT DC3 的命令行客户端：一个独立的 TypeScript 包（Node ≥ 22），把平台的全部能力封装成 `dc3` 命令，全程经网关
`/api/v3/*` 通信。读完这页你能装好它、配好网关、登录拿到 token，并用真实命令读设备、读位号值、下发命令。

> 你在这里：已经能用前端或 curl 跑通 [第一个设备](../quickstart/first-device)，现在想用命令行或在 AI Agent 里驱动平台。需要让
> AI 工具直连平台时，转向 [AI Agent / MCP 集成](../ai/mcp)。

## 它是什么、给谁用

`dc3-cli` 不是另一套后端，它只是一个 HTTP 客户端：所有请求都打到你配置的网关地址，路径前缀统一为 `/api/v3/*`
（网关再聚合到鉴权、管理、数据、Agentic 各中心）。它没有任何 Java 或构建上的耦合，装一个 Node 包即可独立运行。

它面向三类人：在终端里快速查设备、读值、下发命令的**运维/接入工程师**；把平台操作写进脚本与流水线的**自动化作者**；以及让 AI
编码工具（Claude Code、Codex、Gemini CLI 等）通过 shell 直接调用平台的 **Agent 集成方**——每个命令都支持 `--format json`
，输出可被程序稳定解析。

```bash
# dc3-cli 未发布到 npm registry——从主仓库源码安装（pnpm 项目）
cd <iot-dc3 检出目录>/dc3-cli
pnpm install && pnpm build
pnpm link   # 全局可用 dc3 命令
```

三步即可开始：配网关、登录、然后用。

```bash
dc3 config set gateway http://localhost:8000   # 网关地址（示例：本地默认端口 8000）
dc3 auth login                                 # 交互式登录
dc3 device list                                # 列出设备
```

## 鉴权：三段式 token 如何拿到与保鲜

`dc3 auth login` 背后是一条三段式的 token 链路，与平台 [黄金路径](../quickstart/first-device) 里 curl 登录用的是同一对端点，只是
CLI 帮你串好了。先 `POST /api/v3/auth/token/salt` 用租户名 + 用户名换一个**盐（salt）**；再把**明文密码**连同盐
`POST /api/v3/auth/token/generate`，换回一个 JWT。拿到 JWT 后，CLI 解出其中的 `iat` / `exp`，把
`{ token, salt, tenant, username, issuedAt, expiresAt }` 写入 `~/.dc3/tokens.json`（文件权限 `0600`，每个 profile 一条）。

<CliSequenceDiagram lang="zh" />

后续每次调用 API 前，CLI 会做两件事保证你几乎不会撞到 401：

- **主动续期**：若当前 token 在续期阈值内即将过期，调用前先静默重登换新 token。阈值由设置项 `renewal_threshold_hours` 控制
  （`dc3 config set renewal_threshold_hours <n>`，可配 0–12 小时），默认 **1 小时**（即剩余有效期不足 1h 就提前续）。
- **401 兜底**：万一仍收到 401（时钟漂移、服务重启等），续期后**自动重试一次**该请求。

发往受保护端点的请求头沿用平台约定的三件套——`X-Auth-Tenant`、`X-Auth-Login`、`X-Auth-Token`，其中 `X-Auth-Token` 携带
`{ salt, token }`。

::: warning 续期依赖密码可取
主动续期和 401 重试都需要 CLI 能重新拿到密码去走一遍 salt→generate。如果你用 `--no-save` 或 `--store prompt`（不落盘），token
过期后没有可用密码，CLI 无法静默续期，需要你手动 `dc3 auth login` 重新登录。
:::

::: danger 不要打印真实密码或 token
本页所有密码、token 均为示例占位。请勿在脚本、日志、issue 中明文粘贴真实密码或 JWT；`dc3 auth token`
仅用于本机排障，输出的令牌等同于一次有效登录凭证。
:::

## 凭据存哪儿：存储后端与解析链

密码本身不进 `tokens.json`，而是交给**凭据存储后端**保管。续期需要密码时，CLI 按固定解析链查找：先查 **profile 配置的后端**
（`dc3 config set auth.store <type>` 选定的那个），未命中再按 `keychain → encrypted → env`（`DC3_PASSWORD`）固定顺序兜底；
第一个返回非空密码的后端胜出，不可用的后端跳过、不报错。解析链上**没有 prompt 兜底**——查不到密码就放弃本次静默续期，等
401 兜底把错误暴露出来。所以 `--no-save` / `--store prompt`（不落盘）下 token 过期后没有可用密码，只能手动重登。

<CliCredentialFlowDiagram lang="zh" />

四种后端各自的定位：

| 存储          | 落点                                                                            | 适用场景         |
|-------------|-------------------------------------------------------------------------------|--------------|
| `keychain`  | OS 钥匙串（macOS Keychain / Linux Secret Service / Windows Credential Manager）   | 日常使用（默认）     |
| `encrypted` | `~/.dc3/credentials.enc`，AES-256-GCM 加密                                        | 钥匙串不可用时的回落   |
| `env`       | 读取 `DC3_PASSWORD` 环境变量                                                       | CI/CD、脚本     |
| `prompt`    | 不落盘，仅登录时交互输入                                                                  | 安全性最高，无法自动续期 |

加密文件后端用 `aes-256-gcm`：密文在 `~/.dc3/credentials.enc`，解密密钥是首次写入时随机生成的 256-bit 密钥，单独存放于
`~/.dc3/credentials.key`（两个文件均为 `0600`/受限 ACL）。密钥随机、独立于机器标识——只拿到密文文件无法离线解密；旧版"机器
标识经 `scrypt` 派生密钥"的文件格式只保留读取迁移用，新写入一律走随机密钥。密码以 `identifier → password`
（`username@tenant`）形式存储，不写明文。备份或迁移 `~/.dc3` 目录时，`credentials.enc` 与 `credentials.key` 必须一起带走，
缺了 key 文件密码就不可恢复。

```bash
# 登录时一并选择凭据后端
dc3 auth login --store keychain        # 存入 OS 钥匙串（适合日常）
dc3 auth login --store env             # 从 DC3_PASSWORD 读取（适合 CI）
dc3 auth login --no-save               # 不保存密码，过期需手动重登

# 非交互登录（示例值，请勿用真实密码明文）
dc3 auth login --tenant default --username dc3 --password '<示例密码>'

# CI/脚本推荐形态：设置 DC3_PASSWORD 后只传身份参数（stdin 非终端时绝不弹交互）
export DC3_PASSWORD='<示例密码>'
dc3 auth login --tenant default --username dc3

dc3 auth status                        # 查看登录态与剩余有效期
dc3 auth token --header                # 以 JSON 打印完整鉴权头（排障用）
```

## 命令模块概览

CLI 共 21 个顶层命令组，按对象与场景划分。配置与鉴权是入口；元数据类（device/driver/point/profile/group/label）对应管理中心的
增删改查；事件/命令/告警/仪表盘/主题对应数据与运行态；其余八组（chat/tools/analytics/session/action/provider/model/attachment）
面向 Agentic 中心——对话、MCP 工具目录、时序分析、会话与高危审批、模型提供方与模型配置、对话附件。

| 模块   | 命令前缀             | 用途                                    |
|------|------------------|---------------------------------------|
| 配置   | `dc3 config`     | 网关地址、租户、凭据后端、profile 切换与整体重置         |
| 鉴权   | `dc3 auth`       | 登录（含 `--oauth` 客户端凭证模式）/登出、登录态与 token |
| 设备   | `dc3 device`     | 设备增删改查、计数、在线状态、XLSX 批量导入             |
| 驱动   | `dc3 driver`     | 驱动增删改查、运行状态                          |
| 位号   | `dc3 point`      | 位号增删改查、读最新值、游标分页历史、写值                |
| 模板   | `dc3 profile`    | 设备/位号模板增删改查                          |
| 分组   | `dc3 group`      | 设备分组管理                               |
| 标签   | `dc3 label`      | 标签管理                                 |
| 事件   | `dc3 event`      | 事件定义增删改查、事件历史                        |
| 命令   | `dc3 command`    | 命令定义增删改查、调用、执行历史                    |
| 告警   | `dc3 alert`      | 告警概览、确认/批量确认、趋势、Top 来源与深度分析         |
| 仪表盘  | `dc3 dashboard`  | 统计、时序、拓扑、健康、实时流                     |
| 主题   | `dc3 topic`      | MQTT 主题列表（只读）                        |
| 对话   | `dc3 chat`       | 与 Agentic 中心对话（流式、续聊、指定模型）           |
| 工具目录 | `dc3 tools`      | MCP 工具目录：list/call 直调平台工具（需 OAuth 登录）  |
| 分析   | `dc3 analytics`  | 位号时序的 9 个粗粒度分析操作                    |
| 会话   | `dc3 session`    | Agentic 会话生命周期（列表、消息、重命名、删除）         |
| 审批   | `dc3 action`     | 高危工具调用的待审列表与确认/驳回                   |
| 提供方  | `dc3 provider`   | 模型提供方管理与连通性检查                        |
| 模型   | `dc3 model`      | 模型配置管理与连通性检查                         |
| 附件   | `dc3 attachment` | 对话附件上传/列表/删除                         |

结构上，`dc3` 入口把命令行解析到 21 个命令组，所有模块再共用同一组核心组件：HTTP 客户端、配置管理、token
管理与凭据存储。命令模块只描述"做什么"，真正的网关请求、profile 解析、续期与密码读取都收敛在核心层。

<CliClassDiagram lang="zh" />

全局选项只有两个，且**只能出现在第一个子命令之前**：`--profile <name>` 为本次调用切换配置档（配置档不存在则报错退出）；
`--format json|table|yaml` 设定全局输出格式。放在子命令之后会被当作未知选项拒绝（退出码 1），这样叶子命令自己的选项（如
`device update <id> --version <n>`）不会被全局选项劫持。每个命令还带自己的 `--format`，最终格式按「命令 `--format` → 全局
`--format` → 持久化设置 `settings.output_format`（默认未设）→ TTY 默认（终端 `table`、管道 `json`）」解析。裸 `dc3` 打印完整
帮助并退出 `0`；`dc3 <组> --help` 与 `dc3 help <组> <子命令>` 输出对应命令的帮助。

::: details 多 profile 并存（开发 / 生产切换）
每个 profile 各自保存网关、租户、凭据后端与 token，互不干扰：

```bash
dc3 config profile use prod
dc3 config set gateway https://iot.example.com   # 示例生产地址
dc3 auth login

dc3 config profile use default                    # 切回本地
dc3 device list
```

:::

## Agentic 能力：对话、工具目录与审批

CLI 里有一组命令直连 Agentic 中心：`chat` 发起对话；`tools` 把平台的 MCP 工具目录带到终端；`analytics` 做位号时序的粗粒度
分析；`session`/`action` 管理会话与高危工具调用审批；`provider`/`model` 管理模型提供方与模型配置；`attachment` 处理对话附件。

`tools` 走 MCP 传输，**只接受 OAuth 票据**：先用 `dc3 auth login --oauth` 走 client_credentials 登录（客户端需先在控制台的 MCP
设置里注册），普通账号密码登录换到的票据不能用于 `/mcp`。

```bash
# OAuth 客户端凭证登录（示例值）
dc3 auth login --oauth --client-id '<client-id>' --client-secret '<client-secret>'

# 列出当前 OAuth 票据可见的 MCP 工具，并从 CLI 直接调用一个
dc3 tools list
dc3 tools call read_device --args '{"deviceId":456789}'

# 与 Agentic 中心对话（可流式、可续聊、可指定模型）
dc3 chat "设备 123456 的温度最近正常吗？"
dc3 chat --model gpt-4o --stream "分析设备数据"
dc3 chat --conversation-id 9a1f2c3d-0000-0000-0000-000000000000 "继续刚才的话题"

# 会话管理与高危工具调用审批（删除/确认/驳回有交互确认，脚本里加 --yes 跳过）
dc3 session list
dc3 action pending --conversation-id 9a1f2c3d-0000-0000-0000-000000000000
dc3 action confirm 3e5f7a9b-0000-0000-0000-000000000000 --yes

# 位号时序分析：9 个操作（query_latest、query_history、compute_stats、compare_periods、
# rank_entities、trend_analysis、threshold_report、correlate、data_quality_report）
dc3 analytics list
dc3 analytics run trend_analysis --args '{"pointId":456789}'
dc3 analytics run query_history --args '{"pointId":456789,"days":7}'

# 模型提供方与模型配置
dc3 provider list
dc3 provider check --id 123
dc3 model list

# 对话附件
dc3 attachment upload report.xlsx --conversation-id 9a1f2c3d-0000-0000-0000-000000000000
```

超出 argv 大小限制的超长 JSON 参数用 `--args-file <path>`（`-` 读 stdin）代替 `--args`，`tools call` 与 `analytics run`
都支持这一形态。

## 实操：读值、读历史、下发命令

下面用真实命令演示常见操作，所有 ID、值均为示例占位。读最新值对应数据中心 `POST /api/v3/data/point_value/latest`，写位号对应
`POST /api/v3/data/point_command/write`，命令回执对应 `GET /api/v3/data/command_history/get_by_record_id?record_id=<id>`。

::: code-group

```bash [dc3 CLI]
# 读位号最新值
dc3 point read 456789 --format json

# 读位号历史：--limit 是页大小（默认 100），--cursor 翻下一页
dc3 point history 456789 --device-id 123456 --limit 100 --format json
dc3 point history 456789 --device-id 123456 --limit 100 --cursor '<上一页返回的 cursor>' --format json

# 给可写位号下发写命令（位号须为 WRITE_ONLY 或 READ_WRITE）
dc3 point write 456789 --device-id 123456 --value 25.5

# 调用设备命令
dc3 command call --device-id 123456 --command-id 789 --params '{"speed":1500}'

# 查命令执行回执（用 call 返回的 recordId，示例值）
dc3 command history 9a1f2c3d-0000-0000-0000-000000000000

# 设备与系统健康
dc3 device status 123456 --format json
dc3 dashboard health --format json
```

```bash [对应 curl]
# 等价的写命令直连网关（示例值）
curl -X POST http://localhost:8000/api/v3/data/point_command/write \
  -H 'Content-Type: application/json' \
  -H 'X-Auth-Tenant: default' \
  -H 'X-Auth-Login: dc3' \
  -H 'X-Auth-Token: {"salt":"<示例盐>","token":"<示例JWT>"}' \
  -d '{"deviceId":123456,"pointId":456789,"value":"25.5"}'
```

:::

历史查询是**游标分页**：每页响应带下一页的 opaque `cursor`，把它作为 `--cursor` 传入即可继续翻页；`--limit` 控制页大小（默认
100）。另外注意平台上有两个"命令历史"资源：`dc3 command history <recordId>` 按**执行记录 ID**查 `dc3 command call` 的回执
（`command_history/get_by_record_id`）；写命令侧另有按 command_id 查询的 `point_command_history/get_by_command_id`，CLI
未封装该端点，两者不要混淆。

`dc3 point write` 与 `dc3 command call` 的最终落点是命令链路。写命令是异步下发：网关/数据中心受理后立即返回一个命令
ID，真正的执行结果要用该 ID 去查命令历史。

::: danger 写失败不回显、两条链路各有有效期
位号能否写取决于它的 `rwFlag`，对 `READ_ONLY` 位号写会被拒绝。写命令若执行失败，回执的 `responseValue` 为 `null`
，不会把失败值回显成成功。两条链路的有效期不同：`dc3 point write` 的写命令 `PointCommandDTO.expireAt` 默认 `now + 10s`，超时
未被驱动消费即作废；`dc3 command call` 的超时由命令定义的 `timeout` 字段决定（`dc3 command add --timeout`，默认 30 秒）。
这些语义在 CLI 与直连 curl 下完全一致。
:::

## 退出码与错误信封：脚本里如何判定结果

`dc3` 用**四档退出码**区分失败类别。任何失败都经单一收口报告：stderr 恒定一行 `Error: <message>`；当生效输出格式为 json 或
yaml 时，stdout 还会输出一份机器可读信封（table 格式下 stdout 保持干净，人读 stderr 即可）：

```json
{"ok":false,"error":{"kind":"network","code":"NETWORK","message":"Network request failed (...)"}}
```

| 退出码 | 含义                                       |
|-----|------------------------------------------|
| `0` | 成功                                       |
| `1` | 业务错误：参数/校验失败、网关 API 报错（含 404/409/5xx）、超时 |
| `2` | 网络错误：请求未到达网关（DNS、socket、TLS）            |
| `3` | 鉴权错误：401/403，需要重新登录                     |

需要更细的失败原因时按信封的 `error.kind` 判别，不要去解析 stderr 文本：

| `error.kind`   | 含义                              | 退出码 |
|-------------|---------------------------------|-----|
| `usage`     | 命令行本身非法（未知选项/命令、参数值无效、多余参数）    | `1` |
| `validation` | 业务校验失败（网关往返前后）                 | `1` |
| `auth`      | 网关拒绝鉴权（HTTP 401/403）            | `3` |
| `network`   | 请求未到达网关                         | `2` |
| `api`       | 网关非 2xx 响应，`code` 形如 `API_<状态码>` | `1` |
| `timeout`   | 长任务超过截止时间                       | `1` |

```bash
# CI 中按退出码分流：3 重新登录、2 网络问题、1 其他错误
dc3 device list --format json >/dev/null 2>err.log
code=$?
if [ "$code" -eq 3 ]; then
  echo "登录已过期，需要 dc3 auth login"
elif [ "$code" -eq 2 ]; then
  echo "网关不可达"
elif [ "$code" -ne 0 ]; then
  echo "其他错误"; cat err.log
fi

# json/yaml 输出下从 stdout 信封读 error.kind（比解析 stderr 文本稳）
dc3 point read 456789 --format json 2>/dev/null | grep -o '"kind":"[a-z]*"'
```

::: tip 给 AI Agent 用时优先 `--format json`
让 AI 编码工具通过 shell 调用平台时，统一加 `--format json`，输出字段稳定、可解析；失败时先看退出码（`2` 网络不可达、`3`
需要重新登录），再读 stdout 信封的 `error.kind` 决定重试还是重登。若希望 AI 工具直接发现并调用平台全部
API，参见 [AI Agent / MCP 集成](../ai/mcp) 的网关 MCP 端点接法。
:::

## 延伸阅读

- [自动化](./) — CLI、脚本与 MCP 在整体自动化中的位置
- [AI Agent / MCP 集成](../ai/mcp) — 让 AI 工具经网关 `/mcp` 自动发现并调用平台工具
- [第一个设备](../quickstart/first-device) — 黄金路径：从建驱动到读值的端到端流程
