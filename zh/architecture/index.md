---
title: 系统架构总览
---

<script setup>
import ArchitectureIndexFlowDiagram from '../../.vitepress/theme/components/ArchitectureIndexFlowDiagram.vue'
</script>

# 系统架构总览

IoT DC3 把"采集—归一—分析—执行—反馈"
的闭环落成一套分层、多租户的微服务架构：北向只暴露一个网关入口，四个中心服务各管一段链路，南向由协议驱动接入现场设备。这页先用一张分层图建立全局心智模型，再逐一讲清四个关键设计各解决什么问题、如何协作，最后导向每条链路的深度子页。

> 你在这里：已读过 [平台定位](../introduction/) 与 [核心概念](../introduction/concepts)
> ，现在把闭环拆成可落地的分层结构。下一步可深入任一平面（数据 / 命令 / 鉴权 / 领域模型）。

## 产品架构全景

下面这张全景图把六个分层、四个中心服务的端口、消息总线交换机与可选运维栈一次铺开——先建立"一图看全"
的整体印象，再往下看每条链路的逻辑细化。图会随站点明暗主题自适应。

<TopologyDiagram lang="zh" />

## 四层参考架构映射

IoT 业界标准的四层参考架构——感知层、网络层、平台层、应用层——外加贯穿四层的安全——DC3 的每一个组件都能在这张
图上对号入座。这张图帮助你快速理解 DC3 站在 "从传感器到 AI 运营" 完整地图的哪个位置。

<LayeredDiagram lang="zh" />

图例颜色：紫色=应用层 · 绿色=平台层 · 橙色=网络层 · 青色=感知层 · 琥珀色=安全。

| 层级       | IoT 参考职责                  | DC3 落地                                                                           |
|----------|---------------------------|----------------------------------------------------------------------------------|
| **应用层**  | 运营、告警、数据分析、AIoT、第三方系统集成   | Web 控制台、开放 API、dc3 CLI、Agentic Center、MCP 工具与告警分析                                |
| **平台层**  | 设备管理、数据存储、规则计算、身份认证、业务编排  | Gateway、Auth / Manager / Data / Agentic 四个中心服务、PostgreSQL、TimescaleDB、领域模型与命令状态机 |
| **网络层**  | 现场总线、IoT 协议、无线 / WAN、消息传输 | 36 个协议驱动、RabbitMQ 异步消息总线、gRPC facade、南向读写命令通道                                    |
| **感知层**  | 传感测量、自动识别、执行器、现场设备与数据源    | Profile / Device / Point 将物理设备、测点和原始信号归一为平台可理解的语义数据                              |
| **横切安全** | 身份、授权、租户隔离、传输与调用可信        | JWT、RBAC、tenantId 全链路传播、HMAC 网关签名、TLS / 密钥配置与审计日志                                |

读这张图时要注意：四层参考架构是**职责视角**，不是进程部署图。比如 Gateway 同时承担北向入口和平台治理职责；RabbitMQ
既服务网络层的协议解耦，也支撑平台层的数据削峰；Agentic Center 属于应用层能力，但它通过平台层的鉴权、命令和数据平面安全落地。更多
IoT 四层参考架构的体系化讲解，见 [物联网技术总览](../foundations/)。

## 三层结构：接入、平台、存储与消息

平台不是一个大单体，而是按职责切开的一组服务。从调用方视角看进去，请求只有一个入口——网关 `dc3-gateway`（HTTP `8000`），它是逻辑上唯一的
API 聚合入口（app 栈下 `8000` 不发布到宿主机，外部经 Web 前端 `8080` 反代触达，见[服务与拓扑](./services)）；其余中心服务的 HTTP/gRPC
端口都只在内部网络可达。网关把请求路由到四个中心服务，它们彼此之间不走 HTTP，而是通过
gRPC facade 跨进程协作。

南向是另一套节奏：现场设备由协议驱动（`dc3-driver-*`，共 36 个）接入，驱动与数据中心之间**不直接调用**，而是经 RabbitMQ
异步收发——位号值往北上行、命令往南下行。所有持久化最终落到 PostgreSQL，其中时序数据（位号值历史）由 TimescaleDB 超表承载。

<ArchitectureIndexFlowDiagram lang="zh" />

这张图的"虚线"是 gRPC facade 调用、"双向实线"是 RabbitMQ
异步收发——两种连接方式的差别，正是下面四个设计要解释的重点。各服务的端口、启动顺序与健康检查见 [服务与拓扑](./services)。

