---
title: Frontend Development
---

# Frontend Development

The IoT DC3 frontend is built on **Vue 3 + TypeScript + Vite + Element Plus**. Source code lives in `dc3-web/` in the main repository (iot-dc3), a standalone pnpm project.

## Environment Setup

| Tool    | Minimum Version | Notes                                                                              |
|---------|-----------------|------------------------------------------------------------------------------------|
| Node.js | 22 LTS          | Matches the `engines` field in `package.json`; use fnm / nvm to manage versions    |
| pnpm    | 12.6.0          | Version locked by the `packageManager` field in `package.json`; corepack switches it automatically |

```bash
# Enable corepack (if not already; the pnpm version switches automatically per packageManager)
corepack enable

# Verify versions
node -v   # >= v22
pnpm -v   # 12.6.0
```

## Quick Start

```bash
# 1. Enter the frontend project directory
cd dc3-web

# 2. Install dependencies
pnpm install

# 3. Start dev server (default http://localhost:8081)
pnpm dev
```

Once the dev server is running:

- Frontend pages: `http://localhost:8081` (the port comes from `APP_CLI_PORT` in `.env.dev`; 8080 is left to the dockerized web container)
- API proxy: requests with the `/api/v3` prefix are proxied to `http://127.0.0.1:8080` — the nginx of the app stack's `dc3-web` container, which reverse-proxies to the gateway
- To change the backend address: edit `src/config/env/.env.dev` (`APP_API_PATH` / `APP_API_PORT`) and restart the dev server

Dev builds ship sourcemaps by default, so you can debug directly on source with the Vue DevTools browser extension.

::: tip Backend dependency
When integrating against a real backend, the default proxy points at the nginx of the app stack's `dc3-web` container on local port 8080. From the repo root, start the db stack and the app stack:

```bash
# From the repo root
make up-db        # postgres + rabbitmq (separate stack, shared by app/dev)
make up-app       # web + gateway + 4 centers + all 36 drivers
make ps STACK=app # confirm web / gateway are up
```

Alternatively start only the lightweight dev stack: `make up-dev` (gateway + 4 centers + all 36 drivers, no web container), and point `APP_API_PORT` in `src/config/env/.env.dev` at `8000` to hit the gateway directly. With no backend at hand, see Mock Development Mode below.

:::

## Mock Development Mode

You can develop and debug without any backend: `pnpm dev:mock` starts the dev server in mock mode (`.env.mock` sets `APP_MOCK="true"`; `src/main.ts` loads the axios mock adapter from `src/mock/` when the mode is `mock`), so common endpoints such as login, menus, and devices are answered by built-in mock data.

```bash
pnpm dev:mock   # http://localhost:8081, no backend needed
```

Endpoints the mock does not cover yet fall back to the dev proxy (`.env.mock` keeps the dev proxy target). Related test commands also run backend-free:

- `pnpm serve:e2e:mock` — serves the mock build locally with a static server (for Playwright)
- `pnpm test:e2e:responsive` — the three-terminal responsive gate, run against the self-contained mock build
- `E2E_SERVER_MODE=mock pnpm test:e2e` — the full E2E suite against the mock build

## Project Structure

The tree below is an excerpt (some subdirectories and config files omitted); see the repository for the full structure:

