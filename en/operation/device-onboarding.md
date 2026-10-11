---
title: Device Onboarding
---

<script setup>
import DeviceOnboardingSelectDiagram from '../../.vitepress/theme/components/DeviceOnboardingSelectDiagram.vue'
import DeviceOnboardingFlowDiagram from '../../.vitepress/theme/components/DeviceOnboardingFlowDiagram.vue'
</script>

# Device Onboarding

Onboarding a field device into IoT DC3 takes six steps: pick a driver by protocol, build a profile and its points,
create a device bound to that profile and driver, fill in the concrete point attribute values, fill in the concrete
driver attribute values, then enable it and confirm it's online with queryable data. This page walks the full flow
with the built-in `dc3-driver-virtual`, then shows how the same steps apply to real protocols.

> You are here: you already understand the [Core Concepts](../introduction/concepts) (driver/profile/device/point, the
> three configuration layers) and are onboarding your first device. For a faster copy-paste version,
> see [First Device](../quickstart/first-device).

## Decide First: Which Driver

The first decision is **which driver to use, based on the protocol the device speaks**. A driver (Driver /
`dc3-driver-*`) is a protocol adapter. It knows how to talk to a class of devices and tells the Manager Center which
configuration items those devices and points need. Pick the wrong protocol and the profile and points downstream won't
line up.

The platform ships 36 built-in drivers covering industrial fieldbus, IoT wireless, database bridging, and basic
communication. The diagram maps common choices to a single driver module by protocol:

<DeviceOnboardingSelectDiagram lang="en" />

::: tip Two tips when you're unsure

- **Run the virtual driver first**: `dc3-driver-virtual` generates synthetic values from configuration and needs no real
  device. It's the fastest way to validate the whole "profile → device → point → queryable data" chain, and it's also
  the template project for writing a new driver.
- **Data direction decides the mode**: when the platform reads from the device (polling), use a conventional driver like
  `dc3-driver-virtual`. When an external system pushes data into the platform, use the reverse-listening
  `dc3-driver-listening-virtual` (TCP `6270` / UDP `6271`).

:::

The full list of all 36 drivers (industrial / IoT / database / metering / simulation) is
in [Driver Authoring](../development/driver-authoring) and the module map. The sections below follow a real onboarding
flow using `dc3-driver-virtual`.

## How the Data Flows During Onboarding

To know what "onboarded successfully" means, look at how a value travels from the device to a queryable location. The
driver reads raw values over the protocol, normalizes them into a `PointValue`, persists them to the Data Center (Data
Center / `dc3-center-data`) through RabbitMQ, and exposes them through the Gateway (Gateway / `dc3-gateway`, the single
external entry point, port `8000`).

<DeviceOnboardingFlowDiagram lang="en" />

So a device is successfully onboarded not when the driver starts, but **when this chain is fully connected and the
device's latest point values are queryable in the Data Center**. The switches, queues, and TTLs in this data plane are
covered in [Data and Commands](./data-commands).

## Step 0: Bring Up the Stack and Register the Driver

Before onboarding, get the dependencies and center services running, then start the target driver:

- PostgreSQL, RabbitMQ, and the core center services (auth / manager / data center) are up.
- Running from local source? Load the environment variables first: `source dc3/env/dev.env.sh`. This points the local
  Java processes at the services Compose exposes on `localhost`. See [Environment Variables](../quickstart/environment)
  for details.
- Start at least one driver — for example, the virtual driver.

```bash
java -jar dc3-driver/dc3-driver-virtual/target/dc3-driver-virtual.jar
```

On startup, `DriverInitRunner` runs three steps: **register → `initial()` → `schedule()`**. It submits a `RegisterBO` to
the Manager Center over gRPC, carrying the driver code, name, service info, tenant, and every attribute definition it
declares. A failed registration is retried automatically with exponential backoff (2–30 seconds, up to 30 attempts).

::: danger `dc3.driver.code` is a stable routing identifier

