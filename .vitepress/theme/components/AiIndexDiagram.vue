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
    aria: 'AI 栏目两种接入方式：运营人员经 Agentic 中心对话接入、外部 AI Agent 经 MCP 工具接入，两条路汇聚到同一个网关与 dc3-center-auth 鉴权门，通过者进入业务中心服务，越权或跨租户被拒绝',
    regionAccess: '两种接入 · 谁发起、怎么约束',
    opName: '运营人员',
    opSub: '登录会话 · Web UI',
    agName: 'Agentic 中心',
    agSub: 'Spring AI · 10 @Tool',
    agSub2: '对话式 · 多轮会话',
    extName: '外部 AI Agent',
    extSub: '自主决策选工具',
    mcpName: 'MCP Resource Server',
    mcpSub: 'POST /mcp · JSON-RPC 2.0',
    mcpSub2: '330+ 工具 OpenAPI 聚合',
    filterL1: 'tools/list 三层过滤',
    filterL2: 'RBAC ∩ 白名单 ∩ 风险',
    gwName: '网关 dc3-gateway',
    gwSub: ':8000 · 唯一 HTTP 入口',
    gwSub2: '注入主体上下文',
    gwSub3: '统一路由 · 限流',
    authName: '鉴权门 dc3-center-auth',
    authSub: 'RBAC @PreAuthorize',
    authSub2: '租户隔离（跨租户 404）',
    authSub3: 'JWT introspect',
    svcName: '业务中心服务',
    svcSub: 'Manager · Data · Agentic',
    svcSub2: '业务 API /api/v3',
    denyName: '拒绝',
    denySub: '403 / 404',
    lblChat: '对话',
    lblOAuth: 'OAuth 2.1',
    lblSession: '会话身份',
    lblJwt: '短时 JWT 15min',
    lblPrincipal: 'principal',
    lblAllow: '放行',
    lblDeny: '越权 / 跨租户',
    legOp: '发起方',
    legAgentic: '平台内建 AI',
    legMcp: 'MCP 工具暴露',
    legSvc: '平台服务',
    legAuth: '鉴权 / 拒绝',
    noteSame: '两种接入 · 同一道鉴权门 · AI 拿不到比账号更多的权限'
  },
  en: {
    aria: 'Two AI access paths: operators chat through the Agentic Center while external AI Agents call tools through MCP; both converge on the same gateway and dc3-center-auth gate, allowed calls reach the center services, over-permission or cross-tenant calls are denied',
    regionAccess: 'Two access paths · who initiates, how constrained',
    opName: 'Operator',
    opSub: 'Login session · Web UI',
    agName: 'Agentic Center',
    agSub: 'Spring AI · 10 @Tool',
    agSub2: 'Chat · multi-turn',
    extName: 'External AI Agent',
    extSub: 'Picks tools autonomously',
    mcpName: 'MCP Resource Server',
    mcpSub: 'POST /mcp · JSON-RPC 2.0',
    mcpSub2: '330+ tools via OpenAPI',
    filterL1: 'tools/list 3-layer filter',
    filterL2: 'RBAC ∩ allowlist ∩ risk',
    gwName: 'Gateway dc3-gateway',
    gwSub: ':8000 · single HTTP entry',
    gwSub2: 'Injects principal context',
    gwSub3: 'Routing · rate limit',
    authName: 'Auth gate dc3-center-auth',
    authSub: 'RBAC @PreAuthorize',
    authSub2: 'Tenant isolation (404)',
    authSub3: 'JWT introspect',
    svcName: 'Center services',
    svcSub: 'Manager · Data · Agentic',
    svcSub2: 'Business API /api/v3',
    denyName: 'Deny',
    denySub: '403 / 404',
    lblChat: 'chat',
    lblOAuth: 'OAuth 2.1',
    lblSession: 'session identity',
    lblJwt: 'short-lived JWT 15min',
    lblPrincipal: 'principal',
    lblAllow: 'allow',
    lblDeny: 'over-permission / cross-tenant',
    legOp: 'Initiator',
    legAgentic: 'Built-in AI',
    legMcp: 'MCP tool exposure',
    legSvc: 'Platform service',
    legAuth: 'Auth / deny',
    noteSame: 'Two paths · one auth gate · AI never exceeds the account permissions'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 440">
        <defs>
          <marker id="aii-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="aii-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="aii-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aii-grid)" height="100%" width="100%"/>

        <!-- region: two access paths -->
        <rect fill="var(--dc3-region-be)" height="352" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="440" x="40" y="36"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="56">{{ s.regionAccess }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#aii-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="242" x2="286" y1="121" y2="121"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="264" y="113">{{ s.lblChat }}</text>
        <line marker-end="url(#aii-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="242" x2="286" y1="281" y2="281"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="264" y="273">{{ s.lblOAuth }}</text>
        <path d="M 462 123 L 490 123 L 490 172 L 512 172" fill="none" marker-end="url(#aii-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="476" y="115">{{ s.lblSession }}</text>
        <path d="M 462 281 L 490 281 L 490 248 L 512 248" fill="none" marker-end="url(#aii-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="476" y="295">{{ s.lblJwt }}</text>
        <line marker-end="url(#aii-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="710" x2="758" y1="210" y2="210"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="734" y="202">{{ s.lblPrincipal }}</text>
        <line marker-end="url(#aii-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="974" x2="1022" y1="186" y2="186"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="998" y="178">{{ s.lblAllow }}</text>
        <path d="M 900 272 L 900 330 L 1022 330" fill="none" marker-end="url(#aii-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="908" y="322">{{ s.lblDeny }}</text>

        <!-- node: operator -->
        <rect fill="var(--dc3-ext-fill)" height="58" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="70" y="92"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="155" y="116">{{
            s.opName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="155" y="134">{{ s.opSub }}</text>

        <!-- node: agentic center -->
        <rect fill="var(--dc3-fe-fill)" height="78" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="290" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="375" y="110">{{
            s.agName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="375" y="128">{{ s.agSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="375" y="144">{{ s.agSub2 }}</text>

        <!-- node: external agent -->
        <rect fill="var(--dc3-ext-fill)" height="58" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="70" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="155" y="276">{{
            s.extName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="155" y="294">{{ s.extSub }}</text>

        <!-- node: MCP resource server -->
        <rect fill="var(--dc3-bus-fill)" height="78" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="170"
              x="290" y="244"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="375" y="270">{{
            s.mcpName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="375" y="288">{{ s.mcpSub }}</text>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="375" y="304">{{ s.mcpSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="375" y="342">{{ s.filterL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="375" y="356">{{ s.filterL2 }}</text>

        <!-- node: gateway (the single door) -->
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="518" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="613" y="178">{{
            s.gwName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="613" y="196">{{ s.gwSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="613" y="212">{{ s.gwSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="613" y="228">{{ s.gwSub3 }}</text>

        <!-- node: auth gate -->
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="210" x="762" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="867" y="178">{{
            s.authName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="867" y="196">{{ s.authSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="867" y="212">{{ s.authSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="867" y="228">{{ s.authSub3 }}</text>

        <!-- node: center services -->
        <rect fill="var(--dc3-be-fill)" height="100" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="1026" y="128"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1121" y="156">{{
            s.svcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1121" y="174">{{ s.svcSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1121" y="190">{{ s.svcSub2 }}</text>

        <!-- node: deny -->
        <rect fill="var(--dc3-rose-fill)" height="60" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="190" x="1026" y="302"/>
        <text fill="var(--dc3-rose-stroke)" font-size="12" font-weight="700" text-anchor="middle" x="1121" y="326">{{
            s.denyName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1121" y="344">{{ s.denySub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="70" y="406"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="415">{{ s.legOp }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="170" y="406"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="415">{{ s.legAgentic }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="300" y="406"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="415">{{ s.legMcp }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="430" y="406"/>
        <text fill="var(--dc3-text2)" font-size="9" x="452" y="415">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="560" y="406"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="415">{{ s.legAuth }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="700" y="415">{{ s.noteSame }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
