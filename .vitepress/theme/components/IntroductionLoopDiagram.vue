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
    coreTitle: 'IoT DC3 闭环',
    coreSub1: '数据上行 + 命令下行',
    coreSub2: '位号值带语义 · 单位 · 时间戳 · 租户上下文',
    coreSub3: '每一步受权限与确认机制约束',
    n1: '① 驱动采集 Driver', n1Sub: '多协议接入 · 读寄存器 / Topic',
    n2: '② 归一存储 Data Center', n2Sub: 'PointValue 带语义 · 单位 · 时间戳',
    n3: '③ 大模型分析 LLM', n3Sub: 'Spring AI @Tool · 读取分析',
    n4: '④ 命令下发 Command', n4Sub: '写位号 / 自定义指令 · 权限确认',
    n5: '⑤ 设备执行 Device', n5Sub: '执行并回执 → 产生新数据',
    gap1Title: '缺口 1 · 数据出不来，AI 用不上',
    gap1Fix: '→ ①② 多协议采集 + 语义归一解决',
    gap2Title: '缺口 2 · AI 只能看，不能动',
    gap2Fix: '→ ③④⑤ 工具调用 + 闭环执行解决',
    lbl12: 'rawValue → calValue 上行',
    lbl23: '带语义 · 模型可直接消费',
    lbl34: '决策落为动作',
    lbl45: '协议报文下发设备',
    lbl51: '执行并回执 · 新数据再采集',
    legCollect: '采集', legNormalize: '归一存储', legAnalyze: 'AI 分析',
    legCommand: '命令下发', legDevice: '执行回执',
    legUp: '上行链路', legDown: '下行链路',
    aria: 'IoT DC3 核心闭环：驱动从设备多协议采集原始值并换算归一，数据中心存成带语义的 PointValue；大模型经 Spring AI 工具调用读取分析，再把决策以写位号或自定义指令下发给设备执行，执行回执产生的新数据重新进入采集——两个传统缺口（数据出不来、AI 不能动）同时补上'
  },
  en: {
    coreTitle: 'IoT DC3 Loop',
    coreSub1: 'data up + command down',
    coreSub2: 'point values carry semantics · unit · timestamp · tenant',
    coreSub3: 'every step gated by permission & confirmation',
    n1: '(1) Driver collects', n1Sub: 'multi-protocol · registers / topics',
    n2: '(2) Normalize & store', n2Sub: 'semantic PointValue · unit · timestamp',
    n3: '(3) LLM analyzes', n3Sub: 'Spring AI @Tool · read & analyze',
    n4: '(4) Command down', n4Sub: 'point write / custom command · gated',
    n5: '(5) Device executes', n5Sub: 'execute & receipt → new data',
    gap1Title: 'Gap 1 · data locked in, AI starved',
    gap1Fix: '→ solved by (1)(2) multi-protocol collect + semantics',
    gap2Title: 'Gap 2 · AI can only watch',
    gap2Fix: '→ solved by (3)(4)(5) tool calls + closed loop',
    lbl12: 'rawValue → calValue uplink',
    lbl23: 'semantic · model-consumable',
    lbl34: 'decision becomes action',
    lbl45: 'protocol payload to device',
    lbl51: 'receipt & new data re-collected',
    legCollect: 'collect', legNormalize: 'normalize & store', legAnalyze: 'AI analyze',
    legCommand: 'command down', legDevice: 'execute & receipt',
    legUp: 'uplink', legDown: 'downlink',
    aria: 'IoT DC3 core loop: drivers collect raw values from devices over many protocols and scale them; the data center stores semantic PointValues; an LLM reads and analyzes via Spring AI tool calls, then pushes decisions down as point writes or custom commands that devices execute — receipts and new data flow back into collection, closing both traditional gaps'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1200 720">
        <defs>
          <marker id="ild-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="ild-ah-db" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-db-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="ild-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="ild-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ild-grid)" height="100%" width="100%"/>

        <!-- gap cards -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,3"
              stroke-width="1" width="360" x="60" y="20"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="72" y="36">{{ s.gap1Title }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="52">{{ s.gap1Fix }}</text>
        <rect fill="var(--dc3-region-be)" height="40" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,3"
              stroke-width="1" width="360" x="780" y="20"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="792" y="36">{{ s.gap2Title }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="792" y="52">{{ s.gap2Fix }}</text>

        <!-- loop arcs -->
        <path d="M 210 300 Q 330 150 494 108" fill="none" marker-end="url(#ild-ah-db)" stroke="var(--dc3-db-stroke)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="228" y="166">{{ s.lbl12 }}</text>
        <path d="M 706 108 Q 900 130 994 254" fill="none" marker-end="url(#ild-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="836" y="120">{{ s.lbl23 }}</text>
        <path d="M 1000 334 Q 1030 500 946 574" fill="none" marker-end="url(#ild-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-width="1.2"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1042" y="450">{{ s.lbl34 }}</text>
        <line marker-end="url(#ild-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1.2" x1="736" x2="446"
              y1="595" y2="595"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="590" y="585">{{ s.lbl45 }}</text>
        <path d="M 330 556 Q 190 470 163 376" fill="none" marker-end="url(#ild-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="end" x="196" y="470">{{ s.lbl51 }}</text>

        <!-- loop nodes -->
        <rect fill="var(--dc3-amber-fill)" height="70" rx="10" stroke="var(--dc3-amber-stroke)" stroke-width="1.2"
              width="200" x="60" y="300"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="160" y="326">{{
            s.n1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="160" y="346">{{ s.n1Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="10" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="200"
              x="500" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="600" y="96">{{
            s.n2
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="600" y="116">{{ s.n2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="10" stroke="var(--dc3-fe-stroke)" stroke-width="1.2" width="200"
              x="900" y="260"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1000" y="286">{{
            s.n3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1000" y="306">{{ s.n3Sub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="70" rx="10" stroke="var(--dc3-rose-stroke)" stroke-width="1.2"
              width="200" x="740" y="560"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="840" y="586">{{
            s.n4
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="840" y="606">{{ s.n4Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="10" stroke="var(--dc3-ext-stroke)" stroke-width="1.2"
              width="200" x="240" y="560"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="340" y="586">{{
            s.n5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="340" y="606">{{ s.n5Sub }}</text>

        <!-- center card -->
        <rect fill="var(--dc3-region-be)" height="120" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="300" x="450" y="290"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="600" y="322">{{
            s.coreTitle
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="10" font-weight="600" text-anchor="middle" x="600" y="344">{{
            s.coreSub1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="600" y="366">{{ s.coreSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="600" y="386">{{ s.coreSub3 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="60" y="688"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="697">{{ s.legCollect }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="688"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="697">{{ s.legNormalize }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="290" y="688"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="697">{{ s.legAnalyze }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="410" y="688"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="697">{{ s.legCommand }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="530" y="688"/>
        <text fill="var(--dc3-text2)" font-size="9" x="552" y="697">{{ s.legDevice }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="1" x1="650" x2="670" y1="694" y2="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="676" y="697">{{ s.legUp }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="750" x2="770" y1="694" y2="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="776" y="697">{{ s.legDown }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