The driver code `dc3.driver.code` is the stable identifier for message routing and device ownership. **Don't change it
after registration** — changing it is equivalent to swapping in a different driver, and any already-bound devices will
lose their link. Each driver instance's code must be unique and stable.

:::

If the driver doesn't appear in the driver list after a moment, check these common causes:

| Symptom                                          | Resolution                                                     |
|--------------------------------------------------|----------------------------------------------------------------|
| Manager Center not started                       | Start the Manager Center first, then restart the driver        |
| `CENTER_MANAGER_HOST` points to the wrong target | Check `dc3/env/dev.env(.sh)` or your IDE environment variables |
| Duplicate driver code                            | Keep `dc3.driver.code` unique and stable                       |
| RabbitMQ not ready                               | Wait for the health check to pass, then restart the driver     |

## Steps 1–5: The Golden Path Onboarding

The walkthrough uses the gateway HTTP API. All write endpoints go through the gateway on `:8000`, and protected
endpoints require the auth headers `X-Auth-Tenant` / `X-Auth-Login` / `X-Auth-Token` (call
`POST /api/v3/auth/token/salt` to get the salt, then `POST /api/v3/auth/token/generate` to get a token valid for 12
hours; see the golden-path login flow for details). Note that the `X-Auth-Token` value must be a **JSON envelope**
`{"salt":"...","token":"..."}` (both fields come from the login response) — a bare token gets a 401 from the gateway.
Define it as a variable once; the examples below all reference it. The IDs and names in the examples are sample values.

```bash
H_TOKEN='X-Auth-Token: {"salt":"<salt from login>","token":"<token from login>"}'
```

### 1. Create a Profile

Create a capability profile for devices of the same kind. The profile defines which points, commands, and events this
class of devices has, and a device just reuses it.

```bash
curl -X POST http://localhost:8000/api/v3/manager/profile/add \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"profileName":"virtual-motor","profileShareFlag":"TENANT","enableFlag":"ENABLE"}'
# Response: the new ProfileVO, with its id included (that id IS the profileId later steps need)
# To double-check, call POST /api/v3/manager/profile/list and look it up by profileName
```

`profileShareFlag` takes a `ProfileShareTypeEnum` value (`TENANT` / `DRIVER` / `USER`) that sets the profile's sharing
scope.

### 2. Create Points Under the Profile

A point (Point) is a single data item. The key fields are the data type `pointTypeFlag` and the read/write direction
`rwFlag`. Whether a point is writable **is set by its own `rwFlag`**, not by the command table. The optional
`baseValue` / `multiple` linearly convert the raw value into an engineering value, and `unit` labels the unit.

```bash
curl -X POST http://localhost:8000/api/v3/manager/point/add \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"pointName":"temperature","pointTypeFlag":"DOUBLE","rwFlag":"READ_WRITE",
       "profileId":"<profileId from the previous step>","valueDecimal":2,"unit":"celsius","enableFlag":"ENABLE"}'
# Response: the new PointVO, with its id included (that id IS the pointId later steps need)
# To double-check, call /api/v3/manager/point/list and look it up by pointName
```

`pointTypeFlag` takes a `PointTypeEnum` value (`STRING` / `BYTE` / `SHORT` / `INT` / `LONG` / `FLOAT` / `DOUBLE` /
`BOOLEAN`, 8 total). `rwFlag` takes a `RwTypeEnum` value (`READ_ONLY` / `WRITE_ONLY` / `READ_WRITE`).

### 3. Create a Device and Bind It to a Profile and Driver

A device (Device) is the platform mirror of one concrete field device. It **binds to one profile** (which sets its
points) **and one driver** (which sets how it communicates).

```bash
curl -X POST http://localhost:8000/api/v3/manager/device/add \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceName":"motor-01","driverId":"<virtual driver id>",
       "profileId":"<profileId>","enableFlag":"ENABLE"}'
# Response: HTTP 201 + the new DeviceVO, with its id included (that id IS the deviceId later steps need)
# To double-check, call /api/v3/manager/device/list and look it up by deviceName
```

