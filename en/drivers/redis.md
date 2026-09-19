---
title: Redis Driver
---

# Redis Driver

`dc3-driver-redis` treats Redis as a data source: a point reads a STRING key (GET) or a HASH field (HGET), and a write sets a STRING key (SET) or HASH field (HSET). It is useful for bridging cached values, counters, and lightweight state into the platform.

## Protocol background

Redis is an in-memory key/value store. This driver maps a Point to a key (and optional field for hashes), polling the value on the collection cycle; writes propagate back to the same key.

- **Driver name / code**: `Redis Driver` / `RedisDriver`
- **Type**: `DRIVER_CLIENT (connects to Redis and reads/writes keys)`
- **Underlying library**: Spring Data Redis (`StringRedisTemplate`)

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Key Prefix | `keyPrefix` | STRING | (empty) | Key prefix: the actual key accessed = keyPrefix + the point's `key` |
| (broker connection) | `spring.data.redis.*` | — | env | Configured via Spring Boot `spring.data.redis.*` properties |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Key | `key` | STRING | (empty) | Redis key to read/write |
| Data Type | `dataType` | STRING | `STRING` | STRING or HASH |
| Field | `field` | STRING | (empty) | Hash field (required when `dataType=HASH`) |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?` (one polling round over all points every 30 seconds).
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ | |
| Write | ✓ | |
| Subscribe | — | |

::: info Implementation status: complete

Connection is configured through Spring Boot `spring.data.redis.*` (`REDIS_HOST` / `REDIS_PORT` environment variables); no driver-level connection attribute is required.
:::

## Troubleshooting

Redis driver issues cluster into connection, key naming, and key type:

- **Both reads and writes fail with a connection error in the message.** Cause: Redis is unreachable. Connection settings are deployment-level `spring.data.redis.*`: `REDIS_HOST`/`REDIS_PORT` (default `dc3-redis:6379`), `REDIS_PASSWORD`, `REDIS_DATABASE`, with a 3-second command timeout. All failures surface as `Redis read failed` / `Redis write failed` carrying the raw Redis message (connection refused, timeout, auth failure). Check: verify reachability and credentials with `redis-cli -h <host> -p <port>` before touching the driver.
- **`Redis key has no value`.** Cause: the read returned null — the key or the hash field does not exist. The accessed key is `keyPrefix + key` (device-level prefix plus the point's `key`); a missing, extra, or mistyped prefix misses. Check: `GET`/`HGET` the composed full key in redis-cli; for hash points, also check the `field` spelling.
- **`Required attribute 'field' is missing` in the logs.** Cause: `dataType=HASH` with an empty `field` — both read and write enforce it at entry. Check: fill in `field`, or switch `dataType` back to `STRING`. Likewise, an empty point `key` is rejected when the point is saved (`key` is required).
- **WRONGTYPE errors.** Cause: `dataType` does not match the key's real type — `GET` on a hash key or `HGET` on a plain string key makes the Redis server answer WRONGTYPE, passed through in the exception message. Check: run `TYPE <key>` in redis-cli and align the point's `dataType` with it.
- **Redis is down but the device still shows online.** Cause: this driver implements no connection-level health check — device health falls back to the SDK default, which always reports online; Redis reachability shows up only in read/write errors. Check: rely on read/write logs, not the online state, to judge whether Redis is reachable.

## How it lands in IoT DC3

In this driver, Redis is not a polled physical device but a shared data source: upstream systems (business apps, edge programs, other drivers) write values into Redis, and this driver moves them into the platform on a cycle. The [Device](../introduction/concepts/device) plays a logical grouping role: the device-level `keyPrefix` isolates groups of keys within one Redis instance, so several devices can share a Redis without cross-reading. The connection itself is Spring Boot auto-configuration (`StringRedisTemplate`) — there is no per-device connection, and adding or removing devices does not touch the connection lifecycle.

Read and write paths both start from "key = `keyPrefix + key`". `read()` runs per point on the collection schedule (default every 30 seconds): `dataType=STRING` does a `GET`, `dataType=HASH` takes the point's `field` and does an `HGET`; a non-null value is wrapped into a [point value](../introduction/concepts/point-value), a null one raises a read exception (missing key or field). `write()` consumes the same point attributes: `STRING` does a `SET`, `HASH` an `HSET`, with the command value converted to a string — reads and writes land on the same key, so one point configured once is both readable and writable.

Platform wiring: connection settings come entirely from deployment-level environment variables (`REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DATABASE`), so switching Redis touches no device; read and write failures surface as `ReadPointException`/`WritePointException`. There is no connection-level device health check — the online state follows the platform's lease mechanism and is not a signal of Redis reachability (see Troubleshooting above). Capabilities match the [capability matrix](./matrix): read ✓ / write ✓ / subscribe — (the driver polls keys and subscribes to neither keyspace notifications nor pub/sub).

## Minimal onboarding example

1. Create a Device using `Redis Driver`.
2. Add a Point (`READ_ONLY`) with `key=counter:total` and `dataType=STRING`.
3. Start the driver; within 30 seconds the value appears in PointValue.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
