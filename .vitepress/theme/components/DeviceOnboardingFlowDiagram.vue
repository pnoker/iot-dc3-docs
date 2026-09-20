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
    aria: '设备接入的两条线：控制面上按第 0 到 5 步完成驱动注册、建模板、建位号、建设备、填属性配置并启用；数据面上设备值经驱动与 RabbitMQ 进数据中心落库，你经网关查询最新位号值——查到值即接入成功',
    ctlRegion: '控制面 Control Plane · dc3-center-manager（经网关 :8000，第 0–5 步）',
    dataRegion: '数据面 Data Plane · 值的路径（采集 → 落库 → 可查）',
    s0: '启动并注册驱动',
    s0a: 'DriverInitRunner',
    s0b: '注册 → initial → schedule',
    s1: '建模板 Profile',
    s1a: 'POST /manager/profile/add',
    s1b: 'profileName · shareFlag',
    s2: '建位号 Point',
    s2a: 'POST /manager/point/add',
    s2b: 'pointTypeFlag · rwFlag',
    s3: '建设备 Device',
    s3a: 'POST /manager/device/add',
    s3b: 'driverId + profileId',
    s4: '填属性配置 Config',
    s4a: 'point_attribute_config/add',
    s4b: 'attributeId + configValue',
    s5: '启用并验证',
    s5a: 'enableFlag = true',
    s5b: '等一个采集周期',
    e1: '属性定义就绪',
    e2: 'profileId',
    e3: 'pointId',
    e4: 'deviceId',
    e5: 'configValue',
    regFlow: 'RegisterBO · gRPC（指数退避重试）',
    metaFlow: 'DriverMetadataListener 元数据事件',
    devName: '现场设备',
    devA: 'PLC · 仪表 · 传感器',
    devB: '或 virtual 合成值',
    drvName: '驱动 dc3-driver-*',
    drvA: '按协议采集',
    drvB: '归一成 PointValue',
    mqName: 'RabbitMQ',
    mqA: 'dc3.e.value',
    mqB: '交换机路由',
    dcName: '数据中心',
    dcA: 'dc3-center-data',
    dcB: '校验 · 批量入库',
    tsName: 'TimescaleDB',
    tsA: 'dc3_point_value',
    tsB: '时序超表',
    youName: '你 / Web / CLI',
    youA: 'curl · X-Auth-*',
    gwName: '网关 :8000',
    gwA: 'dc3-gateway 统一入口',
    okName: '接入成功判据',
    okA: 'latest 返回这台设备的位号值 = 链路打通',
    d1: '协议读',
    d2: 'PointValue',
    d3: '消费',
    d4: '批量写',
    d5: 'POST latest',
    d6: '鉴权转发',
    d7: '有值 ✓ · 无值按链路反向排查',
    legSvc: '中心服务 / 驱动',
    legBus: '消息总线',
    legDb: '数据存储',
    legDev: '现场设备',
    legYou: '调用方（你）',
    legOk: '判据 / 元数据事件',
    legReg: '驱动注册流（gRPC）'
  },
  en: {
    aria: 'Onboarding has two planes: on the control plane steps 0–5 register the driver, create profile, point, device, per-device attribute configs and enable; on the data plane values flow device → driver → RabbitMQ → data center → storage, and you query the latest values through the gateway — seeing values means onboarded',
    ctlRegion: 'Control Plane · dc3-center-manager (via gateway :8000, steps 0–5)',
    dataRegion: 'Data Plane · the path of a value (collect → store → query)',
    s0: 'start & register driver',
    s0a: 'DriverInitRunner',
    s0b: 'register → initial → schedule',
    s1: 'create Profile',
    s1a: 'POST /manager/profile/add',
    s1b: 'profileName · shareFlag',
    s2: 'create Point',
    s2a: 'POST /manager/point/add',
    s2b: 'pointTypeFlag · rwFlag',
    s3: 'create Device',
    s3a: 'POST /manager/device/add',
    s3b: 'driverId + profileId',
    s4: 'fill Config values',
    s4a: 'point_attribute_config/add',
    s4b: 'attributeId + configValue',
    s5: 'enable & verify',
    s5a: 'enableFlag = true',
    s5b: 'wait one collect cycle',
    e1: 'attributes ready',
    e2: 'profileId',
    e3: 'pointId',
    e4: 'deviceId',
    e5: 'configValue',
    regFlow: 'RegisterBO · gRPC (backoff retry)',
    metaFlow: 'DriverMetadataListener metadata events',
    devName: 'field device',
    devA: 'PLC · meter · sensor',
    devB: 'or virtual synth values',
    drvName: 'driver dc3-driver-*',
    drvA: 'polls by protocol',
    drvB: 'normalizes PointValue',
    mqName: 'RabbitMQ',
    mqA: 'dc3.e.value',
    mqB: 'exchange routing',
    dcName: 'Data Center',
    dcA: 'dc3-center-data',
    dcB: 'validate · batch insert',
    tsName: 'TimescaleDB',
    tsA: 'dc3_point_value',
    tsB: 'time-series hypertable',
    youName: 'you / Web / CLI',
    youA: 'curl · X-Auth-*',
    gwName: 'gateway :8000',
    gwA: 'dc3-gateway single entry',
    okName: 'onboarding success check',
    okA: 'latest returns this device’s point values = link works',
    d1: 'protocol read',
    d2: 'PointValue',
    d3: 'consume',
    d4: 'batch write',
    d5: 'POST latest',
    d6: 'auth forward',
    d7: 'values ✓ · else trace the chain backwards',
    legSvc: 'services / drivers',
    legBus: 'message bus',
    legDb: 'data store',
    legDev: 'field device',
    legYou: 'caller (you)',
    legOk: 'verdict / metadata events',
    legReg: 'driver registration (gRPC)'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

// control-plane steps: [title, sub1, sub2, x]
const STEPS = [
  {t: 's0', a: 's0a', b: 's0b', x: 55},
  {t: 's1', a: 's1a', b: 's1b', x: 265},
  {t: 's2', a: 's2a', b: 's2b', x: 475},
  {t: 's3', a: 's3a', b: 's3b', x: 685},
  {t: 's4', a: 's4a', b: 's4b', x: 895},
  {t: 's5', a: 's5a', b: 's5b', x: 1105}
] as const
// arrows between steps: [labelKey, centerX]
const STEP_EDGES = [
  {k: 'e1', x: 240}, {k: 'e2', x: 450}, {k: 'e3', x: 650}, {k: 'e4', x: 850}, {k: 'e5', x: 1080}
] as const
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 680">
        <defs>
          <marker id="dof-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dof-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dof-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dof-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dof-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="44"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="62">{{ s.ctlRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="300" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="300"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="318">{{ s.dataRegion }}</text>

        <!-- driver registration: driver (data plane) -> step 0 (rose, dashed) -->
        <path d="M 400 360 V 200 H 135 V 172" fill="none" marker-end="url(#dof-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="268" y="194">{{ s.regFlow }}</text>
        <!-- metadata events: step 3 -> driver (amber, dashed) -->
        <path d="M 765 168 V 290 H 450 V 356" fill="none" marker-end="url(#dof-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="610" y="284">{{ s.metaFlow }}
        </text>

        <!-- control-plane step arrows (labels float above the node tops) -->
        <g v-for="e in STEP_EDGES" :key="e.k">
          <line :x1="e.x - 25" :x2="e.x + 25" marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
                y1="134" y2="134"/>
          <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" :x="e.x" y="94">{{ s[e.k] }}</text>
        </g>

        <!-- data-plane main row arrows -->
        <line marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="250" x2="310" y1="392"
              y2="392"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="280" y="384">{{ s.d1 }}</text>
        <line marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="490" x2="550" y1="392"
              y2="392"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="520" y="384">{{ s.d2 }}</text>
        <line marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="730" x2="790" y1="392"
              y2="392"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="760" y="384">{{ s.d3 }}</text>
        <line marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="970" x2="1030" y1="392"
              y2="392"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1000" y="384">{{ s.d4 }}</text>
        <!-- verify row arrows -->
        <line marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="220" x2="310" y1="518"
              y2="518"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="265" y="510">{{ s.d5 }}</text>
        <path d="M 400 490 V 456 H 880 V 428" fill="none" marker-end="url(#dof-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="640" y="450">{{ s.d6 }}</text>
        <line marker-end="url(#dof-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="490" x2="840" y1="518" y2="518"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="665" y="510">{{ s.d7 }}</text>

        <!-- control-plane steps -->
        <g v-for="(st, i) in STEPS" :key="st.t">
          <rect :fill="i === 5 ? 'var(--dc3-amber-fill)' : 'var(--dc3-be-fill)'"
                :stroke="i === 5 ? 'var(--dc3-amber-stroke)' : 'var(--dc3-be-stroke)'" :x="st.x" height="68" rx="8"
                stroke-width="1.5" width="160" y="100"/>
          <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle"
                :x="st.x + 80" y="124">{{ s[st.t] }}
          </text>
          <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" :x="st.x + 80" y="142">{{ s[st.a] }}
          </text>
          <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" :x="st.x + 80" y="156">{{ s[st.b] }}
          </text>
          <text :fill="i === 5 ? 'var(--dc3-amber-stroke)' : 'var(--dc3-be-stroke)'" font-size="9" font-weight="700"
                :x="st.x + 10" y="94">{{ i }}
          </text>
        </g>

        <!-- data-plane main row -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="180" x="70" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="160"
              y="384">{{ s.devName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="160" y="402">{{ s.devA }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="160" y="416">{{ s.devB }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="180" x="310" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="400"
              y="384">{{ s.drvName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="400" y="402">{{ s.drvA }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="400" y="416">{{ s.drvB }}</text>
        <rect fill="var(--dc3-bus-fill)" height="64" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="180" x="550" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="640"
              y="384">{{ s.mqName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="402">{{ s.mqA }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="416">{{ s.mqB }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="180" x="790" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="880"
              y="384">{{ s.dcName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="880" y="402">{{ s.dcA }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="880" y="416">{{ s.dcB }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="8" stroke="var(--dc3-db-stroke)" stroke-width="1.5"
              width="190" x="1030" y="360"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="11.5" font-weight="600" text-anchor="middle"
              x="1125" y="384">{{ s.tsName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1125" y="402">{{ s.tsA }}</text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1125" y="416">{{ s.tsB }}</text>

        <!-- verify row -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="150" x="70" y="490"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="145"
              y="514">{{ s.youName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="145" y="532">{{ s.youA }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="180" x="310" y="490"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="400"
              y="514">{{ s.gwName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="400" y="532">{{ s.gwA }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="380" x="840" y="490"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1030"
              y="514">{{ s.okName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1030" y="532">{{ s.okA }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="641">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="220" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="242" y="641">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="350" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="372" y="641">{{ s.legDb }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="480" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="641">{{ s.legDev }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="610" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="632" y="641">{{ s.legYou }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3" stroke-width="1" x1="750" x2="768" y1="637"
              y2="637"/>
        <text fill="var(--dc3-text2)" font-size="9" x="774" y="641">{{ s.legOk }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="1" x1="950" x2="968" y1="637"
              y2="637"/>
        <text fill="var(--dc3-text2)" font-size="9" x="974" y="641">{{ s.legReg }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