Once the device is created, the driver picks up the change through a metadata event (`DriverMetadataListener.event(...)`
receives ADD/UPDATE/DELETE) and refreshes its cache. In most cases you don't need to restart the driver.

### 4. Configure the Device's Point Attributes (the Config values for Attributes)

This step is the easiest to get wrong, so keep two concepts apart:

::: info Attribute is "what exists" registered by the driver; Config is the "concrete value" filled in by the device
instance

- **Attribute** (`PointAttribute` / `DriverAttribute`, etc.): the protocol-layer configuration items registered from the
  driver's own `application.yml` **when the driver starts**. They declare which configuration items this driver's points
  **require** — say, the register address for Modbus, or the value range for virtual. You don't create attributes; they
  come with the driver's registration.
- **Config** (`PointAttributeConfigDO`, etc.): the **concrete value** **this device** supplies for each attribute
  above — say, "for the temperature point of motor-01, the register address is 40001." This step is exactly about
  filling in Config.

The full explanation of the three configuration layers (business-layer Param / protocol-layer Attribute / instance-layer
Config) is in [Core Concepts](../introduction/concepts).

:::

To write the instance value for a given attribute of a given point on a device, call
`POST /api/v3/manager/point_attribute_config/add`:

```bash
curl -X POST http://localhost:8000/api/v3/manager/point_attribute_config/add \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"attributeId":"<point attribute id registered by the driver>","deviceId":"<deviceId>",
       "pointId":"<pointId>","configValue":"40001","enableFlag":"ENABLE"}'
# Response: the new config entity (with its id included) — use it directly
```

`attributeId` comes from the attribute list the driver registered; `configValue` is the value this device instance
supplies. Each driver declares a different attribute set — the virtual driver declares synthetic parameters like value
ranges, while a Modbus driver declares protocol parameters like registers and addresses.

::: tip Calibrate points with real field parameters

For industrial protocols, focus on verifying: whether the register / address / object ID / topic is correct; the data
type and byte order; whether the multiplier and unit match the field; whether the read/write direction matches the
device's capability; and whether the acquisition interval matches the device's performance. All of these land in
`configValue`.

:::

### 5. Configure the Device's Driver Attributes (the device-level Config)

Besides the point attributes, the attributes the driver declares **for itself** (`DriverAttribute`, e.g. the connection
host/port) must also be filled in **per device** — this is the step that's easy to miss. Call
`POST /api/v3/manager/driver_attribute_config/add`:

```bash
curl -X POST http://localhost:8000/api/v3/manager/driver_attribute_config/add \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"attributeId":"<driver attribute id registered by the driver>","deviceId":"<deviceId>",
       "configValue":"localhost","enableFlag":"ENABLE"}'
# Response: the new config entity (with its id included) — use it directly
```

The virtual driver registers two driver attributes, `host` / `port` (defaults `localhost` / `18600` — copying them
verbatim is fine); a real protocol driver takes real connection parameters (e.g. the Modbus IP and port). The
`attributeId` comes from the attribute list the driver registered; look it up per driver
via `GET /api/v3/manager/driver_attribute/list_by_driver_id`. In the console this step is the driver-info form on the
device edit page.

::: warning Without driver attributes, the device is neither read nor reported online

Both the driver's scheduled reads and its health reporting carry a **device-level driver-attribute gate**: the read job
only schedules devices whose driver attribute config is non-empty, and the health job skips reporting entirely when
that config is empty — the device stays offline forever. Creating a device (`device/add`) does **not** auto-generate
any driver attribute config; you must make this call explicitly. Even though the virtual driver's host/port are
placeholders, they still have to be filled in: the gate checks "is there a config", not what the value is.

:::

## Step 6: After Enabling, Confirm the Device Is Online and the Data Is Queryable

The endpoint of onboarding is confirming the chain is connected. After enabling the device, wait one acquisition cycle,
then check in this order: status, data, logs.

