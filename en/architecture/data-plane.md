---
title: "Data Plane: How a Point Value Lands in Storage"
---

<script setup>
import DataPlaneClassDiagram from '../../.vitepress/theme/components/DataPlaneClassDiagram.vue'
import DataPlaneSequenceDiagram from '../../.vitepress/theme/components/DataPlaneSequenceDiagram.vue'
</script>

# Data Plane: How a Point Value Lands in Storage

A raw register read on a device has a long way to go before it becomes a queryable value. It passes through driver
normalization, the message bus, and the data center, and only then is it written to the time-series store. This page
follows that journey end to end: the exchanges and queues on the path, how the consumer persists the message, the layers
the value moves through, and how the latest-value cache is hit on reads. By the end you'll know every hop from device to
API, and the hard constraints that apply to aggregate queries.

> You are here: you already know Point and PointValue from [Core Concepts](../introduction/concepts) and want to see the
> data flow. For the reverse read/write commands, see the [Command Plane](./command-plane).

## The Journey of a Value

The data flow is a one-way **south-to-north** link. Drivers poll their devices periodically, wrap each read of a point
into a `PointValue`, and hand it to `DriverSenderService.pointValueSender()`: the value is first committed to the
driver's local **SQLite outbox**, then published to the value exchange, and only deleted from the outbox once a
publisher confirm proves delivery — on restart the driver republishes everything unconfirmed, losing nothing and
duplicating nothing. The data center `dc3-center-data` consumes the queue in batches, writes the values to TimescaleDB,
and upserts the latest value into the shared `dc3_point_latest` projection table for hot reads. The whole link is
**asynchronous** — persistence and alarm evaluation happen on the consumer side, and the collection thread never
blocks.

<DataPlaneDiagram lang="en" />

The driver's routing key is `dc3.r.value.point.` plus its own service name (`driverProperties.getService()`, e.g. the
service name you configured for a `dc3-driver-virtual` instance). The data center's queue binds with the wildcard
`dc3.r.value.point.*`, so a single queue receives values from every driver. When publishing, `pointValueSender()` fills
in `driverId` and `tenantId` from `DriverMetadata` if the message doesn't already carry them, and stamps the message
with `messageId` (a random UUID), `sequence` (monotonic within the node), and `fencingToken` (the device-lease fence) —
the schema-v1 trio the consumer relies on for idempotency and ordering.

## RabbitMQ Topology: Value Exchange, Point Queue, Dead Letters

The value channel is a single **topic exchange** `dc3.e.value`, with one **durable queue** `dc3.q.value.point` bound
under it. The topology (exchanges, queues, bindings) is declared centrally by `RabbitTopology` in the `dc3-mq-rabbitmq`
adapter — every deployable unit shares the same physical topology:

```java
new SharedQueue(
        RabbitNames.QUEUE_POINT_VALUE,          // dc3.q.value.point
        RabbitNames.EXCHANGE_VALUE,            // dc3.e.value
        "dc3.r.value.point.*",                 // wildcard binding
        604_800_000,                           // 7 days = 604800000 ms
        RabbitNames.EXCHANGE_POINT_VALUE_DEAD, // dead-letter exchange dc3.e.point_value_dead
        "#",
        true)
```

Three things to know:

- **Durable + 7-day TTL**: the queue is `durable`, and messages are published with durable delivery (a broker restart
  loses nothing). A message stays in the queue for at most 7 days (`604800000` ms); if it isn't consumed before the
  timeout, it dead-letters.
- **Dead-letter fallback**: messages that time out or exhaust retries flow to the dead-letter exchange
  `dc3.e.point_value_dead` (dead-letter queue `dc3.q.point_value_dead`). They aren't dropped silently — you can inspect
  them there.
- **Wildcard binding**: the queue binds to `dc3.e.value` with `dc3.r.value.point.*`, so one queue collects point values
  from all driver instances.

::: info Exchange/queue names carry an environment prefix
Constants in `RabbitNames` like `dc3.e.value` and `dc3.q.value.point` are prefixed with an environment `tag`
(`dc3.rabbit.tag`) at assembly time. This page uses the stable suffix names with the prefix stripped, so you can find
them by name in the RabbitMQ management console.
:::

## Consumer: How PointValueReceiver Persists

The data center's `PointValueReceiver` listens on the point queue in **batch consumption** mode
(`@Dc3Listener(topic = POINT_VALUE, delivery = BATCH`), deserializes the payloads into `PointValueBO`, and processes
each batch as a unit:

