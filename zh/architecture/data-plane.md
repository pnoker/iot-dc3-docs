---
title: 数据平面：位号值如何落库
---

<script setup>
import DataPlaneClassDiagram from '../../.vitepress/theme/components/DataPlaneClassDiagram.vue'
import DataPlaneSequenceDiagram from '../../.vitepress/theme/components/DataPlaneSequenceDiagram.vue'
</script>

# 数据平面：位号值如何落库

设备侧采到的原始寄存器值，要经过驱动归一、消息总线、数据中心，最终写进时序库并对外可查。这页追踪一条位号值的完整旅程：用到的交换机与队列、消费者怎么持久化、模型变换经过哪几层、以及读取最新值时缓存如何命中。读完你能看懂一条值"
从设备到 API"的每一跳，并知道做聚合查询时的硬约束。

> 你在这里：已理解 [核心概念](../introduction/concepts) 里的位号(Point)与位号值(PointValue)
> ，想看数据怎么流。反向的读写命令请看 [命令平面](./command-plane)。

## 一条值的旅程

数据流是**南向到北向**的单向链路。驱动周期性采集，把每个位号的一次采集封装成一个 `PointValue` 对象，交给
`DriverSenderService.pointValueSender()`：值先落进驱动本地的 **SQLite 发件箱**（outbox），再发布到值交换机，直到
publisher confirm 确认送达才从发件箱删除——驱动重启会把未确认的值重新发布，不丢不重。数据中心 `dc3-center-data`
批量消费队列、写入 TimescaleDB，并把最新值 upsert 进共享的 `dc3_point_latest` 投影表供热点读取。整条链路是**异步**的——
落库与告警评估在消费侧完成，采集线程永不阻塞。

<DataPlaneDiagram lang="zh" />

驱动用的路由键是 `dc3.r.value.point.` 加上自己的服务名（`driverProperties.getService()`，例如 `dc3-driver-virtual`
实例配的服务名），数据中心的队列用通配绑定 `dc3.r.value.point.*` 收下所有驱动的值。发送时 `pointValueSender()` 会从
`DriverMetadata` 注入 `driverId` 与 `tenantId`（若消息里没带），并为消息盖上 `messageId`（随机 UUID）、`sequence`
（节点内单调递增）与 `fencingToken`（设备租约围栏）——schema v1 的这三件套是消费端幂等与排序的依据。

## RabbitMQ 拓扑：值交换机、位号队列、死信

值通道是一个 **topic 交换机** `dc3.e.value`，下挂一条**持久队列** `dc3.q.value.point`。拓扑（交换机、队列、绑定）由
`dc3-mq-rabbitmq` 适配器的 `RabbitTopology` 统一声明，所有部署单元共用同一张物理拓扑：

```java
new SharedQueue(
        RabbitNames.QUEUE_POINT_VALUE,        // dc3.q.value.point
        RabbitNames.EXCHANGE_VALUE,          // dc3.e.value
        "dc3.r.value.point.*",               // 通配绑定
        604_800_000,                         // 7 天 = 604800000 ms
        RabbitNames.EXCHANGE_POINT_VALUE_DEAD, // 死信交换机 dc3.e.point_value_dead
        "#",
        true)
```

三个要点：

- **持久 + 7 天 TTL**：队列 `durable`，消息以持久化投递发布（broker 重启不丢）。一条消息在队列里最多停 7 天（`604800000` ms），超时未被消费即进死信。
- **死信兜底**：超时或被拒绝（重试耗尽）的消息流向死信交换机 `dc3.e.point_value_dead`（死信队列 `dc3.q.point_value_dead`
  ），不会静默丢失，可另行排查。
- **通配绑定**：队列以 `dc3.r.value.point.*` 绑定到 `dc3.e.value`，一条队列收下全部驱动实例的位号值。

::: info 交换机/队列名带环境前缀
`RabbitNames` 里 `dc3.e.value`、`dc3.q.value.point` 等常量在装配时会拼上一个环境 `tag` 前缀（`dc3.rabbit.tag`
）。本文用的是去前缀后的稳定后缀名，便于在 RabbitMQ 管理台按名检索。
:::

## 消费者：PointValueReceiver 如何落库

数据中心的 `PointValueReceiver` 以**批量消费**模式监听位号队列（`@Dc3Listener(topic = POINT_VALUE, delivery = BATCH)`
），反序列化成 `PointValueBO` 后整批处理：

