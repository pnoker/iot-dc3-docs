---
title: 生产部署指南
---

# 生产部署指南

从单机 Compose 到 Kubernetes / Helm 的完整部署路径：五种形态怎么选、每一条命令、以及上线前必须完成的安全加固清单。

> 你在这里：已经用 [部署模式与镜像源](./usage) 把平台跑起来了，现在要决定生产环境怎么摆。环境变量细节见
> [环境变量详解](../quickstart/environment)。

## 五种部署形态

| 形态 | 文件（均在 `iot-dc3/`） | 运行时 | 适用场景 | 扩容方式 |
|------|------------------------|--------|----------|----------|
| 单机 Compose | `dc3/docker-compose-db.yml` + `dc3/docker-compose.yml` | Docker / Podman Compose | 评估、演示、小规模生产 | 无（单例） |
| Compose 扩容 | `dc3/docker-compose-db.yml` + `dc3/docker-compose-scale.yml` | Docker Compose v2 | 单机生产 + 服务副本 | `docker compose up --scale <svc>=N` |
| Docker Swarm | `dc3/docker-compose-swarm.yml` | Docker Swarm 模式 | 多节点 swarm 集群 | `docker service scale dc3_<svc>=N` |
| Kubernetes | `dc3/deploy/k8s/`（kustomize） | 任意 k8s 集群 | 生产 Kubernetes | `kubectl scale` / HPA |
| Helm | `dc3/deploy/helm/dc3/` | Kubernetes | GitOps / 可重复安装 | values + HPA |

