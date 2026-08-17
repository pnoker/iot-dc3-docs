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

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | — |

::: info 实现状态：可用 :::

::: warning 原生栈需针对真实从站联调
io.stepfunc:dnp3 原生栈（Rust dnp3 运行时，jar 内置各平台原生库）可正常加载，read()/write() 已实现，但上线前仍需在目标环境针对真实从站联调验证报文行为。 :::

## 最小接入示例

1. 选 DNP3 驱动创建设备，填 host、port=20000。
2. 加位号，填 pointIndex=0、pointType=BINARY_INPUT。
3. 上线前针对真实从站联调验证。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
