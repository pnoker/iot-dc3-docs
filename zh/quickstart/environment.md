---
title: 环境变量详解
---

<script setup>
import EnvironmentDiagram from '../../.vitepress/theme/components/EnvironmentDiagram.vue'
</script>

# 环境变量详解

IoT DC3 有两套环境变量文件，读取者完全不同：根目录 `.env` 给 Docker Compose 做插值，`dc3/env/dev.env(.sh)` 给本地 Java
进程。读完这页，你能分清哪个变量该写进哪个文件、`localhost` 端口与容器内端口为何不一样，以及生产前必须改掉的两个密钥默认值。

> 你在这里：已经[从源码本地开发](./)或用 Compose 起栈。下一步看[部署模式与镜像源](../guide/usage)了解整套栈如何拉起。

## 为什么有两套文件

同一个变量名（如 `POSTGRES_HOST`），在容器里和在你笔记本上的 Java 进程里，含义不一样。容器之间靠 Compose 网络上的服务名（
`dc3-postgres`）互访；而你本地 IDE 里跑的 Java 进程在宿主机上，只能通过 Compose **发布到宿主机的端口**（如 `localhost:35432`
）连进去。两套文件就是为这两条互不重叠的路径准备的——混用会让本地进程去连一个解析不了的容器名，或让容器去连一个它根本看不到的
`localhost`。

| 文件                   | 读取者               | 用途                                      | 注入方式             |
|----------------------|-------------------|-----------------------------------------|------------------|
| `.env.example`       | Docker Compose 模板 | 复制为根目录 `.env`，定义镜像仓库、镜像标签、发布端口          | Compose 变量插值     |
| `.env`               | Docker Compose    | 本机未跟踪配置，供 `dc3/docker-compose*.yml` 插值  | Compose 变量插值     |
| `dc3/env/dev.env`    | IDE（EnvFile 插件）   | 本地 Java 进程环境变量，**不带** `export`          | IDE EnvFile 插件读取 |
| `dc3/env/dev.env.sh` | Shell             | 本地 Java 进程环境变量，带 `export`，用 `source` 加载 | Shell 环境注入       |

::: warning 根 `.env` 不会注入本地 Java 进程
根目录 `.env` 只服务 Docker Compose，**不会**自动注入到本地 IDE/命令行启动的 Java 进程。本地源码运行必须用
`dc3/env/dev.env(.sh)`，让进程指向 Compose 发布在 `localhost` 上的依赖端口。在根 `.env` 里写 `POSTGRES_HOST=localhost`
也不会改变任何容器的运行时环境。
:::

## 两条互不注入的路径

下图说明两套文件如何沿各自路径生效。关键是这两条路径**互不交叉**：Compose 不读 `dev.env.sh`，本地 Java 进程也不自动读根
`.env`。

<EnvironmentDiagram lang="zh" />

host 端口与 internal 端口的对应关系，是理解这张图的核心：

| 依赖            | host（本地进程用）       | internal（容器互访用）      |
|---------------|-------------------|----------------------|
| PostgreSQL    | `localhost:35432` | `dc3-postgres:5432`  |
| RabbitMQ AMQP | `localhost:35672` | `dc3-rabbitmq:5672`  |
| EMQX MQTT     | `localhost:31883` | `dc3-emqx:1883`（EMQX 默认内部端口） |

## 怎么用

### Compose 起栈

先从模板创建本地 `.env`，再用 `make` 拉起（Makefile 的 `COMPOSE` 自动探测，`docker compose` 优先；也可用
`COMPOSE='podman compose'` 显式指定）：

::: code-group

```bash [make]
cp .env.example .env
make up-db && make up-optional && make up-dev
```

```bash [podman compose]
cp .env.example .env
podman compose -f dc3/docker-compose-dev.yml up -d   # 拉起 dev 栈
podman compose -f dc3/docker-compose-dev.yml config --quiet   # 仅校验配置、不拉起
```

:::

根 `.env` 的变量用于 compose 文件插值，例如镜像与发布端口：

```yaml
image: ${DC3_IMAGE_REGISTRY:-pnoker}/dc3-gateway:${DC3_IMAGE_TAG:-2026.9}
ports:
  - "${DC3_BIND_HOST:-127.0.0.1}:${DC3_GATEWAY_PORT:-8000}:8000"
```

Compose 不会把 `.env` 里每个变量都注入每个容器——只有 compose 文件通过 `environment`、`env_file` 显式引用的变量才会进入容器。

### 本地源码运行

从命令行启动 Java 进程前先 `source`：

```bash
source dc3/env/dev.env.sh
```

不加载时，本地进程会回退到容器内服务名（`dc3-postgres`、`dc3-rabbitmq`、`dc3-center-manager`）或默认端口，从而连不上本机依赖。JetBrains
IDEA 用户改用 `dc3/env/dev.env`（同样内容、无 `export`）：安装 EnvFile 插件 → 在 Run Configuration 启用 EnvFile → 添加
`dc3/env/dev.env`。不要把 `.env.example` 直接当作 IDEA 环境变量文件——它是 Compose 模板，不是 Java 运行时配置。

## 运行 profile：dev / test / pre / pro

