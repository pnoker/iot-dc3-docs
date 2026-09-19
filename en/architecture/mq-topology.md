---
title: Message Bus Topology
---

# Message Bus Topology

The platform's loose coupling rides on a single RabbitMQ bus: most of the asynchronous traffic between services flows through a set of topic exchanges named by business domain. This page is the **full inventory** — every exchange, queue, routing-key prefix, TTL, and dead-letter destination, plus who publishes and who consumes. When troubleshooting, open the RabbitMQ management page (`15672`), find the backlog, and this table tells you which link is stuck.

> You are here: the data and command plane pages cover the two main pipelines in depth; this page is the **ledger** — including register, state, alarm, metadata, and event domains not expanded elsewhere. Names come straight from `RabbitConstant.java`; the code is authoritative.

## Naming conventions

- Exchanges: `dc3.e.<domain>`; queues: `dc3.q.<domain>[.<sub>]`; routing keys: `dc3.r.<domain>.<prefix>`.
- Queue names with a **dot suffix** (e.g. `dc3.q.point_command.`) are **per-consumer prefixed queues** — each driver node owns its own queue (e.g. `dc3.q.point_command.dc3-driver-mqtt`), and commands route by node.
- The optional system property `dc3.rabbit.tag` prefixes every name (empty by default) — use it to isolate stacks sharing one RabbitMQ.

## Full inventory

### Values and commands (details in the data/command plane pages)

| Exchange | Queue | Routing | Who → whom | Notes |
|----------|-------|---------|------------|-------|
| `dc3.e.value` | `dc3.q.value.point` | `dc3.r.value.point.*` | driver → data center | The point-value pipeline; TTL 7 days |
| `dc3.e.point_value_dead` | `dc3.q.point_value_dead` | — | value-queue dead letter | Landed when consumers reject without requeue |
| `dc3.e.point_command` | `dc3.q.point_command.<node>` | `dc3.r.point_command.<node>` | data center → target driver | Point read/write commands; queue TTL 30s (expiry dead-letters) |
| `dc3.e.point_command_dead` | `dc3.q.point_command_dead` | — | command dead letter | Expired / retry-exhausted commands |
| `dc3.e.point_command_result` | `dc3.q.point_command_result` | `dc3.r.point_command_result.<node>` | driver → data center | Command receipts; TTL 60s |

### Custom commands and events

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.command` | `dc3.q.command.<node>` | data center → target driver | Device-level custom commands (`CommandCallDTO`; a separate namespace from point commands) |
| `dc3.e.command_result` | `dc3.q.command_result` | driver → data center | Custom-command receipts |
| `dc3.e.command_dead` | `dc3.q.command_dead` | command dead letter | |
| `dc3.e.event` | `dc3.q.event.<tenant>` | driver/data center → data center | Event reports (`dc3_event_history`); can trigger alarms |

### Registration and metadata

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.register` | `dc3.q.register.up` | driver → data center | Driver online registration (attribute definitions ride along) |
| | `dc3.q.register.down.<node>` | driver → data center | Driver shutdown notice (one queue per node) |
| `dc3.e.metadata` | `dc3.q.metadata.driver.<node>` | manager → data center | Metadata-change notices (driver-scoped cache invalidation) |

### State and timeouts

| Exchange | Queue | Notes |
|----------|-------|-------|
| `dc3.e.state` | `dc3.q.state.driver` / `dc3.q.state.device` | Driver/device liveness heartbeats (source of the `dc3_entity_state` lease) |
| `dc3.e.state_timeout_delay` | `dc3.q.state_timeout.driver.45s` (TTL 45s) | Delay queue: driver-heartbeat expiry detection |
| `dc3.e.state_timeout_check` | `dc3.q.state_timeout.driver_check` | The judge-offline action after expiry |
| same | `dc3.q.state_timeout.device_scan_tick.10s` (10s) | Periodic device-scan tick |
| same | `dc3.q.state_timeout.device_scan` | Device-scan execution queue |

### Alarms and notifications

| Exchange | Queue | Who → whom | Notes |
|----------|-------|------------|-------|
| `dc3.e.alarm` | `dc3.q.alarm.driver` / `dc3.q.alarm.device` | data center (alarm engine) → itself | Alarm creation (`dc3_entity_alarm`) and rule-evaluation entry |
| | `dc3.q.notify.task` (TTL 24h) | alarm → notification sender | Notification delivery tasks; channels (email/SMS/webhook) in [Alarms & Notifications](../operation/alarms) |

### MQTT bridge

| Exchange | Queue | Notes |
|----------|-------|-------|
| `dc3.e.mqtt` | `dc3.q.mqtt` | Internal MQTT message bridge (forwarding between the MQTT driver and the bus) |

## Troubleshooting with this table

1. **Which queue is backed up**: RabbitMQ management → Queues → sort by `messages ready`;
2. Match "who consumes" above — a `dc3.q.value.point` backlog means the data center consumes slowly (batch thresholds / concurrency); a `dc3.q.point_command.<node>` backlog means that driver is offline (nobody consumes; dead-letters after 30s);
3. **Dead-letter queues have messages**: something was rejected or expired — check the consumer's logs for the `basicReject`/`basicNack` reason in that domain;
4. Queue missing: the consumer never registered (a driver's prefixed queues are created only once it's online).

## Further reading

- [Data Plane](./data-plane) — value-pipeline consumption, batching, persistence
- [Command Plane](./command-plane) — command state machine, TTL, dead-letter policy
- [Alarms & Notifications](../operation/alarms) — alarm-domain tables and the notification chain
- [Services & Topology](./services) — the synchronous counterpart (gRPC facades)
