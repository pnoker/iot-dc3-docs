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
    stStart: '启动中 STARTING', stStartSub: '进程启动 · DriverInitRunner',
    stReg: '注册中 REGISTERING', stRegSub: 'RegisterBO → Manager',
    stOnline: '在线 ONLINE', stOnlineSub: 'DriverHealth 心跳 · 租约 45s',
    stMaintain: '维护 MAINTAIN', stMaintainSub: '暂不承接采集',
    stFault: '故障 FAULT', stFaultSub: '健康检查失败',
    stOffline: '离线 OFFLINE', stOfflineSub: '租约到期 · 名下设备转入离线扫描',
    lblBoot: '启动',
    lblRegister: '上报 DriverBO + DriverAttributes',
    lblRetry: '[注册失败] 指数退避 · 重试直至成功',
    lblLease: '[注册成功] 写入 dc3_entity_state 租约',
    lblExpire: '[45s 未续租]',
    lblRecover: '[进程恢复 · 心跳续租]',
    lblMaintain: '[进入维护]',
    lblResume: '[维护完成]',
    lblFault: '[健康检查失败]',
    lblFaultExpire: '[租约到期]',
    lblFaultRecover: '[故障恢复]',
    noteMeta: 'dc3_driver = 配置元数据（查"有哪些驱动"）',
    noteState: 'dc3_entity_state = 运行态租约（查"现在通不通"）· 状态: online / offline / maintain / fault',
    legInit: '初始', legState: '状态', legSolid: '正常流转（实线）',
    legDash: '超时 / 恢复（虚线）', legLoop: '重试自环',
    aria: '驱动生命周期状态机：启动后由 DriverInitRunner 触发注册，失败按指数退避重试直至成功；注册成功即写入 dc3_entity_state 租约进入在线，SDK 周期心跳每 45 秒续租；租约到期判定离线，进程恢复后凭心跳重新上线，另有维护与故障两个异常态'
  },
  en: {
    stStart: 'STARTING', stStartSub: 'process boot · DriverInitRunner',
    stReg: 'REGISTERING', stRegSub: 'RegisterBO → Manager',
    stOnline: 'ONLINE', stOnlineSub: 'DriverHealth heartbeat · 45s lease',
    stMaintain: 'MAINTAIN', stMaintainSub: 'not accepting collection',
    stFault: 'FAULT', stFaultSub: 'health check failed',
    stOffline: 'OFFLINE', stOfflineSub: 'lease expired · devices fall to offline scan',
    lblBoot: 'boot',
    lblRegister: 'report DriverBO + DriverAttributes',
    lblRetry: '[register failed] exponential backoff until success',
    lblLease: '[registered] lease written to dc3_entity_state',
    lblExpire: '[not renewed in 45s]',
    lblRecover: '[process back · lease renewed]',
    lblMaintain: '[enter maintenance]',
    lblResume: '[maintenance done]',
    lblFault: '[health check failed]',
    lblFaultExpire: '[lease expired]',
    lblFaultRecover: '[fault recovered]',
    noteMeta: 'dc3_driver = config metadata ("which drivers exist")',
    noteState: 'dc3_entity_state = runtime lease ("is it reachable now") · states: online / offline / maintain / fault',
    legInit: 'initial', legState: 'state', legSolid: 'normal transition (solid)',
    legDash: 'timeout / recovery (dashed)', legLoop: 'retry self-loop',
    aria: 'Driver lifecycle state machine: boot triggers registration via DriverInitRunner with exponential backoff until success; success writes a lease into dc3_entity_state and the SDK renews it every 45 seconds via heartbeat; expiry marks the driver offline, a recovered process renews back online, plus maintain and fault exception states'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 600">
        <defs>
          <marker id="dvl-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dvl-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dvl-grid)" height="100%" width="100%"/>

        <!-- transitions -->
        <line marker-end="url(#dvl-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="62" x2="76" y1="232" y2="232"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="40" y="220">{{ s.lblBoot }}</text>
        <line marker-end="url(#dvl-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="250" x2="306" y1="232" y2="232"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="278" y="222">{{ s.lblRegister }}</text>
        <path d="M 380 200 V 148 H 450 V 196" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="415" y="140">{{ s.lblRetry }}</text>
        <line marker-end="url(#dvl-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="500" x2="746" y1="232"
              y2="232"/>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="623" y="222">{{ s.lblLease }}</text>
        <line marker-end="url(#dvl-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="930" x2="1016" y1="232"
              y2="232"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="973" y="222">{{ s.lblExpire }}</text>
        <path d="M 1060 264 V 330 H 840 V 274" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="950" y="322">{{ s.lblRecover }}</text>
        <path d="M 790 200 V 88 H 704" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="752" y="80">{{ s.lblMaintain }}</text>
        <path d="M 615 116 V 160 H 770 V 198" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="692" y="152">{{ s.lblResume }}</text>
        <path d="M 790 270 V 408 H 704" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-rose-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="760" y="400">{{ s.lblFault }}</text>
        <path d="M 615 416 V 450 H 1120 V 268" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="860" y="442">{{ s.lblFaultExpire }}
        </text>
        <path d="M 700 372 H 724 V 254 H 746" fill="none" marker-end="url(#dvl-ah)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="end" x="716" y="310">{{ s.lblFaultRecover }}
        </text>

        <!-- initial pseudo node -->
        <circle cx="57" cy="232" fill="var(--dc3-text2)" r="5"/>

        <!-- states -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="80" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="165" y="226">{{
            s.stStart
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="165" y="244">{{ s.stStartSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="310" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="405" y="226">{{
            s.stReg
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="405" y="244">{{ s.stRegSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1.2"
              width="180" x="750" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="840" y="226">{{
            s.stOnline
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="840" y="244">{{ s.stOnlineSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="14" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="530" y="60"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="615" y="82">{{
            s.stMaintain
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="615" y="100">{{ s.stMaintainSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="14" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="170" x="530" y="360"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="615" y="382">{{
            s.stFault
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="615" y="400">{{ s.stFaultSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="14" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="1020" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1105" y="226">{{
            s.stOffline
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1105" y="244">{{ s.stOfflineSub }}</text>

        <!-- metadata vs runtime note -->
        <rect fill="var(--dc3-region-amber)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1120" x="60" y="486"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="72" y="504">{{ s.noteMeta }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="72" y="520">{{ s.noteState }}</text>

        <!-- legend -->
        <circle cx="66" cy="560" fill="var(--dc3-text2)" r="5"/>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="563">{{ s.legInit }}</text>
        <rect fill="var(--dc3-be-fill)" height="12" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="18"
              x="130" y="554"/>
        <text fill="var(--dc3-text2)" font-size="9" x="154" y="563">{{ s.legState }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="1" x1="240" x2="260" y1="559" y2="559"/>
        <text fill="var(--dc3-text2)" font-size="9" x="266" y="563">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="440" x2="460" y1="559" y2="559"/>
        <text fill="var(--dc3-text2)" font-size="9" x="466" y="563">{{ s.legDash }}</text>
        <path d="M 640 559 H 668" fill="none" stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <path d="M 654 559 V 550 H 668 V 556" fill="none" marker-end="url(#dvl-ah)"
              stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="678" y="563">{{ s.legLoop }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
