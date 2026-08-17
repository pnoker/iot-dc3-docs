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

::: info Implementation status: usable ::

Broker connection is configured through Spring Boot `spring.kafka.*` (`KAFKA_BOOTSTRAP_SERVERS`); the consumer group id defaults to `dc3-driver-kafka-group`.

## Minimal onboarding example

1. Create a Device using `Kafka Driver`.
2. Add a Point (`READ_ONLY`) with `key=sensor-1` to read the latest message for that key.
3. Start the driver; messages are consumed from the topic and cached for reads.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