`NODE_ENV` 决定每个服务加载哪份 `application-<env>.yml`。四档差异不大，但每档都有明确用途：

| profile | 谁在用 | 日志 | OpenAPI / Swagger | 密钥闸门 | MQ 名字前缀 |
|---------|------|-----|-----------------|---------|------------|
| `dev` | 本地 IDE / `make dev` | `DEBUG`（io.github.pnoker） | 开 | 不生效 | `dev_<用户名>.` |
| `test` | 所有 Compose 栈的默认 | `DEBUG` | 开 | 不生效 | 无 |
| `pre` | 预发 | 默认 `INFO` | 开 | 生效（`AUTH_HMAC_SECRET` 为空或默认值时拒绝启动） | 无 |
| `pro` | 生产 | 默认 `INFO` | **关**（springdoc 端点不存在） | 生效 | 无 |

三个名字相近的变量各管一件事，别混：

- `NODE_ENV`：选 profile（Compose 栈默认 `test`，`dev.env` 里是 `dev`）；
- `SPRING_ENV`：直接指定 `spring.env`，优先级高于 profile yml，主要影响 MQ 前缀与密钥闸门判定（native 镜像里被烘成 `test`，见[消息总线拓扑](../architecture/mq-topology)）；
- `SPRING_GROUP`：MQ 前缀里的组名，默认取 OS 用户名。

## 按场景分组的关键变量

下面按"为某个场景实际需要"的角度分组列出关键变量。完整长表在文末 `::: details` 折叠，这里只列你会真正改动或排错时查的那些。变量的
`Scope` 三类含义：`Runtime`（本地或容器内 Java 进程都读）、`Compose only`（仅根 `.env` 给 Compose）、`Per-process`（单服务覆盖）。

### 安全密钥（Runtime）

两个密钥是平台的身份根。它们自带默认值仅为方便首次启动，绝不可带进生产。注意 `.env.example` **有意不设置**这两个密钥：本地源码运行由 `dc3/env/dev.env` 提供 dev 专属值；`dev`/`single` 栈的 compose 文件带 dev 回退默认（下表"默认值"即该回退）；`app`/`scale`/`swarm` 栈要求在根 `.env` 显式设置，否则拒绝启动。

| 变量                 | 默认值（dev 栈回退）                             | 用途                                                  |
|--------------------|------------------------------------------|-----------------------------------------------------|
| `DC3_SECURITY_KEY` | `dc3.security.key.2026.io.github.pnoker` | 鉴权中心生成/校验登录 Token 的签名密钥                             |
| `AUTH_HMAC_SECRET` | `io.github.pnoker.dc3`                   | Gateway 向后端服务签名 `X-Auth-Principal` 的 HMAC-SHA256 密钥 |

::: danger 生产必须改成强随机值，且切勿提交/打印
`DC3_SECURITY_KEY` 与 `AUTH_HMAC_SECRET` 自带默认值，生产环境必须改成强随机值，切勿提交进仓库、写入日志或打印真实密钥。当
Spring profile 为 `pre`/`pro` 且 `AUTH_HMAC_SECRET` 为空或仍等于默认值 `io.github.pnoker.dc3` 时，服务会 fail-fast 抛
`IllegalStateException` 拒绝启动——这是有意为之的安全闸门，不要绕过。
:::

### PostgreSQL（Runtime）

本地进程连 `localhost:35432`；容器内连 `dc3-postgres:5432`。`POSTGRES_SCHEMA` 只在单服务进程里做 schema 覆盖（如
`dc3_manager`、`dc3_data`），不要全局设。

| 变量                  | 默认值         | Scope        | 用途                                  |
|---------------------|-------------|--------------|-------------------------------------|
| `POSTGRES_HOST`     | `localhost` | Runtime      | 本地用 `localhost`，容器内用 `dc3-postgres` |
| `POSTGRES_PORT`     | `35432`     | Runtime      | host 发布端口；internal 为 `5432`         |
| `POSTGRES_USERNAME` | `dc3`       | Runtime      | 用户名                                 |
| `POSTGRES_PASSWORD` | `dc3dc3dc3` | Runtime      | 密码                                  |
| `POSTGRES_DB`       | `dc3`       | Runtime      | 数据库名                                |
| `POSTGRES_SCHEMA`   | (未设)        | Per-process  | 单服务 schema 覆盖                       |
| `DC3_POSTGRES_PORT` | `35432`     | Compose only | 容器发布到宿主机的端口                         |

### RabbitMQ（Runtime）

AMQP host 端口 `35672`，internal `5672`。开启 TLS 时内部端口切到 `5671`。

| 变量                             | 默认值         | Scope        | 用途                                |
|--------------------------------|-------------|--------------|-----------------------------------|
| `RABBITMQ_HOST`                | `localhost` | Runtime      | 本地 `localhost`，容器内 `dc3-rabbitmq` |
| `RABBITMQ_PORT`                | `35672`     | Runtime      | AMQP host 端口；internal `5672`      |
| `RABBITMQ_USERNAME`            | `dc3`       | Runtime      | 用户名                               |
| `RABBITMQ_PASSWORD`            | `dc3dc3dc3` | Runtime      | 密码                                |
| `RABBITMQ_VIRTUAL_HOST`        | `dc3`       | Runtime      | virtual host                      |
| `RABBITMQ_SSL_ENABLED`         | `false`     | Runtime      | 启用 TLS（true 时走 5671）              |
| `DC3_RABBITMQ_PORT`            | `35672`     | Compose only | AMQP 发布端口                         |
| `DC3_RABBITMQ_MANAGEMENT_PORT` | `15672`     | Compose only | 管理界面发布端口                          |