- **Batching**: one batch accumulates at most `POINT_BATCH_SIZE` (default 500) messages, or closes when the
  `POINT_BATCH_RECEIVE_TIMEOUT_MILLIS` window (default 100 ms) elapses — batch-full or timeout, **whichever comes
  first**. The whole batch then runs through one reactive persistence pipeline, and every delivery in the batch is
  acknowledged together after the writes complete.
- **Validation**: any message in the batch violating schema v1 (missing `messageId`/`driverNode`/`sequence`/
  `fencingToken`, and so on) is a **poison message** — retried with bounded exponential backoff (default 3 attempts,
  tuned by the `POINT_RETRY_*` settings); once retries are exhausted the batch dead-letters. A poison message never
  loops forever.
- **Idempotency**: the consumer deduplicates by `tenantId:messageId`, and a Quartz replay job
  (`PointValueIngestReplayJob`) drains receipts left by a process crash — the same message never lands twice.

::: info Consumption concurrency and prefetch are env-tunable
Concurrency comes from `POINT_CONCURRENT_CONSUMERS` (default 4, capped by `POINT_MAX_CONCURRENT_CONSUMERS`, default 16),
and the prefetch window from `POINT_PREFETCH_COUNT` (default 1000). Under an ingest flood, raise concurrency and
prefetch first, then consider the batch size. The code is authoritative: `dc3-center-data`'s `application.yml`
(`dc3.data.point.batch.*`) and `BatchConsumerProperties` in `dc3-mq-core`.
:::

`pointValueService.save()` does three things. It runs the batch through the ingest pipeline into the time-series store
(a natural upsert on `(tenant, device, point, create_time)`, last write wins), upserts the shared projection table
`dc3_point_latest` **in the same transaction** (every data-center replica reads and writes the same table), and then
hands the values straight to the alarm engine for evaluation.

## Model Transformation: Six Faces Across the Layers

The same "point value" changes form six times along the link, and each layer owns its own shape and serialization. The
part that trips people up: **`PointValue` and `PointValueBO` are not the same class.** The first is the sending bean on
the driver side; the second is the message/business object on the consumer side. They belong to different layers.

<DataPlaneClassDiagram lang="en" />

Layer by layer:

- **`ReadPointValue`** (driver): the raw reading returned by the driver protocol layer's `read()`, carrying device and
  point context.
- **`CalculatedPointValue`** (driver): the result of applying linear scaling/projection (`baseValue`/`multiple`, etc.)
  to the raw value. It computes `finalValue` (the engineering-value string) and `numericValue` (the numeric projection,
  which may be empty).
- **`PointValue`** (driver sending bean): `new PointValue(readPointValue)` runs `calculate()` internally, filling in
  `rawValue`/`calValue`/`numValue` and `createTime` (the moment of acquisition). This is the payload published to
  RabbitMQ.
- **`PointValueBO`** (message/business): the object the data center deserializes from the queue. It carries `tenantId`,
  `createTime`, and `operateTime`, and is the input to persistence and alarm evaluation.
- **`PointValueDO`** (persistent): the database shape written to `dc3_point_value`, with `num_value` as a nullable
  `DOUBLE`.
- **`PointValueVO`** (API): the shape returned to clients by read endpoints. It exposes `deviceId`/`pointId`/`rawValue`/
  `calValue`/`numValue`/`createTime`/`operateTime`/`hasLatestValue`/`driverId`/`tenantId`.

## Storage: dc3_point_value Is a TimescaleDB Hypertable

Values land in a TimescaleDB **hypertable**, `dc3_history.dc3_point_value` (it lives in the `dc3_history` schema;
`search_path` includes `dc3_history, public`, so this page and queries often shorten it to `dc3_point_value`). It is
partitioned along two dimensions: the time dimension `create_time` with one chunk per **1 day**, and the device
dimension `device_id` with **16** hash buckets.

```sql
SELECT create_hypertable('dc3_point_value', by_range('create_time', INTERVAL '1 day'));
SELECT add_dimension('dc3_point_value', by_hash('device_id', 16));
```

To control storage and query cost, this hypertable carries a **tiered lifecycle** — raw detail stays only for a short
window, and long-range queries ride two levels of continuous aggregates:

