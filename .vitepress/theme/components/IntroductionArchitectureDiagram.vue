<!--
  - Copyright 2016-present the IoT DC3 original author or authors.
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -->
<script lang="ts" setup>
import {computed} from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), {lang: 'zh'})

const DICT = {
  zh: {
    regionCenter: '中心服务 Center Services · gRPC 互联',
    regionDriver: '驱动层 Driver Layer · 36 个内置协议驱动',
    webName: 'Web 控制台', webSub: 'Vue3 · :8080',
    cliName: 'dc3-cli', cliSub: 'TypeScript CLI',
    agentName: 'AI Agent / MCP', agentSub: '对话 · 工具调用',
    gwName: 'dc3-gateway · API 网关 :8000', gwSub: '统一入口 · 鉴权过滤 · /api/v3/*',
    authSub: '认证 · 租户 · RBAC', mgrSub: 'Driver/Device/Point/Profile',
    dataSub: '位号值 · 命令 · 事件', agSub: 'Spring AI · @Tool',
    busName: 'RabbitMQ 消息总线',
    busSub: 'point_value · point_command / command · result · event',
    modbusSub: 'TCP / RTU', opcName: 'OPC', opcSub: 'UA / DA',
    s7Name: 'S7', s7Sub: 'PLC', mqttName: 'MQTT', mqttSub: 'Broker',
    moreName: '+ 32 驱动', moreSub: 'BACnet·SNMP·IEC104·虚拟…',
    devName: '现场设备 Field Devices',
    devSub: 'PLC · 传感器 · 电表 · 网关 (Modbus / OPC / S7 / MQTT)',
    pgTitle: 'PostgreSQL 持久层',
    pgL1: '• TimescaleDB — 位号值 / 历史时序',
    pgL2: '• pgvector — AI 向量检索',
    pgL3: '• AGE — 图数据 (设备关系)',
    pgPort: ':35432 → 5432',
    lblHttp: 'HTTP', lblApi: 'HTTP /api', lblMcp: 'MCP · 工具调用',
    lblAuth: '鉴权', lblMeta: '元数据', lblData: '数据', lblAi: 'AI',
    lblCollect: '① 采集 · 协议读取', lblUplink: '② PointValue 归一上报',
    lblBusUp: '上行 · 值与回执', lblJdbc: 'JDBC · TimescaleDB',
    lblRead: '③ 读带语义 PointValue', lblTool: '④ 工具调用',
    lblDown: '④ 命令下发', lblDispatch: '⑤ 按驱动分队', lblExec: '⑤ 协议报文执行',
    legClient: '接入端', legCenter: '中心服务', legBus: '消息总线',
    legDriver: '驱动', legDevice: '现场设备', legStore: '存储',
    legLoop: 'AI 闭环 ③④（虚线）', legNum: '①采集→②归一→③读取→④下发→⑤执行',
    aria: 'IoT DC3 闭环全景：客户端经网关进入四个中心服务，驱动层从现场设备采集数据经 RabbitMQ 归一上报数据中心并落 PostgreSQL；大模型经 Agentic 中心读取带语义的位号值、通过工具调用反向下发命令，经消息总线投递驱动执行并回执，形成采集到执行的完整闭环'
  },
  en: {
    regionCenter: 'Center Services · gRPC interconnect',
    regionDriver: 'Driver Layer · 36 built-in protocol drivers',
    webName: 'Web Console', webSub: 'Vue3 · :8080',
    cliName: 'dc3-cli', cliSub: 'TypeScript CLI',
    agentName: 'AI Agent / MCP', agentSub: 'chat · tool calls',
    gwName: 'dc3-gateway · API Gateway :8000', gwSub: 'single entry · auth filter · /api/v3/*',
    authSub: 'Auth · Tenant · RBAC', mgrSub: 'Driver/Device/Point/Profile',
    dataSub: 'Point value · Command · Event', agSub: 'Spring AI · @Tool',
    busName: 'RabbitMQ Message Bus',
    busSub: 'point_value · point_command / command · result · event',
    modbusSub: 'TCP / RTU', opcName: 'OPC', opcSub: 'UA / DA',
    s7Name: 'S7', s7Sub: 'PLC', mqttName: 'MQTT', mqttSub: 'Broker',
    moreName: '+ 32 drivers', moreSub: 'BACnet·SNMP·IEC104·virtual…',
    devName: 'Field Devices',
    devSub: 'PLC · sensor · meter · gateway (Modbus / OPC / S7 / MQTT)',
    pgTitle: 'PostgreSQL Storage',
    pgL1: '• TimescaleDB — point values / history',
    pgL2: '• pgvector — AI vector search',
    pgL3: '• AGE — graph (device relations)',
    pgPort: ':35432 → 5432',
    lblHttp: 'HTTP', lblApi: 'HTTP /api', lblMcp: 'MCP · tool calls',
    lblAuth: 'auth', lblMeta: 'metadata', lblData: 'data', lblAi: 'AI',
    lblCollect: '(1) collect · protocol read', lblUplink: '(2) normalized PointValue uplink',
    lblBusUp: 'up · values & receipts', lblJdbc: 'JDBC · TimescaleDB',
    lblRead: '(3) read semantic PointValue', lblTool: '(4) tool call',
    lblDown: '(4) command down', lblDispatch: '(5) fan out per driver', lblExec: '(5) payload executes',
    legClient: 'clients', legCenter: 'center services', legBus: 'message bus',
    legDriver: 'drivers', legDevice: 'field devices', legStore: 'storage',
    legLoop: 'AI loop ③④ (dashed)', legNum: '(1)collect→(2)normalize→(3)read→(4)command→(5)execute',
    aria: 'IoT DC3 loop overview: clients enter through the gateway into four center services; drivers collect field data through RabbitMQ into the data center and PostgreSQL; an LLM reads semantic point values via the agentic center and issues commands back through tool calls, dispatched via the bus to drivers that execute and receipt — a full collect-to-execute loop'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 760">
        <defs>
          <marker id="iad-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="iad-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="iad-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#iad-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="84" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="766" x="52" y="256"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="64" y="268">{{ s.regionCenter }}</text>
        <rect fill="var(--dc3-region-be)" height="84" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="766" x="52" y="490"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="64" y="502">{{ s.regionDriver }}</text>

        <!-- arrows -->
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="175" x2="175" y1="134" y2="170"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="110" y="158">{{ s.lblHttp }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="412" x2="412" y1="134" y2="170"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="350" y="158">{{ s.lblApi }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="667" x2="667" y1="134" y2="170"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="580" y="158">{{ s.lblMcp }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="148" x2="148" y1="232" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="156" y="254">{{ s.lblAuth }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="334" x2="334" y1="232" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="342" y="254">{{ s.lblMeta }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="520" x2="520" y1="232" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="528" y="254">{{ s.lblData }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="709" x2="709" y1="232" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="717" y="254">{{ s.lblAi }}</text>
        <!-- uplink chain ① ② -->
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="398" x2="398" y1="608" y2="570"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="390" y="594">{{ s.lblCollect }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="398" x2="398" y1="502" y2="470"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="390" y="490">{{ s.lblUplink }}</text>
        <line marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="415" x2="415" y1="408" y2="338"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="407" y="376">{{ s.lblBusUp }}</text>
        <path d="M 520 332 V 384 H 860 V 416" fill="none" marker-end="url(#iad-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="690" y="376">{{ s.lblJdbc }}</text>
        <!-- AI loop ③ ④ ⑤ -->
        <path d="M 1140 296 H 1168 V 246 H 760 V 264" fill="none" marker-end="url(#iad-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="964" y="238">{{ s.lblRead }}</text>
        <line marker-end="url(#iad-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="628" x2="614" y1="306"
              y2="306"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="620" y="250">{{ s.lblTool }}</text>
        <line marker-end="url(#iad-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="462" x2="462" y1="334"
              y2="406"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="470" y="376">{{ s.lblDown }}</text>
        <line marker-end="url(#iad-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="462" x2="462" y1="468"
              y2="498"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="470" y="488">{{ s.lblDispatch }}</text>
        <line marker-end="url(#iad-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="430" x2="430" y1="568"
              y2="606"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="438" y="594">{{ s.lblExec }}</text>

        <!-- clients -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="230"
              x="60" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="175" y="98">{{
            s.webName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="175" y="116">{{ s.webSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="215"
              x="310" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="412" y="98">{{
            s.cliName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="412" y="116">{{ s.cliSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="265"
              x="545" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="667" y="98">{{
            s.agentName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="667" y="116">{{ s.agentSub }}</text>

        <!-- gateway -->
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="750"
              x="60" y="174"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="435" y="198">{{
            s.gwName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="435" y="216">{{ s.gwSub }}</text>

        <!-- centers -->
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="176"
              x="60" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="148" y="294">auth
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="148" y="310">{{ s.authSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="148" y="324">:8300</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="176"
              x="246" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="334" y="294">manager
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="334" y="310">{{ s.mgrSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="334" y="324">:8400</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="176"
              x="432" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="520" y="294">data
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="520" y="310">{{ s.dataSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="520" y="324">:8500</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="182"
              x="628" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="719" y="294">agentic
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="719" y="310">{{ s.agSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="719" y="324">:8600</text>

        <!-- PostgreSQL -->
        <rect fill="var(--dc3-db-fill)" height="150" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="300"
              x="840" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="990" y="296">{{
            s.pgTitle
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="9" x="858" y="322">{{ s.pgL1 }}</text>
        <text fill="var(--dc3-db-text)" font-size="9" x="858" y="342">{{ s.pgL2 }}</text>
        <text fill="var(--dc3-db-text)" font-size="9" x="858" y="362">{{ s.pgL3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="858" y="386">dc3_auth · dc3_manager · dc3_data · dc3_agentic</text>
        <text fill="var(--dc3-db-stroke)" font-size="9" text-anchor="middle" x="990" y="408">{{ s.pgPort }}</text>

        <!-- bus -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="750"
              x="60" y="410"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="435" y="434">{{
            s.busName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="435" y="452">{{ s.busSub }}</text>

        <!-- drivers -->
        <rect fill="var(--dc3-amber-fill)" height="62" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="60" y="504"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="135" y="530">Modbus
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="135" y="548">{{ s.modbusSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="62" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="140" x="220" y="504"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="290" y="530">{{
            s.opcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="290" y="548">{{ s.opcSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="62" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="120" x="370" y="504"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="430" y="530">{{
            s.s7Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="430" y="548">{{ s.s7Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="62" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="120" x="500" y="504"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="560" y="530">{{
            s.mqttName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="560" y="548">{{ s.mqttSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="62" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="190"
              x="630" y="504"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="725" y="530">{{
            s.moreName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="725" y="548">{{ s.moreSub }}</text>

        <!-- devices -->
        <rect fill="var(--dc3-ext-fill)" height="58" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="750"
              x="60" y="610"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="435" y="636">{{
            s.devName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="435" y="654">{{ s.devSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="715">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="715">{{ s.legCenter }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="280" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="715">{{ s.legBus }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="400" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="715">{{ s.legDriver }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="490" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="512" y="715">{{ s.legDevice }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="620" y="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="642" y="715">{{ s.legStore }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,3" stroke-width="1" x1="720" x2="740" y1="712"
              y2="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="746" y="715">{{ s.legLoop }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="920" y="715">{{ s.legNum }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
