---
title: "Facade Modes: grpc and local"
---

<script setup>
import FacadeModesDiagram from '../../.vitepress/theme/components/FacadeModesDiagram.vue'
</script>

# Facade Modes: grpc and local

Inter-center calls between center services — the Data Center asking the Manager Center for devices, the Agentic Center
asking the Data Center for point values — can run one of two ways. In `grpc` mode each service runs as its own process
and calls happen cross-process. In `local` mode all centers collapse into a single process and calls are direct,
in-process method invocations. This page explains that the `dc3.facade.{auth,manager,data}.mode` switch group controls
**deployment topology**, not transport protocol — and why business code never has to change when you flip it.

> You are here: you've read the [System Architecture Overview](./) and [Services and Topology](./services), and want to
> understand how the centers actually interconnect.

## A topology switch, not a protocol choice

First, the common misreading: this switch group is not a "gRPC vs REST" transport pick. It's a choice about how many
processes the center services **run as**.

Business code never touches the other side's gRPC stubs or protobuf classes directly. It depends on a set of **protocol-neutral `*Facade` interfaces** — contracts defined in `dc3-common-facade-api` (19 interfaces such as
`DeviceFacade`, `PointValueFacade`, `TenantFacade`, `PermissionFacade`, and so on). Each interface has two
implementations, and one is selected and wired at startup based on **the per-target switches** (`dc3.facade.auth.mode` /
`dc3.facade.manager.mode` / `dc3.facade.data.mode`):

- `grpc` wires the gRPC implementation (`dc3-common-facade-grpc`, e.g. `DeviceGrpcFacade`). It makes a
  cross-process gRPC call to reach the independently running target center.
- `local` wires the in-process implementation (`dc3-common-facade-local-{auth,manager,data}`, e.g. `DeviceLocalFacade`).
  It calls the target Service inside the same process directly, **with no network overhead**.
- `disabled` wires neither — the process itself is that center (e.g. `dc3.facade.manager.mode` inside the manager
  process); there is no facade for "calling yourself".

The Javadocs on `DeviceFacade`'s two implementations say as much:

> `DeviceLocalFacade` — in-process call into `DeviceService`, selected when `dc3.facade.manager.mode=local`.
> `DeviceGrpcFacade` — gRPC call against Manager Center, selected when `dc3.facade.manager.mode=grpc` (or unset — grpc
> is the default).

Both implementations satisfy the same interface and return the same BO/Page types, so **switching modes changes not a
single line of business code** — it only swaps the injected Bean.

## How the two modes are wired

Wiring relies on Spring Boot's `@ConditionalOnProperty`, and it is **per target center**: `dc3.facade.auth.mode`
governs only the interfaces that call Auth, `dc3.facade.manager.mode` only those that call Manager, and
`dc3.facade.data.mode` only those that call Data. On each switch, the gRPC auto-configuration takes effect when the
value is `grpc` or absent (`matchIfMissing = true`); the local auto-configuration takes effect only on `local`; and
`disabled` wires nothing at all. For any given `*Facade` interface, the switch for its target alone decides which
implementation gets wired.

<FacadeModesDiagram lang="en" />

In the diagram, `9400` is the Manager Center's gRPC port (in grpc mode the Data Center reaches it across processes). In
local mode the Manager Center's `DeviceService` lives in the same JVM as the caller, `DeviceLocalFacade` makes a direct
method call, and no port is involved at all.

::: info Naming correspondence between interfaces and implementations
The interface names in `facade-api` are `*Facade` (e.g. `DeviceFacade`). The gRPC implementations consistently add the
`Grpc` infix (`DeviceGrpcFacade`); the in-process implementations add the `Local` infix (`DeviceLocalFacade`). So
`*GrpcFacade` is always the cross-process one, and `*LocalFacade` is always the in-process one.
:::

## When to use which

The choice comes down to how many processes you want the center services to run as:

