---
title: CLI User Guide
---

<script setup>
import CliSequenceDiagram from '../../.vitepress/theme/components/CliSequenceDiagram.vue'
import CliCredentialFlowDiagram from '../../.vitepress/theme/components/CliCredentialFlowDiagram.vue'
import CliClassDiagram from '../../.vitepress/theme/components/CliClassDiagram.vue'
</script>

# CLI User Guide

`dc3-cli` is the command-line client for IoT DC3 — a standalone TypeScript package (Node ≥ 22) that exposes the platform
through the `dc3` command. It talks to the platform entirely through the gateway at `/api/v3/*`. By the end of this page
you'll have it installed, the gateway configured, a token in hand, and you'll have read devices, read point values, and
sent commands from the shell.

> You are here: you can already get [your first device](../quickstart/first-device) working through the frontend or
> curl, and now you want to drive the platform from the command line or inside an AI agent. If you want an AI tool to
> talk
> to the platform directly, head to [AI Agent / MCP Integration](../ai/mcp).

## What it is and who it's for

`dc3-cli` is not another backend. It's an HTTP client: every request goes to the gateway address you configure, with a
common `/api/v3/*` prefix (the gateway then routes to the auth, manager, data, and agentic centers). There is no Java or
build-time coupling — install one Node package and it runs standalone.

It serves three audiences: **operations and onboarding engineers** who want to inspect devices, read values, and send
commands from the terminal; **automation authors** who fold platform operations into scripts and pipelines; and **agent
integrators** who let AI coding tools (Claude Code, Codex, Gemini CLI, and others) call the platform through the shell.
Every command supports `--format json`, so the output is reliable for programs to parse.

```bash
# dc3-cli is not published to the npm registry - install from the main repo source (a pnpm project)
cd <path-to-iot-dc3>/dc3-cli
pnpm install && pnpm build
pnpm link   # makes the dc3 command globally available
```

Three steps to get going: configure the gateway, log in, then use it.

```bash
dc3 config set gateway http://localhost:8000   # gateway address (example: local default port 8000)
dc3 auth login                                 # interactive login
dc3 device list                                # list devices
dc3 device import-template --driver-id 1 --profile-id 1   # download the XLSX import template
dc3 device import devices.xlsx --driver-id 1 --profile-id 1   # bulk import (polls to the terminal state)
```

## Authentication: the three-stage token and how it stays fresh

`dc3 auth login` runs a three-stage token chain built on the same pair of endpoints the
platform's [golden path](../quickstart/first-device) uses for curl login — the CLI just wires them together. First,
`POST /api/v3/auth/token/salt` exchanges a tenant name and username for a **salt**. The CLI then submits the **plaintext
password** together with the salt to `POST /api/v3/auth/token/generate`, which returns a JWT. From the JWT it parses the
embedded `iat` and `exp`, then writes `{ token, salt, tenant, username, issuedAt, expiresAt }` to `~/.dc3/tokens.json` (
file mode `0600`, one entry per profile).

<CliSequenceDiagram lang="en" />

Before each later API call, the CLI does two things so you almost never hit a 401:

- **Proactive renewal**: if the current token is within the renewal threshold of expiring, the CLI silently re-logs in
  to get a fresh token before the call runs. The threshold comes from the `renewal_threshold_hours` setting
  (`dc3 config set renewal_threshold_hours <n>`, configurable 0–12 hours), which defaults to **1 hour** — it renews
  once less than an hour of validity remains.
- **401 fallback**: if a 401 still slips through (clock drift, service restart, and so on), the CLI renews and then **retries the request once**.

Requests to protected endpoints carry the platform's standard three headers — `X-Auth-Tenant`, `X-Auth-Login`,
`X-Auth-Token` — where `X-Auth-Token` carries `{ salt, token }`.

::: warning Renewal needs the password
Both proactive renewal and the 401 retry need the CLI to fetch the password and run the salt→generate flow again. If you
used `--no-save` or `--store prompt` (nothing persisted), there is no password to fetch once the token expires. The CLI
can't renew silently in that case, so you'll need to run `dc3 auth login` again.
:::

::: danger Never print real passwords or tokens
All passwords and tokens on this page are example placeholders. Don't paste real passwords or JWTs in plaintext into
scripts, logs, or issues. `dc3 auth token` is for local troubleshooting only — the token it prints is a live login
credential.
:::

## Where credentials live: backends and the resolution chain

The password itself never lands in `tokens.json`. It goes to a **credential storage backend**. When renewal needs the
password, the CLI walks a documented resolution chain: the **profile's configured store** first (the one chosen with
`dc3 config set auth.store <type>`), then the remaining stores in priority order `keychain → encrypted → env`
(`DC3_PASSWORD`); the first non-empty password wins and unavailable stores are skipped without error. There is **no
prompt fallback** in the chain — when no password can be resolved, the silent renewal simply gives up and the 401
fallback surfaces the error. That's why `--no-save` / `--store prompt` (nothing persisted) leaves no password to fetch
once the token expires, forcing a manual re-login.

