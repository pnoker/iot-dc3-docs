---
title: API Documentation
---

<script setup>
import ApiDocFlowDiagram from '../../.vitepress/theme/components/ApiDocFlowDiagram.vue'
import ApiDocSequenceDiagram from '../../.vitepress/theme/components/ApiDocSequenceDiagram.vue'
</script>

# API Documentation

IoT DC3's REST API docs are generated from code annotations, and each center service exposes its own online docs. By
the end of this page you'll be able to open each center's online docs in development, walk through the login flow with
the default credentials (fetch salt → fetch token → call with auth headers), read the CRUD path conventions and the
error-response code catalog, and see how the `x-dc3-ai` risk metadata on each endpoint feeds into AI/MCP tools.

> You're about to call or debug a backend API. If you need to get the environment running first,
> see [First Device](../quickstart/first-device). For the tenants and permissions behind those auth headers,
> see [Auth · Tenant · RBAC](../architecture/auth-rbac).

## Where the docs come from: annotation-generated, per-center

There are no hand-written API spec files. Every endpoint's title, parameters, and request/response models come from
`springdoc-openapi` annotations on the Controllers (`@Tag`, `@Operation`, `@Parameter`, `@Schema`). Each center service
emits its own OpenAPI JSON at runtime on the WebFlux stack.

Four business centers expose their own docs — Auth Center (`dc3-center-auth`), Manager Center (`dc3-center-manager`),
Data Center (`dc3-center-data`), and Agentic Center (`dc3-center-agentic`). The Gateway (`dc3-gateway`) has no business
Controllers of its own. Its configuration still declares a service dropdown pointing at `/v3/api-docs/{svc}` via
`springdoc.swagger-ui.urls`, but the gateway aggregation routes behind it have been removed, so that entry point is
currently unusable (see the warning below).

<ApiDocFlowDiagram lang="en" />

Grouping works in two layers. `dc3-common-web`'s `SpringDocConfig` supplies the global metadata — title, version,
contact, license, security schemes. Each business module then declares a `GroupedOpenApi` Bean under its already-scanned
package, so only that module's Controllers are scanned. Each center service prepends its `spring.webflux.base-path` (
e.g. `/auth`, `/manager`) to the doc path, giving paths like `/auth/v3/api-docs`. You must include that base-path and
hit each center directly — the gateway no longer provides an aggregation path that flattens it away.

::: info dc3-center-single mode
`dc3-center-single` packs multiple business modules into one process, so its Swagger UI shows several groups at once.
That's expected, not duplicated configuration.
:::

## Access entry points

In development, hit each center's Swagger UI directly (remember the base-path prefix). Exporting or debugging the
contract likewise goes through each center's `/{svc}/v3/api-docs`.

| Target                            | URL                                             |
|-----------------------------------|-------------------------------------------------|
| Auth Center direct (preferred)    | `http://<auth>:8300/auth/swagger-ui.html`       |
| Manager Center direct (preferred) | `http://<manager>:8400/manager/swagger-ui.html` |
| Data Center direct (preferred)    | `http://<data>:8500/data/swagger-ui.html`       |
| Agentic Center direct (preferred) | `http://<agentic>:8600/agentic/swagger-ui.html` |
| Single-center OpenAPI JSON        | `http://<center>:<port>/<svc>/v3/api-docs`      |

::: warning The gateway aggregation entry point is currently unusable
`dc3-gateway`'s `application.yml` still configures an aggregated Swagger UI pointing at `/v3/api-docs/{svc}`
(`http://<gateway>:8000/swagger-ui.html`), but the corresponding aggregation proxy routes were removed from
`dc3-common/dc3-common-gateway`'s `application-gateway.yml` (the surviving routes are the OAuth and `/api/v3/**` business
routes). Every entry in that UI's service dropdown fails with "Failed to load API definition". Until the aggregation
routes are restored, always connect to each center directly.
:::

## Login and authentication: fetch salt → fetch token → send X-Auth-* headers

Public endpoints like `/api/v3/auth/token/**` (fetch salt, generate token, change password) are open. Every other
business API behind the gateway requires three auth headers: `X-Auth-Tenant`, `X-Auth-Login`, and `X-Auth-Token`.

Login is a two-step handshake. First, request a random salt from the server using the username and tenant (use within 5
minutes as a guideline; the server does not enforce the timeout). Then submit the **plaintext password** together with
that
salt to exchange for a token (valid 12 hours). The salt participates in neither the password hash nor the JWT signature
— the token's HMAC-SHA256 signing key is derived solely from the server-side `DC3_SECURITY_KEY` (environment variable,
falling back to the `dc3.security.key` system property); the salt is just a one-time random string the handshake
requires you to echo back. The password itself is submitted in
plaintext
(relies on HTTPS for transport protection) and verified by the backend `PasswordUtil.verify` using Argon2id (falling
back to
BCrypt when Argon2 is unavailable).

