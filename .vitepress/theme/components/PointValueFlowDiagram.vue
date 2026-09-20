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
    laneField: '现场层 Field',
    laneDriver: '驱动层 Driver',
    laneBus: '消息总线 RabbitMQ',
    laneCenter: '数据中心 Center',
    laneStore: '存储与查询 Store & Query',
    n1: '① 现场设备', n1Sub: '寄存器 / Topic',
    n1Val: 'rawValue = 6400（原码）',
    n2: '② 驱动采集 + 换算',
    n2Sub1: '工程值 = raw × multiple + base',
    n2Sub2: 'calValue 25.3℃ · numValue 25.3',
    n3: '③ point_value 队列', n3Sub: '上行交换机 · 按驱动分队',
    n4: '④ 数据中心消费', n4Sub: '校验 · 组装 PointValueBO',
    n5: '⑤ dc3_point_value 超表 hypertable',
    n5Sub1: 'append-only · 每次采集 INSERT 一行',
    n5Sub2: '按 create_time 1 天分片 + device_id 哈希分片',
    n5Sub3: '压缩与保留策略由 TimescaleDB 维护',
    q1: 'latest', q1Sub: '取最新一条',
    q2: 'list', q2Sub: '历史流水',
    q3: 'AVG/MIN/MAX', q3Sub: 'num_value 聚合',
    noteTitle: '只增不改 · 注意保留策略',
    noteL1: '当前值 = 按 device_id+point_id 取最新一条',
    noteL2: '180 天保留 · 超期自动清理，长期留存先归档',
    lblRead: '协议读取',
    lblUplink: '上行',
    lblConsume: '消费 · ack',
    lblInsert: 'INSERT 追加',
    lblQ1: '取最新', lblQ2: '查历史', lblQ3: '聚合',
    legLane: '泳道（参与方）', legUp: '采集上行（实线）', legQuery: '查询出口（实线）',
    legStore: '时序存储', legNote: '语义注记（虚线框）',
    aria: '位号值采集上行链路：驱动从设备读到原始值并按位号换算规则算出工程值与数值投影，经 RabbitMQ point_value 队列上行，数据中心消费后追加写入 TimescaleDB 超表；查询侧取最新一条、查历史流水或对 num_value 做聚合'
  },
  en: {
    laneField: 'Field Layer',
    laneDriver: 'Driver Layer',
    laneBus: 'Message Bus (RabbitMQ)',
    laneCenter: 'Data Center',
    laneStore: 'Store & Query',
    n1: '(1) Field device', n1Sub: 'register / topic',
    n1Val: 'rawValue = 6400 (raw)',
    n2: '(2) Driver collect + scale',
    n2Sub1: 'calValue = raw × multiple + base',
    n2Sub2: 'calValue 25.3°C · numValue 25.3',
    n3: '(3) point_value queue', n3Sub: 'uplink exchange · per driver',
    n4: '(4) Data center consume', n4Sub: 'validate · build PointValueBO',
    n5: '(5) dc3_point_value hypertable',
    n5Sub1: 'append-only · one INSERT per sample',
    n5Sub2: '1-day chunks by create_time + device_id hash',
    n5Sub3: 'compression & retention managed by TimescaleDB',
    q1: 'latest', q1Sub: 'newest row',
    q2: 'list', q2Sub: 'history',
    q3: 'AVG/MIN/MAX', q3Sub: 'num_value agg',
    noteTitle: 'append-only · mind retention',
    noteL1: 'current value = newest row per device_id+point_id',
    noteL2: '180-day retention · archive early if needed',
    lblRead: 'protocol read',
    lblUplink: 'uplink',
    lblConsume: 'consume · ack',
    lblInsert: 'INSERT append',
    lblQ1: 'newest', lblQ2: 'history', lblQ3: 'aggregate',
    legLane: 'swimlane (actor)', legUp: 'collect uplink (solid)', legQuery: 'query exit (solid)',
    legStore: 'time-series store', legNote: 'semantics note (dashed)',
    aria: 'Point value uplink pipeline: the driver reads a raw value from the device, scales it by the point rules into an engineering value plus numeric projection, publishes through the RabbitMQ point_value queue, and the data center appends it into the TimescaleDB hypertable; queries take the newest row, list history or aggregate over num_value'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 560">
        <defs>
          <marker id="pvf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="pvf-ah-db" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-db-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="pvf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#pvf-grid)" height="100%" width="100%"/>

        <!-- swimlanes -->
        <rect fill="var(--dc3-region-be)" height="430" rx="12" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="170" x="30" y="70"/>
        <text fill="var(--dc3-ext-stroke)" font-size="10" font-weight="600" x="42" y="88">{{ s.laneField }}</text>
        <rect fill="var(--dc3-region-amber)" height="430" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="230" x="220" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="232" y="88">{{ s.laneDriver }}</text>
        <rect fill="var(--dc3-region-amber)" height="430" rx="12" stroke="var(--dc3-bus-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="200" x="470" y="70"/>
        <text fill="var(--dc3-bus-stroke)" font-size="10" font-weight="600" x="482" y="88">{{ s.laneBus }}</text>
        <rect fill="var(--dc3-region-be)" height="430" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="210" x="690" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="702" y="88">{{ s.laneCenter }}</text>
        <rect fill="var(--dc3-region-be)" height="430" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="330" x="920" y="70"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="932" y="88">{{ s.laneStore }}</text>

        <!-- pipeline arrows -->
        <line marker-end="url(#pvf-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="184" x2="246" y1="183"
              y2="183"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="215" y="174">{{ s.lblRead }}</text>
        <line marker-end="url(#pvf-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="430" x2="496" y1="183"
              y2="183"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="463" y="174">{{ s.lblUplink }}</text>
        <line marker-end="url(#pvf-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="650" x2="716" y1="183"
              y2="183"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="683" y="174">{{ s.lblConsume }}</text>
        <line marker-end="url(#pvf-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="870" x2="946" y1="183"
              y2="183"/>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="908" y="174">{{ s.lblInsert }}</text>
        <!-- query arrows -->
        <line marker-end="url(#pvf-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="994" x2="994" y1="236"
              y2="326"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="1000" y="286">{{ s.lblQ1 }}</text>
        <line marker-end="url(#pvf-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="1092" x2="1092" y1="236"
              y2="326"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="1098" y="286">{{ s.lblQ2 }}</text>
        <line marker-end="url(#pvf-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="1190" x2="1190" y1="236"
              y2="326"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="1196" y="286">{{ s.lblQ3 }}</text>

        <!-- nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="140"
              x="44" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="114" y="172">{{
            s.n1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="114" y="190">{{ s.n1Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="114" y="206">{{ s.n1Val }}</text>
        <rect fill="var(--dc3-amber-fill)" height="86" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="250" y="140"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="340" y="164">{{
            s.n2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="340" y="184">{{ s.n2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="340" y="202">{{ s.n2Sub2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="150"
              x="500" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="575" y="172">{{
            s.n3
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="575" y="190">{{ s.n3Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="720" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="795" y="172">{{
            s.n4
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="795" y="190">{{ s.n4Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="116" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.2"
              width="280" x="950" y="120"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1090" y="146">{{
            s.n5
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="962" y="168">{{ s.n5Sub1 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="962" y="188">{{ s.n5Sub2 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="962" y="208">{{ s.n5Sub3 }}</text>

        <!-- query chips -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="88"
              x="950" y="328"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="994" y="350">{{
            s.q1
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="994" y="368">{{ s.q1Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="88"
              x="1048" y="328"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1092" y="350">{{
            s.q2
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1092" y="368">{{ s.q2Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="92"
              x="1144" y="328"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1190" y="350">{{
            s.q3
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1190" y="368">{{ s.q3Sub }}</text>

        <!-- semantics note -->
        <rect fill="none" height="86" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="180" x="705" y="314"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="716" y="334">{{ s.noteTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="716" y="354">{{ s.noteL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="716" y="374">{{ s.noteL2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-region-be)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="42" y="524"/>
        <text fill="var(--dc3-text2)" font-size="9" x="64" y="533">{{ s.legLane }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="170" x2="190" y1="530" y2="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="196" y="533">{{ s.legUp }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="330" x2="350" y1="530" y2="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="356" y="533">{{ s.legQuery }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="500" y="524"/>
        <text fill="var(--dc3-text2)" font-size="9" x="522" y="533">{{ s.legStore }}</text>
        <rect fill="none" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2" stroke-width="1"
              width="16" x="640" y="524"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="533">{{ s.legNote }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
