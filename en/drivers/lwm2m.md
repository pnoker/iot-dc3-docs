---
title: LwM2M Driver
---

<script setup>
import Lwm2mDiagram from '../../.vitepress/theme/components/Lwm2mDiagram.vue'
</script>

# LwM2M Driver

`dc3-driver-lwm2m` embeds an Eclipse Leshan LwM2M server: devices act as clients and register with their own `endpoint`
name, and the driver then reads/writes resources on that endpoint by the three-part
`Object / Object Instance / Resource` path configured on each point. This page explains which protocol it speaks, which
attributes to fill in, how to troubleshoot a failed connection, and its real implementation status in IoT DC3.

## Protocol Background

LwM2M (Lightweight M2M) is an OMA-defined protocol for IoT **device management plus data collection**. It does not start
from scratch—it is **built on top of CoAP**, running over UDP (default `5683`, `5684` for DTLS/CoAPS encryption) and
supplying the "device management" layer that CoAP lacks. In
the [four-layer IoT reference architecture](../foundations/iot-protocols), it sits—like CoAP and MQTT—among the **network layer's application messaging protocols**: defining "what a message looks like, how it is delivered, and how
reliable it is," independent of whether Wi-Fi or NB-IoT carries it underneath.

The core of LwM2M is abstracting device capabilities into an **object tree**:

- **Object** (e.g. `3303` = Temperature)—a class of capability;
- **Object Instance**—multiple instances of the same capability (e.g. several temperature sensors on one device);
- **Resource** (e.g. `5700` = Sensor Value)—a specific readable/writable item within an instance.

Accessing a specific value means giving the path `/<objectId>/<objectInstanceId>/<resourceId>`. Firmware upgrade, remote
configuration, and subscription reporting are all standardized into this object model, which is why LwM2M is common on **carrier-grade endpoints that need remote operation**: NB-IoT modules, smart meters, remote environmental
sensors—anywhere both remote management and low power consumption are needed.

Unlike drivers such as Modbus or CoAP that **actively connect to devices**, this driver works the other way around—it
embeds a **LwM2M server**:

<Lwm2mDiagram lang="en" />

The device first registers to this server with its own endpoint name; only after a successful registration can the
driver issue reads/writes to it by the point's path. Whether a device is online depends on whether its endpoint is still
in the registry.

## Attribute Configuration

LwM2M attributes come in two layers: **driver attributes** are set on the [device](../introduction/concepts/device) and
describe "which endpoint to match", plus a set of server-listen/encryption declarations that are currently inert;
**point attributes** are set on
each [point](../introduction/concepts/point) and describe "which resource path in the object tree this point maps to."
Both originate from the driver's `application.yml` `driver-attribute` / `point-attribute` declarations; at onboarding
you [fill a concrete value](../introduction/concepts/attribute-config) for each attribute on the device instance.

### Driver attributes (device-level `driver-attribute`)

`endpoint` is the key that maps this DC3 device to a registered LwM2M client—it must match the endpoint name the device
reports at registration **exactly**, otherwise they will not match and the device stays offline. `serverHost` /
`serverPort` / `securePort` / `securityMode` / PSK only declare the server's bind address, ports, and encryption
nominally — **none of them build the server and their values have no effect** (`serverHost`/`serverPort` are only
presence-checked by `validate()`). What actually decides the listening port and encryption capability is the deployment
config and the driver implementation; see the warning below.

| Attribute     | code           | Type   | Default   | Remark                                        |
|---------------|----------------|--------|-----------|-----------------------------------------------|
| Endpoint      | `endpoint`     | STRING | (empty)   | LwM2M device endpoint name                    |
| Server Host   | `serverHost`   | STRING | `0.0.0.0` | Server bind address                           |
| Server Port   | `serverPort`   | INT    | `5683`    | CoAP port                                     |
| Secure Port   | `securePort`   | INT    | `5684`    | CoAPS/DTLS port                               |
| Security Mode | `securityMode` | STRING | `NOSEC`   | Security mode: NOSEC, PSK                     |
| PSK Identity  | `pskIdentity`  | STRING | (empty)   | PSK identity (when `securityMode=PSK`)        |
| PSK Key       | `pskKey`       | STRING | (empty)   | HEX-encoded PSK key (when `securityMode=PSK`) |

