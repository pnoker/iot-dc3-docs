---
title: 消息总线拓扑
---

# 消息总线拓扑

平台的松耦合靠 RabbitMQ 一条总线维系：服务间不直接调用的大部分异步流量，都走一组按业务域命名的 topic 交换机。这页给出**全量拓扑清单**——每个交换机、队列、路由键前缀、TTL 与死信去向，以及"谁发布、谁消费"。排障时对着 RabbitMQ 管理页（`15672`）看积压，从这张表就能定位卡在哪条链路。

> 你在这里：数据平面 / 命令平面讲了两条主链路的流转细节；这页是**总账**——包括注册、状态、告警、元数据、事件这些前面没展开的域。名字全部取自 `RabbitConstant.java`，以代码为准。

## 命名规则

- 交换机：`dc3.e.<域>`；队列：`dc3.q.<域>[.<细分>]`；路由键：`dc3.r.<域>.<前缀>`。
- 队列名带**点号后缀**（如 `dc3.q.point_command.`）的是**每消费者前缀队列**——每个驱动节点持有自己的队列（如 `dc3.q.point_command.dc3-driver-mqtt`），命令按节点定向路由。
- 可选系统属性 `dc3.rabbit.tag` 会作为前缀注入全部名字（默认为空）——多套栈共用一个 RabbitMQ 时用它隔离。

## 全量清单

### 值与命令（详见数据/命令平面页）

| 交换机 | 队列 | 路由 | 谁发布 → 谁消费 | 说明 |
|--------|------|------|----------------|------|
| `dc3.e.value` | `dc3.q.value.point` | `dc3.r.value.point.*` | 驱动 → 数据中心 | 位号值主链路；TTL 7 天 |
| `dc3.e.point_value_dead` | `dc3.q.point_value_dead` | — | 值队列死信 | 消费端拒绝且不重入时落入 |
| `dc3.e.point_command` | `dc3.q.point_command.<节点>` | `dc3.r.point_command.<节点>` | 数据中心 → 目标驱动 | 位号读写命令；队列 TTL 30 秒（超时即死信） |
| `dc3.e.point_command_dead` | `dc3.q.point_command_dead` | — | 命令队列死信 | 过期/重试耗尽的命令 |
| `dc3.e.point_command_result` | `dc3.q.point_command_result` | `dc3.r.point_command_result.<节点>` | 驱动 → 数据中心 | 命令执行回执；TTL 60 秒 |

### 自定义指令与事件

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.command` | `dc3.q.command.<节点>` | 数据中心 → 目标驱动 | 设备级自定义指令（`CommandCallDTO`，与位号命令是两套命名空间） |
| `dc3.e.command_result` | `dc3.q.command_result` | 驱动 → 数据中心 | 自定义指令回执 |
| `dc3.e.command_dead` | `dc3.q.command_dead` | 指令死信 | |
| `dc3.e.event` | `dc3.q.event.<租户>` | 驱动/数据中心 → 数据中心 | 事件上报（`dc3_event_history`），可触发告警 |

### 注册与元数据

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.register` | `dc3.q.register.up` | 驱动 → 数据中心 | 驱动上线注册（属性定义随注册报送） |
| | `dc3.q.register.down.<节点>` | 驱动 → 数据中心 | 驱动下线通知（每节点一队列） |
| `dc3.e.metadata` | `dc3.q.metadata.driver.<节点>` | 管理中心 → 数据中心 | 元数据变更通知（驱动维度的缓存失效） |

### 状态与超时

| 交换机 | 队列 | 说明 |
|--------|------|------|
| `dc3.e.state` | `dc3.q.state.driver` / `dc3.q.state.device` | 驱动/设备的在线状态心跳（`dc3_entity_state` 租约的来源） |
| `dc3.e.state_timeout_delay` | `dc3.q.state_timeout.driver.45s`（TTL 45 秒） | 延迟队列：驱动心跳到期检测 |
| `dc3.e.state_timeout_check` | `dc3.q.state_timeout.driver_check` | 到期后执行"判离线"动作 |
| 同上 | `dc3.q.state_timeout.device_scan_tick.10s`（10 秒） | 设备扫描的定时 tick |
| 同上 | `dc3.q.state_timeout.device_scan` | 设备扫描执行队列 |

### 告警与通知

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.alarm` | `dc3.q.alarm.driver` / `dc3.q.alarm.device` | 数据中心（告警引擎）→ 自身 | 告警产生（`dc3_entity_alarm`）与规则评估入口 |
| | `dc3.q.notify.task`（TTL 24 小时） | 告警 → 通知发送器 | 通知投递任务；渠道（邮件/短信/Webhook）见[告警与通知](../operation/alarms) |

### MQTT 桥

| 交换机 | 队列 | 说明 |
|--------|------|------|
| `dc3.e.mqtt` | `dc3.q.mqtt` | 平台内部 MQTT 消息桥（MQTT 驱动与消息总线的转发通道） |

## 排障用法

1. **积压在哪条队列**：RabbitMQ 管理页 → Queues → 按 `messages ready` 排序；
2. 对照上表找到"谁消费"——`dc3.q.value.point` 积压是数据中心消费慢（批处理阈值/并发），`dc3.q.point_command.<节点>` 积压是该驱动离线（无人消费，30 秒后死信）；
3. **死信队列有货**：说明消息被拒绝或过期——按对应域查消费端日志（`basicReject`/`basicNack` 会记录原因）；
4. 队列不存在：检查消费者是否注册（驱动未上线时其前缀队列不会创建）。

## 延伸阅读

- [数据平面](./data-plane) — 值链路的消费、批处理与落库细节
- [命令平面](./command-plane) — 命令状态机、TTL 与死信策略
- [告警与通知](../operation/alarms) — 告警域的表结构与通知链路
- [服务与拓扑](./services) — 服务间同步调用（gRPC facade）的对照
