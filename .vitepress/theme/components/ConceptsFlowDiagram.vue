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
    laneDevice: '现场层 Field',
    laneDriver: '驱动层 Driver',
    laneBus: '消息总线 RabbitMQ',
    laneCenter: '中心服务 Center',
    laneConsumer: '消费方 Consumer',
    upTitle: '数据上行 · 采集归一',
    downTitle: '命令下行 · 读写执行',
    devUp: '① 现场设备', devUpSub: '寄存器 / Topic 原始值',
    drvUp: '② 驱动采集 + 换算', drvUpSub: '工程值 = raw × multiple + base',
    busUp: '③ point_value 队列', busUpSub: '上行交换机',
    dcUp: '④ 数据中心消费', dcUpSub: '校验 · 追加落库',
    dbNode: 'TimescaleDB 超表', dbNodeSub: 'dc3_point_value · append-only',
    consUp: '⑤ Web · API · 大模型', consUpSub: 'latest 最新值 / list 历史 / AVG 聚合',
    consDown: '❶ 写请求 / 自定义指令', consDownSub: 'POST point_command/write · command_history/call',
    dcDown: '❷ 数据中心受理', dcDownSub: '校验 rwFlag · 建记录 PENDING',
    busDown: '❸ point_command / command 队列', busDownSub: '按驱动 serviceName 分队 · TTL 30s',
    drvDown: '❹ 驱动执行', drvDownSub: 'write() 写位号 / execute() 指令',
    devDown: '❺ 现场设备执行', devDownSub: '协议报文生效',
    lblProto: 'Modbus / OPC / S7 / MQTT',
    lblReport: 'PointValue 上行',
    lblConsume: '消费 · ack',
    lblInsert: 'INSERT 追加',
    lblQuery: '/point_value/latest · list',
    lblSubmit: '提交 · 返回 recordId / commandId',
    lblPublish: 'SENT · 投递',
    lblDispatch: '按 serviceName 分队',
    lblWrite: '协议报文下发',
    lblResult: '回执 result 队列 → 记录推进终态 (轮询获取)',
    legLane: '泳道（参与方）', legUp: '▲ 数据上行', legDown: '▼ 命令下行',
    legReceipt: '回执（虚线）', legDb: '时序存储',
    aria: 'DC3 数据流与命令流：上行链路从设备经驱动采集换算、RabbitMQ point_value 队列到数据中心追加落 TimescaleDB 供查询；下行链路从调用方经数据中心校验入队、驱动执行到设备生效，并以回执队列推进记录终态'
  },
  en: {
    laneDevice: 'Field Layer',
    laneDriver: 'Driver Layer',
    laneBus: 'Message Bus (RabbitMQ)',
    laneCenter: 'Center Services',
    laneConsumer: 'Consumers',
    upTitle: 'Data uplink · collect & normalize',
    downTitle: 'Command downlink · read/write & execute',
    devUp: '(1) Field device', devUpSub: 'raw register / topic value',
    drvUp: '(2) Driver collect + scale', drvUpSub: 'calValue = raw × multiple + base',
    busUp: '(3) point_value queue', busUpSub: 'uplink exchange',
    dcUp: '(4) Data center consume', dcUpSub: 'validate · append',
    dbNode: 'TimescaleDB hypertable', dbNodeSub: 'dc3_point_value · append-only',
    consUp: '(5) Web · API · LLM', consUpSub: 'latest / list history / AVG',
    consDown: '(1) Write / custom command', consDownSub: 'POST point_command/write · command_history/call',
    dcDown: '(2) Data center accept', dcDownSub: 'check rwFlag · record PENDING',
    busDown: '(3) point_command / command queue', busDownSub: 'per serviceName · TTL 30s',
    drvDown: '(4) Driver executes', drvDownSub: 'write() point / execute() command',
    devDown: '(5) Device applies', devDownSub: 'protocol payload takes effect',
    lblProto: 'Modbus / OPC / S7 / MQTT',
    lblReport: 'PointValue uplink',
    lblConsume: 'consume · ack',
    lblInsert: 'INSERT append',
    lblQuery: '/point_value/latest · list',
    lblSubmit: 'submit · returns recordId / commandId',
    lblPublish: 'SENT · publish',
    lblDispatch: 'fan out by serviceName',
    lblWrite: 'protocol payload',
    lblResult: 'receipt via result queue → final status (poll)',
    legLane: 'swimlane (actor)', legUp: '▲ data up', legDown: '▼ command down',
    legReceipt: 'receipt (dashed)', legDb: 'time-series store',
    aria: 'DC3 data flow and command flow: the uplink collects device data through the driver, the point_value queue and the data center into TimescaleDB for queries; the downlink takes write requests through validation, queueing and driver execution down to the device, with receipts advancing records to final states'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 640">
        <defs>
          <marker id="cfd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="cfd-ah-db" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-db-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cfd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cfd-grid)" height="100%" width="100%"/>

        <!-- swimlanes -->
        <rect fill="var(--dc3-region-be)" height="470" rx="12" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="180" x="30" y="70"/>
        <text fill="var(--dc3-ext-stroke)" font-size="10" font-weight="600" x="42" y="88">{{ s.laneDevice }}</text>
        <rect fill="var(--dc3-region-amber)" height="470" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="220" x="230" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="242" y="88">{{ s.laneDriver }}</text>
        <rect fill="var(--dc3-region-amber)" height="470" rx="12" stroke="var(--dc3-bus-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="200" x="470" y="70"/>
        <text fill="var(--dc3-bus-stroke)" font-size="10" font-weight="600" x="482" y="88">{{ s.laneBus }}</text>
        <rect fill="var(--dc3-region-be)" height="470" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="220" x="690" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="702" y="88">{{ s.laneCenter }}</text>
        <rect fill="var(--dc3-region-be)" height="470" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="290" x="930" y="70"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="942" y="88">{{ s.laneConsumer }}</text>

        <!-- band titles -->
        <text fill="var(--dc3-db-text)" font-size="11" font-weight="600" x="42" y="128">{{ s.upTitle }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="11" font-weight="600" x="42" y="392">{{ s.downTitle }}</text>

        <!-- uplink arrows -->
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="182" x2="240" y1="180"
              y2="180"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="150" y="170">{{ s.lblProto }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="426" x2="484" y1="180"
              y2="180"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="430" y="170">{{ s.lblReport }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="646" x2="704" y1="180"
              y2="180"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="646" y="170">{{ s.lblConsume }}</text>
        <line marker-end="url(#cfd-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="800" x2="800" y1="212"
              y2="276"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="808" y="248">{{ s.lblInsert }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="876" x2="1040" y1="180"
              y2="180"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="890" y="170">{{ s.lblQuery }}</text>

        <!-- downlink arrows -->
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="1066" x2="876" y1="450"
              y2="450"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="970" y="440">{{ s.lblSubmit }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="848" x2="656" y1="450"
              y2="450"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="752" y="440">{{ s.lblPublish }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="628" x2="436" y1="450"
              y2="450"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="532" y="440">{{ s.lblDispatch }}</text>
        <line marker-end="url(#cfd-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="408" x2="196" y1="450"
              y2="450"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="302" y="440">{{ s.lblWrite }}</text>
        <!-- receipt dashed: device-executed driver reports back to data center -->
        <path d="M 340 486 V 528 H 800 V 490" fill="none" marker-end="url(#cfd-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="570" y="522">{{ s.lblResult }}</text>

        <!-- uplink nodes -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="140"
              x="42" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="112" y="172">{{
            s.devUp
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="112" y="190">{{ s.devUpSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="186" x="240" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="333" y="172">{{
            s.drvUp
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="333" y="190">{{ s.drvUpSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="162"
              x="484" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="565" y="172">{{
            s.busUp
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="565" y="190">{{ s.busUpSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="172"
              x="704" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="790" y="172">{{
            s.dcUp
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="790" y="190">{{ s.dcUpSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="44" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="180"
              x="710" y="278"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="800" y="296">{{
            s.dbNode
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="800" y="312">{{ s.dbNodeSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="1040" y="148"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1170" y="172">{{
            s.consUp
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1170" y="190">{{ s.consUpSub }}</text>

        <!-- downlink nodes -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="1066" y="418"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1196" y="442">{{
            s.consDown
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1196" y="460">{{ s.consDownSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="172"
              x="704" y="418"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="790" y="442">{{
            s.dcDown
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="790" y="460">{{ s.dcDownSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="172"
              x="484" y="418"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="570" y="440">{{
            s.busDown
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="570" y="458">{{ s.busDownSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="168" x="240" y="418"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="324" y="442">{{
            s.drvDown
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="324" y="460">{{ s.drvDownSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="140"
              x="56" y="418"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="126" y="442">{{
            s.devDown
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="126" y="460">{{ s.devDownSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-region-be)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="42" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="64" y="613">{{ s.legLane }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="170" x2="190" y1="610" y2="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="196" y="613">{{ s.legUp }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="300" x2="320" y1="610" y2="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="326" y="613">{{ s.legDown }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.8" x1="440" x2="460" y1="610" y2="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="466" y="613">{{ s.legReceipt }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="600" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="613">{{ s.legDb }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
