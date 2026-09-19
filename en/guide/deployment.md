---
title: Production Deployment
---

# Production Deployment

The complete deployment path from a single-host Compose stack to Kubernetes / Helm: how to pick among the five
modes, the exact commands, and the hardening checklist to run before connecting real devices.

> You are here: you have already brought the platform up with
> [Deployment Modes & Image Registries](./usage) and now want to decide how production should look. Environment
> variable details live in [Environment Variables](../quickstart/environment).

## The five deployment modes

| Mode | Files (under `iot-dc3/`) | Runtime | Use for | Scaling |
|------|--------------------------|---------|---------|---------|
| Single host Compose | `dc3/docker-compose-db.yml` + `dc3/docker-compose.yml` | Docker / Podman Compose | evaluation, demo, small production | none (singleton) |
| Compose scale | `dc3/docker-compose-db.yml` + `dc3/docker-compose-scale.yml` | Docker Compose v2 | single-node production with replicas | `docker compose up --scale <svc>=N` |
| Docker Swarm | `dc3/docker-compose-swarm.yml` | Docker Swarm mode | multi-node swarm cluster | `docker service scale dc3_<svc>=N` |
| Kubernetes | `dc3/deploy/k8s/` (kustomize) | any k8s cluster | production Kubernetes | `kubectl scale` / HPA |
| Helm | `dc3/deploy/helm/dc3/` | Kubernetes | GitOps / repeatable installs | values + HPA |