::: warning The serverHost / serverPort / securePort rows above do not build the server
The embedded server's bind address and port come from the **deployment config**
`dc3.driver.lwm2m.server-host` / `dc3.driver.lwm2m.server-port` (default `0.0.0.0:5683`), which `Lwm2mServerManager`
feeds explicitly into Leshan as a plaintext CoAP endpoint; the device-level `serverHost`/`serverPort`/`securePort`/
`securityMode`/PSK attributes above have **values that are never consumed** (`serverHost`/`serverPort` are only
presence-checked by `validate()`). Also, the driver only builds the plaintext CoAP endpoint —
there is **no DTLS/CoAPS endpoint** (`securePort` only appears in the startup log), so PSK/encryption is unavailable.
Bring the link up over plaintext `5683`; to change the listening port, edit the deployment property
`dc3.driver.lwm2m.server-port` and restart the driver (see Implementation status below).
:::

### Point attributes (`point-attribute`)

Fill in one LwM2M resource path on each point. The driver assembles `objectId` / `objectInstanceId` / `resourceId` into
`/<objectId>/<objectInstanceId>/<resourceId>`, issues a read to the device endpoint, and the returned value is
the [point value](../introduction/concepts/point-value) for that point.

| Attribute          | code               | Type   | Default | Remark                                       |
|--------------------|--------------------|--------|---------|----------------------------------------------|
| Object ID          | `objectId`         | INT    | `0`     | LwM2M Object ID (e.g. `3303`=Temperature)    |
| Object Instance ID | `objectInstanceId` | INT    | `0`     | LwM2M Object Instance ID                     |
| Resource ID        | `resourceId`       | INT    | `0`     | LwM2M Resource ID (e.g. `5700`=Sensor Value) |
| Observe            | `observe`          | STRING | `false` | Enable LwM2M Observe: true, false            |

::: tip The three-part path decides which resource to read
The point's data type ([Point](../introduction/concepts/point)'s `pointTypeFlag`) must match the actual data type of
that Resource. LwM2M has no separate `command-attribute` table (`command-attribute: [ ]` is empty in the yml)—the write
target of a writable point is simply its own three-part path: when a write command is issued, the driver sends a
`WriteRequest` directly to `/<objectId>/<objectInstanceId>/<resourceId>`, with no extra command attributes needed.
:::

::: warning The observe attribute has no effect yet
At the protocol level `observe=true` means "enable LwM2M Observe (subscription-style reporting) on the resource, so the
device pushes proactively on value change." But this driver **does not register any Observe and does not consume the
attribute**—neither `read()` nor `write()` reads `observe`. Point values can currently only be obtained via the default
30-second active read; setting `observe=true` will not trigger subscription pushes (see Implementation status below).
:::

### Collection and health cadence

The following cycles come from `application.yml`'s `dc3.driver.schedule` / `health`:

- **Collection cycle**: default cron `0/30 * * * * ?`, issuing one read to each point's resource path every 30 seconds.
- **Custom job**: a built-in custom schedule, default cron `0/5 * * * * ?`, every 5 seconds, reserved for the driver's
  own periodic logic (the current `schedule()` is an empty implementation).
- **Health / liveness**: device health check default cron `0/15 * * * * ?`, lease timeout `45` seconds. Whether a device
  is online depends on whether its endpoint is still registered on the embedded server.

## Troubleshooting

| Symptom                                     | Likely cause                                                    | Where to look                                         |
|---------------------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| Device stays offline, reads return nothing  | `endpoint` differs from what the device reports at registration | They must match exactly—see the first note below      |
| Device cannot reach the server              | UDP `5683` blocked by a firewall, or broken NAT mapping         | Verify the UDP link before the app config             |
| Changing the device attribute `serverPort` still listens on 5683 | The server port comes from the deployment property `dc3.driver.lwm2m.server-port`; device attributes do not build the server | Change `server-port` in the deployment config and restart |
| Registration fails after enabling PSK       | PSK config not applied yet, or the device forces DTLS           | Bring the link up with `NOSEC` plaintext first        |
| `observe=true` receives no pushes           | Observe auto-forwarding is not implemented                      | Rely on the default 30-second active read             |

::: warning The endpoint name must match the device's registration exactly
Device liveness is judged by matching the `endpoint` name in the embedded server's registry (
`isDeviceRegistered(endpoint)`). If the endpoint the device actually registers with (commonly `urn:imei:<IMEI>` or a
vendor-defined string) and the `endpoint` filled on the device differ by even one character, they will not match: the
device stays offline and reads return nothing. Before onboarding, confirm exactly what endpoint name the device firmware
uses to register.
:::

