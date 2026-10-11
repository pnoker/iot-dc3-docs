---
title: 第一个设备：端到端
---

<script setup>
import FirstDeviceDiagram from '../../.vitepress/theme/components/FirstDeviceDiagram.vue'
</script>

# 第一个设备：端到端

这页带你用平台自带的 **virtual（虚拟）驱动**走通一条完整链路：从登录拿
token，到建模板、建位号、建设备、配属性，再到读实时位号值、下发写命令。每一步都给可复制命令和"你应当看到"，照着做即可。

> 你在这里：已经[起好依赖栈](./)、理清了[核心概念](../introduction/concepts)。读完这页，你将拥有：**一个由 virtual
驱动接入的设备，能看到它产生的实时位号值，并能对可写位号下发写命令。**

## 这条路径长什么样

整条黄金路径是一串前后依赖的 HTTP 调用，全部经过网关 `dc3-gateway`（`:8000`）这唯一入口。前两步换到 token，中间四步在管理中心（Manager Center）建好元数据，第 7 步回管理中心绑定属性，最后两步在数据中心（Data Center）读值与下发命令。先有这张全景图，后面每一步你都知道自己走到哪了。

<FirstDeviceDiagram lang="zh" />

::: info 约定
下文所有 `id`、token、返回值都是**示例**——你环境里生成的是雪花 ID（一长串数字），请用上一步真实返回的值替换。`add` 类写接口**直接返回新建的实体（含
`id`）**，需要 ID 时从返回体读取即可；`list` 类接口用扁平的 `offset`/`limit` 分页（零基偏移），返回 `OffsetPage` 信封
（`items` / `offset` / `limit` / `total` / `hasNext`）。下文各步同时给出按名称过滤的 `list` 回查命令，可用于核对。
:::

## 第 0 步：起栈

先把数据库、消息队列和开发栈拉起来。这两条命令分别启动 PostgreSQL + RabbitMQ 依赖，以及网关 + 四个中心 + 驱动的开发栈（virtual
驱动随栈一起启动）。

```bash
make up-db && make up-dev
```

**你应当看到**：`make ps STACK=db` 列出 `dc3-postgres`、`dc3-rabbitmq`；`make ps STACK=dev` 列出 `dc3-gateway`、
`dc3-center-auth/manager/data/agentic` 以及 36 个 `dc3-driver-*` 容器处于运行态（db 与 dev 是两个栈，各自查询）。
网关在 `http://localhost:8000` 可达。

::: tip 用 dc3 CLI 时先指向网关
如果你用 `dc3` CLI，先告诉它网关地址（只需一次）：`dc3 config set gateway http://localhost:8000`。
:::

## 第 1–2 步：登录拿 token

登录分两步：先用租户 + 用户名取**盐（salt，5 分钟内有效）**，再把**明文密码**连同盐一起提交换取**访问 token（12 小时有效）
**。拿到 token
后，后续所有受保护请求都要带三个鉴权头：`X-Auth-Tenant`、`X-Auth-Login`、`X-Auth-Token`。

::: code-group

```bash [curl]
# 1) 取盐
curl -s -X POST http://localhost:8000/api/v3/auth/token/salt \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3"}'
# 默认的 2026.9 镜像线返回 text/plain 裸盐：5434e27b-8c43-400c-af08-92a267d9b017
# 2026.10 镜像线（及 main）返回 JSON：{"salt":"a1b2c3d4e5"}——两种形态取到盐即可

# 2) 连同盐提交明文密码换 token（盐不参与密码哈希，校验在服务端完成）
curl -s -X POST http://localhost:8000/api/v3/auth/token/generate \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3","salt":"a1b2c3d4e5","password":"<明文密码>"}'
# 默认的 2026.9 镜像线返回 text/plain 裸 token：eyJhbGciOiJIUzI1NiJ9...
# 2026.10 镜像线（及 main）返回 JSON：{"token":"eyJhbGciOiJIUzI1NiJ9..."}
# token 12 小时有效，两种形态都同时写入 httpOnly Cookie
```

