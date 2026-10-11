---
title: CAN Bus Driver
---

# CAN Bus Driver

`dc3-driver-can` connects CAN bus devices to IoT DC3: joining the bus as a node, it listens for frames matching a given
CAN ID on a SocketCAN interface and parses them into readings per each [Point](../introduction/concepts/point)
configuration, optionally sends a "request" frame before reading the "response", and writes values via command frames.
After reading this page you can configure the driver and point attributes for a CAN device and tell which behaviors are
wired up versus still skeleton.

## Protocol background

CAN (Controller Area Network) is a fieldbus used heavily in automotive and industrial automation. In
the [four-layer IoT architecture](../foundations/fieldbus) it sits at the **network layer** — it defines how devices
reliably exchange frames over a shared bus.

The biggest difference between CAN and master/slave protocols like Modbus is that CAN is a **broadcast + filter-by-ID**
publish/subscribe model:

- Nodes do not communicate point-to-point by address — they broadcast frames tagged with a **CAN ID** (identifier) onto
  the bus; every node sees them, and each receiver filters by the CAN IDs it cares about.
- A single frame carries up to **8 bytes** of payload; the physical quantity you want is sliced out of those 8 bytes by
  offset, length, and byte order.
- Standard frames use an **11-bit** CAN ID, extended frames a **29-bit** CAN ID; the two are distinguished by the
  frame-format flag.
- There is no central poller, which suits multi-receiver, event-driven scenarios naturally: a value is sent when it
  changes, and whoever cares receives it.

Typical uses include vehicle ECUs, battery management systems (BMS), servo drives, all kinds of sensor nodes, and a
growing number of industrial embedded controllers. On Linux a CAN device usually appears as a **SocketCAN** network
interface (e.g. `can0`) through which applications send and receive frames — this driver works on top of that interface.

::: info Where CAN sits in the IoT network layer
CAN solves "how nodes on the same bus exchange frames," which belongs to the fieldbus (network layer) domain. It stands
alongside Modbus, Profibus, BACnet, and others; for how these protocols trade off within the four-layer architecture,
see [Fieldbus and protocols](../foundations/fieldbus).
:::

## Attribute configuration

A CAN device is configured across three layers: device-level `driver-attribute` (interface, bitrate, frame format),
point-level `point-attribute` (CAN ID, byte slicing, optional request frame), and `command-attribute` on writable
points (write target and frame-data template). The tables below come from the driver's `application.yml`; read the prose
to understand what each does, then fill the values from the table.

### Driver attributes (device-level `driver-attribute`)

When onboarding a CAN device, fill these [attributes](../introduction/concepts/attribute-config) on
the [Device](../introduction/concepts/device). `interfaceName` points to the SocketCAN interface name on the Linux host
where the driver process runs and is required (everything else builds on it); `bitrate` and `frameFormat` describe the
bus's physical and frame characteristics and must match the device.

| Attribute    | code            | Type   | Default    | Description                                           |
|--------------|-----------------|--------|------------|-------------------------------------------------------|
| Interface    | `interfaceName` | STRING | `can0`     | SocketCAN interface name the driver sends/receives on |
| Bitrate      | `bitrate`       | INT    | `500000`   | CAN bus bitrate (bps), must match the bus             |
| Frame Format | `frameFormat`   | STRING | `STANDARD` | Frame format: `STANDARD`(11bit) or `EXTENDED`(29bit)  |

### Point attributes (`point-attribute`)

Fill these on each [Point](../introduction/concepts/point) to be read. The first five decide "which frame to match and
which bytes of the payload to take"; `dataOffset`/`dataLength` are already applied to slicing, while the parsing by
`dataFormat`/`byteOrder` is not wired up yet (see the warning below). The last two, `requestCanId`/`requestData`,
are an optional "request-then-respond" mechanism — leave them empty for purely passive listening.

| Attribute      | code           | Type   | Default  | Description                                      |
|----------------|----------------|--------|----------|--------------------------------------------------|
| CAN ID         | `canId`        | STRING | (empty)  | CAN identifier to match (hex, no `0x`)           |
| Data Offset    | `dataOffset`   | INT    | `0`      | Starting byte offset within the frame payload    |
| Data Length    | `dataLength`   | INT    | `1`      | Number of bytes to read from the offset          |
| Data Format    | `dataFormat`   | STRING | `INT`    | Parse format: `INT`/`UINT`/`HEX`                 |
| Byte Order     | `byteOrder`    | STRING | `LITTLE` | Byte order for multi-byte values (e.g. `LITTLE`) |
| Request CAN ID | `requestCanId` | STRING | (empty)  | CAN ID of an optional request frame              |
| Request Data   | `requestData`  | STRING | (empty)  | Payload of the optional request frame (hex)      |

