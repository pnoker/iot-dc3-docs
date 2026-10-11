---
title: Facade 模式：grpc 与 local
---

<script setup>
import FacadeModesDiagram from '../../.vitepress/theme/components/FacadeModesDiagram.vue'
</script>

# Facade 模式：grpc 与 local

中心服务之间相互调用（数据中心问管理中心要设备、智能中心问数据中心要位号值）有两种装配方式：`grpc`（各服务独立进程、跨进程调用）和
`local`（所有中心合一进程、进程内直调）。这页讲清 `dc3.facade.{auth,manager,data}.mode` 这组开关切的是**部署拓扑**而不是传输协议，以及业务代码为什么完全不用跟着改。

> 你在这里：已读过 [系统架构总览](./) 与 [服务与拓扑](./services)，想理解中心之间到底怎么互联。

## 它是部署拓扑开关，不是协议选择

容易误读的地方先说清：这组开关不是"用 gRPC 还是用 REST"的传输协议二选一，而是"中心服务**分几个进程跑**"的拓扑选择。

业务代码从不直接调对方的 gRPC stub 或 protobuf 类，而是依赖一组**协议中立的 `*Facade` 接口**——契约定义在
`dc3-common-facade-api`（如 `DeviceFacade`、`PointValueFacade`、`TenantFacade`、`PermissionFacade` 等 19 个接口）。每个接口都有两套实现，按**目标中心各自的开关**（`dc3.facade.auth.mode` / `dc3.facade.manager.mode` / `dc3.facade.data.mode`）在启动时择一装配：

- `grpc` 装配 gRPC 实现（`dc3-common-facade-grpc`，如 `DeviceGrpcFacade`）——发起一次跨进程 gRPC 调用，去找独立运行的目标中心。
- `local` 装配进程内实现（`dc3-common-facade-local-{auth,manager,data}`，如 `DeviceLocalFacade`）——直接调用本进程里的目标 Service，**没有网络开销**。
- `disabled` 两者都不装——本进程自己就是该中心（如 manager 进程里的 `dc3.facade.manager.mode`），没有"调自己"的 facade。

`DeviceFacade` 两套实现的 Javadoc 就把这件事说明白了：

> `DeviceLocalFacade` — in-process call into `DeviceService`, selected when `dc3.facade.manager.mode=local`.
> `DeviceGrpcFacade` — gRPC call against Manager Center, selected when `dc3.facade.manager.mode=grpc` (or unset — grpc is the default).

两套实现接同一个接口、返回同样的 BO/Page 类型，所以**切换模式不改一行业务代码**——只换被注入的那个 Bean。

## 两种模式如何装配

装配靠 Spring Boot 的 `@ConditionalOnProperty`，并且**按目标中心各配各的**：`dc3.facade.auth.mode` 只管调 Auth 的那组接口，`dc3.facade.manager.mode` 只管调 Manager 的，`dc3.facade.data.mode` 只管调 Data 的。每个开关上，gRPC 自动配置在该值 `=grpc` 或缺省时生效（`matchIfMissing = true`）；local 自动配置只在 `=local` 时生效；`=disabled` 则什么都不装。同一个 `*Facade` 接口最终装配成哪套实现，完全由对应目标的开关决定。

<FacadeModesDiagram lang="zh" />

图里 `9400` 是管理中心的 gRPC 端口（grpc 模式下数据中心要跨进程访问它）；local 模式下管理中心的 `DeviceService` 和调用方在同一个
JVM 里，`DeviceLocalFacade` 直接方法调用，连端口都不需要。

::: info 接口与实现的命名对应
`facade-api` 里的接口名是 `*Facade`（如 `DeviceFacade`）；gRPC 实现统一加 `Grpc` 中缀（`DeviceGrpcFacade`），进程内实现加
`Local` 中缀（`DeviceLocalFacade`）。看到 `*GrpcFacade` 就知道是跨进程那套，看到 `*LocalFacade` 就知道是进程内那套。
:::

## 何时用哪种

选择标准很直接——你打算把中心服务跑成几个进程：

