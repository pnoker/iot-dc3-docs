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
identically elsewhere; only *where replicas live* and *how traffic reaches them* differ. The full command runbook
lives in the main repo at [`dc3/doc/DEPLOYMENT.md`](https://github.com/pnoker/iot-dc3/blob/main/dc3/doc/DEPLOYMENT.md).

### Image availability (know this before picking a mode)

The release CI publishes only the **app images** (web, gateway, centers, drivers) to Docker Hub `pnoker/*` and
Aliyun `registry.cn-beijing.aliyuncs.com/dc3/*`. The **dependency images** `dc3-postgres` and `dc3-rabbitmq` are
built locally by `docker-compose-db.yml` and are **not published** - build and push them to your own registry for
swarm / k8s / helm:

```bash
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
```

## Mode 1 - single host Compose (shortest path)

```bash
make up-db          # PostgreSQL + RabbitMQ (docker-compose-db.yml)
make up STACK=app   # app stack: web, gateway, centers, drivers (docker-compose.yml)
make logs
```

Only `web` (8080/8443) and `listening-virtual` (device TCP 6270 / UDP 6271) are ever exposed; every backend port
stays on the internal network. See [Deployment Modes & Image Registries](./usage).

## Mode 2 - Compose scale (single node, replicas)

`docker-compose-scale.yml` is the app stack rebuilt for replicas: no `container_name`/`hostname` pins, no
per-replica host ports, and `deploy.resources` limits enforced by Compose v2:

```bash
docker compose -f dc3/docker-compose-db.yml up -d
docker compose -f dc3/docker-compose-scale.yml up -d \
    --scale gateway=2 --scale data=2 --scale modbus-tcp=2
```

## Mode 3 - Docker Swarm

`dc3/docker-compose-swarm.yml` is a self-contained full stack (dependencies included) with an overlay network and
`deploy:` blocks for replicas / updates / restarts / resources:

```bash
docker swarm init                 # a single node is enough to start
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
docker stack deploy -c dc3/docker-compose-swarm.yml dc3
docker service scale dc3_gateway=3 dc3_modbus-tcp=2
docker stack rm dc3
```

Swarm ignores `depends_on`/`build` - startup relies on healthchecks plus the restart policy. `web` publishes with
`mode: ingress` and can run multiple replicas; `listening-virtual` must stay at 1 replica (device connection
affinity). On multi-node swarms, put the stateful volumes on shared storage (NFS/Ceph).

## Mode 4 - Kubernetes (kustomize)

`dc3/deploy/k8s/` ships production-grade manifests: CPU-based HPA and PodDisruptionBudgets for the stateless tier,
rolling updates with `maxUnavailable: 0`, StatefulSets + PVCs for postgres/rabbitmq, and an Ingress routing `/api/`
to the gateway and `/` to `web`:

```bash
cp dc3/deploy/k8s/secret.env.example dc3/deploy/k8s/secret.env   # edit the secrets first
DC3_IMAGE_REGISTRY=my.registry/dc3 ./dc3/deploy/k8s/scripts/push-images.sh
kubectl apply -k dc3/deploy/k8s
kubectl -n dc3 get pods -w
```

## Mode 5 - Helm

`dc3/deploy/helm/dc3` parameterizes the same topology: the service list is driven by the `services:` / `drivers:`
maps, so enabling a driver or tuning replicas never touches the templates:

```bash
helm upgrade --install dc3 dc3/deploy/helm/dc3 -f dc3/deploy/helm/dc3/values-production.yaml \
    --set image.registry=my.registry/dc3 \
    --set-string secrets.DC3_SECURITY_KEY=<random> \
    --set-string secrets.AUTH_HMAC_SECRET=<random>
helm upgrade dc3 dc3/deploy/helm/dc3 --reuse-values --set services.gateway.replicas=4
helm rollback dc3 1
```

## Who can scale - and who cannot

| Service | Scalable? | Load balancing semantics |
|---------|-----------|--------------------------|
| `web` | 1 replica (owns host ports) | put your own LB in front for more capacity |
| `gateway` | ✅ | the nginx in `dc3-web` resolves `dc3-gateway` to every replica and round-robins (restart `web` after scaling to refresh addresses) |
| centers | ✅ (HA semantics) | HTTP routes from the gateway are load-balanced by Spring Cloud Gateway; center-to-center gRPC keeps one channel per fixed target - a replica restart fails over the channel, but it is not request-balanced |
| drivers | ✅ | replicas consume the same RabbitMQ queues; one message is handled by exactly one replica |
| `listening-virtual` | ❌ must stay at 1 | inbound device sockets are pinned to one container |
| postgres / rabbitmq | ❌ stateful singletons | for HA use managed services or your own primary/standby |

::: warning The gRPC balancing boundary between centers
Center-to-center calls use `static://` fixed targets with one channel per client. For request-level balancing use a
Kubernetes Service (kube-proxy round-robins per connection) or a client-side LB. HTTP traffic through the gateway is
balanced at every tier in every mode.
:::

## Production hardening checklist

1. **Secrets** - replace `DC3_SECURITY_KEY`, `AUTH_HMAC_SECRET`, all database/broker passwords and the LLM API key
   with strong random values. The `pro` profile **refuses to start** with weak keys. Never commit real secrets into
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
6. **Network** - restrict egress (centers only need the LLM endpoint), keep backend ports off the host, enable Pod
   Security Admission `baseline` on k8s.
7. **API surface** - Swagger/OpenAPI is disabled on the `pro` profile (release images build with `PROFILE=pro`);
   confirm no debug endpoints are reachable before go-live.

## FAQ

- **Why is a scaled center not balancing every gRPC request?** Center-to-center gRPC uses `static://` fixed targets
  with one channel per client. Replicas provide failover and rollout safety; request-level balancing needs a
  client-side LB or k8s (per-connection round-robin via ClusterIP). HTTP is balanced at every tier (nginx -> Spring
  Cloud Gateway -> centers).
- **Can I run a driver at 2 replicas?** Yes for outbound protocol drivers (they are queue workers); no for
  `listening-virtual`, which owns inbound device sockets - keep it at 1 replica.
- **Can postgres/rabbitmq have replicas?** Not with these configs - they are stateful singletons. For HA run managed
  services and point the ConfigMap / environment at them.
- **Do the k8s/helm configs need the dependency images?** Yes - build and push them with `scripts/push-images.sh`
  (or `kind load` on single-node clusters).

Source of truth in the repo: `dc3/docker-compose-scale.yml`, `dc3/docker-compose-swarm.yml`, `dc3/deploy/`,
`dc3/doc/DEPLOYMENT.md`.