::: tip Request-driven reads
Many CAN devices only answer with data after receiving a "request" frame. In the source, the driver sends a request via
`cansend` before reading (of the form `cansend can0 <requestCanId>#<requestData>`) only when **both** `requestCanId` and
`requestData` are non-empty, then listens for the response frame matching `canId`; leave both empty to passively listen
for frames the bus broadcasts periodically.
:::

::: warning dataFormat / byteOrder are not yet used in parsing (dataOffset / dataLength already slice)
Per the source, after `read()` captures the frame via `interfaceName`, `canId`, and `requestCanId`/`requestData`, it
slices `dataOffset` / `dataLength` bytes out of the payload and returns them as a contiguous hex string; but
`dataFormat` and `byteOrder` are not yet applied on the read path to convert/sort bytes (a skeleton TODO) — whether you
fill `INT`/`UINT` or `HEX`, you always get the hex literal of that slice. The config keys are in place; behavior is
subject to the eventual implementation.
:::

### Write command attributes (`command-attribute`)

`application.yml` declares `canId` and `data` under `command-attribute` (`data` defaults to `${value}`), intending the
write command to carry a frame-data template.

::: warning The `data` template does not take effect yet (skeleton TODO)
Per the source, `write()` reads `canId` and `data` only from the **point attributes** (`pointConfig`):
`canId = getConfigValue(pointConfig, "canId", "")`, `data = getConfigValue(pointConfig, "data", "")`. But
`point-attribute` has **no** `data` (it is declared only under `command-attribute`), and `command-attribute` is passed
only through `DriverCommand.execute(commandConfig, …)` — which the CAN driver does not override (it uses the default
empty implementation). So the write path never reads `command-attribute`. As a result `data` is always the empty
default, `frameData` is always empty, the `${value}` template is never rendered, and `cansend` emits an empty payload (
of the form `cansend can0 <canId>#`). Like `dataFormat`/`byteOrder`, this is a skeleton TODO; dispatched write values
do not actually land in the frame payload today.
:::

| Attribute | code    | Type   | Default    | Description                                                                                                                   |
|-----------|---------|--------|------------|-------------------------------------------------------------------------------------------------------------------------------|
| CAN ID    | `canId` | STRING | (empty)    | CAN identifier to write to (hex)                                                                                              |
| Data      | `data`  | STRING | `${value}` | Frame-data template (by design rendered from the command argument via `${value}`; not wired up today — see the warning above) |

### Collection and health

- **Collection cycle**: the `read` schedule defaults to cron `0/30 * * * * ?` (capture one round of frames every 30
  seconds). The driver also has a `custom` schedule defaulting to cron `0/5 * * * * ?`, but the CAN driver's
  `schedule()` is an empty implementation, so no custom task is attached.
- **Health / online**: device health check defaults to cron `0/15 * * * * ?` with a `45 second` lease timeout — the
  driver uses `ip link show <interfaceName>` to determine whether the interface exists (exit code 0 means online);
  see [Device](../introduction/concepts/device) for the online-state mechanism.

::: details Minimal onboarding example
Onboard a node on `can0` that periodically broadcasts temperature with CAN ID `123`:

1. Create a [Device](../introduction/concepts/device) with `CAN Bus Driver`, set driver attributes `interfaceName=can0`,
   `bitrate=500000`, `frameFormat=STANDARD`.
2. Add a temperature [Point](../introduction/concepts/point) (`READ_ONLY`) to
   the [Profile](../introduction/concepts/profile) bound to the device, with point attributes `canId=123`,
   `dataOffset=0`, `dataLength=2`, `dataFormat=INT`, `byteOrder=LITTLE`, leaving `requestCanId`/`requestData` empty (
   passive listening).
3. Start the driver; the reading appears in [PointValue](../introduction/concepts/point-value) within 30 seconds.
   :::

## Troubleshooting

- **The driver must run on Linux with `can-utils` installed**. Low-level read/write relies on `candump`/`cansend`, the
  health check relies on `ip link show`, and an available SocketCAN interface is required. Commands run through `sh -c`:
  on macOS/Windows or without `can-utils`, `candump` produces no output, so `read()` throws a `No CAN frame received`
  read exception (`ReadPointException`) via the `output.isEmpty()` check; on the write side a missing `cansend` surfaces
  as a `WritePointException` through `executeCommand`'s exit code/timeout, and the device stays offline.
