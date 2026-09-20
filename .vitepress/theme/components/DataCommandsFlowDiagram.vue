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
    aria: '数据流与命令流：数据流为设备经驱动、RabbitMQ 到数据中心落库后由你查询；命令流为你经网关提交到数据中心，经总线派发给驱动执行并回执终态，你以 commandId 轮询结果',
    readRegion: '数据流 Data Flow · 设备 → 你 · 已发生事实的查询（无副作用，可重试）',
    writeRegion: '命令流 Command Flow · 你 → 设备 · 异步有副作用，接口立即返回 commandId',
    devName: '现场设备',
    devSub: 'PLC · 传感 · 电表',
    drvName: '驱动 Driver',
    drvSub: 'dc3-driver-*',
    busName: 'RabbitMQ',
    busSubRead: 'dc3.e.value 交换机',
    busSubWrite: 'dc3.e.point_command',
    dataName: '数据中心',
    dataSub: 'dc3-center-data',
    dataPort: ':8500 · gRPC :9500',
    dataCmd: 'dc3_point_command_history',
    dataCmd2: 'PENDING 落库 · 终态回写',
    tsName: 'TimescaleDB',
    tsSub: 'dc3_point_value 超表',
    youName: '你 / Web / CLI',
    youSubRead: 'X-Auth-* 三件套',
    youSubWrite: 'POST write · /read',
    gwName: '网关 Gateway',
    gwSub: 'dc3-gateway :8000',
    pollName: '轮询 Poll',
    pollSub: 'get_by_command_id',
    eCollect: '协议采集 read',
    ePublish: 'PointValue 发布',
    eConsume: '消费',
    eStore: '批量写 · SQL 查询',
    eLatest: 'latest · /list',
    eRoute: 'HTTP 转发 · 鉴权',
    ePost: 'POST write · /read',
    ePending: '同步落库 PENDING',
    eSend: '发布',
    eQueue: 'dc3.q.point_command.{svc}',
    eExec: '执行 read()/write()',
    eResult: 'dc3.e.point_command_result · 经总线回执',
    ePollGet: 'GET',
    ePollQuery: 'point_command_history',
    legYou: '调用方（你）',
    legService: '中心服务 / 驱动',
    legBus: '消息总线',
    legDb: '数据存储',
    legDev: '现场设备',
    legPoll: '轮询路径（异步）',
    legBoth: '双端箭头 = 请求 / 响应'
  },
  en: {
    aria: 'Data flow and command flow: values travel device → driver → RabbitMQ → data center → TimescaleDB and are queried by you; commands travel you → gateway → data center (PENDING) → bus → driver → device, with a result receipt written back and polled by commandId',
    readRegion: 'Data Flow · device → you · querying facts that already happened (no side effects, retryable)',
    writeRegion: 'Command Flow · you → device · async with side effects, API returns a commandId immediately',
    devName: 'Field device',
    devSub: 'PLC · sensor · meter',
    drvName: 'Driver',
    drvSub: 'dc3-driver-*',
    busName: 'RabbitMQ',
    busSubRead: 'dc3.e.value exchange',
    busSubWrite: 'dc3.e.point_command',
    dataName: 'Data Center',
    dataSub: 'dc3-center-data',
    dataPort: ':8500 · gRPC :9500',
    dataCmd: 'dc3_point_command_history',
    dataCmd2: 'PENDING insert · final write-back',
    tsName: 'TimescaleDB',
    tsSub: 'dc3_point_value hypertable',
    youName: 'You / Web / CLI',
    youSubRead: 'X-Auth-* headers',
    youSubWrite: 'POST write · /read',
    gwName: 'Gateway',
    gwSub: 'dc3-gateway :8000',
    pollName: 'Poll',
    pollSub: 'get_by_command_id',
    eCollect: 'protocol read',
    ePublish: 'PointValue publish',
    eConsume: 'consume',
    eStore: 'batch write · SQL query',
    eLatest: 'latest · /list',
    eRoute: 'HTTP forward · auth',
    ePost: 'POST write · /read',
    ePending: 'sync insert PENDING',
    eSend: 'publish',
    eQueue: 'dc3.q.point_command.{svc}',
    eExec: 'exec read()/write()',
    eResult: 'dc3.e.point_command_result · receipt via bus',
    ePollGet: 'GET',
    ePollQuery: 'point_command_history',
    legYou: 'Caller (you)',
    legService: 'Services / drivers',
    legBus: 'Message bus',
    legDb: 'Data store',
    legDev: 'Field device',
    legPoll: 'Poll path (async)',
    legBoth: 'double arrow = request / response'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1200 672">
        <defs>
          <marker id="dcf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dcf-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dcf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dcf-grid)" height="100%" width="100%"/>

        <!-- regions: two swimlane bands -->
        <rect fill="var(--dc3-region-be)" height="262" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1120" x="40" y="44"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="62">{{ s.readRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="262" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1120" x="40" y="336"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="354">{{ s.writeRegion }}</text>

        <!-- ===== arrows: band A (data flow) ===== -->
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="220" x2="250" y1="116"
              y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="235" y="108">{{ s.eCollect }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="400" x2="430" y1="116"
              y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="415" y="108">{{ s.ePublish }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="580" x2="610" y1="116"
              y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="595" y="108">{{ s.eConsume }}</text>
        <line marker-end="url(#dcf-ah)" marker-start="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="760" x2="790" y1="116" y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="775" y="100">{{ s.eStore }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="220" x2="250" y1="220"
              y2="220"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="235" y="212">{{ s.eLatest }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="400" x2="610" y1="220"
              y2="220"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="505" y="212">{{ s.eRoute }}</text>

        <!-- ===== arrows: band B (command flow) ===== -->
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="220" x2="250" y1="408"
              y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="235" y="400">{{ s.ePost }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="400" x2="430" y1="408"
              y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="415" y="400">{{ s.ePending }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="580" x2="610" y1="408"
              y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="595" y="400">{{ s.eSend }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="760" x2="790" y1="408"
              y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="775" y="392">{{ s.eQueue }}</text>
        <line marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="940" x2="970" y1="408"
              y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="955" y="400">{{ s.eExec }}</text>
        <!-- result receipt: driver -> (via bus dot) -> data center, routed in the inter-row gutter -->
        <path d="M 865 436 V 470 H 580" fill="none" marker-end="url(#dcf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <circle cx="685" cy="470" fill="var(--dc3-bus-stroke)" r="3"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="722" y="462">{{ s.eResult }}</text>
        <!-- poll path: you -> gateway -> data center (async, dashed amber) -->
        <line marker-end="url(#dcf-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="220" x2="250" y1="512" y2="512"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="235" y="504">{{ s.ePollGet }}</text>
        <line marker-end="url(#dcf-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="400" x2="580" y1="512" y2="512"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="490" y="504">{{ s.ePollQuery }}</text>

        <!-- ===== band A nodes: row 1 (ingest) ===== -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="70" y="88"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="145"
              y="112">{{ s.devName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="145" y="130">{{ s.devSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="250" y="88"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="325"
              y="112">{{ s.drvName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="325" y="130">{{ s.drvSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="150"
              x="430" y="88"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="505"
              y="112">{{ s.busName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="505" y="130">{{ s.busSubRead }}</text>
        <rect fill="var(--dc3-be-fill)" height="156" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="150"
              x="610" y="88"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="685"
              y="152">{{ s.dataName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="685" y="172">{{ s.dataSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="685" y="190">{{ s.dataPort }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="150"
              x="790" y="88"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="12" font-weight="600" text-anchor="middle" x="865"
              y="112">{{ s.tsName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="865" y="130">{{ s.tsSub }}</text>

        <!-- ===== band A nodes: row 2 (query) ===== -->
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="70" y="196"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="145"
              y="217">{{ s.youName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="145" y="234">{{ s.youSubRead }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="250" y="196"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="325"
              y="217">{{ s.gwName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="325" y="234">{{ s.gwSub }}</text>

        <!-- ===== band B nodes: row 1 (dispatch) ===== -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="70" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="145"
              y="404">{{ s.youName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="145" y="422">{{ s.youSubWrite }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="250" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="325"
              y="404">{{ s.gwName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="325" y="422">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="156" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="150"
              x="430" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="505"
              y="444">{{ s.dataName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="505" y="464">{{ s.dataSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="505" y="482">{{ s.dataCmd }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="505" y="498">{{ s.dataCmd2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="150"
              x="610" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="685"
              y="404">{{ s.busName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="685" y="422">{{ s.busSubWrite }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="790" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="865"
              y="404">{{ s.drvName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="865" y="422">{{ s.drvSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="970" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1045"
              y="404">{{ s.devName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1045" y="422">{{ s.devSub }}</text>

        <!-- ===== band B nodes: row 2 (poll) ===== -->
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="70" y="488"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="145"
              y="509">{{ s.pollName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="145" y="526">{{ s.pollSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="250" y="488"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="325"
              y="509">{{ s.gwName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="325" y="526">{{ s.gwSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="637">{{ s.legYou }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="200" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="637">{{ s.legService }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="340" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="637">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="470" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="637">{{ s.legDb }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="600" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="637">{{ s.legDev }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3" stroke-width="1" x1="740" x2="758" y1="633"
              y2="633"/>
        <text fill="var(--dc3-text2)" font-size="9" x="764" y="637">{{ s.legPoll }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="930" y="637">{{ s.legBoth }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
