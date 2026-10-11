---
title: Zigbee Driver
---

# Zigbee Driver

> **`dc3-driver-zigbee` connects Zigbee devices to IoT DC3** — it joins a Zigbee network through a serial coordinator,
> periodically reads node data via ZCL attributes, and supports commands that write values to ZCL attributes.

After reading this page you will understand where Zigbee sits in the IoT network layer, know which attributes to fill on
the driver side and the point side to onboard a Zigbee node, and be clear on how far the current implementation goes and
which capabilities you cannot yet rely on.

## Protocol background

Zigbee is a **low-power, low-rate, short-range wireless mesh protocol** built on the IEEE 802.15.4 physical/link layer,
operating in the 2.4 GHz unlicensed band. Its typical use is the large number of battery-powered sensor nodes in smart
home and building automation — temperature/humidity, door contacts, occupancy, switches, lights, smart plugs, and so on.
Such devices carry little data and need long battery life, which makes running a full IP stack impractical; instead they
form their own Zigbee network where nodes can relay for each other (mesh), with a single **coordinator** handling
network formation, ingress, and egress.

In the [four-layer IoT architecture](../foundations/iot-protocols), Zigbee belongs to the wireless access technologies
of the **network layer** — it solves "how to transmit a low-rate device's signal power-efficiently," not how to speak IP
directly. A Zigbee network does not connect to the public network on its own; it is aggregated through a
coordinator/gateway and then uplinked, similar to BLE and unlike application-layer messaging protocols such as
MQTT/CoAP. In IoT DC3 the coordinator takes the form of a **USB serial dongle** plugged into the host running the
driver; the driver acts as a Zigbee application-layer client, mapping each [Point](../introduction/concepts/point) to
one ZCL attribute in the Zigbee network for reads and writes.

Zigbee addressing has several levels. Each Zigbee device is uniquely identified by its **IEEE address** (64-bit extended
address, fixed at the factory); a specific data point inside a device is then located by three levels: **endpoint →
cluster → attribute (ZCL attribute)**. Understanding this addressing is the prerequisite for configuring point
attributes.

::: tip Three-level addressing: endpoint / cluster / attribute
A Zigbee node may have several endpoints (multi-function devices); each endpoint hosts several ZCL clusters (e.g.
Temperature Measurement `1026`, Relative Humidity `1029`), and each cluster holds several attributes. `cluster` +
`attribute` decide which physical quantity is read — the Point's data type ([Point](../introduction/concepts/point)'s
`pointTypeFlag`) must match the actual type of that ZCL attribute.
:::

## Attribute configuration

Onboarding a Zigbee device involves two layers: **driver attributes (`driver-attribute`)** configure the coordinator
side — one coordinator serves the whole Zigbee network; **point attributes (`point-attribute`)** locate each collected
point to one specific ZCL attribute in the network. The fields in both tables come from the driver's
`application.yml` (`dc3.driver.driver-attribute` / `point-attribute`); the defaults are the `default-value` entries
in that yml.

### Driver attributes (device-level `driver-attribute`)