```bash [dc3 CLI]
# CLI 封装了取盐 + 换 token 的全过程（密码明文提交，服务端校验）
dc3 auth login --tenant default --username dc3
# 交互式输入密码；登录后 token 自动保存

# 验证
dc3 auth status
dc3 auth token --header   # 打印 X-Auth-Tenant/X-Auth-Login/X-Auth-Token
```

:::

**你应当看到**：`/api/v3/auth/token/salt` 返回一个非空 `salt` 字段；`/api/v3/auth/token/generate` 返回一个长 JWT
（`token` 字段，即下面的 `<ACCESS_TOKEN>`）。CLI 路径下 `dc3 auth status` 显示已登录。

::: warning 后续请求都要带鉴权头
下文 curl 为简洁起见把三个头抽成变量，请先在 shell 里设好（值用你上一步真实拿到的）。注意 `X-Auth-Token`
**不是裸 token**：网关把它按 JSON 解析成 `{"salt":"...","token":"..."}`，缺 salt 或裸 token 都会 401——salt 复用第 1 步取到的那枚：

```bash
H_TENANT='X-Auth-Tenant: default'
H_LOGIN='X-Auth-Login: dc3'
H_TOKEN='X-Auth-Token: {"salt":"a1b2c3d4e5","token":"<ACCESS_TOKEN>"}'   # JSON 信封，示例
```

:::

## 第 3 步：确认 virtual 驱动已注册

virtual 驱动随 `make up-dev` 启动后，会把自己注册到管理中心。建设备时要用它的 `driverId`，所以先把它查出来。

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/driver/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"offset":0,"limit":20}'
```

```bash [dc3 CLI]
dc3 driver list
```

:::

**你应当看到**：返回的 `items[]` 里有一个 `driverName` 为 `Virtual Driver`（带空格，来自驱动 `application.yml` 的 `dc3.driver.name`；其
`driverCode` 是路由标识 `VirtualDriver`，模块/服务名是 `dc3-driver-virtual`——三者分属不同字段）的驱动，记下它的 `id` ——
后面记作 `<DRIVER_ID>`（示例：`92010100000000001`）。virtual 是**驱动编写模板**，专用于测试与新驱动起步，无需连任何真实设备即可产生数据。

## 第 4 步：加模板（Profile）

模板描述一类设备有哪些能力。这里建一个最小模板，位号挂在它下面。`profileShareFlag` 用 `TENANT`（租户内共享），`enableFlag` 用
`ENABLE`（启用）。

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/profile/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"profileName":"虚拟温控模板","profileShareFlag":"TENANT","enableFlag":"ENABLE"}'
# 示例返回（新建的 ProfileVO，直接含 id）：
# {"id":"81010100000000001","profileName":"虚拟温控模板","profileShareFlag":"TENANT","enableFlag":"ENABLE","version":0}
# 想核对时，可用 profileName 过滤 + offset/limit 分页回查：
curl -s -X POST http://localhost:8000/api/v3/manager/profile/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"profileName":"虚拟温控模板","offset":0,"limit":5}'
# 从 items[0].id 拿到 profileId
```

```bash [dc3 CLI]
dc3 profile create --name "虚拟温控模板"   # 返回新建实体，id 即 profileId
dc3 profile list --limit 20                # list 无 --name 过滤，从输出里按名称人工匹配
```

:::

**你应当看到**：`add` 直接返回新建的模板实体，从返回体（或 `list` 回查的 `items[0].id`）拿到模板 ID，记作
`<PROFILE_ID>`（示例：`81010100000000001`）。

::: tip profileShareFlag 取值
`ProfileShareTypeEnum` 为 `TENANT` / `DRIVER` / `USER`，决定该模板在租户内、驱动内还是用户内共享。
:::

## 第 5 步：加位号（Point）

位号是要采集或写入的数据项。**能不能写由位号自己的 `rwFlag` 决定**——这里建一个 `READ_WRITE` 的可写位号，后面才能对它下发写命令。
`pointTypeFlag` 用 `FLOAT`，挂到上一步的模板上，并带单位 `°C`。

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/point/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "pointName":"温度",
        "pointTypeFlag":"FLOAT",
        "rwFlag":"READ_WRITE",
        "profileId":"81010100000000001",
        "valueDecimal":2,
        "unit":"°C",
        "enableFlag":"ENABLE"
      }'
