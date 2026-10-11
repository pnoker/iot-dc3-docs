---
title: "Your First Device: End to End"
---

<script setup>
import FirstDeviceDiagram from '../../.vitepress/theme/components/FirstDeviceDiagram.vue'
</script>

# Your First Device: End to End

This page walks you through a complete data path with the built-in **virtual driver**: log in to get a token, create a
profile, point, and device, configure the point's attributes, then read live values and send a write command. Each step
has copy-paste commands and a "what you should see" block, so you can follow along directly.

> You are here: you've [started the dependency stack](./) and read the [core concepts](../introduction/concepts). By the
> end of this page you'll have **a device connected through the virtual driver, producing live point values you can
read,
with write commands flowing back to its writable points.**

## What This Path Looks Like

The golden path is a chain of HTTP calls with front-to-back dependencies, all going through the gateway `dc3-gateway` (
`:8000`). The first two steps get a token. The next four build metadata in the Manager Center, and step 7 returns to the
Manager Center to bind attribute configs. The last two read values and send commands through the Data Center. Keep this
map in mind — each step below tells you where you are in it.

<FirstDeviceDiagram lang="en" />

::: info Conventions
All `id` values, tokens, and return values below are **examples**. Your environment generates snowflake IDs (long
strings of digits), so replace them with the real values returned by the previous step. `add` write endpoints **return
the newly created entity directly (including its `id`)** — read the ID from the response body when you need it. `list`
endpoints use flat `offset`/`limit` pagination (zero-based) and return an `OffsetPage` envelope
(`items` / `offset` / `limit` / `total` / `hasNext`). Each step below also shows a name-filtered `list` command you can
use to verify.
:::

## Step 0: Start the Stack

Bring up the database, message queue, and development stack. These two commands start PostgreSQL + RabbitMQ, then the
gateway, the four centers, and the drivers (the virtual driver starts with the stack).

```bash
make up-db && make up-dev
```

**What you should see**: `make ps STACK=db` lists `dc3-postgres` and `dc3-rabbitmq`; `make ps STACK=dev` lists
`dc3-gateway`, `dc3-center-auth/manager/data/agentic`, and 36 `dc3-driver-*` containers as running (db and dev are two
separate stacks — query each). The gateway is reachable at `http://localhost:8000`.

::: tip Point the dc3 CLI at the Gateway First
If you use the `dc3` CLI, tell it the gateway address first (once is enough):
`dc3 config set gateway http://localhost:8000`.
:::

## Steps 1–2: Log In for a Token

Login takes two steps. First, fetch a **salt (valid for 5 minutes)** with the tenant + username. Then submit the
**plaintext password** together with the salt to exchange it for an **access token (valid 12 hours)**. After that, every
protected request must carry three auth headers: `X-Auth-Tenant`, `X-Auth-Login`, `X-Auth-Token`.

::: code-group

```bash [curl]
# 1) Fetch the salt
curl -s -X POST http://localhost:8000/api/v3/auth/token/salt \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3"}'
# Default 2026.9 image line returns a bare text/plain salt: 5434e27b-8c43-400c-af08-92a267d9b017
# The 2026.10 image line (and main) returns JSON: {"salt":"a1b2c3d4e5"} — either way, take the salt

# 2) Submit the plaintext password together with the salt for a token (the salt does not hash the password; verification is server-side)
curl -s -X POST http://localhost:8000/api/v3/auth/token/generate \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3","salt":"a1b2c3d4e5","password":"<plaintext password>"}'
# Default 2026.9 image line returns a bare text/plain token: eyJhbGciOiJIUzI1NiJ9...
# The 2026.10 image line (and main) returns JSON: {"token":"eyJhbGciOiJIUzI1NiJ9..."}
# The token is valid 12 hours; both shapes also set an httpOnly cookie
```

