---
title: PointValue
---

<script setup>
import PointValueRelationDiagram from '../../../.vitepress/theme/components/PointValueRelationDiagram.vue'
import PointValueFlowDiagram from '../../../.vitepress/theme/components/PointValueFlowDiagram.vue'
</script>

# PointValue

> **A point value is a single snapshot of one [point](./point) at one instant in time**—"the outlet temperature of pump
> #3 was 25.3℃ at exactly 14:05:03." It belongs to `device + point`, carries a timestamp, is collected upstream by
> a [driver](./driver), and lands in the TimescaleDB time-series store.

A point value answers "what is this quantity **now / at that moment**." A [point](./point) is the "column definition" in
the template (this kind of device has an "outlet temperature" point); a point value is the "reading" of that
column across rows over time—one point produces thousands upon thousands of point values as time passes.

It is the complementary upstream counterpart to an [event](./event): a point value is a periodic sample of a **continuous value** (a temperature reading every second), an event is a discrete **business occurrence** ("
over-temperature alarm" fired once). For a door-access device, "temperature = 25.3℃" is a point value; "door was forced
open" is an event.

Don't conflate a point value with "the point's current value": point values are individual **history records**—each
sample appends a new row (a duplicate report on the same key is overwritten, last write wins); "current value" is the
latest entry for `device_id + point_id` in the `dc3_point_latest` projection.

## rawValue vs calValue

A single point value retains two values at once:

- **`rawValue`**—the data the driver reads from the device verbatim, with no conversion. For example, the raw register
  code `6400` returned by a 4-20mA transmitter.
- **`calValue`**—the human-readable engineering value computed from the conversion rule configured on the point (
  `baseValue` / `multiple`, etc.). For example, `6400` converts to `25.3` (℃).

Keeping the raw value matters for traceability and recomputation: if the conversion rule changes, the historical
`rawValue` is still there, so the new engineering value can be recomputed.

## Key Fields

Point value `PointValueBO` (table `dc3_point_value`):

| Field            | Type          | Meaning                                                                                                         |
|------------------|---------------|-----------------------------------------------------------------------------------------------------------------|
| `messageId`      | String        | Immutable event identity; unique message ID used for traceability                                              |
| `schemaVersion`  | Integer       | Wire-schema version of the point-value report                                                                   |
| `driverNode`     | String        | Runtime node of the driver that produced the sample                                                             |
| `sequence`       | Long          | Monotonic sequence within the producing driver node                                                             |
| `fencingToken`   | Long          | Ownership fencing token issued by the manager center                                                            |
| `deviceId`       | Long          | Owning [device](./device)                                                                                       |
| `pointId`        | Long          | Owning [point](./point)                                                                                         |
| `rawValue`       | String        | Raw value, returned by the device verbatim, not converted                                                       |
| `calValue`       | String        | Converted engineering value, human-readable                                                                     |
| `numValue`       | Double        | Numeric projection of `calValue`; populated when it parses cleanly as a double, NULL for booleans / JSON / text |
| `hasLatestValue` | Boolean       | Whether the latest-value query returned a real sampled value                                                    |
| `driverId`       | Long          | The [driver](./driver) that collected the data                                                                  |
| `tenantId`       | Long          | Owning [tenant](./tenant)                                                                                       |
| `createTime`     | LocalDateTime | Collection / write time, i.e. the timestamp of this snapshot                                                    |
| `operateTime`    | LocalDateTime | Last operation time                                                                                             |

::: tip Why numValue exists
Both `rawValue` and `calValue` are `String` (they must hold numbers, booleans, JSON, and text alike). `numValue` is a
copy of `calValue` when it parses as a number, dedicated to AVG / MIN / MAX / SUM and time-series aggregation queries so
they can use a numeric index and skip the per-row cast. For non-numeric points (digital, string, JSON), `numValue` is
NULL, and aggregate queries use `num_value IS NOT NULL` to skip them outright.
:::

## Relationship to Other Concepts

<PointValueRelationDiagram lang="en" />

- A point value is located jointly by `deviceId + pointId`: **which device's** **which point**.
- A [point](./point) gives the column definition (type, unit, conversion rule); a point value is the runtime reading of
  that column, row by row.
- An [event](./event) sits alongside point values on the upstream link—one continuous, one discrete, complementary.

## Collection and Upstream Flow

<PointValueFlowDiagram lang="en" />

The driver reads `rawValue` from the device, computes `calValue` via the point's conversion rule, fills `numValue` when
it parses as a number, and ships it upstream together with identity/idempotency fields (`messageId` / `schemaVersion` /
`driverNode` / `sequence` / `fencingToken`) and `deviceId` / `pointId` / `driverId` / `tenantId` / `createTime`; the
Data Center **naturally upserts** it into the `dc3_point_value` hypertable keyed uniquely on
`(tenant_id, device_id, point_id, create_time)` (chunked by `create_time` at 1-day intervals plus hash-partitioned by
`device_id`): a duplicate sample on the same key updates in place, last write wins (replayed deliveries are caught by
the ingest idempotency window), and the `dc3_point_latest` latest-value projection is refreshed in the same transaction.
Chunks are compressed automatically after 7 days; raw samples are retained for **30 days**, with longer history served
by the 1-minute (kept 1 year) and 1-hour (kept indefinitely) rollup layers.

::: warning Point values are append-mostly—mind the retention policy
`dc3_point_value` is a history stream: normal collection inserts one row per timestamp, with no UPDATE; only duplicate
reports on the same `(tenant_id, device_id, point_id, create_time)` key overwrite in place. Querying "current value"
goes through the `dc3_point_latest` projection, not some field that gets overwritten. Raw samples are retained for only
**30 days**—data past that age is cleaned up automatically (long-range queries go through the 1-minute / 1-hour rollup
layers), so archive raw detail ahead of time if you need long-term retention.
:::

## Example

The outlet-temperature point (`pointId=2048`) of pump #3 (`deviceId=1024`) has a conversion rule mapping the 4-20mA raw
code to 0-100℃. At 14:05:03 the driver (`driverId=8`) reads register raw code `6400` and converts it to `25.3`:

```text
PointValueBO{
  deviceId: 1024, pointId: 2048, driverId: 8, tenantId: 1,
  rawValue: "6400",      // returned by the device verbatim
  calValue: "25.3",      // converted engineering value (℃)
  numValue: 25.3,        // aggregatable as a number
  createTime: 2026-06-24T14:05:03
}
```

A second later another reading of `25.4` arrives… and so on, accumulating into a time-series stream. Querying "current
outlet temperature" = take the latest row for `device_id=1024, point_id=2048`; querying "today's average temperature" =
run AVG over `num_value` within the time window.

## Query API

| Method | Path                     | Description                                                                              |
|--------|--------------------------|------------------------------------------------------------------------------------------|
| POST   | `/point_value/latest`    | Paged query of the latest value per point                                                |
| POST   | `/point_value/list`      | Paged query of point value history (cursor pagination)                                   |
| GET    | `/point_value/history`   | Query one point's history by `device_id + point_id` (cursor pagination, `limit` defaults to 100, max 500) |
| GET    | `/point_value/dashboard` | Query one point's data dashboard (trend band / distribution / sampling health, `range_hours` defaults to 24, max 168) |

## Further Reading

- [Point](./point) — a point value is the runtime reading of a point
- [Event](./event) — complementary: continuous value vs discrete occurrence
- [Core Concepts Overview](../concepts) — back to the concept map
- [Data Plane](../../architecture/data-plane) — exchange / queue / TimescaleDB details of the upstream collection link
