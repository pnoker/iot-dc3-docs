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

::: info Implementation status: available
The `io.stepfunc:dnp3` native stack loads and the read/write path is implemented.
:::

::: warning Native stack requires outstation commissioning
On-wire behaviour must still be commissioned against a real outstation in the target environment before production use.
:::


## Troubleshooting

With DNP3, first separate "the link never came up" from "the link is up but the point is missing" — they fail with different errors.

::: warning The device can only come online after the first collection cycle
The connection is created on the first `read()` or `write()`; the health check only reads the connection map and never creates one, so a freshly started driver shows every device offline — that is expected. Wait for the default 30-second collection cycle to run and the channel state to reach CONNECTED before judging; the `DNP3 client state changed` log line tracks the state transitions.
:::

- **Symptom: `Required attribute 'host' is missing`** → cause: `host` defaults to an empty string in the yml, is validated as required before connecting, and an empty value raises a `ConnectorException` directly. Check: fill the device attribute `host` with the outstation address.
- **Symptom: `DNP3 poll timed out`, with `DNP3 poll failed` in the log** → cause: an exception on the poll future only logs a warn; the latch waiting for the response fragment then times out after 5 seconds. Unreachable TCP, a wrong port, or mismatched master/outstation link-layer addresses (the outstation silently drops frames addressed elsewhere) all look like this. Check: verify connectivity with `telnet <host> 20000`, then confirm `masterAddress` / `outstationAddress` match the outstation configuration.
- **Symptom: `DNP3 point not found`** → cause: the poll succeeded but the point is not in the cache. Values are cached by "point type + index" with exact string matching on `pointType` — a typo, wrong case, a type the outstation does not report, or a `pointIndex` outside the outstation's point table all come up empty. Check: compare `pointType` character by character against the value list, and `pointIndex` against the outstation's static point table.
- **Symptom: `DNP3 write unsupported point type`** → cause: writes only accept the point attribute `pointType` set to `BINARY_OUTPUT` or `ANALOG_OUTPUT`; anything else throws immediately. `write()` reads the point attributes, so changing `pointType` in the command attribute table has no effect. Check: set the writable point's `pointType` to an output type.
- **Symptom: `DNP3 write failed` (value parsing or timeout)** → cause: analog writes parse the command value as a 16-bit integer, so a non-integer raises a `NumberFormatException`; a command that does not finish within 5 seconds times out. Check: send integers for `ANALOG_OUTPUT` points; on timeout, confirm the outstation supports `DIRECT_OPERATE` and the link is reachable.
- **Symptom: writing `1` or `on` to a binary output always trips it off** → cause: boolean outputs parse with `Boolean.parseBoolean` — only the string `true` maps to `LATCH_ON`, everything else is treated as false and goes `LATCH_OFF`. Check: use `true` / `false` as command values.

## How it lands in IoT DC3

DNP3's canonical shape is a master talking over TCP to several outstations (RTUs, protection relays or protocol gateways), each identified by link-layer source and destination addresses. This driver is the master: one outstation is one [Device](../introduction/concepts/device) in the platform, `host` / `port` name the TCP target, and `masterAddress` / `outstationAddress` are the link-layer addresses; the driver maintains one "native Runtime + TCP channel + association" bundle per `deviceId`, created on the first read or write. The channel carries a state listener that logs every transition, and the health check reports online when the state is `CONNECTED`.

The read path: the scheduler calls `read()` per point every 30 seconds by default, and each call issues a class 0/1/2/3 integrity poll to the outstation. The response flows through a `ReadHandler` that caches values by "point type + index" in the device's connection cache; once the fragment completes, the value is fetched with the point attributes `pointType` / `pointIndex` — whatever type and index the outstation reports is exactly what you can configure, and `BINARY_OUTPUT` / `ANALOG_OUTPUT` points read the output status objects. The write path uses `DIRECT_OPERATE`: a point with `pointType=BINARY_OUTPUT` sends a G12V1 latch on/off (value parsed as boolean), `ANALOG_OUTPUT` sends a G41V1 16-bit integer. The command attributes (`pointIndex` / `pointType`) are registered in the yml, but `write()` still reads the point attributes; `execute()` is not implemented, so custom commands return the interface default — an empty map.

The connection lifecycle belongs to the native stack: the link error mode is `CLOSE`, reconnection pacing after a drop is governed by the native stack's connect strategy, the driver code stays out of it and never tears the channel down on read/write failures; only a device delete or update metadata event closes the whole bundle. Online state and lease work like every other driver: the health check defaults to every 15 seconds with a 45-second lease timeout — see [Device](../introduction/concepts/device). Time synchronization is covered by the driver feeding the current UTC time to the protocol stack; unsolicited responses are not processed, the driver registers no event attributes, matching the "Subscribe —" row in the capability matrix.

## Minimal onboarding example

1. Create a Device using `DNP3 Driver`, set `host=<outstation-address>` and `port=20000`.
2. Add a Point with `pointIndex=0` and `pointType=BINARY_INPUT`.
3. Commission against a real outstation before production use.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
