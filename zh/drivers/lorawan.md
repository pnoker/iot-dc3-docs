---
title: LoRaWAN 驱动
---

# LoRaWAN 驱动

`dc3-driver-lorawan` 订阅 ChirpStack MQTT 上行，解码 JSON，按 DevEUI 缓存最新载荷与 Cayenne LPP 字段，并发布下行命令。

## 协议背景

LoRaWAN 设备经网关上行到网络服务器（ChirpStack），ChirpStack 通过 MQTT 暴露上行；本驱动订阅这些主题，按 DevEUI 匹配位号。

驱动 code：LorawanDriver，类型：DRIVER_SERVER，底层库：Eclipse Paho MQTT + Jackson

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Application ID | applicationId | STRING | （空） | ChirpStack 应用 ID |
| Broker URI | brokerUri | STRING | tcp://dc3-mqtt:1883 | MQTT broker |
| Subscribe Topic | topic | STRING | application/+/device/+/event/up | 上行主题过滤 |
| Username | username | STRING | （空） | MQTT 用户名（可选） |
| Password | password | STRING | （空） | MQTT 密码（可选） |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| DevEUI | devEui | STRING | （空） | 设备 EUI（16 位十六进制） |
| Field | field | STRING | （空） | Cayenne LPP 字段，空返回原始 base64 |

### 命令属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| DevEUI | devEui | STRING | （空） | 下行设备 EUI |

## 采集与健康

- **采集周期**：`read` 调度默认 cron `0/30 * * * * ?`。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`。

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | ✓ |

::: info 实现状态：可用

MQTT 连接首次读写时惰性建立；messageArrived 解析 deviceInfo.devEui、data 与 Cayenne LPP object。
:::

## 最小接入示例

1. 选 LoRaWAN 驱动创建设备，填 applicationId、brokerUri。
2. 加位号（READ_ONLY），填 devEui、field=temperature。
3. 启动驱动，下一次上行即被缓存并作为位号值。

## 故障排查

::: warning 它读的是缓存，不是终端
read() 只查内存里按 DevEUI 缓存的最近一次上行，不会向 LoRaWAN 网络发起任何请求——缓存里没有就抛 `No LoRaWAN uplink cached`。先解决"上行有没有到 MQTT"，再查位号属性。
:::

::: warning 上行订阅随第一次写值才建立
MQTT 连接与上行订阅是惰性建立的，且只发生在写路径里：read() 只查缓存、健康检查只读连接标志，都不建连。纯只读部署在第一次写值之前不会有任何订阅，缓存始终为空、设备也显示离线——对这种场景，先对该驱动的任意位号触发一次写值，连接与订阅建立后上行才开始进缓存。
:::

- **读抛 `No LoRaWAN uplink cached`**：该 DevEUI 没收到过上行，或 `field` 与报文字段对不上。确认终端在发、ChirpStack 的 MQTT 集成在转发；位号的 `devEui` 与报文里 `deviceInfo.devEui` 逐字符一致（缓存按字符串精确匹配）；`field` 填 ChirpStack `object` 里的字段名，如 `temperature`。
- **上行到了却没进缓存**：报文必须是合法 JSON 且含 `deviceInfo.devEui`——缺 devEui 的消息被丢弃（debug 级日志，默认级别看不到）；解析失败会打 `Failed to parse LoRaWAN uplink` 的 warn。排查时把 `io.github.pnoker.driver` 日志开到 DEBUG。
- **读到的值是一串 base64**：`field` 留空返回原始 FRMPayload 的 base64。要解码后的数值就填 Cayenne LPP 字段名，两者取舍在位号属性 `field` 上。
- **写抛 `Required attribute 'applicationId' is missing`**：下行主题由设备属性 `applicationId` 与位号属性 `devEui` 拼成，任一为空直接失败。对照上文属性表补齐。
- **写抛 `LoRaWAN write failed` 或设备离线**：broker 连不上或认证失败。核对 `brokerUri`（默认 `tcp://dc3-mqtt:1883`）与 `username` / `password`（用户名非空才携带密码）；连接断开会打 `MQTT connection lost` 并置离线，客户端会自动重连。
- **自动重连恢复后一直没上行**：订阅只发生在连接新建那一刻，自动重连成功后不会重新 subscribe。出现"恢复在线却没有新数据"，重启驱动进程重建订阅。
- **写"成功"但终端没动作**：publish 成功只代表报文进了 ChirpStack 的下行队列——下行固定 `fPort=1` 且不确认（`confirmed=false`），Class A 终端要等下一次上行后的接收窗口才能收到。去 ChirpStack 控制台看下行队列与网关流量。
- **值迟迟不更新**：缓存每个 DevEUI 只留最近一条上行（新的覆盖旧的），且 read 调度默认关闭（`schedule.read.enable=false`）——上行只进缓存、不会自动上报为位号值，需要平台手动触发读，或打开 read 调度按 cron 轮询缓存。
- **所有设备一起离线/在线**：健康检查只反映全局 MQTT 连接标志，不逐台探测终端。单个终端在不在线，靠平台租约超时（默认 45 秒）判定。

## 在 IoT DC3 中如何落地

链路形态是"终端 → 网关 → ChirpStack → MQTT broker → 驱动"：ChirpStack 把上行以 JSON 发到 `application/{应用}/device/{DevEUI}/event/up`，驱动订阅设备属性 `topic`（默认通配 `application/+/device/+/event/up`，QoS 1）。注意连接是全驱动共享的：`brokerUri`、`username`、`password`、`topic` 虽写在设备属性上，但实际生效的是第一次触发建链那台设备的取值——客户端保持在线期间，其他设备上配置的不同 broker 不会被应用；要接多个 ChirpStack，就分开部署多个驱动实例。客户端用随机 clientId、cleanSession、自动重连，在第一次写值时惰性建立，建立后上行才开始进缓存。

上行到达后按 `deviceInfo.devEui` 归档：`data`（原始 FRMPayload 的 base64）与 `object`（ChirpStack 解码出的 Cayenne LPP 字段平铺成键值）各一张表，每个 DevEUI 只留最新一条。read() 消费位号属性 `devEui` 与 `field`：`field` 留空取原始 base64，填了取 `object` 的对应字段；缓存未命中直接抛异常，不会发请求去等终端。上行只进缓存、不直接上报——要变成[位号值](../introduction/concepts/point-value)须经过一次 read()（平台手动触发，或打开默认关闭的 read 调度按 cron 轮询缓存）。

写走 MQTT 下行：write() 取设备属性 `applicationId` 与位号属性 `devEui`，把命令值按 UTF-8 编成 base64，组 `{"confirmed":false,"fPort":1,"data":"…"}` 报文 publish 到 `application/{applicationId}/device/{devEui}/command/down`，由 ChirpStack 排队转成 LoRaWAN 下行；yml 声明的命令属性 `devEui` 属于命令执行路径，写值不经过它（本驱动未实现自定义命令执行）。写成功后平台才把值记为位号值。健康检查只反映 broker 连接状态，终端在不在网上交给租约超时（默认 45 秒）判定。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