### 消息中间件选择（Runtime）

内部异步平面（位号值、命令）的消息载体由 `DC3_MQ_TYPE` 选择，默认 `rabbitmq`。选了非 rabbitmq 载体时才会读取对应的连接变量；下表默认值面向 Compose 网络内的服务名，本地源码运行的默认值见 `dc3/env/dev.env`（如 Kafka 用 `localhost:9092`）。

| 变量                       | 默认值                  | 用途                                              |
|--------------------------|----------------------|-------------------------------------------------|
| `DC3_MQ_TYPE`            | `rabbitmq`           | 异步平面载体：`rabbitmq` / `kafka` / `pulsar` / `mqtt` |
| `DC3_MQ_KAFKA_BOOTSTRAP` | `kafka:9092`         | Kafka bootstrap 地址（`DC3_MQ_TYPE=kafka` 时读取）      |
| `DC3_MQ_PULSAR_URL`      | `pulsar://pulsar:6650` | Pulsar 服务 URL（`DC3_MQ_TYPE=pulsar` 时读取）      |
| `DC3_MQ_MQTT_HOST`       | `dc3-rabbitmq`       | MQTT 载体主机（`DC3_MQ_TYPE=mqtt` 时读取）              |
| `DC3_MQ_MQTT_PORT`       | `1883`               | MQTT 载体端口（`DC3_MQ_TYPE=mqtt` 时读取）              |

### EMQX / MQTT（Runtime）

MQTT broker host 端口 `31883`。EMQX 还发布 WebSocket、Dashboard 等多个端口，详见折叠长表。

| 变量                        | 默认值         | Scope        | 用途                                   |
|---------------------------|-------------|--------------|--------------------------------------|
| `MQTT_BROKER_HOST`        | `localhost` | Runtime      | broker 主机                            |
| `MQTT_BROKER_PORT`        | `31883`     | Runtime      | broker 端口（EMQX 发布；internal 为 `1883`） |
| `MQTT_USERNAME`           | `dc3`       | Runtime      | 用户名                                  |
| `MQTT_PASSWORD`           | `dc3dc3dc3` | Runtime      | 密码                                   |
| `DC3_EMQX_MQTT_PORT`      | `31883`     | Compose only | MQTT 发布端口                            |
| `DC3_EMQX_DASHBOARD_PORT` | `18083`     | Compose only | Dashboard 发布端口                       |

### gRPC / facade（Runtime）

中心服务之间通过 facade 互联。目标中心的 facade 实现按 `dc3.facade.{auth,manager,data}.mode` 逐目标择一（缺省即 `grpc`，
`local` 为同进程直调，见 [Facade 模式](../architecture/facade-modes)），本地进程用 `CENTER_*_HOST` 指到 `localhost`。

| 变量                            | 默认值         | Scope   | 用途                                    |
|-------------------------------|-------------|---------|---------------------------------------|
| `CENTER_AUTH_HOST`            | `localhost` | Runtime | 鉴权中心主机                                |
| `CENTER_MANAGER_HOST`         | `localhost` | Runtime | 管理中心主机                                |
| `CENTER_DATA_HOST`            | `localhost` | Runtime | 数据中心主机                                |
| `CENTER_AGENTIC_HOST`         | `localhost` | Runtime | 智能中心主机                                |
| `DC3_FACADE_AUTH_MODE`        | `grpc`      | Runtime | 鉴权中心 facade 模式（`grpc`/`local`/`disabled`）|
| `DC3_FACADE_MANAGER_MODE`     | `grpc`      | Runtime | 管理中心 facade 模式                        |
| `DC3_FACADE_DATA_MODE`        | `grpc`      | Runtime | 数据中心 facade 模式                        |
| `DC3_FACADE_GRPC_DEADLINE_MS` | `3000`      | Runtime | gRPC 单次请求 deadline，`0` 关闭客户端 deadline |

::: warning `DC3_FACADE_MODE` 是无效遗留
`.env.example` 里的 `DC3_FACADE_MODE` **没有任何代码读取**（真实配置键是按目标分的 `dc3.facade.{auth,manager,data}.mode`，
env 形态即上表三行）；它只是历史遗留条目，改它不生效。
:::

### 网关与服务端口（Compose only）

网关是唯一对外 HTTP 入口（`8000`）。各中心 HTTP/gRPC 发布端口如下；`SERVER_PORT`/`GRPC_SERVER_PORT`
仅在本地同时跑多个服务、需要错开端口时作单进程覆盖。

