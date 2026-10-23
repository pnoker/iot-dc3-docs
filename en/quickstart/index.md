---
title: Local Development from Source
---

<script setup>
import QuickstartIndexDiagram from '../../.vitepress/theme/components/QuickstartIndexDiagram.vue'
</script>

# Local Development from Source

This page walks you through running IoT DC3 from source: bring up PostgreSQL and RabbitMQ with Compose, point the Java
processes at your local ports, build, start, and run the tests. By the end you'll have the center services running on
your own machine, and you'll understand why startup has an order and why local processes can't read the root `.env`
directly. If you'd rather just glance at the UI first, [demo.dc3.site](https://demo.dc3.site) is an online demo with
mock data — no local stack needed.

> You are here because you want to develop or debug from source. If you just want to click through the shortest
> end-to-end loop once, see [First Device: End to End](./first-device). To understand how the services fit together,
> see [System Architecture Overview](../architecture/).

## Prerequisites

Local development is "semi-containerized": the infrastructure (database, message broker) runs in containers, while the
center services run as local Java processes, so you can set breakpoints and hot-restart freely. You'll need a JDK and
build toolchain plus a container runtime.

- **JDK 21** — the platform requires Java 21. Compiling on a lower version fails outright.
- **Maven 3.9+** — the repository ships `.mvn/settings.xml` and a parallel-build configuration; use it for multi-module
  packaging.
- **pnpm** — both the `dc3-web/` frontend and sibling `dc3-cli/` use pnpm (not npm or yarn). Skip this for backend-only
  work.
- **Container runtime** — Docker or Podman both work. The Makefile's `COMPOSE` auto-detects: `docker compose` first
  when available, then `podman compose`; you can also force it explicitly with `COMPOSE='podman compose'`.

## Developing in JetBrains IDEA

If you use IntelliJ IDEA (Community or Ultimate), these steps set the project up from scratch.

### 1. Open the project

1. **File → Open** (not New → Project from Existing Sources)
2. Select the `pom.xml` at the repository root
3. In the dialog, choose **Open as Project**
4. Wait for Maven indexing to finish (progress bar bottom-right; 2–5 minutes the first time)

### 2. Install the EnvFile plugin

1. **Settings → Plugins → Marketplace**, search for **EnvFile**, install and restart
2. The EnvFile wiring happens in step 3 below, when the run configurations are created

### 3. Configure the run entries

Open an entry class, click the green button next to `main` → **Modify Run Configuration**, and add `dc3/env/dev.env` on
the EnvFile tab:

| Service        | Entry class            | Module                              |
|----------------|------------------------|-------------------------------------|
| Gateway        | `GatewayApplication`   | `dc3-gateway`                       |
| Auth Center    | `AuthApplication`      | `dc3-center/dc3-center-auth`        |
| Manager Center | `ManagerApplication`   | `dc3-center/dc3-center-manager`     |
| Data Center    | `DataApplication`      | `dc3-center/dc3-center-data`        |
| Agentic Center | `AgenticApplication`   | `dc3-center/dc3-center-agentic`     |

### 4. Startup order

1. **Auth Center** (8300) → 2. **Manager Center** (8400) → 3. **Data Center** (8500) → 4. **Agentic Center** (8600) →
5. **Gateway** (8000)

### 5. Common problems

- **Lombok shows errors**: Settings → Annotation Processors → check **Enable annotation processing**
- **Maven indexing hangs**: File → Invalidate Caches → Invalidate and Restart
- **EnvFile not taking effect**: check that `dev.env` is ticked on the Run Configuration's EnvFile tab
- **Port already in use**: find it with `lsof -i :8000` (Windows: `netstat -ano | findstr :8000`) and override `SERVER_PORT` in the Run Configuration's
  Environment variables

## Why the CLI five steps are in this order

The shortest path to a running local stack is five steps: start the infrastructure (containers) → load the environment
variables that point at it → build → start the dev stack → run the tests. Note how the two routes divide the work:
`make up-dev` brings up a **fully containerized** dev stack whose images build inside the container (Maven runs in the
builder stage and does not consume the jars on your host), so the first launch builds everything and takes a while; the
host-side `make package` in Step 3 serves the IDEA local-process route (semi-containerized) and fast compile checks — it
runs parallel to the container route and is **not** a prerequisite for `up-dev`.

<QuickstartIndexDiagram lang="en" />

Each step is expanded below, with both what to do and how to verify it.

## Step 1: Start the Infrastructure

`make up-db` brings up the db stack with Compose — PostgreSQL and RabbitMQ. On first startup, PostgreSQL runs the initdb
scripts in filename order (extensions, common, auth, data, manager, history, agentic) and creates all the tenant, user,
menu, and metadata tables. So the first launch is slower than the ones that follow.

