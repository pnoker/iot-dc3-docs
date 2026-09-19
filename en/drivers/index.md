---
title: Drivers
---

# Drivers

> IoT DC3 ships **36 protocol drivers** covering industrial buses, PLC/SCADA, IoT, databases, and virtual testing. Each
> driver is a standalone service (`dc3-driver-*`) that registers itself and
> the [config attributes](../introduction/concepts/attribute-config) it accepts with the manager on startup, then
> reads [points](../introduction/concepts/point) and writes via [commands](../introduction/concepts/command).

For the general onboarding flow see [Device Onboarding](../operation/device-onboarding); for the driver model see
the [Driver](../introduction/concepts/driver) concept. Pick your protocol by category below:

## The protocol adaptation layer

The device world speaks heterogeneous, siloed protocols: Modbus master/slave, the OPC UA address space, MQTT
pub/sub, vendor-specific PLC frames, SQL result sets — with no shared addressing and no shared wire format. The 28
drivers each act as a **sensing-data convergence point** at the network layer (see Wen Zhe & Fan Yabin, *Research and
Application of Four-Network Convergence Technology Based on the Internet of Things*, Jilin People's Publishing House,
2016, ch. 1 §3, p13), folding reads and writes across those protocols into unified [point](../introduction/concepts/point)
values — the "unified data modeling and communication-channel management" of the application layer in the three-tier
IoT architecture (ibid., p13). Upper-layer applications consume normalized points only and never see the protocol
differences underneath.

## Industrial Bus / PLC / SCADA

| Driver                       | Protocol          | Notes                           |
|------------------------------|-------------------|---------------------------------|
| [Modbus TCP](./modbus-tcp)   | Modbus TCP        | Ethernet Modbus master          |
| [Modbus RTU](./modbus-rtu)   | Modbus RTU        | Serial Modbus master            |
| [OPC UA](./opc-ua)           | OPC UA            | OPC Unified Architecture client |
| [OPC DA](./opc-da)           | OPC DA            | Classic OPC Data Access         |
| [S7](./plcs7)                | Siemens S7        | Siemens PLC                     |
| [MELSEC](./melsec)           | Mitsubishi MELSEC | Mitsubishi PLC                  |
| [FINS](./fins)               | Omron FINS        | Omron PLC                       |
| [EtherNet/IP](./ethernet-ip) | EtherNet/IP (CIP) | Rockwell / CIP                  |
| [BACnet/IP](./bacnet-ip)     | BACnet/IP         | Building automation             |
| [IEC 104](./iec104)          | IEC 60870-5-104   | Power SCADA                     |
| [DLMS](./dlms)               | DLMS / COSEM      | Smart meters                    |
| [SL651](./sl651)             | SL651             | Hydrology monitoring            |
| [SNMP](./snmp)               | SNMP              | Network device monitoring       |
| [DL/T645](./dlt645)          | DL/T645-2007      | Electricity meter protocol      |
| [DNP3](./dnp3)               | DNP3 (IEEE 1815)  | Utility automation              |
| [IEC 61850](./iec61850)      | IEC 61850 (MMS)   | Substation automation           |
| [KNX](./knx)                 | KNX               | Building automation bus         |
| [M-Bus](./mbus)              | M-Bus (EN 13757)  | Metering bus                    |

## IoT / Wireless

| Driver             | Protocol     | Notes                           |
|--------------------|--------------|---------------------------------|
| [MQTT](./mqtt)     | MQTT         | IoT message bus                 |
| [CoAP](./coap)     | CoAP         | RESTful for constrained devices |
| [LwM2M](./lwm2m)   | LwM2M        | Lightweight device management   |
| [HTTP](./http)     | HTTP         | Generic HTTP polling            |
| [BLE](./ble)       | Bluetooth LE | Low-energy Bluetooth            |
| [Zigbee](./zigbee) | Zigbee       | Short-range wireless            |
| [CAN](./can)       | CAN          | Controller Area Network         |
| [LoRaWAN](./lorawan) | LoRaWAN    | ChirpStack MQTT uplink ingest   |
| [Kafka](./kafka)     | Apache Kafka | Streaming data source          |

## Serial / Generic Network

| Driver               | Protocol  | Notes                    |
|----------------------|-----------|--------------------------|
| [Serial](./serial)   | Serial    | Generic serial port      |
| [TCP/UDP](./tcp-udp) | TCP / UDP | Generic socket ingestion |

## Database

| Driver                     | Source     | Notes                   |
|----------------------------|------------|-------------------------|
| [MySQL](./mysql)           | MySQL      | Read points from tables |
| [PostgreSQL](./postgresql) | PostgreSQL | Read points from tables |
| [Oracle](./oracle)         | Oracle     | Read points from tables |
| [SQL Server](./sqlserver)  | SQL Server | Read points from tables |
| [Redis](./redis)           | Redis      | Read points from keys   |

## Virtual / Testing

| Driver                                   | Notes                                                                    |
|------------------------------------------|--------------------------------------------------------------------------|
| [Virtual](./virtual)                     | Generate simulated data with no real device — for demos and load testing |
| [Listening Virtual](./listening-virtual) | Listen on a port for device pushes — for integration testing             |

## References

Wen Zhe, Fan Yabin. *Research and Application of Four-Network Convergence Technology Based on the Internet of Things*
[M]. Changchun: Jilin People's Publishing House, 2016. ISBN 978-7-206-12410-5. (ch. 1 §3, p13)

## Further Reading

- [Driver](../introduction/concepts/driver) — the general driver model and registration
- [Attribute & Config](../introduction/concepts/attribute-config) — the three layers of driver / point / command
  attributes
- [Device Onboarding](../operation/device-onboarding) — a full onboarding walkthrough
- [Module Map](../architecture/modules) — where drivers sit in the overall architecture
- [Industrial Buses & Protocols](../foundations/fieldbus) · [IoT Protocols & Wireless](../foundations/iot-protocols) —
  the systematic knowledge behind the protocols