| 变量                               | 默认值    | Scope        | 用途                          |
|----------------------------------|--------|--------------|-----------------------------|
| `DC3_GATEWAY_PORT`               | `8000` | Compose only | 网关 HTTP 发布端口（入口）            |
| `DC3_AUTH_PORT`                  | `8300` | Compose only | 鉴权中心 HTTP                   |
| `DC3_MANAGER_PORT`               | `8400` | Compose only | 管理中心 HTTP                   |
| `DC3_DATA_PORT`                  | `8500` | Compose only | 数据中心 HTTP                   |
| `DC3_AGENTIC_PORT`               | `8600` | Compose only | 智能中心 HTTP                   |
| `DC3_AUTH_GRPC_PORT`             | `9300` | Compose only | 鉴权中心 gRPC                   |
| `DC3_MANAGER_GRPC_PORT`          | `9400` | Compose only | 管理中心 gRPC                   |
| `DC3_DATA_GRPC_PORT`             | `9500` | Compose only | 数据中心 gRPC                   |
| `DC3_LISTENING_VIRTUAL_TCP_PORT` | `6270` | Compose only | Listening Virtual 驱动 TCP 发布 |
| `DC3_LISTENING_VIRTUAL_UDP_PORT` | `6271` | Compose only | Listening Virtual 驱动 UDP 发布（当前实际按 TCP 发布） |
| `DC3_SINGLE_PORT`                | `8100` | Compose only | 单中心模式 HTTP 发布端口           |
| `DC3_SINGLE_GRPC_PORT`           | `9100` | Compose only | 单中心模式 gRPC 发布端口          |
| `DC3_WEB_HTTP_PORT`              | `8080` | Compose only | Web 控制台 HTTP 发布端口          |
| `DC3_WEB_HTTPS_PORT`             | `8443` | Compose only | Web 控制台 HTTPS 发布端口         |
| `SERVER_PORT`                    | (未设)   | Per-process  | 单服务 HTTP 端口覆盖               |
| `GRPC_SERVER_PORT`               | (未设)   | Per-process  | 单中心 gRPC 端口覆盖               |

::: warning `DC3_LISTENING_VIRTUAL_*_PORT` 是宿主机发布端口
`DC3_LISTENING_VIRTUAL_TCP_PORT`/`DC3_LISTENING_VIRTUAL_UDP_PORT` 是 Compose 发布到宿主机的端口；进程内部端口用
`TCP_PORT`/`UDP_PORT`（Per-process），两者别混。另注意 6271 意图是 UDP 通道，但当前发布点未声明 `/udp`，实际按 TCP 发布。
:::

### Web 控制台与网关 OAuth（Compose only）

Web 控制台（`dc3-web`）经 nginx 反代把 API 请求转给网关；网关的 API 路由默认走内部鉴权头，也可切换为 OAuth RS256 票据模式。

| 变量                            | 默认值                  | 用途                                     |
|-------------------------------|----------------------|----------------------------------------|
| `APP_API_HOST`                | `dc3-gateway`        | Web 控制台反代指向的网关主机（nginx upstream）    |
| `APP_API_PORT`                | `8000`               | Web 控制台反代指向的网关端口                     |
| `DC3_GATEWAY_OAUTH_ENABLED`   | `false`              | 网关 API 路由是否启用 OAuth RS256 票据模式        |
| `DC3_GATEWAY_OAUTH_JWKS_URL`  | `http://dc3-center-auth:8300/auth/oauth2/jwks` | OAuth JWKS 地址（指向鉴权中心） |

### Agentic / AI（Runtime）

仅当 `dc3_model_provider` 没有配置可用提供方时，才回退到这组 `AGENTIC_FALLBACK_OPENAI_*`。会话记忆默认开启（`.env.example` 与代码内回退默认一致）。主密钥、传输限流和附件配额这几组变量是 2026.10 加进来的，各自的含义在 [Agentic 中心](../ai/agentic)的安全清单里讲。