# 示例返回（新建的 PointVO，直接含 id）：
# {"id":"82010100000000001","pointName":"温度","pointTypeFlag":"FLOAT","rwFlag":"READ_WRITE",
#  "profileId":"81010100000000001","unit":"°C","enableFlag":"ENABLE","version":0}
# 想核对时，可用 pointName 过滤 + offset/limit 分页回查：
curl -s -X POST http://localhost:8000/api/v3/manager/point/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"pointName":"温度","offset":0,"limit":5}'
# 从 items[0].id 拿到 pointId
```

```bash [dc3 CLI]
dc3 point create --name "温度" --profile-id "81010100000000001" --rw READ_WRITE   # 返回新建实体，id 即 pointId（--rw 默认 READ_ONLY，不加则第 9 步写命令被拒）
dc3 point list --profile-id "81010100000000001" --limit 20         # 按模板过滤后从输出里按名称匹配
```

:::

**你应当看到**：`add` 直接返回新建的位号实体，从返回体（或 `list` 回查的 `items[0].id`）拿到位号 ID，记作
`<POINT_ID>`（示例：`82010100000000001`）。

::: tip rwFlag 与 pointTypeFlag 取值
`RwTypeEnum` 为 `READ_ONLY` / `WRITE_ONLY` / `READ_WRITE`；对 `READ_ONLY` 位号下发写命令会被拒绝。`PointTypeEnum` 共 8 个值：
`STRING` / `BYTE` / `SHORT` / `INT` / `LONG` / `FLOAT` / `DOUBLE` / `BOOLEAN`。位号还可带换算（`baseValue` / `multiple`
），把原始值线性变换成工程值。
:::

## 第 6 步：加设备（Device）

设备是绑定了一个模板和一个驱动的具体实例。用上面的 `<DRIVER_ID>` 和 `<PROFILE_ID>` 建设备。

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/device/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "deviceName":"虚拟温控设备-01",
        "driverId":"92010100000000001",
        "profileId":"81010100000000001",
        "enableFlag":"ENABLE"
      }'
# 示例返回（HTTP 201，新建的 DeviceVO，直接含 id）：
# {"id":"83010100000000001","deviceName":"虚拟温控设备-01","driverId":"92010100000000001",
#  "profileId":"81010100000000001","enableFlag":"ENABLE","version":0}
# 想核对时，可用 deviceName 过滤 + offset/limit 分页回查：
curl -s -X POST http://localhost:8000/api/v3/manager/device/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"deviceName":"虚拟温控设备-01","offset":0,"limit":5}'
# 从 items[0].id 拿到 deviceId
```

```bash [dc3 CLI]
dc3 device create --name "虚拟温控设备-01" \
  --driver-id "92010100000000001" \
  --profile-id "81010100000000001"      # 返回新建实体，id 即 deviceId
dc3 device list --driver-id "92010100000000001" --limit 20   # 按驱动过滤后从输出里按名称匹配
```

:::

**你应当看到**：`add` 返回 201 与新建的设备实体，从返回体（或 `list` 回查的 `items[0].id`）拿到设备 ID，记作
`<DEVICE_ID>`（示例：`83010100000000001`）。

## 第 7 步：配置属性（驱动属性 + 位号属性）

驱动在启动时声明了它**有哪些**配置项（属性，Attribute）；这一步是给**这台设备**的属性填**具体值**（配置，Config）。配置分
**两层**，缺一不可：驱动属性（设备级，整台设备一份）与位号属性（设备 + 位号一份）。这就是把"位号"真正接到驱动采集逻辑上的那一刀。

### 7a. 驱动属性（设备级，容易漏）

驱动**自身**声明的属性（virtual 是 `host` / `port`，占位值照抄即可）要逐设备填值——**漏掉这步设备不会被读取也不会上线**：
读取任务只调度驱动属性配置非空的设备（`DriverReadScheduleJob` 的门禁），健康任务同理，而 `device/add` 不会自动生成任何配置。

