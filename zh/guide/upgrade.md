---
title: 版本升级与数据库迁移
---

# 版本升级与数据库迁移

app 镜像和数据库结构是两条线：换 `DC3_IMAGE_TAG` 拉新镜像只是第一条线，库不会自己变。这页讲第二条线——库结构怎么跟着版本走，以及升级后最常见的那个启动报错（schema fingerprint mismatch）怎么处理。

> 你在这里：跑着的栈要升到新版本。镜像与部署形态见[部署模式与镜像源](./usage)与[生产部署指南](./deployment)，这里只讲升级动作本身。

## 先明白两个机制

### initdb 只在空库跑一次

第一次起 db 栈时，`dc3/dependencies/postgres/initdb/` 下的脚本由 postgres 官方入口自动执行，建出全部 schema 和表（见[部署模式与镜像源](./usage)的种子数据表）。之后这些脚本不会再跑——数据卷非空，重启、换镜像都不触发。所以老库不会自动拿到新版本的表结构。

### 改结构靠手动跑 migrations

`dc3/dependencies/postgres/migrations/` 下按编号排列的 SQL 就是版本之间的库结构变更。**没有自动迁移器**，要自己对库执行：

```bash
# 在主仓库 iot-dc3/ 目录下，逐个执行（编号即顺序）
docker exec -i dc3-postgres psql -U dc3 -d dc3 \
  -v ON_ERROR_STOP=1 < dc3/dependencies/postgres/migrations/01-menu-icon-backfill.sql
```

每个文件都幂等（`IF NOT EXISTS`、`ON CONFLICT DO NOTHING` 或旧值守卫），重复执行不出错；乱序执行没有意义，按编号从旧到新。文件头注释写明它做什么、是否重写指纹。

## schema fingerprint：启动闸门

各中心（auth / manager / data / agentic / single）启动时会拿库内 `public.dc3_schema_fingerprint.ddl_hash` 与期望指纹比对，对不上**直接拒绝启动**——是启动异常，不只是摘除就绪。期望值是镜像携带的 initdb DDL 哈希（经 `DC3_SCHEMA_FINGERPRINT` 注入）。

这个设计把"换了镜像忘跑迁移"从运行期的怪问题变成启动期的明确报错：

| 报错 | 含义 | 处理 |
|------|------|------|
| `schema fingerprint mismatch: expected …, actual …` | 库的 DDL 版本和镜像对不上 | 库旧：按编号补跑 migrations；库比镜像新：tag 拉低了，升回去 |
| `dc3_schema_fingerprint row is missing` | 库不是 initdb 建的，或行被误删 | 确认卷没被动过；动了就从备份恢复 |
| migrations 跑完仍 mismatch | 改 DDL 的迁移没把指纹写回去 | 看对应迁移的指纹重写段是否执行成功（02/03/04 内置重写） |

改 DDL 的迁移（如 `03-agentic-check-columns.sql`）在同一个事务里重写库内指纹；只插数据的迁移（如 `05-agentic-permission-resources.sql`）刻意不动指纹。

## 标准升级步骤

1. **备份**。pg_dump / pg_dumpall 的命令与 schema 范围见 [FAQ · 备份](../community/faq)。
2. **看这一版带了哪些迁移**。直接看主仓库 `dc3/dependencies/postgres/migrations/` 里编号大于你上次执行到的文件——目录本身就是唯一的清单，别指望从变更日志里搜出来（迁移不一定在发布说明里有专属条目）。
3. **跑迁移**。按编号对库执行（命令见上）。先跑迁移再起中心最省事；颠倒了也不坏——中心会因指纹不符拒绝启动，跑完迁移重启即可。
4. **换镜像 tag**。根目录 `.env` 把 `DC3_IMAGE_TAG` 改到目标版本，`make up STACK=app` 拉起重栈。
5. **验证**。`make ps STACK=app` 看各中心就绪（就绪即指纹校验通过），控制台登录确认位号值还在。

::: warning 别跳过备份
迁移虽然幂等，ALTER 类操作没有回滚段。库大的话，先演练一遍备份恢复再动生产。
:::

## 常见问题

- **升级后中心起不来，日志里 schema fingerprint mismatch？** 见上面的闸门表，九成是漏了 migrations。
- **initdb 脚本更新了，老库要重跑 initdb 吗？** 不要。initdb 只服务空库，老库的一切变更走 migrations。哪怕 initdb 只改了注释（指纹也会跟着变），对应的 resync 迁移（如 `02-schema-fingerprint-resync.sql`）会跟上。
- **compose 里 `DC3_SCHEMA_FINGERPRINT` 的默认值是什么？** 当前 initdb 全集的 SHA-256。主仓库 `make validate-schema-fingerprint` 守着它和 8 处分发点一致；不动 initdb 就不用管它。
- **驱动服务也校验指纹吗？** 不。校验在连库的各中心，驱动不连库。

## 延伸阅读

- [变更日志](../development/changelog) — 按版本看提交，搜 migration 定位库变更
- [数据库结构参考](../development/schema-reference) — 全部 schema 与表的一页清单
- [FAQ](../community/faq) — 备份命令与恢复范围