```sql
-- chunks older than 7 days are compressed automatically (segmented by tenant/device/point, ordered by create_time)
ALTER TABLE dc3_point_value SET (timescaledb.compress,
    compress_segmentby='tenant_id,device_id,point_id', compress_orderby='create_time DESC');
SELECT add_compression_policy('dc3_point_value', INTERVAL '7 days');
-- raw detail is kept 30 days
SELECT add_retention_policy('dc3_point_value', INTERVAL '30 days');

-- 1-minute continuous aggregate cagg_point_value_1m (kept 365 days)
SELECT add_retention_policy('cagg_point_value_1m', INTERVAL '365 days');
-- 1-hour continuous aggregate cagg_point_value_1h, built on top of the 1m cagg (kept forever)
```

`cagg_point_value_1m` pre-aggregates count/avg/min/max/sum plus first/last per `(tenant, driver, device, point,
minute)`; `cagg_point_value_1h` re-aggregates on top of the 1m view — a 30-day dashboard query scans ~720 hourly rows
per point instead of ~43k minute rows. Both are **realtime aggregates** (the fresh, not-yet-materialized tail is merged
live), so dashboards see current data without waiting for a refresh policy.

::: tip Tiered retention: 30 days of detail + 1 year of minutes + forever of hours
Raw detail is dropped automatically after 30 days; lengthen that retention policy at deployment if your workload needs
a longer horizon. Compressing after 7 days cuts disk usage significantly (compressed chunks stay queryable, just
write-restricted). Long-range queries rely on the two continuous-aggregate tiers, so they don't lose data when the raw
detail ages out.
:::

Alongside the hypertable sits the **transactional latest-value projection** `dc3_point_latest` — a plain PostgreSQL
table (primary key `tenant_id, device_id, point_id`) that every data-center replica reads and writes. History and
latest are updated in one transaction, and older or out-of-order readings can never overwrite a newer value.
`/point_value/latest` and the dashboards' "current value" are served straight from it, with no time-series scan.

Key columns and indexes:

| Column         | Type                            | Description                                                             |
|----------------|---------------------------------|-------------------------------------------------------------------------|
| `raw_value`    | `TEXT NOT NULL`                 | Raw value read from the device                                          |
| `cal_value`    | `TEXT NOT NULL`                 | Value after scaling/projection                                          |
| `num_value`    | `DOUBLE PRECISION` **nullable** | Numeric projection of `cal_value`; `NULL` for non-numeric/JSON payloads |
| `create_time`  | `TIMESTAMPTZ NOT NULL`          | **Acquisition moment** (driver-side read)                               |
| `operate_time` | `TIMESTAMPTZ NOT NULL`          | **Persistence moment** (data-center write)                              |

The primary time-series index `idx_point_value_ts_lookup` is `(tenant_id, device_id, point_id, create_time DESC)`. Both
tenant-isolated latest-value lookups and time-window scans use it. There's also a **partial index**
`idx_point_value_num_time ... WHERE num_value IS NOT NULL`, dedicated to numeric aggregation.

::: warning create_time and operate_time are two distinct moments
`create_time` is when the driver read the value; `operate_time` is when the data center wrote it to the store. The two
are kept apart on purpose — their difference is the acquisition-to-persistence pipeline latency, which dashboards use to
measure link delay. On persistence, `save()` always rewrites `operate_time` to the current time, and fills in the
current time for `create_time` only when it's missing.
:::

::: danger num_value is nullable: aggregate queries must use num_value IS NOT NULL
`dc3_point_value.num_value` is `NULL` for non-numeric or JSON payloads. Any aggregation such as `AVG`/`SUM`/`MAX`/`MIN`
**must** add `WHERE num_value IS NOT NULL`. Without it, null values from string-typed points get mixed in and skew the
result. The partial index `idx_point_value_num_time` also covers only rows where `num_value IS NOT NULL` — skip the
predicate and you miss the index too.
:::

## Message Reliability and Post-Persistence Alarms

The data plane's no-loss guarantee rests on three overlapping mechanisms, all implemented in the `dc3-mq` adapter layer
and the driver SDK:

- **Driver-side outbox**: values are committed to a local SQLite outbox before publication and deleted only after a
  positive publisher confirm; on restart everything unconfirmed is republished — a temporarily unavailable broker never
  loses collection.
- **Durable delivery + manual ack**: messages are published durably to a `durable` queue (a broker restart loses
  nothing); the consumer acknowledges a batch only after every write in it succeeds, and poison messages dead-letter
  after bounded retries. A message is never silently swallowed.
- **Publisher confirms**: the send side registers a confirm callback; a NACK or an unroutable message is logged and
  stays in the outbox for retry. The `messageId` stamped on each message lets you map a confirmation back to the
  specific device and point.

