---
title: Console · Points & Profiles
---

# Console · Points & Profiles

Points and profiles are the definition side of the data: a profile describes what a class of devices can do (points / commands / events), and points under it carry the actual data. This page covers managing both layers in the console — creating a profile, defining its points, binding devices to it — and the API behind each UI action.

> You are here: you've created devices in [Device Management](./console-devices) and now need to define "what data this device has". Field-level semantics are in [Profile](../introduction/concepts/profile) and [Point](../introduction/concepts/point); how attributes get filled is in [Attributes & Config](../introduction/concepts/attribute-config).

## Profile management

Open **Profile Management**. The layout mirrors device management: toolbar (search / filters / **Add**) + profile card list + pagination; card actions are enable/disable (the thing-model switch) and delete.

**Adding a profile**: fill in the name and code (`profileCode`, unique per tenant) and save — the profile itself is just the shell; its capabilities come from the point / command / event definitions below.

**Profile detail** has four tabs:

| Tab | Content |
|-----|---------|
| Profile info | Name, code, enable status and other base fields |
| Related points | The points this profile defines (read/write attributes, unit, type) |
| Related commands | Device-level custom command definitions |
| Related events | Event definitions (externally reported events) |

Disabling a profile (thing-model switch off) stops its capability definitions from participating in collection and command validation for the devices under it — cheaper than disabling devices one by one when pausing a whole class.

## Point management

Open **Points** (from the profile detail's related-points tab, or directly from the navigation). The toolbar searches by device / profile / name and filters by enable status; card actions: **edit**, enable/disable, delete, detail.

**Key fields when adding / editing a point**:

| Field | Notes |
|-------|-------|
| Name / code | Display name + `pointCode` (unique per profile) |
| Read/write type | `rwFlag`: read-only / write-only / read-write — decides whether write commands are possible |
| Unit & precision | For display and conversion |
| Driver attribute config | The point's protocol-level parameters (e.g. Modbus slaveId/functionCode/offset) — **point-level commands take their values from here**, not from command attributes |

Read/write semantics for point values (latest/list endpoints, command polling) are in [Data & Commands](./data-commands).

## UI actions mapped to APIs

| UI action | API (via gateway, manager center) | Semantics |
|-----------|-----------------------------------|-----------|
| Profile search | `POST …/profile/list` | Paginated query, tenant-isolated |
| Add profile | `POST …/profile/add` | Creates the profile (no ID returned) |
| Profile enable/disable | `POST …/profile/update` (enableFlag) | Thing-model switch |
| Point search | `POST …/point/list` | Filters by device / profile supported |
| Add / edit point | `POST …/point/add` / `…/point/update` | Attribute config submitted together |
| Point enable/disable / delete | `…/point/update` / `…/point/delete` | |

## Further reading

- [Console · Device Management](./console-devices) — the device layer in the UI
- [Profile](../introduction/concepts/profile) / [Point](../introduction/concepts/point) — object model and field semantics
- [Device Onboarding](./device-onboarding) — the full context from profile to point to live data
