---
title: M-Bus 驱动
---

# M-Bus 驱动

`dc3-driver-mbus` 通过 M-Bus（EN 13757）总线读取热表、水表、气表。

## 协议背景

M-Bus 是欧洲远程抄表标准，主站发短帧按主地址寻址，仪表回长帧携带 DIF/VIF 数据记录。

驱动 code：MbusDriver，类型：DRIVER_CLIENT，底层库：jSerialComm

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Serial Port | port | STRING | /dev/ttyUSB0 | 串口设备路径 |
| Baud Rate | baudRate | INT | 2400 | 波特率 |
| Parity | parity | INT | 2 | 校验位（2=偶校验） |
| Primary Address | primaryAddress | INT | 0 | M-Bus 主地址（0-250） |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Record Index | recordIndex | INT | 0 | 数据记录 0 基索引 |
| Data Format | dataFormat | STRING | FLOAT | FLOAT, HEX, ASCII |

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

帧为自研实现（无原生 jrxtx 依赖），MbusFrame 负责组帧、校验与记录解析。

## 最小接入示例

1. 选 M-Bus 驱动创建设备，填 port、baudRate=2400、parity=2、primaryAddress=0。
2. 加位号（READ_ONLY），填 recordIndex=0、dataFormat=FLOAT。
3. 启动驱动，30 秒内即可看到采集值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