| 变量                                    | 默认值                            | 用途                                                               |
|---------------------------------------|--------------------------------|------------------------------------------------------------------|
| `AGENTIC_FALLBACK_OPENAI_BASE_URL`    | `https://api.openai.com`       | fallback OpenAI 兼容 API 地址                                        |
| `AGENTIC_FALLBACK_OPENAI_API_KEY`     | (空)                            | fallback API key（端点需鉴权时填）                                        |
| `AGENTIC_FALLBACK_OPENAI_MODEL`       | `gpt-4o`                       | fallback 模型名                                                     |
| `AGENTIC_FALLBACK_OPENAI_TEMPERATURE` | `0.7`                          | 采样温度（0.0–2.0）                                                    |
| `AGENTIC_FALLBACK_OPENAI_MAX_TOKENS`  | `2048`                         | 最大输出 token                                                       |
| `AGENTIC_MEMORY_SCHEMA_INIT`          | `never`                        | Spring AI JDBC 记忆表初始化模式（`always`/`never`/`create_if_not_exists`） |
| `AGENTIC_MEMORY_ENABLED`              | `true`                         | 是否启用持久化会话记忆                                                      |
| `AGENTIC_TOOL_CALLING_ENABLED`        | `true`                         | 是否启用工具调用                                                         |
| `AGENTIC_MEMORY_MAX_MESSAGES`         | `50`                           | 每个对话窗口保留的最大消息数                                                   |
| `AGENTIC_ATTACHMENT_STORAGE_PATH`     | `dc3/data/agentic/attachments` | 附件存储路径                                                           |
| `DC3_AGENTIC_MASTER_KEY`              | (空)                            | provider API key 落库加密的 AES-256-GCM 主密钥（Base64 256 位；空则从 `DC3_SECURITY_KEY` 派生，生产必须显式设置） |
| `AGENTIC_TRANSPORT_ACQUIRE_TIMEOUT_SECONDS` | `30`                     | 等待模型并发槽位的秒数，超时按 UNAVAILABLE 报错而非无限排队                            |
| `AGENTIC_TRANSPORT_GLOBAL_MAX_CONCURRENT_REQUESTS` | `16`            | 全局在途模型请求上限（兜底模型与未缓存配置）                                          |
| `AGENTIC_TRANSPORT_FALLBACK_ENABLED`  | `false`                        | 平台级兜底模型开关（生产保持关闭：它绕过按租户核算）                                       |
| `AGENTIC_TRANSPORT_PER_TENANT_QPS`    | `0`                            | 每租户每秒聊天请求数，`0` 关闭                                                |
| `AGENTIC_TRANSPORT_CACHE_TTL_SECONDS` | `300`                          | provider / 模型 / 客户端进程内缓存 TTL（秒）                                  |
| `AGENTIC_CHECK_CACHE_MAXIMUM_SIZE`    | `256`                          | 连通性检查结果缓存上限（条）                                                   |
| `AGENTIC_ATTACHMENT_ALLOWED_EXTENSIONS` | `png,jpg,jpeg,gif,webp,csv,txt,json,md,pdf` | 附件扩展名白名单（任何字节落盘前校验）                                    |
| `AGENTIC_ATTACHMENT_TENANT_MAX_COUNT` | `2000`                         | 每租户附件数量上限                                                        |
| `AGENTIC_ATTACHMENT_TENANT_MAX_BYTES` | `1073741824`                   | 每租户附件总字节上限（默认 1 GiB）                                             |
| `AGENTIC_ATTACHMENT_NAME_MAX_LENGTH`  | `128`                          | 附件文件名最大长度（字符）                                                     |

::: info `AGENTIC_MEMORY_SCHEMA_INIT` 的建表绑定以代码为准
`AGENTIC_MEMORY_SCHEMA_INIT` 默认 `never`，意在控制记忆表初始化模式。但该变量经 compose 注入容器后，仓库内未见
`application*.yml` 把它绑定到 Spring AI 的 `initialize-schema`；记忆表实际由 initdb 脚本预建。是否真能通过设为 `always`
触发自动建表，请以代码为准，不要当成已接线的可用开关。
:::

::: danger 真实 API key 不进文档/日志/提交历史
`AGENTIC_FALLBACK_OPENAI_API_KEY` 等敏感值绝不能写入文档、日志或提交历史。正式提供方应配置在 `dc3_model_provider`
表，fallback 仅作兜底。
:::

::: info `AGENTIC_ATTACHMENT_STORAGE_PATH` 在 `.env.example` 与代码内回退默认不一致
上表 `AGENTIC_ATTACHMENT_STORAGE_PATH`（`dc3/data/agentic/attachments`）取自 `.env.example`——走 `cp .env.example .env`
+ `source` 路径时会被显式注入该值。但 `application-agentic.yml` 的代码内回退默认是 `dc3/data/upload/agentic/attachment`。
不走 `.env.example` 路径时以代码为准。其余各行（含 `AGENTIC_MEMORY_ENABLED=true`）两处默认一致。
:::

### 批处理与消费（Runtime）

MQTT 上报与位号值落库各有一组批处理参数。位号值按"批量条数 + 接收超时"双阈值刷批——`POINT_BATCH_SIZE` 条或
`POINT_BATCH_RECEIVE_TIMEOUT_MILLIS` 毫秒先到先刷；并发消费与失败重试由 `POINT_CONCURRENT_CONSUMERS` 等参数控制。

| 变量                                    | 默认值    | 用途                        |
|---------------------------------------|--------|---------------------------|
| `MQTT_BATCH_SPEED`                    | `100`  | MQTT 批量大小阈值（条/批）        |
| `MQTT_BATCH_INTERVAL`                 | `5`    | MQTT 批处理间隔（秒）           |
| `POINT_BATCH_SIZE`                    | `500`  | 位号值批量大小阈值（条/批）          |
| `POINT_BATCH_RECEIVE_TIMEOUT_MILLIS`  | `100`  | 位号值接收超时（毫秒，与批量阈值先到先刷）  |
| `POINT_CONCURRENT_CONSUMERS`          | `4`    | 位号值初始并发消费者数             |
| `POINT_MAX_CONCURRENT_CONSUMERS`      | `16`   | 位号值最大并发消费者数             |
| `POINT_PREFETCH_COUNT`                | `1000` | 每个消费者预取条数               |
| `POINT_RETRY_MAX_RETRIES`             | `3`    | 消费失败最大重试次数              |
| `POINT_RETRY_INITIAL_INTERVAL_MILLIS` | `1000` | 重试初始间隔（毫秒）              |
| `POINT_RETRY_MULTIPLIER`              | `2`    | 重试间隔乘数                  |
| `POINT_RETRY_MAX_INTERVAL_MILLIS`     | `10000` | 重试最大间隔（毫秒）             |

