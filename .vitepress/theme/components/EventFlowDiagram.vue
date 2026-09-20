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
    laneField: '现场与驱动 Field & Driver',
    laneBus: '消息总线 RabbitMQ',
    laneCenter: '数据中心 Center',
    laneStore: '存储 Storage',
    laneAlarm: '告警 Alarm',
    n1: '① 设备发生', n1Sub: '门被强行打开 DOOR_FORCED',
    n2: '② 驱动上报', n2Sub1: 'EventReportDTO', n2Sub2: 'recordId · eventCode · paramValues · occurTime',
    n3: '③ event 队列', n3Sub: '上行交换机',
    n4: '④ 数据中心接收', n4Sub1: '校验 eventCode 与级别', n4Sub2: '组装事件记录',
    n5: '⑤ dc3_event_history', n5Sub1: '原始流水 · 每次上报都记', n5Sub2: '≠ 告警 · 别混为一谈',
    diamond: '命中告警规则?',
    n6: '⑥ dc3_entity_alarm', n6Sub: '运行态告警 · 生成/更新',
    q: '⑦ 查询', qSub: 'get_by_record_id / list',
    lblOccur: '业务发生', lblReport: '上报', lblConsume: '消费',
    lblPersist: '落流水', lblRule: '规则引擎', lblYes: '[是] 命中',
    lblNo: '未命中 · 仅留流水', lblQuery: '查询',
    legLane: '泳道（参与方）', legUp: '上报链路（实线）', legHit: '命中 → 告警',
    legMiss: '未命中（虚线）', legStore: '存储',
    aria: '事件上报链路：设备发生离散业务事件后由驱动组装 EventReportDTO 经 event 队列上行；数据中心先把它落成 dc3_event_history 原始流水（每次上报都记），再提交告警规则引擎，命中规则才在 dc3_entity_alarm 生成或更新运行态告警，未命中仅保留流水'
  },
  en: {
    laneField: 'Field & Driver',
    laneBus: 'Message Bus (RabbitMQ)',
    laneCenter: 'Data Center',
    laneStore: 'Storage',
    laneAlarm: 'Alarm',
    n1: '(1) Device occurrence', n1Sub: 'door forced open DOOR_FORCED',
    n2: '(2) Driver reports', n2Sub1: 'EventReportDTO', n2Sub2: 'recordId · eventCode · paramValues · occurTime',
    n3: '(3) event queue', n3Sub: 'uplink exchange',
    n4: '(4) Data center receives', n4Sub1: 'validate eventCode & level', n4Sub2: 'assemble event record',
    n5: '(5) dc3_event_history', n5Sub1: 'raw history · every report stored', n5Sub2: '≠ alarm · do not conflate',
    diamond: 'rule hit?',
    n6: '(6) dc3_entity_alarm', n6Sub: 'runtime alarm · create/update',
    q: '(7) Query', qSub: 'get_by_record_id / list',
    lblOccur: 'occurrence', lblReport: 'report', lblConsume: 'consume',
    lblPersist: 'persist', lblRule: 'rule engine', lblYes: '[yes] hit',
    lblNo: 'miss · history only', lblQuery: 'query',
    legLane: 'swimlane (actor)', legUp: 'report path (solid)', legHit: 'hit → alarm',
    legMiss: 'miss (dashed)', legStore: 'storage',
    aria: 'Event reporting pipeline: after a discrete business occurrence the driver assembles an EventReportDTO and publishes through the event queue; the data center first persists it into dc3_event_history raw history (every report stored), then submits to the alarm rule engine — only a rule hit creates or updates a runtime alarm in dc3_entity_alarm; a miss leaves the history only'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 620">
        <defs>
          <marker id="evf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="evf-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="evf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#evf-grid)" height="100%" width="100%"/>

        <!-- swimlanes -->
        <rect fill="var(--dc3-region-amber)" height="440" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="250" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="42" y="88">{{ s.laneField }}</text>
        <rect fill="var(--dc3-region-amber)" height="440" rx="12" stroke="var(--dc3-bus-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="190" x="300" y="70"/>
        <text fill="var(--dc3-bus-stroke)" font-size="10" font-weight="600" x="312" y="88">{{ s.laneBus }}</text>
        <rect fill="var(--dc3-region-be)" height="440" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="230" x="510" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="522" y="88">{{ s.laneCenter }}</text>
        <rect fill="var(--dc3-region-be)" height="440" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="240" x="760" y="70"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="772" y="88">{{ s.laneStore }}</text>
        <rect fill="var(--dc3-region-be)" height="440" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="250" x="1020" y="70"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" x="1032" y="88">{{ s.laneAlarm }}</text>

        <!-- pipeline arrows -->
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="155" x2="155" y1="210" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="163" y="242">{{ s.lblOccur }}</text>
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="260" x2="316" y1="313" y2="313"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="288" y="303">{{ s.lblReport }}</text>
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="470" x2="526" y1="313" y2="313"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="498" y="303">{{ s.lblConsume }}</text>
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="720" x2="776" y1="313" y2="313"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="748" y="303">{{ s.lblPersist }}</text>
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="980" x2="1016" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="998" y="290">{{ s.lblRule }}</text>
        <!-- decision branches -->
        <line marker-end="url(#evf-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="1080" x2="1080"
              y1="332" y2="426"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="1090" y="360">{{ s.lblYes }}</text>
        <path d="M 1050 325 V 390 H 900 V 370" fill="none" marker-end="url(#evf-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="975" y="382">{{ s.lblNo }}</text>
        <!-- query arrow -->
        <line marker-end="url(#evf-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="880" x2="880" y1="366"
              y2="426"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="888" y="400">{{ s.lblQuery }}</text>

        <!-- nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="210"
              x="50" y="140"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="155" y="164">{{
            s.n1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="155" y="182">{{ s.n1Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="86" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="210" x="50" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="155" y="292">{{
            s.n2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="155" y="312">{{ s.n2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="155" y="330">{{ s.n2Sub2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="150"
              x="320" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="395" y="304">{{
            s.n3
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="395" y="322">{{ s.n3Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="86" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="530" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="625" y="292">{{
            s.n4
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="625" y="312">{{ s.n4Sub1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="625" y="330">{{ s.n4Sub2 }}</text>
        <rect fill="var(--dc3-db-fill)" height="86" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.2" width="200"
              x="780" y="280"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="880" y="304">{{
            s.n5
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="880" y="324">{{ s.n5Sub1 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="880" y="342">{{ s.n5Sub2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="60" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="180"
              x="1090" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1180" y="452">{{
            s.n6
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="1180" y="470">{{ s.n6Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="50" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="770" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="870" y="450">{{
            s.q
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="870" y="466">{{ s.qSub }}</text>

        <!-- decision diamond -->
        <polygon fill="var(--dc3-region-amber)" points="1080,268 1140,300 1080,332 1020,300"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="1080" y="304">{{
            s.diamond
          }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-region-be)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="42" y="554"/>
        <text fill="var(--dc3-text2)" font-size="9" x="64" y="563">{{ s.legLane }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="170" x2="190" y1="560" y2="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="196" y="563">{{ s.legUp }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="330" x2="350" y1="560" y2="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="356" y="563">{{ s.legHit }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.9" x1="490" x2="510" y1="560" y2="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="516" y="563">{{ s.legMiss }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="650" y="554"/>
        <text fill="var(--dc3-text2)" font-size="9" x="672" y="563">{{ s.legStore }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
