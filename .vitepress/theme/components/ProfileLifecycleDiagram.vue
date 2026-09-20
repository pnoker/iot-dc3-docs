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
    stDraft: '草稿 DRAFT', stDraftSub: 'POST /profile/add',
    stModel: '建模 MODELING', stModelSub: '补位号 / 指令 / 事件',
    stReady: '就绪 READY', stReadySub: '可被设备绑定 1:N',
    stServe: '运行 SERVING', stServeSub: '设备按模板采集与调用',
    stChange: '变更 CHANGE', stChangeSub: '新增 / 修改能力',
    stDisable: '停用 DISABLED', stDisableSub: '不参与采集',
    stDelete: '已删除 DELETED', stDeleteSub: 'POST /profile/delete',
    chipRun: '运行态产出', chipRunSub: '位号值 · 指令调用 · 事件上报',
    lblCreate: '创建',
    lblModel: '进入建模',
    lblReady: '[能力齐] 设 profileShareFlag',
    lblBindDev: '[设备绑定 profileId]',
    lblChange: '改位号 / 指令 / 事件',
    lblVersion: 'version + 1 · 复用它的设备同步生效',
    lblDisable: 'enableFlag = disable',
    lblEnable: 'enableFlag = enable',
    lblDelete: 'delete · 终态',
    lblProduce: '持续产出',
    legInit: '初始', legState: '状态（圆角矩形）', legFinal: '终态（双框）',
    legGuard: '守卫条件 [ ]', legToggle: '启停开关', legFlow: '运行态产出（虚线）',
    aria: '模板生命周期状态机：创建后进入建模，补齐位号指令事件并设定共享范围后进入就绪；设备绑定 profileId 后进入运行并持续产出位号值、指令调用与事件流水；能力变更递增版本后回到就绪；停用与删除为配置态出口'
  },
  en: {
    stDraft: 'DRAFT', stDraftSub: 'POST /profile/add',
    stModel: 'MODELING', stModelSub: 'add points / commands / events',
    stReady: 'READY', stReadySub: 'bindable by devices 1:N',
    stServe: 'SERVING', stServeSub: 'devices collect & invoke by profile',
    stChange: 'CHANGE', stChangeSub: 'add / modify capabilities',
    stDisable: 'DISABLED', stDisableSub: 'out of collection',
    stDelete: 'DELETED', stDeleteSub: 'POST /profile/delete',
    chipRun: 'Runtime output', chipRunSub: 'point values · command calls · events',
    lblCreate: 'create',
    lblModel: 'start modeling',
    lblReady: '[capabilities complete] set shareFlag',
    lblBindDev: '[device binds profileId]',
    lblChange: 'edit points / commands / events',
    lblVersion: 'version + 1 · reusing devices follow',
    lblDisable: 'enableFlag = disable',
    lblEnable: 'enableFlag = enable',
    lblDelete: 'delete · final',
    lblProduce: 'keeps producing',
    legInit: 'initial', legState: 'state (rounded)', legFinal: 'final (double border)',
    legGuard: 'guard [ ]', legToggle: 'enable toggle', legFlow: 'runtime output (dashed)',
    aria: 'Profile lifecycle state machine: after creation it enters modeling, completes points/commands/events and share scope to become ready; device binding moves it to serving where point values, command calls and event history flow out; capability changes bump the version and return it to ready; disable and delete are configuration-state exits'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 580">
        <defs>
          <marker id="plc-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="plc-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#plc-grid)" height="100%" width="100%"/>

        <!-- transitions (drawn before state nodes) -->
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="66" x2="86" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="46" y="190">{{ s.lblCreate }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="250" x2="306" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="278" y="192">{{ s.lblModel }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="490" x2="546" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="518" y="192">{{ s.lblReady }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="720" x2="776" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="748" y="192">{{ s.lblBindDev }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="940" x2="996" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="968" y="192">{{ s.lblChange }}</text>
        <path d="M 1100 170 V 110 H 635 V 166" fill="none" marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="868" y="102">{{ s.lblVersion }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1" x1="605" x2="605" y1="234"
              y2="376"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="613" y="300">{{ s.lblDisable }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1" x1="675" x2="675" y1="378"
              y2="238"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="683" y="330">{{ s.lblEnable }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="720" x2="996" y1="408" y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="858" y="398">{{ s.lblDelete }}</text>
        <line marker-end="url(#plc-ah)" stroke="var(--dc3-db-stroke)" stroke-dasharray="4,4" stroke-width="0.8" x1="860"
              x2="860" y1="234" y2="296"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="868" y="270">{{ s.lblProduce }}</text>

        <!-- initial pseudo node -->
        <circle cx="61" cy="202" fill="var(--dc3-text2)" r="5"/>

        <!-- state nodes -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="90" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="170" y="196">{{
            s.stDraft
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="214">{{ s.stDraftSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="310" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="400" y="196">{{
            s.stModel
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="400" y="214">{{ s.stModelSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="550" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="635" y="196">{{
            s.stReady
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="635" y="214">{{ s.stReadySub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="780" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="860" y="196">{{
            s.stServe
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="860" y="214">{{ s.stServeSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="14" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="1000" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1090" y="196">{{
            s.stChange
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1090" y="214">{{ s.stChangeSub }}</text>

        <!-- runtime output chip -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="180"
              x="770" y="298"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="860" y="320">{{
            s.chipRun
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="860" y="338">{{ s.chipRunSub }}</text>

        <!-- DISABLED state -->
        <rect fill="var(--dc3-amber-fill)" height="56" rx="14" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="550" y="378"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="635" y="400">{{
            s.stDisable
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="635" y="418">{{ s.stDisableSub }}</text>

        <!-- DELETED final state (double border) -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="14" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="996" y="380"/>
        <rect fill="none" height="46" rx="10" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="160" x="1001"
              y="385"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1081" y="402">{{
            s.stDelete
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1081" y="420">{{ s.stDeleteSub }}</text>

        <!-- legend -->
        <circle cx="56" cy="512" fill="var(--dc3-text2)" r="5"/>
        <text fill="var(--dc3-text2)" font-size="9" x="68" y="515">{{ s.legInit }}</text>
        <rect fill="var(--dc3-be-fill)" height="12" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="18"
              x="130" y="506"/>
        <text fill="var(--dc3-text2)" font-size="9" x="154" y="515">{{ s.legState }}</text>
        <rect fill="none" height="12" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="18" x="290"
              y="506"/>
        <rect fill="none" height="8" rx="4" stroke="var(--dc3-ext-stroke)" stroke-width="0.8" width="12" x="293"
              y="508"/>
        <text fill="var(--dc3-text2)" font-size="9" x="314" y="515">{{ s.legFinal }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="440" y="515">[{{ s.legGuard }}]</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="580" y="506"/>
        <text fill="var(--dc3-text2)" font-size="9" x="602" y="515">{{ s.legToggle }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="730" x2="750" y1="511"
              y2="511"/>
        <text fill="var(--dc3-text2)" font-size="9" x="756" y="515">{{ s.legFlow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
