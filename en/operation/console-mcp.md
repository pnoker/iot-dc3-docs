---
title: Console · MCP Connections
---

# Console · MCP Connections

Exposing the platform's 330+ tool catalog safely to external AI agents is managed under **Settings → MCP Integration**: four sub-pages — server, clients, connections, tools. The call audit sits under **Settings → Audit → MCP Audit** (same group as the identity audit). The protocol and security model (OAuth 2.1 + PKCE, three-layer tool visibility, HIGH-risk two-phase confirmation) live in [AI Agent / MCP](../ai/mcp) — this page is about driving the UI.

> You are here: you want Claude Desktop / VS Code / Cursor or your own agent calling platform tools over MCP. Protocol details and the curl flow are on the MCP page; this covers what to configure in the console.

## What each sub-page governs

| Sub-page | Governs | Typical actions |
|----------|---------|-----------------|
| **MCP Server** | The platform's outward `/mcp` endpoint (the MCP resource server on the gateway) | Check server status |
| **MCP Connection** | One established agent connection: which client, which tool whitelist | New connection, manage tools, inspect scope |
| **MCP Client** | Registered OAuth clients (where `/oauth2/register` dynamic registrations land) | Register a client, view clientId/secret |
| **MCP Tools** | The tool catalog (the 330+ tools with risk levels and origins) | Browse the catalog, **refresh the tool catalog** |

**Tool-catalog refresh** is a manual admin action (via the gateway: `POST /api/v3/auth/mcp/tool/catalog/refresh`; the refresh button lives on the **MCP Tools** sub-page): the catalog does not update automatically when HTTP endpoints are added — click refresh there (or trigger via curl) before new tools appear in `tools/list`. Note that the gateway root only exposes the JSON-RPC `POST /mcp`; there is no `/mcp/**` forwarding route, so curl must go through the `/api/v3/auth/mcp/...` prefix.

## Full flow for one agent connection

1. **Register a client**: add one on the MCP clients page (or let the agent self-register via `/oauth2/register` — the endpoint is public and **accepts anonymous registration**; when the logged-in `X-Auth-Principal` header is present the registration belongs to that principal, otherwise it is global and unowned — mind the anonymous registration surface in production);
2. **Get a token**: the client exchanges via OAuth 2.1 + PKCE (S256 enforced) for a 15-minute JWT (30-day refresh token with rotation);
3. **Create the connection**: new entry on the connections page — pick the client and configure the **tool whitelist**;
4. **The agent calls**: `tools/list` returns the intersection of the principal's RBAC permissions, the connection whitelist, and the risk policy (HIGH hidden by default until explicitly enabled) — three layers decide what the agent sees;
5. **HIGH-risk operations**: the call first returns `CONFIRM_REQUIRED` + `confirmId`; a second confirmed call (within 5 minutes, matching argument digest, single consumption) actually executes.

## Call audit

The **Settings → Audit → MCP Audit** page (`dc3_mcp_audit_log`) records every tool call: who (principal/connection), what (tool_id), risk level, duration, source IP; HIGH-risk calls log their confirmation-ticket details too. "What did the agent actually do" is answered here.

## UI actions mapped to APIs

| UI action | API (via gateway) | Semantics |
|-----------|-------------------|-----------|
| Register client | `POST …/oauth2/register` | Public endpoint, anonymous OK; owned by the `X-Auth-Principal` header when present |
| Refresh tool catalog | `POST …/auth/mcp/tool/catalog/refresh` (full path `/api/v3/auth/mcp/tool/catalog/refresh`) | Manual, admin; run after adding endpoints; button on the MCP Tools sub-page |
| Connection mgmt / whitelist | MCP connection CRUD | The middle layer of the three-way filter |
| Audit query | every `tools/call` lands in `dc3_mcp_audit_log` | Full trail |

## Further reading

- [AI Agent / MCP](../ai/mcp) — the full reference: protocol, OAuth flow, risk tiers
- [Agentic Center](../ai/agentic) — the platform's built-in conversational AI (the complementary access path)
- [Auth, Tenant & RBAC](../architecture/auth-rbac) — how the RBAC layer of the three-way filter works
