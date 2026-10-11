---
title: 消息总线拓扑
---

# 消息总线拓扑

平台的松耦合靠一条消息总线维系：服务间不直接调用的大部分异步流量，都走一组按业务域命名的 topic 交换机。消息层本身是 **broker 中立**的抽象（`dc3-mq`，`DC3_MQ_TYPE` 可选 `rabbitmq`/`kafka`/`pulsar`/`mqtt`，默认 `rabbitmq`）；这页给出**默认 RabbitMQ 实现的全量拓扑清单**——每个交换机、队列、路由键前缀、TTL 与死信去向，以及"谁发布、谁消费"。排障时对着 RabbitMQ 管理页（`15672`）看积压，从这张表就能定位卡在哪条链路。

> 你在这里：数据平面 / 命令平面讲了两条主链路的流转细节；这页是**总账**——包括状态、告警、元数据、事件这些前面没展开的域。名字全部取自 `dc3-mq-rabbitmq` 的 `RabbitNames` / `RabbitTopology`，以代码为准。

## 命名规则

- 交换机：`dc3.e.<域>`；队列：`dc3.q.<域>[.<细分>]`；路由键：`dc3.r.<域>.<前缀>`。
- 队列名带**点号后缀**（如 `dc3.q.point_command.`）的是**每消费者前缀队列**——每个驱动实例按自己的 client id（`dc3.driver.client`）持有自己的队列（如 `dc3.q.point_command.dc3-driver-virtual`），命令按路由键 `dc3.r.point_command.<服务名>.<节点>` 定向投递。
- **例外**：`dc3.q.event.report` 虽然带点号，但它是**固定后缀**的共享队列（所有驱动的事件都落进这一条），不是每消费者队列。
- 可选系统属性 `dc3.rabbit.tag` 会作为前缀注入全部名字（默认为空）——多套栈共用一个 RabbitMQ 时用它隔离。

## 全量清单

### 值与命令（详见数据/命令平面页）

| 交换机 | 队列 | 路由 | 谁发布 → 谁消费 | 说明 |
|--------|------|------|----------------|------|
| `dc3.e.value` | `dc3.q.value.point` | `dc3.r.value.point.*` | 驱动 → 数据中心 | 位号值主链路；TTL 7 天 |
| `dc3.e.point_value_dead` | `dc3.q.point_value_dead` | — | 值队列死信 | 超时未消费或重试耗尽时落入（隔离区，设计上无消费者） |
| `dc3.e.point_command` | `dc3.q.point_command.<client>` | `dc3.r.point_command.<服务名>.<节点>` | 数据中心 → 目标驱动 | 位号读写命令；队列 TTL 30 秒（超时即死信），并带租约联动的 `x-expires`（默认 5 分钟，驱动离线后队列自动删除） |
| `dc3.e.point_command_dead` | `dc3.q.point_command_dead` | — | 命令队列死信 | 过期/重试耗尽的命令 |
| `dc3.e.point_command_result` | `dc3.q.point_command_result` | `dc3.r.point_command_result.*` | 驱动 → 数据中心 | 命令执行回执；TTL 60 秒 |

### 自定义指令与事件

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.command` | `dc3.q.command.<client>` | 数据中心 → 目标驱动 | 设备级自定义指令（`CommandCallDTO`，与位号命令是两套命名空间）；同样 30 秒 TTL + 死信 + 租约 `x-expires` |
| `dc3.e.command_result` | `dc3.q.command_result` | 驱动 → 数据中心 | 自定义指令回执；TTL 60 秒 |
| `dc3.e.command_dead` | `dc3.q.command_dead` | 指令死信 | |
| `dc3.e.event` | `dc3.q.event.report` | 驱动 → 数据中心 | 事件上报（`dc3_event_history`），可触发告警；固定队列，TTL 60 秒，路由键 `dc3.r.event.<驱动服务名>` |

### 注册与元数据

驱动**注册不走消息总线**：驱动起来后经 gRPC（`dc3-api-driver` 的 `DriverClient`）直接向管理中心注册自己并报送协议属性定义——别在管理台找"注册队列"，它不存在（旧 register 常量已从代码中废弃）。这个域里真正走总线的是元数据失效通知：

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.metadata` | `dc3.q.metadata.driver.<client>` | 管理中心 → 目标驱动 | 设备/位号/驱动元数据变更后，管理中心按驱动服务名定向投递（路由键 `dc3.r.metadata.driver.<服务名>`），驱动消费后失效自己的本地元数据缓存；队列 auto-delete + TTL 30 秒 |

