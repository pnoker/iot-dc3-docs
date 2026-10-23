---
title: Module Inventory
---

# Module Inventory

The IoT DC3 modules, grouped by repository directory. Each module links to its original `README.md` on the `main`
branch on GitHub.

::: tip Source of Truth
Driver counts and module names match the current repository layout: 36 connectivity driver modules live under
`dc3-driver/`.
:::

## Gateway

| Module        | Description                                  | Documentation                                                                  |
|---------------|----------------------------------------------|--------------------------------------------------------------------------------|
| `dc3-gateway` | Spring Cloud Gateway — the single HTTP entry | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-gateway/README.md) |

## Center Services

| Module               | Description                                                        | Documentation                                                                                    |
|----------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `dc3-center-auth`    | Auth Center — tenants, users, roles, resources, and tokens         | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-center/dc3-center-auth/README.md)    |
| `dc3-center-manager` | Manager Center — drivers, profiles, devices, points, and metadata  | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-center/dc3-center-manager/README.md) |
| `dc3-center-data`    | Data Center — point values, queries, and command dispatch          | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-center/dc3-center-data/README.md)    |
| `dc3-center-agentic` | Agentic Center — AI conversations, model providers, and tool calls | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-center/dc3-center-agentic/README.md) |
| `dc3-center-single`  | Single-process aggregated startup — handy for local debugging      | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-center/dc3-center-single/README.md)  |

## Protocol Drivers

| Category                        | Module                         | Protocol / Purpose                     |
|---------------------------------|--------------------------------|----------------------------------------|
| Industrial protocols            | `dc3-driver-modbus-tcp`        | Modbus TCP                             |
| Industrial protocols            | `dc3-driver-modbus-rtu`        | Modbus RTU                             |
| Industrial protocols            | `dc3-driver-opc-ua`            | OPC UA                                 |
| Industrial protocols            | `dc3-driver-opc-da`            | OPC DA                                 |
| Industrial protocols            | `dc3-driver-plcs7`             | Siemens S7                             |
| Industrial protocols            | `dc3-driver-bacnet-ip`         | BACnet/IP                              |
| Industrial protocols            | `dc3-driver-ethernet-ip`       | EtherNet/IP                            |
| Industrial protocols            | `dc3-driver-fins`              | Omron FINS                             |
| Industrial protocols            | `dc3-driver-melsec`            | Mitsubishi MELSEC                      |
| Industrial protocols            | `dc3-driver-iec104`            | IEC 60870-5-104                        |
| Industrial protocols            | `dc3-driver-sl651`             | SL651 hydrological monitoring protocol |
| Industrial protocols            | `dc3-driver-dlms`              | DLMS / COSEM                           |
| Industrial protocols            | `dc3-driver-knx`               | KNX                                    |
| Industrial protocols            | `dc3-driver-dnp3`              | DNP3                                   |
| Industrial protocols            | `dc3-driver-iec61850`          | IEC 61850                              |
| Industrial protocols            | `dc3-driver-dlt645`            | DL/T645                                |
| Industrial protocols            | `dc3-driver-mbus`              | M-Bus                                  |
| IoT protocols                   | `dc3-driver-mqtt`              | MQTT                                   |
| IoT protocols                   | `dc3-driver-coap`              | CoAP                                   |
| IoT protocols                   | `dc3-driver-lwm2m`             | LwM2M                                  |
| IoT protocols                   | `dc3-driver-http`              | HTTP                                   |
| IoT protocols                   | `dc3-driver-ble`               | Bluetooth Low Energy                   |
| IoT protocols                   | `dc3-driver-zigbee`            | Zigbee                                 |
| IoT protocols                   | `dc3-driver-lorawan`           | LoRaWAN                                |
| IoT protocols                   | `dc3-driver-kafka`             | Kafka                                  |
| Data bridging                   | `dc3-driver-mysql`             | MySQL data source                      |
| Data bridging                   | `dc3-driver-postgresql`        | PostgreSQL data source                 |
| Data bridging                   | `dc3-driver-oracle`            | Oracle data source                     |
| Data bridging                   | `dc3-driver-sqlserver`         | SQL Server data source                 |
| Data bridging                   | `dc3-driver-redis`             | Redis data source                      |
| Base communication & management | `dc3-driver-tcp-udp`           | TCP / UDP                              |
| Base communication & management | `dc3-driver-serial`            | Serial                                 |
| Base communication & management | `dc3-driver-snmp`              | SNMP                                   |
| Base communication & management | `dc3-driver-can`               | CAN                                    |
| Simulation & debugging          | `dc3-driver-virtual`           | Virtual driver                         |
| Simulation & debugging          | `dc3-driver-listening-virtual` | Listening-style virtual driver         |

To write your own driver, see [Driver Authoring](../development/driver-authoring).

## API Contracts

| Module            | Purpose                                 | Documentation                                                                              |
|-------------------|-----------------------------------------|--------------------------------------------------------------------------------------------|
| `dc3-api-auth`    | Auth Center gRPC / Protobuf contract    | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-api/dc3-api-auth/README.md)    |
| `dc3-api-manager` | Manager Center gRPC / Protobuf contract | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-api/dc3-api-manager/README.md) |
| `dc3-api-data`    | Data Center gRPC / Protobuf contract    | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-api/dc3-api-data/README.md)    |
| `dc3-api-driver`  | Driver gRPC / Protobuf contract         | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-api/dc3-api-driver/README.md)  |

