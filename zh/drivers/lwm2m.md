---
title: LwM2M 驱动
---

<script setup>
import Lwm2mDiagram from '../../.vitepress/theme/components/Lwm2mDiagram.vue'
</script>

# LwM2M 驱动

`dc3-driver-lwm2m` 内嵌一个基于 Eclipse Leshan 的 LwM2M 服务端：设备作为客户端用自己的 `endpoint` 名注册上来，驱动再按位号配置的
`Object / Object Instance / Resource` 三段路径，对该 endpoint 读写资源。这页讲清它接什么协议、要填哪些属性、接不通时怎么排查，以及它在
IoT DC3 里的真实落地状态。

## 协议背景

LwM2M（Lightweight M2M，轻量级 M2M）是 OMA 制定的物联网**设备管理 + 数据采集**协议。它不另起炉灶，而是**架在 CoAP 之上**——跑在
UDP（默认 `5683`，加密用 DTLS/CoAPS `5684`）上，补齐了 CoAP 缺的"设备管理"
那一层。在[物联网四层参考架构](../foundations/iot-protocols)里，它和 CoAP、MQTT 一样属于**网络层的应用层消息协议**：定义"
一条消息长什么样、怎么投递、可靠到什么程度"，与底层用 Wi-Fi 还是 NB-IoT 无关。

LwM2M 的核心是把设备能力抽象成一棵**对象树**：

- **Object**（对象，如 `3303`=温度）——一类能力；
- **Object Instance**（对象实例）——同一类能力的多个实例（如一台设备上有多个温度传感器）；
- **Resource**（资源，如 `5700`=传感器读数）——实例里的一个具体可读/可写项。

访问一个具体的值，就是给出 `/<objectId>/<objectInstanceId>/<resourceId>` 这条路径。固件升级、远程配置、订阅上报都被标准化进这套对象模型，因此
LwM2M 在**电信级、需要远程运维**的终端里很常见：NB-IoT 模组、智能表计、远端环境传感器等"既要远程管理、又要省电"的场景。

与 Modbus、CoAP 这类驱动**主动去连设备**不同，本驱动反过来——它内嵌一个 **LwM2M 服务端**：

<Lwm2mDiagram lang="zh" />

设备先用自己的 endpoint 名注册到这个服务端，注册成功后驱动才能按位号路径对它发起读/写。设备的在线与否，就取决于其 endpoint
是否仍在注册表里。

## 属性配置

LwM2M 的属性分两层：**driver 属性**配在[设备](../introduction/concepts/device)上，描述"用哪个 endpoint
对接设备"，以及一组（当前不生效的）服务端监听/加密声明；**point 属性**配在[位号](../introduction/concepts/point)上，描述"这个位号对应对象树里的哪条资源路径"
。两者都来自驱动 `application.yml` 的 `driver-attribute` / `point-attribute`
声明，接入时在设备实例上为每个属性[填具体值](../introduction/concepts/attribute-config)。

### 驱动属性（设备级 `driver-attribute`）

`endpoint` 是把这台 DC3 设备和已注册的 LwM2M 客户端对应起来的关键——它必须与设备注册时上报的 endpoint 名**一字不差**
，否则匹配不上、设备一直离线。`serverHost` / `serverPort` / `securePort` / `securityMode` / PSK 这几项只是按协议语义声明服务端监听与
加密方式，**均不参与建服、取值也不生效**（`serverHost`/`serverPort` 仅在 `validate()` 里作必填检查）——真正决定监听端口与加密能力的
是部署配置与驱动实现，见下方 warning。

| 属性            | code           | 类型     | 默认值       | 说明                                   |
|---------------|----------------|--------|-----------|--------------------------------------|
| Endpoint      | `endpoint`     | STRING | （空）       | LwM2M 设备 endpoint 名                  |
| Server Host   | `serverHost`   | STRING | `0.0.0.0` | 服务端绑定地址                              |
| Server Port   | `serverPort`   | INT    | `5683`    | CoAP 端口                              |
| Secure Port   | `securePort`   | INT    | `5684`    | CoAPS/DTLS 端口                        |
| Security Mode | `securityMode` | STRING | `NOSEC`   | 安全模式：NOSEC、PSK                       |
| PSK Identity  | `pskIdentity`  | STRING | （空）       | PSK 身份（`securityMode=PSK` 时）         |
| PSK Key       | `pskKey`       | STRING | （空）       | HEX 编码的 PSK 密钥（`securityMode=PSK` 时） |

