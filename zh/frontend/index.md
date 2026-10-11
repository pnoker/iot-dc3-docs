---
title: 前端开发
---

# 前端开发

> 你在这里：想参与 `dc3-web/` 前端开发，或本地跑通它的构建与测试。只想使用平台，看 [运营概览](../operation/)。

IoT DC3 前端基于 **Vue 3 + TypeScript + Vite + Element Plus** 构建，源码位于主仓库（iot-dc3）根目录的 `dc3-web/`，是一个独立的 pnpm 项目。

## 环境准备

| 工具      | 最低版本   | 说明                                                        |
|---------|--------|-----------------------------------------------------------|
| Node.js | 22 LTS | 与 `package.json` 的 `engines` 声明一致；推荐 fnm/nvm 管理版本       |
| pnpm    | 12.6.0 | 版本由 `package.json` 的 `packageManager` 字段锁定，corepack 自动切换 |

```bash
# 启用 corepack（如未启用；pnpm 版本随 packageManager 字段自动切换）
corepack enable

# 确认版本
node -v   # ≥ v22
pnpm -v   # 12.6.0
```

## 快速启动

```bash
# 1. 进入前端项目目录
cd dc3-web

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器（默认 http://localhost:8081）
pnpm dev
```

开发服务器启动后：

- 前端页面：`http://localhost:8081`（端口取自 `.env.dev` 的 `APP_CLI_PORT`，8080 让位给 dockerized web 容器）
- API 代理：`/api/v3` 前缀的请求代理到 `http://127.0.0.1:8080` —— 即本机 app 栈 `dc3-web` 容器的 nginx，再由它反代网关
- 修改后端地址：编辑 `src/config/env/.env.dev`（`APP_API_PATH` / `APP_API_PORT`），改完重启 dev server

dev 构建默认开启 sourcemap，配合浏览器 Vue DevTools 扩展可直接在源码上断点调试。

::: tip 后端依赖
联调真实后端时，默认代理指向本机 8080 端口上 app 栈 `dc3-web` 容器的 nginx。在仓库根目录起数据库栈与 app 栈：

```bash
# 在仓库根目录
make up-db        # postgres + rabbitmq（独立编排，app/dev 栈共用）
make up-app       # web + 网关 + 4 个中心 + 全部 36 个驱动
make ps STACK=app # 确认 web / gateway 就绪
```

也可以只起轻量 dev 栈：`make up-dev`（网关 + 4 个中心 + 全部 36 个驱动，不含 web 容器），并把 `src/config/env/.env.dev` 的 `APP_API_PORT` 改为 `8000` 直连网关。没有后端环境时，见下文 Mock 开发模式。

:::

## Mock 开发模式

没有后端环境也能开发与调试：`pnpm dev:mock` 以 mock 模式启动 dev server（`.env.mock` 设 `APP_MOCK="true"`，`src/main.ts` 在 mock 模式下加载 `src/mock/` 的 axios mock 适配器），登录、菜单、设备等常用接口由内置 mock 数据应答。

```bash
pnpm dev:mock   # http://localhost:8081，无需任何后端
```

mock 尚未覆盖的端点会回落到 dev 代理（`.env.mock` 沿用 dev 的代理指向）。相关测试命令同样不依赖后端：

- `pnpm serve:e2e:mock` —— 以 mock 构建产物启动本地静态服务器（供 Playwright 使用）
- `pnpm test:e2e:responsive` —— 三端响应式门禁，跑在自包含的 mock 构建上
- `E2E_SERVER_MODE=mock pnpm test:e2e` —— 全量 E2E 走 mock 构建

## 项目结构

以下目录树为节选（省略了部分子目录与配置文件），完整结构见仓库：