<ApiDocSequenceDiagram lang="en" />

A real call looks like this (values are illustrative only; `default`/`dc3` are the tenant and user shipped in the seed
data):

::: code-group

```bash [curl]
# 1. Fetch salt
curl -X POST http://localhost:8000/api/v3/auth/token/salt \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3"}'
# → 2026.10 image line (and main) returns JSON object {"salt":"f3a9c1..."} (no R envelope); 2026.9 and earlier image lines return a bare text/plain salt. Use within 5 minutes

# 2. Submit the plaintext password together with the salt (HTTPS protects transport) to exchange for a token
curl -X POST http://localhost:8000/api/v3/auth/token/generate \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3","salt":"f3a9c1...","password":"<plaintext password>"}'
# → 2026.10 image line (and main) returns JSON object {"token":"eyJ..."} (no R envelope); 2026.9 and earlier image lines return a bare text/plain token. Both set an httpOnly cookie; valid 12 hours

# 3. Call a business API with the auth headers
curl -X POST http://localhost:8000/api/v3/manager/device/list \
  -H 'X-Auth-Tenant: default' \
  -H 'X-Auth-Login: dc3' \
  -H 'X-Auth-Token: {"salt":"f3a9c1...","token":"eyJ..."}' \
  -H 'Content-Type: application/json' \
  -d '{"offset":0,"limit":10}'
```

```bash [dc3 CLI]
# The CLI wraps the whole process: fetch salt → exchange token → save credentials
dc3 config set gateway http://localhost:8000
dc3 auth login --tenant default --username dc3
```

:::

To debug a protected endpoint in the Swagger UI, click **Authorize** in the top-right corner and fill in the auth
headers per the table below:

| Header          | Example value                  |
|-----------------|--------------------------------|
| `X-Auth-Tenant` | `default`                      |
| `X-Auth-Login`  | `dc3`                          |
| `X-Auth-Token`  | `{"salt":"...","token":"..."}` |

::: danger Never write real credentials into docs/logs/issues
Tokens, passwords, salts, and API keys must never be committed to documentation, commit history, or tickets. Hash values
and tokens in examples are replaced with placeholders.
:::

## The other auth path: gateway OAuth RS256 (off by default)

Besides the `X-Auth-*` trio, the gateway can accept a second credential kind: `Authorization: Bearer <JWT>` (RS256,
verified via JWKS). It is controlled by `DC3_GATEWAY_OAUTH_ENABLED` and **off by default**; once on, both credentials
coexist:

- request carries `Authorization: Bearer …` and the switch is on → the gateway verifies the JWT (issuer/audience
  checks, JWKS cached 5 minutes with one forced refresh on an unknown `kid`), and injects the verified principal as
  `X-Auth-Principal` downstream;
- no bearer (or the switch off) → the classic `X-Auth-*` chain above;
- neither → 401 (problem+json).

The JWTs come from the OAuth2 authorization server inside the Auth Center — the one built for
[MCP](../ai/mcp): `/.well-known/oauth-authorization-server`, `/oauth2/jwks`, `/oauth2/register` (dynamic
registration), `/oauth2/authorize` (OAuth 2.1 + PKCE), `/oauth2/token`, `/oauth2/revoke`, all under the `/api/v3/auth/`
prefix through the gateway. Supported grants: `authorization_code`, `client_credentials`, `refresh_token`. Access
tokens last 15 minutes (with `mcp:tools:call`-style scopes) or 1 hour (read-only scopes); refresh tokens 30 days;
granted scopes are capped by the principal's RBAC bindings.

For machine-to-machine calls, client_credentials is the easy one, and the CLI supports it directly:

```bash
dc3 auth login --oauth --client-id <id> --client-secret <secret>
# subsequent requests carry Authorization: Bearer automatically
```

Gateway settings (`dc3.gateway.oauth.*`): `enabled`, `jwks-url`, `issuer`, `audience` (default `dc3-mcp`),
`jwks-cache-ttl`. Environment variables `DC3_GATEWAY_OAUTH_ENABLED` / `DC3_GATEWAY_OAUTH_JWKS_URL` (see
[Environment Variables](../quickstart/environment)). Whichever credential is used, the downstream centers'
`@PreAuthorize` checks still apply as usual.

## CRUD path conventions: the verb reflects result cardinality

All business APIs follow one naming rule — the verb on the HTTP path, the Java method, the gRPC RPC, and the frontend
function all reflect the **cardinality of the returned result**. Use `getXxx` to read a single record, `listXxx` to read
a collection, and the write triad `add`/`update`/`delete` to write. The path alone tells you whether a call returns one
record or many, and whether it reads or writes.

