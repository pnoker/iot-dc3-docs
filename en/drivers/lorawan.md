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

## Further reading

- [Driver overview](./index) — entry point to all protocol drivers and selection
- [Driver capability matrix](./matrix) — quick reference of read/write/subscribe capabilities
- [Device onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
