---
title: Zigbee 驱动
---

# Zigbee 驱动

> **`dc3-driver-zigbee` 把 Zigbee 设备接入 IoT DC3**——通过串口协调器（coordinator）连入 Zigbee 网络，按 ZCL
> 属性周期性读取节点数据，并支持向 ZCL 属性写值的命令。

读完这页，你能理解 Zigbee 在物联网网络层中的位置、知道接一台 Zigbee 节点要在驱动侧和位号侧填哪些属性，并清楚当前实现到了哪一步、哪些能力还不能依赖。

## 协议背景

Zigbee 是一种**低功耗、低速率的短距无线 Mesh 协议**，建立在 IEEE 802.15.4 物理/链路层之上，工作在 2.4 GHz
免授权频段。它的典型用途是智能家居与楼宇自控里大量电池供电的传感节点——温湿度、门磁、人体感应、开关、灯具、智能插座等。这类设备数据量小、要求长续航，不适合直接跑
IP 协议栈，于是组成自己的 Zigbee 网络：节点之间可互相中继（mesh），由一个**协调器（coordinator）**统一组网与进出。

在[物联网四层架构](../foundations/iot-protocols)里，Zigbee 属于**网络层**的无线接入技术——它解决"
低速设备的信号怎么省电地传出去"，而不直接讲 IP。Zigbee 网络不直接连公网，而是通过协调器/网关汇聚后再上联，这一点和 BLE 类似、和
MQTT/CoAP 这类应用层消息协议不同。在 IoT DC3 中，协调器以一枚 **USB 串口 dongle** 的形式插在运行驱动的主机上，驱动作为
Zigbee 应用层 client，把每个[位号](../introduction/concepts/point)映射到 Zigbee 网络中的一个 ZCL 属性来采数、写值。

Zigbee 的寻址分多级。每个 Zigbee 设备用 **IEEE 地址**（64 位长地址，出厂固定）唯一标识；设备内部再按 **endpoint（端点）→
cluster（簇）→ attribute（ZCL 属性）** 三级定位某个具体的数据点。理解这套寻址，是配置位号属性的前提。

::: tip 三级寻址：endpoint / cluster / attribute
一个 Zigbee 节点可有多个端点（多功能设备），每个端点下挂若干 ZCL 簇（如温度测量簇 `1026`、相对湿度簇 `1029`），每个簇里再有若干属性。
`cluster` + `attribute` 决定读到的是哪一类物理量——位号的数据类型（[Point](../introduction/concepts/point) 的
`pointTypeFlag`）要和该 ZCL 属性的实际类型对得上。
:::

## 属性配置

接入一台 Zigbee 设备分两层填写：**驱动属性（`driver-attribute`）** 配的是协调器侧的接入参数，一个协调器服务整个 Zigbee 网络；
**位号属性（`point-attribute`）** 把每个采集位号定位到网络中具体的一个 ZCL 属性。下面两张表的字段都来自驱动的
`application.yml`（`dc3.driver.driver-attribute` / `point-attribute`），默认值即 yml 中的 `default-value`。

### 驱动属性（设备级 `driver-attribute`）

这些属性配在[设备](../introduction/concepts/device)上，描述本机上那枚协调器 dongle 怎么连、组到哪张 Zigbee 网络里。
`serialPort` 与 `baudRate` 决定串口连接，`dongleType` 决定用哪种协调器适配器；`panId` 与 `channel` 是预留属性（当前版本建网时
不读取，网络沿用协调器自身存储的参数；语义上 `0` 表示自动）。

| 属性          | code         | 类型     | 默认值            | 说明                                        |
|-------------|--------------|--------|----------------|-------------------------------------------|
| Serial Port | `serialPort` | STRING | `/dev/ttyUSB0` | Zigbee 协调器串口                              |
| Baud Rate   | `baudRate`   | INT    | `115200`       | 串口波特率                                     |
| Dongle Type | `dongleType` | STRING | `TELEGESIS`    | 协调器 dongle 类型（本构建仅支持 TELEGESIS，EMBER/CONBEE 预留） |
| PAN ID      | `panId`      | INT    | `0`            | PAN ID（0=自动；当前版本未读取）                    |
| Channel     | `channel`    | INT    | `0`            | 信道（0=自动，11-26；当前版本未读取）                  |

