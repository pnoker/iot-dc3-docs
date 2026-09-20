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
    aria: 'Spring AI ChatClient 端到端时序：操作员的一句话经网关注入租户上下文进入 Agentic Center；ChatClient 先从 dc3_message 回放最近 30 轮会话记忆，再把提示发给 OpenAI 兼容的 LLM；模型返回工具调用时以进程内 Java 方法调用 @Tool 工具，工具经 ToolContext 提取租户 ID 并执行带 WHERE tenant_id 的隔离查询；模型只能提议写入——Agentic 生成 10 分钟有效的待确认 Action，人工 POST /action/confirm 后才执行写操作；整轮对话与动作均落入 dc3_message 与 dc3_action 表可审计',
    ph1: '① 请求进入 · 租户注入', ph2: '② 会话恢复 (持久记忆)',
    ph3: '③ 工具调用循环 (读)', ph4: '④ 写提议 → Action 待确认',
    ph5: '⑤ 确认执行 · 持久化',
    op: '操作员', opSub: '一句话运维指令',
    gw: 'dc3-gateway', gwSub: ':8000 · 租户来自 JWT',
    ag: 'Agentic Center', agSub: 'ChatClient (Spring AI · 进程内)',
    llm: 'LLM 提供商', llmSub: 'OpenAI 兼容端点 · 可换 Ollama',
    tool: '@Tool 工具', toolSub: '10 类 · 普通 Java 方法',
    db: 'PostgreSQL', dbSub: 'dc3_message · dc3_action',
    m1: 'POST /agentic/chat "3 号锅炉温度在上升…"',
    n1: 'JWT → 提取 tenantId 注入上下文',
    m2: '转发 (租户上下文)',
    m3: '加载 dc3_message 最近 30 轮',
    m4: '回放会话记忆',
    m5: 'ChatClient prompt (OpenAI 兼容)',
    m6: 'tool-call: readPointValue',
    m7: '进程内 Java 方法调用',
    n2: 'requireTenantId(toolContext)',
    m8: '租户隔离查询 WHERE tenant_id = ?',
    m9: '结果集', m10: 'PointValueBO',
    m11: '提议 writePointValue (排风机 → 60%)',
    m12: '生成 dc3_action (10 分钟有效)',
    m13: '回复: 待人工确认 (未执行)',
    m14: 'POST /action/confirm (经网关转发)',
    m16: '执行写 (服务层强制校验)',
    m17: '写结果',
    m18: '整轮落 dc3_message · dc3_action',
    note: '模型只能提议写入: Action 10 分钟有效，人工 confirm 才释放 (服务层强制，非仅 UI)；每轮消息、工具调用与结果均落库可审计；租户 ID 由网关注入，模型无法绕过 WHERE tenant_id = ?',
    legHuman: '操作员 / @Tool 工具', legSvc: '网关 / Agentic Center', legLlm: 'LLM 提供商',
    legDb: 'PostgreSQL', legCall: '调用 / 消息', legDash: '返回 / 提议'
  },
  en: {
    aria: 'Spring AI ChatClient end-to-end sequence: the operator one-liner enters the agentic center with tenant context injected by the gateway; ChatClient replays the last 30 rounds of memory from dc3_message, then sends the prompt to an OpenAI-compatible LLM; when the model returns a tool call it is invoked as an in-process Java method on an @Tool, which resolves the tenant from the ToolContext and runs tenant-scoped SQL; writes can only be proposed — the center creates a pending action valid for 10 minutes and only a human POST /action/confirm releases execution; every round is persisted to dc3_message and dc3_action for auditability',
    ph1: '① Request in · tenant injection', ph2: '② Session restore (persistent memory)',
    ph3: '③ Tool-call loop (reads)', ph4: '④ Write proposal → pending Action',
    ph5: '⑤ Confirm & execute · persist',
    op: 'Operator', opSub: 'one-line ops request',
    gw: 'dc3-gateway', gwSub: ':8000 · tenant from JWT',
    ag: 'Agentic Center', agSub: 'ChatClient (Spring AI · in-process)',
    llm: 'LLM provider', llmSub: 'OpenAI-compatible · swappable to Ollama',
    tool: '@Tool tools', toolSub: '10 classes · plain Java methods',
    db: 'PostgreSQL', dbSub: 'dc3_message · dc3_action',
    m1: 'POST /agentic/chat "boiler #3 temp is rising…"',
    n1: 'JWT → extract tenantId into context',
    m2: 'forward (tenant context)',
    m3: 'load last 30 rounds from dc3_message',
    m4: 'replay conversation memory',
    m5: 'ChatClient prompt (OpenAI-compatible)',
    m6: 'tool-call: readPointValue',
    m7: 'in-process Java method call',
    n2: 'requireTenantId(toolContext)',
    m8: 'tenant-scoped query WHERE tenant_id = ?',
    m9: 'result rows', m10: 'PointValueBO',
    m11: 'proposes writePointValue (fan → 60%)',
    m12: 'create dc3_action (valid 10 min)',
    m13: 'reply: pending human confirmation',
    m14: 'POST /action/confirm (via gateway)',
    m16: 'execute write (enforced in service layer)',
    m17: 'write result',
    m18: 'persist round to dc3_message · dc3_action',
    note: 'The model may only propose writes: an Action lives 10 minutes and needs a human confirm, enforced in the service layer — not just UI; every message, tool call and result is persisted for audit; the tenant ID comes from the gateway, so the model cannot bypass WHERE tenant_id = ?',
    legHuman: 'Operator / @Tool tools', legSvc: 'Gateway / Agentic Center', legLlm: 'LLM provider',
    legDb: 'PostgreSQL', legCall: 'Call / message', legDash: 'Return / proposal'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {op: 130, gw: 350, ag: 580, llm: 810, tool: 1030, db: 1225}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 780">
        <defs>
          <marker id="sas-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="sas-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#sas-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-be)" height="100" width="1272" x="24" y="100"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="116">{{ s.ph1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="80" width="1272" x="24" y="200"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="216">{{ s.ph2 }}</text>
        <rect fill="var(--dc3-region-be)" height="190" width="1272" x="24" y="280"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="296">{{ s.ph3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="120" width="1272" x="24" y="470"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="486">{{ s.ph4 }}</text>
        <rect fill="var(--dc3-region-be)" height="100" width="1272" x="24" y="590"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="606">{{ s.ph5 }}</text>

        <!-- lifelines -->
        <line v-for="key in ['op','gw','ag','llm','tool','db']" :key="'sas' + key" :x1="PX[key]" :x2="PX[key]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="88" y2="696"/>

        <!-- activation bars -->
        <rect v-for="b in [{y:122,h:14},{y:610,h:14}]" :key="'op' + b.y" fill="var(--dc3-fe-fill)" height="b.h"
              stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10" x="125" :y="b.y"/>
        <rect fill="var(--dc3-be-fill)" height="62" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="345" y="122"/>
        <rect v-for="b in [{y:170,h:18},{y:216,h:46},{y:300,h:172},{y:484,h:210}]" :key="'ag' + b.y"
              fill="var(--dc3-be-fill)" height="b.h" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="575" :y="b.y"/>
        <rect v-for="b in [{y:300,h:38},{y:484,h:14}]" :key="'llm' + b.y" fill="var(--dc3-ext-fill)" height="b.h"
              stroke="var(--dc3-ext-stroke)" stroke-width="0.8" width="10" x="805" :y="b.y"/>
        <rect v-for="b in [{y:350,h:122},{y:638,h:36}]" :key="'tl' + b.y" fill="var(--dc3-fe-fill)" height="b.h"
              stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10" x="1025" :y="b.y"/>
        <rect v-for="b in [{y:220,h:42},{y:408,h:38},{y:510,h:12},{y:682,h:14}]" :key="'db' + b.y"
              fill="var(--dc3-db-fill)" height="b.h" stroke="var(--dc3-db-stroke)" stroke-width="0.8" width="10"
              x="1220" :y="b.y"/>

        <!-- self notes -->
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="200" x="362" y="138"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="370" y="156">{{ s.n1 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="28" rx="4" stroke="var(--dc3-fe-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="180" x="1042" y="368"/>
        <text fill="var(--dc3-fe-text)" font-size="7.5" x="1050" y="386">{{ s.n2 }}</text>

        <!-- messages -->
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="140" x2="340" y1="128"
              y2="128"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="240" y="120">{{ s.m1 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="358" x2="570" y1="176"
              y2="176"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="465" y="168">{{ s.m2 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="1215" y1="226"
              y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="902" y="218">{{ s.m3 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1215"
              x2="588" y1="252" y2="252"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="902" y="244">{{ s.m4 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="800" y1="306"
              y2="306"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="695" y="298">{{ s.m5 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="800"
              x2="588" y1="332" y2="332"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="695" y="324">{{ s.m6 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="1020" y1="358"
              y2="358"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="805" y="350">{{ s.m7 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="1040" x2="1215" y1="412"
              y2="412"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1127" y="404">{{ s.m8 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1215"
              x2="1040" y1="438" y2="438"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1127" y="430">{{ s.m9 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1020"
              x2="588" y1="462" y2="462"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="805" y="454">{{ s.m10 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="800"
              x2="588" y1="490" y2="490"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="695" y="482">{{ s.m11 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="1215" y1="516"
              y2="516"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="902" y="508">{{ s.m12 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="570"
              x2="140" y1="546" y2="546"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="355" y="538">{{ s.m13 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="140" x2="570" y1="616"
              y2="616"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="355" y="608">{{ s.m14 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="1020" y1="644"
              y2="644"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="805" y="636">{{ s.m16 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1020"
              x2="588" y1="668" y2="668"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="805" y="660">{{ s.m17 }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="588" x2="1215" y1="688"
              y2="688"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="902" y="680">{{ s.m18 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="45" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="130" y="50">
          {{ s.op }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="130" y="68">{{ s.opSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="250" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="350" y="50">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="350" y="68">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="230"
              x="465" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="580" y="50">
          {{ s.ag }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="580" y="68">{{ s.agSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="52" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="220"
              x="700" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="810" y="50">
          {{ s.llm }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="810" y="68">{{ s.llmSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="930" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1030" y="50">
          {{ s.tool }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1030" y="68">{{ s.toolSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="52" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="160"
              x="1145" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1225" y="50">
          {{ s.db }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="1225" y="68">{{ s.dbSub }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1272" x="24" y="706"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="40" y="724">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="760"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="769">{{ s.legHuman }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="250" y="760"/>
        <text fill="var(--dc3-text2)" font-size="9" x="272" y="769">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="460" y="760"/>
        <text fill="var(--dc3-text2)" font-size="9" x="482" y="769">{{ s.legLlm }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="600" y="760"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="769">{{ s.legDb }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="740" x2="768" y1="766"
              y2="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="774" y="769">{{ s.legCall }}</text>
        <line marker-end="url(#sas-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="900"
              x2="928" y1="766" y2="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="934" y="769">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