<CliCredentialFlowDiagram lang="en" />

What each of the four backends is for:

| Storage     | Location                                                                         | Use case                                  |
|-------------|----------------------------------------------------------------------------------|-------------------------------------------|
| `keychain`  | OS keychain (macOS Keychain / Linux Secret Service / Windows Credential Manager) | Everyday use (default)                    |
| `encrypted` | `~/.dc3/credentials.enc`, AES-256-GCM encrypted                                  | Fallback when the keychain is unavailable |
| `env`       | Reads the `DC3_PASSWORD` environment variable                                    | CI/CD, scripts                            |
| `prompt`    | Nothing persisted; entered interactively at login only                           | Highest security, cannot auto-renew       |

The encrypted-file backend uses `aes-256-gcm`: the ciphertext lives in `~/.dc3/credentials.enc`, and the decryption key
is a random 256-bit key generated on first write, stored separately in `~/.dc3/credentials.key` (both files `0600` /
restricted ACL). The key is random and independent of the machine identity — the ciphertext file alone cannot be
decrypted offline. The legacy format that derived the key from a machine identifier via `scrypt` is kept read-only for
migration; no new write ever uses it. The password is stored as `identifier → password` (`username@tenant`), never in
plaintext. When you back up or migrate `~/.dc3`, take `credentials.enc` and `credentials.key` together — without the
key file the passwords are unrecoverable.

```bash
# Choose the credential backend at login time
dc3 auth login --store keychain        # store in the OS keychain (good for everyday use)
dc3 auth login --store env             # read from DC3_PASSWORD (good for CI)
dc3 auth login --no-save               # don't save the password; re-login manually when it expires

# Non-interactive login (example value; never use a real password in plaintext)
dc3 auth login --tenant default --username dc3 --password '<example-password>'

# Recommended shape for CI/scripts: set DC3_PASSWORD and pass only the identity flags
# (no interactive prompt is ever attempted when stdin is not a terminal)
export DC3_PASSWORD='<example-password>'
dc3 auth login --tenant default --username dc3

dc3 auth status                        # check login state and remaining validity
dc3 auth token --header                # print the full auth headers as JSON (for troubleshooting)
```

## Command module overview

The CLI has 21 top-level command groups, grouped by object and scenario. Config and auth are the entry points; the
metadata modules (device/driver/point/profile/group/label) map to CRUD in the manager center; event/command/alert/
dashboard/topic map to data and runtime state; the remaining eight groups (chat/tools/analytics/session/action/
provider/model/attachment) face the agentic center — conversation, the MCP tool catalog, time-series analytics, session
and high-risk approval management, model providers and model configs, and chat attachments.

| Module      | Command prefix    | Purpose                                                          |
|------------ |-------------------|------------------------------------------------------------------|
| Config      | `dc3 config`      | Gateway address, tenant, credential backend, profile switching + reset |
| Auth        | `dc3 auth`        | Login (incl. `--oauth` client credentials)/logout, login state and token |
| Device      | `dc3 device`      | Device CRUD, counts, online status, XLSX bulk import             |
| Driver      | `dc3 driver`      | Driver CRUD, runtime status                                      |
| Point       | `dc3 point`       | Point CRUD, read latest value, cursor-paged history, write value |
| Profile     | `dc3 profile`     | Device/point template CRUD                                       |
| Group       | `dc3 group`       | Device group management                                          |
| Label       | `dc3 label`       | Label management                                                 |
| Event       | `dc3 event`       | Event definition CRUD, event history                             |
| Command     | `dc3 command`     | Command definition CRUD, invocation, execution history           |
| Alert       | `dc3 alert`       | Alert overview, confirm/bulk-confirm, trends, top sources, deep analysis |
| Dashboard   | `dc3 dashboard`   | Statistics, time series, topology, health, real-time stream      |
| Topic       | `dc3 topic`       | MQTT topic list (read-only)                                      |
| Chat        | `dc3 chat`        | Converse with the agentic center (streaming, continuation, model choice) |
| Tool catalog | `dc3 tools`      | MCP tool catalog: list/call platform tools directly (OAuth login required) |
| Analytics   | `dc3 analytics`   | Nine coarse-grained analytics operations over point time series  |
| Session     | `dc3 session`     | Agentic conversation lifecycle (list, messages, rename, delete)  |
| Approvals   | `dc3 action`      | Pending high-risk tool calls and their confirm/reject loop       |
| Provider    | `dc3 provider`    | Model provider management and connectivity checks                |
| Model       | `dc3 model`       | Model configuration management and connectivity checks           |
| Attachment  | `dc3 attachment`  | Chat attachment upload/list/delete                               |