### 位号属性（`point-attribute`）

每个采集[位号](../introduction/concepts/point)用 IEEE 地址 + 端点 + 簇 + 属性，唯一定位到 Zigbee 网络中的一个 ZCL 属性。
`nodeIeeeAddress` 选哪台节点，`endpointId` / `clusterId` / `attributeId` 按上文三级寻址逐级缩小到那个具体属性。

| 属性                | code              | 类型     | 默认值 | 说明                                      |
|-------------------|-------------------|--------|-----|-----------------------------------------|
| Node IEEE Address | `nodeIeeeAddress` | STRING | （空） | Zigbee 节点 IEEE 地址（如 `00158D0001234567`） |
| Endpoint ID       | `endpointId`      | INT    | `1` | 端点 ID                                   |
| Cluster ID        | `clusterId`       | INT    | `0` | 簇 ID（如 `1026`=温度测量）                     |
| Attribute ID      | `attributeId`     | INT    | `0` | 属性 ID（如 `0`=测量值）                        |

### 写命令属性（`command-attribute`）

`application.yml` 在 `command-attribute` 里声明了与位号属性同名的四级定位字段，但它们当前是**占位声明**：`write()` 的签名只接收
`pointConfig`（位号属性），并不传入命令属性，本驱动也未覆写 `execute()`，因此写入时这组属性不会被读取——写入和读取共用**位号属性**上的同一份
`nodeIeeeAddress` / `endpointId` / `clusterId` / `attributeId`，写入目标就是该位号定位到的 ZCL 属性。下表照录 yml 的声明（说明列即 yml
的 remark 措辞，"写入目标"指其**设计意图**，当前并不会生效）：

| 属性                | code              | 类型     | 默认值 | 说明                |
|-------------------|-------------------|--------|-----|-------------------|
| Node IEEE Address | `nodeIeeeAddress` | STRING | （空） | Zigbee 节点 IEEE 地址 |
| Endpoint ID       | `endpointId`      | INT    | `1` | 端点 ID             |
| Cluster ID        | `clusterId`       | INT    | `0` | 写入目标的簇 ID         |
| Attribute ID      | `attributeId`     | INT    | `0` | 写入目标的属性 ID        |

### 一个最小接入示例

把一个 IEEE 地址为 `00158D0001234567` 的温度传感节点接进来：

1. 选 `Zigbee Driver` 创建[设备](../introduction/concepts/device)，driver 属性填 `serialPort=/dev/ttyUSB0`、
   `baudRate=115200`、`dongleType=TELEGESIS`、`panId=0`、`channel=0`。
2. 给设备绑定的[模板](../introduction/concepts/profile)加一个温度[位号](../introduction/concepts/point)（
   `pointTypeFlag=FLOAT`、`READ_ONLY`），point 属性填 `nodeIeeeAddress=00158D0001234567`、`endpointId=1`、`clusterId=1026`
   （温度测量簇）、`attributeId=0`（测量值）。
3. 确保节点已加入协调器的 Zigbee 网络，启动驱动，30 秒内就能在[位号值](../introduction/concepts/point-value)里看到采集值。

## 故障排查

接入 Zigbee 设备时，问题大多出在串口、网络入网、地址格式或当前实现的边界上。下面按"先连上、再找到、再读对"的顺序排查。

::: warning 协调器找不到 / 串口被占
默认串口是 `/dev/ttyUSB0`、波特率 `115200`。先确认 dongle 已插好、宿主能看到串口设备（如 `ls /dev/ttyUSB*`
），且该串口没有被其他进程占用。容器化部署时，需把宿主串口设备透传进容器（如 `--device=/dev/ttyUSB0`），否则驱动启动后会一直连不上协调器。
`serialPort` / `baudRate` / `dongleType` 任一缺失时，首次建网会直接报 `Driver Zigbee attribute 'xxx' is required
to start the network`。
:::

::: warning 节点报 "node not found"
读写时报找不到节点，通常是 `nodeIeeeAddress` 写错或节点未入网。IEEE 地址是连续 16 位十六进制字符（如 `00158D0001234567`），**不要加冒号或 `0x` 前缀**。地址出厂固定，可在协调器/网关的设备列表里查到。另外，节点必须先加入本协调器的 Zigbee
网络（permit-join 入网）后才能被寻址。
:::

