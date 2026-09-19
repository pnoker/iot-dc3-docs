---
title: DNP3 驱动
---

# DNP3 驱动

`dc3-driver-dnp3` 面向电力自动化的 DNP3（IEEE 1815）主站。协议栈由 io.stepfunc:dnp3 原生 FFI 绑定提供（Rust dnp3 运行时，jar 内置各平台原生库）。

## 协议背景

DNP3（IEEE 1815）是北美电力 SCADA 主流协议，主站连接从站、轮询事件类并同步本地数据库。

驱动 code：Dnp3Driver，类型：DRIVER_CLIENT，底层库：Step Function I/O io.stepfunc:dnp3

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Host | host | STRING | （空） | DNP3 从站地址 |
| Port | port | INT | 20000 | DNP3 TCP 端口 |
| Master Address | masterAddress | INT | 1 | 主站链路地址 |
| Outstation Address | outstationAddress | INT | 1 | 从站链路地址 |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Point Index | pointIndex | INT | 0 | DNP3 点索引 |
| Point Type | pointType | STRING | BINARY_INPUT | BINARY_INPUT, ANALOG_INPUT, COUNTER, DOUBLE_BIT_BINARY_INPUT, BINARY_OUTPUT, ANALOG_OUTPUT |

### 命令属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Point Index | pointIndex | INT | 0 | 命令点索引 |
| Point Type | pointType | STRING | BINARY_OUTPUT | BINARY_OUTPUT 或 ANALOG_OUTPUT |

## 采集与健康

- **采集周期**：`read` 调度默认 cron `0/30 * * * * ?`。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`。

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | — |

::: info 实现状态：可用
io.stepfunc:dnp3 原生栈可正常加载，read()/write() 已实现。
:::

::: warning 原生栈需针对真实从站联调
上线前仍需在目标环境针对真实从站（outstation）联调，验证报文行为后再投产。
:::


## 故障排查

DNP3 的故障先分清是链路没通，还是通了但点取不到——两者的报错不一样。

::: warning 设备要等第一个采集周期之后才可能在线
连接是首次 `read()` 或 `write()` 时才创建的，健康检查只读连接表、不会主动建连：驱动刚启动时设备一律显示离线，属于预期。等默认 30 秒的采集周期跑过一轮、通道状态到达 CONNECTED 之后再下判断，日志里的 `DNP3 client state changed` 可以跟状态迁移。
:::

- **症状：`Required attribute 'host' is missing`** → 原因：`host` 在 yml 里的默认值是空串，建连前做必填校验，空值直接抛 `ConnectorException`。排查：给设备属性 `host` 填从站地址。
- **症状：`DNP3 poll timed out`，日志伴随 `DNP3 poll failed`** → 原因：轮询请求的异常只记一条 warn，随后等应答分片的闩锁 5 秒等不到就超时。TCP 不通、端口不对、主站或从站链路地址对不上（从站直接丢弃地址不符的帧）都是这个表现。排查：先 `telnet <host> 20000` 验证连通，再核对 `masterAddress` / `outstationAddress` 与从站配置一致。
- **症状：`DNP3 point not found`** → 原因：轮询成功但缓存里没有这个点。缓存按「点类型 + 索引」存值，`pointType` 是精确字符串匹配——拼错、大小写不对、从站不报该类型、`pointIndex` 超出从站点表，都取不到值。排查：`pointType` 逐字符对照取值表，`pointIndex` 对照从站的静态点表。
- **症状：`DNP3 write unsupported point type`** → 原因：写只接受位号属性 `pointType` 为 `BINARY_OUTPUT` 或 `ANALOG_OUTPUT`，其它类型直接抛异常；`write()` 读的是位号属性，命令属性表里的 `pointType` 改了不生效。排查：把可写位号的 `pointType` 改成输出类型。
- **症状：`DNP3 write failed`（值解析或超时）** → 原因：模拟量写按 16 位整数解析命令值，不是整数会抛 `NumberFormatException`；命令发出 5 秒未完成会超时。排查：`ANALOG_OUTPUT` 位号下发整数；超时则确认从站支持 `DIRECT_OPERATE` 且链路可达。
- **症状：二进制输出写 `1`、`on` 全都变成分闸** → 原因：布尔输出按 `Boolean.parseBoolean` 解析，只有字符串 `true` 视为合闸，其余一律当 false 走 `LATCH_OFF`。排查：命令值用 `true` / `false`。

## 在 IoT DC3 中如何落地

DNP3 的标准形态是主站经 TCP 连多台从站（outstation：RTU、保护装置或协议网关），链路层各有源与目的地址。本驱动就是主站：一台从站在平台里建一个[设备](../introduction/concepts/device)，`host` / `port` 定 TCP 目标，`masterAddress` / `outstationAddress` 是链路层地址；驱动按 `deviceId` 为每台设备维护一套「原生 Runtime + TCP 通道 + 关联」资源，首次读写时创建。通道挂着状态监听器，状态迁移会写日志，健康检查就以 `CONNECTED` 判在线。

读链路：调度器默认每 30 秒逐位号调一次 `read()`，每次调用都对从站发一轮 class 0/1/2/3 完整性轮询，应答经 `ReadHandler` 按「点类型 + 索引」缓存进该设备的连接缓存，收完分片后再用位号属性 `pointType` / `pointIndex` 从缓存取值——从站报什么类型、什么索引，位号就能配什么；`BINARY_OUTPUT` / `ANALOG_OUTPUT` 位号读的是输出状态对象。写链路走 `DIRECT_OPERATE`：位号 `pointType=BINARY_OUTPUT` 时发 G12V1 合/分闸（值按布尔解析），`ANALOG_OUTPUT` 时发 G41V1 的 16 位整数。命令属性（`pointIndex` / `pointType`）虽然在 yml 里注册，`write()` 读的仍是位号属性；`execute()` 未实现，自定义命令走接口默认的空返回。

连接生命周期交给原生栈：链路错误模式为 `CLOSE`，断线后的重连节奏由原生栈的连接策略决定，驱动代码不介入，也不在读写失败时销毁通道；只有设备删除或更新的元数据事件会主动关闭整套资源。在线与租约同其它驱动：健康检查默认每 15 秒、租约超时 45 秒，机制见[设备](../introduction/concepts/device)。从站的时间同步由驱动向协议栈提供当前 UTC 时间；非请求上报不做任何处理，驱动也未注册事件属性，与能力矩阵的「订阅 —」一致。

## 最小接入示例

1. 选 DNP3 驱动创建设备，填 host、port=20000。
2. 加位号，填 pointIndex=0、pointType=BINARY_INPUT。
3. 上线前针对真实从站联调验证。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