```bash
curl -s -X POST http://localhost:8000/api/v3/manager/driver_attribute_config/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "attributeId":"<驱动属性 id，如 host>",
        "deviceId":"83010100000000001",
        "configValue":"localhost",
        "enableFlag":"ENABLE"
      }'
# 示例返回（新建的 DriverAttributeConfigVO，直接含 id）：
# {"id":"...","attributeId":"...","configValue":"localhost",
#  "deviceId":"83010100000000001","enableFlag":"ENABLE","version":0}
# virtual 的两个驱动属性（host=localhost、port=18600）各建一条；配置写入后即生效。
```

`attributeId` 来自驱动注册的驱动属性（`DriverAttribute`），可用
`GET /api/v3/manager/driver_attribute/list_by_driver_id` 按驱动查回。控制台里这一步对应设备编辑页的驱动信息表单。

### 7b. 位号属性（设备 + 位号级）

virtual 注册的位号属性是 `Tag`——字符串标签名（默认 `TAG`），给这台设备的这个位号填一个标签名（如 `temp-01`）：

```bash
curl -s -X POST http://localhost:8000/api/v3/manager/point_attribute_config/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "attributeId":"91010100000000001",
        "deviceId":"83010100000000001",
        "pointId":"82010100000000001",
        "configValue":"temp-01",
        "enableFlag":"ENABLE"
      }'
# 示例返回（新建的 PointAttributeConfigVO，直接含 id）：
# {"id":"...","attributeId":"91010100000000001","configValue":"temp-01",
#  "deviceId":"83010100000000001","pointId":"82010100000000001","enableFlag":"ENABLE","version":0}
# 配置写入后即生效，无需单独回查。
```

**你应当看到**：两个 `add` 都返回新建的配置实体。两类配置都生效后，virtual 驱动开始为该位号产生值。

::: info attributeId 从哪来
`attributeId` 指向 virtual 驱动在管理中心注册的某个属性（`DriverAttribute` 或 `PointAttribute`
）。不同驱动声明的属性不同——这正是[核心概念](../introduction/concepts)里"协议层 Attribute vs 实例层 Config"那条区分。示例
ID 仅作占位，请用你环境里 virtual 驱动真实注册的属性 ID。
:::

::: warning 不填驱动属性，设备既不会被读取、也不会上线
读取与健康上报都有**设备级驱动属性门禁**（配置为空直接跳过），设备会一直停在离线、第 8 步查不到任何值。virtual 的
host/port 虽是占位值也照样要填——门禁只看"有没有配置"，不看值是什么。详见[设备接入](../operation/device-onboarding)第 5 步。
:::

## 第 8 步：读实时位号值

值开始产生后，从数据中心读最新位号值。`/point_value/latest` 顶层按 `deviceId` / `pointId` 过滤，分页用扁平的
`offset` / `limit`（零基偏移），返回 `OffsetPage<PointValueVO>`（`items` / `offset` / `limit` / `total` / `hasNext`）。

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/data/point_value/latest \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"83010100000000001","pointId":"82010100000000001","offset":0,"limit":10}'
# 示例返回（OffsetPage<PointValueVO> 形态）：
# {"items":[
#   {"deviceId":"83010100000000001","pointId":"82010100000000001",
#    "rawValue":"25.0","calValue":"25.0","numValue":25.0,
#    "hasLatestValue":true,"createTime":"2026-06-22T08:30:00","operateTime":"2026-06-22T08:30:00"}
# ],"offset":0,"limit":10,"total":1,"hasNext":false}
```

```bash [dc3 CLI]
dc3 point read 82010100000000001
```

:::

**你应当看到**：`items` 里至少一条 `PointValueVO`，含 `rawValue`（原始值）、`calValue`（工程值，字符串）、`numValue`
（数值投影，可空）以及采集时间 `createTime`。值随 virtual 驱动持续刷新。

## 第 9 步：下发写命令

最后对这个可写位号下发一次写命令。`/point_command/write` 接 `deviceId` / `pointId` / `value`，**立即返回 HTTP 202 与命令
ID（`commandId`，附 `statusUri` 轮询地址）**——它只代表"命令已受理"，不代表"已执行成功"。结果要拿命令 ID 去**轮询**回执接口
`/point_command_history/get_by_command_id`（查询参数是 `command_id`，即上一步返回的命令 ID）。

::: code-group

```bash [curl]
# 1) 下发写命令，立即拿到 commandId
curl -s -X POST http://localhost:8000/api/v3/data/point_command/write \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"83010100000000001","pointId":"82010100000000001","value":"26.5"}'
# 示例返回（HTTP 202，PointCommandAcceptedVO 形态）：
# {"commandId":"cmd_20260622_a1b2c3d4",
#  "statusUri":"/point_command_history/get_by_command_id?command_id=cmd_20260622_a1b2c3d4"}
# 注：statusUri 是服务内相对路径，经网关轮询时补 /api/v3/data 前缀，即下一步的 URL。

