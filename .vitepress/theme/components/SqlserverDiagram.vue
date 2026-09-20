<!--
  - Copyright 2016-present the IoT DC3 original author or authors.
  - Licensed under AGPL-3.0. See LICENSE.
  -->
<script lang="ts" setup>
import {computed} from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), {lang: 'zh'})
const DICT = {
  zh: {
    aria: 'SQL Server 驱动的请求-响应模型：采集调度按 cron 触发驱动经 JDBC 连接池以 TDS 协议查询库，取结果第一行第一列作为位号值；写命令把值绑定进 UPDATE/INSERT 的 ? 占位符执行',
    modelNote: '请求-响应模型 · 驱动主动查询 · 库不会推送',
    platRegion: '平台侧 Platform · SQL 客户端',
    srcRegion: '数据源侧 · SQL Server (MES/ERP / SCADA 上位机 / 历史库)',
    schedName: '采集调度 Scheduler',
    schedSub: 'cron 0/30 * * * * ?',
    schedArrow: 'cron 触发',
    drvName: 'dc3-driver-sqlserver',
    drvSub: 'JDBC 客户端 · DRIVER_CLIENT',
    drvB1: '· mssql-jdbc (com.microsoft.sqlserver.jdbc.SQLServerDriver)',
    drvB2: '· HikariCP 连接池按设备缓存 · 最大 5 连接',
    drvB3: '· 连接超时 = queryTimeout(30s) × 1000',
    wrName: '写命令 Write',
    wrSub: '命令参数绑定进 ? 占位符 (PreparedStatement 预编译)',
    wrB: '受影响行数 > 0 才算成功',
    hsName: '健康检查 Health',
    hsSub: 'conn.isValid(5) · cron 0/15 · 租约 45s',
    q1: 'SELECT 查询 ▶',
    q1Sub: 'readQuery (位号属性)',
    q2: '◀ ResultSet 结果集',
    q2Sub: '取第一行第一列 rs.getObject(1)',
    qw: 'UPDATE / INSERT ▶',
    qwSub: '? = 写入值 · 无 SQL 注入',
    dbName: 'SQL Server 库',
    dbSub: 'Windows 与企业信息化环境常用',
    trName: 'TCP 1433 · TDS 协议 (表格式数据流)',
    url1: 'jdbc:sqlserver://host:1433;databaseName=iot',
    url2: ';encrypt=false;trustServerCertificate=true (键值用分号分隔)',
    exName: '示例 SQL (位号属性)',
    exR: 'read:   SELECT temperature FROM sensor WHERE id = 1',
    exW: 'write:  UPDATE sensor SET temperature = ? WHERE id = 1',
    exN: '空结果集 → null · 多行只取第一行 · T-SQL 语法',
    tlsName: 'TLS 可选',
    tlsSub: 'encrypt=true 启用加密 · trustServerCertificate 跳过证书链校验',
    cap: '能力：读 ✓ / 写 ✓ / 订阅 — (请求-响应，库不推送)',
    pvName: '位号值 PointValue',
    pvArrow: '查询值上送',
    legPlat: '平台 / 驱动',
    legDb: '数据源',
    legQuery: '读查询流',
    legWrite: '写命令流',
    legProto: '协议 / 传输',
    legData: '输出'
  },
  en: {
    aria: 'SQL Server driver request/response model: the scheduler triggers the driver per cron to query the database over TDS via its JDBC pool; the first row and first column of the result becomes the point value; writes bind the value into the ? placeholder of an UPDATE/INSERT',
    modelNote: 'request/response · the driver queries · the database never pushes',
    platRegion: 'Platform · SQL client',
    srcRegion: 'Data source · SQL Server (MES/ERP / SCADA / history)',
    schedName: 'Read Scheduler',
    schedSub: 'cron 0/30 * * * * ?',
    schedArrow: 'cron trigger',
    drvName: 'dc3-driver-sqlserver',
    drvSub: 'JDBC client · DRIVER_CLIENT',
    drvB1: '· mssql-jdbc (com.microsoft.sqlserver.jdbc.SQLServerDriver)',
    drvB2: '· HikariCP pool cached per device · max 5 conns',
    drvB3: '· connect timeout = queryTimeout(30s) × 1000',
    wrName: 'Write command',
    wrSub: 'command value bound into ? (PreparedStatement)',
    wrB: 'affected rows > 0 counts as success',
    hsName: 'Health check',
    hsSub: 'conn.isValid(5) · cron 0/15 · lease 45s',
    q1: 'SELECT query ▶',
    q1Sub: 'readQuery (point attribute)',
    q2: '◀ ResultSet',
    q2Sub: 'first row, first column rs.getObject(1)',
    qw: 'UPDATE / INSERT ▶',
    qwSub: '? = value · injection-safe',
    dbName: 'SQL Server database',
    dbSub: 'common in Windows enterprise IT',
    trName: 'TCP 1433 · TDS (tabular data stream)',
    url1: 'jdbc:sqlserver://host:1433;databaseName=iot',
    url2: ';encrypt=false;trustServerCertificate=true (semicolon-separated)',
    exName: 'Example SQL (point attributes)',
    exR: 'read:   SELECT temperature FROM sensor WHERE id = 1',
    exW: 'write:  UPDATE sensor SET temperature = ? WHERE id = 1',
    exN: 'empty set → null · multi-row takes first · T-SQL syntax',
    tlsName: 'TLS optional',
    tlsSub: 'encrypt=true enables TLS · trustServerCertificate skips chain validation',
    cap: 'Capability: read ✓ / write ✓ / subscribe — (request/response, no push)',
    pvName: 'PointValue',
    pvArrow: 'query value uplink',
    legPlat: 'platform / driver',
    legDb: 'data source',
    legQuery: 'read query flow',
    legWrite: 'write command flow',
    legProto: 'protocol / transport',
    legData: 'output'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 640">
        <defs>
          <marker id="mss-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mss-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mss-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#mss-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="650" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="520" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="520" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="640" x="620" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="632" y="68">{{ s.srcRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#mss-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="152"
              y2="192"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="250" y="176">{{ s.schedArrow }}</text>

        <line marker-end="url(#mss-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="230"
              y2="230"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="218">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="248">{{ s.q1Sub }}</text>
        <line marker-end="url(#mss-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="280"
              y2="280"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="306">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="270">{{ s.q2Sub }}</text>
        <line marker-end="url(#mss-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="382" y2="382"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="370">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="400">{{ s.qwSub }}</text>

        <line marker-end="url(#mss-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="500"
              y2="530"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="520">{{ s.pvArrow }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="120">{{
            s.schedName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="140">{{ s.schedSub }}</text>

        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="222">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="240">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="96" y="264">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="282">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="300">{{ s.drvB3 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="350"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="374">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="392">{{ s.wrSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="408">{{ s.wrB }}</text>

        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="440"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="464">{{
            s.hsName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="482">{{ s.hsSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="534"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="554">{{
            s.pvName
          }}
        </text>

        <!-- source nodes -->
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="560"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="940" y="122">{{
            s.dbName
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="9" text-anchor="middle" x="940" y="142">{{ s.dbSub }}</text>

        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="660" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="940" y="214">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="940" y="232">{{ s.url1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="940" y="270">{{ s.url2 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="560"
              x="660" y="300"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="940" y="324">{{
            s.exName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" x="680" y="350">{{ s.exR }}</text>
        <text fill="var(--dc3-text2)" font-size="9" x="680" y="370">{{ s.exW }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="680" y="394">{{ s.exN }}</text>

        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="560" x="660" y="440"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="940" y="458">{{
            s.tlsName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="940" y="474">{{ s.tlsSub }}</text>

        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="940" y="540">{{ s.cap }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="606"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="615">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="190" y="606"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="615">{{ s.legDb }}</text>
        <line marker-end="url(#mss-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="330" x2="380" y1="610"
              y2="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="388" y="615">{{ s.legQuery }}</text>
        <line marker-end="url(#mss-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="520" x2="570" y1="610" y2="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="578" y="615">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="730" y="606"/>
        <text fill="var(--dc3-text2)" font-size="9" x="752" y="615">{{ s.legProto }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="880" y="606"/>
        <text fill="var(--dc3-text2)" font-size="9" x="902" y="615">{{ s.legData }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
