---
title: LoRaWAN Driver
---

# LoRaWAN Driver

`dc3-driver-lorawan` ingests LoRaWAN uplinks by subscribing to ChirpStack MQTT topics (`application/+/device/+/event/up`). It decodes the JSON payload, caches the latest FRMPayload (base64) and Cayenne LPP object fields per DevEUI, and publishes downlink commands to the ChirpStack `command/down` topic.

## Protocol background

LoRaWAN devices send uplinks through a gateway to a network server (ChirpStack). ChirpStack exposes uplinks over MQTT; this driver subscribes to those topics, matching points by DevEUI. A point field selects a Cayenne LPP object key; an empty field returns the raw base64 payload.

- **Driver name / code**: `LoRaWAN Driver` / `LorawanDriver`
- **Type**: `DRIVER_SERVER (subscribes to ChirpStack MQTT uplinks)`
- **Underlying library**: Eclipse Paho MQTT v3 + Jackson

## Attribute configuration

### Driver attributes (device-level `driver-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| Application ID | `applicationId` | STRING | (empty) | ChirpStack application ID for downlink commands |
| Broker URI | `brokerUri` | STRING | `tcp://dc3-mqtt:1883` | MQTT broker URI for ChirpStack events |
| Subscribe Topic | `topic` | STRING | `application/+/device/+/event/up` | MQTT uplink topic filter |
| Username | `username` | STRING | (empty) | MQTT broker username (optional) |
| Password | `password` | STRING | (empty) | MQTT broker password (optional) |

### Point attributes (`point-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| DevEUI | `devEui` | STRING | (empty) | LoRaWAN device EUI (16 hex characters) |
| Field | `field` | STRING | (empty) | Cayenne LPP object field; empty returns raw base64 |

### Command attributes (`command-attribute`)

| Attribute | code | Type | Default | Description |
|-----------|------|------|---------|-------------|
| DevEUI | `devEui` | STRING | (empty) | LoRaWAN device EUI for downlink |

## Collection and health

- **Collection cycle**: default cron `0/30 * * * * ?`.
- **Health/online**: device health defaults to cron `0/15 * * * * ?`, lease timeout `45 seconds`.

## Capability matrix

| Capability | Supported | Notes |
|------------|-----------|-------|
| Read | ✓ (latest cached uplink) | |
| Write | ✓ (downlink publish) | |
| Subscribe | ✓ | |

::: info Implementation status: available

The MQTT connection is established lazily on first read/write, so startup tolerates a temporarily unreachable broker; `messageArrived` parses `deviceInfo.devEui`, `data`, and the Cayenne LPP `object`.
:::

## Minimal onboarding example

1. Create a Device using `LoRaWAN Driver`, set `applicationId=<your-app-id>` and `brokerUri` to your ChirpStack MQTT broker.
2. Add a Point (`READ_ONLY`) with `devEui=<device-eui>` and `field=temperature`.
3. Start the driver; the next uplink is cached and served as the point value.

## Troubleshooting

::: warning It reads a cache, not the device
`read()` only looks up the most recent uplink cached in memory by DevEUI; it never sends anything into the LoRaWAN network — an empty cache throws `No LoRaWAN uplink cached`. Fix "did the uplink reach MQTT" first, then the point attributes.
:::

::: warning The uplink subscription starts with the first write
The MQTT connection and uplink subscription are established lazily, and only on the write path: `read()` only reads the cache and health only reads the connection flag — neither connects. A read-only deployment has no subscription before its first write, so the cache stays empty and the device shows offline. In such setups, trigger one write against any point of this driver first; once the connection and subscription are up, uplinks start landing in the cache.
:::