```bash [dc3 CLI]
# The CLI wraps fetching the salt and exchanging it for a token (the password is submitted as-is; verification is server-side)
dc3 auth login --tenant default --username dc3
# Enter the password interactively; the token is saved after login

# Verify
dc3 auth status
dc3 auth token --header   # Print X-Auth-Tenant/X-Auth-Login/X-Auth-Token
```

:::

**What you should see**: `/api/v3/auth/token/salt` returns a non-empty `salt` field; `/api/v3/auth/token/generate` returns
a long JWT (the `token` field, the `<ACCESS_TOKEN>` below). On the CLI path, `dc3 auth status` shows you logged in.

::: warning Every Subsequent Request Needs the Auth Headers
To keep the curl examples short, the three headers are extracted into variables below. Set them in your shell first,
using the real values from the previous step. Note that `X-Auth-Token` is **not** a bare token: the gateway parses it as
JSON `{"salt":"...","token":"..."}` — a missing salt or a bare token gets a 401. Reuse the salt from step 1:

```bash
H_TENANT='X-Auth-Tenant: default'
H_LOGIN='X-Auth-Login: dc3'
H_TOKEN='X-Auth-Token: {"salt":"a1b2c3d4e5","token":"<ACCESS_TOKEN>"}'   # JSON envelope, example
```

:::

## Step 3: Confirm the Virtual Driver Is Registered

When the virtual driver starts with `make up-dev`, it registers itself with the Manager Center. You need its `driverId`
to create a device, so look it up first.

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/driver/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"offset":0,"limit":20}'
```

```bash [dc3 CLI]
dc3 driver list
```

:::

**What you should see**: the returned `items[]` contains a driver whose `driverName` is `Virtual Driver` (with a space,
from `dc3.driver.name` in `application.yml`). Its `driverCode` is the routing identifier `VirtualDriver`, and the
module/service name is `dc3-driver-virtual` — three different fields. Grab its `id`, called `<DRIVER_ID>` below (
example: `92010100000000001`). The virtual driver is a **driver authoring template**: it exists for testing and
bootstrapping new drivers, and produces data without any real device attached.

## Step 4: Add a Profile

A profile describes what a class of devices can do. Here we create a minimal profile to hold the points. Set
`profileShareFlag` to `TENANT` (shared within the tenant) and `enableFlag` to `ENABLE` (enabled).

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/profile/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"profileName":"Virtual Thermo Profile","profileShareFlag":"TENANT","enableFlag":"ENABLE"}'
# Example response (the new ProfileVO, with its id included):
# {"id":"81010100000000001","profileName":"Virtual Thermo Profile","profileShareFlag":"TENANT","enableFlag":"ENABLE","version":0}
# To verify, look it up with a profileName filter + offset/limit pagination:
curl -s -X POST http://localhost:8000/api/v3/manager/profile/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"profileName":"Virtual Thermo Profile","offset":0,"limit":5}'
# Get profileId from items[0].id
```

```bash [dc3 CLI]
dc3 profile create --name "Virtual Thermo Profile"   # returns the new entity; its id is the profileId
dc3 profile list --limit 20                          # list has no --name filter; match the name in the output by hand
```

:::

**What you should see**: `add` returns the newly created profile entity; read the profile ID from the response body (or
from `items[0].id` of the `list` lookup) — call it `<PROFILE_ID>` below
(example: `81010100000000001`).

::: tip profileShareFlag Values
`ProfileShareTypeEnum` is `TENANT` / `DRIVER` / `USER` — whether the profile is shared within the tenant, the driver, or
the user.
:::

## Step 5: Add a Point

A point is the data item you collect or write. **Whether it's writable is set by the point's own `rwFlag`.** Here we
create a `READ_WRITE` point so we can send write commands to it later. Set `pointTypeFlag` to `FLOAT`, attach it to the
profile from the previous step, and give it the unit `°C`.

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/point/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "pointName":"Temperature",
        "pointTypeFlag":"FLOAT",
        "rwFlag":"READ_WRITE",
        "profileId":"81010100000000001",
        "valueDecimal":2,
        "unit":"°C",
        "enableFlag":"ENABLE"
      }'
