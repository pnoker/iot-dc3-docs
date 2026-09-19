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

::: info 实现状态：可用 :::

MQTT 连接首次读写时惰性建立；messageArrived 解析 deviceInfo.devEui、data 与 Cayenne LPP object。

## 最小接入示例

1. 选 LoRaWAN 驱动创建设备，填 applicationId、brokerUri。
2. 加位号（READ_ONLY），填 devEui、field=temperature。
3. 启动驱动，下一次上行即被缓存并作为位号值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