- **Device stays offline**. The health check is effectively the exit code of `ip link show <interfaceName>`: a wrong
  interface name, an interface that is not `up`, or a process lacking permission to access it all produce a non-zero
  exit code and an offline verdict. First run `ip link show can0` manually on the host to confirm the interface exists
  and is UP.
- **Getting `No CAN frame received`**. `candump` captures a single frame with `timeout 3`; if no frame matching `canId`
  arrives within 3 seconds it throws a read exception. Check: wrong `canId` (case/radix), `frameFormat` not matching the
  device's actual frame format (11/29-bit), or the device requiring a request frame first — for the last, configure
  `requestCanId`/`requestData`.
- **CAN ID notation must be correct**. Fill `canId`/`requestCanId` in hex the way `can-utils` expects, **without a `0x`
  prefix** (e.g. `123` for standard frames; the 29-bit hex literal for extended frames). A prefix or decimal value will
  fail to match any frame.
- **Bitrate / frame format mismatch**. `bitrate` and `frameFormat` must match the bus and the device; a wrong bus
  bitrate means the whole bus receives no frames, showing up as persistent `No CAN frame received`.
- **Write has no effect**. The write path is not wired up today: `write()` reads `data` from the point attributes, but
  `data` is declared only under `command-attribute` and `execute()` is not implemented, so `data` is always empty,
  `${value}` is never rendered, and `cansend` emits an empty-payload frame (`cansend can0 <canId>#`) — the device
  receives no payload. This is a skeleton TODO, not a configuration issue. You can still confirm the target `canId` is
  correct and the point is writable (`rwFlag`).

## How it lands in IoT DC3

- **`dc3.driver.code`**: `CanDriver` (driver name `CAN Bus Driver`, type `DRIVER_CLIENT`, actively sends/receives frames
  on the bus). This is a stable routing identifier and must not be changed casually.
- **Read**: ✓ supported. `read()` captures a single frame matching `canId` via `candump`, slices the payload by
  `dataOffset`/`dataLength` (returned as a contiguous hex string), optionally sending a request frame first via
  `cansend`.
- **Write**: stub / partial. `write()` already shells out to `cansend` to put a frame on the bus, but the `data`
  frame-data template is not wired up today (`data` is read from `pointConfig` yet declared only under
  `command-attribute`, and `execute()` is not implemented), so `${value}` is never rendered and the frame currently
  emitted has an empty payload (see the "Write command attributes" warning above).
- **Subscribe**: — not supported. In this driver CAN is a request-response, scheduled active read, not a subscription
  push wired into DC3. The above matches the CAN row (✓ read / — write / — subscribe) in
  the [driver capability matrix](./matrix).

::: warning Implementation status: skeleton (read works, write not wired), backed by can-utils
This driver is a starting template. `read()`/`write()` use `ProcessBuilder` to shell out to the Linux `can-utils`
tools (`candump`/`cansend`), and `health()` checks the interface via `ip link show` — these call paths actually execute
on a Linux host with can-utils and a real SocketCAN interface, rather than throwing "not implemented." But parts are
still not wired up:

- **Read path**: `dataOffset`/`dataLength` are already applied to byte slicing (returned as a contiguous hex string);
  `dataFormat`/`byteOrder` are not yet applied to type conversion or byte order — the value is always the hex literal
  of the slice.
- **Write path**: the `data` frame-data template rendering is not actually wired up — `data` is read from `pointConfig`
  but declared only under `command-attribute`, and `execute()` is not implemented, so `${value}` is never rendered and
  the frame currently emitted has an empty payload. Like `dataFormat`, this is a skeleton TODO; **do not treat write as
  able to deliver values yet.**
- A native SocketCAN JNI bridge was evaluated but **deliberately not adopted**: the per-call process startup cost is
  acceptable for this driver's low-frequency industrial sampling profile, and dragging JNI cross-compilation into the
  build is not worth it (per the class Javadoc). Byte-order/format parsing and write-template wiring must still be
  completed before production use.
  :::

## Further reading

- [Driver overview](./index) — navigation and categories for all drivers
- [Driver capability matrix](./matrix) — read/write/subscribe capabilities at a glance
- [Device onboarding](../operation/device-onboarding) — a full onboarding walkthrough
- [Fieldbus and protocols](../foundations/fieldbus) — the network layer where CAN sits and fieldbus selection
