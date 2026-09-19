---
title: Console · Users & Tenants
---

# Console · Users & Tenants

Users, roles, and tenants decide "who sees what". This page covers the day-to-day identity operations in the console: creating users, assigning roles, switching tenant context, and the permission semantics behind each step. The auth model itself (JWT, RBAC, fail-closed tenant isolation) lives in [Auth, Tenant & RBAC](../architecture/auth-rbac) — here it's about driving the UI.

> You are here: the platform is deployed and you need accounts and permissions for the team. The object model is in [Tenant](../introduction/concepts/tenant); how permissions intercept requests is on the auth page.

## User management

Open **Settings → User Management**. The list is tenant-isolated; the toolbar offers search and **Add**; each row supports **assign roles**, enable/disable, and edit.

**Adding a user**: fill in the login name and initial password (changed on first login); the user belongs to the current tenant after saving.

**Assigning roles**: the row's "assign roles" action opens a multi-select — roles decide which APIs the user may call (RBAC's `@perm.can` checks exactly the resources/permission codes bound to the role). Roles themselves live under **Settings → Role Management**: role → bind resources/APIs → then bind users to the role.

## Tenant context

- The top bar can switch the tenant you operate in (visible only to principals with cross-tenant permission); regular users are pinned to their own tenant;
- `default` is the **system-administrator tenant** — the seeded account (`dc3`) from installation belongs to it with platform-wide admin rights; in production, change the seed password immediately and split per-person accounts;
- Every business query and write carries the `tenantId` scope — cross-tenant reads are neither visible nor queryable (404 semantics).

## UI actions mapped to APIs

| UI action | API (via gateway, auth center) | Semantics |
|-----------|-------------------------------|-----------|
| User search | `POST …/user/list` | Within the current tenant |
| Add user | `POST …/user/add` | Belongs to the current tenant |
| Assign roles | `POST …/role_principal_bind/*` | Principal-role binding |
| Change password | `POST …/token/password` (self-service) / admin reset | Argon2id storage |

::: warning Seeded account
The default account `dc3` / initial password exists for first login only. The first production step is changing it; the stricter practice is creating a separate business tenant and doing daily work as that tenant's admin.
:::

## Further reading

- [Auth, Tenant & RBAC](../architecture/auth-rbac) — how the auth chain intercepts requests
- [Tenant concept](../introduction/concepts/tenant) — implementation semantics of tenant isolation
- [Security Policy](../community/security) — the production baseline for passwords, keys, and ports
