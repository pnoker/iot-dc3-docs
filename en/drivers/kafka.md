---
title: Kafka Driver
---

# Kafka Driver

`dc3-driver-kafka` treats Apache Kafka as a streaming data source. Inbound messages are consumed asynchronously and cached by message key; a point read returns the latest cached value, and a point write produces a message to the configured topic.

## Protocol background

Kafka is a distributed publish/subscribe stream. Values arrive asynchronously, so this driver caches the latest message per key (or per topic when the message has no key) and serves reads from that cache while writing produces messages.

- **Driver name / code**: `Kafka Driver` / `KafkaDriver`
- **Type**: `DRIVER_SERVER (passively consumes messages and produces writes)`
- **Underlying library**: Spring Kafka (`KafkaTemplate` + `@KafkaListener`)

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Topic | `topic` | STRING | `dc3-driver-kafka` | Default topic for produce/consume |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Topic | `topic` | STRING | (empty) | Override topic for this point |
| Key | `key` | STRING | (empty) | Message key used for produce and cache lookup |

### Command attributes (`command-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Topic | `topic` | STRING | (empty) | Override topic for this command |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?` (one polling round over all points every 30 seconds).
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ (latest cached message) | |
| Write | ✓ | |
| Subscribe | ✓ | |

::: info Implementation status: available

Broker connection is configured through Spring Boot `spring.kafka.*` (`DC3_MQ_KAFKA_BOOTSTRAP`); the consumer group id defaults to `dc3-driver-kafka-group`.
:::

## Troubleshooting

- **No point values arrive at all** → Cause: the read schedule is off by default (`schedule.read.enable=false`), so cached messages are never pulled and reported; message consumption itself keeps running in the background, unaffected by this switch. Fix: enable the read schedule first (default cron `0/30 * * * * ?`), then confirm the cache actually holds values.
- **Read raises `No Kafka message consumed yet, key=<key>`** → Cause: no latest message is cached under that key — either it has not arrived yet, or the cache key does not match. Fix: keyed messages are cached by message key and keyless messages by topic name; the point's `key` must exactly equal the message key, and an empty `key` falls back to the device driver attribute `topic` as the cache key.
- **You set the point's `topic` but reads still miss** → Cause: the point `topic` attribute takes no part in the read cache lookup and does not affect subscription — it only decides the write target. Fix: reads recognize only "point `key`, defaulting to the device `topic`" — either match the point `key` to the message key, or leave `key` empty and set the device `topic` to the message topic name.
- **Messages published to another topic never arrive** → Cause: the `@KafkaListener` subscribes to exactly one topic, the deployment property `dc3.driver.kafka.topic` (default `dc3-driver-kafka`); point or device topic attributes never add subscriptions. Fix: publish to the listened topic, or change the deployment property and restart the driver.
- **After a restart, messages from the downtime are missing** → Cause: the consumer uses `auto-offset-reset: latest` and starts at the newest offset, so messages from the downtime are not back-consumed. Fix: expected behavior — use an offset-replay tool for backfill instead of the driver cache.
- **Write raises `Kafka write failed`** → Cause: the broker is unreachable or the send fails; the broker address comes from `DC3_MQ_KAFKA_BOOTSTRAP` (default `kafka:9092`). Fix: verify broker connectivity and that the target topic exists and accepts produces.
- **The device stays "online" while no data arrives** → Cause: the driver implements no custom health check and uses the interface default that always reports online, so the online state says nothing about the broker connection. Fix: when data stops, check broker connectivity and the consumption log (debug level logs `Kafka message consumed`) instead of trusting the online state.

## How it lands in IoT DC3

There is no connectable "device" on the Kafka side; a [Device](../introduction/concepts/device) is just a logical data source. The whole driver process is one consumer group (`dc3-driver-kafka-group`) permanently subscribed to the single topic named by the deployment property `dc3.driver.kafka.topic`, with the broker address injected via `DC3_MQ_KAFKA_BOOTSTRAP` (default `kafka:9092`). Messages arrive asynchronously into an in-memory cache: keyed messages are cached by message key, keyless ones by topic name, with only the latest value kept per key.

Read and write follow two entirely separate paths. `read()` consumes the point attribute `key` (falling back to the device driver attribute `topic` when empty) as the cache key and returns the latest cached value; an empty cache throws immediately — a read is an in-memory lookup that sends no network request at all. `write()` consumes the point attributes `topic` (falling back to the device `topic`, then the default topic `dc3-driver-kafka`) and `key`: the command value is serialized as a string and sent to the target topic, keyed when `key` is non-empty and keyless when empty.

Integration with the rest of the platform: cached values reach the platform only through the SDK read schedule polling `read()` (off by default; enable `schedule.read.enable` and it runs on the cron). Consumption and the read schedule are decoupled — if the broker drops, consumption stops and the cache stops updating, reads keep returning the stale cached value, and only an empty cache throws. Metadata events have no connection to release; `validate()` / `validatePoint()` always pass, so a mis-typed attribute is not caught at save time and only surfaces as a read or write exception.

## Minimal onboarding example

1. Create a Device using `Kafka Driver`.
2. Add a Point (`READ_ONLY`) with `key=sensor-1` to read the latest message for that key.
3. Start the driver; messages are consumed from the topic and cached for reads.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
