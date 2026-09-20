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
    aria: '一次 AI 辅助操作的完整时序：客户端经网关调 chat/completions，智能中心加载历史后与 LLM 多轮工具调用——读类工具直接执行；写类工具生成待确认 Action 返回 actionId，用户确认后才经 PointCommandFacade 下发命令并回答',
    pClient: '客户端 Client',
    pClientSub: 'curl · Web · 上游系统',
    pGw: 'dc3-gateway',
    pGwSub: ':8000 · 路由 + 鉴权过滤',
    pAg: 'dc3-center-agentic',
    pAgSub: 'ChatClient · Spring AI',
    pLlm: 'LLM 提供方',
    pLlmSub: 'DB 优先 · env 兜底',
    pTool: '内置工具 @Tool',
    pToolSub: '10 个 · 租户隔离',
    pData: 'dc3-center-data',
    pDataSub: '命令平面 :8500',
    ph1: '① 对话入口 · 加载历史',
    ph2: '② 读工具 · 直接执行',
    ph3: '③ 写工具 · 两阶段确认（AI 提议 · 人拍板）',
    ph4: '④ 命令下发 · 回答',
    askChat: 'POST /api/v3/agentic/chat/completions',
    fwdChat: '转发 /chat/completions（StripPrefix=2）',
    memN1: 'MessageChatMemoryRepository',
    memN2: '读 dc3_message 历史 · 窗口 30',
    sendPrompt: 'prompt + 10 个 @Tool schema',
    callReadTool: 'tool_call · getLatestPointValue(pointId)',
    execReadTool: '执行 · requireTenantId（租户隔离）',
    queryLatest: '查位号元数据 + 最新值',
    valueBo: 'PointValueBO · 86.4 ℃',
    readToolResult: '工具结果（值 · 采集时间）',
    feedBack: '观测结果喂回 · 继续推理',
    callWriteTool: 'tool_call · writePointValue（写）',
    writeN1: '写工具从不直接执行',
    writeN2: 'ActionService.createWritePointValueAction',
    actN1: 'Action · PENDING',
    actN2: 'actionId(UUID) · TTL 10 分钟',
    pendingReturn: 'pendingConfirmation=true + actionId',
    pendingRelay: '透传待确认动作',
    confirmCall: 'POST /action/confirm（action_id）',
    confirmRelay: '用户拍板 · 放行',
    execWrite: '执行写命令',
    submitWrite: 'PointCommandFacade.submitWrite · gRPC',
    acceptedTtl: '受理（TTL 10s · 失败不回显值）',
    execResult: '执行结果',
    answerRelay: '自然语言回答',
    answerDeliver: 'SSE 流式 / JSON 一次性',
    legClient: '客户端', legService: '平台服务', legLlm: '外部 LLM',
    legTool: '内置工具', legDb: '会话存储', legAction: '待确认 Action',
    legSolid: '请求', legDash: '响应 / 回执'
  },
  en: {
    aria: 'Full sequence of one AI-assisted operation: the client calls chat/completions through the gateway, the agentic center loads history and runs tool-call rounds with the LLM — read tools execute directly; the write tool creates a pending Action and returns an actionId, and only after the user confirms is the command dispatched via PointCommandFacade and the answer returned',
    pClient: 'Client',
    pClientSub: 'curl · Web · upstream',
    pGw: 'dc3-gateway',
    pGwSub: ':8000 · routing + auth filter',
    pAg: 'dc3-center-agentic',
    pAgSub: 'ChatClient · Spring AI',
    pLlm: 'LLM Provider',
    pLlmSub: 'DB first · env fallback',
    pTool: 'Built-in @Tool',
    pToolSub: '10 tools · tenant-scoped',
    pData: 'dc3-center-data',
    pDataSub: 'command plane :8500',
    ph1: '① chat entry · load history',
    ph2: '② read tools · execute directly',
    ph3: '③ write tool · 2-phase confirm (human decides)',
    ph4: '④ command dispatch · answer',
    askChat: 'POST /api/v3/agentic/chat/completions',
    fwdChat: 'forward /chat/completions (StripPrefix=2)',
    memN1: 'MessageChatMemoryRepository',
    memN2: 'read dc3_message history · window 30',
    sendPrompt: 'prompt + 10 @Tool schemas',
    callReadTool: 'tool_call · getLatestPointValue(pointId)',
    execReadTool: 'execute · requireTenantId (tenant-scoped)',
    queryLatest: 'lookup point metadata + latest value',
    valueBo: 'PointValueBO · 86.4 ℃',
    readToolResult: 'tool result (value · sampled at)',
    feedBack: 'feed observation · keep reasoning',
    callWriteTool: 'tool_call · writePointValue (write)',
    writeN1: 'the write tool never executes directly',
    writeN2: 'ActionService.createWritePointValueAction',
    actN1: 'Action · PENDING',
    actN2: 'actionId (UUID) · TTL 10 min',
    pendingReturn: 'pendingConfirmation=true + actionId',
    pendingRelay: 'relay pending action',
    confirmCall: 'POST /action/confirm (action_id)',
    confirmRelay: 'human approved · go',
    execWrite: 'execute write command',
    submitWrite: 'PointCommandFacade.submitWrite · gRPC',
    acceptedTtl: 'accepted (TTL 10s · no echo on failure)',
    execResult: 'execution result',
    answerRelay: 'natural-language answer',
    answerDeliver: 'SSE stream / single JSON',
    legClient: 'client', legService: 'platform service', legLlm: 'external LLM',
    legTool: 'built-in tools', legDb: 'chat storage', legAction: 'pending Action',
    legSolid: 'request', legDash: 'response / receipt'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

const PX: Record<string, number> = {client: 100, gw: 300, agentic: 520, llm: 750, tool: 980, data: 1190}
const PARTS = ['client', 'gw', 'agentic', 'llm', 'tool', 'data'] as const
const PT: Record<string, string> = {
  client: 'pClient', gw: 'pGw', agentic: 'pAg', llm: 'pLlm', tool: 'pTool', data: 'pData'
}
const PS: Record<string, string> = {
  client: 'pClientSub', gw: 'pGwSub', agentic: 'pAgSub', llm: 'pLlmSub', tool: 'pToolSub', data: 'pDataSub'
}
const PFILL = [
  'var(--dc3-fe-fill)', 'var(--dc3-be-fill)', 'var(--dc3-be-fill)',
  'var(--dc3-ext-fill)', 'var(--dc3-amber-fill)', 'var(--dc3-be-fill)'
]
const PSTROKE = [
  'var(--dc3-fe-stroke)', 'var(--dc3-be-stroke)', 'var(--dc3-be-stroke)',
  'var(--dc3-ext-stroke)', 'var(--dc3-amber-stroke)', 'var(--dc3-be-stroke)'
]
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 800">
        <defs>
          <marker id="agsq-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="agsq-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="agsq-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#agsq-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-be)" height="118" width="1252" x="24" y="80"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="1085" y="96">{{
            s.ph1
          }}
        </text>
        <rect fill="var(--dc3-region-be)" height="158" width="1252" x="24" y="198"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="1085" y="214">{{
            s.ph2
          }}
        </text>
        <rect fill="var(--dc3-region-amber)" height="256" width="1252" x="24" y="356"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="1085" y="372">{{
            s.ph3
          }}
        </text>
        <rect fill="var(--dc3-region-be)" height="148" width="1252" x="24" y="612"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="1085" y="628">{{
            s.ph4
          }}
        </text>

        <!-- lifelines -->
        <line v-for="p in PARTS" :key="'l' + p" :x1="PX[p]" :x2="PX[p]" stroke="var(--dc3-divider)"
              stroke-dasharray="4,4" stroke-width="1" y1="66" y2="760"/>

        <!-- ① chat entry -->
        <line :x1="PX.client" :x2="PX.gw" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="104" y2="104"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="200" y="96">{{ s.askChat }}</text>
        <line :x1="PX.gw" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="128" y2="128"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="120">{{ s.fwdChat }}</text>
        <rect fill="var(--dc3-db-fill)" height="46" rx="4" stroke="var(--dc3-db-stroke)" stroke-width="1" width="170"
              x="435" y="146"/>
        <text fill="var(--dc3-db-text)" font-size="8" font-weight="600" text-anchor="middle" x="520" y="166">{{
            s.memN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="182">{{ s.memN2 }}</text>

        <!-- ② read tool round -->
        <line :x1="PX.agentic" :x2="PX.llm" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="220" y2="220"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="212">{{ s.sendPrompt }}
        </text>
        <line :x1="PX.llm" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="246" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="238">{{ s.callReadTool }}
        </text>
        <line :x1="PX.agentic" :x2="PX.tool" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="272" y2="272"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="780" y="264">{{ s.execReadTool }}</text>
        <line :x1="PX.tool" :x2="PX.data" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="298" y2="298"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1085" y="290">{{ s.queryLatest }}
        </text>
        <line :x1="PX.data" :x2="PX.tool" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="324" y2="324"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1085" y="316">{{ s.valueBo }}</text>
        <line :x1="PX.tool" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="346" y2="346"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="780" y="338">{{ s.readToolResult }}</text>

        <!-- ③ write tool: two-phase confirm -->
        <line :x1="PX.agentic" :x2="PX.llm" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="380" y2="380"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="372">{{ s.feedBack }}</text>
        <line :x1="PX.llm" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="406" y2="406"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="398">{{ s.callWriteTool }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="4" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="210" x="415" y="420"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="520" y="438">{{
            s.writeN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="520" y="454">{{ s.writeN2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="40" rx="4" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="190"
              x="425" y="470"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="520" y="488">{{
            s.actN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="520" y="504">{{ s.actN2 }}</text>
        <line :x1="PX.agentic" :x2="PX.gw" marker-end="url(#agsq-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="5,4" stroke-width="1" y1="534" y2="534"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="410" y="526">{{ s.pendingReturn }}
        </text>
        <line :x1="PX.gw" :x2="PX.client" marker-end="url(#agsq-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="5,4" stroke-width="1" y1="556" y2="556"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="200" y="548">{{ s.pendingRelay }}
        </text>
        <line :x1="PX.client" :x2="PX.gw" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="582" y2="582"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="200" y="574">{{ s.confirmCall }}
        </text>
        <line :x1="PX.gw" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="604" y2="604"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="596">{{ s.confirmRelay }}
        </text>

        <!-- ④ command dispatch + answer -->
        <line :x1="PX.agentic" :x2="PX.tool" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="636" y2="636"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="780" y="628">{{ s.execWrite }}</text>
        <line :x1="PX.tool" :x2="PX.data" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="660" y2="660"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1085" y="652">{{ s.submitWrite }}
        </text>
        <line :x1="PX.data" :x2="PX.tool" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="684" y2="684"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1085" y="676">{{ s.acceptedTtl }}
        </text>
        <line :x1="PX.tool" :x2="PX.agentic" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="708" y2="708"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="780" y="700">{{ s.execResult }}</text>
        <line :x1="PX.agentic" :x2="PX.gw" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="732" y2="732"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="724">{{ s.answerRelay }}
        </text>
        <line :x1="PX.gw" :x2="PX.client" marker-end="url(#agsq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="754" y2="754"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="200" y="746">{{ s.answerDeliver }}
        </text>

        <!-- participants (on top of lifelines) -->
        <rect v-for="(p, i) in PARTS" :key="'b' + p" :fill="PFILL[i]" :stroke="PSTROKE[i]" :x="PX[p] - 100"
              height="46" rx="8" stroke-width="1.2" width="200" y="20"/>
        <text v-for="p in PARTS" :key="'t' + p" :x="PX[p]" fill="var(--dc3-box-name)" font-size="10" font-weight="600"
              text-anchor="middle" y="40">{{ s[PT[p]] }}
        </text>
        <text v-for="p in PARTS" :key="'st' + p" :x="PX[p]" fill="var(--dc3-text2)" font-size="8" text-anchor="middle"
              y="56">{{ s[PS[p]] }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="785">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="170" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="785">{{ s.legService }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="300" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="785">{{ s.legLlm }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="430" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="452" y="785">{{ s.legTool }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="560" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="785">{{ s.legDb }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="690" y="776"/>
        <text fill="var(--dc3-text2)" font-size="9" x="712" y="785">{{ s.legAction }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="840" x2="864" y1="782" y2="782"/>
        <text fill="var(--dc3-text2)" font-size="9" x="870" y="785">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="950" x2="974" y1="782" y2="782"/>
        <text fill="var(--dc3-text2)" font-size="9" x="980" y="785">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