- **攒批**：消费者一次最多攒 `POINT_BATCH_SIZE`（默认 500 条），或等待 `POINT_BATCH_RECEIVE_TIMEOUT_MILLIS`（默认 100
  毫秒）窗口到时即成批——批满或超时**谁先满足谁成批**，随后整批走一次响应式落库管线，全部写完才统一 ack 本批所有投递。
- **校验**：批内任何一条违反 schema v1（缺 `messageId`/`driverNode`/`sequence`/`fencingToken` 等）都视为**毒消息**——按指数退避有界重试（默认 3 次，`POINT_RETRY_*` 参数控制），重试耗尽整批进死信，绝无毒消息无限循环。
- **幂等**：消费端按 `tenantId:messageId` 去重，进程崩溃遗留的写入凭据由 Quartz 回放任务（`PointValueIngestReplayJob`）补齐——同一消息不会落两次库。

::: info 消费并发与预取是环境变量可调的
并发由 `POINT_CONCURRENT_CONSUMERS`（默认 4，上限 `POINT_MAX_CONCURRENT_CONSUMERS` 默认 16）控制，预取窗口
`POINT_PREFETCH_COUNT` 默认 1000。采集洪峰下先调大并发与预取，再考虑批量大小。以代码为准：
`dc3-center-data` 的 `application.yml`（`dc3.data.point.batch.*`）与 `dc3-mq-core` 的 `BatchConsumerProperties`。
:::

`pointValueService.save()` 内部做三件事：先把这批值经摄入管线写入时序库（对同一 `(tenant, device, point, create_time)`
自然 upsert、last-write-wins），**同事务** upsert 共享投影表 `dc3_point_latest`（任何数据中心副本读写同一张表），再立即交给告警引擎评估。

## 模型变换：六个面孔，分属不同层

同一条"位号值"在链路上换了六次外衣，每一层各有职责与序列化形态。**最容易混淆的是 `PointValue` 与 `PointValueBO` 不是同一个类
**——前者是驱动侧的发送 bean，后者是消息/业务侧的对象，分属不同层。

<DataPlaneClassDiagram lang="zh" />

逐层说明：

- **`ReadPointValue`**（驱动）：驱动协议层 `read()` 返回的原始读数，带 device/point 上下文。
- **`CalculatedPointValue`**（驱动）：对原始值做线性换算/投影（`baseValue`/`multiple` 等）后的结果，同时算出 `finalValue`
  （工程值字符串）与 `numericValue`（数值投影，可能为空）。
- **`PointValue`**（驱动发送 bean）：`new PointValue(readPointValue)` 内部触发 `calculate()`，填入 `rawValue`/`calValue`/
  `numValue` 与 `createTime`（采集时刻），这就是发往 RabbitMQ 的载荷。
- **`PointValueBO`**（消息/业务）：数据中心从队列反序列化得到的对象，承载 `tenantId`、`createTime`、`operateTime`，是落库与告警评估的输入。
- **`PointValueDO`**（持久）：写入 `dc3_point_value` 的数据库形态，`num_value` 为可空 `DOUBLE`。
- **`PointValueVO`**（API）：读接口返回给客户端的形态，对外暴露 `deviceId`/`pointId`/`rawValue`/`calValue`/`numValue`/
  `createTime`/`operateTime`/`hasLatestValue`/`driverId`/`tenantId`。

## 存储：dc3_point_value 是 TimescaleDB 超表

值落在 TimescaleDB **hypertable** `dc3_history.dc3_point_value`（位于 `dc3_history` schema；`search_path` 含
`dc3_history, public`，故正文与查询里常简写为 `dc3_point_value`）。它按两维分区——时间维 `create_time` 每 **1 天**一个
chunk，设备维 `device_id` **16** 个哈希桶：

```sql
SELECT create_hypertable('dc3_point_value', by_range('create_time', INTERVAL '1 day'));
SELECT add_dimension('dc3_point_value', by_hash('device_id', 16));
```

为控制存储与查询成本，这张超表配置了**分层生命周期**——原始明细只留短窗口，长跨度查询走两层连续聚合（continuous aggregate）：

```sql
-- 7 天前的 chunk 自动压缩（按 tenant/device/point 分段、create_time 排序）
ALTER TABLE dc3_point_value SET (timescaledb.compress,
    compress_segmentby='tenant_id,device_id,point_id', compress_orderby='create_time DESC');
SELECT add_compression_policy('dc3_point_value', INTERVAL '7 days');
-- 原始明细保留 30 天
SELECT add_retention_policy('dc3_point_value', INTERVAL '30 days');

-- 1 分钟连续聚合 cagg_point_value_1m（保留 365 天）
SELECT add_retention_policy('cagg_point_value_1m', INTERVAL '365 days');
-- 1 小时连续聚合 cagg_point_value_1h 建在 1m 之上（不限期保留）
```

