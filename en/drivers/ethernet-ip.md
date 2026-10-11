---
title: EtherNet/IP Driver
---

<script setup>
import EthernetIpDiagram from '../../.vitepress/theme/components/EthernetIpDiagram.vue'
</script>

# EtherNet/IP Driver

`dc3-driver-ethernet-ip` connects EtherNet/IP (CIP) Rockwell Allen-Bradley PLCs to IoT DC3: it targets **tag names**,
periodically reads PLC tag values, and supports commands that write values to tags. By the end of this page you will
understand how EtherNet/IP addresses data, how to fill the protocol attributes on a device and its points correctly, and
exactly where this driver's implementation currently stops.

> You are here: the "Rockwell PLC" onboarding side of field devices. To understand why industrial protocols are
> vendor-proprietary and where CIP sits in the network layer, start
> with [Industrial Buses & Protocols](../foundations/fieldbus).

## Protocol Background

EtherNet/IP (Ethernet Industrial Protocol) is an industrial Ethernet protocol that carries **CIP (Common Industrial
Protocol)** over standard TCP/IP. Maintained by ODVA, it is used mainly with Rockwell Allen-Bradley PLCs (such as
ControlLogix / CompactLogix) and the servos, drives, and I/O modules in that ecosystem. In factory automation it
belongs — alongside Siemens S7, Mitsubishi MELSEC, and Omron FINS — to the camp of vendor-led, mutually incompatible
proprietary protocols: pick a PLC brand and you are largely locked into its protocol.

The biggest difference between EtherNet/IP and a protocol like Modbus is the **addressing model**:

- **Modbus addresses by register** — you must know which holding register a value lives in (e.g. `40001`); the address
  is a raw number.
- **CIP addresses by tag name** — variables in the PLC project have names (e.g. `Motor_Speed`), and the driver
  reads/writes them directly by name through the CIP **Data Table Read/Write** services, with no concern for their
  physical address in controller memory.

This "access by name" model keeps addresses from drifting when the PLC program changes, but it also means the tag name
must match the PLC project verbatim.

In the four-layer IoT architecture, EtherNet/IP belongs to the industrial wired side of the **network layer**: it
solves "how a field device sends a data point out over Ethernet," sitting above the sensing layer (sensors/transducers)
and below the platform layer (IoT DC3 aggregation). The diagram below places CIP name-based addressing within a single
collection:

<EthernetIpDiagram lang="en" />

CIP does not rely on physical addresses, so a point carries a `tagName` rather than an offset; the driver decodes the
tag value the PLC returns by the type code in the CIP reply and unifies it as
a [PointValue](../introduction/concepts/point-value) sent upstream.

## Attribute Configuration

EtherNet/IP onboarding parameters come in two layers: **driver attributes (driver-attribute)** describe "which PLC,
which port and timeout" and are filled on the [device](../introduction/concepts/device); **point attributes (
point-attribute)** describe "which tag to read and, for writes, which type to encode as" and are filled on
each [Point](../introduction/concepts/point). Writable points add a **command attribute (command-attribute)**. The
defaults of all of these come from the driver's `application.yml`; for the three-layer origin
see [Attributes and Config](../introduction/concepts/attribute-config).

### Driver Attributes (device-level `driver-attribute`)

When onboarding an EtherNet/IP PLC, first state its network location on the device. `host` / `port` decide where TCP
connects, `slot` identifies the PLC's backplane slot (a multi-module rack needs this to locate the CPU), and `timeout`
bounds how long a single request waits.

| Attribute | code      | Type   | Default     | Description                                                   |
|-----------|-----------|--------|-------------|---------------------------------------------------------------|
| Host      | `host`    | STRING | `localhost` | PLC host address (IP or hostname)                             |
| Port      | `port`    | INT    | `44818`     | EtherNet/IP TCP port (standard 44818)                         |
| Slot      | `slot`    | INT    | `0`         | PLC backplane slot, locating the CPU module in the rack       |
| Timeout   | `timeout` | INT    | `5000`      | Request timeout (milliseconds), set as the socket `SoTimeout` |

::: info `slot` is encoded into the CIP connection path
`validate()` requires `host` / `port` / `slot`; when framing, `buildConnectionPath()` first writes the backplane port
segment (`0x01` + `slot`), then the ANSI extended symbol segment carrying the tag name, so the request is routed to the
CPU in that chassis slot. For multi-slot racks set `slot` to the controller's actual slot (single CPU in slot 0 keeps
the default).
:::

