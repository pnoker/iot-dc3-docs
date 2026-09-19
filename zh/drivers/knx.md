---
title: KNX 驱动
---

# KNX 驱动

`dc3-driver-knx` 通过 KNX IP 网关连接 KNX（ISO/IEC 14543-3）安装，按设备维护一条隧道链路，读/写布尔、无符号、浮点或控制组地址。

## 协议背景

KNX 是家居与楼宇自动化标准，组地址连接传感器与执行器，IP 网关通过 KNXnet/IP 隧道暴露总线。

驱动 code：KnxDriver，类型：DRIVER_CLIENT，底层库：Calimero（calimero-core）

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Remote Host | remoteHost | STRING | （空） | KNX IP 网关地址 |
| Remote Port | remotePort | INT | 3671 | 网关端口 |
| Local Host | localHost | STRING | （空） | 本地绑定地址 |
| Use NAT | useNat | BOOLEAN | false | 启用 NAT |
| Device Address | deviceAddress | STRING | 0.0.0 | 本地 KNX 个体地址 |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Group Address | groupAddress | STRING | （空） | KNX 组地址，如 1/2/3 |
| Data Type | dataType | STRING | BOOL | BOOL, UINT, FLOAT, CONTROL |
| DPT | dpt | STRING | （空） | UINT 数据点类型，如 5.001 |

### 命令属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Group Address | groupAddress | STRING | （空） | 命令组地址 |

## 采集与健康

- **采集周期**：`read` 调度默认 cron `0/30 * * * * ?`。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`。

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | — |

::: info 实现状态：完整

KnxDriverCustomServiceImpl 按设备缓存 KNXNetworkLink + ProcessCommunicator，设备 UPDATE/DELETE 事件关闭连接。
:::

## 最小接入示例

1. 选 KNX 驱动创建设备，填 remoteHost、deviceAddress=1.1.0。
2. 加位号（READ_ONLY），填 groupAddress=1/2/3、dataType=BOOL。
3. 启动驱动，按采集周期读取组值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
