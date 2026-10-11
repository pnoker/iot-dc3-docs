---
title: Console · Users & Tenants
---

# Console · Users & Tenants

Users, roles, and tenants decide "who sees what". This page covers the day-to-day identity operations in the console: creating users, issuing credentials, assigning roles, understanding tenant context, and the permission semantics behind each step. The auth model itself (JWT, RBAC, fail-closed tenant isolation) lives in [Auth, Tenant & RBAC](../architecture/auth-rbac) — here it's about driving the UI.

> You are here: the platform is deployed and you need accounts and permissions for the team. The object model is in [Tenant](../introduction/concepts/tenant); how permissions intercept requests is on the auth page.

## User management

Open **Settings → Accounts & Identity → User**. The list is tenant-isolated; the toolbar offers search and **Add**; each row supports **assign roles**, enable/disable, and edit.

**Adding a user**: fill in the login name, nickname, phone, and email, then save — the form has **no password field**; the user record itself carries no login credentials. Before the new user can log in, create (or reset) a local credential for them under **Settings → Accounts & Identity → Local Credentials**; the user logs in with that credential and changes the password on first login. The two steps together are a complete "provisioning".

**Assigning roles**: the row's "assign roles" action opens a multi-select — roles decide which APIs the user may call (RBAC's `@perm.can` checks exactly the resources/permission codes bound to the role). Roles themselves live under **Settings → Roles & Permissions → Role**: role → bind resources/APIs → then bind users to the role.

## Tenant context

- The console has **no** tenant-switching control: the current tenant is shown read-only in the top-right user menu, and you are pinned to it after login; to add or remove people from a tenant, maintain the memberships under **Settings → Accounts & Identity → Tenant Membership**;
- `default` is the **system-administrator tenant** — the seeded account (`dc3`) from installation belongs to it with platform-wide admin rights; in production, change the seed password immediately and split per-person accounts;
- Every business query and write carries the `tenantId` scope — cross-tenant reads are neither visible nor queryable (404 semantics).

## UI actions mapped to APIs

| UI action | API (via gateway, auth center) | Semantics |
|-----------|-------------------------------|-----------|
| User search | `POST …/user_profile/list` | Within the current tenant |
| Add user | `POST …/user_profile/add` | Belongs to the current tenant |
| Assign roles | `POST …/role_principal/add` / `DELETE …/role_principal/delete` / `POST …/role_principal/list` | Principal-role binding |
| Change password (self-service) | `POST …/token/change_password` | Change own password while logged in |
| Reset credential (admin side) | `POST …/local_credential/reset_password` | The user record has no password field; credentials live in the local-credential system, Argon2id storage |

::: warning Seeded account
The default account `dc3` / initial password exists for first login only. The first production step is changing it; the stricter practice is creating a separate business tenant and doing daily work as that tenant's admin.
:::

## Further reading

- [Auth, Tenant & RBAC](../architecture/auth-rbac) — how the auth chain intercepts requests
- [Tenant concept](../introduction/concepts/tenant) — implementation semantics of tenant isolation
- [Console · Groups, Labels & Security](./console-organize) — groups/labels/service accounts/audit
- [Security Policy](../community/security) — the production baseline for passwords, keys, and ports