`cagg_point_value_1m` 按 `(tenant, driver, device, point, 分钟)` 预聚合 count/avg/min/max/sum 与首末值；`cagg_point_value_1h`
在 1m 之上再聚合——30 天的仪表盘查询扫的是 ~720 行小时桶而不是 4 万多行分钟桶。两个聚合都是**实时聚合**（未物化的新鲜尾部现场合并），看板不用等刷新策略就能看到最新数据。

::: tip 分层保留：30 天明细 + 1 年分钟 + 永久小时
原始明细 30 天后自动清理；需要更长明细留存时在部署侧调大这条保留策略。7 天后压缩显著降低磁盘占用（压缩后的 chunk
仍可查询，只是写入受限）。长跨度查询依赖两层连续聚合，不会随明细清理而丢数据。
:::

与超表配套的还有**事务性最新值投影表** `dc3_point_latest`——一张普通 PostgreSQL 表（主键 `tenant_id, device_id, point_id`
），每个数据中心副本读写同一张，历史与最新值同事务更新，乱序/迟到的旧读数不会覆盖新值。`/point_value/latest` 与仪表盘的"当前值"都由它直接服务，不需要扫时序库。

关键列与索引：

| 列              | 类型                        | 说明                                    |
|----------------|---------------------------|---------------------------------------|
| `raw_value`    | `TEXT NOT NULL`           | 设备采到的原始值                              |
| `cal_value`    | `TEXT NOT NULL`           | 换算/投影后的值                              |
| `num_value`    | `DOUBLE PRECISION` **可空** | `cal_value` 的数值投影；非数值/JSON 载荷为 `NULL` |
| `create_time`  | `TIMESTAMPTZ NOT NULL`    | **采集时刻**（驱动侧 acquisition）             |
| `operate_time` | `TIMESTAMPTZ NOT NULL`    | **落库时刻**（数据中心 persist）                |

主时序索引 `idx_point_value_ts_lookup` 为 `(tenant_id, device_id, point_id, create_time DESC)`，租户隔离的最新值与时间窗扫描都走它；另有一个
**部分索引** `idx_point_value_num_time ... WHERE num_value IS NOT NULL`，专为数值聚合服务。

::: warning create_time 与 operate_time 是两个时刻
`create_time` 是驱动采集到该值的时间，`operate_time` 是数据中心把它写进库的时间。两者刻意分开——它们的差值就是"采集→落库"
管线延迟，仪表盘用它衡量链路时延。落库时 `save()` 总会重写 `operate_time` 为当前时间，`create_time` 缺失才补当前时间。
:::

::: danger num_value 可空：聚合查询必须 num_value IS NOT NULL
`dc3_point_value.num_value` 对非数值或 JSON 载荷为 `NULL`。任何 `AVG`/`SUM`/`MAX`/`MIN` 等聚合都**必须**加
`WHERE num_value IS NOT NULL`，否则把字符串型位号的空值混进来，结果会偏差。部分索引 `idx_point_value_num_time` 也只覆盖
`num_value IS NOT NULL` 的行——不加这个谓词还会错过索引。
:::

## 消息可靠性与落库后的告警

数据平面的不丢保证来自三处叠加，均在 `dc3-mq` 适配层与驱动 SDK 里统一实现：

- **驱动侧发件箱**：值先写本地 SQLite outbox 再发布，publisher confirm 确认送达才删除；重启后未确认的值重新发布——broker 短暂不可用也不丢采集。
- **持久投递 + 手动 ack**：消息以持久化方式发布到 `durable` 队列（broker 重启不丢）；消费者整批写库成功才统一 ack，毒消息有界重试后进死信——绝不静默吞消息。
- **publisher confirms**：发送侧注册确认回调，NACK/不可路由都会记录并留在发件箱重试；消息携带的 `messageId` 让你能把一次确认对回具体的 device/point。

值一旦落库，`PointValueServiceImpl.save()` 紧接着调用 `alarmRuleTriggerService.processPointValue(...)`，**同步**
对这批值做告警规则评估——不是另起一条延迟链路。规则、状态机与通知渠道见 [告警与通知](../operation/alarms)。

## 读取最新值：投影表直供，历史走游标分页

