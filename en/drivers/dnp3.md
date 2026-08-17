---
title: DNP3 Driver
---

# DNP3 Driver

`dc3-driver-dnp3` targets DNP3 (IEEE 1815) masters for utility automation. The protocol stack is provided by the `io.stepfunc:dnp3` native FFI binding (Rust `dnp3` runtime with per-platform native libraries bundled in the jar).

## Protocol background

DNP3 (IEEE 1815) is the predominant SCADA protocol in North American utilities. A master connects to an outstation, polls event classes, and synchronizes a local database. This module implements the full master path: one native runtime, TCP channel, and association per outstation; class 0/1/2/3 integrity polling through a `ReadHandler` that caches point values by index; and `DIRECT_OPERATE` commands for binary and analog outputs.

- **Driver name / code**: `DNP3 Driver` / `Dnp3Driver`
- **Type**: `DRIVER_CLIENT (master to an outstation)`
- **Underlying library**: Step Function I/O `io.stepfunc:dnp3` (native FFI binding)

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Host | `host` | STRING | (empty) | DNP3 outstation address |
| Port | `port` | INT | `20000` | DNP3 TCP service port |
| Master Address | `masterAddress` | INT | `1` | Master link-layer address |
| Outstation Address | `outstationAddress` | INT | `1` | Outstation link-layer address |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Point Index | `pointIndex` | INT | `0` | DNP3 point index within the selected point type |
| Point Type | `pointType` | STRING | `BINARY_INPUT` | BINARY_INPUT, ANALOG_INPUT, COUNTER, DOUBLE_BIT_BINARY_INPUT, BINARY_OUTPUT, or ANALOG_OUTPUT |

### Command attributes (`command-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Point Index | `pointIndex` | INT | `0` | DNP3 point index for commands |
| Point Type | `pointType` | STRING | `BINARY_OUTPUT` | BINARY_OUTPUT or ANALOG_OUTPUT for commands |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?`.
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ | Integrity poll cached per point |
| Write | ✓ | DIRECT_OPERATE for binary/analog outputs |
| Subscribe | — | |

::: info Implementation status: available :::

::: warning Native stack requires outstation commissioning
The `io.stepfunc:dnp3` native stack (Rust `dnp3` runtime with per-platform native libraries) loads and the read/write path is implemented, but on-wire behaviour must still be commissioned against a real outstation in the target environment. :::

## Minimal onboarding example

1. Create a Device using `DNP3 Driver`, set `host=<outstation-address>` and `port=20000`.
2. Add a Point with `pointIndex=0` and `pointType=BINARY_INPUT`.
3. Commission against a real outstation before production use.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