::: code-group

```bash [Global Registry]
make up-db
```

```bash [China Mainland Registry]
make up-db-cn
```

:::

The ports the containers publish to the host are fixed: PostgreSQL `localhost:35432`, RabbitMQ AMQP `localhost:35672` (
inside the containers they stay `5432` / `5672`). To verify:

```bash
make ps STACK=db                   # you should see dc3-postgres and dc3-rabbitmq running
docker exec dc3-postgres psql -U dc3 -d dc3 -c '\dt dc3_auth.*'   # if it lists the auth tables, it's ready (Podman users: replace docker with podman)
```

::: tip Optional Observability Stack
When you need EMQX, ELK, Prometheus, or Grafana, run `make up-optional`. Local core development doesn't need them. It's
best to start them only after the center services are stable, so you don't spin up too many containers at once.
:::

## Step 2: Load the Local Environment Variables

```bash
source dc3/env/dev.env.sh
```

This exports the development defaults into the current shell — the database, RabbitMQ, MQTT, and gRPC hosts, among
others. The part that matters here is pointing `POSTGRES_HOST=localhost`, `POSTGRES_PORT=35432`,
`RABBITMQ_HOST=localhost`, `RABBITMQ_PORT=35672`, and `CENTER_AUTH_HOST/MANAGER_HOST/DATA_HOST/AGENTIC_HOST=localhost`
at your local machine, so the local Java processes can reach the container ports published in Step 1.

::: warning .env Is for Compose Interpolation Only — Not for Local Java Processes
The root `.env` is Compose-specific. It's only used for variable interpolation when `docker compose` parses its files (
image registry, image tag, published ports) and is **not** injected into the Java processes you start locally. When you
run from source on your machine, you must `source dc3/env/dev.env.sh`. Otherwise the services fall back to in-container
DNS names like `dc3-postgres:5432`, which your host can't resolve, and the connection fails immediately.

In JetBrains IDEA, use the EnvFile plugin to load `dc3/env/dev.env` (the variant without `export`), or paste its
key-value pairs into the run configuration's environment variables.
:::

To verify: `echo $POSTGRES_PORT` should print `35432`.

## Step 3: Build

```bash
make package                       # equivalent to mvn -s .mvn/settings.xml clean package
```

The repository already has parallel builds, enforced JDK 21 / Maven 3.9+, and Spotless + Checkstyle format and style
validation set up (run `make format-java` locally to format in one shot). The
build produces the executable jar for each service module (for example, `dc3-gateway/target/dc3-gateway.jar`). This step
only validates compilation and packaging — it doesn't depend on the containers from Step 1.

::: tip Fast Compile Check
If you only want to confirm your changes compile, skip the full package and run
`mvn -s .mvn/settings.xml -q -DskipTests compile`, which is much faster.
:::

## Step 4: Start the Dev Stack

Bring the center services up with the dev stack. `make up STACK=dev` (or the shorthand
`make up-dev`) starts the Gateway, Auth, Manager, Data, Agentic, and drivers in dependency order. The dev stack's images
build inside the container (they do not depend on the host-built jars from Step 3), so the first launch is slower.

::: warning The container stack needs a "clean" shell: pass `RUNTIME_ENV_FILE=` to suppress local-process defaults
The `localhost:35432` values in `dc3/env/dev.env` are meant for **local Java processes** (Step 2), but the Makefile
auto-`include`s and `export`s that file, and `docker compose`'s `${VAR:-default}` interpolation then **injects them into
the containers** — the center services try to reach host-side ports, fail with `Connection refused:
localhost/127.0.0.1:35432`, and crash-loop until `make up-dev` ends with `dependency failed to start`. Suppress it when
starting the container stack:

```bash
make up-dev RUNTIME_ENV_FILE=        # empty value skips the dev.env include; containers talk over in-network names like dc3-postgres:5432
```

Conversely, `source dc3/env/dev.env.sh` from Step 2 is only needed when the center services run as **local processes**
(IDEA / half-container mode); the pure container route can skip Step 2. See
[Troubleshooting](../guide/troubleshooting) for the mechanism and more symptoms.
:::

::: code-group

```bash [Global Registry]
make up-dev RUNTIME_ENV_FILE=
```

```bash [China Mainland Registry]
make up-dev-cn RUNTIME_ENV_FILE=
```

:::

Why the ordering? Because the services depend on each other:

- **The Auth center must be ready first** — it holds the tenant, user, RBAC, and token-issuing logic, and every other
  service plus the gateway authenticate against it.
