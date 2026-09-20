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
    aria: '物联网数据管道：现场设备经采集端把读数发布到消息总线，总线削峰解耦并可把超时消息送入死信队列；消费端按节奏落库到时序数据库（超表分块、降采样、保留、压缩），热路径走流处理秒级出告警与实时大屏，冷路径走批处理出报表与趋势，最终汇到消费方',
    regionAcq: '采集侧',
    regionBus: '消息总线 · 解耦与背压',
    regionStore: '存储与计算 · 冷热两路',
    regionCons: '消费方',
    regionStream: '流计算 · 热路径',
    dev: '现场设备', devSub: '传感器 / 执行器',
    acq: '采集端', acqSub: '驱动 / 网关 · 周期或订阅',
    bus: '消息总线', busSub: '削峰 · 异步解耦',
    bpNote: '预取限流 · 并发消费 · 队列 TTL',
    dlq: '死信队列', dlqSub: '超时 / 反复失败',
    sink: '消费落库', sinkSub: '按自身节奏 · 手动 ack',
    tsdb: '时序数据库', tsdbSub: '超表 · 自动分块',
    chunkNote: '分块裁剪 · 降采样 · 保留 · 列式压缩',
    batchNote: '即时落库 ↔ 批量落库（按入站速率切换）',
    stream: '流处理', streamSub: '值一到即算 · 秒级',
    batch: '批处理', batchSub: '攒批再算 · 高吞吐',
    rt: '实时消费', rtSub: '实时大屏 · 当前告警',
    hist: '历史 / 分析消费', histSub: '趋势 · 报表 · AI 训练',
    e1: '读取', e2: '发布 · 持久化', e3: '订阅', e4: 'ack',
    e5: '超时 / reject', e6: '订阅 · 事件流',
    e7: '批量写', e8: '定时全量 / 增量',
    e9: '实时结果', e10: '报表 / 趋势', e11: '历史区间 / 聚合',
    legDev: '现场设备', legAcq: '采集 / 计算', legBus: '消息总线',
    legSink: '落库', legDb: '时序存储', legCons: '消费方', legDlq: '死信路径（虚线）'
  },
  en: {
    aria: 'IoT data pipeline: field devices publish readings through the acquisition side onto the message bus, which absorbs peaks and can divert timed-out messages to a dead-letter queue; the consumer persists into a time-series database (hypertable chunks, downsampling, retention, compression), the hot path streams for second-level alarms and live dashboards, the cold path batches for reports and trends, both feeding consumers',
    regionAcq: 'Acquisition',
    regionBus: 'Message bus · decouple & backpressure',
    regionStore: 'Store & compute · hot and cold',
    regionCons: 'Consumers',
    regionStream: 'Stream compute · hot path',
    dev: 'Field device', devSub: 'sensor / actuator',
    acq: 'Acquisition', acqSub: 'driver / gateway · poll or subscribe',
    bus: 'Message bus', busSub: 'peak shaving · async decoupling',
    bpNote: 'prefetch · consumer concurrency · queue TTL',
    dlq: 'Dead-letter queue', dlqSub: 'timeout / repeated failure',
    sink: 'Consume & persist', sinkSub: 'own pace · manual ack',
    tsdb: 'Time-series DB', tsdbSub: 'hypertable · auto chunking',
    chunkNote: 'chunk pruning · downsample · retention · columnar compression',
    batchNote: 'immediate ↔ batch persist (by inbound rate)',
    stream: 'Stream processing', streamSub: 'compute on arrival · seconds',
    batch: 'Batch processing', batchSub: 'accumulate then compute · throughput',
    rt: 'Real-time consumer', rtSub: 'live dashboard · current alarms',
    hist: 'History / analytics', histSub: 'trends · reports · AI training',
    e1: 'read', e2: 'publish · persistent', e3: 'subscribe', e4: 'ack',
    e5: 'timeout / reject', e6: 'subscribe · event stream',
    e7: 'batch write', e8: 'scheduled full / delta',
    e9: 'real-time results', e10: 'reports / trends', e11: 'range / aggregate query',
    legDev: 'Field device', legAcq: 'Acquire / compute', legBus: 'Message bus',
    legSink: 'Persist', legDb: 'Time-series store', legCons: 'Consumer', legDlq: 'Dead letter (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 560">
        <defs>
          <marker id="dpf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dpf-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dpf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dpf-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="180" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="330" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionAcq }}</text>
        <rect fill="var(--dc3-region-amber)" height="230" rx="12" stroke="var(--dc3-bus-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="260" x="400" y="70"/>
        <text fill="var(--dc3-bus-text)" font-size="10" font-weight="600" x="414" y="90">{{ s.regionBus }}</text>
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-db-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="340" x="700" y="70"/>
        <text fill="var(--dc3-db-text)" font-size="10" font-weight="600" x="714" y="90">{{ s.regionStore }}</text>
        <rect fill="var(--dc3-region-amber)" height="150" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="250" x="400" y="330"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="414" y="350">{{ s.regionStream }}</text>
        <rect fill="var(--dc3-region-be)" height="180" rx="12" stroke="var(--dc3-fe-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="210" x="1080" y="330"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="1094" y="350">{{ s.regionCons }}</text>

        <!-- arrows (before nodes) -->
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="179" x2="211" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="195" y="134">{{ s.e1 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="349" x2="441" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="396" y="134">{{ s.e2 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="599" x2="696" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="648" y="134">{{ s.e3 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="648" y="160">{{ s.e4 }}</text>
        <line marker-end="url(#dpf-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="560" x2="560" y1="200" y2="230"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7" x="568" y="220">{{ s.e5 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="470" x2="470" y1="200"
              y2="366"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="478" y="300">{{ s.e6 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="844" x2="876" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="860" y="134">{{ s.e7 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="960" x2="960" y1="204"
              y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="968" y="230">{{ s.e8 }}</text>
        <line marker-end="url(#dpf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="624" x2="1096" y1="402"
              y2="384"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="840" y="374">{{ s.e9 }}</text>
        <path d="M 1040 282 L 1062 282 L 1062 464 L 1092 464" fill="none" marker-end="url(#dpf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="end" x="1044" y="372">{{ s.e10 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" transform="rotate(-90 1054 320)" x="1054" y="320">{{
            s.e11
          }}
        </text>

        <!-- acquisition nodes -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="130" x="45" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="110" y="136">{{
            s.dev
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="110" y="154">{{ s.devSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="130" x="215" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="280" y="136">{{
            s.acq
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="280" y="154">{{ s.acqSub }}</text>

        <!-- bus -->
        <text fill="var(--dc3-bus-text)" font-size="7.5" x="414" y="106">{{ s.bpNote }}</text>
        <path d="M 445 130 a75,12 0 0 0 150,0 v58 a75,12 0 0 1 -150,0 z" fill="var(--dc3-bus-fill)"
              stroke="var(--dc3-bus-stroke)" stroke-width="1.5"/>
        <ellipse cx="520" cy="130" fill="none" rx="75" ry="12" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="520" y="164">{{
            s.bus
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="520" y="182">{{ s.busSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="110" x="540" y="234"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="595" y="252">{{
            s.dlq
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="595" y="268">{{ s.dlqSub }}</text>

        <!-- store & compute nodes -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="140" x="700" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="770" y="136">{{
            s.sink
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="154">{{ s.sinkSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="710" y="206">{{ s.batchNote }}</text>
        <path d="M 880 130 a80,12 0 0 0 160,0 v58 a80,12 0 0 1 -160,0 z" fill="var(--dc3-db-fill)"
              stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <ellipse cx="960" cy="130" fill="none" rx="80" ry="12" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="960" y="166">{{
            s.tsdb
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="960" y="184">{{ s.tsdbSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="880" y="220">{{ s.chunkNote }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="160" x="880" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="960" y="276">{{
            s.batch
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="960" y="294">{{ s.batchSub }}</text>

        <!-- stream node -->
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="190" x="430" y="370"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="525" y="396">{{
            s.stream
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="525" y="414">{{ s.streamSub }}</text>

        <!-- consumers -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="170" x="1100" y="360"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1185" y="382">{{
            s.rt
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1185" y="400">{{ s.rtSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="170" x="1100" y="436"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1185" y="458">{{
            s.hist
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1185" y="476">{{ s.histSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="40" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="539">{{ s.legDev }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="150" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="172" y="539">{{ s.legAcq }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="280" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="539">{{ s.legBus }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="410" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="539">{{ s.legSink }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="510" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="532" y="539">{{ s.legDb }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="640" y="530"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="539">{{ s.legCons }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="780" x2="810" y1="535"
              y2="535"/>
        <text fill="var(--dc3-text2)" font-size="9" x="816" y="539">{{ s.legDlq }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
