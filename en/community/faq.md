---
title: FAQ
---

# FAQ (Q&A)

## Licensing

### What open-source license does IoT DC3 use?

IoT DC3 is released under the [AGPL-3.0](https://github.com/pnoker/iot-dc3/blob/release/LICENSE-AGPL.txt) license.

The core requirement of AGPL-3.0: if you modify the platform code and **provide it as a network service** (including
SaaS or internal systems), you must open-source the complete modified source code. Internal use without redistribution
or network service provision does not require open-sourcing.

### What does AGPL-3.0 mean for my company?

| Scenario                                                                | Must open-source?                               |
|-------------------------------------------------------------------------|-------------------------------------------------|
| Internal deployment, no code changes, self-use only                     | No                                              |
| Internal deployment, modified code, self-use only (no network service)  | No (but contributions welcome)                  |
| SaaS product built on DC3, sold externally                              | **Yes**, all modifications must be open-sourced |
| Secondary development based on DC3, distributed to customer deployments | **Yes**, all modifications must be open-sourced |
| Only calling DC3 APIs, no changes to DC3 itself                         | No                                              |

### Can I develop proprietary derivatives?

If you only call DC3 APIs without modifying DC3 source code, your caller-side code can remain closed-source. Once you
modify DC3 source code and provide it as a network service, AGPL-3.0 requires you to open-source your modifications; for closed-source integration or OEM distribution, an Enterprise commercial license (https://dc3.site/en/pricing/) is available.

### Is there a commercial license?

Yes. The community edition is fully open source under AGPL-3.0; when AGPL does not fit (closed-source integration, OEM distribution), the Enterprise edition offers a commercial license. Plans and pricing: [dc3.site/en/pricing](https://dc3.site/en/pricing/).

---

## Pricing & Business Model

### Does IoT DC3 itself cost money?

**The community edition is free**: every feature is open source (AGPL-3.0). The Pro edition subscribes by point-count tiers (official support, scale coverage); Enterprise adds commercial licensing and customization. Tiers define the scale the team officially supports, not feature unlocks. See [Pricing](https://dc3.site/en/pricing/).

### How does the project sustain itself?

Through Pro subscriptions and Enterprise services. The community edition stays free and complete forever; Pro/Enterprise add official support, scale coverage, and commercial licensing per the [pricing page](https://dc3.site/en/pricing/).

### Do I need to pay anyone to use IoT DC3?

Self-hosting the community edition costs nothing (you cover your own infrastructure). Official support, larger scale, or a commercial license come with the Pro/Enterprise subscriptions on the [pricing page](https://dc3.site/en/pricing/).

---

## Technology Choices

### Why Java instead of Go / Node.js / Python?

Java + Spring is the maintainer's engineering call. The reasons, in order of weight:

- A large body of existing industrial systems (SCADA, MES, ERP) already run on Java; sharing the language makes those
  integrations the cheap path
- Spring Boot / Cloud / Security / Data turn distributed systems, security, and data access into defaults instead of
  build-it-yourself work
- Device-access services run for months without restarts; JVM memory management and GC are production-proven at that
  job
- Spring AI provides a unified LLM access layer — the Agentic Center is built directly on it (see
  [Why Spring AI](../ai/spring-ai-deep-dive))

### Why PostgreSQL instead of MySQL?

The platform's data architecture is built on three PostgreSQL extensions, and that is what locks the choice in:

- **TimescaleDB** — native hypertable partitioning, compression, and retention policies for IoT time-series data
- **Apache AGE** — graph queries for device relationships and topology paths
- **pgvector** — vector search, the groundwork for AI semantic queries

JSONB, arrays, and range types are used in several places as well.

### What device protocols are supported? How do I choose?

The platform includes **28 built-in driver modules**, covering:

- **Industrial Bus / PLC**: Modbus TCP/RTU, OPC UA/DA, S7 (Siemens), MELSEC, FINS (Omron), EtherNet/IP
- **SCADA / Power / Metering**: BACnet/IP, KNX, IEC 104, DNP3, IEC 61850, DLMS, DL/T645, M-Bus, SL651, SNMP
- **IoT / Wireless**: MQTT, CoAP, LwM2M, HTTP, BLE, Zigbee, CAN, LoRaWAN, Kafka
- **Serial / General Network**: Serial, TCP/UDP
- **Database**: MySQL, PostgreSQL, Oracle, SQL Server, Redis

Selection tip: first identify the protocols your field devices support, then check
the [Driver Capability Matrix](../drivers/matrix) to confirm the required read / write / subscribe capabilities are met.

---

## Deployment & Operations

### Minimum hardware requirements?

These are reference starting points for getting the stack up; size for your actual device count and data volume:

**Development environment** (dependency stack only — PostgreSQL + RabbitMQ):

- CPU: 2 cores
- RAM: 4 GB
- Disk: 20 GB

**Production environment** (full stack — gateway + 4 centers + N drivers + dependencies):

- CPU: 8 cores or more
- RAM: 16 GB or more
- Disk: 100 GB SSD or more (time-series data grows continuously; plan for expansion)

### How to migrate from development to production?

1. **Security hardening**: Change default keys / passwords, enable TLS, configure firewall rules, disable debug
   endpoints.
2. **Data persistence**: Ensure PostgreSQL and RabbitMQ data volumes are correctly mounted and backed up.
3. **High availability**: Configure PostgreSQL replication and RabbitMQ clustering as needed.
4. **Monitoring & alerting**: Deploy Prometheus + Grafana (included in docker-compose-optional.yml).
5. **Log collection**: Integrate with ELK (included in docker-compose-optional.yml).
6. **Environment variables**: See [Environment Variables](../quickstart/environment) and replace development values with
   production values.

See [Security Policy](./security) for the production baseline checklist.

### How do I back up data?

PostgreSQL data backup:

```bash
# Full backup
podman exec dc3-postgres pg_dumpall -U dc3 > backup.sql

# Platform data only (exclude TimescaleDB time-series data)
podman exec dc3-postgres pg_dump -U dc3 \
  --schema=dc3_auth --schema=dc3_manager --schema=dc3_data > backup_platform.sql
```

For production, configure pgBackRest or scheduled pg_dump tasks with offsite storage.

---

## Driver Development

### How do I develop a new driver?

1. Read the [Driver Development Guide](../development/driver-authoring).
2. Copy the closest existing driver module under `dc3-driver/` as a template.
3. Implement the `read()` and `write()` methods required by the Driver SDK (optional hooks such as custom scheduling and health checks are covered in the driver guide).
4. Add the driver service configuration to `dc3/docker-compose.yml`.
5. Write documentation (follow the format of existing driver doc pages).

### Does a driver have to be written in Java?

The Driver SDK itself is in Java, but you can also implement device access in any language via **MQTT bridging** or **HTTP proxy**. A non-Java program publishes data to an MQTT topic → the MQTT driver subscribes → data enters the
platform pipeline. However, this approach loses the SDK's built-in state management, automatic reconnection, and health
reporting capabilities.

---

## AI Capabilities

### What can AI do?

The Agentic Center (built on Spring AI) connects an LLM to the platform, so a conversation can:

- Query device status and point values
- Read and write points, and issue commands to devices (high-risk operations require confirmation)

The platform also auto-aggregates its 330+ HTTP APIs into an MCP (Model Context Protocol) tool catalog that tools like
Claude Desktop, VS Code, and Cursor can call directly after OAuth 2.1 authorization. See the [AI Overview](../ai/).

### Which LLM providers are supported?

The Agentic Center exposes an OpenAI-compatible chat endpoint — any model service that speaks the OpenAI API works:
GPT, Claude, DeepSeek, Tongyi Qianwen, and others. See the [Agentic Center](../ai/agentic) for configuration.

---

## Community & Contribution

### How do I get help?

1. Check the [Troubleshooting Guide](../guide/troubleshooting).
2. Search [GitHub Issues](https://github.com/pnoker/iot-dc3/issues) for similar problems.
3. Not found? Open a new issue with: version number, logs, reproduction steps, and environment info.

### How can I contribute?

See the [Contributing Guide](./contributing). All forms of contribution are welcome: bug reports, documentation
improvements, code contributions, and discussions.

### Is commercial support available?

Yes. The Pro and Enterprise editions are the official support channels (scale coverage included; Enterprise adds dedicated drivers and customization) — see [the pricing page](https://dc3.site/en/pricing/). The community edition is supported through GitHub issues and community channels.
