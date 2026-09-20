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
    aria: '五类告警来源——规则引擎(0)、状态超时(1)、设备上报(2)、驱动上报(3)、事件上报(5)——全部写入统一的 dc3_entity_alarm 表，靠 alarm_source_flag 区分；同一张表经 source 参数过滤出驱动/设备/位号三个前端视图，并驱动通知链路；SYSTEM=4 为系统保留值，不属于五类来源',
    srcRegion: '五类来源 · AlarmSourceTypeEnum',
    ruleName: '规则引擎',
    ruleFlag: 'flag=0 RULE',
    ruleSub: 'dc3_rule 阈值 / 表达式命中',
    offlineName: '状态超时',
    offlineFlag: 'flag=1 STATE_TIMEOUT',
    offlineSub: 'dc3_entity_state 租约 + 心跳',
    devName: '设备上报',
    devFlag: 'flag=2 DEVICE_REPORT',
    devSub: '随 PointValue 内嵌故障信息',
    drvName: '驱动上报',
    drvFlag: 'flag=3 DRIVER_REPORT',
    drvSub: '驱动连接 / 协议异常',
    evtName: '事件上报',
    evtFlag: 'flag=5 EVENT_REPORT',
    evtSub: 'dc3_event_history 触发评估',
    sysName: 'SYSTEM=4 系统保留',
    sysSub: '不在五类实际来源 · 无生产路径',
    eaName: 'dc3_entity_alarm',
    eaSub: '统一运行告警表',
    eaSub2: 'alarm_source_flag 区分来源',
    idxLabel: '复合索引',
    idx1: 'idx_entity_alarm_source_time',
    idx1b: '(tenant, source, time DESC)',
    idx2: 'idx_entity_alarm_target',
    idx2b: '(tenant, target, entity, time DESC)',
    apiNote: 'POST /api/v3/data/dashboard/alert/page',
    vDrv: '驱动告警视图',
    vDrvSub: '/settings/alarm/driver · source=driver',
    vDev: '设备告警视图',
    vDevSub: '/settings/alarm/device · source=device',
    vPoint: '位号告警视图',
    vPointSub: '/settings/alarm/point · source=point',
    vNotify: '通知链路',
    vNotifySub: 'firing → email / SMS / webhook',
    w0: '写入 source=0',
    w1: '写入 source=1',
    w2: '写入 source=2',
    w3: '写入 source=3',
    w5: '写入 source=5',
    fDrv: '过滤 source=driver',
    fDev: '过滤 source=device',
    fPoint: '过滤 source=point',
    fNotify: '触发通知',
    legRule: '规则来源',
    legOffline: '状态来源',
    legDev: '设备来源',
    legDrv: '驱动来源',
    legEvt: '事件来源 / 前端视图',
    legDb: '统一告警表',
    legSys: '保留值（无路径）'
  },
  en: {
    aria: 'Five alarm sources — rule engine(0), state timeout(1), device report(2), driver report(3), event report(5) — all write the unified dc3_entity_alarm table distinguished by alarm_source_flag; the same table feeds the driver/device/point front-end views via the source parameter and drives notifications; SYSTEM=4 is a reserved value outside the five sources',
    srcRegion: 'Five sources · AlarmSourceTypeEnum',
    ruleName: 'rule engine',
    ruleFlag: 'flag=0 RULE',
    ruleSub: 'dc3_rule threshold / expression hit',
    offlineName: 'state timeout',
    offlineFlag: 'flag=1 STATE_TIMEOUT',
    offlineSub: 'dc3_entity_state lease + heartbeat',
    devName: 'device report',
    devFlag: 'flag=2 DEVICE_REPORT',
    devSub: 'fault payload with PointValue',
    drvName: 'driver report',
    drvFlag: 'flag=3 DRIVER_REPORT',
    drvSub: 'connection / protocol errors',
    evtName: 'event report',
    evtFlag: 'flag=5 EVENT_REPORT',
    evtSub: 'dc3_event_history triggers evaluation',
    sysName: 'SYSTEM=4 reserved',
    sysSub: 'not one of the five · no producer',
    eaName: 'dc3_entity_alarm',
    eaSub: 'unified runtime alarms',
    eaSub2: 'alarm_source_flag separates origin',
    idxLabel: 'composite indexes',
    idx1: 'idx_entity_alarm_source_time',
    idx1b: '(tenant, source, time DESC)',
    idx2: 'idx_entity_alarm_target',
    idx2b: '(tenant, target, entity, time DESC)',
    apiNote: 'POST /api/v3/data/dashboard/alert/page',
    vDrv: 'driver alarm view',
    vDrvSub: '/settings/alarm/driver · source=driver',
    vDev: 'device alarm view',
    vDevSub: '/settings/alarm/device · source=device',
    vPoint: 'point alarm view',
    vPointSub: '/settings/alarm/point · source=point',
    vNotify: 'notification pipeline',
    vNotifySub: 'firing → email / SMS / webhook',
    w0: 'write source=0',
    w1: 'write source=1',
    w2: 'write source=2',
    w3: 'write source=3',
    w5: 'write source=5',
    fDrv: 'filter source=driver',
    fDev: 'filter source=device',
    fPoint: 'filter source=point',
    fNotify: 'fires notify',
    legRule: 'rule source',
    legOffline: 'state source',
    legDev: 'device source',
    legDrv: 'driver source',
    legEvt: 'event source / views',
    legDb: 'unified alarm table',
    legSys: 'reserved (no path)'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

// source cards: [nameKey, flagKey, subKey, role, yCenter]
const SRC = [
  {n: 'ruleName', f: 'ruleFlag', sub: 'ruleSub', role: 'be', y: 135},
  {n: 'offlineName', f: 'offlineFlag', sub: 'offlineSub', role: 'amber', y: 225},
  {n: 'devName', f: 'devFlag', sub: 'devSub', role: 'ext', y: 315},
  {n: 'drvName', f: 'drvFlag', sub: 'drvSub', role: 'bus', y: 405},
  {n: 'evtName', f: 'evtFlag', sub: 'evtSub', role: 'fe', y: 495}
] as const
// write-arrow labels: dict key + y at x=395 (placed just above each line)
const WL = [
  {k: 'w0', y: 192}, {k: 'w1', y: 251}, {k: 'w2', y: 310}, {k: 'w3', y: 374}, {k: 'w5', y: 428}
] as const
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1260 690">
        <defs>
          <marker id="asf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="asf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#asf-grid)" height="100%" width="100%"/>

        <!-- region: five sources -->
        <rect fill="var(--dc3-region-amber)" height="470" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="310" x="40" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.srcRegion }}</text>

        <!-- write arrows: each source -> unified table left edge (staggered entry points) -->
        <line v-for="(src, i) in SRC" :key="'w' + i" marker-end="url(#asf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2" x1="326" :x2="470" :y1="src.y" :y2="270 + i * 25"/>
        <text v-for="l in WL" :key="'wl' + l.k" fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle"
              x="395" :y="l.y">{{ s[l.k] }}
        </text>

        <!-- fan-out arrows: table -> three views + notify -->
        <line marker-end="url(#asf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="900" y1="280"
              y2="151"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="800" y="206">{{ s.fDrv }}</text>
        <line marker-end="url(#asf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="900" y1="305"
              y2="251"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="800" y="272">{{ s.fDev }}</text>
        <line marker-end="url(#asf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="900" y1="330"
              y2="351"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="800" y="362">{{ s.fPoint }}</text>
        <line marker-end="url(#asf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="900" y1="355"
              y2="471"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="795" y="442">{{ s.fNotify }}</text>

        <!-- source cards -->
        <g v-for="src in SRC" :key="src.n">
          <rect :fill="`var(--dc3-${src.role}-fill)`" :stroke="`var(--dc3-${src.role}-stroke)`" :y="src.y - 35"
                height="70" rx="8" stroke-width="1.5" width="262" x="64"/>
          <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle"
                x="195" :y="src.y - 11">{{ s[src.n] }}
          </text>
          <text :fill="`var(--dc3-${src.role === 'ext' ? 'text2' : src.role + '-stroke'})`" font-size="8" font-style="italic"
                text-anchor="middle" x="195" :y="src.y + 7">{{ s[src.f] }}
          </text>
          <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="195" :y="src.y + 24">{{ s[src.sub] }}
          </text>
        </g>

        <!-- reserved value: grayed, deliberately unconnected -->
        <rect fill="var(--dc3-ext-fill)" height="44" rx="8" stroke="var(--dc3-ext-stroke)" stroke-dasharray="5,4"
              stroke-width="1" width="262" x="64" y="560"/>
        <text class="d-name" fill="var(--dc3-text2)" font-size="10.5" font-weight="600" text-anchor="middle" x="195"
              y="580">{{ s.sysName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="195" y="596">{{ s.sysSub }}</text>

        <!-- unified table cylinder -->
        <rect fill="var(--dc3-db-fill)" height="180" width="230" x="470" y="240"/>
        <ellipse cx="585" cy="240" fill="var(--dc3-db-fill)" rx="115" ry="14" stroke="var(--dc3-db-stroke)"
                 stroke-width="1.8"/>
        <path d="M470,240 V420" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.8"/>
        <path d="M700,240 V420" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.8"/>
        <ellipse cx="585" cy="420" fill="none" rx="115" ry="14" stroke="var(--dc3-db-stroke)" stroke-width="1.8"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="12" font-weight="600" text-anchor="middle" x="585"
              y="300">{{ s.eaName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="9.5" text-anchor="middle" x="585" y="322">{{ s.eaSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="585" y="342">{{ s.eaSub2 }}</text>
        <!-- composite indexes beneath the table -->
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="585" x2="585" y1="434" y2="444"/>
        <rect fill="var(--dc3-db-fill)" height="30" rx="6" stroke="var(--dc3-db-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="240" x="465" y="444"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="585" y="456">{{
            s.idx1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="585" y="468">{{ s.idx1b }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="585" x2="585" y1="474" y2="484"/>
        <rect fill="var(--dc3-db-fill)" height="30" rx="6" stroke="var(--dc3-db-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="240" x="465" y="484"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="585" y="496">{{
            s.idx2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="585" y="508">{{ s.idx2b }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" text-anchor="end" x="458" y="482">{{ s.idxLabel }}</text>

        <!-- views + notify, fed by one API -->
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1040" y="104">{{ s.apiNote }}</text>
        <rect fill="var(--dc3-fe-fill)" height="62" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="280" x="900" y="120"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1040"
              y="145">{{ s.vDrv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1040" y="165">{{ s.vDrvSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="62" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="280" x="900" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1040"
              y="245">{{ s.vDev }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1040" y="265">{{ s.vDevSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="62" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="280" x="900" y="320"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1040"
              y="345">{{ s.vPoint }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1040" y="365">{{ s.vPointSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="280" x="900" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1040"
              y="465">{{ s.vNotify }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1040" y="485">{{ s.vNotifySub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="641">{{ s.legRule }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="180" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="641">{{ s.legOffline }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="300" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="641">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="420" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="442" y="641">{{ s.legDrv }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="540" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="562" y="641">{{ s.legEvt }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="700" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="722" y="641">{{ s.legDb }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="16" x="850" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="872" y="641">{{ s.legSys }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