Every mode runs the same images with the same environment variables - a topology tuned on Compose behaves
identically elsewhere; only *where replicas live* and *how traffic reaches them* differ. Quick pick: evaluation or
demo, take mode 1; single-host production with replicas, mode 2; an existing swarm cluster, mode 3; an existing
Kubernetes cluster, mode 4 - and mode 5 when you want GitOps / repeatable installs / frequent value tuning. The
full command runbook lives in the main repo at
[`dc3/doc/DEPLOYMENT.md`](https://github.com/pnoker/iot-dc3/blob/main/dc3/doc/DEPLOYMENT.md).

### Image availability (know this before picking a mode)

The release CI publishes only the **app images** (web, gateway, the four centers plus `dc3-center-single`, drivers)
to Docker Hub `pnoker/*` and Aliyun `registry.cn-beijing.aliyuncs.com/dc3/*`. The **dependency images**
`dc3-postgres` and `dc3-rabbitmq` are built locally by `docker-compose-db.yml` and are **not published** - build
and push them to your own registry for swarm / k8s / helm. `push-images.sh` needs a local environment able to build
the full image set (JDK/Maven, enough disk) plus push credentials for the target registry:

```bash
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
```

## Mode 1 - single host Compose (shortest path)

```bash
make up-db          # PostgreSQL + RabbitMQ (docker-compose-db.yml)
make up STACK=app   # app stack: web, gateway, centers, drivers (docker-compose.yml)
make logs
```

The app stack publishes only `web` (8080/8443) and `listening-virtual` (TCP 6270; 6271 is *intended* as the device
UDP channel, but every publish site today - Compose, scale, swarm, the k8s Service - omits `/udp` /
`protocol: UDP` and actually publishes TCP, so patch that first if your devices truly speak UDP). Every published
port binds `DC3_BIND_HOST=127.0.0.1` by default (localhost only); the `db`/`optional` stacks also publish
PostgreSQL 35432 and RabbitMQ 35672/15672 to the host, likewise localhost-only - switch to `0.0.0.0` only for
cross-host access, and tighten the port list first. See [Deployment Modes & Image Registries](./usage).

## Mode 2 - Compose scale (single node, replicas)

`docker-compose-scale.yml` is the app stack rebuilt for replicas: no `container_name`/`hostname` pins, no
per-replica host ports, and `deploy.resources` limits enforced by Compose v2:

```bash
docker compose -f dc3/docker-compose-db.yml up -d
docker compose -f dc3/docker-compose-scale.yml up -d \
    --scale gateway=2 --scale data=2
```

Keep these at 1 replica: `web` (owns host ports), `listening-virtual` (inbound device connections), and drivers
with local storage - e.g. `modbus-tcp`, whose replicas all mount the same `driver_data` volume and would open the
same SQLite outbox file (the file's own comments say so).

## Mode 3 - Docker Swarm

`dc3/docker-compose-swarm.yml` is a self-contained full stack (dependencies included) with an overlay network and
`deploy:` blocks for replicas / updates / restarts / resources:

```bash
docker swarm init                 # a single node is enough to start
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh   # required multi-node; a local build works single-node
docker stack deploy -c dc3/docker-compose-swarm.yml dc3
docker service scale dc3_gateway=3 dc3_data=2
docker stack rm dc3
```

Swarm ignores `depends_on`/`build` - startup relies on healthchecks plus the restart policy. `web` publishes with
`mode: ingress` and can run multiple replicas; `listening-virtual` must stay at 1 replica (device connection
affinity). On multi-node swarms, put the stateful volumes on shared storage (NFS/Ceph).

## Mode 4 - Kubernetes (kustomize)

`dc3/deploy/k8s/` ships production-grade manifests: CPU-based HPA for gateway/web plus PodDisruptionBudgets on every stateless service,
rolling updates with `maxUnavailable: 0`, StatefulSets + PVCs for postgres/rabbitmq, and an Ingress routing `/api/`
to the gateway and `/` to `web`. Prerequisites: the cluster needs a default StorageClass (so the postgres/rabbitmq
PVCs can bind) and an installed ingress controller (the `/api/` and `/` routes go through the Ingress):

```bash
cp dc3/deploy/k8s/secret.env.example dc3/deploy/k8s/secret.env   # edit the secrets first
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
kubectl apply -k dc3/deploy/k8s
kubectl -n dc3 get pods -w
```

> Note: the main repo currently tracks a weak-default `secret.env` in git - `cp` over it locally, but never commit
> real values back.

## Mode 5 - Helm

`dc3/deploy/helm/dc3` parameterizes the same topology: the service list is driven by the `services:` / `drivers:`
maps, so enabling a driver or tuning replicas never touches the templates. Note that `values-production.yaml` ships
TLS + Let's Encrypt (the `letsencrypt-prod` clusterIssuer), which requires an ingress controller and cert-manager
to be in place - drop the tls/issuer entries from the values if you don't have them yet:

```bash
helm upgrade --install dc3 dc3/deploy/helm/dc3 -f dc3/deploy/helm/dc3/values-production.yaml \
    --set image.registry=my.registry/dc3 \
    --set-string secrets.DC3_SECURITY_KEY=<random> \
    --set-string secrets.AUTH_HMAC_SECRET=<random>
helm upgrade dc3 dc3/deploy/helm/dc3 --reuse-values --set services.gateway.replicas=4
helm rollback dc3 1
```

## Who can scale - and who cannot

The table describes the default behavior of the Compose / Swarm modes (modes 1-3); on Kubernetes / Helm traffic
goes through Services / Ingress, web and gateway get HPAs (gateway 2-10, web 1-5), and a few rows carry k8s notes
in parentheses.

| Service | Scalable? | Load balancing semantics |
|---------|-----------|--------------------------|
| `web` | 1 replica under Compose (owns host ports) | for more capacity: your own LB in front on Compose; ingress-published multi-replica on swarm; HPA + Ingress on k8s / helm |
| `gateway` | ✅ | the nginx in `dc3-web` resolves `dc3-gateway` to every replica and round-robins (restart `web` after scaling on Compose / Swarm; on k8s web points at the Service, no restart needed) |
| centers | ✅ (HA semantics) | HTTP routes from the gateway are load-balanced by Spring Cloud Gateway; center-to-center gRPC keeps one channel per fixed target - a replica restart fails over the channel, but it is not request-balanced |
| drivers | ⚠️ evaluate per driver | each replica registers as its own node with its own RabbitMQ queue (commands are routed by node key) - this is **not** shared-queue work sharing; scaling up is effectively another driver instance, which usually reconnects to the same devices |
| `listening-virtual` | ❌ must stay at 1 | inbound device sockets are pinned to one container; with more replicas there is no control over which one a device lands on |
| postgres / rabbitmq | ❌ stateful singletons | for HA use managed services or your own primary/standby |

::: warning The gRPC balancing boundary between centers
Center-to-center calls use `static://` fixed targets with one channel per client. For request-level balancing use a
Kubernetes Service (kube-proxy round-robins per connection) or a client-side LB. HTTP traffic through the gateway is
balanced at every tier in every mode.
:::

## Production hardening checklist

::: warning All five modes run the test profile by default
CI's `PROFILE=pro` is only a build argument (Maven `-P pro`); **the runtime Spring profile comes from the
`NODE_ENV` environment variable**. The Dockerfile runtime layer defaults to `NODE_ENV=test`, and the app / scale /
swarm Compose files, the k8s ConfigMap, and the Helm values all pin `NODE_ENV: test`. So a stack started from
release images as documented keeps Swagger enabled and the secret gate below inactive. To get the `pro` profile's
hardening (Swagger/OpenAPI off, `AUTH_HMAC_SECRET` weak-value refusal), set `NODE_ENV=pro` (or `pre`) explicitly at
deploy time.
:::

1. **Secrets** - replace `DC3_SECURITY_KEY`, `AUTH_HMAC_SECRET`, all database/broker passwords and the LLM API key
   with strong random values. The weak-value gate covers only `AUTH_HMAC_SECRET` - on the `pre`/`pro` profile an
   empty or default value refuses to start; `DC3_SECURITY_KEY` is only checked for non-empty, so a known weak
   default still boots. Never rely on the gate as your only defense, and never commit real secrets into
   `secret.env` / values files.
2. **TLS** - terminate TLS at the edge (web nginx ships a hardened TLS config; k8s: ingress + cert-manager; swarm:
   a proxy in front of `web`). Enable RabbitMQ TLS (`RABBITMQ_SSL_ENABLED=true`, port 5671) and PostgreSQL TLS for
   cross-node traffic.
3. **Backups** - schedule `pg_dump`/pgBackRest with off-site copies and rehearse restore; TimescaleDB grows
   continuously, so plan capacity per the [FAQ](../community/faq) sizing (8 cores / 16 GB / 100 GB SSD minimum for
   the full stack).
4. **High availability** - PostgreSQL primary/standby (or a managed service) + a RabbitMQ cluster; stateful volumes
   on replicated storage for multi-node swarm/k8s.
5. **Observability** - layer on [Observability](./observability) (Prometheus + Grafana + ELK) and alert on
   readiness/liveness.
6. **Network** - restrict egress (centers only need the LLM endpoint), keep backend ports off the host; on k8s
   enable Pod Security Admission `baseline` (not built into the manifests - label the namespace yourself:
   `kubectl label ns dc3 pod-security.kubernetes.io/enforce=baseline`).
7. **API surface** - Swagger/OpenAPI is disabled only on the `pro` profile (the build argument does not decide
   runtime behavior - see the warning above); confirm `NODE_ENV=pro` is in effect and no debug endpoints are
   reachable before go-live.

## FAQ

- **Why is a scaled center not balancing every gRPC request?** See "The gRPC balancing boundary between centers"
  above: `static://` fixed targets, one channel per client. Replicas provide failover and rollout safety; HTTP is
  balanced at every tier (nginx -> Spring Cloud Gateway -> centers).
- **Can I run a driver at 2 replicas?** It depends on the platform. Under Compose/Swarm: no — replicas share the `driver_data` volume and would open the same SQLite outbox file, so keep 1 replica. Under Kubernetes each Pod has its own `emptyDir`, so scaling works — but replicas are not shared-queue workers: each registers as its own node with its own queue, effectively another driver instance that usually reconnects to the same devices. `listening-virtual` owns inbound device sockets and
  must stay at 1 replica.
- **Can postgres/rabbitmq have replicas?** Not with these configs - they are stateful singletons. For HA run managed
  services and point the ConfigMap / environment at them.
- **Do the k8s/helm configs need the dependency images?** Yes - build and push them with `scripts/push-images.sh`
  (or `kind load` on single-node clusters).

Source of truth in the repo (all on the iot-dc3 `main` branch):
[`dc3/docker-compose-scale.yml`](https://github.com/pnoker/iot-dc3/blob/main/dc3/docker-compose-scale.yml),
[`dc3/docker-compose-swarm.yml`](https://github.com/pnoker/iot-dc3/blob/main/dc3/docker-compose-swarm.yml),
[`dc3/deploy/`](https://github.com/pnoker/iot-dc3/tree/main/dc3/deploy),
[`dc3/doc/DEPLOYMENT.md`](https://github.com/pnoker/iot-dc3/blob/main/dc3/doc/DEPLOYMENT.md).