| Action        | Java method    | HTTP path   | gRPC RPC  | Frontend function |
|---------------|----------------|-------------|-----------|-------------------|
| Single record | `getXxx(...)`  | `/get_xxx`  | `GetXxx`  | `getXxx(...)`     |
| Collection    | `listXxx(...)` | `/list_xxx` | `ListXxx` | `listXxx(...)`    |
| Create        | `add(BO)`      | `/add`      | n/a       | `addXxx(...)`     |
| Update        | `update(BO)`   | `/update`   | n/a       | `updateXxx(...)`  |
| Delete        | `delete(Long)` | `/delete`   | n/a       | `deleteXxx(...)`  |

::: tip Reserved verb semantics
There is no `select*` family in the codebase at all — raw persistence in the `dc3-db-*` storage layer (`R2dbc*Store`)
also uses the `get`/`list`/`insert`/`update`/`delete` verbs, and `select*` never appears on Service/Controller/Facade
either. Business deletion always uses `delete*`. `find*`/`query*`/`fetch*` aren't used as primary
CRUD verbs.
:::

Here's a real example from Manager Center — the "add device" step of the golden path. The endpoint is
`POST /api/v3/manager/device/add`, the request body is `DeviceVO` with key fields `deviceName`, `driverId`, `profileId`,
and `enableFlag` (the string `"ENABLE"`); on success it returns `201 Created` with the created `DeviceVO` (including its
id). The matching delete endpoint `DELETE /api/v3/manager/device/delete` takes both `id` and an optimistic-lock
`version` query parameter. The endpoint requires the `device:add` permission
(`@PreAuthorize("@perm.can('device', 'add')")`). APIs return business objects or page objects directly — there is no
uniform envelope. Pagination endpoints (like `device/list`) take **flat** `offset`/`limit` fields in the request body
(zero-based offset, defaults `offset=0` and `limit=50`, max 200) and respond with an `OffsetPage`
(`items`/`offset`/`limit`/`total`/`hasNext`). Note that a nested `page` object is silently ignored — the global
`fail-on-unknown-properties=false` doesn't error, but pagination falls back to the defaults. Errors use RFC 9457 problem
details (`application/problem+json`).

## Error responses: RFC 9457 and the R-code catalog

Business errors are uniformly `application/problem+json` with eight fixed fields: `type` (always `about:blank`),
`title`, `status`, `code` (an `R###` string), `detail`, `instance`, `traceId` (correlates with service logs), and
`errors` (per-field details on validation failures). A 422 looks like this:

```json
{
  "type": "about:blank",
  "title": "validation",
  "status": 422,
  "code": "R422",
  "detail": "deviceName must not be blank",
  "instance": "/api/v3/manager/device/add",
  "traceId": "a1b2c3d4",
  "errors": {"deviceName": "must not be blank"}
}
```

`code` maps one-to-one onto the HTTP status:

| code | HTTP | When |
|------|------|------|
| `R401` | 401 | unauthenticated, invalid token, disallowed source IP |
| `R403` | 403 | permission denied (RBAC) |
| `R4031` / `R4032` | 403 | password change required on first login / password expired |
| `R404` | 404 | target not found (or invisible cross-tenant — "not found" and "not yours" are deliberately indistinguishable) |
| `R4090` / `R4091` | 409 | already exists (unique-key conflict) / state conflict (e.g. optimistic-lock version mismatch) |
| `R422` | 422 | validation failure, value out of range |
| `R500` | 500 | everything else, unclassified |

Bind/validation failures (`BindException`, `MethodArgumentNotValidException`) are always 422 with the per-field
`errors` map; gateway-side errors (401 without credentials, 503 when a downstream is unreachable) use the same
problem+json shape. The enum lives in `dc3-common-constant`'s `ErrorCode` — branch client logic on `code`, correlate
with logs via `traceId`.

## x-dc3-ai: risk annotations for AI/MCP tools

An endpoint's `@Operation` can carry an `x-dc3-ai` OpenAPI extension that describes, through four boolean/enum
properties, what risk a call carries for an AI agent. This metadata isn't a human-facing comment — the MCP tool catalog
aggregator reads it, persists it into the `dc3_mcp_tool_catalog` table, and from there decides whether a tool is visible
to a given AI connection in `tools/list` and whether invoking it needs a second confirmation.

```java
@Extension(name = "x-dc3-ai", properties = {
    @ExtensionProperty(name = "riskLevel",   value = "MEDIUM"),  // LOW / MEDIUM / HIGH
    @ExtensionProperty(name = "destructive", value = "false"),   // whether it destroys data/config
    @ExtensionProperty(name = "idempotent",  value = "false"),   // whether it is safe to retry
    @ExtensionProperty(name = "openWorld",   value = "true")     // whether it reaches the external/physical world
})
```

What each property means:

