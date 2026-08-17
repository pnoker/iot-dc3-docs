---
title: Kafka 驱动
---

# Kafka 驱动

`dc3-driver-kafka` 把 Apache Kafka 当作流式数据源：入站消息异步消费并缓存，读返回最新缓存值，写生产消息。

## 协议背景

Kafka 是分布式发布订阅流，值异步到达，按消息键（无键按主题）缓存最新消息。

驱动 code：KafkaDriver，类型：DRIVER_SERVER，底层库：Spring Kafka

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Topic | topic | STRING | dc3-driver-kafka | 默认主题 |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Topic | topic | STRING | （空） | 覆盖本位号主题 |
| Key | key | STRING | （空） | 消息键 |

### 命令属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Topic | topic | STRING | （空） | 覆盖本命令主题 |

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | ✓ |

::: info 实现状态：可用 :::

连接通过 spring.kafka.*（KAFKA_BOOTSTRAP_SERVERS）配置。

## 最小接入示例

1. 选 Kafka 驱动创建设备。
2. 加位号（READ_ONLY），填 key=sensor-1。
3. 启动驱动，消息从主题被消费并缓存。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
