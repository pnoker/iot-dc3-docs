---
title: Console · Groups, Labels & Identity Security
---

# Console · Groups, Labels & Identity Security

Once devices multiply you need to organize them by business meaning: groups give hierarchical classification, labels cross-cutting marks; programs get service accounts; and the identity audit answers "who touched what, when". This page covers those four settings pages and where the data lands.

> You are here: devices and points have grown past a handful, or you need programmatic accounts for scripts and agents. Basic user/tenant operations are in [Console · Users & Tenants](./console-identity).

## Group management

**Settings → Group Management** maintains `dc3_group`: groups are created per **entity type** (driver / profile / point / device etc., `entity_type_flag`) and support **parent nesting** (`parent_group_id`, 0 = top level) — e.g. a device tree like "Plant 1 → Line A → Filling section".

- Group names are **unique** within tenant + entity type + parent (enforced by a unique index);
- The detail tab shows the group's info and members (bindings stored in `dc3_group_bind`);
- Typical use: batch-scope devices by workshop/line, providing an organizational dimension for alarm views and permission splits.

## Label management

**Settings → Label Management** maintains `dc3_label`: the **cross-cutting** counterpart to groups — name + **color** (default `#F4F4F5`) + entity type; one device can carry many labels (`dc3_label_bind`).

- A group is "one tree" (each entity sits in one place); a label is many-to-many (many labels per entity, many entities per label);
- Typical use: dimensions like `critical`, `pending-maintenance`, `high-energy` that cut across groups — colored tags make them obvious in list views.

## Service accounts

**Accounts & Identity → Service Accounts** (`ServiceAccountController`): identity principals for **programs** — scripts, cron jobs, the CLI, external agents shouldn't share a human's account.

- Create the account, assign roles (RBAC works the same as for users); the credential policy is stored in `credentialPolicyExt`;
- Difference from users: no interactive login session; credentials rotate per policy; audit entries record the service-account identity;
- Typical use: give the [dc3 CLI](../automation/cli) or an integrating system a least-privilege identity instead of putting an admin account in a config file.

## Identity audit

**Accounts & Identity → Identity Audit** (`IdentityAuditLog`): the full ledger of identity-related operations — who created/changed/deleted users, roles, bindings, and service accounts, when; login and password-change events land here too.

- Questions like "when was this permission granted" and "why is this account locked" are answered by tracing here;
- Audit records are tenant-isolated, same semantics as business data.

## UI actions mapped to APIs

| UI action | API (via gateway) | Notes |
|-----------|-------------------|-------|
| Group CRUD | manager center `…/group/*`, `…/group_bind/*` | Two interfaces: groups and memberships |
| Label CRUD | manager center `…/label/*`, `…/label_bind/*` | Same shape |
| Service account mgmt | auth center `…/service_account/*` | Includes credential policy |
| Audit query | auth center `…/audit_log/*` (identity domain) | Filter by time/principal |

## Further reading

- [Console · Users & Tenants](./console-identity) — users, roles, and tenant context
- [Console · Device Management](./console-devices) — the entities being grouped and labeled
- [Auth, Tenant & RBAC](../architecture/auth-rbac) — the principal model behind service accounts
