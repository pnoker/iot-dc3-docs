---
title: 控制台 · MCP 连接
---

# 控制台 · MCP 连接

把平台的 330+ 工具目录安全地接给外部 AI Agent，连接侧的管理都在**设置 → MCP** 下：服务、连接、客户端三个子页，外加一份调用审计。协议与安全模型（OAuth 2.1 + PKCE、三层工具可见性、HIGH 风险两阶段确认）见 [AI Agent / MCP](../ai/mcp)——这里只讲界面怎么转。

> 你在这里：要让 Claude Desktop / VS Code / Cursor 或自研 Agent 通过 MCP 调平台工具。协议细节与 curl 流程看 MCP 页；此处讲控制台上要配什么。

## 三个子页各管什么

| 子页 | 管什么 | 典型动作 |
|------|--------|---------|
| **MCP 服务** | 平台对外的 `/mcp` 端点形态（网关上的 MCP Resource Server） | 查看服务状态、刷新工具目录 |
| **MCP 连接** | 一条已建立的 Agent 连接：绑定了哪个客户端、开了什么工具白名单 | 新建连接、管理工具、查看权限范围 |
| **MCP 客户端** | 已注册的 OAuth 客户端（`/oauth2/register` 动态注册的落库处） | 注册客户端、查看 clientId/secret |

**工具目录刷新**是管理员手动动作（`POST /mcp/tool/catalog/refresh`）：新增了 HTTP 接口后目录不会自动更新——在这页（或用 curl）触发一次刷新，新工具才会出现在 `tools/list`。

## 建一条 Agent 连接的全流程

1. **注册客户端**：MCP 客户端页新增（或 Agent 走 `/oauth2/register` 自助注册，需已登录 principal，注册后归属该主体）；
2. **拿令牌**：客户端用 OAuth 2.1 + PKCE（S256 强制）换 15 分钟短时 JWT（刷新令牌 30 天，支持轮换）；
3. **建连接**：MCP 连接页新建，选择客户端、配置**工具白名单**；
4. **Agent 调用**：`tools/list` 返回的 = 主体 RBAC 权限 ∩ 连接白名单 ∩ 风险策略（HIGH 默认隐藏，需显式开启）——三层交集决定 Agent 看得见什么；
5. **HIGH 风险操作**：调用先返回 `CONFIRM_REQUIRED` + `confirmId`，二次确认（5 分钟内、参数摘要一致、单次消费）才真正执行。

## 调用审计

**MCP 审计**页（`dc3_mcp_audit_log`）记录每一次工具调用：谁（principal/连接）、调了什么（tool_id）、风险级别、耗时、来源 IP；HIGH 风险调用连同确认票据信息一并落审计。"Agent 到底干了什么"在这里回溯。

## 界面动作与 API 的对应

| 界面动作 | API（经网关） | 语义 |
|---------|--------------|------|
| 注册客户端 | `POST …/oauth2/register` | 需已登录 principal |
| 刷新工具目录 | `POST …/mcp/tool/catalog/refresh` | 管理员手动，新增接口后必跑 |
| 连接管理 / 工具白名单 | MCP 连接 CRUD | 决定三层过滤的中间层 |
| 审计查询 | `tools/call` 逐次落 `dc3_mcp_audit_log` | 全量留痕 |

## 延伸阅读

- [AI Agent / MCP](../ai/mcp) — 协议、OAuth 流程、风险分级的完整参考
- [Agentic 中心](../ai/agentic) — 平台内置的对话式 AI（与 MCP 互补的另一种接入）
- [鉴权 · 租户 · RBAC](../architecture/auth-rbac) — 三层过滤里 RBAC 层的实现