Once a value is persisted, `PointValueServiceImpl.save()` calls
`alarmRuleTriggerService.processPointValue(...)` right away, evaluating alarm rules against the batch
**synchronously** — not on a separate delayed link. For the rules, the state machine, and notification channels,
see [Alarms and Notifications](../operation/alarms).

## Reading the Latest Value: Projection Table Direct, History via Cursor

`POST /api/v3/data/point_value/latest` reads the shared projection table `dc3_point_latest` — not an in-process cache;
multi-replica data centers all see the same current values. It filters series by `deviceId` / `pointId` / `pointName`
and pages with **zero-based offset pagination** (top-level `offset` + `limit`, `limit` capped at 200), returning the
newest reading per point.

<DataPlaneSequenceDiagram lang="en" />

The historical-range query `POST /api/v3/data/point_value/list` uses **cursor pagination** (an opaque cursor): the time
window is expressed via `createTimeFrom` (ISO timestamp), or `rangeKey` (`today`/`24h`/`7d`/`30d`), or `rangeHours`
(rolling lookback hours), with the window's right edge always "now". The first page omits `cursor`; afterwards pass the
response's `nextCursor` back verbatim to page forward (offset is not supported). Both read endpoints are guarded by
`@PreAuthorize("@perm.can('point_value', 'list')")` and force tenant context through
`PointValueQuery` — you can't pull another tenant's data.

## How To: Read Latest Values and History

Both read endpoints are forwarded through the gateway `dc3-gateway` (port `8000` directly in the dev stack; via the web
frontend's `8080` reverse proxy from the host under the app stack). Protected endpoints must carry the three auth
headers `X-Auth-Tenant` / `X-Auth-Login` / `X-Auth-Token`, where `X-Auth-Token` is the JSON envelope
`{"salt":"...","token":"..."}` (for the salt-fetch + token-issue flow, see [Quick Start](../quickstart/)).

::: code-group

```bash [latest value curl]
curl -X POST http://localhost:8000/api/v3/data/point_value/latest \
  -H "X-Auth-Tenant: default" \
  -H "X-Auth-Login: <login>" \
  -H "X-Auth-Token: {\"salt\":\"<salt>\",\"token\":\"<token>\"}" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": 1024, "pointId": 2048, "offset": 0, "limit": 10}'
```

```bash [historical range curl]
curl -X POST http://localhost:8000/api/v3/data/point_value/list \
  -H "X-Auth-Tenant: default" \
  -H "X-Auth-Login: <login>" \
  -H "X-Auth-Token: {\"salt\":\"<salt>\",\"token\":\"<token>\"}" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": 1024, "pointId": 2048, "limit": 50, "rangeHours": 24}'
# when the response carries nextCursor, add "cursor": "<nextCursor>" to the next request body; offset is not supported for history
```

:::

`/latest` returns a zero-based `OffsetPage<PointValueVO>` and `/list` a cursor-paged `CursorPage<PointValueVO>`. Each
record holds one latest (or in-range) value for a point:

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

::: tip Field names follow the actual response
The values above are examples. `PointValueVO`'s exposed fields (`rawValue`/`calValue`/`numValue`/`createTime`/
`operateTime`, with IDs as strings) are mapped from stored rows by a builder. For integration, defer to the actual
JSON the gateway returns.
:::

## Constraints and Boundaries

- **Aggregations must carry `num_value IS NOT NULL`**: see the danger callout above. It's a hard prerequisite for
  correct numeric statistics.
- **`PointValue` ≠ `PointValueBO`**: don't swap the driver sending bean for the business object across layers — their
  field sets and serialization contexts differ.
- **Consumption is batch-accumulating**: a batch closes when full (default 500) or on timeout (default 100 ms), then
  persists as one unit; concurrency (default 4–16) and prefetch (default 1000) are env-tunable — see the consumer
  section above.
- **Tenant isolation is enforced at the controller layer**: read endpoints carry tenant context via `PointValueQuery`,
  and after fetching, the controller layer's `requireTenant` / `filterTenant` checks the tenant; cross-tenant access
  returns no data.
- **Dead letters aren't loss**: values that time out or get rejected land in `dc3.e.point_value_dead`. When
  troubleshooting, look in the dead-letter queue.

## Further Reading

- [Command Plane](./command-plane) — how the reverse read/write commands are dispatched, acknowledged, and queried for
  status
- [Domain Model](./domain-model) — the DO/BO/VO layering and field details of Point / PointValue
- [Alarms and Notifications](../operation/alarms) — how alarm rules are evaluated after persistence and how
  notifications are delivered
- [Time-Series & Streaming](../foundations/data-pipeline) — the general principles of time-series databases and stream
  processing
