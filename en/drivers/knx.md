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

## Troubleshooting

Failures fall into three buckets: the tunnel cannot be established (network/gateway side), attribute parsing fails (configuration side), and mid-flight read/write errors (bus side). Each item below maps to a concrete log line.

::: warning One device opens one tunnel — mind the gateway's tunnel limit
The driver keeps one KNXnet/IP tunneling link per [Device](../introduction/concepts/device) (i.e., per `remoteHost`). Most KNX IP gateways support only a few concurrent tunnels — interface-type devices often just one — so pointing several devices at the same gateway exhausts it and the extra link fails to open. Check the gateway's tunnel capacity before sharing it.
:::

- **Reads/writes throw `Failed to open KNX link`**: the tunnel could not be established — `remoteHost` / `remotePort` (default `3671`) unreachable, UDP `3671` blocked by a firewall (KNXnet/IP tunneling runs over UDP), or the gateway out of tunnels; note that an empty `remoteHost` makes the driver fall back to `192.168.0.100`. Check the `host:port` in the error to confirm the actual target and network reachability, then tunnel usage on the gateway.
- **`Invalid KNX group address`**: `groupAddress` is not a valid group address. Use the three-level `main/middle/sub` form (e.g., `1/2/3`); surrounding whitespace is trimmed by the driver, but the segment count and separators must be right.
- **`Required attribute 'xxx' is missing`**: a required value is absent — `remoteHost` missing on the device, `groupAddress` missing on the point, or `dpt` missing when writing a UINT point. Fill them in per the tables above.
- **UINT reads/writes fail**: `dpt` is missing or not a valid datapoint type. Reads go through `readUnsigned(group, dpt)`, writes use the same addressing, and **`dpt` is mandatory on the write path** — the write fails outright when it cannot be read. Use the `major.minor` form, e.g., `5.001` for percent.
- **`dataType` typos don't error, but you read 0/1**: the dispatch only recognizes `UINT` / `FLOAT` / `CONTROL` (case-insensitive); everything else — misspellings included — silently degrades to BOOL.
- **Writes throw `KNX write failed` with a parse error**: the command value doesn't match `dataType`. UINT expects an integer, FLOAT a decimal, BOOL/CONTROL `true` or `false`; anything unparseable fails.
- **Reads keep timing out**: a KNX group read is request-response — the driver sends a group read and waits for a reply; if no device answers that group address, it times out. Confirm in ETS that something answers group reads on that address (usually an actuator), or pick an address that does.
- **Reads/writes go quiet after a failure**: the SDK backs off per device — one failure suppresses retries for 1 second, consecutive failures double the delay up to 5 minutes, and a single success resets it. The silence is backoff doing its job, not the problem going away.
- **Device flaps offline/online**: any read or write exception invalidates that device's link, which is rebuilt on the next access; health only checks `isOpen()`. An occasional flap is normal — frequent ones point back to item one (network, gateway load).

## How it lands in IoT DC3

In the platform, one [Device](../introduction/concepts/device) maps to one KNX IP gateway: the driver builds a KNXnet/IP tunnel from the device attributes `remoteHost` / `remotePort` (`localHost` optionally pins the local bind address, `useNat` copes with NAT, `deviceAddress` is the tunnel endpoint's KNX individual address; the medium is fixed TP1) and wraps the link in a `ProcessCommunicator` for group-address reads/writes. Links are cached per `deviceId` in-process and are not pre-opened at startup — whichever of read, write, or health check arrives first triggers the connect. When the device is updated or deleted in the platform, the metadata event closes its link; the next access rebuilds it with the fresh configuration.

Both reads and writes consume point attributes only: `groupAddress` locates the group, `dataType` (default `BOOL`) picks the channel — BOOL via boolean, UINT via the `dpt`-addressed unsigned path (`dpt` is mandatory when writing), FLOAT via the float path, CONTROL via the control bit; the command value is parsed per `dataType` and written back to the group address. The command attribute `groupAddress` declared in the yml belongs to the command-execution path, which writes do not go through — this driver implements no custom command execution. Any read/write failure invalidates the device's link (rebuilt on the next access) while the SDK backs off exponentially per device (1 s, doubling, 5 min cap); only a successful write is echoed back to the platform as a [point value](../introduction/concepts/point-value).

Integration with the platform centers on group addresses: the collection schedule (default every 30 seconds) issues a group read per point and wraps the reply into a point value, and a write command becomes one group write that actuators act on. The KNX bus itself offers group-write events to subscribe to, but this driver registers no bus listener — its data plane is polled group reads, consistent with the subscribe column being `—` in the [driver capability matrix](./matrix).

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