```text
dc3-web/
├── src/
│   ├── api/           # REST API 请求封装
│   ├── components/    # 可复用组件
│   │   ├── card/      #   InfoCard 模式（单实体表单 + 保存/重置）
│   │   ├── chart/     #   图表组件（AntV G2/G6）
│   │   ├── entity/    #   实体详情/列表组件
│   │   ├── layout/    #   布局、菜单、导航栏
│   │   └── agentic/   #   AI 对话组件
│   ├── composables/   # Vue Composables
│   ├── config/        # 应用配置
│   │   ├── axios/     #   Axios 实例与拦截器
│   │   ├── env/       #   按模式组织的环境变量文件
│   │   ├── i18n/      #   国际化（zh / en）
│   │   ├── router/    #   路由定义
│   │   └── types/     #   实体类型定义
│   ├── mock/          # mock 模式的 axios 适配器与内置数据
│   ├── store/         # Pinia 状态管理
│   ├── styles/        # 全局样式
│   ├── utils/         # 工具函数
│   └── views/         # 页面组件
│       ├── device/    #   设备管理
│       ├── driver/    #   驱动管理
│       ├── home/      #   仪表盘
│       ├── login/     #   登录
│       ├── point/     #   位号管理
│       ├── profile/   #   模板管理
│       └── settings/  #   系统设置
├── tests/             # 测试（Vitest + Playwright）
├── vite.config.ts     # Vite 配置
├── vitest.config.ts   # Vitest 配置（含覆盖率阈值）
├── tsconfig.json      # TypeScript 配置
└── package.json       # 依赖与脚本
```

## 菜单系统

前端菜单由两层控制：

1. **后端数据库** `dc3_menu` 表 — 存储菜单项的定义和权限
2. **前端路由配置** `src/config/router/` — 将菜单映射到 Vue 页面组件

新增一个菜单项的完整链路：

```text
dc3_menu 表写入 → 前端路由注册 → i18n 翻译 → 权限点绑定
```

四层必须全部更新，缺一不可。详见 [贡献指南](../community/contributing)。

## 常用命令

| 命令                | 说明                                  |
|-------------------|-------------------------------------|
| `pnpm dev`        | 启动开发服务器                           |
| `pnpm dev:mock`   | 以 mock 模式启动开发服务器（无需后端）        |
| `pnpm build`      | 生产构建                                |
| `pnpm preview`    | 预览生产构建                             |
| `pnpm test`       | 运行单元测试                            |
| `pnpm test:e2e`   | 运行 E2E 测试（Playwright）             |
| `pnpm lint`       | ESLint 检查并自动修复（`eslint . --fix`） |
| `pnpm lint:check` | ESLint 仅检查，不修改文件                  |
| `pnpm type-check` | TypeScript 类型检查                    |

## 测试

项目包含五层测试，外加两组元测试：

- **单元测试**（Vitest）：`tests/unit/` — 工具函数、store 与共享基础设施
- **API 契约测试**：`tests/api/` — 快照测试确保 API 封装接口不变
- **组件测试**：`tests/component/` — Vue 组件契约（`@vue/test-utils`）
- **视图测试**：`tests/views/` — 路由级页面契约（挂载真实页面、mock API）
- **E2E 测试**（Playwright）：`tests/e2e/` — 浏览器端到端测试
- **元测试**：`tests/guardrails/` 守护测试套件自身；`tests/agentic-dialogue/` 覆盖 AI 对话流

CI 门禁（`.github/workflows/ci-web.yml` 的 quality job）：`pnpm lint:check` → `pnpm check`（类型检查）→ `pnpm test:guard` → `pnpm test:ci`（覆盖率阈值）→ `pnpm build`

详见 [测试调试指南](./test-debugging)。

## 环境变量

环境变量由 `vite.config.ts` 统一管理：`envDir` 指向 `src/config/env/`，`envPrefix` 限定只有 `APP_` 前缀的变量会暴露给客户端代码。该目录按 Vite 模式组织了六个文件：

- `.env` — 所有模式共享的基线（当前仅 `APP_CLI_PORT=8080`）
- `.env.dev` — dev 模式（`pnpm dev`）
- `.env.mock` — mock 模式（`pnpm dev:mock` / `pnpm build:mock`）
- `.env.test` — test 模式
- `.env.pre` / `.env.pro` — pre / pro 模式，API 指向容器网络内的 `dc3-gateway`

变量一共五个：`APP_CLI_PORT`、`APP_API_PREFIX`、`APP_API_PATH`、`APP_API_PORT`、`APP_MOCK`。dev 模式的实际取值：

```properties
# dc3-web/src/config/env/.env.dev
# CLI 端口 8081（8080 让位给 dockerized web 容器）；代理目标是 app 栈 web 容器的 nginx
APP_CLI_PORT=8081
APP_API_PREFIX=/api/v3
APP_API_PATH=http://127.0.0.1
APP_API_PORT=8080
```

修改这些值后需重启 dev server。
