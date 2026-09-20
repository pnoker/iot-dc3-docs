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
    aria: '通知送达链路：规则状态翻转进入 AlarmRuleTriggerService，在同一事务内同步写入 dc3_entity_alarm 与 dc3_notify_history 的 pending 记录；事务提交后 NotifyTaskSender 经 RabbitMQ 异步发布任务，消费者解析通知绑定与渠道并送达 email/SMS/webhook，最后回写 status_flag，失败可重试并累加 retry_count',
    syncRegion: '事务内 · 同步落库（transactional）',
    asyncRegion: '事务提交后 · 异步投递（after commit）',
    trigName: '规则状态翻转',
    trigSub: 'dc3_rule_state.entity_state_flag',
    svcName: 'AlarmRuleTriggerService',
    svcSub: '规则评估 · 触发判定',
    alarmName: 'dc3_entity_alarm',
    alarmSub: 'INSERT 告警事实',
    histName: 'dc3_notify_history',
    histSub: 'INSERT · status=0 pending',
    atomic: '同一事务 · 要么都落要么都不落',
    senderName: 'NotifyTaskSender',
    senderSub: 'afterCommit 触发',
    mqName: 'RabbitMQ',
    mqSub: '异步发布 NotifyTaskDTO',
    consName: '通知消费者',
    consSub: '解析 notify → bind → channel',
    chanName: '渠道送达',
    chanSub: 'email · SMS · webhook POST',
    backName: '回写 dc3_notify_history',
    backSub: 'status_flag · retry_count',
    eTrig: '翻转事件',
    eInsAlarm: 'INSERT',
    eInsHist: 'INSERT pending',
    eCommit: '事务提交 · afterCommit',
    ePublish: '发布',
    eConsume: '消费',
    eTask: 'NotifyTask',
    eDeliver: '送达结果',
    eRetry: 'failed → retry · 重新入队',
    statusLine: 'status_flag：0 pending → 1 sent → 2 success / 3 failed → 4 retry',
    legSvc: '中心服务',
    legDb: '持久化（事务内）',
    legBus: '消息总线',
    legChan: '外部渠道',
    legState: '状态 / 重试',
    legCommit: '事务边界（虚线）',
    legRetry: '重试回路'
  },
  en: {
    aria: 'Notification delivery: a rule state flip enters AlarmRuleTriggerService which synchronously inserts dc3_entity_alarm and the pending dc3_notify_history row in one transaction; after commit NotifyTaskSender publishes a NotifyTaskDTO via RabbitMQ, a consumer resolves the notify binding and channel, delivers over email/SMS/webhook, then writes status_flag back — failures retry with retry_count incremented',
    syncRegion: 'In transaction · synchronous inserts (transactional)',
    asyncRegion: 'After commit · asynchronous delivery',
    trigName: 'rule state flips',
    trigSub: 'dc3_rule_state.entity_state_flag',
    svcName: 'AlarmRuleTriggerService',
    svcSub: 'rule evaluation · verdict',
    alarmName: 'dc3_entity_alarm',
    alarmSub: 'INSERT alarm fact',
    histName: 'dc3_notify_history',
    histSub: 'INSERT · status=0 pending',
    atomic: 'one transaction · all rows or none',
    senderName: 'NotifyTaskSender',
    senderSub: 'fired afterCommit',
    mqName: 'RabbitMQ',
    mqSub: 'async NotifyTaskDTO',
    consName: 'Notify consumer',
    consSub: 'resolve notify → bind → channel',
    chanName: 'channel delivery',
    chanSub: 'email · SMS · webhook POST',
    backName: 'write back dc3_notify_history',
    backSub: 'status_flag · retry_count',
    eTrig: 'flip event',
    eInsAlarm: 'INSERT',
    eInsHist: 'INSERT pending',
    eCommit: 'commit · afterCommit',
    ePublish: 'publish',
    eConsume: 'consume',
    eTask: 'NotifyTask',
    eDeliver: 'delivery result',
    eRetry: 'failed → retry · re-enqueue',
    statusLine: 'status_flag: 0 pending → 1 sent → 2 success / 3 failed → 4 retry',
    legSvc: 'center service',
    legDb: 'persisted (in txn)',
    legBus: 'message bus',
    legChan: 'external channel',
    legState: 'state / retry',
    legCommit: 'transaction boundary (dashed)',
    legRetry: 'retry loop'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 660">
        <defs>
          <marker id="anf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="anf-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="anf-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="anf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#anf-grid)" height="100%" width="100%"/>

        <!-- regions: synchronous transaction vs async delivery -->
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1160" x="40" y="44"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="62">{{ s.syncRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="230" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1160" x="40" y="350"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="368">{{ s.asyncRegion }}</text>

        <!-- atomic bracket around the two synchronous inserts -->
        <rect fill="none" height="136" rx="10" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4"
              stroke-width="1" width="440" x="634" y="66"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="854" y="218">{{ s.atomic }}</text>

        <!-- ===== arrows ===== -->
        <!-- flip -> service -->
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="270" x2="330" y1="118"
              y2="118"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="300" y="110">{{ s.eTrig }}</text>
        <!-- service -> alarm (upper insert) -->
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="570" x2="650" y1="104"
              y2="104"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="610" y="96">{{ s.eInsAlarm }}
        </text>
        <!-- service -> history (lower insert, routed beneath the alarm cylinder) -->
        <path d="M 450 168 V 226 H 970 V 196" fill="none" marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="710" y="220">{{ s.eInsHist }}
        </text>
        <!-- commit boundary: pending row -> sender, through the inter-region gutter -->
        <path d="M 1000 204 V 340 H 170 V 390" fill="none" marker-end="url(#anf-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" text-anchor="middle" x="570" y="332">{{ s.eCommit }}
        </text>
        <!-- async chain -->
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="270" x2="330" y1="418"
              y2="418"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="410">{{ s.ePublish }}
        </text>
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="510" x2="570" y1="418"
              y2="418"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="540" y="410">{{ s.eConsume }}
        </text>
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="790" x2="850" y1="418"
              y2="418"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="820" y="410">{{ s.eTask }}</text>
        <!-- channel -> write-back -->
        <line marker-end="url(#anf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="940" x2="940" y1="446"
              y2="500"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="948" y="478">{{ s.eDeliver }}</text>
        <!-- retry loop: write-back -> queue -->
        <path d="M 850 528 H 420 V 450" fill="none" marker-end="url(#anf-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="640" y="522">{{ s.eRetry }}</text>

        <!-- ===== transaction region nodes ===== -->
        <rect fill="var(--dc3-amber-fill)" height="64" rx="10" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="200" x="70" y="86"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="170"
              y="112">{{ s.trigName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="170" y="132">{{ s.trigSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="80" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="2" width="240"
              x="330" y="88"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="450"
              y="118">{{ s.svcName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="9" text-anchor="middle" x="450" y="138">{{ s.svcSub }}</text>
        <!-- alarm cylinder -->
        <rect fill="var(--dc3-db-fill)" height="96" width="180" x="650" y="96"/>
        <ellipse cx="740" cy="96" fill="var(--dc3-db-fill)" rx="90" ry="12" stroke="var(--dc3-db-stroke)"
                 stroke-width="1.5"/>
        <path d="M650,96 V192" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <path d="M830,96 V192" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <ellipse cx="740" cy="192" fill="none" rx="90" ry="12" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="10.5" font-weight="600" text-anchor="middle" x="740"
              y="140">{{ s.alarmName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="740" y="160">{{ s.alarmSub }}</text>
        <!-- history cylinder -->
        <rect fill="var(--dc3-db-fill)" height="96" width="180" x="880" y="96"/>
        <ellipse cx="970" cy="96" fill="var(--dc3-db-fill)" rx="90" ry="12" stroke="var(--dc3-db-stroke)"
                 stroke-width="1.5"/>
        <path d="M880,96 V192" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <path d="M1060,96 V192" fill="none" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <ellipse cx="970" cy="192" fill="none" rx="90" ry="12" stroke="var(--dc3-db-stroke)" stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-db-text)" font-size="10.5" font-weight="600" text-anchor="middle" x="970"
              y="140">{{ s.histName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="970" y="160">{{ s.histSub }}</text>

        <!-- ===== async region nodes ===== -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="200"
              x="70" y="390"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="170"
              y="412">{{ s.senderName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="430">{{ s.senderSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="180" x="330" y="390"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="420"
              y="412">{{ s.mqName }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="420" y="430">{{ s.mqSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="220"
              x="570" y="390"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="680"
              y="412">{{ s.consName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="680" y="430">{{ s.consSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="56" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="180" x="850" y="390"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="940"
              y="412">{{ s.chanName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="940" y="430">{{ s.chanSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="240" x="850" y="500"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="970"
              y="522">{{ s.backName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="970" y="540">{{ s.backSub }}</text>
        <!-- status enumeration strip -->
        <rect fill="none" height="24" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3" stroke-width="1"
              width="560" x="70" y="540"/>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="350" y="556">{{ s.statusLine }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="627">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="190" y="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="627">{{ s.legDb }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="350" y="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="372" y="627">{{ s.legBus }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="490" y="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="512" y="627">{{ s.legChan }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="630" y="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="652" y="627">{{ s.legState }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="770" x2="788" y1="623"
              y2="623"/>
        <text fill="var(--dc3-text2)" font-size="9" x="794" y="627">{{ s.legCommit }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="1" x1="960" x2="978" y1="623"
              y2="623"/>
        <text fill="var(--dc3-text2)" font-size="9" x="984" y="627">{{ s.legRetry }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
