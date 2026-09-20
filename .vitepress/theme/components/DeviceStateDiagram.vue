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
    stOnline: '0 online', stOnlineSub: '心跳租约有效',
    stOffline: '1 offline', stOfflineSub: '无租约 / 已过期',
    stMaintain: '2 maintain', stMaintainSub: '维护中 · 暂不采集',
    stFault: '3 fault', stFaultSub: '健康检查失败',
    lblInit: '接入前',
    lblHeartbeat: '[驱动心跳 DeviceStateDTO] expire_time = now + timeout · lease_version ++',
    lblExpire: '[扫描器 tick] expire_time ≤ now → 批量判离线',
    lblMaintain: '[驱动上报 maintain]',
    lblResume: '[维护结束 · 恢复心跳]',
    lblFault: '[健康检查失败]',
    lblRecover: '[故障恢复 · 心跳续租]',
    lblFaultExpire: '[租约到期]',
    noteTitle: '状态事实源: dc3_entity_state',
    noteType: 'entity_type_flag = 6 (设备)',
    noteL1: 'enableFlag 是配置态开关 ≠ 在线态',
    noteL2: '心跳不写 dc3_device · 不污染元数据',
    codeTitle: 'EntityStateStatus 状态码',
    chipOn: '0 · online 在线', chipOff: '1 · offline 离线',
    chipMaintain: '2 · maintain 维护', chipFault: '3 · fault 故障',
    leaseNote: '续租: 驱动按周期上报设备健康 → expire_time 顺延 · 超时由扫描器批量判定，不同设备的超时长短体现在各自 expire_time，而非扫描周期',
    legInit: '初始', legOnline: '在线族', legMaintain: '维护',
    legFault: '故障', legOffline: '离线', legSolid: '心跳续租（实线）', legDash: '超时 / 恢复（虚线）',
    aria: '设备在线状态机：在线与离线由心跳租约维护，驱动周期上报续租 expire_time，扫描器把过期的批量判离线；另有维护与故障两个异常态，故障恢复后凭心跳重新上线；状态事实源是 dc3_entity_state 表而非设备表'
  },
  en: {
    stOnline: '0 online', stOnlineSub: 'lease valid',
    stOffline: '1 offline', stOfflineSub: 'no lease / expired',
    stMaintain: '2 maintain', stMaintainSub: 'under maintenance',
    stFault: '3 fault', stFaultSub: 'health check failed',
    lblInit: 'before onboarding',
    lblHeartbeat: '[driver heartbeat DeviceStateDTO] expire_time = now + timeout · lease_version ++',
    lblExpire: '[scanner tick] expire_time ≤ now → batch offline',
    lblMaintain: '[driver reports maintain]',
    lblResume: '[maintenance done · heartbeat back]',
    lblFault: '[health check failed]',
    lblRecover: '[fault recovered · lease renewed]',
    lblFaultExpire: '[lease expired]',
    noteTitle: 'source of truth: dc3_entity_state',
    noteType: 'entity_type_flag = 6 (device)',
    noteL1: 'enableFlag is config toggle ≠ online',
    noteL2: 'heartbeats never touch dc3_device',
    codeTitle: 'EntityStateStatus codes',
    chipOn: '0 · online', chipOff: '1 · offline',
    chipMaintain: '2 · maintain', chipFault: '3 · fault',
    leaseNote: 'Renewal: the driver reports device health periodically, extending expire_time; the scanner batch-marks expired entries offline. Per-device timeout lives in each expire_time, not in the scan period',
    legInit: 'initial', legOnline: 'online family', legMaintain: 'maintain',
    legFault: 'fault', legOffline: 'offline', legSolid: 'heartbeat renewal (solid)', legDash: 'timeout / recovery (dashed)',
    aria: 'Device online state machine: online and offline are maintained by a heartbeat lease — the driver renews expire_time periodically while the scanner batch-marks expired entries offline; maintain and fault are exception states and a recovered fault renews its lease back online; the source of truth is dc3_entity_state, not the device table'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1220 560">
        <defs>
          <marker id="dsd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dsd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dsd-grid)" height="100%" width="100%"/>

        <!-- transitions -->
        <line marker-end="url(#dsd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="78" x2="126" y1="242" y2="242"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="46" y="230">{{ s.lblInit }}</text>
        <line marker-end="url(#dsd-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="300" x2="786" y1="234"
              y2="234"/>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="543" y="224">{{ s.lblHeartbeat }}</text>
        <path d="M 905 275 V 340 H 215 V 280" fill="none" marker-end="url(#dsd-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="560" y="332">{{ s.lblExpire }}</text>
        <path d="M 835 205 V 98 H 614" fill="none" marker-end="url(#dsd-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="714" y="90">{{ s.lblMaintain }}</text>
        <path d="M 610 118 H 855 V 203" fill="none" marker-end="url(#dsd-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="712" y="132">{{ s.lblResume }}</text>
        <path d="M 845 275 V 408 H 614" fill="none" marker-end="url(#dsd-ah)" stroke="var(--dc3-rose-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="728" y="400">{{ s.lblFault }}</text>
        <path d="M 525 436 V 480 H 1010 V 240 H 974" fill="none" marker-end="url(#dsd-ah)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="764" y="472">{{ s.lblRecover }}</text>
        <path d="M 440 428 H 180 V 280" fill="none" marker-end="url(#dsd-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="286" y="420">{{ s.lblFaultExpire }}</text>

        <!-- initial pseudo node -->
        <circle cx="71" cy="242" fill="var(--dc3-text2)" r="5"/>

        <!-- states -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="14" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="130" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="215" y="236">{{
            s.stOffline
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="215" y="254">{{ s.stOfflineSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="14" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="440" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="525" y="92">{{
            s.stMaintain
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="525" y="110">{{ s.stMaintainSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1.2"
              width="180" x="790" y="205"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="880" y="232">{{
            s.stOnline
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="880" y="250">{{ s.stOnlineSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="14" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="170" x="440" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="525" y="402">{{
            s.stFault
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="525" y="420">{{ s.stFaultSub }}</text>

        <!-- note card -->
        <rect fill="var(--dc3-rose-fill)" height="104" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="200" x="1000" y="70"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="1010" y="88">{{ s.noteTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1010" y="106">{{ s.noteType }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1010" y="124">{{ s.noteL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1010" y="142">{{ s.noteL2 }}</text>

        <!-- state code chips -->
        <text fill="var(--dc3-text2)" font-size="9" font-weight="600" x="1040" y="204">{{ s.codeTitle }}</text>
        <rect fill="var(--dc3-be-fill)" height="30" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="1040" y="214"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="1052" y="233">{{ s.chipOn }}</text>
        <rect fill="var(--dc3-ext-fill)" height="30" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="1040" y="250"/>
        <text fill="var(--dc3-text2)" font-size="9" font-weight="600" x="1052" y="269">{{ s.chipOff }}</text>
        <rect fill="var(--dc3-amber-fill)" height="30" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="1040" y="286"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="1052" y="305">{{ s.chipMaintain }}
        </text>
        <rect fill="var(--dc3-rose-fill)" height="30" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="150"
              x="1040" y="322"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="1052" y="341">{{ s.chipFault }}</text>

        <!-- lease explainer -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1100" x="60" y="492"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="72" y="516">{{ s.leaseNote }}</text>

        <!-- legend -->
        <circle cx="66" cy="466" fill="var(--dc3-text2)" r="5"/>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="469">{{ s.legInit }}</text>
        <rect fill="var(--dc3-be-fill)" height="12" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="18"
              x="130" y="460"/>
        <text fill="var(--dc3-text2)" font-size="9" x="154" y="469">{{ s.legOnline }}</text>
        <rect fill="var(--dc3-amber-fill)" height="12" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="18" x="240" y="460"/>
        <text fill="var(--dc3-text2)" font-size="9" x="264" y="469">{{ s.legMaintain }}</text>
        <rect fill="var(--dc3-rose-fill)" height="12" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="18"
              x="350" y="460"/>
        <text fill="var(--dc3-text2)" font-size="9" x="374" y="469">{{ s.legFault }}</text>
        <rect fill="var(--dc3-ext-fill)" height="12" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="18"
              x="450" y="460"/>
        <text fill="var(--dc3-text2)" font-size="9" x="474" y="469">{{ s.legOffline }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="1" x1="560" x2="580" y1="465" y2="465"/>
        <text fill="var(--dc3-text2)" font-size="9" x="586" y="469">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="750" x2="770" y1="465" y2="465"/>
        <text fill="var(--dc3-text2)" font-size="9" x="776" y="469">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