### Point Attributes (`point-attribute`)

Each collected point must state which tag to read and, **for writes**, which type to encode the value as — reads follow
the type code carried in the CIP reply instead (see the tip below).

| Attribute     | code           | Type   | Default | Description                                                           |
|---------------|----------------|--------|---------|-----------------------------------------------------------------------|
| Tag Name      | `tagName`      | STRING | (empty) | CIP tag name, e.g. `Motor_Speed`, must match the PLC project verbatim |
| Tag Type      | `tagType`      | STRING | `DINT`  | Write encoding type: `BOOL` / `SINT` / `INT` / `DINT` / `REAL` (reads ignore it; `STRING` reads decode but writes are rejected) |
| Element Count | `elementCount` | INT    | `1`     | Number of elements to read (for array tags)                           |

::: tip Reads decode by the reply type code; writes encode by `tagType`
**Read**: `parseTagValue()` ignores the configured `tagType` and decodes by the CIP type code in the Read Tag reply (
`BOOL`/`SINT`/`INT`/`DINT`/`REAL` all little-endian, `STRING` as ASCII text); unknown type codes fall back to the raw
hex. **Write**: `encodeTagValue()` / `mapTypeCode()` encode by the `tagType` you set, supporting `BOOL` / `SINT` /
`INT` / `DINT` / `REAL`; `STRING` writes are rejected (they need structured-type support — the driver throws
`...cannot be written atomically`). For writes, `tagType` must match the tag's actual type in the PLC, otherwise the
controller misreads the bytes; the Point's own data type
([Point](../introduction/concepts/point) `pointTypeFlag`) should correspond to it.
:::

::: warning `elementCount` is not consumed yet
`read()` calls `buildMrReadTagRequest()` with the element count hard-coded to `1`, so the configured `elementCount` has
no effect yet. Whole-array reads await completed implementation; for now reads are single-element only.
:::

### Command Attribute (`command-attribute`)

Writable points add a write-value template on the write command.

| Attribute    | code          | Type   | Default    | Description                                                                                       |
|--------------|---------------|--------|------------|---------------------------------------------------------------------------------------------------|
| Send Command | `sendCommand` | STRING | `${value}` | Write-value template, intended to be rendered from the command argument and encoded per `tagType` |

::: warning The `sendCommand` template is not consumed yet
`write()` takes the value passed in the command directly and encodes it per `tagType` (`encodeTagValue()`); it does not
go through the `sendCommand` template. This attribute is a reserved contract for now — template substitution is still to
be implemented.
:::

### Collection and Health

- **Collection cycle**: the `application.yml` baseline read cron is `0/30 * * * * ?` (read once every 30 seconds); the
  default-active `dev` profile overrides it in `application-dev.yml` to `0/5 * * * * ?` (every 5 seconds), so the
  out-of-the-box polling interval is 5 seconds.
- **Custom schedule**: `schedule.custom` is enabled in the yml (cron `0/5 * * * * ?`), but the current `schedule()`
  method body is empty and performs no custom logic.
- **Health / online**: device health check default cron `0/15 * * * * ?`, lease timeout `45 seconds` —
  see [Device](../introduction/concepts/device) for the online-state mechanism.

## Troubleshooting

EtherNet/IP onboarding failures mostly fall into two buckets: "cannot connect" and "the value read is wrong." Work
through them from the outside in.

::: warning Port or firewall: 44818 unreachable
EtherNet/IP explicit messaging runs over TCP `44818` (implicit I/O uses UDP `2222` separately, which this driver does
not touch). First confirm `host:44818` is reachable from the driver host (`telnet <host> 44818` or
`nc -vz <host> 44818`). Common causes: EtherNet/IP service not enabled on the PLC, network not routed, firewall blocking

44818. A failed connect in `getConnector()` throws `ConnectorException`; the log contains
       `EtherNet/IP connection failed`.
:::

::: warning tagName does not exist or case mismatches
CIP is addressed by name, so `tagName` must match the variable name in the PLC program **verbatim and case-sensitively**. This differs from Modbus `offset`: a wrong Modbus offset silently reads a different register, whereas a non-existent
CIP tag name fails the read outright and throws `ReadPointException`. When troubleshooting, go back to the PLC project
first to check the tag spelling and scope (controller-level vs program-level tags).
:::

