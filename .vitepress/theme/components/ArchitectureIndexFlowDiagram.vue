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
    aria: '系统架构核心拓扑：一个网关、四个中心、一条总线。北向三类调用方都只进网关 dc3-gateway :8000；网关把请求路由到鉴权、管理、数据、智能四个中心，中心之间以 gRPC facade 虚线互联、彼此不走 HTTP；一条 RabbitMQ 总线横贯全图，向上向数据中心投递位号值、向下向驱动分发命令；36 个协议驱动与现场设备在最底层，PostgreSQL 承载全部持久化',
    title: '一个网关 · 四个中心 · 一条总线 —— 北向唯一入口，中心 gRPC 互联，南向异步解耦',
    regionPlat: '平台层 · 网关 + 四中心（gRPC facade 互联 · tenantId 贯穿）',
    regionSouth: '南向 · 协议驱动与现场设备（驱动可贴近现场部署）',
    web: 'Web 控制台', webSub: ':8080',
    cli: 'dc3-cli', cliSub: 'HTTP',
    agent: 'AI Agent / MCP', agentSub: 'OAuth 2.1',
    gw: 'dc3-gateway :8000',
    gwSub: '唯一对外 HTTP 入口 · 路由 + 鉴权过滤 + HMAC 签名透传 + 限流',
    auth: '鉴权中心 auth', authSub: '认证 · 租户 · RBAC',
    mgr: '管理中心 manager', mgrSub: '驱动 / 模板 / 设备 / 位号',
    data: '数据中心 data', dataSub: '位号值 · 命令 · 告警',
    agentic: '智能中心 agentic', agenticSub: 'LLM 会话 · 工具调用',
    facadeChip: 'DC3_FACADE_MODE', facadeChipSub: 'grpc 分布式 / local 单体',
    bus: 'RabbitMQ 消息总线（一条总线，横贯南北）',
    busSub: 'dc3.e.value · dc3.e.point_command · result / event / notify · 持久投递 + 手动 ack + 死信',
    pg: 'PostgreSQL', pgSub: '+ TimescaleDB · 5 个 schema',
    drv1: 'Modbus TCP', drv1S: 'RTU / TCP 主站',
    drv2: 'OPC UA', drv2S: 'NodeId + 订阅',
    drv3: 'S7', drv3S: '西门子 PLC',
    drv4: 'MQTT', drv4S: '订阅被动接收',
    drv5: '+ 32 协议', drv5S: 'BACnet·SNMP·CoAP·DLMS…',
    dev: '现场设备 / 数据源',
    devSub: 'PLC · 传感器 · 电表 · 网关 · 智能硬件（36 个驱动归一为位号值）',
    p8300: ':8300', p8400: ':8400', p8500: ':8500', p8600: ':8600',
    grpc1: 'gRPC', grpc2: 'gRPC', grpc3: 'gRPC',
    cmdDown: 'point_command ▼', valUp: '▲ 消费位号值',
    upVal: '位号值 ▲', downCmd: '命令 ▼',
    jdbc: 'JDBC · 全部落库',
    io1: '轮询 / 写寄存器 ▼', io2: '▲ 读数上报',
    legClient: '调用方', legPlat: '网关 / 中心', legBus: '消息总线',
    legDb: '存储', legSouth: '驱动 / 设备',
    legGrpc: 'gRPC facade（虚线）', legAsync: '异步上下行（实线）'
  },
  en: {
    aria: 'Core architecture topology: one gateway, four centers, one bus. All northbound callers enter only dc3-gateway :8000; it routes to the auth, manager, data and agentic centers, which interconnect via dashed gRPC facades instead of HTTP; a single RabbitMQ bus spans the diagram, delivering point values up to the data center and commands down to drivers; 36 protocol drivers and field devices sit at the bottom, with PostgreSQL holding all persistence',
    title: 'One gateway · four centers · one bus — single northbound entry, gRPC between centers, async southbound',
    regionPlat: 'Platform · gateway + 4 centers (gRPC facade · tenantId throughout)',
    regionSouth: 'Southbound · protocol drivers & field devices (drivers can sit near the field)',
    web: 'Web console', webSub: ':8080',
    cli: 'dc3-cli', cliSub: 'HTTP',
    agent: 'AI Agent / MCP', agentSub: 'OAuth 2.1',
    gw: 'dc3-gateway :8000',
    gwSub: 'sole external HTTP entry · routing + auth filter + HMAC sign-through + rate limit',
    auth: 'Auth center', authSub: 'authn · tenant · RBAC',
    mgr: 'Manager center', mgrSub: 'driver / profile / device / point',
    data: 'Data center', dataSub: 'point value · command · alarm',
    agentic: 'Agentic center', agenticSub: 'LLM session · tool calls',
    facadeChip: 'DC3_FACADE_MODE', facadeChipSub: 'grpc distributed / local mono',
    bus: 'RabbitMQ message bus (the one bus, spanning north-south)',
    busSub: 'dc3.e.value · dc3.e.point_command · result / event / notify · persistent + manual ack + DLX',
    pg: 'PostgreSQL', pgSub: '+ TimescaleDB · 5 schemas',
    drv1: 'Modbus TCP', drv1S: 'RTU / TCP master',
    drv2: 'OPC UA', drv2S: 'NodeId + subscribe',
    drv3: 'S7', drv3S: 'Siemens PLC',
    drv4: 'MQTT', drv4S: 'passive subscribe',
    drv5: '+ 32 protocols', drv5S: 'BACnet·SNMP·CoAP·DLMS…',
    dev: 'Field devices / sources',
    devSub: 'PLC · sensor · meter · gateway (36 drivers normalize into point values)',
    p8300: ':8300', p8400: ':8400', p8500: ':8500', p8600: ':8600',
    grpc1: 'gRPC', grpc2: 'gRPC', grpc3: 'gRPC',
    cmdDown: 'point_command ▼', valUp: '▲ consume values',
    upVal: 'values ▲', downCmd: 'commands ▼',
    jdbc: 'JDBC · all persisted',
    io1: 'poll / write ▼', io2: '▲ readings',
    legClient: 'Callers', legPlat: 'Gateway / centers', legBus: 'Message bus',
    legDb: 'Storage', legSouth: 'Drivers / devices',
    legGrpc: 'gRPC facade (dashed)', legAsync: 'async up/down (solid)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 750">
        <defs>
          <marker id="aif-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="aif-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aif-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="680" y="48">{{
            s.title
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="990" x="220" y="160"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="234" y="180">{{ s.regionPlat }}</text>
        <rect fill="var(--dc3-region-amber)" height="190" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1000" x="60" y="510"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="74" y="530">{{ s.regionSouth }}</text>

        <!-- arrows -->
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="515" x2="515" y1="134"
              y2="166"/>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="680" x2="680" y1="134"
              y2="166"/>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="855" x2="855" y1="134"
              y2="166"/>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="330" x2="330" y1="228"
              y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="338" y="256">{{ s.p8300 }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="590" x2="590" y1="228"
              y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="598" y="256">{{ s.p8400 }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="850" x2="850" y1="228"
              y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="858" y="256">{{ s.p8500 }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1090" x2="1090" y1="228"
              y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1098" y="256">{{ s.p8600 }}</text>
        <!-- gRPC facade mesh -->
        <line marker-end="url(#aif-ah)" marker-start="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="0.9" x1="434" x2="486" y1="318" y2="318"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="460" y="310">{{ s.grpc1 }}</text>
        <line marker-end="url(#aif-ah)" marker-start="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="0.9" x1="694" x2="746" y1="318" y2="318"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="720" y="310">{{ s.grpc2 }}</text>
        <line marker-end="url(#aif-ah)" marker-start="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="0.9" x1="954" x2="986" y1="318" y2="318"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="970" y="310">{{ s.grpc3 }}</text>
        <!-- data center <-> bus -->
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="820" x2="820" y1="360"
              y2="426"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="828" y="400">{{ s.cmdDown }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="884" x2="884" y1="426"
              y2="360"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="892" y="384">{{ s.valUp }}</text>
        <!-- bus <-> drivers -->
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="300" x2="300" y1="536"
              y2="498"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="308" y="522">{{ s.upVal }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="470" x2="470" y1="498"
              y2="536"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="478" y="522">{{ s.downCmd }}</text>
        <!-- JDBC -->
        <path d="M 900 360 L 900 390 L 1206 390" fill="none" marker-end="url(#aif-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1000" y="382">{{ s.jdbc }}</text>
        <!-- drivers <-> devices -->
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="300" x2="300" y1="596"
              y2="646"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="308" y="628">{{ s.io1 }}</text>
        <line marker-end="url(#aif-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="765" x2="765" y1="646"
              y2="596"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="773" y="628">{{ s.io2 }}</text>

        <!-- clients -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="440" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="515" y="102">{{
            s.web
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="515" y="120">{{ s.webSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="130" x="615" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="680" y="102">{{
            s.cli
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="680" y="120">{{ s.cliSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="170" x="770" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="855" y="102">{{
            s.agent
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="855" y="120">{{ s.agentSub }}</text>

        <!-- gateway -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="880" x="240" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="680" y="194">{{
            s.gw
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="680" y="212">{{ s.gwSub }}</text>

        <!-- four centers -->
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="230" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="330" y="306">{{
            s.auth
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="330" y="324">{{ s.authSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="330" y="342">:8300 / gRPC 9300</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="490" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="590" y="306">{{
            s.mgr
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="590" y="324">{{ s.mgrSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="590" y="342">:8400 / gRPC 9400</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="200" x="750" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="850" y="306">{{
            s.data
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="850" y="324">{{ s.dataSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="850" y="342">:8500 / gRPC 9500</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="990" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1090" y="306">{{
            s.agentic
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1090" y="324">{{ s.agenticSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1090" y="342">:8600 · 无 gRPC 端口</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="130" x="1220" y="290"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="1285" y="312">{{
            s.facadeChip
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="1285" y="330">{{ s.facadeChipSub }}</text>

        <!-- the one bus -->
        <rect fill="var(--dc3-bus-fill)" height="64" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="1240" x="60" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="680" y="456">{{
            s.bus
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="680" y="476">{{ s.busSub }}</text>

        <!-- PostgreSQL -->
        <rect fill="var(--dc3-db-fill)" height="52" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="140" x="1210" y="366"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1280" y="388">{{
            s.pg
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="1280" y="406">{{ s.pgSub }}</text>

        <!-- drivers -->
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="110" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="195" y="560">{{
            s.drv1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="195" y="578">{{ s.drv1S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="300" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="385" y="560">{{
            s.drv2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="385" y="578">{{ s.drv2S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="490" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="575" y="560">{{
            s.drv3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="575" y="578">{{ s.drv3S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="680" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="765" y="560">{{
            s.drv4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="765" y="578">{{ s.drv4S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="870" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="955" y="560">{{
            s.drv5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="955" y="578">{{ s.drv5S }}</text>

        <!-- devices -->
        <rect fill="var(--dc3-ext-fill)" height="54" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="930" x="110" y="646"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="575" y="668">{{
            s.dev
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="575" y="686">{{ s.devSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="731">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="150" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="172" y="731">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="280" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="731">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="410" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="731">{{ s.legDb }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="510" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="532" y="731">{{ s.legSouth }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="660" x2="690" y1="727" y2="727"/>
        <text fill="var(--dc3-text2)" font-size="9" x="696" y="731">{{ s.legGrpc }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="830" x2="860" y1="727" y2="727"/>
        <text fill="var(--dc3-text2)" font-size="9" x="866" y="731">{{ s.legAsync }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