`POST /api/v3/data/point_value/latest` 读的是共享投影表 `dc3_point_latest`——不是进程内缓存，多副本数据中心看到的是同一份当前值。它按
`deviceId` / `pointId` / `pointName` 过滤系列，用**零基 offset 分页**（顶层 `offset` + `limit`，`limit` 上限 200），每个位号返回最新一条。

<DataPlaneSequenceDiagram lang="zh" />

历史区间查询 `POST /api/v3/data/point_value/list` 走**游标分页**（opaque cursor）：时间窗用 `createTimeFrom`（ISO
时间）或 `rangeKey`（`today`/`24h`/`7d`/`30d`）或 `rangeHours`（回看小时数）表达，窗口右端恒为"现在"；首页不传 `cursor`
，之后把响应里的 `nextCursor` 原样带回即可翻页（不支持 offset）。两个读接口都受 `@PreAuthorize("@perm.can('point_value', 'list')")` 保护，且查询经
`PointValueQuery` 强制带租户上下文——跨租户拿不到别人的数据。

## 怎么做：读最新值与历史

两条读接口都经网关 `dc3-gateway` 转发（dev 栈直连 `8000`；app 栈从宿主机走 Web 前端 `8080` 的反代），受保护接口要带
`X-Auth-Tenant` / `X-Auth-Login` / `X-Auth-Token` 三个鉴权头，其中 `X-Auth-Token` 是 `{"salt":"...","token":"..."}`
形态的 JSON 信封（取盐+发令流程见 [快速开始](../quickstart/)）。

::: code-group

```bash [最新值 curl]
curl -X POST http://localhost:8000/api/v3/data/point_value/latest \
  -H "X-Auth-Tenant: default" \
  -H "X-Auth-Login: <login>" \
  -H "X-Auth-Token: {\"salt\":\"<salt>\",\"token\":\"<token>\"}" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": 1024, "pointId": 2048, "offset": 0, "limit": 10}'
```

```bash [历史区间 curl]
curl -X POST http://localhost:8000/api/v3/data/point_value/list \
  -H "X-Auth-Tenant: default" \
  -H "X-Auth-Login: <login>" \
  -H "X-Auth-Token: {\"salt\":\"<salt>\",\"token\":\"<token>\"}" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": 1024, "pointId": 2048, "limit": 50, "rangeHours": 24}'
# 响应带 nextCursor 时，下一页把 "cursor": "<nextCursor>" 加进请求体；历史查询不支持 offset
```

:::

`/latest` 返回零基分页的 `OffsetPage<PointValueVO>`，`/list` 返回游标分页的 `CursorPage<PointValueVO>`，每项给出位号最新（或区间内）一条值的形态：

```json
{
  "items": [
    {
      "deviceId": "1024",
      "pointId": "2048",
      "rawValue": "23.5",
      "calValue": "23.5",
      "numValue": 23.5,
      "hasLatestValue": true,
      "createTime": "2026-06-22T08:30:00",
      "operateTime": "2026-06-22T08:30:01"
    }
  ],
  "offset": 0,
  "limit": 10,
  "total": 1,
  "hasNext": false
}
```

::: tip 字段名以实际响应为准
上面是示例值。`PointValueVO` 的对外字段（如 `rawValue`/`calValue`/`numValue`/`createTime`/`operateTime`，ID 均为字符串）由构建器从存储行映射，做集成时以网关实际返回的 JSON 为准。
:::

## 约束与边界

- **聚合必带 `num_value IS NOT NULL`**：见上文 danger，这是数值统计正确性的硬前提。
- **`PointValue` ≠ `PointValueBO`**：跨层时别把驱动发送 bean 当成业务对象互用，二者字段集与序列化场景不同。
- **消费是攒批模式**：批满（默认 500）或超时（默认 100 毫秒）即整批落库；并发（默认 4–16）与预取（默认 1000）都是环境变量可调的，见上文消费小节。
- **租户隔离在接口层强制**：读接口经 `PointValueQuery` 带租户上下文，数据中心取数后由控制器层 `requireTenant` /
  `filterTenant` 校验，跨租户访问取不到数据。
- **死信不等于丢失**：超时或被 reject 的值进 `dc3.e.point_value_dead`，排障时去死信队列找。

## 延伸阅读

- [命令平面](./command-plane) — 反向的读写命令如何下发、回执与查询状态
- [领域模型](./domain-model) — Point / PointValue 的 DO/BO/VO 分层与字段细节
- [告警与通知](../operation/alarms) — 落库后告警规则如何评估、通知如何投递
- [时序数据与流处理](../foundations/data-pipeline) — 时序数据库与流处理的通用原理
