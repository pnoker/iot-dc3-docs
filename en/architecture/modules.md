---
title: Module Map
---

<script setup>
import ModulesFlowDiagram from '../../.vitepress/theme/components/ModulesFlowDiagram.vue'
import ModulesClassDiagram from '../../.vitepress/theme/components/ModulesClassDiagram.vue'
</script>

# Module Map

IoT DC3's code splits into three kinds of modules: deployment units, shared contracts, and protocol drivers. This page
covers the architecture side — which modules ship as runnable services, which shared libraries and contracts they lean
on to talk to each other, how the 36 drivers break down by protocol, and what the Driver SDK's SPI looks like. Read it
once and you'll know where any feature lives and what it depends on.

> Where this fits: you've already read the [System Architecture Overview](./) and [Services & Topology](./services). Now
> you want those same boundaries from a module and dependency angle. For a plain per-module list, see
> the [Module Inventory](../modules/).

## Three categories, three lifecycles

Don't try to hold the dozens of Maven modules in your head as a flat list. They fall into three categories, each with
its own reason for existing:

- **Deployment units** (`dc3-gateway`, `dc3-center-*`, `dc3-driver-*`) — packaged into runnable Spring Boot processes,
  listed in compose files, each on its own port. This is the granularity that operations and topology care about.
- **Shared and contract libraries** (`dc3-api-*`, `dc3-common-*`) — they don't run on their own; deployment units depend
  on them. They carry "how services talk to each other" (gRPC contracts, facade interfaces) and "what everyone shares" (
  entities, enums, DAL, messaging config).
- **Protocol drivers** (`dc3-driver-*`) — a special kind of deployment unit. Each driver is its own process, but all of
  them stand on the same SDK (`dc3-common-driver`) and fill in only the thin slice of protocol adaptation.

Dependencies run one way across these three: drivers and centers depend on shared libraries, shared libraries depend on
contract libraries, and the contract layer never depends back on business logic. Here's that dependency graph, then
we'll walk through each category.

## How modules depend on each other

The diagram drops infrastructure (PostgreSQL / RabbitMQ) and the individual common submodules to show only the skeleton
of who depends on whom. The gateway and the four centers each build on their own `dc3-common-*` domain library.
Cross-service calls all go through facade contracts, and drivers fetch metadata from the management center through
facades while exchanging values and commands with the data center over RabbitMQ.

<ModulesFlowDiagram lang="en" />

The facade sits as a middle layer that many sides depend on. Business code only has a compile-time dependency on the
interfaces in `dc3-common-facade-api`; at runtime the `grpc` or `local` implementation gets injected, and the caller
never sees the transport. This "three-state" design is what lets IoT DC3 run as a distributed deployment or fold into a
monolith. See [Facade Modes](./facade-modes) for the details.

## Deployment units: gateway, four centers, and drivers

These are the modules that ship as running processes. Ports and what's exposed are governed by compose: the gateway's
`8000` is the **logical** single API aggregation entry, but the app stack doesn't publish it to the host (outside traffic
reaches it through the web frontend's `8080` reverse proxy; only the dev stack publishes `8000` directly — see
[Services & Topology](./services)). The HTTP/gRPC ports of the other centers are all cluster-internal.

| Deployment unit      | Role                                                                                          | HTTP   | gRPC   | External              |
|----------------------|-----------------------------------------------------------------------------------------------|--------|--------|-----------------------|
| `dc3-gateway`        | Logical single API entry, authentication pass-through, MCP resource server                    | `8000` | —      | Depends on stack      |
| `dc3-center-auth`    | Authentication / tenant / RBAC / OAuth 2.1                                                    | `8300` | `9300` | No                    |
| `dc3-center-manager` | Metadata management for drivers / profiles / devices / points, and the rest                   | `8400` | `9400` | No                    |
| `dc3-center-data`    | Point value persistence, command dispatch and acknowledgement, alarms                         | `8500` | `9500` | No                    |
| `dc3-center-agentic` | LLM sessions, tool calls, memory                                                              | `8600` | —      | No                    |
| `dc3-center-single`  | A monolith merging auth + manager + data + agentic (all four centers, local facade)           | `8100` | `9100` | Depends on deployment |
| `dc3-driver-*`       | Protocol adaptation (36 standalone processes)                                                 | Varies | —      | A few only            |

`dc3-center-single` folds **all four** centers into one process (its `pom.xml` depends on `dc3-common-auth`,
`dc3-common-manager`, `dc3-common-data`, and `dc3-common-agentic` alike) and uses the `local` facade for in-process
direct calls — a good fit for local development or small, resource-constrained deployments. It shares the same
`dc3-common-*` domain libraries as the distributed four-center version; the only differences are the facade
implementation and the packaging.

::: info The Agentic Center has no gRPC port
`dc3-center-agentic` exposes only HTTP (`8600`) and opens no gRPC server port. It acts as a facade caller to reach the
other centers, and the other centers never call it back over gRPC.
:::

