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
    aria: '告警域实体关系：dc3_rule 定义规则并绑定 dc3_notify 通知，dc3_rule_state 跟踪每条规则对每个实体的运行状态；触发写入 dc3_entity_alarm，dc3_event_history 的事件上报可触发规则评估；dc3_notify 经绑定表关联 dc3_notify_channel 渠道，送达产生 dc3_notify_history 审计记录',
    defRegion: '定义域 Definition · 规则与通知配置（写一次，长期生效）',
    runRegion: '运行域 Runtime · 事实与审计记录（随触发增长）',
    rsSub: '规则运行状态机 · CHECK 0..3',
    ruleSub: '规则定义',
    notifySub: '通知配置',
    bindSub: '通知-渠道绑定',
    chSub: '送达渠道 · CHECK 0..2',
    evtSub: '事件原始日志',
    eaSub: '统一运行告警',
    nhSub: '送达审计 · CHECK 0..4',
    e1: 'rule_id · N:1',
    e2: 'notify_id · N:1',
    e3: '经绑定表 M:N',
    e4: 'channel_id · 绑定渠道',
    e5: '触发写入 · rule_id',
    e6: 'alarm_id 回填',
    e7: '触发评估 · source=5（可能）',
    e8: 'alarm_id · 1:N',
    e9: 'channel_id · N:1',
    e10: 'notify_id · 模板',
    noteTenant: '所有表以 tenant_id 打头，严格按租户隔离',
    noteFk: 'id 列均为逻辑关联，库内未建 FK 约束',
    legState: '状态机表',
    legDef: '定义表',
    legJoin: '绑定 / 事件日志',
    legChannel: '渠道表',
    legRecord: '运行记录表',
    legDashed: '虚线 = 可能触发的弱关联'
  },
  en: {
    aria: 'Alarm domain ER: dc3_rule defines rules and binds dc3_notify; dc3_rule_state tracks per-rule per-entity runtime state; firing writes dc3_entity_alarm while dc3_event_history reports may trigger rule evaluation; dc3_notify joins dc3_notify_channel through a bind table and each delivery produces a dc3_notify_history audit row',
    defRegion: 'Definition · rules and notification config (write once, long-lived)',
    runRegion: 'Runtime · facts and audit records (grows with triggers)',
    rsSub: 'rule runtime state · CHECK 0..3',
    ruleSub: 'rule definition',
    notifySub: 'notification config',
    bindSub: 'notify-channel join',
    chSub: 'delivery channel · CHECK 0..2',
    evtSub: 'raw event log',
    eaSub: 'unified runtime alarms',
    nhSub: 'delivery audit · CHECK 0..4',
    e1: 'rule_id · N:1',
    e2: 'notify_id · N:1',
    e3: 'M:N via bind table',
    e4: 'channel_id · binds channel',
    e5: 'fires and writes · rule_id',
    e6: 'alarm_id backfilled',
    e7: 'triggers evaluation · source=5 (may)',
    e8: 'alarm_id · 1:N',
    e9: 'channel_id · N:1',
    e10: 'notify_id · template',
    noteTenant: 'every table leads with tenant_id — strict tenant isolation',
    noteFk: 'id columns are logical links, no FK constraints in DB',
    legState: 'state table',
    legDef: 'definition table',
    legJoin: 'join / event log',
    legChannel: 'channel table',
    legRecord: 'runtime record',
    legDashed: 'dashed = weak (may trigger)'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

type Role = 'amber' | 'be' | 'fe' | 'ext' | 'db'
type Ent = { k: string; x: number; y: number; role: Role; attrs: string[] }

// physical table layouts: header 26 + n * 14 + 8
const ENT: Ent[] = [
  {
    k: 'dc3_rule_state', x: 60, y: 80, role: 'amber',
    attrs: ['long id', 'long rule_id', 'string fingerprint', 'byte entity_state_flag 0..3', 'int trigger_count', 'long alarm_id']
  },
  {
    k: 'dc3_rule', x: 370, y: 80, role: 'be',
    attrs: ['long id', 'string rule_code', 'byte alarm_target_type_flag', 'long notify_id', 'byte enable_flag']
  },
  {
    k: 'dc3_notify', x: 680, y: 80, role: 'be',
    attrs: ['long id', 'string notify_code', 'long notify_interval', 'byte auto_confirm_flag']
  },
  {
    k: 'dc3_notify_channel_bind', x: 990, y: 80, role: 'fe',
    attrs: ['long id', 'long notify_id', 'long channel_id']
  },
  {
    k: 'dc3_event_history', x: 60, y: 470, role: 'fe',
    attrs: ['long id', 'long event_id', 'string record_id (UUID)', 'byte event_type_flag 0..3', 'byte event_level_flag 0..3', 'byte acknowledge_flag 0/1']
  },
  {
    k: 'dc3_entity_alarm', x: 370, y: 440, role: 'db',
    attrs: ['long id', 'byte alarm_source_flag 0..5', 'byte alarm_type_flag 0..4', 'byte alarm_target_type_flag', 'byte alarm_level_flag P0..P3', 'long rule_id', 'long rule_state_id', 'byte confirm_flag 0/1']
  },
  {
    k: 'dc3_notify_history', x: 680, y: 440, role: 'db',
    attrs: ['long id', 'long alarm_id', 'long channel_id', 'byte status_flag 0..4', 'int retry_count']
  },
  {
    k: 'dc3_notify_channel', x: 990, y: 440, role: 'ext',
    attrs: ['long id', 'string channel_code', 'byte channel_type_flag 0..2']
  }
]
const W = 230
const HEAD = 26
const LINE = 14

const SUBS: Record<string, keyof typeof DICT.zh> = {
  'dc3_rule_state': 'rsSub', 'dc3_rule': 'ruleSub', 'dc3_notify': 'notifySub',
  'dc3_notify_channel_bind': 'bindSub', 'dc3_notify_channel': 'chSub',
  'dc3_event_history': 'evtSub', 'dc3_entity_alarm': 'eaSub', 'dc3_notify_history': 'nhSub'
}

function eh(e: Ent) {
  return HEAD + e.attrs.length * LINE + 8
}

function fill(r: Role) {
  return `var(--dc3-${r}-fill)`
}

function stroke(r: Role) {
  return `var(--dc3-${r}-stroke)`
}
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="aer-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="aer-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aer-grid)" height="100%" width="100%"/>

        <!-- regions: definition (top) vs runtime records (bottom) -->
        <rect fill="var(--dc3-region-be)" height="180" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1200" x="40" y="48"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="66">{{ s.defRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="220" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1200" x="40" y="400"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="418">{{ s.runRegion }}</text>

        <!-- relationships (drawn first, entities cover nothing: all in gutters) -->
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="290" x2="370" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="330" y="122">{{ s.e1 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="600" x2="680" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="640" y="122">{{ s.e2 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="910" x2="990" y1="110"
              y2="110"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="950" y="102">{{ s.e3 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1105" x2="1105" y1="156"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1112" y="300">{{ s.e4 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="485" x2="485" y1="184"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="492" y="300">{{ s.e5 }}</text>
        <path d="M 290 170 H 320 V 430 H 420 V 440" fill="none" marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="326" y="320">{{ s.e6 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="290"
              x2="370" y1="520" y2="505"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="330" y="545">{{ s.e7 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="600" x2="680" y1="500"
              y2="500"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="640" y="492">{{ s.e8 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="910" x2="990" y1="490"
              y2="478"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="950" y="470">{{ s.e9 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="795" x2="795" y1="170"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="802" y="340">{{ s.e10 }}</text>

        <!-- entities -->
        <g v-for="e in ENT" :key="e.k">
          <rect :fill="fill(e.role)" :height="eh(e)" :stroke="stroke(e.role)" :width="W" :x="e.x" :y="e.y" rx="8"
                stroke-width="1.5"/>
          <rect :fill="stroke(e.role)" :height="HEAD" :width="W" :x="e.x" :y="e.y" opacity="0.85" rx="8"/>
          <rect :fill="stroke(e.role)" :height="8" :width="W" :x="e.x" :y="e.y + HEAD - 8"/>
          <text :x="e.x + W / 2" :y="e.y + 17.5" fill="#ffffff" font-size="11.5" font-weight="700"
                text-anchor="middle">{{ e.k }}
          </text>
          <text :x="e.x + W / 2" :y="e.y + HEAD + 15" fill="var(--dc3-text2)" font-size="8" font-style="italic"
                text-anchor="middle">{{ s[SUBS[e.k]] }}
          </text>
          <text v-for="(a, i) in e.attrs" :key="e.k + i" :x="e.x + 12"
                :y="e.y + HEAD + 30 + i * LINE" fill="var(--dc3-text2)" font-size="8.5">{{ a }}
          </text>
        </g>

        <!-- footer notes + legend -->
        <text fill="var(--dc3-text2)" font-size="9" x="60" y="652">{{ s.noteTenant }}</text>
        <text fill="var(--dc3-text2)" font-size="9" x="700" y="652">{{ s.noteFk }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="60" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="677">{{ s.legState }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="190" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="677">{{ s.legDef }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="320" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="342" y="677">{{ s.legJoin }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="480" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="677">{{ s.legChannel }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="630" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="652" y="677">{{ s.legRecord }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="790" x2="808" y1="673" y2="673"/>
        <text fill="var(--dc3-text2)" font-size="9" x="814" y="677">{{ s.legDashed }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