```text
dc3-web/
├── src/
│   ├── api/           # REST API request wrappers
│   ├── components/    # Reusable components
│   │   ├── card/      #   InfoCard pattern (single-entity form + save/reset)
│   │   ├── chart/     #   Chart components (AntV G2/G6)
│   │   ├── entity/    #   Entity detail / list components
│   │   ├── layout/    #   Layout, menu, navbar
│   │   └── agentic/   #   AI chat components
│   ├── composables/   # Vue Composables
│   ├── config/        # Application configuration
│   │   ├── axios/     #   Axios instance and interceptors
│   │   ├── env/       #   Env files organized by mode
│   │   ├── i18n/      #   Internationalization (zh / en)
│   │   ├── router/    #   Route definitions
│   │   └── types/     #   Entity type definitions
│   ├── mock/          # Mock-mode axios adapter and built-in data
│   ├── store/         # Pinia state management
│   ├── styles/        # Global styles
│   ├── utils/         # Utility functions
│   └── views/         # Page components
│       ├── device/    #   Device management
│       ├── driver/    #   Driver management
│       ├── home/      #   Dashboard
│       ├── login/     #   Login
│       ├── point/     #   Point management
│       ├── profile/   #   Profile (device template) management
│       └── settings/  #   System settings
├── tests/             # Tests (Vitest + Playwright)
├── vite.config.ts     # Vite configuration
├── vitest.config.ts   # Vitest configuration (coverage thresholds)
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## Menu System

The frontend menu is driven by two layers:

1. **Backend database** `dc3_menu` table — stores menu item definitions and permissions.
2. **Frontend router config** `src/config/router/` — maps menus to Vue page components.

The full chain for adding a new menu item:

```text
Write to dc3_menu table -> Register frontend route -> i18n translation -> Bind permission point
```

All four layers must be updated; missing any one breaks the menu. See
the [Contributing Guide](../community/contributing).

## Common Commands

| Command           | Description                                          |
|-------------------|------------------------------------------------------|
| `pnpm dev`        | Start dev server                                     |
| `pnpm dev:mock`   | Start dev server in mock mode (no backend needed)    |
| `pnpm build`      | Production build                                     |
| `pnpm preview`    | Preview production build                             |
| `pnpm test`       | Run unit tests                                       |
| `pnpm test:e2e`   | Run E2E tests (Playwright)                           |
| `pnpm lint`       | ESLint check with auto-fix (`eslint . --fix`)        |
| `pnpm lint:check` | ESLint check only, no file modification              |
| `pnpm type-check` | TypeScript type check                                |

## Testing

The project includes five layers of tests plus two groups of meta tests:

- **Unit tests** (Vitest): `tests/unit/` — utils, stores, and shared infrastructure
- **API contract tests**: `tests/api/` — snapshot tests ensuring API wrapper interfaces don't break
- **Component tests**: `tests/component/` — Vue component contracts (`@vue/test-utils`)
- **View tests**: `tests/views/` — route-level view contracts (real pages mounted with mocked APIs)
- **E2E tests** (Playwright): `tests/e2e/` — browser end-to-end tests
- **Meta tests**: `tests/guardrails/` keeps the test suite itself safe; `tests/agentic-dialogue/` covers the AI dialogue flows

CI gate (the `quality` job in `.github/workflows/ci-web.yml`): `pnpm lint:check` → `pnpm check` (type check) → `pnpm test:guard` → `pnpm test:ci` (coverage thresholds) → `pnpm build`

See the [Test Debugging Guide](./test-debugging).

## Environment Variables

Environment variables are managed by `vite.config.ts`: `envDir` points at `src/config/env/`, and `envPrefix` restricts what client code sees to `APP_`-prefixed variables. The directory holds six files, one per Vite mode:

- `.env` — baseline shared by all modes (currently just `APP_CLI_PORT=8080`)
- `.env.dev` — dev mode (`pnpm dev`)
- `.env.mock` — mock mode (`pnpm dev:mock` / `pnpm build:mock`)
- `.env.test` — test mode
- `.env.pre` / `.env.pro` — pre / pro modes; the API points at the in-network `dc3-gateway`

There are five variables in total: `APP_CLI_PORT`, `APP_API_PREFIX`, `APP_API_PATH`, `APP_API_PORT`, and `APP_MOCK`. The actual dev-mode values:

```properties
# dc3-web/src/config/env/.env.dev
# The CLI port is 8081 (8080 is left to the dockerized web container); the proxy
# target is the app stack web container's nginx.
APP_CLI_PORT=8081
APP_API_PREFIX=/api/v3
APP_API_PATH=http://127.0.0.1
APP_API_PORT=8080
```

Restart the dev server after changing these values.
