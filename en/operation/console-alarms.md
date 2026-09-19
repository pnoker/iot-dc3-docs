---
title: Console · Alarms
---

# Console · Alarms

Everything alarm-related in the UI lives under **Settings → Alarm Configuration**: one overview dashboard plus seven management sub-pages, and three source-scoped event views. This page walks them in the order "view alarms → configure rules → wire channels"; the data model (`dc3_entity_alarm`, the source/type dimensions, confirmation semantics) is in [Alarms & Notifications](./alarms).

> You are here: data is flowing, device state is healthy, and now the "when something breaks, reach a human" chain needs configuring. Table structures and APIs are on the alarms page; this page is about the UI.

## Overview dashboard

**Alarm Configuration → Overview** is the on-call home screen:

- **Unconfirmed-age distribution** (aging) — unconfirmed alarms bucketed <1h / 1–4h / 4–24h / >24h; stale items stand out immediately;
- **MTTA / MTTR** — mean time to acknowledge and to repair, measuring response quality;
- **Alarm type pie**, **event trend chart**, **activity heatmap**;
- **Storm sources / flapping sources / correlation** — locate which device is flooding and which alarms share a root cause;
- Every source block has an **unconfirmed quick filter** that jumps to its event view with `confirmFlag=0` applied.

## Three event views: device / driver / point

The same `dc3_entity_alarm` table is sliced into three views by source (**device / driver / point**), with identical columns and filters: by type, confirmation state, time window; row-level **confirm** (maps to `POST /dashboard/alert/confirm`) and detail. For bulk handling, locate the storm source in the overview first, then come here to confirm.

## Alarm rules

The **Alarm Rules** page maintains `dc3_rule`: what triggers an alarm (threshold / state change / event match) and its level (LOW/MEDIUM/HIGH/CRITICAL). Saved rules are evaluated by the data center's alarm engine on the value pipeline — no service restart needed; the next batch of values picks them up.

## Notification chain: policy → template → channel → binding

How notifications "reach a human" is decided by four pages, configured in order:

| Sub-page | Governs | Table |
|----------|---------|-------|
| Notify policy | Whose alarms, which levels, how often (anti-flood) | `dc3_notify` |
| Message template | What the notification text looks like (variable substitution) | template fields |
| Notify channel | How it's sent (email / SMS / webhook) and each channel's connection params | `dc3_notify_channel` |
| Channel binding | Which policy goes through which channel | `dc3_notify_channel_bind` |

Data flow: alarm raised → matches a policy → template rendered → delivery task queued to `dc3.q.notify.task` (TTL 24h) → channel sends → **send history** records it.

## Run state and history

- **Alarm run state**: each rule's current state machine (`dc3.rule_state`) — whether matched, last trigger time;
- **Alarm history**: archive query over all alarms including confirmations; the delivery audit for notifications (`dc3_notify_history`) is queried on the notification side.

## UI actions mapped to APIs

| UI action | API (via gateway, data center) | Semantics |
|-----------|-------------------------------|-----------|
| Event view query | `POST …/dashboard/alert/page` | Paginated by source/type/confirm state |
| Confirm / unconfirm | `POST …/dashboard/alert/confirm?source=&id=` | Row-level (returns true when the row updated) |
| Overview stats | `GET …/dashboard/alert/stats` / `…/alert/latest` | Source of the summary cards |

## Further reading

- [Alarms & Notifications](./alarms) — data model, the five source classes, notification chain details
- [Observability](../guide/observability) — platform monitoring beyond alarms (Prometheus/Grafana)
- [Message Bus Topology](../architecture/mq-topology) — where `dc3.e.alarm` / `dc3.q.notify.task` sit on the bus