| 维度   | `grpc`（默认）        | `local`                  |
|------|-------------------|--------------------------|
| 部署形态 | 各中心独立进程，分布式       | 所有中心合一进程，单体              |
| 调用方式 | 跨进程 gRPC          | 进程内方法调用，无网络开销            |
| 适用   | 分布式部署、需要水平扩展、生产   | 本地开发、小型单机、调试             |
| 典型搭配 | 完整 compose 栈（多服务） | `dc3-center-single` 单体服务 |

分布式部署或要按服务独立扩缩容时用 `grpc`：各中心是独立的 Spring Boot 服务，可以各自伸缩、各自重启。本地开发、小型单机或调试时用
`local`：配合把四个中心合一的 `dc3-center-single` 单体服务，省去起多个进程和它们之间的网络往返，启动快、断点直达。

::: tip 怎么选

- 你在本地起整套来开发/调 bug，或只想要一个最小可跑的单机 → 用 `local`，跑 `dc3-center-single`。
- 你要做分布式部署、按中心独立扩缩容，或这是生产环境 → 用 `grpc`（即默认），各中心独立成进程。
- 拿不准就用默认 `grpc`：不写开关就是它，单体场景才需要显式切到 `local`。

:::

## 默认值在哪里、谁覆盖谁

配置就写在**各部署单元自己的 `application.yml`** 里，按目标逐项声明，没有全局环境变量（`.env.example` 里的 `DC3_FACADE_MODE`
是历史残留，当前代码并不消费它）：

- **分布式中心**按目标声明 `grpc`、自身置 `disabled`。以管理中心为例：`dc3.facade.auth.mode: grpc`、`dc3.facade.manager.mode: disabled`
  （自己就是 manager）、`dc3.facade.data.mode: grpc`；数据中心则声明 `auth: grpc` / `manager: grpc` / `data: disabled`。
- **鉴权中心**写的是 `dc3.facade.auth.mode: local`——它只调自己，进程内直达，这是分布式形态下的正常配置而非误配。
- **单体服务** `dc3-center-single`：三个开关全 `local`——四个中心都在同一个进程里，一切进程内直调。

判断某个服务实际用哪种模式，**以它自己的 `application.yml` 与装配条件为准**。

切换模式只需改这组开关，业务代码与接口签名都不动：

::: code-group

```yaml [分布式中心（以 manager 为例）]
dc3:
  facade:
    auth:
      mode: grpc        # 调 Auth Center：跨进程 gRPC
    manager:
      mode: disabled    # 自己就是 Manager Center，无需 facade
    data:
      mode: grpc        # 调 Data Center：跨进程 gRPC
```

```yaml [单体 dc3-center-single]
dc3:
  facade:
    auth:
      mode: local
    manager:
      mode: local
    data:
      mode: local
```

:::

## 约束与边界

- `grpc` 与 `local` 是同一组 `*Facade` 接口的两套实现，**不是**两种传输协议；`local` 不是"facade 走 REST"这一档。开关切的是装配哪套实现、即部署拓扑，以代码的 `@ConditionalOnProperty` 实现为准。
- 开关是**按目标分开**的三个属性（auth/manager/data），取值 `grpc` / `local` / `disabled`；不同目标可以混搭，但分布式与单体两种形态通常整组同值。
- 缺省即 `grpc`：gRPC 自动配置带 `matchIfMissing = true`，不显式配置时默认装配 gRPC 实现。
- `local` 模式要求被调用的目标 Service 必须在同一进程内——它是为 `dc3-center-single` 这类合一进程设计的；把分散的多个中心进程设成
  `local` 找不到对端 Service。
- 切换模式不改业务代码，但会改变运行拓扑与故障域：`grpc` 下一个中心崩了不拖垮其它中心，`local` 下它们共享同一个 JVM 进程。

## 延伸阅读

- [服务与拓扑](./services) — 六个服务、端口、gRPC 端口与启动依赖顺序
- [系统架构总览](./) — 网关 + 四中心 + 驱动如何协作的全景