Under the hood, the CLI entry point parses the command line into those 21 command groups, and every module shares one
set of core components: the HTTP client, config management, token management, and credential storage. The modules only
describe what to do; the gateway requests, profile resolution, renewal, and password retrieval all live in the core
layer.

<CliClassDiagram lang="en" />

There are only two global options, and they are recognized **only before the first subcommand**: `--profile <name>`
switches the config profile for this invocation (an unknown profile is an error); `--format json|table|yaml` sets the
global output format. Placed after the subcommand they are rejected as unknown options (exit code 1), so a leaf
command's own options (like `device update <id> --version <n>`) can never be hijacked by a root flag. Every command
also carries its own `--format`; the effective format resolves as command `--format` → global `--format` → the
persisted `settings.output_format` (unset by default) → the TTY default (`table` on an interactive terminal, `json` in
a pipe). Bare `dc3` (no arguments) prints the full help and exits `0`; `dc3 <group> --help` and
`dc3 help <group> <subcommand>` print the resolved command's help.

::: details Multiple profiles side by side (dev / prod switching)
Each profile keeps its own gateway, tenant, credential backend, and token, fully isolated from the rest:

```bash
dc3 config profile use prod
dc3 config set gateway https://iot.example.com   # example production address
dc3 auth login

dc3 config profile use default                    # switch back to local
dc3 device list
```

:::

## Agentic capabilities: chat, tool catalog, and approvals

One group of CLI commands talks straight to the agentic center: `chat` starts a conversation; `tools` brings the
platform's MCP tool catalog to the terminal; `analytics` runs coarse-grained point time-series analysis;
`session`/`action` manage conversations and the high-risk tool-call approval loop; `provider`/`model` manage model
providers and model configs; `attachment` handles conversation attachments.