### 状态与超时

| 交换机 | 队列 | 说明 |
|--------|------|------|
| `dc3.e.state` | `dc3.q.state.driver` / `dc3.q.state.device` | 驱动/设备向数据中心发的在线状态心跳（`dc3_entity_state` 租约的来源）；队列 TTL 30 秒 |
| `dc3.e.state_timeout_delay` | `dc3.q.state_timeout.driver.45s`（TTL 45 秒） | 延迟队列：数据中心每次收到驱动心跳后投递一枚 45 秒延迟检查，到期死信转入 `dc3.e.state_timeout_check` |
| `dc3.e.state_timeout_check` | `dc3.q.state_timeout.driver_check` | 到期后数据中心消费，按数据库租约（`leaseVersion` 围栏）判定驱动是否真的离线 |
| 同上 | `dc3.q.state_timeout.device_scan_tick.10s`（10 秒） | 设备扫描的定时 tick（数据中心自发、自续的 10 秒循环） |
| 同上 | `dc3.q.state_timeout.device_scan` | 设备扫描执行队列 |

### 告警与通知

| 交换机 | 队列 | 谁发布 → 谁消费 | 说明 |
|--------|------|----------------|------|
| `dc3.e.alarm` | `dc3.q.alarm.driver` / `dc3.q.alarm.device` | 驱动 → 数据中心 | 驱动侧产生的驱动/设备告警（路由键 `dc3.r.alarm.driver.<服务名>` / `dc3.r.alarm.device.<服务名>`）；数据中心消费后落 `dc3_entity_alarm` 并做规则评估。数据中心内部的状态翻转告警直接进服务层，不经这两条队列 |
| | `dc3.q.notify.task`（TTL 24 小时） | 数据中心（告警引擎）→ 通知 worker | 通知投递任务，按渠道路由（`dc3.r.notify.task.<渠道>`）；渠道（飞书机器人/Webhook/邮件）见[告警与通知](../operation/alarms) |

### MQTT 桥

`dc3.e.mqtt` 是 **broker 侧**交换机：由 RabbitMQ 镜像的 `definitions.json` / `rabbitmq.conf`（`mqtt.exchange`，环境变量 `RABBITMQ_MQTT_EXCHANGE`，默认 `dc3.e.mqtt`）随 MQTT 插件声明，1883/8883 入站的 MQTT 消息经它进入 AMQP 侧。它是插件入口，**不属于**应用声明的业务拓扑；应用代码中没有 `dc3.q.mqtt` 队列（旧常量已废弃），MQTT 驱动经 `dc3-common-mqtt` 直连 broker。

## 排障用法

1. **积压在哪条队列**：RabbitMQ 管理页 → Queues → 按 `messages ready` 排序；
2. 对照上表找到"谁消费"——`dc3.q.value.point` 积压是数据中心消费慢（批量/并发参数），`dc3.q.point_command.<client>` 积压是该驱动离线（无人消费，30 秒后死信）；
3. **死信队列有货**：说明消息被拒绝或过期——按对应域查消费端日志（拒绝与重试耗尽都会记录原因）；
4. 队列不存在：检查消费者是否注册（驱动未上线时其前缀队列不会创建——队列在驱动订阅时才声明）；
5. **改了设备配置但驱动没感知**：这条链路的消费者是**驱动**（收元数据事件、失效本地缓存），不是数据中心——先看驱动日志有没有收到 `dc3.r.metadata.driver.<服务名>` 的事件。

## 延伸阅读

- [数据平面](./data-plane) — 值链路的消费、批处理与落库细节
- [命令平面](./command-plane) — 命令状态机、TTL 与死信策略
- [告警与通知](../operation/alarms) — 告警域的表结构与通知链路
- [服务与拓扑](./services) — 服务间同步调用（gRPC facade）的对照
