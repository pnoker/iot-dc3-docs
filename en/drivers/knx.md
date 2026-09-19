---
title: KNX Driver
---

# KNX Driver

`dc3-driver-knx` connects to KNX (ISO/IEC 14543-3) installations through a KNX IP gateway. It maintains one tunneling link per gateway device and reads/writes group addresses as boolean, unsigned, float, or control values.

## Protocol background

KNX is the standard for home and building automation. Group addresses link sensors and actuators; an IP gateway exposes the bus over KNXnet/IP tunneling. This driver reads group values by datapoint type and writes them back through the gateway.

- **Driver name / code**: `KNX Driver` / `KnxDriver`
- **Type**: `DRIVER_CLIENT (tunneling to a KNX IP gateway)`
- **Underlying library**: Calimero (`calimero-core`)

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Remote Host | `remoteHost` | STRING | (empty) | KNX IP gateway address |
| Remote Port | `remotePort` | INT | `3671` | KNX IP gateway port |
| Local Host | `localHost` | STRING | (empty) | Local bind address (optional) |
| Use NAT | `useNat` | BOOLEAN | `false` | Enable NAT mode for tunneling |
| Device Address | `deviceAddress` | STRING | `0.0.0` | Local KNX individual address |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Group Address | `groupAddress` | STRING | (empty) | KNX group address, e.g. 1/2/3 |
| Data Type | `dataType` | STRING | `BOOL` | BOOL, UINT, FLOAT, or CONTROL |
| DPT | `dpt` | STRING | (empty) | Datapoint type for UINT reads/writes, e.g. 5.001 |

### Command attributes (`command-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Group Address | `groupAddress` | STRING | (empty) | KNX group address for commands |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?`.
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ | |
| Write | ✓ | |
| Subscribe | — | |

::: info Implementation status: complete

`KnxDriverCustomServiceImpl` caches a `KNXNetworkLink` + `ProcessCommunicator` per device, and a device metadata UPDATE/DELETE event closes the link.
:::

## Minimal onboarding example

1. Create a Device using `KNX Driver`, set `remoteHost=<gateway-ip>` and `deviceAddress=1.1.0`.
2. Add a Point (`READ_ONLY`) with `groupAddress=1/2/3` and `dataType=BOOL`.
3. Start the driver; the group value is polled on the collection cycle.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
