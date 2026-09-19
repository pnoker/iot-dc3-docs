---
title: 常见问题
---

# 常见问题（Q&A）

## 许可证与授权

### IoT DC3 使用什么开源协议？

IoT DC3 基于 [AGPL-3.0](https://github.com/pnoker/iot-dc3/blob/release/LICENSE-AGPL.txt) 协议发布。

AGPL-3.0 的核心要求：如果你修改了平台代码并**通过网络提供服务**（包括
SaaS、内部系统），你必须将修改后的完整源代码开源。如果只是内部使用、未分发、未通过网络提供服务，则无需开源。

### AGPL-3.0 对我们公司意味着什么？

| 场景                        | 是否需要开源         |
|---------------------------|----------------|
| 内部部署、不改代码、仅自己用            | 否              |
| 内部部署、改了代码、仅自己用（未对外提供服务）   | 否（但建议贡献回来）     |
| 基于 DC3 做 SaaS 产品对外售卖      | **是**，必须开源全部修改 |
| 基于 DC3 做了二次开发并分发给客户部署     | **是**，必须开源全部修改 |
| 只是调用 DC3 的 API，未修改 DC3 本身 | 否              |

### 可以闭源二次开发吗？

如果你只是通过 API 调用 DC3、没有修改 DC3 源码本身，你的调用方代码可以闭源。一旦你修改了 DC3 源码并通过网络对外提供服务，AGPL-3.0
要求你将修改开源；确需闭源集成或 OEM 发行时，可取得[企业版商业授权](https://dc3.site/zh/pricing/)。

### 有商业授权吗？

有。社区版基于 AGPL-3.0 完整开源；当你的场景无法满足 AGPL（如闭源集成、OEM 发行）时，企业版提供商业授权，并含专属驱动开发额度与高可用架构评审。方案与定价见 [dc3.site/zh/pricing](https://dc3.site/zh/pricing/)。

---

## 收费与商业模式

### IoT DC3 本身收费吗？

**社区版不收费**：全部功能完整开源（AGPL-3.0），可自由下载、使用、修改和分发。专业版按位号档位订阅（含官方支持与规模保障），企业版提供商业授权与定制服务——档位定义的是官方承接的规模边界，不是功能解锁。见 [价格与方案](https://dc3.site/zh/pricing/)。

### 项目方如何盈利？

通过专业版订阅与企业版服务维持投入：社区版永久免费且功能完整，专业版/企业版按 [定价方案](https://dc3.site/zh/pricing/) 提供官方支持、规模保障与商业授权。

### 使用 IoT DC3 需要付费给谁吗？

自托管社区版不需要向任何人付费（基础设施费用自理）。需要官方支持、更大接入规模或商业授权时，按 [定价方案](https://dc3.site/zh/pricing/) 订阅专业版/企业版。

---

## 技术选型

### 为什么用 Java 而不是 Go/Node.js/Python？

选 Java + Spring 是维护者的工程判断，理由按分量排列：

- 工业现场的大量存量系统（SCADA、MES、ERP）本身跑在 Java 生态上，与它们集成时语言一致最省力
- Spring Boot / Cloud / Security / Data 把分布式、安全、数据访问这些平台必需的能力做成了默认项
- 设备接入服务常年不重启，JVM 的内存管理与垃圾回收经过长期生产验证
- Spring AI 提供统一的大模型接入层，Agentic 中心直接建在它上面（见[为什么选 Spring AI](../ai/spring-ai-deep-dive)）

### 为什么用 PostgreSQL 而不是 MySQL？

平台的数据架构建在 PostgreSQL 的三个扩展上，迁移成本决定了选型：

- **TimescaleDB**——IoT 时序数据的超表自动分区、压缩与保留策略
- **Apache AGE**——图查询，用于设备关系与拓扑路径
- **pgvector**——向量检索，为 AI 语义查询留好地基

此外 JSONB、数组、范围类型等数据类型也在多处使用。

### 支持哪些设备协议？应该怎么选择？

平台内置 **36 个驱动模块**，覆盖：

- **工业总线/PLC**：Modbus TCP/RTU、OPC UA/DA、S7 (Siemens)、MELSEC、FINS (Omron)、EtherNet/IP
- **SCADA/电力/计量**：BACnet/IP、KNX、IEC 104、DNP3、IEC 61850、DLMS、DL/T645、M-Bus、SL651、SNMP
- **IoT/无线**：MQTT、CoAP、LwM2M、HTTP、BLE、Zigbee、CAN、LoRaWAN、Kafka
- **串口/通用网络**：Serial、TCP/UDP
- **数据库**：MySQL、PostgreSQL、Oracle、SQL Server、Redis

选择建议：先确定现场设备支持的协议，再看驱动能力矩阵（[驱动能力矩阵](../drivers/matrix)）确认所需读写/订阅能力是否满足。

---

## 部署与运维

### 最低硬件要求？

下面是让平台跑起来的参考起步配置，实际按接入设备规模与数据量调整：

**开发环境**（仅依赖栈 PostgreSQL + RabbitMQ）：

- CPU: 2 核
- 内存: 4 GB
- 磁盘: 20 GB

**生产环境**（全栈：网关 + 4 个中心 + N 个驱动 + 依赖栈）：

- CPU: 8 核及以上
- 内存: 16 GB 及以上
- 磁盘: 100 GB SSD 及以上（时序数据持续增长，需规划扩容）

### 如何从开发环境迁移到生产？

1. **安全加固**：修改默认密钥/密码、启用 TLS、配置防火墙规则、关闭调试端点
2. **数据持久化**：确保 PostgreSQL 和 RabbitMQ 数据卷正确挂载和备份
3. **高可用**：根据需求配置 PostgreSQL 主从、RabbitMQ 集群
4. **监控告警**：部署 Prometheus + Grafana（docker-compose-optional.yml 已包含）
5. **日志收集**：接入 ELK（docker-compose-optional.yml 已包含）
6. **环境变量**：参考 [环境变量配置](../quickstart/environment)，将开发变量替换为生产值

详见 [安全策略](./security) 的生产基线清单。

### 数据怎么备份？

PostgreSQL 数据备份：

```bash
# 全量备份
podman exec dc3-postgres pg_dumpall -U dc3 > backup.sql

# 仅备份平台数据（不含 TimescaleDB 时序数据）
podman exec dc3-postgres pg_dump -U dc3 \
  --schema=dc3_auth --schema=dc3_manager --schema=dc3_data > backup_platform.sql
```

生产环境建议配置 pgBackRest 或 pg_dump 定时任务 + 异地存储。

---

## 驱动开发

### 怎么开发一个新驱动？

1. 阅读 [驱动开发指南](../development/driver-authoring)
2. 在 `dc3-driver/` 下复制最接近的驱动模块作为模板
3. 实现 Driver SDK 要求的 `read()` 与 `write()` 方法（可选的自定义调度、健康检查等钩子见驱动开发指南）
4. 在 `dc3/docker-compose.yml` 中添加驱动服务配置
5. 写文档（参考已有驱动文档页的格式）

### 驱动一定要用 Java 吗？

Driver SDK 本身是 Java 的，但你也可以通过 **MQTT 桥接** 或 **HTTP 代理** 的方式用任意语言实现设备接入：非 Java 程序将数据发到
MQTT Topic → MQTT 驱动订阅 → 进入平台数据管道。不过这种方式会丢失 SDK 内置的状态管理、自动重连、健康上报等能力。

---

## AI 能力

### AI 能做什么？

Agentic 中心（基于 Spring AI）把大模型接到平台上，对话即可完成：

- 查询设备状态与位号值
- 读写位号、向设备下发命令（高风险操作需二次确认）

平台同时把 330+ 个 HTTP 接口自动聚合成 MCP（Model Context Protocol）工具目录，Claude Desktop、VS Code、Cursor
等 AI 工具经 OAuth 2.1 鉴权后可直接调用。详见 [AI 概览](../ai/)。

### 支持哪些大模型？

Agentic 中心对外暴露 OpenAI 兼容的聊天接口，凡是提供 OpenAI 兼容 API 的模型服务都能接——GPT、Claude、DeepSeek、通义千问等均可。配置见
[Agentic 中心](../ai/agentic)。

---

## 社区与贡献

### 遇到问题怎么求助？

1. 先查 [故障排查指南](../guide/troubleshooting)
2. 搜索 [GitHub Issues](https://github.com/pnoker/iot-dc3/issues) 看是否有人遇到过
3. 没找到？提新 Issue，附上：版本号、日志、复现步骤、环境信息

### 如何参与贡献？

见 [贡献指南](./contributing)。任何形式的贡献都欢迎：报告 bug、改进文档、提交代码、参与讨论。

### 有商业支持服务吗？

有。专业版与企业版即官方支持（含规模保障，企业版另有专属驱动与定制服务），联系方式见 [定价方案](https://dc3.site/zh/pricing/)；社区版通过 GitHub Issue 与社区渠道获得支持。