::: tip Only a few drivers expose ports externally
Most drivers are outbound by nature: they poll devices on a schedule and push values to RabbitMQ, with no need to listen
on inbound ports. The exception is reverse-ingestion drivers like `dc3-driver-listening-virtual`, which listens on TCP
`6270` / UDP `6271` so external systems can push data in. Those two ports get mapped to the host.
:::

## Shared and contract: how services talk to each other

The reason deployment units can each mind their own business yet still work together is the layer of libraries
underneath them — none of which run on their own. They answer two questions: **how to move calls across processes** (the
contract layer) and **what everyone shares** (the shared layer).

**The contract layer `dc3-api-*`** holds the protobuf / gRPC contract definitions. `dc3-api-auth`, `dc3-api-data`,
`dc3-api-driver`, and `dc3-api-manager` each describe the RPCs the corresponding center exposes. Change a proto and
you've changed the inter-service contract — that means regenerating stubs and running the contract tests.

**The facade three-state** is the part most worth understanding on this page. It splits "which service to call" away
from "what transport to use" across three modules with clean responsibilities:

| Module                                        | Responsibility                                                                           | When active                                  |
|-----------------------------------------------|------------------------------------------------------------------------------------------|----------------------------------------------|
| `dc3-common-facade-api`                       | Defines the Java interfaces for cross-service calls (business code depends only on this) | Always                                       |
| `dc3-common-facade-grpc`                      | The gRPC implementation of those interfaces, going through `dc3-api-*` stubs underneath  | `dc3.facade.{auth,manager,data}.mode=grpc` (grpc is the default when unset — the distributed default) |
| `dc3-common-facade-local-{auth,manager,data}` | The in-process direct-call implementation of those interfaces                            | the same switch `=local` (monolith)          |

The switches are **per target center**: `dc3.facade.auth.mode` / `dc3.facade.manager.mode` / `dc3.facade.data.mode`,
taking `grpc` (default), `local`, or `disabled` (set `disabled` when the process itself is that center — no
implementation is wired at all).

Controllers and services only ever `@Autowired` the interfaces in `dc3-common-facade-api`. They never bind directly to
gRPC stubs or a specific service. That's exactly why [Facade Modes](./facade-modes) can switch deployment topology
without touching business code.

**The shared layer `dc3-common-*`** is the cross-service reusable infrastructure and domain libraries, grouped into four
by responsibility:

- Foundation: `dc3-common-constant` (enums and constants, like `PointCommandTypeEnum`), `dc3-common-model` (BO / VO /
  DTO, like `PointCommandDTO`), `dc3-common-exception`, `dc3-common-public` (the `R<T>` response wrapper),
  `dc3-common-web`, `dc3-common-log`, `dc3-common-thread`.
- Data access: `dc3-db-*` (the R2DBC data-access layer — `dc3-db-core` provides the offset/cursor paging base,
  alongside `dc3-db-runtime` and the per-center stores `dc3-db-{auth,manager,data,agentic}`). On the time-series side,
  `dc3-tsdb-core` defines the `TsdbStore` port, implemented for TimescaleDB by `R2dbcTsdbStore` in `dc3-db-data`.
- Communication: `dc3-mq` (the broker-neutral messaging layer — `dc3-mq-core` defines the send/receive contract, and
  `dc3-mq-{rabbitmq,kafka,pulsar,mqtt}` are the broker adapters; `RabbitNames` inside the RabbitMQ adapter holds the
  physical names like `dc3.e.value`), plus `dc3-common-mqtt` (drivers connecting straight to an external MQTT broker).
- Domain: `dc3-common-{auth,manager,data,driver,gateway,agentic}`, each holding the business logic of one deployment
  unit. The `dc3-center-manager` process, for example, is little more than the runtime shell around
  `dc3-common-manager`.

::: info Runtime caching uses Caffeine, not Redis
The token denylist, permission caching, and the like use in-process Caffeine. There's no dependency on standalone
Redis. Point **latest values** are not a cache: they live in the shared `dc3_point_latest` projection table, updated in
the same transaction as the history write, and every Data Center replica reads and writes the same table.
:::

## Drivers grouped by protocol

The 36 drivers carry the platform's protocol breadth. Grouping them by protocol family makes the one you need easier to
find than a long flat list. Each driver is a `dc3-driver-<protocol>` module. They all inherit the same SDK, and differ
only in the protocol adaptation.