::: tip For UDP protocols, check the link first
LwM2M runs over CoAP over UDP; a failure to connect is usually the UDP port (`5683`/`5684`) being blocked by a firewall
or a broken NAT mapping, rather than a wrong application config—verify the link first, then check the endpoint and point
paths. When the device is on the public internet/cellular, remember to allow the corresponding UDP ports.
:::

::: warning Encryption is not yet available; the listening port comes from the deployment config
The device attributes `serverPort`/`securePort`/`securityMode`/PSK have values that are never consumed; the embedded server only builds
a plaintext CoAP endpoint (default `5683`, and **no** DTLS `5684` endpoint). So a PSK/DTLS handshake is impossible
today—use a `NOSEC` plaintext link to get read/write working first. To change the listening port, edit the deployment
property `dc3.driver.lwm2m.server-port` (default `5683`) and restart the driver; to support encryption, the PSK config
must first be wired into `LeshanServerBuilder` inside `Lwm2mServerManager`, together with a CoAPS endpoint.
:::

## How It Lands in IoT DC3

- **`dc3.driver.code`**: `Lwm2mDriver` (a stable routing identifier consistent with
  the [driver capability matrix](./matrix); do not change it casually).
- **Driver name / type**: `LwM2M Driver` / `DRIVER_CLIENT`.
- **Read (implemented)**: `read()` calls `Lwm2mServerManager.read()`, sending
  `ReadRequest(objectId, objectInstanceId, resourceId)` to the registered device and using the returned content as the
  point value—this is real protocol I/O, not a stub.
- **Write (implemented)**: `write()` calls `Lwm2mServerManager.write()`, sending a `WriteRequest` to the same three-part
  path; success returns `true`, failure/timeout returns `false`.
- **Subscribe (not implemented)**: the [driver capability matrix](./matrix) marks LwM2M's subscribe as
  "—" — **Observe-based reporting is not landed yet**—
  `Lwm2mObservationHandler.onObservation()` only logs and carries a `TODO`; the driver neither registers Observe nor
  maintains the endpoint→deviceId / resource-path→pointId mapping needed to forward observed values.

::: warning Implementation status: read/write usable, subscribe and encryption incomplete
**Read and write are wired to real Leshan I/O and work against a registered device**. Three things remain unfinished:
① auto-forwarding of Observe-subscribed values; ② wiring the device-level `serverHost`/`serverPort`/`securePort`/
`securityMode`/PSK attributes (the server bind currently comes from the deployment config `dc3.driver.lwm2m.server-*`);
③ the PSK/DTLS encrypted link (the server has no CoAPS endpoint today). Treat it as a "read/write runnable,
subscribe/encryption pending" onboarding starting point, and validate read/write over a plaintext link with the
example below first.
:::

::: details Minimal onboarding example: read back a temperature point
Onboard a LwM2M sensor whose endpoint name is `urn:imei:860000000000001` and whose temperature resource is at
`/3303/0/5700`:

1. Create a [device](../introduction/concepts/device) with `LwM2M Driver`, and set the driver attributes
   `endpoint=urn:imei:860000000000001`, `securityMode=NOSEC`, plus `serverHost`/`serverPort` at their defaults
   (`validate()` requires them to be filled, but their values have no effect; the listening port comes from the
   deployment property `dc3.driver.lwm2m.server-port`, default `5683`).
2. Have the LwM2M client register to this service's port `5683` (plaintext) using the **same** endpoint name.
3. Add a temperature [point](../introduction/concepts/point) (`READ_ONLY`) to
   the [profile](../introduction/concepts/profile) bound to the device, with point attributes `objectId=3303`,
   `objectInstanceId=0`, `resourceId=5700`.
4. Start the driver. Once the device registers successfully, within 30 seconds you will see the temperature value read
   back in the [point value](../introduction/concepts/point-value).
   :::

## Further Reading

- [Drivers Overview](./index) — the full landscape and grouping of the 36 drivers
- [Driver Capability Matrix](./matrix) — a quick reference for each driver's read/write/subscribe support
- [Device Onboarding](../operation/device-onboarding) — a complete onboarding walkthrough
- [IoT Protocols & Wireless Networks](../foundations/iot-protocols) — LwM2M's place in the network layer and its
  trade-offs vs CoAP/MQTT
