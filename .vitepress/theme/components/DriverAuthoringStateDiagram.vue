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
    aria: '驱动生命周期状态机：进程启动后进入注册中，以指数退避重试向管理中心注册（至多 30 次），成功进入已注册并执行一次性 initial()，随后进入运行态由定时任务驱动读采集、自定义调度与健康检查；重试耗尽则异常退出。下方为在线态状态机：ONLINE 与 OFFLINE 之间由状态租约到期与续租驱动切换，MAINTAIN 为维护态，FAULT 为故障态，可由任意态上报进入',
    regA: '进程生命周期 · DriverInitRunner（ApplicationRunner 引导序列）',
    regB: '在线态 · EntityStatusEnum（驱动 / 设备健康，租约模型）',
    startLbl: '进程启动', bootLbl: 'Spring Boot 启动',
    st1: '注册中', st1s: 'registerWithRetry()',
    retryLbl: '指数退避 2s→30s · ≤30 次',
    okLbl: '注册成功', st2: '已注册', st2s: 'dc3_driver 落库',
    initLbl: 'initial() 一次性初始化', st3: '运行中', st3s: 'schedule 定时任务',
    loopL1: 'read cron 0/30s · custom 0/5s',
    loopL2: 'health 0/15s · event(...) 元数据变更',
    failT: '注册失败退出', failS: '异常 → CrashLoopBackOff',
    failLbl: '重试 30 次耗尽',
    onT: 'ONLINE (0)', onS: '在线 · 租约有效',
    offT: 'OFFLINE (1)', offS: '租约到期未续',
    maintT: 'MAINTAIN (2)', maintS: '维护中',
    faultT: 'FAULT (3)', faultS: '故障',
    tExpire: 'TTL 到期', tRenew: '续租恢复',
    tMaint: '进入维护', tResume: '维护完成恢复',
    tFault: '任意态 · 故障上报',
    legNormal: '正常状态', legBad: '离线 / 失败态', legMaint: '维护态',
    legStart: '起点', legMove: '状态迁移', legFault: '故障上报'
  },
  en: {
    aria: 'Driver lifecycle state machine: after the process starts it enters Registering, retrying registration with the manager using exponential backoff (at most 30 attempts); success leads to Registered, a one-off initial(), then Running where cron jobs drive collection, custom schedules and health checks; exhausting the retries exits with an exception. Below, the online-state machine: ONLINE and OFFLINE toggle via lease expiry and renewal, MAINTAIN marks maintenance, and FAULT can be reported from any state',
    regA: 'Process lifecycle · DriverInitRunner (ApplicationRunner boot sequence)',
    regB: 'Online states · EntityStatusEnum (driver / device health, lease model)',
    startLbl: 'process starts', bootLbl: 'Spring Boot boot',
    st1: 'Registering', st1s: 'registerWithRetry()',
    retryLbl: 'exponential backoff 2s→30s · ≤30 tries',
    okLbl: 'registered', st2: 'Registered', st2s: 'persisted in dc3_driver',
    initLbl: 'initial() one-off init', st3: 'Running', st3s: 'schedule cron jobs',
    loopL1: 'read cron 0/30s · custom 0/5s',
    loopL2: 'health 0/15s · event(...) metadata change',
    failT: 'Registration failed, exit', failS: 'exception → CrashLoopBackOff',
    failLbl: '30 retries exhausted',
    onT: 'ONLINE (0)', onS: 'online · lease valid',
    offT: 'OFFLINE (1)', offS: 'lease expired',
    maintT: 'MAINTAIN (2)', maintS: 'maintenance',
    faultT: 'FAULT (3)', faultS: 'fault',
    tExpire: 'lease expired', tRenew: 'renewed',
    tMaint: 'enter maintenance', tResume: 'maintenance done',
    tFault: 'any state · fault report',
    legNormal: 'Normal state', legBad: 'Offline / failure state', legMaint: 'Maintenance',
    legStart: 'Start', legMove: 'State transition', legFault: 'Fault report'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 640">
        <defs>
          <marker id="dast-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="dast-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dast-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dast-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1160" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regA }}</text>
        <rect fill="var(--dc3-region-amber)" height="210" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1160" x="40" y="370"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="388">{{ s.regB }}</text>

        <!-- lifecycle arrows -->
        <line marker-end="url(#dast-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="112" x2="164" y1="172"
              y2="172"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="138" y="164">{{ s.bootLbl }}</text>
        <line marker-end="url(#dast-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="354" x2="426" y1="172"
              y2="172"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="390" y="164">{{ s.okLbl }}</text>
        <line marker-end="url(#dast-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="604" x2="676" y1="172"
              y2="172"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="640" y="160">{{ s.initLbl }}</text>
        <path d="M 215,138 C 230,104 300,104 315,138" fill="none" marker-end="url(#dast-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="265" y="100">{{ s.retryLbl }}</text>
        <path d="M 715,206 C 730,242 830,242 845,206" fill="none" marker-end="url(#dast-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="780" y="252">{{ s.loopL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="780" y="266">{{ s.loopL2 }}</text>
        <line marker-end="url(#dast-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="280" x2="424" y1="208" y2="258"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="336" y="240">{{ s.failLbl }}</text>

        <!-- online-state arrows -->
        <line marker-end="url(#dast-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="252" x2="394"
              y1="446" y2="446"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="323" y="438">{{ s.tExpire }}</text>
        <line marker-end="url(#dast-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="396" x2="254" y1="470"
              y2="470"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="325" y="462">{{ s.tRenew }}</text>
        <path d="M 250,480 C 420,544 600,544 700,480" fill="none" marker-end="url(#dast-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="475" y="540">{{ s.tMaint }}</text>
        <path d="M 700,490 C 620,570 330,570 250,490" fill="none" marker-end="url(#dast-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="475" y="574">{{ s.tResume }}</text>
        <path d="M 175,424 C 400,352 900,352 996,424" fill="none" marker-end="url(#dast-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="600" y="372">{{ s.tFault }}</text>

        <!-- lifecycle nodes -->
        <circle cx="100" cy="172" fill="var(--dc3-be-fill)" r="13" stroke="var(--dc3-be-stroke)" stroke-width="1.5"/>
        <circle cx="100" cy="172" fill="var(--dc3-be-stroke)" r="6"/>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="100" y="204">{{ s.startLbl }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="180" x="170" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="260" y="166">
          {{ s.st1 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="260" y="186">{{ s.st1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="170" x="430" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="515" y="166">
          {{ s.st2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="515" y="186">{{ s.st2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="2"
              width="190" x="680" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" text-anchor="middle" x="775" y="166">
          {{ s.st3 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="775" y="186">{{ s.st3s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="10" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="180" x="424" y="258"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="600" text-anchor="middle" x="514" y="282">
          {{ s.failT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="514" y="300">{{ s.failS }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="920" y="176">initial() 只在启动时执行一次：</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="920" y="192">建连接池 / 订阅关系等重资源</text>

        <!-- online-state nodes -->
        <rect fill="var(--dc3-be-fill)" height="52" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="150" x="100" y="432"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="175" y="454">
          {{ s.onT }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="175" y="472">{{ s.onS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="52" rx="10" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="400" y="432"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="475" y="454">
          {{ s.offT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="475" y="472">{{ s.offS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="10" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="150" x="700" y="432"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="775" y="454">
          {{ s.maintT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="775" y="472">{{ s.maintS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="52" rx="10" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="1000" y="432"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1075" y="454">
          {{ s.faultT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1075" y="472">{{ s.faultS }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="621">{{ s.legNormal }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="200" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="621">{{ s.legBad }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="370" y="612"/>
        <text fill="var(--dc3-text2)" font-size="9" x="392" y="621">{{ s.legMaint }}</text>
        <circle cx="530" cy="618" fill="var(--dc3-be-fill)" r="6" stroke="var(--dc3-be-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="544" y="621">{{ s.legStart }}</text>
        <line marker-end="url(#dast-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="620" x2="648" y1="618"
              y2="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="654" y="621">{{ s.legMove }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="790" x2="818" y1="618"
              y2="618"/>
        <text fill="var(--dc3-text2)" font-size="9" x="824" y="621">{{ s.legFault }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
