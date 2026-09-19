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

## 故障排查

接入 KNX 的失败分三类：链路建不起来（网络与网关侧）、属性解析失败（配置侧）、读写中途失败（总线侧）。下面每条都对应驱动日志里的一条具体报错。

::: warning 一台设备一条隧道，注意网关隧道上限
驱动按[设备](../introduction/concepts/device)（即每个 `remoteHost`）各建一条 KNXnet/IP 隧道链路。多数 KNX IP 网关的并发隧道数很有限——接口类设备常只有 1 条——多台设备指向同一网关时，超出容量的那条建连会失败。多设备共用网关前，先确认它的隧道容量。
:::

- **读写抛 `Failed to open KNX link`**：隧道建立失败。原因多半是 `remoteHost` / `remotePort`（默认 `3671`）不可达、UDP `3671` 被防火墙拦截（KNXnet/IP 隧道走 UDP），或网关隧道数已满；另外 `remoteHost` 留空时驱动会回退连接 `192.168.0.100`。看报错里带的 `host:port` 先确认实际目标与网络连通，再查网关侧隧道占用。
- **报 `Invalid KNX group address`**：`groupAddress` 不是合法组地址。按三段式 `主/中/子`（如 `1/2/3`）填写；前后空格驱动会自动去掉，但段数与分隔符必须对。
- **报 `Required attribute 'xxx' is missing`**：缺必填项——设备上没填 `remoteHost`，位号上没填 `groupAddress`，或写 UINT 位号时没填 `dpt`。对照上文属性表补齐。
- **UINT 读/写抛异常**：`dpt` 缺失或不是合法数据点类型。读走 `readUnsigned(组地址, dpt)`，写走同一寻址；**写路径上 `dpt` 是必填**，取不到直接失败。按 `主.子` 格式填，如百分比 `5.001`。
- **`dataType` 拼错不报错，读到的却是 0/1**：类型分派只认 `UINT` / `FLOAT` / `CONTROL`（不区分大小写），其余一律按 `BOOL` 读写——拼错的值会静默降级成布尔。
- **写抛 `KNX write failed`，原因带数字解析错误**：命令值与 `dataType` 不匹配。UINT 要整数、FLOAT 要小数、BOOL / CONTROL 要 `true` 或 `false`，解析不了就失败。
- **读一直超时**：KNX 组读是请求-应答——驱动发组读请求后等总线上应答，该组地址没有会应答的设备就超时。在 ETS 里确认这个组地址挂了应答方（通常是执行器），否则换一个有应答的组。
- **读写失败后"安静"了一阵**：SDK 按设备做指数退避——失败一次 1 秒内不再尝试，连续失败每次翻倍、上限 5 分钟，成功一次即复位。这段静默是退避在生效，不代表问题消失。
- **设备频繁离线又上线**：读或写一旦抛异常，驱动会作废该设备链路、下次访问重建；健康检查只看链路 `isOpen()`。偶发一次属正常，频繁出现就回到第一条查网络与网关负载。

## 在 IoT DC3 中如何落地

平台里一个[设备](../introduction/concepts/device)对应一台 KNX IP 网关：驱动拿设备属性 `remoteHost` / `remotePort` 建到网关的 KNXnet/IP 隧道（`localHost` 可选绑定本地地址、`useNat` 应对 NAT 网络、`deviceAddress` 是隧道端的 KNX 个体地址，介质固定 TP1），链路外面包一层 `ProcessCommunicator` 做组地址读写。链路按 `deviceId` 缓存在进程内，启动时不预连——首次读、写或健康检查谁先到谁触发建链；设备在平台里被修改或删除时，驱动收到元数据事件即关闭对应链路，下次访问按新配置重建。

读与写都只消费位号属性：`groupAddress` 定位组，`dataType`（默认 `BOOL`）选通道——BOOL 走布尔、UINT 走 `dpt` 指定的无符号读写（写路径 `dpt` 必填）、FLOAT 走浮点、CONTROL 走控制位；命令值按 `dataType` 解析后写回组地址。yml 里声明的命令属性 `groupAddress` 属于命令执行路径，写值不经过它——本驱动未实现自定义命令执行。任一读/写失败，该设备链路被作废、下次访问重建，SDK 同时按设备指数退避（1 秒起步、翻倍、上限 5 分钟）；写成功后平台才把值记为[位号值](../introduction/concepts/point-value)。

与平台机制的衔接以组地址为中心：采集调度（默认每 30 秒）逐位号发组读、把应答封装成位号值，写命令变成一次组写由执行器在总线上生效。KNX 总线本身有组写事件可订阅，但本驱动没有注册总线监听器，数据面以轮询组读为主——[驱动能力矩阵](./matrix)里订阅列为不支持，与此一致。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
