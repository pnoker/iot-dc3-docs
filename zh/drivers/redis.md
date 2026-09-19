---
title: Redis 驱动
---

# Redis 驱动

`dc3-driver-redis` 把 Redis 当作数据源：读 STRING 键或 HASH 字段，写 SET/HSET。

## 协议背景

Redis 是内存键值存储，本驱动把位号映射到键（HASH 时可选字段），按周期轮询。

驱动 code：RedisDriver，类型：DRIVER_CLIENT，底层库：Spring Data Redis

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| （连接） | spring.data.redis.* | — | 环境变量 | 通过 Spring Boot 配置 |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Key | key | STRING | （空） | 待读写键 |
| Data Type | dataType | STRING | STRING | STRING 或 HASH |
| Field | field | STRING | （空） | Hash 字段 |

## 采集与健康

- **采集周期**：`read` 调度默认 cron `0/30 * * * * ?`（每 30 秒对所有位号跑一轮轮询）。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`。

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | — |

::: info 实现状态：可用 :::

连接通过 spring.data.redis.*（REDIS_HOST/REDIS_PORT）配置。

## 最小接入示例

1. 选 Redis 驱动创建设备。
2. 加位号（READ_ONLY），填 key=counter:total、dataType=STRING。
3. 启动驱动，30 秒内即可看到采集值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
