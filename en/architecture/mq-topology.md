---
title: Message Bus Topology
---

# Message Bus Topology

The platform's loose coupling rides on a single message bus: most of the asynchronous traffic between services flows through a set of topic exchanges named by business domain. The messaging layer itself is **broker-neutral** (the `dc3-mq` abstraction; `DC3_MQ_TYPE` selects `rabbitmq`/`kafka`/`pulsar`/`mqtt`, defaulting to `rabbitmq`). This page is the **full inventory of the default RabbitMQ implementation** — every exchange, queue, routing-key prefix, TTL, and dead-letter destination, plus who publishes and who consumes. When troubleshooting, open the RabbitMQ management page (`15672`), find the backlog, and this table tells you which link is stuck.

> You are here: the data and command plane pages cover the two main pipelines in depth; this page is the **ledger** — including state, alarm, metadata, and event domains not expanded elsewhere. Names come straight from `RabbitNames` / `RabbitTopology` in `dc3-mq-rabbitmq`; the code is authoritative.

## Naming conventions

- Exchanges: `dc3.e.<domain>`; queues: `dc3.q.<domain>[.<sub>]`; routing keys: `dc3.r.<domain>.<prefix>`.
- Queue names with a **dot suffix** (e.g. `dc3.q.point_command.`) are **per-consumer prefixed queues** — each driver instance owns its own queue under its client id (`dc3.driver.client`, e.g. `dc3.q.point_command.dc3-driver-virtual`), and commands route to it by the key `dc3.r.point_command.<service>.<node>`.
- **Exception**: `dc3.q.event.report` carries a dot but is a **fixed-suffix shared queue** (every driver's events land in this one queue) — it is not a per-consumer queue.
- The optional system property `dc3.rabbit.tag` prefixes every name (empty by default) — use it to isolate stacks sharing one RabbitMQ.

## Full inventory

### Values and commands (details in the data/command plane pages)

| Exchange | Queue | Routing | Who → whom | Notes |
|----------|-------|---------|------------|-------|
| `dc3.e.value` | `dc3.q.value.point` | `dc3.r.value.point.*` | driver → data center | The point-value pipeline; TTL 7 days |
| `dc3.e.point_value_dead` | `dc3.q.point_value_dead` | — | value-queue dead letter | Landed on expiry or retry exhaustion (a quarantine with no consumer by design) |
| `dc3.e.point_command` | `dc3.q.point_command.<client>` | `dc3.r.point_command.<service>.<node>` | data center → target driver | Point read/write commands; queue TTL 30s (expiry dead-letters), plus a lease-coupled `x-expires` (default 5 minutes — the queue self-deletes after the driver departs) |
| `dc3.e.point_command_dead` | `dc3.q.point_command_dead` | — | command dead letter | Expired / retry-exhausted commands |
| `dc3.e.point_command_result` | `dc3.q.point_command_result` | `dc3.r.point_command_result.*` | driver → data center | Command receipts; TTL 60s |

### Custom commands and events

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.command` | `dc3.q.command.<client>` | data center → target driver | Device-level custom commands (`CommandCallDTO`; a separate namespace from point commands); same 30s TTL + dead letter + lease `x-expires` |
| `dc3.e.command_result` | `dc3.q.command_result` | driver → data center | Custom-command receipts; TTL 60s |
| `dc3.e.command_dead` | `dc3.q.command_dead` | command dead letter | |
| `dc3.e.event` | `dc3.q.event.report` | driver → data center | Event reports (`dc3_event_history`); can trigger alarms. Fixed queue, TTL 60s, routing key `dc3.r.event.<driver service name>` |

### Registration and metadata

Driver **registration does not use the message bus**: once a driver is up it registers with the Manager Center directly over gRPC (`DriverClient` in `dc3-api-driver`), carrying its protocol attribute definitions — don't look for a "register queue" in the management console; it doesn't exist (the old register constants were dropped from the code). What does ride the bus in this domain is metadata invalidation:

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.metadata` | `dc3.q.metadata.driver.<client>` | manager → target driver | After a device/point/driver metadata change, the Manager Center delivers a targeted notice by driver service name (routing key `dc3.r.metadata.driver.<service>`); the driver consumes it and invalidates its local metadata cache. Queue is auto-delete + TTL 30s |

### State and timeouts

| Exchange | Queue | Notes |
|----------|-------|-------|
| `dc3.e.state` | `dc3.q.state.driver` / `dc3.q.state.device` | Driver/device liveness heartbeats to the data center (source of the `dc3_entity_state` lease); queue TTL 30s |
| `dc3.e.state_timeout_delay` | `dc3.q.state_timeout.driver.45s` (TTL 45s) | Delay queue: on every driver heartbeat received, the data center publishes a 45s delayed check; on expiry it dead-letters into `dc3.e.state_timeout_check` |
| `dc3.e.state_timeout_check` | `dc3.q.state_timeout.driver_check` | Consumed by the data center on expiry; judges offline against the database lease (fenced by `leaseVersion`) |
| same | `dc3.q.state_timeout.device_scan_tick.10s` (10s) | Periodic device-scan tick (a 10s self-perpetuating cycle the data center drives itself) |
| same | `dc3.q.state_timeout.device_scan` | Device-scan execution queue |

### Alarms and notifications

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.alarm` | `dc3.q.alarm.driver` / `dc3.q.alarm.device` | driver → data center | Driver-originated driver/device alarms (routing keys `dc3.r.alarm.driver.<service>` / `dc3.r.alarm.device.<service>`); the data center persists them to `dc3_entity_alarm` and runs rule evaluation. The data center's own status-flip alarms enter the service layer directly without these queues |
| | `dc3.q.notify.task` (TTL 24h) | data center (alarm engine) → notification worker | Notification delivery tasks, routed per channel (`dc3.r.notify.task.<channel>`); channels (Feishu bot/webhook/email) in [Alarms & Notifications](../operation/alarms) |

### MQTT bridge

`dc3.e.mqtt` is a **broker-side** exchange: it is declared by the RabbitMQ image's `definitions.json` / `rabbitmq.conf` (`mqtt.exchange`, environment variable `RABBITMQ_MQTT_EXCHANGE`, default `dc3.e.mqtt`) together with the MQTT plugin — inbound MQTT messages on 1883/8883 enter the AMQP side through it. It is a plugin entry point, **not** part of the application-declared topology; there is no `dc3.q.mqtt` queue in application code (the old constant was dropped), and the MQTT driver connects straight to the broker via `dc3-common-mqtt`.

## Troubleshooting with this table

1. **Which queue is backed up**: RabbitMQ management → Queues → sort by `messages ready`;
2. Match "who consumes" above — a `dc3.q.value.point` backlog means the data center consumes slowly (batch / concurrency settings); a `dc3.q.point_command.<client>` backlog means that driver is offline (nobody consumes; dead-letters after 30s);
3. **Dead-letter queues have messages**: something was rejected or expired — check the consumer's logs for the rejection / retry-exhaustion reason in that domain;
4. Queue missing: the consumer never registered (a driver's prefixed queues are created only when it subscribes);
5. **Changed a device's config but the driver didn't notice**: the consumer on that link is the **driver** (it receives the metadata event and invalidates its local cache), not the data center — check the driver's logs for an event routed as `dc3.r.metadata.driver.<service>`.

## Further reading

- [Data Plane](./data-plane) — value-pipeline consumption, batching, persistence
- [Command Plane](./command-plane) — command state machine, TTL, dead-letter policy
- [Alarms & Notifications](../operation/alarms) — alarm-domain tables and the notification chain
- [Services & Topology](./services) — the synchronous counterpart (gRPC facades)
