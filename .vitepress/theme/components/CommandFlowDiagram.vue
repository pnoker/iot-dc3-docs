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
    laneCaller: '调用方 Caller',
    laneCenter: '数据中心 Center',
    laneBus: '消息总线 RabbitMQ',
    laneDriver: '驱动 Driver',
    laneDevice: '设备 Device',
    n1: '① 提交调用', n1Sub1: 'POST /data/command_history/call',
    n1Sub2: 'CommandCallBO · 返回 recordId',
    n2: '② 受理校验', n2Sub1: '校验设备 profileId 含该指令',
    n2Sub2: '落 dc3_command_history · PENDING',
    n3: '③ 投递队列', n3Sub1: 'dc3.e.command', n3Sub2: '状态 SENT · TTL 30s',
    n4: '④ 驱动消费', n4Sub1: '每设备串行锁 · 去重', n4Sub2: 'DriverCommand.execute()',
    n5: '⑤ 设备执行', n5Sub1: '渲染协议报文下发', n5Sub2: '执行 · 超时 · 失败',
    n6: '⑥ 执行回执', n6Sub1: 'CommandCallResultDTO', n6Sub2: 'status · resultValues · errorCode',
    n7: '⑦ result 队列', n7Sub: '回执交换机 · TTL 60s',
    n8: '⑧ 记录推进', n8Sub1: '按 recordId 回写终态', n8Sub2: 'SUCCESS / FAILED / EXPIRED…',
    n9: '⑨ 轮询终态', n9Sub1: 'GET get_by_record_id', n9Sub2: '以回执 status 为准',
    noteTitle: 'sync ≠ 调用即完成',
    noteL1: '/call 只返回 recordId',
    noteL2: '是否做完看回执 status',
    lblSubmit: '提交', lblPublish: '发布 SENT', lblConsume: '消费',
    lblPayload: '协议报文', lblResult: '执行结果', lblReceipt: '回执',
    lblWrite: '写回', lblPoll: '轮询可查',
    legLane: '泳道（参与方）', legDown: '指令下行（实线）', legReceipt: '回执链路（虚线）',
    legNote: '同步语义注记',
    aria: '自定义指令调用流程：调用方提交 command_history/call，数据中心校验模板归属并落 PENDING 记录，投递 dc3.e.command 队列后驱动在每设备串行锁下执行 execute 并下发协议报文；执行结果以 CommandCallResultDTO 经 result 队列回写记录终态，调用方凭 recordId 轮询获取'
  },
  en: {
    laneCaller: 'Caller',
    laneCenter: 'Data Center',
    laneBus: 'Message Bus (RabbitMQ)',
    laneDriver: 'Driver',
    laneDevice: 'Device',
    n1: '(1) Submit call', n1Sub1: 'POST /data/command_history/call',
    n1Sub2: 'CommandCallBO · returns recordId',
    n2: '(2) Validate & record', n2Sub1: 'check device profile owns command',
    n2Sub2: 'insert dc3_command_history · PENDING',
    n3: '(3) Publish queue', n3Sub1: 'dc3.e.command', n3Sub2: 'status SENT · TTL 30s',
    n4: '(4) Driver consumes', n4Sub1: 'per-device lock · dedupe', n4Sub2: 'DriverCommand.execute()',
    n5: '(5) Device executes', n5Sub1: 'render protocol payload', n5Sub2: 'ok · timeout · fail',
    n6: '(6) Receipt', n6Sub1: 'CommandCallResultDTO', n6Sub2: 'status · resultValues · errorCode',
    n7: '(7) result queue', n7Sub: 'receipt exchange · TTL 60s',
    n8: '(8) Advance record', n8Sub1: 'write final status by recordId', n8Sub2: 'SUCCESS / FAILED / EXPIRED…',
    n9: '(9) Poll final state', n9Sub1: 'GET get_by_record_id', n9Sub2: 'trust receipt status',
    noteTitle: 'sync ≠ done on return',
    noteL1: '/call returns recordId only',
    noteL2: 'receipt status decides done',
    lblSubmit: 'submit', lblPublish: 'publish SENT', lblConsume: 'consume',
    lblPayload: 'payload', lblResult: 'result', lblReceipt: 'receipt',
    lblWrite: 'write back', lblPoll: 'pollable',
    legLane: 'swimlane (actor)', legDown: 'command downlink (solid)', legReceipt: 'receipt path (dashed)',
    legNote: 'sync semantics note',
    aria: 'Custom command call flow: the caller submits command_history/call; the data center validates profile ownership, inserts a PENDING record and publishes to the dc3.e.command queue; the driver executes under a per-device serial lock and sends the protocol payload; the CommandCallResultDTO receipt returns via the result queue to advance the record, and the caller polls by recordId for the final state'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 660">
        <defs>
          <marker id="cmf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cmf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cmf-grid)" height="100%" width="100%"/>

        <!-- swimlanes -->
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="240" x="30" y="70"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="42" y="88">{{ s.laneCaller }}</text>
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="230" x="290" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="302" y="88">{{ s.laneCenter }}</text>
        <rect fill="var(--dc3-region-amber)" height="500" rx="12" stroke="var(--dc3-bus-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="200" x="540" y="70"/>
        <text fill="var(--dc3-bus-stroke)" font-size="10" font-weight="600" x="552" y="88">{{ s.laneBus }}</text>
        <rect fill="var(--dc3-region-amber)" height="500" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="220" x="760" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="772" y="88">{{ s.laneDriver }}</text>
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="270" x="1000" y="70"/>
        <text fill="var(--dc3-ext-stroke)" font-size="10" font-weight="600" x="1012" y="88">{{ s.laneDevice }}</text>

        <!-- forward arrows -->
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="250" x2="306" y1="190"
              y2="190"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="278" y="180">{{ s.lblSubmit }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="500" x2="556" y1="190"
              y2="190"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="528" y="180">{{ s.lblPublish }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="720" x2="776" y1="190"
              y2="190"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="748" y="180">{{ s.lblConsume }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="960" x2="1016" y1="190"
              y2="190"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="988" y="180">{{ s.lblPayload }}</text>
        <!-- receipt arrows -->
        <path d="M 1135 230 V 350 H 870 V 376" fill="none" marker-end="url(#cmf-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1010" y="342">{{ s.lblResult }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.9" x1="780"
              x2="724" y1="420" y2="420"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="752" y="410">{{ s.lblReceipt }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.9" x1="560"
              x2="504" y1="420" y2="420"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="532" y="410">{{ s.lblWrite }}</text>
        <line marker-end="url(#cmf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.9" x1="310"
              x2="254" y1="420" y2="420"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="282" y="410">{{ s.lblPoll }}</text>

        <!-- forward nodes -->
        <rect fill="var(--dc3-fe-fill)" height="80" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="50" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="150" y="172">{{
            s.n1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="150" y="190">{{ s.n1Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="150" y="208">{{ s.n1Sub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="310" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="405" y="172">{{
            s.n2
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="405" y="190">{{ s.n2Sub1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="405" y="208">{{ s.n2Sub2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="80" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="160"
              x="560" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="640" y="172">{{
            s.n3
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="190">{{ s.n3Sub1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="208">{{ s.n3Sub2 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="80" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="780" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="870" y="172">{{
            s.n4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="870" y="190">{{ s.n4Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="870" y="208">{{ s.n4Sub2 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="80" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="230"
              x="1020" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1135" y="172">{{
            s.n5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1135" y="190">{{ s.n5Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1135" y="208">{{ s.n5Sub2 }}</text>

        <!-- receipt nodes -->
        <rect fill="var(--dc3-amber-fill)" height="80" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="780" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="870" y="402">{{
            s.n6
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="870" y="420">{{ s.n6Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="870" y="438">{{ s.n6Sub2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="160"
              x="560" y="385"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="640" y="409">{{
            s.n7
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="427">{{ s.n7Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="310" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="405" y="402">{{
            s.n8
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="405" y="420">{{ s.n8Sub1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="405" y="438">{{ s.n8Sub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="80" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="50" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="150" y="402">{{
            s.n9
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="150" y="420">{{ s.n9Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="150" y="438">{{ s.n9Sub2 }}</text>

        <!-- sync semantics note -->
        <rect fill="var(--dc3-rose-fill)" height="70" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,3"
              stroke-width="1" width="200" x="50" y="490"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="62" y="510">{{ s.noteTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="62" y="528">{{ s.noteL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="62" y="546">{{ s.noteL2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-region-be)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="42" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="64" y="643">{{ s.legLane }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="170" x2="190" y1="640" y2="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="196" y="643">{{ s.legDown }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.9" x1="350" x2="370" y1="640" y2="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="376" y="643">{{ s.legReceipt }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="520" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="542" y="643">{{ s.legNote }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
