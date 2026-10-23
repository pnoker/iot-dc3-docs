---
title: Database Schema Reference
---

# Database Schema Reference

Every schema and table the platform creates in PostgreSQL, on one page: which center owns which block, and what each table holds. The database is built once by the initdb scripts (see [Version Upgrades and Database Migrations](../guide/upgrade)); structural change goes through migrations only — so this page doubles as the map to consult before touching the database.

> You are here: writing cross-table queries, deciding backup scope, or tracing "which table does this land in". The DDL in the upstream `dc3/dependencies/postgres/initdb/` is the source of truth.

## One-page overview

| Schema | initdb script | Owner | Holds |
|--------|---------------|-------|-------|
| `dc3_auth` | `02-iot-dc3-auth.sql` | Auth center | tenants, identities, RBAC, OAuth, MCP connections & audit |
| `dc3_data` | `03-iot-dc3-data.sql` | Data center | rules, alarms, notifications, messages, execution histories |
| `dc3_manager` | `04-iot-dc3-manager.sql` | Manager center | drivers, devices, profiles, points, commands, events — all metadata |
| `dc3_history` | `05-iot-dc3-history.sql` | Data center | point-value hypertable and latest-value projection |
| `dc3_agentic` | `06-iot-dc3-agentic.sql` | Agentic center | sessions, messages, attachments, actions, model config |
| `public` (runtime) | `08-iot-dc3-runtime.sql` | shared | fingerprint, async operations, outbox, idempotency, locks |

## dc3_auth: identity and permissions

| Table | Holds |
|-------|-------|
| `dc3_tenant` | tenants |
| `dc3_principal` | unified principal (users / service accounts / system identities share it) |
| `dc3_user` / `dc3_local_credential` | users, local password credentials |
| `dc3_tenant_membership` / `dc3_service_account` | tenant membership, service accounts |
| `dc3_identity_provider` / `dc3_external_identity` | external identity sources and their mappings |
| `dc3_role` / `dc3_resource` | roles and permission resources (seeded permission codes land here) |
| `dc3_role_principal_bind` / `dc3_role_resource_bind` | role-principal and role-resource bindings |
| `dc3_driver_token` / `dc3_api` | driver registration tokens, API records |
| `dc3_oauth_registered_client` / `dc3_oauth_authorization` / `dc3_oauth_authorization_consent` | OAuth client registration, authorizations, consent |
| `dc3_mcp_connection` / `dc3_mcp_tool_catalog` / `dc3_mcp_connection_tool` | MCP connections, tool catalog, per-connection tool whitelists |
| `dc3_mcp_audit_log` / `dc3_mcp_tool_confirmation` | MCP call audit, high-risk tool confirmation tickets |
| `dc3_menu` / `dc3_identity_audit_log` | console menus, identity audit |

## dc3_manager: metadata

| Table | Holds |
|-------|-------|
| `dc3_label` / `dc3_label_bind` / `dc3_group` / `dc3_group_bind` | labels and groups plus their bindings |
| `dc3_driver` / `dc3_driver_instance` / `dc3_driver_lease_state` | driver definitions, leased runtime replicas, lease state |
| `dc3_device_lease` | single-owner device assignments with monotonic fencing tokens |
| `dc3_driver_device_revision` | O(1) change detection for driver-device assignments |
| `dc3_driver_attribute` / `dc3_point_attribute` / `dc3_command_attribute` / `dc3_event_attribute` | attribute definitions for the four entity kinds |
| `dc3_profile` / `dc3_point` / `dc3_device` | profiles, points, devices |
| `dc3_driver_attribute_config` / `dc3_point_attribute_config` / `dc3_command_attribute_config` / `dc3_event_attribute_config` | attribute values configured on entities |
| `dc3_command` / `dc3_command_param` | commands and their params |
| `dc3_event` / `dc3_event_param` | events and their params |

## dc3_data: rules and runtime data

| Table | Holds |
|-------|-------|
| `dc3_rule` / `dc3_rule_state` | alarm rules and the rule state machine |
| `dc3_entity_alarm` | entity alarms ("what is firing now") |
| `dc3_entity_state` | entity state leases |
| `dc3_notify` / `dc3_notify_channel` / `dc3_notify_channel_bind` / `dc3_notify_history` | notifications, channels, bindings, history |
| `dc3_message` | platform messages |
| `dc3_point_command_history` / `dc3_command_history` / `dc3_event_history` | point-command, command-execution, and event-report histories |

## dc3_history: point-value time series

| Table | Holds |
|-------|-------|
| `dc3_point_value` | point history hypertable (TimescaleDB: 1-day chunks + 16 device hash buckets; 30-day raw retention) |
| `dc3_point_latest` | latest-value projection shared by all Data Center replicas |
| `cagg_point_value_1m` / `cagg_point_value_1h` | continuous aggregates: 1-minute for 1 year, 1-hour forever |

Retention policy and query paths are covered in [Data Plane](../architecture/data-plane).

## dc3_agentic: AI conversations

| Table | Holds |
|-------|-------|
| `dc3_session` / `dc3_message` | session metadata and persisted messages |
| `dc3_attachment` | attachments |
| `dc3_action` | pending and executed high-risk actions |
| `dc3_model_provider` / `dc3_model_config` | model providers (API keys encrypted at rest) and model configs |

See [Agentic Center](../ai/agentic).

## public and the runtime tables

Support tables created by `08-iot-dc3-runtime.sql`, shared across centers:

| Table | Holds |
|-------|-------|
| `dc3_schema_fingerprint` | the initdb DDL fingerprint the startup gate compares against |
| `dc3_operation` | async operation state (where 202 endpoints like device import land) |
| `dc3_outbox` | transactional outbox |
| `dc3_idempotency` | tenant-scoped idempotency keys and results |
| `dc3_platform_lock` | row locks with fencing tokens |
| `dc3_point_value_ingest_outbox` | point-value ingest receipts and replay state |
| `dc3_manager.dc3_device_import_job` | XLSX device-import job payloads (lives in the manager schema) |

## Further reading

- [Version Upgrades and Database Migrations](../guide/upgrade) — initdb vs migrations, the fingerprint gate
- [Data Plane](../architecture/data-plane) — the full point-value journey from ingest to query
- [Domain Model](../architecture/domain-model) — the object relationships behind these tables