| Category                  | Representative drivers                                                                | Notes                                                                                                                                   |
|---------------------------|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Industrial fieldbus / PLC | `dc3-driver-modbus-tcp`, `dc3-driver-opc-ua`, `dc3-driver-plcs7`, `dc3-driver-iec104` | The most common group on factory and power SCADA floors. Also includes modbus-rtu, opc-da, ethernet-ip, fins, melsec, bacnet-ip, sl651. |
| IoT wireless              | `dc3-driver-mqtt`, `dc3-driver-coap`, `dc3-driver-lwm2m`, `dc3-driver-http`           | Lightweight and constrained devices. Also includes ble, zigbee.                                                                         |
| Basic communication       | `dc3-driver-tcp-udp`, `dc3-driver-serial`, `dc3-driver-snmp`, `dc3-driver-can`        | Raw socket, serial port, network management, in-vehicle bus.                                                                            |
| Database bridging         | `dc3-driver-mysql`, `dc3-driver-postgresql`                                           | Ingest external databases as data sources. Also includes oracle, sqlserver.                                                             |
| Metering                  | `dc3-driver-dlms`                                                                     | DLMS/COSEM smart electricity meters.                                                                                                    |
| Simulation                | `dc3-driver-virtual`, `dc3-driver-listening-virtual`                                  | See the notes below.                                                                                                                    |

The simulation category has two members with entirely different roles. Don't confuse them:

- **`dc3-driver-virtual`** is the **driver development template**. To write a new protocol driver, you copy and rename
  it; it shows the SDK's full surface (registration, scheduling, read/write, health). The "first device" walkthrough
  in [Quick Start](../quickstart/) runs on the synthetic values it produces.
- **`dc3-driver-listening-virtual`** is **reverse-listening ingestion**. Instead of polling, it listens on TCP/UDP ports
  and waits for external systems to push data in — for cases where the device or system reports on its own, rather than
  the platform collecting.

::: danger `dc3.driver.code` is a stable registration identity — don't change it casually
Each driver registers with the management center using `dc3.driver.code` at startup. The RabbitMQ routing key for values
and commands comes from the driver service name `dc3.driver.service` (`driverProperties.getService()`, with the node
name appended for commands), while the per-instance queue-name suffix takes `dc3.driver.client` — code, service, and
client are three independent fields on `DriverProperties`. Change code and you swap the registration identity; change
service or client and you swap the routing identity. Either way, in-flight messages or registration records lose their
owner. Unless you migrate accordingly, don't change these values on a driver that's already deployed.
:::

## The Driver SDK's SPI: one aggregate interface, seven contracts

The SDK shared by all drivers lives in `dc3-common-driver`. Its extension point for driver authors is
`DriverCustomService` — an interface that **declares no methods of its own**. It just aggregates the 7 capability
interfaces a driver typically implements. The SDK injects it when it wants the union of all driver hooks. A new driver
that needs only a subset can implement the smaller individual interfaces instead.

<ModulesClassDiagram lang="en" />

The seven contracts each cover a segment of the driver's life. `DriverLifecycle` handles startup initialization and
schedule registration. `DriverMetadataListener.event(...)` receives metadata changes to refresh the local cache.
`DriverHealth` and `DeviceHealth` report driver-level and device-level health. `DriverProtocol` is the core read and
write — `read(...)` returns `ReadPointValue`, `write(...)` returns `Boolean`. `DriverCommand` handles custom commands.
And `DriverValidator` does validation, with a `simulate(...)` that's a **deterministic** synthetic value generator:
stable output, distinct from the random values the virtual driver produces on the fly with `ThreadLocalRandom` inside
`read()`.

::: danger A failed write command echoes no value
`DriverProtocol.write(...)` counts as success only when it returns `Boolean.TRUE`. On failure the command result's
`responseValue` is `null`, and it **echoes no written value back**. That's deliberate — it keeps a failure from looking
like a success.
:::

::: tip Health-status TTL must exceed the heartbeat cycle
The health status a driver reports carries a TTL (the lease duration), and that TTL must exceed the cadence of the
device-health check — otherwise the device gets judged offline between two heartbeats and flaps. SDK defaults: the
health cron runs every **15 seconds** (`0/15 * * * * ?`) with a lease `timeout: 45` seconds — keep that ratio and it
won't flap. Slow the health cron down to 30 seconds and the TTL must be greater than 30 seconds (45 seconds or more
recommended); see the health section of [Driver Authoring](../development/driver-authoring) for the full story.
:::

The SDK also ships runtime services for registration (`DriverRegisterService`, with exponential-backoff retry),
scheduling (`DriverScheduleService`, Quartz-driven), and sending (`DriverSenderService`, including `pointValueSender` /
`deviceStatusSender`, and the rest) that driver authors generally don't need to touch. For the full development
workflow, see [Driver Authoring](../development/driver-authoring).

## How this differs from the Module Inventory page

This page is about **architecture and dependencies**: what categories the modules fall into, who depends on whom, how
the facade three-state decouples things, how drivers are grouped, and what the SDK exposes. If what you want is a **per-module purpose quick reference** — a one-line description for each `dc3-common-*` / `dc3-api-*` submodule — go to
the [Module Inventory](../modules/). That page is reference material; this one is the mental model.

## Further reading

- [Module Inventory](../modules/) — a per-submodule purpose quick-reference table
- [Services & Topology](./services) — deployment-unit ports, startup order, and health checks
- [Facade Modes](./facade-modes) — how the `grpc` and `local` states switch deployment topology
- [Driver Authoring](../development/driver-authoring) — the full workflow for deriving a new protocol driver from the
  virtual template