::: info 单体与分布式两种部署形态
上图是默认的分布式形态（四个中心独立进程）。平台也支持把中心合并为单一进程（`dc3-center-single`
）跑在一台机器上——这只是部署拓扑的选择，不改变业务链路。切换由 `dc3.facade.{auth,manager,data}.mode` 一组开关决定，详见 [Facade 模式](./facade-modes)。
:::

## gRPC facade：中心之间如何互相调用

四个中心服务需要频繁互相取数——比如数据中心下发命令前要向管理中心确认设备、位号是否存在且启用。如果让业务代码直接拼 HTTP
URL 去调对方，服务边界会被传输细节污染，单体/分布式两种部署也无法共用同一套代码。

IoT DC3 的解法是 **facade 接口**：跨服务调用统一面向 `dc3-common-facade-api` 里的契约接口编程，业务代码只认接口、不认传输。运行时由
**按目标中心分开的三个开关** `dc3.facade.{auth,manager,data}.mode` 决定接口背后的实现：

- `grpc`（缺省值，分布式各中心显式声明它）—— 实现来自 `dc3-common-facade-grpc`，调用走 gRPC 跨进程到目标中心；
- `local`（单进程）—— 实现来自 `dc3-common-facade-local-{auth,manager,data}`，调用在进程内直接方法调用，不过网络；
- `disabled` —— 本进程自己就是该中心（如 manager 进程的 `dc3.facade.manager.mode`），不装配任何实现。

也就是说，"分布式还是单体"是一个部署开关，而非两套代码。同一份业务逻辑，改这组开关即可在两种形态间切换。

::: warning facade 模式的默认值要看清
缺省即 `grpc`：gRPC 自动配置带 `matchIfMissing = true`，不写这个属性就装配 gRPC 实现。分布式各中心的 `application.yml`
按目标显式声明（如管理中心 `dc3.facade.auth.mode: grpc` / `dc3.facade.data.mode: grpc`、自身置 `disabled`）；鉴权中心基础
`application.yml` 写的是 `dc3.facade.auth.mode: local`（自己调自己，进程内直达），`dc3-center-single` 则三个开关全 `local`
。判断某个服务实际用哪种模式，以它自己的 `application.yml` 与装配条件为准。完整辨析见 [Facade 模式](./facade-modes)。
:::

## RabbitMQ 异步解耦：驱动与数据中心为什么不直连

位号值是高频、突发的——一个 Modbus 驱动一轮采集可能瞬间产出成百上千条值。如果驱动同步调用数据中心写库，任一环节变慢都会反压到采集线程，导致驱动掉线、数据丢点。命令下行同理：HTTP
请求不该一直阻塞等设备把寄存器写完。

所以驱动与数据中心之间隔着一层 RabbitMQ，把"产生"和"消费"在时间上解开：

- **上行（数据）**：驱动把采集结果发到 topic 交换机 `dc3.e.value`，路由键 `dc3.r.value.point.{驱动服务名}`，落到持久队列
  `dc3.q.value.point`（7 天 TTL，配死信交换机 `dc3.e.point_value_dead`）。数据中心的 `PointValueReceiver` 异步消费、批量或即时落库。
- **下行（命令）**：命令经交换机 `dc3.e.point_command` 投递到对应驱动队列（30 秒 TTL + 死信），驱动执行后把结果回发到
  `dc3.e.point_command_result`（60 秒 TTL），由数据中心的结果接收器回收。

这样位号写入永不阻塞采集，命令下发也立即返回 `commandId` 供轮询。消息采用持久投递 + 手动 ack + publisher
confirm，失败按重投/死信处理。完整的交换机、队列与回执链路见 [数据平面](./data-plane) 与 [命令平面](./command-plane)。

::: danger 写命令失败不回显伪造值
写命令只有当驱动的 `write()` 返回 `Boolean.TRUE` 才算成功；失败时结果 `responseValue=null`，**不会**回填任何"看起来成功"
的值。这是有意为之，避免假成功误导上层。命令 `PointCommandDTO.expireAt` 默认 `now + 10s`，超时由驱动在消费时判定为
`EXPIRED`。
:::

## 多租户隔离：tenantId 如何贯穿每一层

平台从设计上就是多租户的——隔离在接口层强制，`tenantId` 沿着"网关 → 中心服务 → gRPC 调用 → 缓存键"传递；单条按
ID、批量查询都经控制器层校验，跨租户访问被挡下。

落地上有几个强制点：

