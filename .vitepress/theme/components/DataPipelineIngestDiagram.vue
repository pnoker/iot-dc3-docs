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
    aria: '位号值摄入路径：协议驱动把采集值发到 RabbitMQ 交换机 dc3.e.value，落到持久队列 dc3.q.value.point（7 天 TTL，死信交换机兜底）；数据中心 PointValueReceiver 消费，按入站速率在即时落库与 Quartz 批量落库间切换，写入 TimescaleDB 超表 dc3_point_value（按天分块 × 16 哈希桶，7 天压缩、180 天清理），落库同时评估告警并写入 Caffeine 最新值缓存；latest 读接口先缓存后回源，list 直扫超表',
    regionMq: 'RabbitMQ · 异步投递 + 死信兜底',
    regionData: 'dc3-center-data · 消费 / 落库 / 热路径',
    regionRead: '读接口 · 冷热两路',
    drv: '协议驱动 dc3-driver-*', drvSub: '采集 · 不直连数据库',
    ex: 'dc3.e.value', exSub: 'topic 交换机',
    q: 'dc3.q.value.point', qSub: 'durable · TTL 7 天',
    dlq: 'dc3.e.point_value_dead', dlqSub: '死信交换机',
    mqNote: 'PERSISTENT 投递 · durable 队列 · 手动 ack · publisher confirm',
    recv: 'PointValueReceiver', recvSub: '默认容器并发 2–8',
    recvNote: 'prefetch 10 · 手动 ack · 校验失败进死信',
    imm: '即时落库', immSub: '低速率 · 单条 INSERT',
    batch: '批量落库', batchSub: 'Quartz 定时 · 速率参与计算',
    ts: 'dc3_point_value', tsSub: 'TimescaleDB 超表',
    tsNote: '1 天 1 chunk × device_id 16 哈希桶 · 7 天列式压缩 · 180 天清理',
    alarm: '告警引擎评估', alarmSub: '落库即评估（流处理）',
    cache: 'Caffeine 最新值缓存', cacheSub: '写路径同时写入 · 进程内',
    latest: 'latest · 最新值', latestSub: '先缓存命中 → 回源超表',
    list: 'list · 历史区间', listSub: '不走缓存 · 直扫超表',
    e1a: 'routing', e1b: 'value.point.*', e2: '绑定', e3a: '消费', e3b: 'ack',
    e4: 'TTL / 拒绝', e5: '速率 < 100', e6: '速率 ≥ 100 · 5s',
    e7: 'INSERT', e8: 'flush', e9: '同步评估', e10: '同时写缓存',
    e11: '先缓存后回源', e12: '范围查询 · 直扫超表',
    legDrv: '协议驱动', legMq: '消息层', legData: '数据中心',
    legDb: '时序存储', legHot: '热路径（告警/缓存）', legRead: '读接口', legDlq: '死信（虚线）'
  },
  en: {
    aria: 'Point value ingest path: protocol drivers publish to the RabbitMQ exchange dc3.e.value into the durable queue dc3.q.value.point (7-day TTL with a dead-letter exchange); the data center PointValueReceiver consumes and switches between immediate and Quartz batch persistence by inbound rate, writing the TimescaleDB hypertable dc3_point_value (daily chunks × 16 hash buckets, 7-day compression, 180-day retention), evaluating alarms and filling the Caffeine latest-value cache on write; latest reads hit the cache first, list scans the hypertable directly',
    regionMq: 'RabbitMQ · async delivery + dead letter',
    regionData: 'dc3-center-data · consume / persist / hot path',
    regionRead: 'Read APIs · hot and cold',
    drv: 'Driver dc3-driver-*', drvSub: 'collect · no direct DB write',
    ex: 'dc3.e.value', exSub: 'topic exchange',
    q: 'dc3.q.value.point', qSub: 'durable · TTL 7d',
    dlq: 'dc3.e.point_value_dead', dlqSub: 'dead-letter exchange',
    mqNote: 'PERSISTENT delivery · durable queue · manual ack · publisher confirm',
    recv: 'PointValueReceiver', recvSub: 'default container 2–8',
    recvNote: 'prefetch 10 · manual ack · invalid to DLQ',
    imm: 'Immediate persist', immSub: 'low rate · single INSERT',
    batch: 'Batch persist', batchSub: 'Quartz scheduled · rate-based',
    ts: 'dc3_point_value', tsSub: 'TimescaleDB hypertable',
    tsNote: '1-day chunk × 16 device_id hash buckets · 7d columnar compress · 180d purge',
    alarm: 'Alarm evaluation', alarmSub: 'evaluate on arrival (stream)',
    cache: 'Caffeine latest cache', cacheSub: 'written on persist · in-process',
    latest: 'latest · newest value', latestSub: 'cache hit → fall back to hypertable',
    list: 'list · history range', listSub: 'no cache · direct hypertable scan',
    e1a: 'routing', e1b: 'value.point.*', e2: 'bind', e3a: 'consume', e3b: 'ack',
    e4: 'TTL / reject', e5: 'rate < 100', e6: 'rate ≥ 100 · 5s',
    e7: 'INSERT', e8: 'flush', e9: 'evaluate', e10: 'also fill cache',
    e11: 'cache first, fallback', e12: 'range scan · direct',
    legDrv: 'Protocol driver', legMq: 'Messaging', legData: 'Data center',
    legDb: 'Time-series store', legHot: 'Hot path (alarm/cache)', legRead: 'Read API', legDlq: 'Dead letter (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 560">
        <defs>
          <marker id="dpi-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dpi-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dpi-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dpi-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="250" rx="12" stroke="var(--dc3-bus-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="620" x="20" y="70"/>
        <text fill="var(--dc3-bus-text)" font-size="10" font-weight="600" x="34" y="90">{{ s.regionMq }}</text>
        <rect fill="var(--dc3-region-be)" height="350" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="690" x="660" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="674" y="90">{{ s.regionData }}</text>
        <rect fill="var(--dc3-region-be)" height="110" rx="12" stroke="var(--dc3-fe-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="470" x="80" y="440"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="94" y="460">{{ s.regionRead }}</text>

        <!-- arrows (before nodes) -->
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="204" x2="246" y1="140"
              y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="225" y="130">{{ s.e1a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="225" y="158">{{ s.e1b }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="402" x2="446" y1="140"
              y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="424" y="130">{{ s.e2 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="632" x2="676" y1="140"
              y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="654" y="130">{{ s.e3a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="654" y="158">{{ s.e3b }}</text>
        <line marker-end="url(#dpi-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="540" x2="540" y1="198" y2="246"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7" x="548" y="226">{{ s.e4 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="864" x2="916" y1="120"
              y2="92"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="838" y="98">{{ s.e5 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="864" x2="916" y1="160"
              y2="208"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="end" x="912" y="226">{{ s.e6 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1094" x2="1144" y1="92"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1130" y="84">{{ s.e7 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1094" x2="1144" y1="222"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1130" y="242">{{ s.e8 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1245" x2="1245" y1="224"
              y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="end" x="1237" y="240">{{ s.e9 }}</text>
        <line marker-end="url(#dpi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1320" x2="1320" y1="224"
              y2="336"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="end" x="1312" y="330">{{ s.e10 }}</text>
        <line marker-end="url(#dpi-ah)" marker-start="url(#dpi-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1" x1="534" x2="1156" y1="478" y2="386"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="820" y="424">{{ s.e11 }}</text>
        <path d="M 195 456 L 195 236 L 890 236 L 890 180 L 1144 180" fill="none" marker-end="url(#dpi-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="600" y="228">{{ s.e12 }}</text>

        <!-- MQ nodes -->
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="170" x="34" y="105"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="119" y="132">{{
            s.drv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="119" y="150">{{ s.drvSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="150" x="252" y="105"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="327" y="132">{{
            s.ex
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="327" y="150">{{ s.exSub }}</text>
        <path d="M 450 120 a90,13 0 0 0 180,0 v62 a90,13 0 0 1 -180,0 z" fill="var(--dc3-bus-fill)"
              stroke="var(--dc3-bus-stroke)" stroke-width="1.5"/>
        <ellipse cx="540" cy="120" fill="none" rx="90" ry="13" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="540" y="152">{{
            s.q
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="540" y="170">{{ s.qSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="50" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="160" x="460" y="250"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" text-anchor="middle" x="540" y="270">{{
            s.dlq
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="540" y="288">{{ s.dlqSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="34" y="312">{{ s.mqNote }}</text>

        <!-- data center nodes -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="180" x="684" y="105"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="774" y="132">{{
            s.recv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="774" y="150">{{ s.recvSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="684" y="196">{{ s.recvNote }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="170" x="920" y="60"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1005" y="84">{{
            s.imm
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1005" y="102">{{ s.immSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="170" x="920" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1005" y="214">{{
            s.batch
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1005" y="232">{{ s.batchSub }}</text>
        <path d="M 1150 123 a90,13 0 0 0 180,0 v74 a90,13 0 0 1 -180,0 z" fill="var(--dc3-db-fill)"
              stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <ellipse cx="1240" cy="123" fill="none" rx="90" ry="13" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1240" y="160">{{
            s.ts
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1240" y="178">{{ s.tsSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="1200" y="216">{{ s.tsNote }}</text>
        <rect fill="var(--dc3-amber-fill)" height="60" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="140" x="1160" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1230" y="274">{{
            s.alarm
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1230" y="292">{{ s.alarmSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="60" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="170" x="1160" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1245" y="364">{{
            s.cache
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1245" y="382">{{ s.cacheSub }}</text>

        <!-- read APIs -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="190" x="100" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="195" y="482">{{
            s.list
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="195" y="500">{{ s.listSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="200" x="330" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="430" y="482">{{
            s.latest
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="430" y="500">{{ s.latestSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="600" y="536"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="545">{{ s.legMq }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="720" y="536"/>
        <text fill="var(--dc3-text2)" font-size="9" x="742" y="545">{{ s.legData }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="850" y="536"/>
        <text fill="var(--dc3-text2)" font-size="9" x="872" y="545">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="980" y="536"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1002" y="545">{{ s.legHot }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="1130" y="536"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1152" y="545">{{ s.legRead }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="1240" x2="1270" y1="541"
              y2="541"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1276" y="545">{{ s.legDlq }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