| Dimension        | `grpc` (default)                                       | `local`                                         |
|------------------|--------------------------------------------------------|-------------------------------------------------|
| Deployment shape | Each center as a separate process, distributed         | All centers in one process, monolithic          |
| Call style       | Cross-process gRPC                                     | In-process method call, no network overhead     |
| Best for         | Distributed deployment, horizontal scaling, production | Local development, small single-node, debugging |
| Typical pairing  | Full compose stack (multiple services)                 | `dc3-center-single` monolithic service          |

Use `grpc` for distributed deployment or when you need to scale services independently: each center is a standalone
Spring Boot service that can scale and restart on its own. Use `local` for local development, a small single node, or
debugging. Paired with the `dc3-center-single` monolithic service — which collapses the four centers into one — it saves
you from launching multiple processes and the network round-trips between them. Startup is faster, and breakpoints land
directly.

::: tip How to choose

- You're bringing up the whole thing locally to develop or debug, or you just want a minimal single-node runnable → use
  `local`, run `dc3-center-single`.
- You're doing a distributed deployment, scaling centers independently, or this is production → use `grpc` (the
  default), with each center as its own process.
- When in doubt, use the default `grpc`: leaving the switches unset is exactly that; only the monolithic scenario needs
  an explicit switch to `local`.

:::

## Where the default lives, and who overrides whom

The configuration lives in **each deployable unit's own `application.yml`**, declared per target — there is no global
environment variable for it (the `DC3_FACADE_MODE` entry in `.env.example` is a leftover; current code does not consume
it):

- **Distributed centers** declare `grpc` for the targets they call and `disabled` for themselves. The Manager Center,
  for example, sets `dc3.facade.auth.mode: grpc`, `dc3.facade.manager.mode: disabled` (it *is* the manager), and
  `dc3.facade.data.mode: grpc`; the Data Center sets `auth: grpc` / `manager: grpc` / `data: disabled`.
- **The Auth Center** writes `dc3.facade.auth.mode: local` — it only ever calls itself, in-process. That's the normal
  configuration for the distributed shape, not a misconfiguration.
- **The monolithic service** `dc3-center-single`: all three switches `local` — all four centers share one process, so
  everything is a direct call.

To determine which mode a service actually uses, **go by its own `application.yml` and the wiring conditions**.

Switching modes means changing only this group of switches; business code and interface signatures stay put:

::: code-group

```yaml [Distributed center (manager as the example)]
dc3:
  facade:
    auth:
      mode: grpc        # calling the Auth Center: cross-process gRPC
    manager:
      mode: disabled    # this process IS the Manager Center — no facade needed
    data:
      mode: grpc        # calling the Data Center: cross-process gRPC
```

```yaml [Monolith dc3-center-single]
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

## Constraints and boundaries

- `grpc` and `local` are two implementations of the same set of `*Facade` interfaces, **not** two transport protocols;
  `local` is not a "facade over REST" tier. What the switches pick is which implementation gets wired — that is, the
  deployment topology. The code's `@ConditionalOnProperty` is the source of truth.
- The switches are **per target** (three properties: auth/manager/data) taking `grpc` / `local` / `disabled`; targets
  can be mixed, though the distributed and monolithic shapes usually set the whole group to one value.
- The default is `grpc`: the gRPC auto-configuration carries `matchIfMissing = true`, so without explicit configuration
  the gRPC implementation is wired by default.
- `local` mode requires the target Service being called to live in the same process — it's designed for
  collapsed-process setups like `dc3-center-single`. Setting separate multi-center processes to `local` leaves them
  unable to find the peer Service.
- Switching modes doesn't change business code, but it does change the runtime topology and the failure domain. Under
  `grpc`, one center crashing doesn't drag the others down. Under `local`, they share the same JVM process.

## Further reading

- [Services and Topology](./services) — the six services, their ports, gRPC ports, and startup dependency order
- [System Architecture Overview](./) — the full picture of how the gateway + four centers + drivers cooperate