- **Reads throw `No LoRaWAN uplink cached`**: no uplink has arrived for that DevEUI, or `field` doesn't match the payload. Confirm the end device is transmitting and ChirpStack's MQTT integration is forwarding; the point's `devEui` must match `deviceInfo.devEui` in the message character for character (the cache is an exact string match); `field` must be a key from the ChirpStack `object`, e.g., `temperature`.
- **Uplinks arrive but never get cached**: the message must be valid JSON carrying `deviceInfo.devEui` — messages without a devEui are dropped (debug-level log, invisible at the default level); JSON parse failures log a `Failed to parse LoRaWAN uplink` warn. Turn `io.github.pnoker.driver` up to DEBUG while troubleshooting.
- **The value you read is a base64 blob**: an empty `field` returns the raw FRMPayload as base64. Fill in a Cayenne LPP field name for the decoded number — the choice lives in the point attribute `field`.
- **Writes throw `Required attribute 'applicationId' is missing`**: the downlink topic is assembled from the device attribute `applicationId` and the point attribute `devEui`; either one missing fails the write outright. Fill them per the tables above.
- **Writes throw `LoRaWAN write failed`, or the device is offline**: the broker is unreachable or authentication failed. Check `brokerUri` (default `tcp://dc3-mqtt:1883`) and `username` / `password` (the password is only sent when the username is non-empty); a dropped connection logs `MQTT connection lost` and marks offline, and the client reconnects automatically.
- **No uplinks after an automatic reconnect**: the subscription happens only when a connection is first created; a successful auto-reconnect does not re-subscribe. When you see "back online but no new data", restart the driver process to rebuild the subscription.
- **The write "succeeds" but the device does nothing**: a successful publish only means the message entered ChirpStack's downlink queue — downlinks are fixed `fPort=1` and unconfirmed (`confirmed=false`), and a Class A device receives them only in the receive window after its next uplink. Check the downlink queue and gateway traffic in the ChirpStack console.
- **Values never refresh**: the cache keeps only the latest uplink per DevEUI (new overwrites old), and the read schedule is disabled by default (`schedule.read.enable=false`) — uplinks land in the cache but are not auto-reported as point values; trigger manual reads from the platform, or enable the read schedule to poll the cache on a cron.
- **All devices go offline/online together**: health reflects only the global MQTT connection flag; end devices are not probed individually. Whether a single end device is present is decided by the platform lease timeout (default 45 seconds).

## How it lands in IoT DC3

The chain is "end device → gateway → ChirpStack → MQTT broker → driver": ChirpStack publishes uplinks as JSON to `application/{app}/device/{DevEUI}/event/up`, and the driver subscribes to the device attribute `topic` (default wildcard `application/+/device/+/event/up`, QoS 1). Note that the connection is shared driver-wide: `brokerUri`, `username`, `password`, and `topic` live on device attributes, but the values that actually take effect are those of whichever device triggered the first connect — while the client stays online, a different broker configured on another device is not applied; to ingest from multiple ChirpStack instances, deploy separate driver instances. The client uses a random clientId, a clean session, and automatic reconnect; it is established lazily on the first write, and only then do uplinks start reaching the cache.

When an uplink arrives, it is filed under `deviceInfo.devEui`: `data` (the raw base64 FRMPayload) and `object` (ChirpStack's decoded Cayenne LPP fields flattened to key-values) each go into their own table, with only the latest uplink kept per DevEUI. `read()` consumes the point attributes `devEui` and `field`: an empty `field` returns the raw base64, a filled one returns the matching `object` field; a cache miss throws instead of sending a request to wait on the device. Uplinks only fill the cache — turning them into [point values](../introduction/concepts/point-value) requires a `read()` (triggered manually from the platform, or by enabling the read schedule, off by default, to poll the cache on a cron).

Writes go over MQTT downlink: `write()` takes the device attribute `applicationId` and the point attribute `devEui`, base64-encodes the command value as UTF-8, and publishes `{"confirmed":false,"fPort":1,"data":"…"}` to `application/{applicationId}/device/{devEui}/command/down`, where ChirpStack queues it as a LoRaWAN downlink; the command attribute `devEui` declared in the yml belongs to the command-execution path, which writes do not go through (this driver implements no custom command execution). Only a successful write is recorded back as a point value. Health reflects just the broker connection; end-device presence is left to the platform lease timeout (default 45 seconds).

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
