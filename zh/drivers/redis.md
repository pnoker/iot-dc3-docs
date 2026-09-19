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
| Key Prefix | keyPrefix | STRING | （空） | 键前缀：实际访问的键 = keyPrefix + 位号的 key |
| （连接） | spring.data.redis.* | — | 环境变量 | 通过 Spring Boot 配置（REDIS_HOST / REDIS_PORT） |

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

::: info 实现状态：完整

连接通过 spring.data.redis.*（REDIS_HOST/REDIS_PORT）配置。
:::

## 故障排查

Redis 驱动的问题集中在连接、键名、类型三类：

- **读写都失败，message 里是连接类错误**。原因：连不上 Redis。连接参数是部署级的 `spring.data.redis.*`：`REDIS_HOST`/`REDIS_PORT`（默认 `dc3-redis:6379`）、`REDIS_PASSWORD`、`REDIS_DATABASE`，命令超时 3 秒。所有读写异常都会包成 `Redis read failed` / `Redis write failed`，Redis 侧的原始 message（连接拒绝、超时、鉴权失败）随日志透出。排查：先用 `redis-cli -h <host> -p <port>` 验证连通与凭据，再回到驱动侧。
- **报 `Redis key has no value`**。原因：读到了 null——键或 HASH 字段不存在。实际访问的键是 `keyPrefix + key`（设备级前缀 + 位号的 `key`），前缀少拼、多拼或大小写不一致都会 miss。排查：在 redis-cli 里用拼好的完整键名 `GET`/`HGET` 验证；HASH 位号再核对 `field` 的拼写。
- **日志里出现 `Required attribute 'field' is missing`**。原因：`dataType=HASH` 但位号的 `field` 留空——读和写的入口都会做必填检查。排查：补上 `field`，或把 `dataType` 改回 `STRING`。同理，位号的 `key` 留空会在保存位号时被校验拦下（`key` 为必填）。
- **报 WRONGTYPE**。原因：`dataType` 与键的真实类型不符——拿 `STRING` 去 `GET` 一个哈希键、或拿 `HASH` 去 `HGET` 一个纯字符串键，Redis 服务端直接回 WRONGTYPE，经异常 message 透出。排查：redis-cli 里 `TYPE <key>` 看真实类型，把位号的 `dataType` 与之对齐。
- **Redis 挂了但设备仍显示在线**。原因：本驱动没有实现连接级健康检查，设备健康走 SDK 默认实现（恒报在线），Redis 的连通性只体现在读写异常里。排查：以读写日志为准，不要拿在线状态判断 Redis 是否可达。

## 在 IoT DC3 中如何落地

接入形态：Redis 在这里不是被轮询的物理设备，而是一个共享数据源——上游系统（业务应用、边缘程序、其他驱动）把值写进 Redis，本驱动按周期把这些键搬进平台。[设备](../introduction/concepts/device)承担的是逻辑分组角色：设备级的 `keyPrefix` 在同一个 Redis 实例里隔离多组键，多个设备可以共用一个 Redis 而互不串键。连接由 Spring Boot 按 `spring.data.redis.*` 自动配置（`StringRedisTemplate`），没有按设备维度的连接——设备的增删不涉及连接生命周期。

读写链路：一切都从"键 = `keyPrefix + key`"出发。`read()` 在采集调度（默认每 30 秒）里逐位号执行：`dataType=STRING` 走 `GET`，`dataType=HASH` 取位号的 `field` 走 `HGET`；值非空即封装为[位号值](../introduction/concepts/point-value)上送，为空则抛读异常（键或字段不存在）。`write()` 消费同一组位号属性：`STRING` 走 `SET`、`HASH` 走 `HSET`，命令值统一转成字符串写入——读写落在同一个键上，一个位号配好即可读可写。

平台衔接：连接参数全部走部署级环境变量（`REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DATABASE`），换连接不用动设备；读写异常分别以 `ReadPointException`/`WritePointException` 透出。设备没有连接级健康检查，在线状态走平台统一的租约机制，不能当作 Redis 可达性的信号（见上文故障排查）。读写能力与[驱动能力矩阵](./matrix)一致：读 ✓ / 写 ✓ / 订阅 —（驱动按键轮询，不订阅键空间通知，也不走发布订阅）。

## 最小接入示例

1. 选 Redis 驱动创建设备。
2. 加位号（READ_ONLY），填 key=counter:total、dataType=STRING。
3. 启动驱动，30 秒内即可看到采集值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