# Example response (the new PointVO, with its id included):
# {"id":"82010100000000001","pointName":"Temperature","pointTypeFlag":"FLOAT","rwFlag":"READ_WRITE",
#  "profileId":"81010100000000001","unit":"°C","enableFlag":"ENABLE","version":0}
# To verify, look it up with a pointName filter + offset/limit pagination:
curl -s -X POST http://localhost:8000/api/v3/manager/point/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"pointName":"Temperature","offset":0,"limit":5}'
# Get pointId from items[0].id
```

```bash [dc3 CLI]
dc3 point create --name "Temperature" --profile-id "81010100000000001" --rw READ_WRITE   # returns the new entity; its id is the pointId (--rw defaults to READ_ONLY — without it, step 9's write is rejected)
dc3 point list --profile-id "81010100000000001" --limit 20               # filter by profile, then match the name in the output
```

:::

**What you should see**: `add` returns the newly created point entity; read the point ID from the response body (or
from `items[0].id` of the `list` lookup) — call it `<POINT_ID>` below (example: `82010100000000001`).

::: tip rwFlag and pointTypeFlag Values
`RwTypeEnum` is `READ_ONLY` / `WRITE_ONLY` / `READ_WRITE`; a write command against a `READ_ONLY` point is rejected.
`PointTypeEnum` has 8 values: `STRING` / `BYTE` / `SHORT` / `INT` / `LONG` / `FLOAT` / `DOUBLE` / `BOOLEAN`. A point can
also carry a conversion (`baseValue` / `multiple`) that linearly maps the raw value to an engineering value.
:::

## Step 6: Add a Device

A device is a concrete instance bound to one profile and one driver. Use the `<DRIVER_ID>` and `<PROFILE_ID>` from above
to create it.

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/manager/device/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "deviceName":"Virtual Thermo Device-01",
        "driverId":"92010100000000001",
        "profileId":"81010100000000001",
        "enableFlag":"ENABLE"
      }'
# Example response (HTTP 201, the new DeviceVO, with its id included):
# {"id":"83010100000000001","deviceName":"Virtual Thermo Device-01","driverId":"92010100000000001",
#  "profileId":"81010100000000001","enableFlag":"ENABLE","version":0}
# To verify, look it up with a deviceName filter + offset/limit pagination:
curl -s -X POST http://localhost:8000/api/v3/manager/device/list \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" -H 'Content-Type: application/json' \
  -d '{"deviceName":"Virtual Thermo Device-01","offset":0,"limit":5}'
# Get deviceId from items[0].id
```

```bash [dc3 CLI]
dc3 device create --name "Virtual Thermo Device-01" \
  --driver-id "92010100000000001" \
  --profile-id "81010100000000001"      # returns the new entity; its id is the deviceId
dc3 device list --driver-id "92010100000000001" --limit 20   # filter by driver, then match the name in the output
```

:::

**What you should see**: `add` returns 201 with the newly created device entity; read the device ID from the response
body (or from `items[0].id` of the `list` lookup) — call it `<DEVICE_ID>` below (example: `83010100000000001`).

## Step 7: Configure Attributes (Driver + Point)

At startup, the driver declares **which** config items (attributes) it has. This step fills in **concrete values**
(configs) for **this device**. Configs come in **two layers**, and both are required: driver attributes (device-level,
one per device) and point attributes (one per device + point). This is what actually wires the point into the driver's
collection logic.

### 7a. Driver Attributes (device-level, easy to miss)

The attributes the **driver itself** declares (for virtual: `host` / `port` — placeholder values are fine) must be
filled in per device — **skip this and the device is never read and never comes online**: the read scheduler only
schedules devices with non-empty driver-attribute configs (the `DriverReadScheduleJob` gate), the health reporter
behaves the same way, and `device/add` generates no configs on its own.