::: warning 上表的 serverHost / serverPort / securePort 不参与建服
内嵌服务端的监听地址与端口来自**部署配置** `dc3.driver.lwm2m.server-host` / `dc3.driver.lwm2m.server-port`（默认
`0.0.0.0:5683`），由 `Lwm2mServerManager` 显式喂给 Leshan 建明文 CoAP 端点；上表里设备级的 `serverHost`/`serverPort`/
`securePort`/`securityMode`/PSK 这些属性**取值当前不被消费**（`serverHost`/`serverPort` 仅在 `validate()` 里作必填检查）。另外驱动只建了明文 CoAP 端点、**没有 DTLS/CoAPS 端点**
（`securePort` 仅写进启动日志），PSK/加密链路不可用。打通链路请按明文 `5683` 来；要换监听端口，改部署配置
`dc3.driver.lwm2m.server-port` 后重启驱动（见下文实现状态）。
:::

### 位号属性（`point-attribute`）

每个位号填一条 LwM2M 资源路径。驱动把 `objectId` / `objectInstanceId` / `resourceId` 拼成
`/<objectId>/<objectInstanceId>/<resourceId>`，对设备 endpoint
发起读取，返回值即为该位号的[位号值](../introduction/concepts/point-value)。

| 属性                 | code               | 类型     | 默认值     | 说明                                |
|--------------------|--------------------|--------|---------|-----------------------------------|
| Object ID          | `objectId`         | INT    | `0`     | LwM2M Object ID（如 `3303`=温度）      |
| Object Instance ID | `objectInstanceId` | INT    | `0`     | LwM2M Object Instance ID          |
| Resource ID        | `resourceId`       | INT    | `0`     | LwM2M Resource ID（如 `5700`=传感器读数） |
| Observe            | `observe`          | STRING | `false` | 是否启用 LwM2M Observe：true、false     |

::: tip 三段路径决定读哪个资源
位号的数据类型（[Point](../introduction/concepts/point) 的 `pointTypeFlag`）要和该 Resource 实际的数据类型对得上。LwM2M
没有独立的 `command-attribute` 配置表（yml 中 `command-attribute: [ ]` 为空）——可写位号的写入目标就是它自己的那条三段路径：下发写命令时，驱动直接对
`/<objectId>/<objectInstanceId>/<resourceId>` 发 `WriteRequest`，无需额外的命令属性。
:::

::: warning observe 属性当前不生效
`observe=true` 在协议层意为"对该资源开启 LwM2M Observe（订阅式上报）、由设备在值变化时主动推送"。但本驱动**尚未注册任何
Observe，也不消费它**——`read()`/`write()` 都没有读取 `observe` 这个属性。位号值目前**只能靠默认 30 秒一轮的主动读取**拿到，填
`observe=true` 不会触发订阅推送（详见下文实现状态）。
:::

### 采集与健康节律

下列周期来自 `application.yml` 的 `dc3.driver.schedule` / `health`：