These attributes are filled on the [Device](../introduction/concepts/device) and describe how the coordinator dongle on
this host connects and which Zigbee network it joins. `serialPort` and `baudRate` define the serial connection and
`dongleType` selects the coordinator adapter; `panId` and `channel` are reserved attributes (the current build does not
read them when forming the network — the coordinator's own stored parameters apply; semantically `0` means auto).

| Attribute   | code         | Type   | Default        | Description                                                          |
|-------------|--------------|--------|----------------|----------------------------------------------------------------------|
| Serial Port | `serialPort` | STRING | `/dev/ttyUSB0` | Zigbee coordinator serial port                                       |
| Baud Rate   | `baudRate`   | INT    | `115200`       | Serial port baud rate                                                |
| Dongle Type | `dongleType` | STRING | `TELEGESIS`    | Coordinator dongle type (only TELEGESIS in this build; EMBER/CONBEE reserved) |
| PAN ID      | `panId`      | INT    | `0`            | PAN ID (0=auto; not read by the current build)                       |
| Channel     | `channel`    | INT    | `0`            | Channel (0=auto, 11-26; not read by the current build)               |

### Point attributes (`point-attribute`)

Each collected [Point](../introduction/concepts/point) uses IEEE address + endpoint + cluster + attribute to uniquely
locate one ZCL attribute in the Zigbee network. `nodeIeeeAddress` picks the node; `endpointId` / `clusterId` /
`attributeId` narrow down to that specific attribute following the three-level addressing above.

| Attribute         | code              | Type   | Default | Description                                        |
|-------------------|-------------------|--------|---------|----------------------------------------------------|
| Node IEEE Address | `nodeIeeeAddress` | STRING | (empty) | Zigbee node IEEE address (e.g. `00158D0001234567`) |
| Endpoint ID       | `endpointId`      | INT    | `1`     | Endpoint ID                                        |
| Cluster ID        | `clusterId`       | INT    | `0`     | Cluster ID (e.g. `1026`=Temperature Measurement)   |
| Attribute ID      | `attributeId`     | INT    | `0`     | Attribute ID (e.g. `0`=Measured Value)             |

### Write command attributes (`command-attribute`)

`application.yml` declares four-level addressing fields with the same names as the point attributes under
`command-attribute`, but they are currently **placeholder declarations**: `write()` only receives `pointConfig` (point
attributes) in its signature — never command attributes — and this driver does not override `execute()`, so the write
path does not read them. Reading and writing share the same `nodeIeeeAddress` / `endpointId` / `clusterId` /
`attributeId` on the **point attributes**; the write target is exactly the ZCL attribute the point addresses. The
table below reproduces the yml declarations verbatim (the Description column is the yml remark wording — "for writing"
states the design intent only and has no effect today):

| Attribute         | code              | Type   | Default | Description              |
|-------------------|-------------------|--------|---------|--------------------------|
| Node IEEE Address | `nodeIeeeAddress` | STRING | (empty) | Zigbee node IEEE address |
| Endpoint ID       | `endpointId`      | INT    | `1`     | Endpoint ID              |
| Cluster ID        | `clusterId`       | INT    | `0`     | Cluster ID for writing   |
| Attribute ID      | `attributeId`     | INT    | `0`     | Attribute ID for writing |

### A minimal onboarding example

Onboard a temperature sensor node with IEEE address `00158D0001234567`:

1. Create a [Device](../introduction/concepts/device) with `Zigbee Driver`, and fill the driver attributes
   `serialPort=/dev/ttyUSB0`, `baudRate=115200`, `dongleType=TELEGESIS`, `panId=0`, `channel=0`.
2. Add a temperature [Point](../introduction/concepts/point) (`pointTypeFlag=FLOAT`, `READ_ONLY`) to
   the [Profile](../introduction/concepts/profile) bound to the device, and fill the point attributes
   `nodeIeeeAddress=00158D0001234567`, `endpointId=1`, `clusterId=1026` (Temperature Measurement cluster),
   `attributeId=0` (Measured Value).
3. Make sure the node has joined the coordinator's Zigbee network, start the driver, and within 30 seconds you will see
   the value in [Point Value](../introduction/concepts/point-value).

## Troubleshooting

When onboarding Zigbee devices, problems usually live in the serial port, network joining, address format, or the
boundaries of the current implementation. The checklist below follows the order "connect first, then locate, then read
correctly."

::: warning Coordinator not found / serial port busy
The default serial port is `/dev/ttyUSB0` at baud rate `115200`. First confirm the dongle is plugged in, the host can
see the serial device (e.g. `ls /dev/ttyUSB*`), and the port is not held by another process. For containerized
deployments, pass the host serial device through into the container (e.g. `--device=/dev/ttyUSB0`); otherwise the driver
will never connect to the coordinator after startup. If any of `serialPort` / `baudRate` / `dongleType` is missing, the
first network start fails outright with `Driver Zigbee attribute 'xxx' is required to start the network`.
:::

::: warning Node reports "node not found"
A "node not found" error on read/write usually means `nodeIeeeAddress` is wrong or the node has not joined. The IEEE
address is 16 continuous hex characters (e.g. `00158D0001234567`) — **no colons and no `0x` prefix**. The address is
fixed at the factory and can be found in the coordinator/gateway device list. The node must also have joined this
coordinator's Zigbee network (permit-join) before it can be addressed.
:::

::: warning Endpoint / cluster / attribute not found
An "endpoint/cluster/attribute not found" error means one level of the three-level addressing is wrong. The endpoint of
a multi-function device is not necessarily `1`; the cluster ID must match the actual physical quantity (Temperature
Measurement `1026`, Relative Humidity `1029`); the attribute ID must match the specific attribute under that cluster
(Measured Value is often `0`). Use the coordinator tooling to inspect which endpoints and clusters the target node
exposes, then fill the point attributes accordingly.

The read path issues a **synchronous ZCL read** for that attribute (`attribute.readValue`, with a timeout): if the node
is unreachable or does not answer, the read comes back empty and the driver returns the `0` placeholder instead of
raising an error.
:::

::: warning Data type mismatch
The Point's `pointTypeFlag` must match the actual type of the ZCL attribute. A temperature measured value is a signed
integer (in units of 0.01 °C) parsed as `FLOAT`/numeric; reading a string-like cluster as numeric or vice versa yields
meaningless values. Verify the ZCL attribute's data type before configuring the point.
:::

::: warning Driver / device shows offline
The driver-level health check depends on whether `networkManager` is initialized: the driver is offline while the
coordinator is not connected (or before the first network start has been triggered). Device-level online state uses the
lease mechanism described in [Device](../introduction/concepts/device) (health check cron `0/15 * * * * ?`, lease
timeout `45 seconds`). The device-level check resolves an IEEE address from the device's points and looks the node up in
the coordinator's network: a node absent from the network (or a device whose points carry no valid address, or a network
not yet established) is reported offline.
:::