**Check the data first** — if you can query the latest point value, the whole chain is connected. Query this device's
latest values through the gateway:

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v3/data/point_value/latest \
  -H "X-Auth-Tenant: default" -H "X-Auth-Login: dc3" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"<deviceId>","offset":0,"limit":20}'
```

```json [Response shape (sample values)]
{
  "data": {
    "offset": 0, "limit": 20, "total": 1, "hasNext": false,
    "items": [
      {
        "deviceId": "...", "pointId": "...", "driverId": "...", "tenantId": "...",
        "rawValue": "23.71", "calValue": "23.71", "numValue": 23.71,
        "hasLatestValue": true,
        "createTime": "2026-06-22T08:30:00", "operateTime": "2026-06-22T08:30:00"
      }
    ]
  }
}
```

:::

`POST /api/v3/data/point_value/latest` returns an offset-paged `OffsetPage<PointValueVO>` (pagination is the flat
`offset` / `limit` pair, default `limit=50`, max 200). Each record contains `deviceId` / `pointId` /
`driverId` / `tenantId` / `rawValue` (raw value) / `calValue` (engineering value) / `numValue` (numeric projection,
nullable) / `hasLatestValue` / `createTime` / `operateTime`, with times as local date-time. To page through historical
values by time window, use `POST /api/v3/data/point_value/list` (cursor-paged: pass the response's `nextCursor` back
as the next request's `cursor`). The complete read/write command chain is
in [Data and Commands](./data-commands).

**If there's no data, work backward along this chain.** Each hop maps onto the data-flow diagram above:

1. **Driver status**: Is the driver online? Is the device health status `ONLINE`? The device state lease is renewed by
   the health job on `dc3.driver.health.device.cron` (default `0/15`, i.e. a 15-second heartbeat), and the lease TTL
   (`timeout`, default 45 seconds) **must be greater than the heartbeat interval** (the factory pattern is 3× the
   heartbeat). A TTL shorter than the heartbeat marks the device offline between two reports.
2. **Driver logs**: Are there protocol connection errors (can't reach host/port, register out of range, authentication
   failure)?
3. **RabbitMQ**: Is the queue backed up or misbound? That would mean the driver sent the data but the Data Center didn't
   consume it.
4. **Data Center**: Did it receive the point value messages for this device?
5. **Tenant consistency**: Do the `tenantId` values of the device, profile, point, and attribute config all match?
   Cross-tenant access returns 404, not data.
6. **Attribute config**: Check both levels — is the **driver attribute** config missing (missing means the device is
   never read and never reports online; see the gate in Step 5)? And is a **point attribute**'s `configValue` missing,
   or in a format the driver doesn't expect (say, an illegal string in an address field)?

::: warning Device stuck offline? Check the driver attributes and the status TTL first

The two most common "enabled but no value queryable" causes: the driver attribute config was never filled in — the
health job then skips the device entirely and it never reports online (see the gate above); or the status TTL is set
too small — the lease renews on the heartbeat interval (default 15 seconds), and a TTL (default 45 seconds) shorter
than that expires between two reports, marking the device offline. Keep the TTL at 2–3× the heartbeat interval.

:::

Once you've run the virtual driver end to end, apply the same six steps to a real protocol. The only changes are the
driver module chosen in Step 0 and the different point/driver attribute sets each driver declares in Steps 4 and 5.

## Further Reading

- [First Device](../quickstart/first-device) — a shorter copy-paste version. Run it first, then come back here for
  detail.
- [Data and Commands](./data-commands) — after onboarding, how to query historical values, issue read/write commands,
  and handle acknowledgements.
- [Core Concepts](../introduction/concepts) — the driver/profile/device/point mental model and the three configuration
  layers (Param/Attribute/Config).
- [Driver Authoring](../development/driver-authoring) — the list of 36 drivers, the SPI contract, and how to write a new
  protocol driver starting from `dc3-driver-virtual`.
