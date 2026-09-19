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
- **Pagination and sorting**: page size and number at the bottom; the toolbar offers refresh and column sorting.

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

Creation maps to `POST /device/add` (no ID returned — look it up by name; see the API table in the [Device concept](../introduction/concepts/device)).

## Bulk import

Click **Import** in the toolbar: download the template first, fill it in, and upload. Rows are validated one by one and failures report a reason. Suited for entering batches of similar devices at once (e.g. many meters behind the same gateway).

## Enable / disable / delete

Actions live on the device card:

- **Disable**: the device stops being collected (point values stop updating); configuration is kept and can be re-enabled at any time;
- **Enable**: collection resumes and the driver re-establishes the connection;
- **Delete**: removes the device and its associated configuration, **irreversibly** — export point data first if you need it (historical point values persist per the retention policy independently of the device record, but you lose the device-dimension query entry).

## Device detail

Click a card to open **device detail**, with three tabs:

| Tab | Content |
|-----|---------|
| Device info | Name, driver, profile (name and code), enable status and other base fields |
| Related points | The device's points with status; jump to point configuration from here |
| Related commands | The device's bound (custom) commands |

The detail page is the first stop when a device "isn't collecting": a driver-name load error shows inline (usually the driver is offline or was deleted).

## UI actions mapped to APIs

| UI action | API (via gateway) | Semantics |
|-----------|-------------------|-----------|
| Search/filter | `POST …/device/list` | Paginated query, tenant-isolated |
| Add | `POST …/device/add` | Creates the device, no ID returned |
| Edit | `POST …/device/update` | Change name/profile/config |
| Enable/disable | `POST …/device/update` (enableFlag) | Toggle enable state |
| Delete | `POST …/device/delete` | Remove the device |

Every step can be replicated with curl — auth and request shapes are in the [API documentation](../development/api-documentation).

## Further reading

- [Device Onboarding](./device-onboarding) — the full path from picking a driver to seeing data
- [Device concept](../introduction/concepts/device) — fields, state machine, API semantics
- [Data & Commands](./data-commands) — reading values and issuing commands after onboarding
- [Troubleshooting](../guide/troubleshooting) — locating an offline device or missing values
