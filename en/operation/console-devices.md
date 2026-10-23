---
title: Console · Device Management
---

# Console · Device Management

Device management is the most-used page in the web console: onboarding, searching, enabling, and deleting devices all happen here. This page walks through each action in the order you'd perform it — open the page, find the device, make the change — and maps every UI action to its API, so when a click doesn't do what you expect, you know what to look for in the logs.

> You are here: the stack is up, a [driver](../drivers/) is ready, and you want to manage devices from the UI instead of calling APIs. For the full onboarding context (and what the attributes mean), see [Device Onboarding](./device-onboarding); for field-level and API semantics, see the [Device concept](../introduction/concepts/device).

## Opening the page

After logging in, open **Device Management** from the navigation. The page has three parts:

- **Toolbar**: search and filters (below), **Add**, **Import**;
- **Device card list**: one card per device, with enable/disable and delete actions right on the card;
- **Pagination and sorting**: the bottom pager auto-fits its page size to how many columns the viewport holds, with a
  manual override; the toolbar offers refresh and column sorting.

## Finding a device: filters

The toolbar offers three filters that combine:

| Filter | What it does |
|--------|--------------|
| Device name | Fuzzy search by name |
| Driver | Dropdown of drivers (options come from the driver dictionary; refreshable) |
| Enable status | Segmented: all / enabled / disabled |

Searches hit the manager center's device pagination endpoint (`POST /device/list` semantics) and are tenant-isolated — you never see another tenant's devices.

## Adding a device

1. Click **Add** in the toolbar;
2. Fill in the device name and pick the **driver** and **profile** — these two decide which points and commands the device can carry (see [Profile](../introduction/concepts/profile));
3. Complete the connection configuration per the driver's attribute definitions (e.g. Modbus host/port): where attributes come from is covered in [Attributes & Config](../introduction/concepts/attribute-config);
4. Save. The new device's enable state follows the form; keep it disabled until a real device is attached.

Creation maps to `POST /device/add` (returns the new entity with its id — see the API table in the [Device concept](../introduction/concepts/device)).

## Bulk import (XLSX)

The toolbar's **Import** runs an asynchronous flow, not a synchronous one:

1. **Download the template**: `POST /api/v3/manager/device/export/import_template` with `driverId` + `profileId` in the body returns an XLSX shaped for that driver/profile (`device-import-template-v1.xlsx`). The template follows the driver — whatever attributes the driver takes become the columns.
2. **Fill and upload**: `POST /api/v3/manager/device/import`, multipart with two parts: `request` (JSON, again `driverId` + `profileId`) and `file` (XLSX, up to 20 MB); the request carries an `Idempotency-Key` header — same key with the same content returns the original operation, same key with different content is rejected.
3. **Poll for the result**: the upload answers **202** plus a `Location` (the operation query URI). Poll `GET /api/v3/manager/operations/get_by_id?id=<operationId>`; the status moves from `PENDING`/`RUNNING` to `SUCCEEDED`/`FAILED`, with per-row validation failures in the `result` / `error` fields. Operation state lands in the `dc3_operation` table (see the [schema reference](../development/schema-reference)).

The CLI wraps those steps in two commands:

| Action | Command / endpoint |
|--------|--------------------|
| Download the template | `dc3 device import-template --driver-id <id> --profile-id <id> --output <file>`; endpoint `POST …/device/export/import_template` |
| Upload and wait | `dc3 device import <file> --driver-id <id> --profile-id <id>` (polls to the terminal state by default; `--no-wait` submits only; `--idempotency-key` sets the key); endpoint `POST …/device/import` |

There is no device export endpoint — only the template export. To keep the data, export point values or take a database backup first (see the [FAQ](../community/faq)).

## Enable / disable / delete

Actions live on the device card:

- **Disable**: the device stops being collected (point values stop updating); configuration is kept and can be re-enabled at any time;
- **Enable**: collection resumes and the driver re-establishes the connection;
- **Delete**: removes the device and its associated configuration, **irreversibly** — export point data first if you need it (historical point values persist per the retention policy independently of the device record, but you lose the device-dimension query entry).

## Device detail

Click a card to open **device detail**, with five tabs:

| Tab | Content |
|-----|---------|
| Dashboard | The device's live status and key metrics at a glance — the first screen when checking "how is this device doing" |
| Related points | The device's points with status; jump to point configuration from here |
| Related commands | The device's bound (custom) commands |
| Related events | Entry to the events the device reports (external events defined by `dc3_event`) |
| Device data | Entry for querying this device's point values (latest/history), matching the point-data capability |

The detail page is the first stop when a device "isn't collecting": a driver-name load error shows inline (usually the driver is offline or was deleted).

## UI actions mapped to APIs

| UI action | API (via gateway) | Semantics |
|-----------|-------------------|-----------|
| Search/filter | `POST …/device/list` | Paginated query, tenant-isolated |
| Add | `POST …/device/add` | Creates the device, returns the new entity (with id) |
| Edit | `POST …/device/update` | Change name/profile/config |
| Enable/disable | `POST …/device/update` (enableFlag) | Toggle enable state |
| Delete | `POST …/device/delete` | Remove the device |

Every step can be replicated with curl — auth and request shapes are in the [API documentation](../development/api-documentation).

## Further reading

- [Device Onboarding](./device-onboarding) — the full path from picking a driver to seeing data
- [Device concept](../introduction/concepts/device) — fields, state machine, API semantics
- [Console · Points & Profiles](./console-entities) — defining what data a device carries
- [Data & Commands](./data-commands) — reading values and issuing commands after onboarding
- [Troubleshooting](../guide/troubleshooting) — locating an offline device or missing values