MQTT 侧仍是"数量阈值 + 间隔"一对参数，按 `MQTT_BATCH_INTERVAL` 秒定时把累积缓冲一次性刷出。

### 镜像源（Compose only）

中国大陆网络可把 `REGISTRY` 设为 `cn` 走阿里云镜像。注意：Makefile 读 `REGISTRY`，Compose 插值读 `DC3_IMAGE_REGISTRY`
，两者各管一段。

| 变量                   | 默认值         | 用途                                               |
|----------------------|-------------|--------------------------------------------------|
| `REGISTRY`           | `auto`      | Makefile 镜像源选择器（仅接受 `auto`/`global`/`cn`，其它值会报错） |
| `DC3_IMAGE_REGISTRY` | `pnoker`    | 镜像命名空间                                           |
| `DC3_IMAGE_TAG`      | `2026.9`    | 所有服务/依赖镜像标签                                      |
| `DC3_BASE_TAG`       | `2026.10`   | 依赖镜像所基于的 dc3-docker 基础镜像线（独立于 `DC3_IMAGE_TAG`）      |
| `DC3_VERSION`        | `latest`    | Web 控制台镜像版本（dc3-web 只发布 `latest` 与正式版本）           |
| `DC3_BIND_HOST`      | `127.0.0.1` | 发布端口绑定地址（`0.0.0.0` 对外）                           |

### 可观测性（Compose only / Runtime）

可选栈（EMQX、ELK、Prometheus、Grafana）通过 `make up-optional` 拉起，端口与 JVM 参数如下。

| 变量                       | 默认值                     | Scope        | 用途                  |
|--------------------------|-------------------------|--------------|---------------------|
| `GF_SERVER_ROOT_URL`     | `http://localhost:3000` | Runtime      | Grafana 对外 root URL |
| `DC3_GRAFANA_PORT`       | `3000`                  | Compose only | Grafana 发布端口        |
| `DC3_KIBANA_PORT`        | `5601`                  | Compose only | Kibana 发布端口         |
| `DC3_ES_JAVA_OPTS`       | `-Xms512m -Xmx512m`     | Runtime      | Elasticsearch JVM 堆 |
| `DC3_LS_JAVA_OPTS`       | `-Xms256m -Xmx256m`     | Runtime      | Logstash JVM 堆      |
| `APM_AGENT_ENABLE`       | `false`                 | Runtime      | 是否启用 Java APM agent |
| `DC3_JAEGER_UI_PORT`     | `16686`                 | Compose only | Jaeger UI 发布端口      |
| `DC3_JAEGER_OTLP_GRPC_PORT` | `4317`               | Compose only | Jaeger OTLP gRPC 发布端口 |
| `DC3_JAEGER_OTLP_HTTP_PORT` | `4318`               | Compose only | Jaeger OTLP HTTP 发布端口 |

::: details 完整变量参考（折叠）

#### Security & Authentication（Runtime）

| 变量                 | 默认值                                      | 用途                                |
|--------------------|------------------------------------------|-----------------------------------|
| `DC3_SECURITY_KEY` | `dc3.security.key.2026.io.github.pnoker` | 登录 Token 签名密钥                     |
| `AUTH_HMAC_SECRET` | `io.github.pnoker.dc3`                   | `X-Auth-Principal` HMAC-SHA256 密钥 |

#### PostgreSQL

| 变量                  | 默认值         | Scope        |
|---------------------|-------------|--------------|
| `POSTGRES_HOST`     | `localhost` | Runtime      |
| `POSTGRES_PORT`     | `35432`     | Runtime      |
| `POSTGRES_USERNAME` | `dc3`       | Runtime      |
| `POSTGRES_PASSWORD` | `dc3dc3dc3` | Runtime      |
| `POSTGRES_DB`       | `dc3`       | Runtime      |
| `POSTGRES_SCHEMA`   | (未设)        | Per-process  |
| `DC3_POSTGRES_PORT` | `35432`     | Compose only |

#### RabbitMQ

| 变量                                         | 默认值          | Scope        |
|--------------------------------------------|--------------|--------------|
| `RABBITMQ_HOST`                            | `localhost`  | Runtime      |
| `RABBITMQ_PORT`                            | `35672`      | Runtime      |
| `RABBITMQ_USERNAME`                        | `dc3`        | Runtime      |
| `RABBITMQ_PASSWORD`                        | `dc3dc3dc3`  | Runtime      |
| `RABBITMQ_VIRTUAL_HOST`                    | `dc3`        | Runtime      |
| `RABBITMQ_MQTT_EXCHANGE`                   | `dc3.e.mqtt` | Runtime      |
| `RABBITMQ_SSL_ENABLED`                     | `false`      | Runtime      |
| `RABBITMQ_SSL_ALGORITHM`                   | `TLS`        | Runtime      |
| `RABBITMQ_SSL_VALIDATE_SERVER_CERTIFICATE` | `false`      | Runtime      |
| `RABBITMQ_SSL_VERIFY_HOSTNAME`             | `false`      | Runtime      |
| `RABBITMQ_CONTAINER_PORT`                  | `5672`       | Runtime      |
| `DC3_RABBITMQ_PORT`                        | `35672`      | Compose only |
| `DC3_RABBITMQ_TLS_PORT`                    | `35671`      | Compose only |
| `DC3_RABBITMQ_MANAGEMENT_PORT`             | `15672`      | Compose only |