## Messaging and E2E

| Category | Module | Purpose |
|----------|--------|---------|
| Messaging | `dc3-mq-core` / `dc3-mq-rabbitmq` / `dc3-mq-kafka` / `dc3-mq-mqtt` / `dc3-mq-pulsar` | Pluggable message-middleware abstraction — a broker-neutral port plus one adapter per broker; the active implementation is selected via `DC3_MQ_TYPE` (default `rabbitmq`; part of the release line since 2026.9) |
| Messaging TCK | `dc3-mq-tck` | Broker-neutral contract suite — an adapter that passes it is compliant |
| Testing | `dc3-e2e` / `dc3-coverage` | End-to-end tests and coverage aggregation |

## Relational Persistence

| Category       | Module                                                             | Purpose                                                                                          |
|----------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Runtime        | `dc3-db-core` / `dc3-db-runtime`                                   | Paging / tenant / operation contracts; the R2DBC pool, PostgreSQL dialect, and schema-fingerprint startup gate |
| Domain stores  | `dc3-db-auth` / `dc3-db-manager` / `dc3-db-data` / `dc3-db-agentic` | PostgreSQL R2DBC stores for the Auth / Manager / Data / Agentic domains                            |
| Testing        | `dc3-db-tck`                                                       | PostgreSQL Testcontainers contract suite                                                          |

The runtime is PostgreSQL + R2DBC only — JDBC / MyBatis are not supported runtime paths.

## Time-series Storage

The only implementation today is the Data Center's native R2DBC store on **PostgreSQL + TimescaleDB** — there is no
runtime switch and no `DC3_TSDB`-style backend selector; the TDengine / InfluxDB / IoTDB adapters from older docs were
removed when the persistence layer converged. Don't go looking for them.

| Module          | Purpose                                                                                                                  |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|
| `dc3-tsdb-core` | Store-neutral reactive `TsdbStore` port and capability set — point history is implemented by the Data Center's native R2DBC store |

## Common Components

| Category               | Module                            | Purpose                                                                          |
|------------------------|-----------------------------------|----------------------------------------------------------------------------------|
| Base models            | `dc3-common-model`                | Shared models — BO / VO / DTO / Builder / Ext                                    |
| Base capabilities      | `dc3-common-public`               | Shared annotations and entities (tenant markers, tree entities), HTTP client, OAuth/HMAC verification, common utilities |
| Web                    | `dc3-common-web`                  | WebFlux, BaseController, OpenAPI, security baseline                              |
| Constants & exceptions | `dc3-common-constant`             | Constants, enums, value objects                                                  |
| Constants & exceptions | `dc3-common-exception`            | Exception hierarchy                                                              |
| Data access            | `dc3-common-sql`                  | Shared base for the JDBC database drivers (connection management and query execution) |
| Communication          | `dc3-common-mqtt`                 | MQTT client configuration (used by the MQTT driver and other MQTT consumers)     |
| Communication          | `dc3-common-facade-api`           | Cross-service facade interfaces                                                  |
| Communication          | `dc3-common-facade-grpc`          | gRPC facade implementation                                                       |
| Communication          | `dc3-common-facade-local-auth`    | Auth local facade                                                                |
| Communication          | `dc3-common-facade-local-manager` | Manager local facade                                                             |
| Communication          | `dc3-common-facade-local-data`    | Data local facade                                                                |
| Communication          | `dc3-common-facade-local`         | Dependency-only POM aggregating all local facades (for single-process apps)      |
| Domain capabilities    | `dc3-common-auth`                 | Authentication, authorization, tenant, and token domain capabilities             |
| Domain capabilities    | `dc3-common-manager`              | Driver, profile, device, point, and metadata domain capabilities                 |
| Domain capabilities    | `dc3-common-data`                 | Point value, command, and data query domain capabilities                         |
| Domain capabilities    | `dc3-common-driver`               | Driver SDK — registration, scheduling, collection, and command runtime           |
| Domain capabilities    | `dc3-common-agentic`              | AI conversation, model provider, tool call, and memory capabilities              |
| Gateway                | `dc3-common-gateway`              | Gateway filters and routing helpers                                              |
| Platform support       | `dc3-common-log`                  | Logging configuration                                                            |
| Platform support       | `dc3-common-thread`               | Thread pool configuration                                                        |
| Platform support       | `dc3-common-quartz`               | Scheduling infrastructure                                                        |
| Platform support       | `dc3-common-api`                  | API utilities                                                                    |
| Platform support       | `dc3-common-resource`             | Discovers HTTP API endpoints at startup and registers them as Auth authorization resources |
| Testing                | `dc3-common-test`                 | Testcontainers, gRPC, RabbitMQ, and contract test infrastructure                 |

## CLI and Web Frontend

| Module    | Purpose                                                                                          | Documentation                                                       |
|-----------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `dc3-cli` | Standalone TypeScript CLI (`npm install -g dc3-cli`) — see the [CLI manual](../automation/cli)    | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-cli/README.md) |
| `dc3-web` | Vue 3 + TypeScript management console — talks to the backend only through the gateway; see [Frontend](../frontend/) | [README](https://github.com/pnoker/iot-dc3/blob/main/dc3-web/README.md) |

## Related Documentation

- [Architecture Overview](../architecture/)
- [Modules & Dependencies](../architecture/modules)
- [Driver Authoring](../development/driver-authoring)
- [API Documentation](../development/api-documentation)