- **The Gateway is the sole external HTTP entry point (8000)** — it aggregates the routes of Auth/Manager/Data/Agentic,
  extracts the auth headers, and injects the principal context. It can only forward correctly once the backend centers
  are reachable, so it comes after its dependencies.

::: details Full Startup Order and Ports
In distributed mode, calls go over gRPC by default (the facade mode defaults to `grpc` when unset — see
[Facade modes](../architecture/facade-modes)). Service ports:

| Service                                       | HTTP | gRPC |
|-----------------------------------------------|------|------|
| Gateway / `dc3-gateway` (sole external entry) | 8000 | —    |
| Auth Center / `dc3-center-auth`               | 8300 | 9300 |
| Manager Center / `dc3-center-manager`         | 8400 | 9400 |
| Data Center / `dc3-center-data`               | 8500 | 9500 |
| Agentic Center / `dc3-center-agentic`         | 8600 | —    |

Only the Gateway (the user entry) and listening-virtual's TCP 6270 / 6271 (the device entry; 6271 is intended as the UDP
channel, but no published port currently declares `/udp`, so it is published as TCP — see
[Deployment Modes and Image Sources](../guide/usage)) are mapped to the host; all other backend ports are internal.
:::

To verify: once the stack is up, run the login golden path against the gateway. Login takes two steps — first fetch the
salt, then submit the plaintext password together with it for a 12-hour access token (the salt does not hash the password; verification is server-side):

```bash
# 1) Fetch the salt (public endpoint, valid for 5 minutes)
curl -s -X POST http://localhost:8000/api/v3/auth/token/salt \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3"}'      # 2026.9 line: bare salt; 2026.10+ line: {"salt":"a1b2c3d4e5"}

# 2) Submit the plaintext password together with the salt for a token (public endpoint, access token valid for 12 hours)
curl -s -X POST http://localhost:8000/api/v3/auth/token/generate \
  -H 'Content-Type: application/json' \
  -d '{"tenant":"default","name":"dc3","salt":"<salt from the previous step>","password":"<plaintext password>"}'
# 2026.10 image line returns {"token":"eyJhbGciOiJIUzI1NiJ9..."}; the default 2026.9 line returns a bare text/plain token (an httpOnly cookie is also set)
```

Once you have the token, every protected endpoint goes through the gateway with the three auth headers:
`X-Auth-Tenant` (the tenant name), `X-Auth-Login` (the username), and `X-Auth-Token` (a JSON envelope
`{"salt":"...","token":"..."}` carrying the salt from the salt-fetch step; a bare token is rejected by the gateway). The
full "create driver → create profile → create device → read/write point" loop is
covered in [First Device: End to End](./first-device).

## Step 5: Run the Tests

```bash
make test                          # unit test suite
```

For higher-level verification: `make test-it` runs the integration tests (needs a container runtime for Testcontainers),
and `make test-e2e` runs the backend E2E suite. For day-to-day development, run `make test` after a change to guard
against unit-level regressions.

## Common Pitfalls

- **Starting the services without `source dev.env.sh`** — the most common one. The local Java processes never see
  `localhost:35432` / `35672`, so they try the in-container DNS names and fail. Every new shell needs to `source`
  again — the variables only live in the current shell.
- **Container runtime not running** — if `make up-db` says it can't reach the container runtime, first check the Docker
  daemon or Podman machine is started (on macOS run `podman machine start`), then confirm with `make ps STACK=db`.
- **Ports in use** — startup fails when `35432` / `35672` / `8000` and friends are taken by other processes. Free the
  occupying process, or override the Compose published ports in the root `.env` (this only affects the container side);
  override the local process ports with the service-level environment variables.
- **First database startup is slow or tables are incomplete** — PostgreSQL runs initdb only on the first startup of an
  empty volume. If it was interrupted partway and the tables are incomplete, reset the volume and start over:
  `make reset STACK=db` (requires `CONFIRM_RESET_VOLUMES=true`, which deletes data — use with care).

::: danger Production Secrets Must Be Replaced
The `DC3_SECURITY_KEY` and `AUTH_HMAC_SECRET` in `dev.env.sh` are development defaults. In the `pre`/`pro` environments,
if `AUTH_HMAC_SECRET` is empty or still equals the default `io.github.pnoker.dc3`, the Gateway fails fast and refuses to
start. That's fine for local development, but before you go live you must replace it with an environment-specific random
value.
:::

## Further Reading

- [Environment Variables Explained](./environment) — the boundary between `.env` and `dev.env(.sh)`, and the scope and
  default value of each variable
- [First Device: End to End](./first-device) — the shortest loop from creating a driver to reading and writing points
  after login
- [System Architecture Overview](../architecture/) — how the gateway and four center services divide responsibilities, and how data
  and commands flow