#### 消息中间件选择

| 变量                       | 默认值                  | Scope        |
|--------------------------|----------------------|--------------|
| `DC3_MQ_TYPE`            | `rabbitmq`           | Runtime      |
| `DC3_MQ_KAFKA_BOOTSTRAP` | `kafka:9092`         | Runtime      |
| `DC3_MQ_PULSAR_URL`      | `pulsar://pulsar:6650` | Runtime    |
| `DC3_MQ_MQTT_HOST`       | `dc3-rabbitmq`       | Runtime      |
| `DC3_MQ_MQTT_PORT`       | `1883`               | Runtime      |

#### EMQX / MQTT

| 变量                        | 默认值         | Scope        |
|---------------------------|-------------|--------------|
| `MQTT_BROKER_HOST`        | `localhost` | Runtime      |
| `MQTT_BROKER_PORT`        | `31883`     | Runtime      |
| `MQTT_USERNAME`           | `dc3`       | Runtime      |
| `MQTT_PASSWORD`           | `dc3dc3dc3` | Runtime      |
| `MQTT_BATCH_SPEED`        | `100`       | Runtime      |
| `MQTT_BATCH_INTERVAL`     | `5`         | Runtime      |
| `DC3_EMQX_WS_PORT`        | `38083`     | Compose only |
| `DC3_EMQX_WSS_PORT`       | `38084`     | Compose only |
| `DC3_EMQX_MQTT_PORT`      | `31883`     | Compose only |
| `DC3_EMQX_MQTTS_PORT`     | `38883`     | Compose only |
| `DC3_EMQX_DASHBOARD_PORT` | `18083`     | Compose only |

#### gRPC / facade

| 变量                            | 默认值         | Scope        |
|-------------------------------|-------------|--------------|
| `CENTER_AUTH_HOST`            | `localhost` | Runtime      |
| `CENTER_MANAGER_HOST`         | `localhost` | Runtime      |
| `CENTER_DATA_HOST`            | `localhost` | Runtime      |
| `CENTER_AGENTIC_HOST`         | `localhost` | Runtime      |
| `DC3_FACADE_AUTH_MODE`        | `grpc`      | Runtime      |
| `DC3_FACADE_MANAGER_MODE`     | `grpc`      | Runtime      |
| `DC3_FACADE_DATA_MODE`        | `grpc`      | Runtime      |
| `DC3_FACADE_GRPC_DEADLINE_MS` | `3000`      | Runtime      |
| `DC3_AUTH_GRPC_PORT`          | `9300`      | Compose only |
| `DC3_MANAGER_GRPC_PORT`       | `9400`      | Compose only |
| `DC3_DATA_GRPC_PORT`          | `9500`      | Compose only |

#### HTTP Gateway & 服务端口

| 变量                               | 默认值    | Scope        |
|----------------------------------|--------|--------------|
| `DC3_GATEWAY_PORT`               | `8000` | Compose only |
| `DC3_AUTH_PORT`                  | `8300` | Compose only |
| `DC3_MANAGER_PORT`               | `8400` | Compose only |
| `DC3_DATA_PORT`                  | `8500` | Compose only |
| `DC3_AGENTIC_PORT`               | `8600` | Compose only |
| `SERVER_PORT`                    | (未设)   | Per-process  |
| `GRPC_SERVER_PORT`               | (未设)   | Per-process  |
| `DC3_LISTENING_VIRTUAL_TCP_PORT` | `6270` | Compose only |
| `DC3_LISTENING_VIRTUAL_UDP_PORT` | `6271` | Compose only |
| `DC3_SINGLE_PORT`                | `8100` | Compose only |
| `DC3_SINGLE_GRPC_PORT`           | `9100` | Compose only |
| `DC3_WEB_HTTP_PORT`              | `8080` | Compose only |
| `DC3_WEB_HTTPS_PORT`             | `8443` | Compose only |
| `TCP_PORT`                       | (未设)   | Per-process  |
| `UDP_PORT`                       | (未设)   | Per-process  |
| `GATEWAY_ROUTE_AUTH_TOKEN_URI`   | (未设)   | Per-process  |
| `GATEWAY_ROUTE_AUTH_URI`         | (未设)   | Per-process  |
| `GATEWAY_ROUTE_MANAGER_URI`      | (未设)   | Per-process  |
| `GATEWAY_ROUTE_DATA_URI`         | (未设)   | Per-process  |
| `GATEWAY_ROUTE_AGENTIC_URI`      | (未设)   | Per-process  |

#### Web 控制台与网关 OAuth

| 变量                            | 默认值                                          | Scope        |
|-------------------------------|------------------------------------------------|--------------|
| `APP_API_HOST`                | `dc3-gateway`                                  | Compose only |
| `APP_API_PORT`                | `8000`                                         | Compose only |
| `DC3_GATEWAY_OAUTH_ENABLED`   | `false`                                        | Compose only |
| `DC3_GATEWAY_OAUTH_JWKS_URL`  | `http://dc3-center-auth:8300/auth/oauth2/jwks` | Compose only |

