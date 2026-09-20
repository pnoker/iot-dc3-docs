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
    aria: '数据平面：位号值从设备经驱动、RabbitMQ 值通道、数据中心消费与批处理，最终写入 TimescaleDB 超表并更新缓存与告警的每一跳',
    drvRegion: '驱动层 Driver · 周期采集并归一',
    busRegion: 'RabbitMQ 值通道',
    dcRegion: '数据中心 dc3-center-data · 消费与落库',
    storeRegion: '存储与衍生消费',
    devName: '现场设备', devSub: 'PLC · 传感器 · 电表 · 仪表',
    metaName: 'DriverMetadata', metaSub: '注入 driverId · tenantId',
    pvName: 'PointValue', pvSub1: '发送载荷 · createTime', pvSub2: 'raw / cal / num 三值',
    senderName: 'DriverSenderService', senderSub: 'pointValueSender()',
    exName: '值交换机 dc3.e.value', exSub: 'topic · 消息强制 PERSISTENT',
    qName: '位号队列 dc3.q.value.point', qSub1: 'durable · TTL 7 天', qSub2: '通配收全部驱动实例',
    deadName: '死信 DLX dc3.e.point_value_dead', deadSub: '死信队列 dc3.q.point_value_dead · 排障用',
    rcvName: 'PointValueReceiver', rcvSub1: '@RabbitListener', rcvSub2: '手动 ack · 并发 2-8',
    rateName: '入站速率', rateSub: 'speed = count / interval',
    saveName: 'save()', saveSub: 'PointValueServiceImpl',
    saveStep1: '① put 缓存', saveStep2: '② insert 超表', saveStep3: '③ 告警评估',
    jobName: 'PointValueJob', jobSub: 'Quartz 定时批量刷出',
    cacheName: 'Caffeine 最新值缓存',
    cacheSub1: 'key: 前缀.tenant.device.point',
    cacheSub2: '写路径同步 put · 读路径先查',
    tsName: 'TimescaleDB 超表',
    tsL1: 'dc3_history.dc3_point_value',
    tsL2: 'chunk: create_time 每 1 天',
    tsL3: '哈希分区: device_id × 16',
    tsL4: '压缩 7 天 · 保留 180 天',
    tsL5: 'num_value 可空',
    tsL6: '聚合须 IS NOT NULL',
    alarmName: '告警规则引擎',
    alarmSub1: 'alarmRuleTriggerService',
    alarmSub2: '.processPointValue()',
    alarmSub3: '落库后同步评估',
    a1: '采集 read()',
    a2: '注入 driverId · tenantId',
    a3: 'pointValueSender()',
    a4a: '异步发布', a4b: 'confirm 回执',
    a5: 'bind dc3.r.value.point.*',
    a6: 'TTL 7d · reject',
    a7: '校验失败 reject → 死信',
    a8a: 'consume · 手动 ack', a8b: 'JSON → PointValueBO',
    a9: '校验通过', a10: '即时', a11: '≥ 100 缓冲', a12: 'flush',
    a13: 'JDBC INSERT', a13b: 'create_time=采集 · operate_time=落库',
    a14: 'put 最新值', a15: '同步评估告警',
    legDev: '现场设备', legSvc: '中心服务', legBus: '消息总线', legDb: '时序库',
    legAmb: '缓存 / 告警', legDead: '死信 / 异常',
    legFlow: '主数据流', legDeadFlow: '死信流'
  },
  en: {
    aria: 'Data plane: every hop of a point value from device through driver, RabbitMQ value channel, data-center consumption and batching, into the TimescaleDB hypertable with cache and alarm fan-out',
    drvRegion: 'Driver Layer · periodic collect & normalize',
    busRegion: 'RabbitMQ value channel',
    dcRegion: 'Data Center dc3-center-data · consume & persist',
    storeRegion: 'Storage & derived consumers',
    devName: 'Field Devices', devSub: 'PLC · Sensor · Meter · Gauge',
    metaName: 'DriverMetadata', metaSub: 'inject driverId · tenantId',
    pvName: 'PointValue', pvSub1: 'payload · createTime', pvSub2: 'raw / cal / num values',
    senderName: 'DriverSenderService', senderSub: 'pointValueSender()',
    exName: 'value exchange dc3.e.value', exSub: 'topic · PERSISTENT delivery',
    qName: 'point queue dc3.q.value.point', qSub1: 'durable · TTL 7 days', qSub2: 'wildcard binds all drivers',
    deadName: 'DLX dc3.e.point_value_dead', deadSub: 'dead queue dc3.q.point_value_dead · for triage',
    rcvName: 'PointValueReceiver', rcvSub1: '@RabbitListener', rcvSub2: 'manual ack · concurrency 2-8',
    rateName: 'inbound rate', rateSub: 'speed = count / interval',
    saveName: 'save()', saveSub: 'PointValueServiceImpl',
    saveStep1: '① put cache', saveStep2: '② insert hypertable', saveStep3: '③ alarm eval',
    jobName: 'PointValueJob', jobSub: 'Quartz scheduled batch flush',
    cacheName: 'Caffeine latest-value cache',
    cacheSub1: 'key: prefix.tenant.device.point',
    cacheSub2: 'put on write · hit-first on read',
    tsName: 'TimescaleDB hypertable',
    tsL1: 'dc3_history.dc3_point_value',
    tsL2: 'chunk: create_time per 1 day',
    tsL3: 'hash dimension: device_id × 16',
    tsL4: 'compress 7d · retain 180d',
    tsL5: 'num_value nullable',
    tsL6: 'aggregate needs IS NOT NULL',
    alarmName: 'Alarm Rule Engine',
    alarmSub1: 'alarmRuleTriggerService',
    alarmSub2: '.processPointValue()',
    alarmSub3: 'synchronous after save',
    a1: 'read() collect',
    a2: 'inject driverId · tenantId',
    a3: 'pointValueSender()',
    a4a: 'async publish', a4b: 'confirm callback',
    a5: 'bind dc3.r.value.point.*',
    a6: 'TTL 7d · reject',
    a7: 'invalid → reject to DLX',
    a8a: 'consume · manual ack', a8b: 'JSON → PointValueBO',
    a9: 'validated', a10: 'direct', a11: '≥ 100 buffer', a12: 'flush',
    a13: 'JDBC INSERT', a13b: 'create_time=acquired · operate_time=persisted',
    a14: 'put latest', a15: 'evaluate alarms',
    legDev: 'Field device', legSvc: 'Center service', legBus: 'Message bus', legDb: 'Time-series DB',
    legAmb: 'Cache / alarm', legDead: 'Dead letter / error',
    legFlow: 'Data flow', legDeadFlow: 'Dead-letter flow'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 700">
        <defs>
          <marker id="dp-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="dp-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dp-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dp-grid)" height="100%" width="100%"/>

        <!-- semantic regions -->
        <rect fill="var(--dc3-region-be)" height="132" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="470" x="248" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="260" y="82">{{ s.drvRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="258" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="240" x="744" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="756" y="82">{{ s.busRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="246" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="470" x="248" y="380"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="260" y="398">{{ s.dcRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="560" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="200" x="1016" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="1028" y="82">{{ s.storeRegion }}</text>

        <!-- arrows (drawn before nodes so they never cross a box) -->
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="184" x2="262" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="224" y="146">{{ s.a1 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="398" x2="416" y1="135" y2="135"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="407" y="190">{{ s.a2 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="554" x2="572" y1="135" y2="135"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="563" y="190">{{ s.a3 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="696" x2="762" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="729" y="120">{{ s.a4a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="729" y="152">{{ s.a4b }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="864" x2="864" y1="152" y2="174"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="872" y="168">{{ s.a5 }}</text>
        <path d="M864,246 L864,338" fill="none" marker-end="url(#dp-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="872" y="296">{{ s.a6 }}</text>
        <path d="M368,420 L368,372 L760,372" fill="none" marker-end="url(#dp-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="560" y="366">{{ s.a7 }}</text>
        <path d="M762,224 L730,224 L300,224 L300,418" fill="none" marker-end="url(#dp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="545" y="214">{{ s.a8a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="545" y="236">{{ s.a8b }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="404" x2="442" y1="468" y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="423" y="458">{{ s.a9 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="574" x2="598" y1="460" y2="460"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="586" y="450">{{ s.a10 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="509" x2="509" y1="488" y2="540"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="520" y="516">{{ s.a11 }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="574" x2="598" y1="574" y2="574"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="586" y="564">{{ s.a12 }}</text>
        <path d="M710,455 L1006,455 L1006,150 L1028,150" fill="none" marker-end="url(#dp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="855" y="447">{{ s.a14 }}</text>
        <path d="M710,480 L1116,480 L1116,422" fill="none" marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="890" y="472">{{ s.a13 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="890" y="496">{{ s.a13b }}</text>
        <path d="M710,570 L1028,570" fill="none" marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="860" y="562">{{ s.a15 }}</text>

        <!-- band 1: field device -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="160"
              x="24" y="98"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" text-anchor="middle" x="104" y="126">
          {{ s.devName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="104" y="146">{{ s.devSub }}</text>

        <!-- band 1: driver layer nodes -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="134"
              x="264" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="331" y="128">
          {{ s.metaName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="331" y="148">{{ s.metaSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="136"
              x="418" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="486" y="128">
          {{ s.pvName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="486" y="146">{{ s.pvSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="486" y="160">{{ s.pvSub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="122"
              x="574" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="635" y="128">
          {{ s.senderName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="635" y="148">{{ s.senderSub }}</text>

        <!-- bus nodes -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="200"
              x="764" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="864" y="120">
          {{ s.exName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="864" y="138">{{ s.exSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="200"
              x="764" y="176"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="864" y="200">
          {{ s.qName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="864" y="218">{{ s.qSub1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="864" y="234">{{ s.qSub2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="200" x="764" y="340"/>
        <text class="d-name" fill="var(--dc3-rose-stroke)" font-size="9.5" text-anchor="middle" x="864" y="364">
          {{ s.deadName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="864" y="382">{{ s.deadSub }}</text>

        <!-- data center nodes -->
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="264" y="420"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="334" y="446">
          {{ s.rcvName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="334" y="464">{{ s.rcvSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="334" y="478">{{ s.rcvSub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="444" y="432"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="509" y="452">
          {{ s.rateName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="509" y="470">{{ s.rateSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="186" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="110"
              x="600" y="420"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="655" y="444">
          {{ s.saveName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="655" y="460">{{ s.saveSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="655" y="494">{{ s.saveStep1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="655" y="518">{{ s.saveStep2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="655" y="542">{{ s.saveStep3 }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="444" y="542"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="509" y="566">
          {{ s.jobName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="509" y="584">{{ s.jobSub }}</text>

        <!-- storage column -->
        <rect fill="var(--dc3-amber-fill)" height="120" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="172" x="1030" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1116" y="120">
          {{ s.cacheName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="146">{{ s.cacheSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="164">{{ s.cacheSub2 }}</text>
        <rect fill="var(--dc3-db-fill)" height="180" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="172"
              x="1030" y="240"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1116" y="264">
          {{ s.tsName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="1116" y="292">{{ s.tsL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="316">{{ s.tsL2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="332">{{ s.tsL3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="356">{{ s.tsL4 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1116" y="384">{{ s.tsL5 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1116" y="398">{{ s.tsL6 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="110" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="172" x="1030" y="500"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1116" y="524">
          {{ s.alarmName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="550">{{ s.alarmSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="564">{{ s.alarmSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1116" y="578">{{ s.alarmSub3 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="24" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="677">{{ s.legDev }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="140" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="162" y="677">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="256" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="677">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="372" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="394" y="677">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="488" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="510" y="677">{{ s.legAmb }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="620" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="642" y="677">{{ s.legDead }}</text>
        <line marker-end="url(#dp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="740" x2="768" y1="674"
              y2="674"/>
        <text fill="var(--dc3-text2)" font-size="9" x="774" y="677">{{ s.legFlow }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="880" x2="908" y1="674"
              y2="674"/>
        <text fill="var(--dc3-text2)" font-size="9" x="914" y="677">{{ s.legDeadFlow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