`tools` travels over the MCP transport and **accepts OAuth tickets only**: first run `dc3 auth login --oauth` for the
client_credentials flow (the client must be pre-registered in the console's MCP settings) — a classic username/password
ticket cannot be used against `/mcp`.

```bash
# OAuth client_credentials login (example values)
dc3 auth login --oauth --client-id '<client-id>' --client-secret '<client-secret>'

# List the MCP tools visible to the current OAuth ticket, then call one straight from the CLI
dc3 tools list
dc3 tools call read_device --args '{"deviceId":456789}'

# Converse with the agentic center (streaming, continuation, model choice)
dc3 chat "Has the temperature of device 123456 been normal lately?"
dc3 chat --model gpt-4o --stream "Analyze the device data"
dc3 chat --conversation-id 9a1f2c3d-0000-0000-0000-000000000000 "Continue that topic"

# Session management and high-risk tool-call approvals
# (delete/confirm/reject prompt interactively; add --yes for scripts)
dc3 session list
dc3 action pending --conversation-id 9a1f2c3d-0000-0000-0000-000000000000
dc3 action confirm 3e5f7a9b-0000-0000-0000-000000000000 --yes

# Point time-series analytics: nine operations
# (query_latest, query_history, compute_stats, compare_periods,
#  rank_entities, trend_analysis, threshold_report, correlate, data_quality_report)
dc3 analytics list
dc3 analytics run trend_analysis --args '{"pointId":456789}'
dc3 analytics run query_history --args '{"pointId":456789,"days":7}'

# Model providers and model configs
dc3 provider list
dc3 provider check --id 123
dc3 model list

# Conversation attachments
dc3 attachment upload report.xlsx --conversation-id 9a1f2c3d-0000-0000-0000-000000000000
```

For JSON payloads beyond the OS argv size limit, pass `--args-file <path>` (`-` reads stdin) instead of `--args`; both
`tools call` and `analytics run` support that form.

## Hands-on: reading values, reading history, sending commands

The examples below cover common operations with real commands; all IDs and values are example placeholders. Reading the
latest value maps to the data center's `POST /api/v3/data/point_value/latest`, writing a point maps to
`POST /api/v3/data/point_command/write`, and a command receipt maps to
`GET /api/v3/data/command_history/get_by_record_id?record_id=<id>`.

::: code-group

```bash [dc3 CLI]
# Read a point's latest value
dc3 point read 456789 --format json

# Read a point's history: --limit is the page size (default 100); --cursor pages forward
dc3 point history 456789 --device-id 123456 --limit 100 --format json
dc3 point history 456789 --device-id 123456 --limit 100 --cursor '<cursor from the previous page>' --format json

# Send a write command to a writable point (the point must be WRITE_ONLY or READ_WRITE)
dc3 point write 456789 --device-id 123456 --value 25.5

# Invoke a device command
dc3 command call --device-id 123456 --command-id 789 --params '{"speed":1500}'

# Check the command execution receipt (use the recordId returned by call; example value)
dc3 command history 9a1f2c3d-0000-0000-0000-000000000000

# Device and system health
dc3 device status 123456 --format json
dc3 dashboard health --format json
```

```bash [Equivalent curl]
# The equivalent write command sent straight to the gateway (example values)
curl -X POST http://localhost:8000/api/v3/data/point_command/write \
  -H 'Content-Type: application/json' \
  -H 'X-Auth-Tenant: default' \
  -H 'X-Auth-Login: dc3' \
  -H 'X-Auth-Token: {"salt":"<example-salt>","token":"<example-JWT>"}' \
  -d '{"deviceId":123456,"pointId":456789,"value":"25.5"}'
```

:::

History queries are **cursor-paged**: each page's response carries the opaque `cursor` of the next page, passed back in
as `--cursor`; `--limit` controls the page size (default 100). Also note the platform has two "command history"
resources: `dc3 command history <recordId>` looks up the receipt of a `dc3 command call` by **execution record ID**
(`command_history/get_by_record_id`); the write side has a separate `point_command_history/get_by_command_id` lookup by
command_id, which the CLI does not wrap — don't confuse the two.

`dc3 point write` and `dc3 command call` both end up in the command pipeline. A write command runs asynchronously: once
the gateway or data center accepts it, the call returns a command ID right away, and the actual result has to be looked
up by that ID in the command history.

::: danger Write failures aren't echoed back, and each pipeline has its own validity window
Whether a point can be written depends on its `rwFlag` — writing to a `READ_ONLY` point is rejected. If a write command
fails, the receipt's `responseValue` is `null`. A failed value never comes back as a success. The two pipelines have
different validity windows: a write from `dc3 point write` carries `PointCommandDTO.expireAt` defaulting to `now + 10s`
and is discarded if no driver consumes it before the timeout, while `dc3 command call` times out per the command
definition's `timeout` field (`dc3 command add --timeout`, default 30 seconds). These rules are the same for the CLI
and for direct curl.
:::

## Exit codes and the error envelope: how to read the result in scripts

The CLI tells failure categories apart through **four exit codes**. Every failure flows through a single chokepoint:
stderr always gets exactly one line, `Error: <message>`; when the effective output format is json or yaml, stdout also
gets a machine-readable envelope (table keeps stdout clean — humans just read stderr):

```json
{"ok":false,"error":{"kind":"network","code":"NETWORK","message":"Network request failed (...)"}}
```

| Exit code | Meaning                                                               |
|-----------|-----------------------------------------------------------------------|
| `0`       | Success                                                               |
| `1`       | Business error: usage/validation, gateway API error (incl. 404/409/5xx), timeout |
| `2`       | Network error: the request never reached the gateway (DNS, socket, TLS) |
| `3`       | Authentication error: 401/403, login required                          |

For a finer-grained cause, discriminate on the envelope's `error.kind` instead of parsing stderr text:

| `error.kind`   | Meaning                                                     | Exit code |
|------------ |-------------------------------------------------------------|-----------|
| `usage`     | malformed command line (unknown option/command, invalid flag value, excess arguments) | `1` |
| `validation` | business validation failed before or after a gateway round-trip | `1`       |
| `auth`      | gateway rejected authentication (HTTP 401/403)               | `3`       |
| `network`   | the request never reached the gateway                        | `2`       |
| `api`       | non-2xx gateway response, `code` reads `API_<status>`        | `1`       |
| `timeout`   | a long-running operation exceeded its deadline               | `1`       |

```bash
# Branch on the exit code in CI: 3 re-login, 2 network problem, 1 other error
dc3 device list --format json >/dev/null 2>err.log
code=$?
if [ "$code" -eq 3 ]; then
  echo "login expired; run dc3 auth login"
elif [ "$code" -eq 2 ]; then
  echo "gateway unreachable"
elif [ "$code" -ne 0 ]; then
  echo "other error"; cat err.log
fi

# With json/yaml output, read error.kind from the stdout envelope (steadier than parsing stderr)
dc3 point read 456789 --format json 2>/dev/null | grep -o '"kind":"[a-z]*"'
```

::: tip Prefer `--format json` for AI agents
When AI coding tools call the platform through the shell, always add `--format json`. The output fields are stable and
parseable; on failure, read the exit code first (`2` gateway unreachable, `3` re-login needed), then the stdout
envelope's `error.kind` to decide whether to retry or re-login. If you want AI tools to discover and call the platform's
full API surface directly, see how to wire up the gateway MCP endpoint in [AI Agent / MCP Integration](../ai/mcp).
:::

## Further reading

- [Automation](./) — where the CLI, scripts, and MCP fit in the overall automation picture
- [AI Agent / MCP Integration](../ai/mcp) — let AI tools discover and call platform tools through the gateway's `/mcp`
- [First Device](../quickstart/first-device) — the golden path: end-to-end flow from creating a driver to reading values
