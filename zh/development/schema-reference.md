---
title: 数据库结构参考
---

# 数据库结构参考

一页看全平台在 PostgreSQL 里建的所有 schema 和表：哪个中心管哪块、表存什么。库由 initdb 脚本一次性建出（见[版本升级与数据库迁移](../guide/upgrade)），结构变更只走 migrations，所以这页同时也是"改库前先知道表归谁管"的地图。

> 你在这里：写跨表查询、做备份范围取舍，或排一个"数据到底落在哪张表"的问题。表结构细节以主仓库 `dc3/dependencies/postgres/initdb/` 的 DDL 为准。

## 一页总览

| schema | initdb 脚本 | 归属 | 存什么 |
|-------|------------|------|--------|
| `dc3_auth` | `02-iot-dc3-auth.sql` | 鉴权中心 | 租户、身份、RBAC、OAuth、MCP 连接与审计 |
| `dc3_data` | `03-iot-dc3-data.sql` | 数据中心 | 规则、告警、通知、消息、各类执行历史 |
| `dc3_manager` | `04-iot-dc3-manager.sql` | 管理中心 | 驱动、设备、模板、位号、命令、事件等全部元数据 |
| `dc3_history` | `05-iot-dc3-history.sql` | 数据中心 | 位号值 hypertable 与最新值投影 |
| `dc3_agentic` | `06-iot-dc3-agentic.sql` | 智能中心 | 会话、消息、附件、动作、模型配置 |
| `public`（运行时表） | `08-iot-dc3-runtime.sql` | 各中心共用 | 指纹、异步操作、outbox、幂等、锁 |

## dc3_auth：身份与权限

| 表 | 存什么 |
|----|--------|
| `dc3_tenant` | 租户 |
| `dc3_principal` | 统一主体（用户 / 服务账号 / 系统身份共用一张） |
| `dc3_user` / `dc3_local_credential` | 用户、本地密码凭证 |
| `dc3_tenant_membership` / `dc3_service_account` | 租户成员关系、服务账号 |
| `dc3_identity_provider` / `dc3_external_identity` | 外部身份源与其映射 |
| `dc3_role` / `dc3_resource` | 角色与权限资源（权限码种子落这里） |
| `dc3_role_principal_bind` / `dc3_role_resource_bind` | 角色-主体、角色-资源绑定 |
| `dc3_driver_token` / `dc3_api` | 驱动注册令牌、API 记录 |
| `dc3_oauth_registered_client` / `dc3_oauth_authorization` / `dc3_oauth_authorization_consent` | OAuth 客户端注册、授权与同意 |
| `dc3_mcp_connection` / `dc3_mcp_tool_catalog` / `dc3_mcp_connection_tool` | MCP 连接、工具目录、连接级工具白名单 |
| `dc3_mcp_audit_log` / `dc3_mcp_tool_confirmation` | MCP 调用审计、高危工具确认票据 |
| `dc3_menu` / `dc3_identity_audit_log` | 控制台菜单、身份审计 |

## dc3_manager：元数据

| 表 | 存什么 |
|----|--------|
| `dc3_label` / `dc3_label_bind` / `dc3_group` / `dc3_group_bind` | 标签与分组及其绑定 |
| `dc3_driver` / `dc3_driver_instance` / `dc3_driver_lease_state` | 驱动定义、租约下的运行副本、租约状态 |
| `dc3_device_lease` | 设备单归属分配，带单调递增 fencing token |
| `dc3_driver_device_revision` | 驱动-设备变更的 O(1) 变更检测 |
| `dc3_driver_attribute` / `dc3_point_attribute` / `dc3_command_attribute` / `dc3_event_attribute` | 四类实体的属性定义（驱动接入参数的元数据） |
| `dc3_profile` / `dc3_point` / `dc3_device` | 模板、位号、设备 |
| `dc3_driver_attribute_config` / `dc3_point_attribute_config` / `dc3_command_attribute_config` / `dc3_event_attribute_config` | 实体上的属性取值 |
| `dc3_command` / `dc3_command_param` | 命令与参数 |
| `dc3_event` / `dc3_event_param` | 事件与参数 |

## dc3_data：规则与运行数据

| 表 | 存什么 |
|----|--------|
| `dc3_rule` / `dc3_rule_state` | 告警规则与规则状态机 |
| `dc3_entity_alarm` | 实体告警（"现在报了什么"） |
| `dc3_entity_state` | 实体状态租约 |
| `dc3_notify` / `dc3_notify_channel` / `dc3_notify_channel_bind` / `dc3_notify_history` | 通知、通道、绑定、历史 |
| `dc3_message` | 平台消息 |
| `dc3_point_command_history` / `dc3_command_history` / `dc3_event_history` | 位号命令、命令执行、事件上报历史 |

## dc3_history：位号值时序

| 表 | 存什么 |
|----|--------|
| `dc3_point_value` | 位号历史 hypertable（TimescaleDB 按天分区 + 设备哈希 16 桶，原始值留 30 天） |
| `dc3_point_latest` | 最新值投影，所有数据中心副本共享 |
| `cagg_point_value_1m` / `cagg_point_value_1h` | 连续聚合：1 分钟粒度留 1 年、1 小时粒度永久 |

保留策略与查询方式详见[数据平面](../architecture/data-plane)。

## dc3_agentic：AI 会话

| 表 | 存什么 |
|----|--------|
| `dc3_session` / `dc3_message` | 会话元数据与持久化消息 |
| `dc3_attachment` | 附件 |
| `dc3_action` | 待确认与已执行的高危动作 |
| `dc3_model_provider` / `dc3_model_config` | 模型提供方（API key 加密落库）与模型配置 |

详见 [Agentic 中心](../ai/agentic)。

## public 与运行时表

`08-iot-dc3-runtime.sql` 建的支撑表，跨中心共用：

| 表 | 存什么 |
|----|--------|
| `dc3_schema_fingerprint` | initdb DDL 指纹，启动闸门比对用 |
| `dc3_operation` | 异步操作状态（设备导入等 202 接口的落库处） |
| `dc3_outbox` | 事务性发件箱 |
| `dc3_idempotency` | 租户级幂等键与操作结果 |
| `dc3_platform_lock` | 行锁与 fencing token |
| `dc3_point_value_ingest_outbox` | 位号值摄取回执与重放状态 |
| `dc3_manager.dc3_device_import_job` | XLSX 设备导入的任务载荷（建在 manager schema） |

## 延伸阅读

- [版本升级与数据库迁移](../guide/upgrade) — initdb 与 migrations 的分工、指纹闸门
- [数据平面](../architecture/data-plane) — 位号值从摄取到查询的完整链路
- [域模型](../architecture/domain-model) — 表背后的对象关系