```bash
curl -s -X POST http://localhost:8000/api/v3/manager/driver_attribute_config/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "attributeId":"<driver attribute id, e.g. host>",
        "deviceId":"83010100000000001",
        "configValue":"localhost",
        "enableFlag":"ENABLE"
      }'
# Example response (the new DriverAttributeConfigVO, with its id included):
# {"id":"...","attributeId":"...","configValue":"localhost",
#  "deviceId":"83010100000000001","enableFlag":"ENABLE","version":0}
# Create one row per virtual driver attribute (host=localhost, port=18600); configs take effect immediately.
```

`attributeId` refers to a registered driver attribute (`DriverAttribute`); look them up with
`GET /api/v3/manager/driver_attribute/list_by_driver_id`. In the console this is the driver-info form on the device
edit page.

### 7b. Point Attributes (device + point level)

The virtual driver's point attribute is `Tag` — a string tag name (default `TAG`). Give this point on this device a tag
name (such as `temp-01`):

```bash
curl -s -X POST http://localhost:8000/api/v3/manager/point_attribute_config/add \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "attributeId":"91010100000000001",
        "deviceId":"83010100000000001",
        "pointId":"82010100000000001",
        "configValue":"temp-01",
        "enableFlag":"ENABLE"
      }'
# Example response (the new PointAttributeConfigVO, with its id included):
# {"id":"...","attributeId":"91010100000000001","configValue":"temp-01",
#  "deviceId":"83010100000000001","pointId":"82010100000000001","enableFlag":"ENABLE","version":0}
# The config takes effect immediately upon write, no separate lookup needed.
```

**What you should see**: both `add` calls return the newly created config entity. Once both config layers take effect,
the virtual driver starts producing values for that point.

::: info Where attributeId Comes From
`attributeId` refers to an attribute (`DriverAttribute` or `PointAttribute`) the virtual driver registered in the
Manager Center. Different drivers declare different attributes — this is the "protocol-layer Attribute vs.
instance-layer Config" split from the [core concepts](../introduction/concepts). The example ID is a placeholder; use
the attribute ID actually registered by the virtual driver in your environment.
:::

::: warning Without driver attributes the device is never read and never comes online
Both the read scheduler and the health reporter have a **device-level driver-attribute gate** (empty configs are
skipped), so the device stays offline and step 8 returns nothing. Even virtual's placeholder host/port must be filled
in — the gate only checks *presence*, not the values. See step 5 of [Device Onboarding](../operation/device-onboarding).
:::

## Step 8: Read Live Point Values

Once values flow, read the latest point values from the Data Center. `/point_value/latest` filters by `deviceId` /
`pointId` at the top level, paginates with flat `offset` / `limit` (zero-based), and returns
`OffsetPage<PointValueVO>` (`items` / `offset` / `limit` / `total` / `hasNext`).

::: code-group

```bash [curl]
curl -s -X POST http://localhost:8000/api/v3/data/point_value/latest \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"83010100000000001","pointId":"82010100000000001","offset":0,"limit":10}'
# Example response (OffsetPage<PointValueVO> shape):
# {"items":[
#   {"deviceId":"83010100000000001","pointId":"82010100000000001",
#    "rawValue":"25.0","calValue":"25.0","numValue":25.0,
#    "hasLatestValue":true,"createTime":"2026-06-22T08:30:00","operateTime":"2026-06-22T08:30:00"}
# ],"offset":0,"limit":10,"total":1,"hasNext":false}
```

```bash [dc3 CLI]
dc3 point read 82010100000000001
```

:::

**What you should see**: at least one `PointValueVO` in `items`, with `rawValue` (the raw value), `calValue` (the
engineering value, as a string), `numValue` (the numeric projection, nullable), and the collection time `createTime`.
The value refreshes as the virtual driver keeps running.

## Step 9: Issue a Write Command

