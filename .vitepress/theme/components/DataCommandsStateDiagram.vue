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
    aria: '命令状态机：命令从 PENDING(0) 经发布确认转 SENT(1)，再由驱动回执或时效判定进入六种终态——SUCCESS(2)、FAILED(3)、TIMEOUT(4 预留)、EXPIRED(5)、DEAD(6)、DUPLICATE(7)；提交前校验不过则不产生命令',
    dcRegion: '数据中心 dc3-center-data · dc3_point_command_history.status',
    drvRegion: '驱动执行回执 Driver verdict · dc3.e.point_command_result',
    expRegion: '时效 · 去重 · 死信 Expiry / Dedup / DLX',
    entry: 'POST /point_command/write · /read',
    pending: 'PENDING',
    pendingSub: '(0) 已落库 · 待发布',
    sent: 'SENT',
    sentSub: '(1) 已入队列 · 等驱动消费',
    confirm: '发布确认 publisher confirm',
    tSuccess: 'read()/write() 成功',
    tFailed: '驱动明确失败',
    tDuplicate: '命中驱动去重缓存',
    tExpired: '消费时已过 expireAt',
    tTimeout: '应用层等不到回执（预留）',
    tDead: '被拒入死信队列 DLX',
    success: 'SUCCESS',
    successSub: '(2) 终态 · 写成功才记',
    failed: 'FAILED',
    failedSub: '(3) 终态 · 无回显值',
    duplicate: 'DUPLICATE',
    duplicateSub: '(7) 终态 · 重复被挡',
    expired: 'EXPIRED',
    expiredSub: '(5) 终态 · 默认 10s 时效',
    timeout: 'TIMEOUT',
    timeoutSub: '(4) 当前无生产者',
    dead: 'DEAD',
    deadSub: '(6) 终态 · 不再处理',
    reject: '校验拒绝（不产生命令）',
    rejectSub: '租户不一致 · 设备/位号停用 · rwFlag 只读 · 驱动离线',
    rejectEdge: '任一校验不过',
    offline: '设备/驱动离线：停在 SENT 直至 EXPIRED',
    legTransit: '过程态（0/1）',
    legOk: '终态 · 成功',
    legFail: '终态 · 失败',
    legExp: '终态 · 时效/去重',
    legFinal: '双环 = 终态（不再流转）',
    legReserved: '虚线边框 = 预留状态'
  },
  en: {
    aria: 'Command state machine: a command goes PENDING(0) → SENT(1) on publisher confirm, then reaches one of six terminal states via driver receipt or expiry checks — SUCCESS(2), FAILED(3), TIMEOUT(4 reserved), EXPIRED(5), DEAD(6), DUPLICATE(7); failed pre-checks reject the request before any command exists',
    dcRegion: 'Data Center dc3-center-data · dc3_point_command_history.status',
    drvRegion: 'Driver verdict · dc3.e.point_command_result',
    expRegion: 'Expiry / Dedup / Dead-letter',
    entry: 'POST /point_command/write · /read',
    pending: 'PENDING',
    pendingSub: '(0) persisted, awaiting publish',
    sent: 'SENT',
    sentSub: '(1) queued, awaiting driver',
    confirm: 'publisher confirm (broker ACK)',
    tSuccess: 'read()/write() succeeded',
    tFailed: 'driver reports failure',
    tDuplicate: 'hit driver dedup cache',
    tExpired: 'expireAt already passed at consume',
    tTimeout: 'no app-level receipt (reserved)',
    tDead: 'rejected into dead-letter queue',
    success: 'SUCCESS',
    successSub: '(2) final · only on confirmed write',
    failed: 'FAILED',
    failedSub: '(3) final · no response value',
    duplicate: 'DUPLICATE',
    duplicateSub: '(7) final · deduped',
    expired: 'EXPIRED',
    expiredSub: '(5) final · default 10s TTL',
    timeout: 'TIMEOUT',
    timeoutSub: '(4) no producer today',
    dead: 'DEAD',
    deadSub: '(6) final · not processed',
    reject: 'validation rejected (no command)',
    rejectSub: 'tenant mismatch · device/point disabled · read-only rwFlag · driver offline',
    rejectEdge: 'any check fails',
    offline: 'device/driver offline: stays SENT until EXPIRED',
    legTransit: 'transient (0/1)',
    legOk: 'final · success',
    legFail: 'final · failure',
    legExp: 'final · expiry/dedup',
    legFinal: 'double ring = terminal state',
    legReserved: 'dashed border = reserved'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

// terminal states: [dictKey, yCenter, colorRole]
const TERMINALS = [
  {k: 'success', y: 120}, {k: 'failed', y: 200}, {k: 'duplicate', y: 280},
  {k: 'expired', y: 360}, {k: 'timeout', y: 440}, {k: 'dead', y: 520}
] as const
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1220 650">
        <defs>
          <marker id="dcs-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="dcs-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dcs-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dcs-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="480" x="36" y="236"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="48" y="254">{{ s.dcRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="254" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="286" x="658" y="58"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="670" y="76">{{ s.drvRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="246" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="286" x="658" y="322"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="670" y="340">{{ s.expRegion }}</text>

        <!-- entry -->
        <circle cx="56" cy="300" fill="var(--dc3-arrow)" r="9"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="56" y="274">{{ s.entry }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.4" x1="66" x2="92" y1="300"
              y2="300"/>
        <!-- pre-check rejection branch (before any state exists) -->
        <path d="M 56 309 V 424 H 92" fill="none" marker-end="url(#dcs-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="64" y="372">{{ s.rejectEdge }}</text>

        <!-- PENDING -> SENT -->
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.4" x1="216" x2="342" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="279" y="290">{{ s.confirm }}</text>

        <!-- SENT -> terminals: fan from two staggered exit points -->
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="288"
              y2="120"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="580" y="186">{{ s.tSuccess }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="288"
              y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="562" y="274">{{ s.tFailed }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="288"
              y2="280"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="628" y="300">{{ s.tDuplicate }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="312"
              y2="360"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="566" y="352">{{ s.tExpired }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="312"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="566" y="404">{{ s.tTimeout }}</text>
        <line marker-end="url(#dcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="486" x2="652" y1="312"
              y2="520"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="566" y="478">{{ s.tDead }}</text>

        <!-- offline note (dashed, points at nothing new) -->
        <text fill="var(--dc3-text2)" font-size="8" font-style="italic" x="96" y="586">{{ s.offline }}</text>

        <!-- transient states -->
        <rect fill="var(--dc3-fe-fill)" height="60" rx="30" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="120" x="96" y="270"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12.5" font-weight="600" text-anchor="middle" x="156"
              y="297">{{ s.pending }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="156" y="315">{{ s.pendingSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="10" stroke="var(--dc3-fe-stroke)" stroke-width="2"
              width="140" x="346" y="268"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="416"
              y="297">{{ s.sent }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="416" y="315">{{ s.sentSub }}</text>

        <!-- rejection box -->
        <rect fill="var(--dc3-rose-fill)" height="52" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" width="204" x="92" y="424"/>
        <text class="d-name" fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" text-anchor="middle"
              x="194" y="444">{{ s.reject }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="194" y="462">{{ s.rejectSub }}</text>

        <!-- terminal states: double ring, colored by outcome -->
        <g v-for="t in TERMINALS" :key="t.k">
          <!-- outer ring -->
          <rect :stroke="t.k === 'success' ? 'var(--dc3-be-stroke)'
            : (t.k === 'failed' || t.k === 'dead') ? 'var(--dc3-rose-stroke)' : 'var(--dc3-amber-stroke)'"
                :stroke-dasharray="t.k === 'timeout' ? '5,4' : 'none'" :x="660" :y="t.y - 33" fill="none" height="66"
                rx="8" stroke-width="1.5" width="182"/>
          <!-- inner box -->
          <rect :fill="t.k === 'success' ? 'var(--dc3-be-fill)'
            : (t.k === 'failed' || t.k === 'dead') ? 'var(--dc3-rose-fill)' : 'var(--dc3-amber-fill)'"
                :stroke-dasharray="t.k === 'timeout' ? '5,4' : 'none'" :x="666" :y="t.y - 27" height="54" rx="5"
                stroke-width="0" width="170"/>
          <text :fill="t.k === 'success' ? 'var(--dc3-be-text)'
            : (t.k === 'failed' || t.k === 'dead') ? 'var(--dc3-rose-stroke)' : 'var(--dc3-box-name)'"
                :x="751" :y="t.y - 3" class="d-name" font-size="12" font-weight="600" text-anchor="middle">
            {{ s[t.k] }}
          </text>
          <text :x="751" :y="t.y + 15" fill="var(--dc3-text2)" font-size="8" text-anchor="middle">
            {{ s[t.k + 'Sub'] }}
          </text>
        </g>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="5" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="621">{{ s.legTransit }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="200" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="621">{{ s.legOk }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="340" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="621">{{ s.legFail }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="480" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="621">{{ s.legExp }}</text>
        <rect fill="none" height="11" rx="2" stroke="var(--dc3-text2)" stroke-width="1" width="16" x="630" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="652" y="621">{{ s.legFinal }}</text>
        <rect fill="none" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3" stroke-width="1"
              width="16" x="810" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="832" y="621">{{ s.legReserved }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