# 2) 用 command_id 轮询回执
curl -s -X GET 'http://localhost:8000/api/v3/data/point_command_history/get_by_command_id?command_id=cmd_20260622_a1b2c3d4' \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN"
# 示例返回（PointCommandHistoryVO 形态）：
# {"commandId":"cmd_20260622_a1b2c3d4","deviceId":"83010100000000001","pointId":"82010100000000001",
#  "requestValue":"26.5","responseValue":"...","status":"SUCCESS","finishTime":"2026-06-22T08:31:02"}
```

```bash [dc3 CLI]
# 下发写值
dc3 point write 82010100000000001 --device-id 83010100000000001 --value 26.5
# 回执轮询：CLI 未封装 point_command_history 端点，请用上方 curl 第 2) 步按 command_id 查询
# （`dc3 command history` 查的是 `dc3 command call` 链路的 recordId，是另一套资源，勿混用）
```

:::

**你应当看到**：写命令立即返回 `commandId`；轮询回执直到 `status` 进入终态（`SUCCESS` / `FAILED` / `TIMEOUT` / `EXPIRED` / `DEAD` / `DUPLICATE`——`DEAD` 表示命令进死信队列不再处理，`DUPLICATE` 表示被驱动去重缓存拒绝；`PENDING` / `SENT` 为进行中）。到此，你已经完整走通了"读值 + 写命令"的双向链路。

::: tip virtual 上写命令必然 FAILED——这是预期
virtual 驱动的位号写 `write()` 是**占位实现**（源码直接 `return false`）：回执会落在 `FAILED`，错误信息
`Device write returned false`，且失败不回显写入值。这不是链路故障——读值已经证明链路是通的；换成真实协议驱动
（如 Modbus）下发写命令才会见到 `SUCCESS`。详见[虚拟驱动](../drivers/virtual)的"写命令总是失败"一节。
:::

::: danger 写命令的语义：异步、需轮询、失败不回显值

- 写命令是**异步**的：`/point_command/write` 立即返回 `commandId`，**不**等设备执行完。结果必须用该 ID 轮询
  `/point_command_history/get_by_command_id`。
- 命令有 **TTL**：`PointCommandDTO.expireAt` 默认 `now + 10s`（写命令固定 10 秒，无覆盖字段），超时未执行即视为过期。另一条 `dc3 command call` 链路的超时才由命令定义的 `timeout` 字段决定（默认 30 秒）。
- **写失败时不回显写入值**：回执的执行结果为失败时不会带回一个"已写入的值"，不要把"拿到 commandId"误当成"写成功"。
- 只有 `rwFlag` 含写权限（`WRITE_ONLY` / `READ_WRITE`）的位号才接受写命令。
:::

## 延伸阅读

- [设备接入](../operation/device-onboarding) — 把这条最小路径展开成真实驱动的完整接入流程
- [数据与命令](../operation/data-commands) — 采集落库与读写命令在两条平面上的完整机制与回执语义
- [CLI 使用指南](../automation/cli) — `dc3` CLI 的完整命令面与脚本化、AI 接入用法