- **接口层（单条按 ID）**：`BaseController.requireTenant()` 查到实体后比对 `tenantId`，跨租户访问返回 404（而非泄露数据）。
- **接口层（批量）**：`BaseController.filterTenant()` 在批量结果里剔除别家租户记录。数据库查询层（R2DBC）当前不做自动租户裁剪，隔离施加在控制器层。
- **跨服务**：gRPC facade 调用在契约支持时携带租户 ID，缓存键也带租户上下文。

这意味着写新查询、新 gRPC 调用、新缓存键时，都必须保留租户作用域——这是硬要求，不是可选优化。隔离怎么一层层落实、与 RBAC
如何配合，见 [鉴权 · 租户 · RBAC](./auth-rbac)。

## HMAC 网关签名：后端如何信任"调用方是谁"

网关在鉴权后，会把解析出的身份（租户、登录名、principal）打成 `X-Auth-Principal` JSON
头，转发给后端中心服务。后端据此做权限判定。问题是：后端凭什么相信这个头不是伪造的？毕竟绕过网关直接打内网端口也能构造一个假
principal 头。

解法是 **HMAC-SHA256 签名**。网关用密钥 `AUTH_HMAC_SECRET`（配置键 `dc3.auth.hmac.secret`）对 principal 内容签名，把签名放进
`X-Auth-Sign` 头；后端用同一密钥验签，验不过就拒绝。只有持有密钥的网关能签出有效请求，伪造的 principal 头会在后端被挡下。

::: danger 生产环境密钥必须改，否则启动即失败
`AUTH_HMAC_SECRET` 出厂默认值是 `io.github.pnoker.dc3`，仅供开发。当 Spring profile 含 `pre` 或 `pro`
时，若密钥为空或仍等于该默认值，服务会在启动时抛 `IllegalStateException` **fail-fast**，拒绝带着弱密钥上生产。
`DC3_SECURITY_KEY`（登录 Token 签名）同理必须换成环境专属的强随机值。
:::

## 一致性与可扩展性

四个中心服务的**业务数据**是无状态的——最新值等热数据放在共享数据库（位号最新值在 `dc3_point_latest` 投影表里，任何副本都能读能写），请求不黏在某个实例上，业务层面每个中心都可以水平扩展。但有一个**例外要知道**：令牌 denylist 是鉴权中心**进程内**的 Caffeine 缓存——注销记录只落在处理那次注销的副本里，而网关每个请求都要找 auth 验签；auth 跑多副本加负载均衡时，注销后的旧令牌在其他副本仍可能被判有效。要么对 auth 做粘性路由、要么把 denylist 换成共享存储，注销才能全局生效。

数据中心的吞吐瓶颈在消费侧，而消费参数是可调的：`PointValueReceiver` 以**批量消费**模式消费 `dc3.q.value.point`
——攒满一批（`POINT_BATCH_SIZE`，默认 500 条）或等待窗口到时（`POINT_BATCH_RECEIVE_TIMEOUT_MILLIS`，默认 100 毫秒）就整批走一次响应式落库；消费并发由
`POINT_CONCURRENT_CONSUMERS`（默认 4，上限 `POINT_MAX_CONCURRENT_CONSUMERS` 默认 16）与 `POINT_PREFETCH_COUNT`（默认 1000）控制，失败按指数退避重试（默认 3 次）后进死信。面对采集洪峰，先由消息队列削峰，再靠并发消费与批量写入消化。

::: info 强一致与最终一致并存
租户隔离、权限判定、命令状态机这些在请求路径上的环节是强一致的（同步校验、即时拒绝）；而位号值的上行落库是经 MQ
的最终一致——值进了队列即视为可靠交付，落库与告警评估异步完成。理解这条边界，有助于排查"命令已回执但历史查询还差一拍"
之类的时序问题。
:::

## 延伸阅读

- [服务与拓扑](./services) — 六个可部署单元、端口分配、启动依赖与健康检查
- [Facade 模式](./facade-modes) — `grpc` 与 `local` 的取舍，单体/分布式切换
- [数据平面](./data-plane) — 位号值从设备到 TimescaleDB 的每一跳与 MQ 拓扑
- [命令平面](./command-plane) — 读写命令的下发、生命周期状态机与回执
- [鉴权 · 租户 · RBAC](./auth-rbac) — 网关签名、令牌签发、权限解析与租户穿透
- [领域模型](./domain-model) — Profile / Point / Device 的字段与 DO/BO/VO 分层
- [模块地图](./modules) — Maven 模块结构、36 个驱动与依赖关系