- `riskLevel`: `LOW`/`MEDIUM`/`HIGH`, **annotated by hand per verb-semantic convention** (not auto-derived from the HTTP
  method). By convention `delete` is `HIGH`, `add`/`update` are `MEDIUM`, and `get`/`list` are `LOW`. The final value
  comes from the hand-written annotation on each `@Operation`; the aggregator only falls back to `HIGH` when the
  annotation is missing or invalid. `HIGH`-risk tools are hidden from AI by default — they must be explicitly enabled
  and need a two-phase confirmation when invoked.
- `destructive`: whether the call destroys existing data or settings (e.g. changing a password, revoking a token).
- `idempotent`: whether repeating the call with the same parameters is safe (which decides whether it can be
  auto-retried after a failure).
- `openWorld`: whether it reaches external systems or physical devices beyond the platform (e.g. dispatching a write
  command).

Take Auth Center's `TokenController`. The fetch-salt endpoint is annotated
`riskLevel=LOW, destructive=false, idempotent=false, openWorld=false`, while generate-token is annotated
`riskLevel=HIGH`. Both are public endpoints hidden from the AI tool catalog (`hidden=true`), but their risk levels are
still faithfully distinguished. The Agentic Center's `POST /api/v3/agentic/chat/completions` is annotated
`riskLevel=MEDIUM, destructive=false, idempotent=false, openWorld=true`.

The aggregator also derives `read_only_hint` from the HTTP method (`GET` → 1, `POST` → 0) and persists all hint bits (
`destructive_hint`/`idempotent_hint`/`open_world_hint`/`read_only_hint`, valued 0/1) alongside `risk_level`. The tool
risk an AI agent sees through MCP is the final rendering of these annotations. For the full MCP tool exposure,
filtering, and confirmation mechanism, see [AI Agent / MCP Integration](../ai/mcp).

## Exporting OpenAPI JSON

When you need an offline contract snapshot, or input for a client code generator, export each center's OpenAPI JSON
from a running dev/test stack. Note that `make openapi` (`dc3/bin/export_openapi.sh`) fetches through the gateway
aggregation path `/v3/api-docs/{svc}` by default — those routes are gone, so all four services return 404. Until the
aggregation routes are restored, export directly from each center:

```bash
curl -s http://localhost:8300/auth/v3/api-docs    -o openapi-auth.json
curl -s http://localhost:8400/manager/v3/api-docs -o openapi-manager.json
curl -s http://localhost:8500/data/v3/api-docs    -o openapi-data.json
curl -s http://localhost:8600/agentic/v3/api-docs -o openapi-agentic.json
```

## Documentation requirements when adding an API

When you add a backend API, documentation isn't an afterthought — the annotations *are* the doc source:

1. Add `@Tag(name = "...", description = "...")` to the Controller class.
2. Add `@Operation(summary = "...", description = "...")` to the method. The summary should follow the CRUD verb
   convention (`add`/`delete`/`update`/`getXxx`/`listXxx`).
3. Add `@Parameter` for path, query, and request-body parameters.
4. Add `@Schema(description = ...)` to request/response DTO fields, with `example` and `requiredMode = REQUIRED` where
   needed.
5. For endpoints callable by AI/MCP, add the `x-dc3-ai` extension reflecting the real risk. Once done, run
   `make validate-annotations` locally to check annotation completeness (the five AnnotationGateTests —
   Controller/Manager/Data/Agentic/Auth — the same gate cases CI runs in its unit-test job).
6. When adding a new business module, add its `GroupedOpenApi` Bean (the group is exposed under the center's own
   base-path; no gateway-side configuration is needed).

::: warning Annotation text must always be in English
The `summary`/`description` in annotations is user-visible code text and, per engineering rules, must be written in
English. Don't put sensitive values such as `apiKey`, `password`, `secret`, or `token` in `@Schema` `example` fields.
:::

::: danger Disable Swagger / OpenAPI exposure in production
API documentation is only available in the `dev`, `test`, and `pre` environments. In production (the `pro` profile) each
center service disables it in its own `application-pro.yml` (one each for auth/manager/data/agentic/single):

```yaml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

The shared `application-web.yml` only sets springdoc's baseline paths — it isn't responsible for disabling, and its
comments say so. In production the springdoc endpoints simply don't exist, so no documentation content is ever exposed.
:::

## Further reading

- [Auth · Tenant · RBAC](../architecture/auth-rbac) — the salt/token/HMAC behind the auth headers, plus tenant isolation
  and the permission model
- [First Device](../quickstart/first-device) — walk the golden path with the `dc3` CLI and actually exercise these APIs
- [AI Agent / MCP Integration](../ai/mcp) — how the `x-dc3-ai` metadata becomes MCP tool risk policy and two-phase
  confirmation
- [Testing](./testing) — how API contract and integration tests verify these paths