Finally, send a write command to this writable point. `/point_command/write` takes `deviceId` / `pointId` / `value` and
**returns HTTP 202 with a command ID (`commandId`, plus a `statusUri` polling address) right away** — which means "the
command was accepted," not "it ran successfully." To get the result, take the command ID and **poll** the receipt
endpoint `/point_command_history/get_by_command_id` (the query parameter is `command_id`, the ID returned above).

::: code-group

```bash [curl]
# 1) Send the write command and get a commandId immediately
curl -s -X POST http://localhost:8000/api/v3/data/point_command/write \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"83010100000000001","pointId":"82010100000000001","value":"26.5"}'
# Example response (HTTP 202, PointCommandAcceptedVO shape):
# {"commandId":"cmd_20260622_a1b2c3d4",
#  "statusUri":"/point_command_history/get_by_command_id?command_id=cmd_20260622_a1b2c3d4"}
# Note: statusUri is a service-relative path; through the gateway prepend /api/v3/data — i.e. the next URL.

# 2) Poll the receipt with command_id
curl -s -X GET 'http://localhost:8000/api/v3/data/point_command_history/get_by_command_id?command_id=cmd_20260622_a1b2c3d4' \
  -H "$H_TENANT" -H "$H_LOGIN" -H "$H_TOKEN"
# Example response (PointCommandHistoryVO shape):
# {"commandId":"cmd_20260622_a1b2c3d4","deviceId":"83010100000000001","pointId":"82010100000000001",
#  "requestValue":"26.5","responseValue":"...","status":"SUCCESS","finishTime":"2026-06-22T08:31:02"}
```

```bash [dc3 CLI]
# Send the write
dc3 point write 82010100000000001 --device-id 83010100000000001 --value 26.5
# Polling the receipt: the CLI does not wrap the point_command_history endpoint — use curl step 2 above
# with command_id (`dc3 command history` queries the recordId of the `dc3 command call` path, a different resource)
```

:::

**What you should see**: the write returns a `commandId` right away; poll the receipt until `status` reaches a terminal
state (`SUCCESS` / `FAILED` / `TIMEOUT` / `EXPIRED` / `DEAD` / `DUPLICATE` — `DEAD` means the command went to the
dead-letter queue and will not be processed again, `DUPLICATE` means it was rejected by the driver's dedup cache;
`PENDING` / `SENT` are in flight). That closes the loop — you've run the full bidirectional path of "read value + write
command."

::: tip Writes on virtual always land FAILED — expected
The virtual driver's point-write `write()` is a **stub** (the source returns `false` outright): the receipt lands in
`FAILED` with `Device write returned false`, and a failed write never echoes the written value. This is not a broken
path — the successful reads prove the path works; switch to a real protocol driver (e.g. Modbus) to see `SUCCESS`.
See [Virtual driver](../drivers/virtual), section "write commands always fail".
:::

::: danger Write Command Semantics: Asynchronous, Poll-Required, Failure Does Not Echo the Value

- Write commands are **asynchronous**: `/point_command/write` returns a `commandId` immediately and does **not** wait
  for the device to finish. Poll for the result with that ID at `/point_command_history/get_by_command_id`.
- Commands have a **TTL**: `PointCommandDTO.expireAt` defaults to `now + 10s` (write commands are fixed at 10 seconds,
  with no override field). A command not executed by then is expired. Only the separate `dc3 command call` path uses the
  command definition's `timeout` field (default 30 seconds).
- **On failure, the written value is not echoed back**: when the receipt shows a failure, it carries no "value that was
  written" — so don't read "got a commandId" as "the write succeeded."
- Only points whose `rwFlag` includes write permission (`WRITE_ONLY` / `READ_WRITE`) accept write commands.
:::

## Further Reading

- [Device Onboarding](../operation/device-onboarding) — expand this minimal path into the full onboarding flow for a
  real driver
- [Data and Commands](../operation/data-commands) — the full mechanics of collection persistence and read/write
  commands, plus receipt semantics, across the two planes
- [CLI Guide](../automation/cli) — the complete `dc3` CLI command surface, with scripting and AI-integration usage