## How it lands in IoT DC3

- **`dc3.driver.code`**: `ZigbeeDriver` (driver name `Zigbee Driver`, type `DRIVER_CLIENT` — connects to the coordinator
  and polls nodes). This is a stable routing identifier; do not change it casually.
- **Collection cycle**: default cron `0/30 * * * * ?`, reading ZCL attributes every 30 seconds.
- **Health / online**: the device health check defaults to cron `0/15 * * * * ?` with a `45-second` lease timeout;
  see [Device](../introduction/concepts/device) for the online-state mechanism.
- **Read / write capability**: the read path issues a **synchronous ZCL read** for the attribute
  (`attribute.readValue`, with a timeout; an empty answer yields the `0` placeholder), and the write path genuinely
  writes the value to the ZCL attribute (`attribute.writeValue`) and validates the ZCL write acknowledgement
  (`CommandResult`) — a rejection or timeout raises an error, so a successful write command means the acknowledgement
  check passed.
- **Subscribe capability (not implemented yet)**: the driver **only registers a coordinator network-state listener**
  (`addNetworkStateListener` in `ensureNetwork()` at first network start, which merely logs network UP/DOWN), and
  **does not listen for node joining
  (node-join/announce) or ZCL attribute reports**, nor does it configure attribute binding/reporting. Node joins and
  attribute reports therefore never become point values — the "subscribe" column for Zigbee in
  the [driver capability matrix](./matrix) is marked as not implemented accordingly.

::: warning Local limitations: dongle support, reserved attributes, and subscription
The core read/write path is ready (implementation status: usable), but mind these boundaries:

- **Only the Telegesis coordinator is bundled in this build**: the code ships only the `ZigBeeDongleTelegesis` adapter;
  a `dongleType` of `EMBER` / `CONBEE` fails network start outright with `Driver Zigbee dongle type 'xxx' has no
  adapter in this build`.
- **`panId` / `channel` are not read yet**: these driver attributes do not take part in network formation — the
  coordinator's own stored network parameters apply (see the attribute table).
- **Subscribe is not implemented**: no node-join or ZCL attribute report listening; see "Subscribe capability" above.
:::

## Further reading

- [Drivers Overview](./index) — all driver groups and the selection entry point
- [Driver Capability Matrix](./matrix) — Zigbee's read / write / subscribe capability versus similar drivers
- [Device Onboarding](../operation/device-onboarding) — a complete device onboarding flow
- [IoT Network Layer](../foundations/iot-protocols) — where Zigbee sits in wireless access and network convergence
- [BLE Driver](./ble) — onboarding another kind of low-power short-range wireless device
