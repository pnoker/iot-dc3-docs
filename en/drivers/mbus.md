---
title: M-Bus Driver
---

# M-Bus Driver

`dc3-driver-mbus` reads heat, water, and gas meters over the M-Bus (Meter-Bus, EN 13757) wired bus. It builds REQ_UD2 requests, SND_NKE/SND_UD frames, verifies the response checksum, and decodes the data records into values.

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
| Baud Rate | `baudRate` | INT | `2400` | Baud rate (M-Bus default 2400) |
| Data Bits | `dataBits` | INT | `8` | Data bits |
| Stop Bits | `stopBits` | INT | `1` | Stop bits |
| Parity | `parity` | INT | `2` | Parity (2=Even) |
| Timeout | `timeout` | INT | `1000` | Read timeout in milliseconds |
| Primary Address | `primaryAddress` | INT | `0` | M-Bus primary address (0-250) |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Record Index | `recordIndex` | INT | `0` | 0-based index of the data record to read |
| Data Format | `dataFormat` | STRING | `FLOAT` | Data format: FLOAT, HEX, ASCII |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?` (one polling round over all points every 30 seconds).
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ | |
| Write | ✓ (SND_NKE reset and SND_UD select frames) | |
| Subscribe | — | |

::: info Implementation status: complete

Frames are self-built (no native jrxtx dependency); `MbusFrame` handles REQ_UD2/SND_NKE/SND_UD building, checksum verification, and DIF/VIF record parsing.
:::

## Minimal onboarding example

1. Create a Device using `M-Bus Driver`, set `port=/dev/ttyUSB0`, `baudRate=2400`, `parity=2`, `primaryAddress=0`.
2. Add a Point (`READ_ONLY`) with `recordIndex=0` and `dataFormat=FLOAT`.
3. Start the driver; within 30 seconds the value appears in PointValue.

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
