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
    stPending: 'PENDING', stPendingSub: '0 · 已提交待发布',
    stSent: 'SENT', stSentSub: '1 · 已发布待驱动处理',
    stSuccess: 'SUCCESS', stSuccessSub: '2 · 驱动确认成功',
    stFailed: 'FAILED', stFailedSub: '3 · 执行失败 / 重投后异常',
    stExpired: 'EXPIRED', stExpiredSub: '5 · 执行前 expireAt 已过',
    stDuplicate: 'DUPLICATE', stDuplicateSub: '7 · 去重缓存命中',
    stDead: 'DEAD', stDeadSub: '6 · 校验失败 reject → 死信',
    stTimeout: 'TIMEOUT（预留）', stTimeoutSub: '4 · 当前链路无生产者',
    lblSubmit: '提交',
    lblPublish: '提交侧发布',
    lblRetry: '[执行异常·非重投] nack(requeue=true) 重试一次',
    lblSuccess: '[execute() 成功 · 带回执值]',
    lblFailed: '[写/执行失败 · 或重投后仍异常]',
    lblExpired: '[now > expireAt 预检]',
    lblDuplicate: '[Caffeine 去重命中 commandId]',
    lblDead: '[载荷校验失败 → 死信队列]',
    lblTimeout: '预留枚举位 · 无活跃入边（注记）',
    noteL1: '状态落库 dc3_command_history.status · 提交侧只负责 PENDING → SENT',
    noteL2: '其余终态均由驱动消费产生的回执经 result 队列写回 · 每条命令最多被驱动尝试两次',
    legInit: '初始', legDoing: '进行中', legOk: '成功终态',
    legFail: '失败族终态', legReserved: '预留（虚线）', legGuard: '守卫条件 [ ]',
    aria: '命令状态机：PENDING 经提交侧发布进入 SENT；驱动消费后按守卫条件分流到 SUCCESS、FAILED、EXPIRED、DUPLICATE、DEAD 五个终态，执行异常首次 nack 重投一次、重投仍失败则 FAILED；TIMEOUT 是无生产者的预留枚举位，仅注记不画活跃边'
  },
  en: {
    stPending: 'PENDING', stPendingSub: '0 · submitted, not published',
    stSent: 'SENT', stSentSub: '1 · published, awaiting driver',
    stSuccess: 'SUCCESS', stSuccessSub: '2 · driver confirmed ok',
    stFailed: 'FAILED', stFailedSub: '3 · failed / still failing after requeue',
    stExpired: 'EXPIRED', stExpiredSub: '5 · expireAt passed before exec',
    stDuplicate: 'DUPLICATE', stDuplicateSub: '7 · dedupe cache hit',
    stDead: 'DEAD', stDeadSub: '6 · payload invalid → dead letter',
    stTimeout: 'TIMEOUT (reserved)', stTimeoutSub: '4 · no producer today',
    lblSubmit: 'submit',
    lblPublish: 'publisher side',
    lblRetry: '[exception, first try] nack(requeue=true) retry once',
    lblSuccess: '[execute() ok · value echoed]',
    lblFailed: '[write/execute failed · or failing after requeue]',
    lblExpired: '[now > expireAt pre-check]',
    lblDuplicate: '[Caffeine dedupe hit on commandId]',
    lblDead: '[payload invalid → dead letter]',
    lblTimeout: 'reserved slot · no active edge (annotation)',
    noteL1: 'status persisted in dc3_command_history.status · submitter only drives PENDING → SENT',
    noteL2: 'every final state comes from the driver receipt via the result queue · each command is tried at most twice',
    legInit: 'initial', legDoing: 'in progress', legOk: 'success final',
    legFail: 'failure family', legReserved: 'reserved (dashed)', legGuard: 'guard [ ]',
    aria: 'Command state machine: PENDING is published to SENT by the submitter; driver consumption fans out by guards into the five final states SUCCESS, FAILED, EXPIRED, DUPLICATE and DEAD — a first exception requeues once and a second failure lands FAILED; TIMEOUT is a reserved enum slot with no producer, annotated instead of drawn as an active edge'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 640">
        <defs>
          <marker id="cms-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cms-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cms-grid)" height="100%" width="100%"/>

        <!-- transitions -->
        <line marker-end="url(#cms-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="62" x2="86" y1="242" y2="242"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="42" y="228">{{ s.lblSubmit }}</text>
        <line marker-end="url(#cms-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="250" x2="356" y1="242" y2="242"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="303" y="232">{{ s.lblPublish }}</text>
        <path d="M 420 274 V 320 H 470 V 278" fill="none" marker-end="url(#cms-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="445" y="336">{{ s.lblRetry }}</text>
        <path d="M 520 218 H 700 V 84 H 972" fill="none" marker-end="url(#cms-ah)" stroke="var(--dc3-be-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="836" y="76">{{ s.lblSuccess }}</text>
        <path d="M 520 232 H 720 V 180 H 972" fill="none" marker-end="url(#cms-ah)" stroke="var(--dc3-rose-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="836" y="172">{{ s.lblFailed }}</text>
        <path d="M 520 246 H 740 V 276 H 972" fill="none" marker-end="url(#cms-ah)"
              stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="836" y="268">{{ s.lblExpired }}</text>
        <path d="M 520 260 H 760 V 372 H 972" fill="none" marker-end="url(#cms-ah)" stroke="var(--dc3-db-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="846" y="364">{{ s.lblDuplicate }}</text>
        <path d="M 520 270 H 780 V 468 H 972" fill="none" marker-end="url(#cms-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="846" y="460">{{ s.lblDead }}</text>

        <!-- initial pseudo node -->
        <circle cx="57" cy="242" fill="var(--dc3-text2)" r="5"/>

        <!-- in-progress states -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="90" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="170" y="236">{{
            s.stPending
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="254">{{ s.stPendingSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="160"
              x="360" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="440" y="236">{{
            s.stSent
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="440" y="254">{{ s.stSentSub }}</text>

        <!-- terminal states -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="200"
              x="980" y="56"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="78">{{
            s.stSuccess
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="1080" y="96">{{ s.stSuccessSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="14" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="200"
              x="980" y="152"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="174">{{
            s.stFailed
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="192">{{ s.stFailedSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="14" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="980" y="248"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="270">{{
            s.stExpired
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="288">{{ s.stExpiredSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="14" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="980" y="344"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="366">{{
            s.stDuplicate
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="1080" y="384">{{ s.stDuplicateSub }}
        </text>
        <rect fill="var(--dc3-ext-fill)" height="56" rx="14" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="980" y="440"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="462">{{
            s.stDead
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="480">{{ s.stDeadSub }}</text>

        <!-- reserved TIMEOUT (annotation only, no active edge) -->
        <rect fill="none" height="56" rx="14" stroke="var(--dc3-text2)" stroke-dasharray="5,4" stroke-width="1"
              width="190" x="560" y="460"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="655" y="482">{{
            s.stTimeout
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="655" y="500">{{ s.stTimeoutSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="655" y="532">{{ s.lblTimeout }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-be)" height="40" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1180" x="60" y="548"/>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="72" y="564">{{ s.noteL1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="72" y="580">{{ s.noteL2 }}</text>

        <!-- legend -->
        <circle cx="66" cy="616" fill="var(--dc3-text2)" r="5"/>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="619">{{ s.legInit }}</text>
        <rect fill="var(--dc3-be-fill)" height="12" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="18"
              x="130" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="154" y="619">{{ s.legDoing }}</text>
        <rect fill="var(--dc3-be-fill)" height="12" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="18"
              x="240" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="264" y="619">{{ s.legOk }}</text>
        <rect fill="var(--dc3-rose-fill)" height="12" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="18"
              x="360" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="384" y="619">{{ s.legFail }}</text>
        <rect fill="none" height="12" rx="6" stroke="var(--dc3-text2)" stroke-dasharray="4,3" stroke-width="1"
              width="18" x="490" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="514" y="619">{{ s.legReserved }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="630" y="619">[{{ s.legGuard }}]</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
