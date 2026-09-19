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

## Minimal onboarding example

1. Create a Device using `Redis Driver`.
2. Add a Point (`READ_ONLY`) with `key=counter:total` and `dataType=STRING`.
3. Start the driver; within 30 seconds the value appears in PointValue.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