#### Agentic / AI（Runtime）

| 变量                                    | 默认值                            |
|---------------------------------------|--------------------------------|
| `AGENTIC_FALLBACK_OPENAI_BASE_URL`    | `https://api.openai.com`       |
| `AGENTIC_FALLBACK_OPENAI_API_KEY`     | (空)                            |
| `AGENTIC_FALLBACK_OPENAI_MODEL`       | `gpt-4o`                       |
| `AGENTIC_FALLBACK_OPENAI_TEMPERATURE` | `0.7`                          |
| `AGENTIC_FALLBACK_OPENAI_MAX_TOKENS`  | `2048`                         |
| `AGENTIC_MEMORY_SCHEMA_INIT`          | `never`                        |
| `AGENTIC_MEMORY_ENABLED`              | `true`                         |
| `AGENTIC_MEMORY_MAX_MESSAGES`         | `50`                           |
| `AGENTIC_TOOL_CALLING_ENABLED`        | `true`                         |
| `AGENTIC_ATTACHMENT_STORAGE_PATH`     | `dc3/data/agentic/attachments` |

#### 批处理与消费 / 驱动租约 / 镜像 / 可观测性

| 变量                                    | 默认值                     | Scope        |
|---------------------------------------|-------------------------|--------------|
| `POINT_BATCH_SIZE`                    | `500`                   | Runtime      |
| `POINT_BATCH_RECEIVE_TIMEOUT_MILLIS`  | `100`                   | Runtime      |
| `POINT_CONCURRENT_CONSUMERS`          | `4`                     | Runtime      |
| `POINT_MAX_CONCURRENT_CONSUMERS`      | `16`                    | Runtime      |
| `POINT_PREFETCH_COUNT`                | `1000`                  | Runtime      |
| `POINT_RETRY_MAX_RETRIES`             | `3`                     | Runtime      |
| `POINT_RETRY_INITIAL_INTERVAL_MILLIS` | `1000`                  | Runtime      |
| `POINT_RETRY_MULTIPLIER`              | `2`                     | Runtime      |
| `POINT_RETRY_MAX_INTERVAL_MILLIS`     | `10000`                 | Runtime      |
| `DC3_DRIVER_LEASE_SECONDS`            | `30`                    | Runtime      |
| `DC3_DRIVER_LEASE_RENEW_CRON`         | `0/10 * * * * ?`        | Runtime      |
| `DC3_DRIVER_LEASE_QUEUE_EXPIRES_MILLIS` | `300000`              | Runtime      |
| `REGISTRY`                            | `auto`                  | Compose only |
| `DC3_IMAGE_REGISTRY`                  | `pnoker`                | Compose only |
| `DC3_IMAGE_TAG`                       | `2026.9`                | Compose only |
| `DC3_BASE_TAG`                        | `2026.10`               | Compose only |
| `DC3_VERSION`                         | `latest`                | Compose only |
| `DC3_LOG_MAX_SIZE`                    | `10M`                   | Compose only |
| `DC3_LOG_MAX_FILE`                    | `20`                    | Compose only |
| `DC3_BIND_HOST`                       | `127.0.0.1`             | Compose only |
| `GF_SERVER_ROOT_URL`                  | `http://localhost:3000` | Runtime      |
| `DC3_GRAFANA_PORT`                    | `3000`                  | Compose only |
| `DC3_KIBANA_PORT`                     | `5601`                  | Compose only |
| `DC3_ES_JAVA_OPTS`                    | `-Xms512m -Xmx512m`     | Runtime      |
| `DC3_LS_JAVA_OPTS`                    | `-Xms256m -Xmx256m`     | Runtime      |
| `APM_AGENT_ENABLE`                    | `false`                 | Runtime      |
| `DC3_JAEGER_UI_PORT`                  | `16686`                 | Compose only |
| `DC3_JAEGER_OTLP_GRPC_PORT`           | `4317`                  | Compose only |
| `DC3_JAEGER_OTLP_HTTP_PORT`           | `4318`                  | Compose only |
| `NODE_ENV`                            | `dev`                   | Runtime      |

:::

## 约束与常见误区

- 改 `.env.example` 不会影响运行——必须先 `cp .env.example .env`。
- `dc3/env/dev.env` 与根 `.env` 用途不同，不是同一个文件，别互相复制。
- 服务发布端口统一用 `DC3_*_PORT`；进程内部仍用 `SERVER_PORT`、`GRPC_SERVER_PORT` 等 Spring Boot 原生命名。
- Per-process 变量（`POSTGRES_SCHEMA`、`SERVER_PORT`、`TCP_PORT` 等）只作单服务覆盖，不要全局滥用。
- Compose 应用栈可以用与本地源码不同的 `NODE_ENV`。

## 延伸阅读

- [从源码本地开发](./) — 起栈、登录、跑通第一个设备的完整路径
- [部署模式与镜像源](../guide/usage) — 整套栈如何拉起、`REGISTRY=cn` 怎么用