::: warning A write-side tagType mismatch mis-encodes the value
Writes encode bytes strictly by the `tagType` you set and never probe the PLC for the real type: writing to a `REAL`
(float) tag configured as `DINT` encodes a 4-byte integer, which the PLC then misreads as a float. Reads are not
affected — they decode by the type code in the CIP reply. Confirm the actual type of each tag in the PLC project before
onboarding, and make the point's `pointTypeFlag` correspond.
:::

::: warning Timeout too short causes intermittent read failures
`timeout` is set as the socket `SoTimeout`, default `5000` ms. Under network jitter or high PLC load, too short a
timeout makes `readFully()` throw `SocketTimeoutException`, which triggers `invalidateConnector()` to drop and
reconnect. The symptom is periodic read failures and a flapping device online state. Raise `timeout` moderately, but
investigate network quality first.
:::

::: info Device shows online but no value is read
`health()` only checks whether the cached socket is `isConnected() && !isClosed()` — it does **no real protocol probe**.
So with TCP connected but the CIP session not actually established, the device may still show "online." To judge whether
data is really being collected, rely on whether the [PointValue](../introduction/concepts/point-value) updates, not on
the device online state alone.
:::

::: info Cannot locate the CPU in a multi-slot rack
`slot` is encoded into the CIP connection path (backplane port segment `0x01` + `slot`), so requests are routed to the
CPU in that slot. If it still cannot be reached, verify `slot` matches the controller's actual slot and that the rack
backplane configuration matches the project.
:::

## How It Lands in IoT DC3

- **dc3.driver.code**: `EthernetIpDriver` (a stable routing identifier — registration and message routing both rely on
  it, do not change it casually). Driver name `EtherNet/IP Driver`, type `DRIVER_CLIENT` (the driver actively connects
  to the PLC).
- **Read**: ✓ implemented. `read()` first registers a CIP session with `RegisterSession` (encapsulation command
  `0x00F0`), then fetches the tag value with a Read Tag (`0x4C`) unconnected message via `sendRRData` (`0x005F`).
- **Write**: ✓ implemented. `write()` sends a Write Tag (`0x4D`) over the same unconnected channel, encoding the value
  by the point's `tagType`.
- **Subscribe / push**: not supported. EtherNet/IP explicit messaging is request-response; this driver actively polls on
  the collection cycle and does not listen for device-initiated pushes.

Aligned with the [Driver Capability Matrix](./matrix): in the matrix EtherNet/IP is marked read ✓ / write ✓ /
subscribe `—`, status "Usable".

::: info Implementation bounds (unconnected messaging, no connection-oriented I/O)
CIP framing in `EthernetIpDriverCustomServiceImpl` is a full implementation (24-byte encapsulation header,
`RegisterSession`, `sendRRData` unconnected messages, Read Tag `0x4C` / Write Tag `0x4D` all in place), with these
bounds:

- **Unconnected messaging only**: connection-oriented I/O via `ForwardOpen` is deliberately out of scope for this
  build (unconnected messages already cover tag reads and writes);
- `STRING` tag writes are rejected (they need structured-type support); `STRING` reads decode by the reply type code;
- the `elementCount` and `sendCommand` attributes are not consumed yet (see the warnings above);
- `health()` only inspects socket state, not a real protocol probe.

For the final behavior, consult the `read()` / `write()` / `initial()` source in `EthernetIpDriverCustomServiceImpl`.
:::

The minimal path to onboard an Allen-Bradley PLC:

1. Create a [device](../introduction/concepts/device) with `EtherNet/IP Driver`, and set the driver attributes
   `host=192.168.1.20`, `port=44818`, `slot=0`, `timeout=5000`.
2. Add a speed [Point](../introduction/concepts/point) (`pointTypeFlag=INT`, `READ_ONLY`) to
   the [Profile](../introduction/concepts/profile) bound to the device, and set the point attributes
   `tagName=Motor_Speed`, `tagType=DINT`, `elementCount=1`.
3. Start the driver and watch the connect and collection logs; the collected value appears in
   [PointValue](../introduction/concepts/point-value) within 30 seconds (the default `dev` profile polls every 5
   seconds).

For the complete onboarding procedure, see [Device Onboarding](../operation/device-onboarding).

## Further Reading

- [Drivers Overview](./index) — entry point for driver categories and selection
- [Driver Capability Matrix](./matrix) — read/write/subscribe capabilities and implementation status at a glance
- [Device Onboarding](../operation/device-onboarding) — a complete device onboarding flow
- [Industrial Buses & Protocols](../foundations/fieldbus) — the industrial wired side of the network layer; how CIP and
  other proprietary protocols are positioned and addressed
