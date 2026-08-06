# IoT DC3 Docs

IoT DC3 文档网站的源码仓库（[VitePress](https://vitepress.dev) 构建），独立于主仓库 [pnoker/iot-dc3](https://github.com/pnoker/iot-dc3) 管理。

线上地址：<https://docs.dc3.site>

## 本地开发

```bash
pnpm install
pnpm dev          # 启动开发服务器
pnpm build        # 构建到 .vitepress/dist
pnpm preview      # 预览构建产物
```

> 需要 Node.js 22（见 `.nvmrc`）与 pnpm。

## 目录结构

```
.
├── .vitepress/      # VitePress 配置、主题、自定义组件
├── public/          # 静态资源（图片、CNAME、versions.json 等）
├── zh/              # 中文文档
├── en/              # English docs
├── dc3/doc/         # CHANGE.md / USAGE.md 快照（见下）
└── index.md         # 语言入口（按浏览器语言重定向到 /zh/ 或 /en/）
```

## 与上游 iot-dc3 的关系

本仓库**完全独立**，构建时不依赖主仓库。两份内容以快照形式存在于 `dc3/doc/`：

| 文件 | 上游来源 | 说明 |
| --- | --- | --- |
| `dc3/doc/CHANGE.md` | iot-dc3 的 `make changelog` 生成 | 每次发版更新，需手动同步 |
| `dc3/doc/USAGE.md` | iot-dc3 手动维护 | make 快捷命令与镜像坐标 |

iot-dc3 发版后，手动刷新这两份快照：

```bash
./scripts/sync-external.sh
```

文档版本号读取自 `public/versions.json` 的 `latest` 字段。

## 部署

推送到 `main` 即触发 `.github/workflows/docs.yml`，由 GitHub Actions 构建并部署到 GitHub Pages（自定义域 `docs.dc3.site`）。

## License

[AGPL-3.0](./LICENSE)
