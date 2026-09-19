---
title: M-Bus Driver
---

# M-Bus Driver

`dc3-driver-mbus` reads heat, water, and gas meters over the M-Bus (Meter-Bus, EN 13757) wired bus. It builds REQ_UD2 read requests and SND_UD write frames, verifies the response checksum, and decodes the data records into values.

## Protocol background

M-Bus (EN 13757) is the European standard for remote meter reading. A master sends short frames to address a meter by primary address, and the meter replies with a long frame containing a variable-length data record (DIF/VIF/data) that carries the measured quantity.

- **Driver name / code**: `M-Bus Driver` / `MbusDriver`
- **Type**: `DRIVER_CLIENT (opens the serial port and polls the meter)`
- **Underlying library**: jSerialComm (self-built EN 13757-2/3 frame encode/decode — no native jrxtx dependency)

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Serial Port | `port` | STRING | `/dev/ttyUSB0` | Serial port device path |
| Baud Rate | `baudRate` | INT | `2400` | Baud rate (300, 600, 1200, 2400, 4800, 9600) |
| Data Bits | `dataBits` | INT | `8` | Data bits (7, 8) |
| Stop Bits | `stopBits` | INT | `1` | Stop bits (1, 2) |
| Parity | `parity` | INT | `2` | Parity (0=None, 1=Odd, 2=Even) |
| Timeout | `timeout` | INT | `1000` | Read timeout in milliseconds |
| Primary Address | `primaryAddress` | INT | `0` | M-Bus primary address (0-250) |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Record Index | `recordIndex` | INT | `0` | 0-based index of the data record to read |
| Data Format | `dataFormat` | STRING | `AUTO` | Data format: AUTO, HEX, BCD, INT, FLOAT |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?` (one polling round over all points every 30 seconds).
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ | |
| Write | ✓ (SND_UD frame, single-byte ACK) | |
| Subscribe | — | |

::: info Implementation status: complete

Frames are self-built (no native jrxtx dependency); `MbusFrame` handles REQ_UD2/SND_UD building, checksum verification, and DIF/VIF record parsing.
:::

## Troubleshooting

M-Bus failures mostly fall into three groups: serial port, addressing, and record parsing. Work through them as symptom → cause → check:

- **The serial port will not open.** Cause: the `port` path does not exist, another process holds the port, or the user lacks permission; a failed open throws a `ConnectorException` (`Failed to open serial port` in the logs). Check: on Linux, confirm the device node exists and your user is in the `dialout` group; on Windows, set `port` to a name like `COM3`; make sure no other program occupies the port.
- **Every read logs `Empty M-Bus response`.** Cause: no meter answered — `primaryAddress` does not match the meter, the serial parameters do not match, or the level converter/wiring is at fault. Check: align `baudRate`/`dataBits`/`stopBits`/`parity` with the meter manual (M-Bus ships at 2400 8E1 in most cases), then read the meter alone with an M-Bus master tool to confirm the address.
- **`checksum mismatch` or `invalid frame delimiters`.** Cause: the received bytes are not one complete frame — wrong serial parameters garbling bytes, bus noise, or a truncated answer: the receive loop treats "3 consecutive empty polls, roughly 20 ms apart" as end of frame, so a meter pausing mid-answer longer than that gets cut off. Check: verify the four serial parameters; if they match, raise `timeout` and check bus termination and common ground.
- **`Unexpected M-Bus response control code`.** Cause: the answer's control byte is not RSP_UD (`0x08`), typical when two meters on the bus answer on the same primary address. Check: make each primary address unique on the bus.
- **`M-Bus record not found`.** Cause: `recordIndex` is beyond the number of records decoded from the answer — record counts differ per meter type and variable data structure. Check: `recordIndex` is a 0-based index into the DIF/VIF record list; step it from 0 until you hit the target record, cross-checking the meter's variable data structure.
- **Values look wrong.** Cause: `dataFormat` does not match the record's actual encoding. The default `AUTO` picks by DIF: BCD DIFs decode as BCD, 32-bit reals as FLOAT, everything else as INT — decoding a BCD metering value as INT yields wrong digits. Check: set `dataFormat` explicitly to `BCD`/`INT`/`FLOAT`, or inspect the raw bytes with `HEX` first.
- **Writes keep failing.** Cause: the driver wraps the write value as US-ASCII bytes into an SND_UD frame and only counts a single-byte ACK (`0xE5`) as success — the meter rejecting the operation, a payload that does not match its application-layer format, or a wrong address all fail. Check: confirm reads work at the same address first, then verify the write payload against the meter manual.
- **The device flaps offline and reconnects.** Cause: any read or write exception invalidates the serial connection, which is reopened on the next access; device update/delete metadata events also close the connection. Check: frequent `Driver connection established` / `Serial port opened` in the logs means the port keeps reopening — go back to the read failures above. See [Device](../introduction/concepts/device) for the online-state mechanics.

## How it lands in IoT DC3

M-Bus is a two-wire, single-master/multi-slave bus: the driver host attaches to the bus through an M-Bus master (commonly a USB-to-M-Bus level converter), heat, water, and gas meters hang off the bus, and each meter is identified by a primary address in 0-250. The driver is an active `DRIVER_CLIENT` poller: each [Device](../introduction/concepts/device) maps to one serial connection whose parameters (`port`/`baudRate`/`dataBits`/`stopBits`/`parity`/`timeout`) come from that device's driver attributes, cached and reused by `deviceId`. One meter = one device + one `primaryAddress`.

::: warning Connections do not share a serial port
Connections are created and cached per `deviceId`: two devices with the same `port` each open that serial port — the driver does not merge them. When several meters share one physical bus (one device per primary address), make sure your serial stack tolerates the same port being opened more than once.
:::

The read path: the collection schedule (default every 30 seconds) runs one round over all points of the device. `read()` builds a REQ_UD2 request from the device attribute `primaryAddress`, flushes stale bytes from the port before sending, then validates the answer's control code (RSP_UD), frame delimiters, and checksum, parses the user data into a DIF/VIF record list, picks the record at the point attribute `recordIndex`, and decodes it per `dataFormat` into a [point value](../introduction/concepts/point-value). Different records of the same meter (total, flow rate, temperature) become separate points, each with its own `recordIndex`.

The write path and platform wiring: `write()` converts the command value to US-ASCII bytes, builds an SND_UD frame against the same `primaryAddress`, and treats a single-byte ACK (`0xE5`) as success; failures throw `WritePointException`. The health check reports online/offline from the serial connection's `isOpen()` every 15 seconds; device update/delete metadata events close the connection, and read/write exceptions invalidate it for rebuild on the next cycle — so a wrong serial setup shows up as "port reopening plus persistent read failures", not a hung driver. Capabilities match the [capability matrix](./matrix): read ✓ / write ✓ / subscribe — (M-Bus is master/slave polling; meters never push).

## Minimal onboarding example

1. Create a Device using `M-Bus Driver`, set `port=/dev/ttyUSB0`, `baudRate=2400`, `parity=2`, `primaryAddress=0`.
2. Add a Point (`READ_ONLY`) with `recordIndex=0` and `dataFormat=FLOAT`.
3. Start the driver; within 30 seconds the value appears in PointValue.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