::: warning 端点 / 簇 / 属性找不到
报 "endpoint/cluster/attribute not found" 说明三级寻址某一级填错。多功能设备的端点不一定是 `1`；簇 ID 要对应实际物理量（温度测量
`1026`、相对湿度 `1029`）；属性 ID 要对应该簇下的具体属性（测量值常为 `0`）。先用协调器工具查清目标节点暴露的端点与簇，再回填位号属性。

读路径对该属性发起一次**同步 ZCL 读**（`attribute.readValue`，带超时）：节点不可达或无应答时读到空值，驱动以 `0` 占位返回，不会显式报错。
:::

::: warning 数据类型对不上
位号的 `pointTypeFlag` 要与 ZCL 属性的实际类型一致。温度测量值是有符号整数（单位 0.01℃），按 `FLOAT`
/数值解析；若把字符串类簇当数值读，或反之，会得到无意义的值。配置位号前先核对该 ZCL 属性的数据类型。
:::

::: warning 驱动 / 设备显示离线
驱动级健康检查依赖 `networkManager`
是否已初始化：协调器没连上（或尚未触发首次建网）时驱动级为离线。设备级在线态见[设备](../introduction/concepts/device)的租约机制（健康检查
cron `0/15 * * * * ?`、租约超时 `45 秒`）。设备级健康会按该设备位号上能解析到的 IEEE
地址查协调器网络中的已知节点：节点不在网络中（或位号上没填有效地址、网络尚未建立）即判离线。
:::

## 在 IoT DC3 中如何落地

- **`dc3.driver.code`**：`ZigbeeDriver`（驱动名 `Zigbee Driver`，类型 `DRIVER_CLIENT`——主动连协调器、轮询节点）。这是稳定的路由标识，不要随意改。
- **采集周期**：默认 cron `0/30 * * * * ?`，每 30 秒读一轮 ZCL 属性。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`
  ，在线状态机制见[设备](../introduction/concepts/device)。
- **读 / 写能力**：读路径对该 ZCL 属性发起**同步 ZCL 读**（`attribute.readValue`，带超时；空值以 `0`
  占位），写路径真正把值写入 ZCL 属性（`attribute.writeValue`）并校验 ZCL 写回执
  （`CommandResult`），被设备拒绝或超时都会抛错——写命令返回成功即代表写回执校验通过。
- **订阅能力（尚未实现）**：驱动**只注册了协调器网络状态监听器**（首次建网时 `ensureNetwork()` 里的
  `addNetworkStateListener`，仅记录网络 UP/DOWN
  日志），**并未监听节点入网（node-join/announce）或 ZCL 属性上报**
  ，也未配置属性绑定/上报（binding/reporting）。因此节点入网与属性上报不会形成位号值——[驱动能力矩阵](./matrix)
  中 Zigbee 的"订阅"一栏据此标注为未实现。

::: warning 局部局限：dongle 支持、预留属性与订阅
核心读写链路已可用（实现状态：可用），但以下边界仍需注意：

- **本构建仅支持 Telegesis 协调器**：代码只打包了 `ZigBeeDongleTelegesis` 适配器，`dongleType` 填 `EMBER` / `CONBEE`
  建网时会直接报 `Driver Zigbee dongle type 'xxx' has no adapter in this build`。
- **`panId` / `channel` 当前未读取**：这两个驱动属性不参与建网，协调器沿用自身存储的网络参数（见属性表说明）。
- **订阅未实现**：不监听节点入网与 ZCL 属性上报，见上文"订阅能力"。
:::

## 延伸阅读

- [驱动总览](./index) — 全部驱动分组与选型入口
- [驱动能力矩阵](./matrix) — Zigbee 的读 / 写 / 订阅能力与同类驱动对比
- [设备接入](../operation/device-onboarding) — 一次完整的设备接入流程
- [物联网网络层](../foundations/iot-protocols) — Zigbee 在无线接入与网络融合中的定位
- [BLE 驱动](./ble) — 另一种低功耗短距无线设备接入
