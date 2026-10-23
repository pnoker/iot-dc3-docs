---
title: Console · AI Assistant
---

# Console · AI Assistant

The Agentic Center's chat UI lives in the web console: a top-bar button opens the docked chat panel on the right, expandable into a full-screen workbench; the provider and model-config admin pages sit under **Settings → Model Provider / Model Config** (routes `/settings/model/provider` and `/settings/model/config`). The tool surface, two-phase confirmation, and the production security checklist are in [Agentic Center](../ai/agentic); this page stays on the UI.

> You are here: you want to ask the AI "which device went offline" from the console. For the call chain and the security model, see the Agentic page.

## Entry and layout

The launcher button in the top bar docks the chat panel on the right, without navigating away, so you can ask while looking at the device list. The panel expands into a full-screen workbench, which pays off for long conversations and heavy session switching.

Sessions are managed in the left rail: search, pagination, rename, delete. History is cached locally, so flipping back to an old session doesn't re-fetch everything.

The composer is safe for IME input (composition-stage keystrokes never fire), takes attachments, and replies stream; abort or retry at any point.

## What a reply looks like

A reply is assembled from cards, not one blob of text:

| Card | When it shows up |
|------|------------------|
| Tool step cards | one per built-in tool call (query devices, read points, run stats); open it to inspect the arguments and the return value |
| Chart blocks | inline rendering when the model produces visualizable data — line, bar, pie, heatmap |
| Quote and stat cards | entities referenced and key numbers in the answer |
| Attachment cards | files you uploaded |
| Action approval card | when the model proposes a high-risk action such as writing a point value; the one place you must click |

The action approval card is the UI face of two-phase confirmation: the proposal first lands as a pending Action (10-minute expiry), the card states exactly which point gets which value, and only your confirm issues the command; reject voids it.

Conversation preferences (model, temperature, `maxTokens`, whether confirmation is required) persist with the session and carry into the next turn. Token usage comes back with the response, so you can see what the exchange cost.

## Settings → Model Provider

This page maps to the `dc3_model_provider` table: add, edit, delete providers, typed OpenAI-compatible or Anthropic. Three rules hold in the UI exactly as in the backend (see the [production security checklist](../ai/agentic)):

1. the `base_url` must be HTTPS resolving to a public address (SSRF protection, no allowlist);
2. the API key is encrypted with AES-256-GCM on submit and never echoed back;
3. changing the `base_url` requires a fresh API key at the same time.

Each provider can run a two-level connectivity check (`provider/check`, cached): L1 asks "is it reachable, is the key valid"; L2 adds "is the model visible, does it actually answer". Results break out per dimension, and the latest check state is marked on the list.

## Settings → Model Config

This page maps to the `dc3_model_config` table: register "a specific model under a specific provider" as a selectable entry, with capability switches (streaming, tool calling, vision, reasoning) and a default flag. The model dropdown in conversation preferences comes from here; tenants without a usable config get a clear error rather than silently falling onto a shared fallback. Connectivity checks run here too (`model/config/check`).

## UI actions and their endpoints

| UI action | Endpoint (via gateway `/api/v3/agentic`) |
|-----------|------------------------------------------|
| Send a message | `POST /chat/completions` (`stream=true` for SSE) |
| Search / rename / delete sessions | `POST /session/list`, `POST /session/update`, `DELETE /session/delete` |
| Browse history | `POST /message/list` (paginated in the request body) |
| Upload / delete attachments | `POST /attachment/upload`, `DELETE /attachment/delete` |
| Confirm / reject high-risk actions | `POST /action/confirm`, `POST /action/reject` |
| Provider management and checks | `GET/POST/DELETE /provider/*`, `POST /provider/check` |
| Model config management and checks | `/model/config/*`, `POST /model/config/check` |

## Further reading

- [Agentic Center](../ai/agentic) — tool surface, two-phase confirmation, security checklist
- [Console · MCP](./console-mcp) — the other path: platform tools for external agents
- [Environment Variables](../quickstart/environment) — the full `AGENTIC_*` table