- **采集周期**：默认 cron `0/30 * * * * ?`，每 30 秒对每个位号的资源路径发起一次读取。
- **自定义任务**：内置一个 custom 调度，默认 cron `0/5 * * * * ?`，每 5 秒一次，留给驱动自有周期逻辑（当前 `schedule()`
  实现为空）。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45` 秒。设备在线与否取决于其 endpoint 是否仍注册在内嵌服务端上。

## 故障排查

| 现象                        | 可能原因                       | 排查方向              |
|---------------------------|----------------------------|-------------------|
| 设备一直离线、读取无值               | `endpoint` 名与设备注册时上报的不一致   | 二者必须一字不差，见下方第一条   |
| 设备连不上服务端                  | UDP `5683` 被防火墙挡或 NAT 映射失效 | 先验 UDP 链路再查应用配置   |
| 改了设备属性 `serverPort` 仍只监听 5683 | 服务端口由部署配置 `dc3.driver.lwm2m.server-port` 决定，设备属性不参与建服 | 改部署配置里的 `server-port` 并重启驱动 |
| 启 PSK 后注册失败               | PSK 配置当前未生效，或设备强制要求 DTLS   | 先用 `NOSEC` 明文打通链路 |
| `observe=true` 收不到推送      | Observe 自动转发未实现            | 依赖默认 30 秒主动读取     |

::: warning endpoint 名必须和设备注册时一字不差
设备在线判定靠 `endpoint` 名在内嵌服务端的注册表里匹配（`isDeviceRegistered(endpoint)`）。设备实际注册用的 endpoint（常见形如
`urn:imei:<IMEI>` 或厂商自定义串）和设备上填的 `endpoint` 只要差一个字符，就匹配不上：设备会一直显示离线、读取也拿不到值。接入前先确认设备固件里注册用的
endpoint 名到底是什么。
:::

::: tip UDP 协议先查链路
LwM2M 走 CoAP over UDP，连不通常是 UDP 端口（`5683`/`5684`）被防火墙挡、或 NAT 映射失效，而非应用配置错——排错先验链路，再查
endpoint 与位号路径。设备在公网/蜂窝上时，记得放行对应的 UDP 端口。
:::

::: warning 加密链路暂不可用，监听端口走部署配置
设备属性 `serverPort`/`securePort`/`securityMode`/PSK 的取值都不被消费；内嵌服务端只建明文 CoAP 端点（默认 `5683`，**没有** DTLS
`5684` 端点）。因此 PSK/DTLS 加密握手目前做不到——请用 `NOSEC` 明文链路先把读写跑通。要换监听端口，请改部署配置
`dc3.driver.lwm2m.server-port`（默认 `5683`）后重启驱动；需要加密时，要先在 `Lwm2mServerManager` 里把 PSK 配置接进
`LeshanServerBuilder` 并补上 CoAPS 端点。
:::

## 在 IoT DC3 中如何落地

- **`dc3.driver.code`**：`Lwm2mDriver`（稳定路由标识，与[驱动能力矩阵](./matrix)一致，不要随意改）。
- **驱动名 / 类型**：`LwM2M Driver` / `DRIVER_CLIENT`。
- **读能力（已实现）**：`read()` 经 `Lwm2mServerManager.read()` 向已注册设备发
  `ReadRequest(objectId, objectInstanceId, resourceId)`，把返回内容作为位号值——这是真实的协议 I/O，不是桩。
- **写能力（已实现）**：`write()` 经 `Lwm2mServerManager.write()` 对同一三段路径发 `WriteRequest`，写成功返回 `true`、失败/超时返回
  `false`。
- **订阅能力（未实现）**：[驱动能力矩阵](./matrix) 已把 LwM2M 的订阅记为「—」——**Observe 订阅上报当前未落地**：
  `Lwm2mObservationHandler.onObservation()` 仅打印日志、带 `TODO`，驱动既不注册 Observe、也没有 endpoint→deviceId /
  资源路径→pointId 的映射来转发观测值。

::: warning 实现状态：读/写可用，订阅与加密链路未完成
**读和写已经接好真实的 Leshan I/O，对已注册设备可用**。尚未完成的是三块：① Observe 订阅值的自动转发；② 设备级
`serverHost`/`serverPort`/`securePort`/`securityMode`/PSK 属性接线（服务端监听现由部署配置 `dc3.driver.lwm2m.server-*` 决定）
；③ PSK/DTLS 加密链路（服务端当前无 CoAPS 端点）。请把它当作"读写可跑、订阅/加密待补"的接入起点，按下面示例先用明文链路验证读写。
:::

::: details 最小接入示例：读回一个温度位号
把一台 endpoint 名为 `urn:imei:860000000000001`、温度资源在 `/3303/0/5700` 的 LwM2M 传感器接进来：

1. 选 `LwM2M Driver` 创建[设备](../introduction/concepts/device)，driver 属性填 `endpoint=urn:imei:860000000000001`、
   `securityMode=NOSEC`，`serverHost`/`serverPort` 按默认值填即可（`validate()` 要求已填，但取值不生效；监听端口由部署配置
   `dc3.driver.lwm2m.server-port` 决定，默认 `5683`）。
2. 让该 LwM2M 客户端用**同样的** endpoint 名，注册到这台服务的 `5683` 端口（明文）。
3. 给设备绑定的[模板 Profile](../introduction/concepts/profile) 加一个温度[位号](../introduction/concepts/point)（
   `READ_ONLY`），point 属性填 `objectId=3303`、`objectInstanceId=0`、`resourceId=5700`。
4. 启动驱动，设备注册成功后，30 秒内就能在[位号值](../introduction/concepts/point-value)里看到读回的温度值。
   :::

## 延伸阅读

- [驱动总览](./index) — 36 个驱动的全景与分组
- [驱动能力矩阵](./matrix) — 各驱动读/写/订阅能力速查
- [设备接入](../operation/device-onboarding) — 一次完整的接入流程
- [IoT 协议与无线网络](../foundations/iot-protocols) — LwM2M 在网络层的位置与 CoAP/MQTT 的取舍
