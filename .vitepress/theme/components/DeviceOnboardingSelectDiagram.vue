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
    aria: '按协议选驱动：设备协议决定驱动模块——工业总线与网络轮询类选 Modbus/OPC UA/S7/MQTT/HTTP 等对应驱动；外部系统主动推数据选反向监听的 listening-virtual；没有真实设备时先用 virtual 合成值跑通模板、设备、位号到数据可查的整条链路',
    diaQ: '设备说什么协议？',
    diaHint: '选错协议，模板位号都对不上',
    pullRegion: '平台主动读 · Pull（轮询采集）',
    pushRegion: '外部主动推 · Push（反向监听）',
    simRegion: '无设备先跑通 · Simulate',
    moreRegion: '长尾与桥接 · 更多协议',
    p1: 'Modbus TCP',
    p2: 'Modbus 串口 RTU',
    p3: 'OPC UA',
    p4: '西门子 S7 PLC',
    p5: 'MQTT 订阅 / 发布',
    p6: 'HTTP REST 拉取',
    d1: 'dc3-driver-modbus-tcp',
    d2: 'dc3-driver-modbus-rtu',
    d3: 'dc3-driver-opc-ua',
    d4: 'dc3-driver-plcs7',
    d5: 'dc3-driver-mqtt',
    d6: 'dc3-driver-http',
    pushName: '外部系统推送数据进平台',
    pushDrv: 'dc3-driver-listening-virtual',
    pushNote: 'TCP :6270 · UDP :6271 · 平台被动接收',
    simName: '验证模板 → 设备 → 位号 → 数据可查',
    simDrv: 'dc3-driver-virtual',
    simNote: '合成值 · 也是写新驱动的模板工程',
    more1Name: '工业与网络协议长尾',
    more1Drv: 'BACnet · IEC104 · SNMP · CoAP · CAN …',
    more1Note: '各自对应 dc3-driver-* 模块',
    more2Name: '数据库与计量桥接',
    more2Drv: 'SQL · ODBC · DLT645 · DLMS …',
    more2Note: '36 驱动全清单见驱动开发',
    ePull: '轮询采集 Pull',
    ePush: '设备 / 外部主动推 Push',
    eSim: '先跑通链路 Sim',
    eMore: '更多协议',
    pollNote: '轮询 · schedule() 周期采集',
    legPull: '轮询采集类驱动',
    legPush: '推送监听类驱动',
    legSim: '仿真验证（推荐起步）',
    legMore: '长尾 / 桥接',
    legDia: '决策'
  },
  en: {
    aria: 'Pick a driver by protocol: industrial bus and network polling map to the Modbus/OPC UA/S7/MQTT/HTTP drivers; systems that push data map to the reverse-listening listening-virtual driver; with no real device yet, start with virtual synthetic values to verify the profile → device → point → queryable-data chain',
    diaQ: 'what protocol?',
    diaHint: 'wrong protocol breaks profile & points',
    pullRegion: 'platform polls · Pull',
    pushRegion: 'external pushes · Push (reverse listen)',
    simRegion: 'no device yet · Simulate',
    moreRegion: 'long tail & bridges',
    p1: 'Modbus TCP',
    p2: 'Modbus serial RTU',
    p3: 'OPC UA',
    p4: 'Siemens S7 PLC',
    p5: 'MQTT pub / sub',
    p6: 'HTTP REST pull',
    d1: 'dc3-driver-modbus-tcp',
    d2: 'dc3-driver-modbus-rtu',
    d3: 'dc3-driver-opc-ua',
    d4: 'dc3-driver-plcs7',
    d5: 'dc3-driver-mqtt',
    d6: 'dc3-driver-http',
    pushName: 'external system pushes data in',
    pushDrv: 'dc3-driver-listening-virtual',
    pushNote: 'TCP :6270 · UDP :6271 · passive receive',
    simName: 'verify profile → device → point → data',
    simDrv: 'dc3-driver-virtual',
    simNote: 'synthetic values · template for new drivers',
    more1Name: 'industrial & network long tail',
    more1Drv: 'BACnet · IEC104 · SNMP · CoAP · CAN …',
    more1Note: 'each maps to a dc3-driver-* module',
    more2Name: 'database & metering bridges',
    more2Drv: 'SQL · ODBC · DLT645 · DLMS …',
    more2Note: 'full 36-driver list in driver docs',
    ePull: 'polling Pull',
    ePush: 'device pushes Push',
    eSim: 'simulate first',
    eMore: 'more protocols',
    pollNote: 'polling via schedule()',
    legPull: 'polling drivers',
    legPush: 'listening drivers',
    legSim: 'simulation (recommended start)',
    legMore: 'long tail / bridges',
    legDia: 'decision'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

// pull cards: [protocolKey, driverKey]
const PULL = [
  {p: 'p1', d: 'd1'}, {p: 'p2', d: 'd2'}, {p: 'p3', d: 'd3'},
  {p: 'p4', d: 'd4'}, {p: 'p5', d: 'd5'}, {p: 'p6', d: 'd6'}
] as const
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1380 760">
        <defs>
          <marker id="dos-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dos-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dos-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="560" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="470" y="80"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="482" y="98">{{ s.pullRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="240" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="410" x="910" y="80"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="922" y="98">{{ s.moreRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="130" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="410" x="910" y="360"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="922" y="378">{{ s.pushRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="110" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="410" x="910" y="530"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="922" y="548">{{ s.simRegion }}</text>

        <!-- decision -> pull region -->
        <line marker-end="url(#dos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="312" x2="470" y1="304"
              y2="210"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="391" y="248">{{ s.ePull }}</text>
        <!-- pull -> long tail -->
        <line marker-end="url(#dos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="870" x2="910" y1="200"
              y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="890" y="192">{{ s.eMore }}</text>
        <!-- decision -> push region (routed below the pull region) -->
        <path d="M 230 410 V 690 H 1355 V 425 H 1324" fill="none" marker-end="url(#dos-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="760" y="682">{{ s.ePush }}</text>
        <!-- trunk branch -> simulate region -->
        <path d="M 1150 690 V 646" fill="none" marker-end="url(#dos-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="1140" y="676">{{ s.eSim }}</text>

        <!-- decision diamond -->
        <polygon fill="var(--dc3-amber-fill)" points="230,250 350,330 230,410 110,330"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="230"
              y="326">{{ s.diaQ }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="230" y="344">{{ s.diaHint }}</text>

        <!-- pull cards -->
        <g v-for="(c, i) in PULL" :key="c.p">
          <rect :y="110 + i * 90" fill="var(--dc3-be-fill)" height="72" rx="8" stroke="var(--dc3-be-stroke)"
                stroke-width="1.5" width="360" x="490"/>
          <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
                x="670" :y="132 + i * 90">{{ s[c.p] }}
          </text>
          <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="670" :y="152 + i * 90">{{ s[c.d] }}
          </text>
          <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="670" :y="168 + i * 90">{{
              s.pollNote
            }}
          </text>
        </g>

        <!-- long tail cards -->
        <rect fill="var(--dc3-ext-fill)" height="80" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="370" x="930" y="116"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
              x="1115" y="140">{{ s.more1Name }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1115" y="160">{{ s.more1Drv }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1115" y="178">{{ s.more1Note }}</text>
        <rect fill="var(--dc3-ext-fill)" height="80" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="370" x="930" y="216"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
              x="1115" y="240">{{ s.more2Name }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1115" y="260">{{ s.more2Drv }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1115" y="278">{{ s.more2Note }}</text>

        <!-- push card -->
        <rect fill="var(--dc3-bus-fill)" height="72" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="370" x="930" y="396"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
              x="1115" y="418">{{ s.pushName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="1115" y="438">{{ s.pushDrv }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1115" y="456">{{ s.pushNote }}</text>

        <!-- simulate card -->
        <rect fill="var(--dc3-fe-fill)" height="66" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="2" width="370"
              x="930" y="562"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
              x="1115" y="584">{{ s.simName }}
        </text>
        <text fill="var(--dc3-fe-text)" font-size="9" text-anchor="middle" x="1115" y="604">{{ s.simDrv }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1115" y="620">{{ s.simNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="470" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="721">{{ s.legDia }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="580" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="602" y="721">{{ s.legPull }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="760" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="782" y="721">{{ s.legPush }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="940" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="962" y="721">{{ s.legSim }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="1130" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1152" y="721">{{ s.legMore }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