所有形态跑的是同一批镜像、同一套环境变量——在 Compose 上调通的拓扑，换到别的形态行为一致，区别只在副本放哪、流量怎么进。
快速选型：评估、演示选形态一；单机生产要副本选形态二；已有 swarm 集群选形态三；已有 Kubernetes 选形态四，
要 GitOps / 可重复安装 / 频繁调参再上形态五。
完整命令与排错细节见主仓库的 [`dc3/doc/DEPLOYMENT.md`](https://github.com/pnoker/iot-dc3/blob/main/dc3/doc/DEPLOYMENT.md)。

### 镜像可得性（先知道这个再选形态）

发布 CI 只把 **应用镜像**（web、网关、四个中心及 `dc3-center-single`、驱动）推到 Docker Hub `pnoker/*` 与阿里云
`registry.cn-beijing.aliyuncs.com/dc3/*`。**依赖镜像** `dc3-postgres` 与 `dc3-rabbitmq` 由 `docker-compose-db.yml`
本地构建，**不发布**——swarm / k8s / helm 形态需要先构建并推送到你自己的仓库。`push-images.sh` 要求本地能完整构建
全部镜像（JDK/Maven 环境、充足磁盘），并具备向目标仓库推送的凭证：

```bash
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
```

## 形态一：单机 Compose（最短路径）

```bash
make up-db          # PostgreSQL + RabbitMQ（docker-compose-db.yml）
make up STACK=app   # 应用栈：web、网关、四个中心、驱动（docker-compose.yml）
make logs
```

app 栈只发布 `web`（8080/8443）与 `listening-virtual`（TCP 6270；6271 按意图是设备 UDP 通道，但当前所有发布点——
Compose、scale、swarm、k8s Service——都没声明 `/udp` / `protocol: UDP`，实际按 TCP 发布，设备真走 UDP 的先补上）。
所有发布端口默认绑 `DC3_BIND_HOST=127.0.0.1` 仅本机可达；`db`/`optional` 栈会把 PostgreSQL 35432、RabbitMQ
35672/15672 等端口发布到宿主机，同样默认仅本机——需要跨机访问才改 `0.0.0.0`，改之前先收敛端口。详见
[部署模式与镜像源](./usage)。

## 形态二：Compose 扩容（单机多副本）

`docker-compose-scale.yml` 是去掉 `container_name`/`hostname` 固定名、去掉多副本端口冲突、并带资源限制的 app 栈：

```bash
docker compose -f dc3/docker-compose-db.yml up -d
docker compose -f dc3/docker-compose-scale.yml up -d \
    --scale gateway=2 --scale data=2
```

这些保持 1 副本：`web`（占用宿主端口）、`listening-virtual`（入站设备连接）、带本地存储的驱动——如 `modbus-tcp`，
各副本挂同一个 `driver_data` 卷、会同时打开同一个 SQLite outbox 文件（该文件的注释里写明了这点）。

## 形态三：Docker Swarm

`docker-compose-swarm.yml` 是自包含全栈（含 postgres/rabbitmq），overlay 网络，`deploy:` 块管理副本/更新/重启/资源：

```bash
docker swarm init                 # 单节点即可起步
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh   # 多节点必做；单节点本地 build 亦可
docker stack deploy -c dc3/docker-compose-swarm.yml dc3
docker service scale dc3_gateway=3 dc3_data=2
docker stack rm dc3
```

注意：swarm 忽略 `depends_on`/`build`，启动顺序靠健康检查 + 重启策略；`web` 用 ingress 模式发布端口可多副本，
`listening-virtual` 必须保持 1 副本（设备连接亲和）；多节点 swarm 要把有状态服务的卷放到共享存储（NFS/Ceph）。

## 形态四：Kubernetes（kustomize）

`dc3/deploy/k8s/` 提供生产级 manifests：gateway/web 带 CPU 自动扩缩（HPA）与 PodDisruptionBudget，滚动更新
`maxUnavailable: 0`，postgres/rabbitmq 为 StatefulSet + PVC，Ingress 路由 `/api/` → 网关、`/` → web。
前置条件：集群要有默认 StorageClass（postgres/rabbitmq 的 PVC 才能绑定），且已装 ingress controller（`/api/` 与
`/` 的路由走 Ingress）：

```bash
cp dc3/deploy/k8s/secret.env.example dc3/deploy/k8s/secret.env   # 先改密钥
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
kubectl apply -k dc3/deploy/k8s
kubectl -n dc3 get pods -w
```

> 注意：主仓库当前 git 跟踪着一份弱默认值的 `secret.env`——`cp` 覆盖本地文件即可，改完的真实值不要提交回去。

## 形态五：Helm

`dc3/deploy/helm/dc3` 把同一拓扑参数化：服务清单由 `services:` / `drivers:` map 驱动，加驱动/调副本不碰模板。
注意 `values-production.yaml` 自带 TLS + Let's Encrypt（`letsencrypt-prod` clusterIssuer），要求 ingress controller
与 cert-manager 已就位——暂时没有就去掉 values 里的 tls/issuer 配置再装：

```bash
helm upgrade --install dc3 dc3/deploy/helm/dc3 -f dc3/deploy/helm/dc3/values-production.yaml \
    --set image.registry=my.registry/dc3 \
    --set-string secrets.DC3_SECURITY_KEY=<随机值> \
    --set-string secrets.AUTH_HMAC_SECRET=<随机值>
helm upgrade dc3 dc3/deploy/helm/dc3 --reuse-values --set services.gateway.replicas=4
helm rollback dc3 1
```

## 谁可以扩容，谁不能

下表描述 Compose / Swarm 形态（形态一至三）的默认行为；Kubernetes / Helm 下流量走 Service / Ingress，web 与
gateway 另有 HPA（gateway 2–10、web 1–5），个别行见括注。

| 服务 | 能否扩容 | 负载均衡语义 |
|------|----------|--------------|
| `web` | Compose 下 1 副本（占用宿主端口） | 要更多容量：Compose 在前面放自己的 LB；swarm 以 ingress 发布可多副本；k8s / helm 交给 HPA + Ingress |
| `gateway` | ✅ | `dc3-web` 里的 nginx 把 `dc3-gateway` 解析到全部副本并轮询（Compose / Swarm 下扩容后重启 web 刷新地址；k8s 下 web 指向 Service，无需重启） |
| 四个中心 | ✅（HA 语义） | 网关的 HTTP 路由由 Spring Cloud Gateway 负载均衡；中心间 gRPC 是固定目标的一个长连接——副本重启会切换，但连接不做请求级均衡 |
| 驱动 | ⚠️ 按驱动评估 | 每个副本独立注册 node、各持一条 RabbitMQ 队列（命令按 node 定向路由），**不是**共享队列分摊——多副本相当于多开一份实例，多数驱动会重复连同一批设备 |
| `listening-virtual` | ❌ 必须 1 副本 | 入站设备连接钉死在单个容器，多副本时设备连到哪一台不可控 |
| postgres / rabbitmq | ❌ 有状态单例 | 高可用请用托管服务或自建主从/集群 |

::: warning 中心间 gRPC 的均衡边界
中心间调用走 `static://` 固定目标，每个客户端一条通道。要拿到请求级均衡，用 Kubernetes Service（kube-proxy 按连接轮询）
或加客户端 LB；经网关的 HTTP 流量在所有形态下都是均衡的。
:::

## 生产加固清单

::: warning 五种形态默认都跑 test profile
CI 的 `PROFILE=pro` 只是构建参数（Maven `-P pro`）；**运行时 Spring profile 由环境变量 `NODE_ENV` 决定**——Dockerfile
运行层默认 `NODE_ENV=test`，app / scale / swarm 三个 Compose 文件、k8s ConfigMap、Helm values 也都写死
`NODE_ENV: test`。也就是说：照本文任意形态直接起栈，Swagger 仍开启、下述密钥闸门也不生效。要拿到 `pro` profile 的
安全行为（关闭 Swagger/OpenAPI、`AUTH_HMAC_SECRET` 弱值拒绝启动），部署时必须显式把 `NODE_ENV` 设为 `pro`（或 `pre`）。
:::

1. **密钥**：把 `DC3_SECURITY_KEY`、`AUTH_HMAC_SECRET`、数据库/消息队列口令、LLM API Key 全部换成强随机值。弱值闸门
   只覆盖 `AUTH_HMAC_SECRET`——`pre`/`pro` profile 下它为空或仍是默认值时服务拒绝启动；`DC3_SECURITY_KEY` 只校验
   非空，弱默认值照样能起，别指望它兜底。不要把真实密钥提交进 `secret.env` / values 文件。
2. **TLS**：边缘终止 TLS（web 自带加固 nginx 配置；k8s 用 ingress + cert-manager；swarm 在 `web` 前放反代）。跨节点开启
   RabbitMQ TLS（`RABBITMQ_SSL_ENABLED=true`，端口 5671）与 PostgreSQL TLS。
3. **备份**：定时 `pg_dump`/pgBackRest + 异地存储，并演练恢复；TimescaleDB 时序数据持续增长，按
   [FAQ](../community/faq) 的硬件建议规划容量（全栈最低 8 核 / 16GB / 100GB SSD）。
4. **高可用**：PostgreSQL 主备或托管实例 + RabbitMQ 集群；swarm/k8s 多节点时有状态卷放共享存储。
5. **可观测**：叠加 [可观测性](./observability)（Prometheus + Grafana + ELK），对就绪/存活探针告警。
6. **网络**：出口收敛（中心只需访问 LLM 端点）、后端端口不映射宿主；k8s 开启 Pod Security Admission `baseline`（
   manifests 未内置，需自行 `kubectl label ns dc3 pod-security.kubernetes.io/enforce=baseline`）。
7. **API 面**：Swagger/OpenAPI 只在 `pro` profile 下关闭（构建参数不决定运行行为，见上方 warning），上线前确认
   `NODE_ENV=pro` 已生效、且无调试端点可达。

## 常见问题

- **中心扩了副本为什么 gRPC 不是每条请求都均衡？** 见上文「中心间 gRPC 的均衡边界」：`static://` 固定目标、单通道，
  副本提供的是故障切换与滚动安全；HTTP 每一层（nginx → 网关 → 中心）都是均衡的。
- **驱动可以 2 副本吗？** 慎重。副本不是共享队列的 worker——每个副本独立注册 node、各持一条队列，相当于多开一份
  驱动实例，通常会重复连同一批设备。确有按设备/通道分片的需求再按驱动评估；`listening-virtual` 持有入站设备连接，
  必须保持 1 副本。
- **PostgreSQL / RabbitMQ 可以多副本吗？** 本仓库配置不支持——它们是有状态单例。要 HA 就用托管服务，然后把 ConfigMap/环境变量指过去。
- **k8s / helm 需要依赖镜像吗？** 需要；先用 `scripts/push-images.sh` 构建推送（单节点集群也可 `kind load`）。

部署相关的原始配置与仓库内文档（均指向 iot-dc3 的 main 分支）：[`dc3/docker-compose-scale.yml`](https://github.com/pnoker/iot-dc3/blob/main/dc3/docker-compose-scale.yml)、
[`dc3/docker-compose-swarm.yml`](https://github.com/pnoker/iot-dc3/blob/main/dc3/docker-compose-swarm.yml)、
[`dc3/deploy/`](https://github.com/pnoker/iot-dc3/tree/main/dc3/deploy)、
[`dc3/doc/DEPLOYMENT.md`](https://github.com/pnoker/iot-dc3/blob/main/dc3/doc/DEPLOYMENT.md)。
