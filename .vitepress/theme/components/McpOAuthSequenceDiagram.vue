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
    aria: 'MCP OAuth 2.1 完整授权码时序：Agent 生成 PKCE code_verifier 后请求授权，用户在鉴权中心登录同意并选择 MCP 连接，拿到一次性授权码换取短时 access_token 与轮换 refresh_token；随后携带 Bearer 调网关 /mcp，网关经 gRPC 内省校验并逐次复核权限，签名转发后端执行；token 过期后用 refresh_token 轮换刷新',
    pAgent: 'AI Agent',
    pAgentSub: 'PKCE 公共客户端 · 无 secret',
    pAuth: 'dc3-center-auth',
    pAuthSub: 'OAuth 2.1 授权服务器 · RS256',
    pGw: 'dc3-gateway /mcp',
    pGwSub: 'MCP Resource Server',
    pBackend: '后端 manager · data · agentic',
    pBackendSub: '业务真正执行方',
    ph1: '① 授权码 + PKCE（用户参与）',
    ph2: '② 换取 token',
    ph3: '③ 调用 /mcp（内省 · 签名转发）',
    ph4: '④ 刷新（token 过期后）',
    pkceN1: '生成 code_verifier',
    pkceN2: 'S256 → code_challenge',
    authorize: 'GET /oauth2/authorize（Auth Code + PKCE）',
    consentN1: '用户登录 · 同意授权',
    consentN2: '选择 MCP 连接 · redirect_uri 精确匹配',
    redirectCode: '302 redirect_uri?code（5min · 一次性）',
    tokenReq: 'POST /oauth2/token（code + code_verifier）',
    pkceCheckN1: '校验 PKCE S256',
    pkceCheckN2: 'code 一次性 · 绑定客户端',
    tokenGrant: 'access_token（JWT 15min）+ refresh_token（30d · 轮换）',
    callMcp: 'POST /mcp（Bearer）· tools/call',
    introspect: 'introspect（gRPC）· 校验 JWT + 连接',
    introspectResp: 'active · principal · scope · tenant · connection_id',
    perCallGates: '逐次校验 RBAC ∩ 白名单 ∩ 风险 ∩ 确认',
    forwardHmac: '内部 POST + X-Auth-Principal + HMAC 签名',
    backendN1: 'GatewayJwtConverter 验签',
    backendN2: '@PreAuthorize 权限判定',
    backendResp: 'R〈T〉统一响应',
    toolResult: 'MCP CallToolResult',
    refreshReq: 'POST /oauth2/token · grant=refresh_token',
    rotateN: '轮换 + previous_refresh_token_hash 重放检测（RFC 9700）',
    refreshGrant: '新 access_token + 新 refresh_token',
    epT: 'OAuth 端点（经网关对外）',
    epS1: 'authorize · token · jwks · revoke · register',
    epS2: 'introspect 仅 gRPC 内部，不暴露 HTTP',
    legAgent: 'Agent', legAuth: '授权服务器', legGw: '网关 RS', legBackend: '后端中心',
    legSolid: '请求', legDash: '响应 / 回执'
  },
  en: {
    aria: 'Full MCP OAuth 2.1 authorization-code sequence: the agent generates a PKCE code_verifier and requests authorization, the user logs in, consents and picks the MCP connection at the auth center, then a one-time code is exchanged for a short-lived access_token and rotating refresh_token; calls to the gateway /mcp carry the Bearer token, are introspected over gRPC, re-checked per call, signed and forwarded to the backend; expired tokens refresh via rotation',
    pAgent: 'AI Agent',
    pAgentSub: 'PKCE public client · no secret',
    pAuth: 'dc3-center-auth',
    pAuthSub: 'OAuth 2.1 auth server · RS256',
    pGw: 'dc3-gateway /mcp',
    pGwSub: 'MCP Resource Server',
    pBackend: 'Backend manager · data · agentic',
    pBackendSub: 'actual business executor',
    ph1: '① auth code + PKCE (user in the loop)',
    ph2: '② exchange tokens',
    ph3: '③ call /mcp (introspect · signed forward)',
    ph4: '④ refresh (after expiry)',
    pkceN1: 'generate code_verifier',
    pkceN2: 'S256 → code_challenge',
    authorize: 'GET /oauth2/authorize (Auth Code + PKCE)',
    consentN1: 'user login · consent',
    consentN2: 'pick MCP connection · redirect_uri exact match',
    redirectCode: '302 redirect_uri?code (5min · one-time)',
    tokenReq: 'POST /oauth2/token (code + code_verifier)',
    pkceCheckN1: 'verify PKCE S256',
    pkceCheckN2: 'code one-time · client-bound',
    tokenGrant: 'access_token (JWT 15min) + refresh_token (30d · rotating)',
    callMcp: 'POST /mcp (Bearer) · tools/call',
    introspect: 'introspect (gRPC) · verify JWT + connection',
    introspectResp: 'active · principal · scope · tenant · connection_id',
    perCallGates: 'per-call: RBAC ∩ allowlist ∩ risk ∩ confirm',
    forwardHmac: 'internal POST + X-Auth-Principal + HMAC signature',
    backendN1: 'GatewayJwtConverter verifies signature',
    backendN2: '@PreAuthorize permission check',
    backendResp: 'R〈T〉 unified response',
    toolResult: 'MCP CallToolResult',
    refreshReq: 'POST /oauth2/token · grant=refresh_token',
    rotateN: 'rotation + previous_refresh_token_hash replay detection (RFC 9700)',
    refreshGrant: 'new access_token + new refresh_token',
    epT: 'OAuth endpoints (via gateway)',
    epS1: 'authorize · token · jwks · revoke · register',
    epS2: 'introspect is gRPC-internal, no HTTP endpoint',
    legAgent: 'agent', legAuth: 'auth server', legGw: 'gateway RS', legBackend: 'backend centers',
    legSolid: 'request', legDash: 'response / receipt'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

const PX: Record<string, number> = {agent: 150, auth: 450, gw: 760, backend: 1040}
const PARTS = ['agent', 'auth', 'gw', 'backend'] as const
const PT: Record<string, string> = {agent: 'pAgent', auth: 'pAuth', gw: 'pGw', backend: 'pBackend'}
const PS: Record<string, string> = {
  agent: 'pAgentSub', auth: 'pAuthSub', gw: 'pGwSub', backend: 'pBackendSub'
}
const PW: Record<string, number> = {agent: 230, auth: 250, gw: 220, backend: 230}
const PFILL = ['var(--dc3-ext-fill)', 'var(--dc3-rose-fill)', 'var(--dc3-be-fill)', 'var(--dc3-fe-fill)']
const PSTROKE = ['var(--dc3-ext-stroke)', 'var(--dc3-rose-stroke)', 'var(--dc3-be-stroke)', 'var(--dc3-fe-stroke)']
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 810">
        <defs>
          <marker id="mos-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mos-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#mos-grid)" height="100%" width="100%"/>

        <!-- phase bands + rotated left-margin labels -->
        <rect fill="var(--dc3-region-be)" height="216" width="1204" x="24" y="84"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" transform="rotate(-90 40 192)"
              x="40" y="192">{{ s.ph1 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="128" width="1204" x="24" y="300"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" transform="rotate(-90 40 364)"
              x="40" y="364">{{ s.ph2 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="268" width="1204" x="24" y="428"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" transform="rotate(-90 40 562)"
              x="40" y="562">{{ s.ph3 }}
        </text>
        <rect fill="var(--dc3-region-amber)" height="76" width="1204" x="24" y="696"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle"
              transform="rotate(-90 40 734)" x="40" y="734">{{ s.ph4 }}
        </text>

        <!-- lifelines -->
        <line v-for="p in PARTS" :key="'l' + p" :x1="PX[p]" :x2="PX[p]" stroke="var(--dc3-divider)"
              stroke-dasharray="4,4" stroke-width="1" y1="66" y2="770"/>

        <!-- ① auth code + PKCE -->
        <rect fill="var(--dc3-ext-fill)" height="44" rx="4" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="190" x="55" y="92"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="150" y="110">{{
            s.pkceN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="150" y="126">{{ s.pkceN2 }}</text>
        <line :x1="PX.agent" :x2="PX.auth" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="160" y2="160"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="152">{{ s.authorize }}</text>
        <rect fill="var(--dc3-rose-fill)" height="44" rx="4" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="210"
              x="345" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="450" y="198">{{
            s.consentN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="450" y="214">{{ s.consentN2 }}</text>
        <line :x1="PX.auth" :x2="PX.agent" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="252" y2="252"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="244">{{ s.redirectCode }}
        </text>

        <!-- ② token exchange -->
        <line :x1="PX.agent" :x2="PX.auth" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="326" y2="326"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="318">{{ s.tokenReq }}</text>
        <rect fill="var(--dc3-rose-fill)" height="40" rx="4" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="210"
              x="345" y="346"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="450" y="364">{{
            s.pkceCheckN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="450" y="380">{{ s.pkceCheckN2 }}</text>
        <line :x1="PX.auth" :x2="PX.agent" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="408" y2="408"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="400">{{ s.tokenGrant }}</text>

        <!-- ③ /mcp invocation -->
        <line :x1="PX.agent" :x2="PX.gw" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="444" y2="444"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="610" y="436">{{ s.callMcp }}</text>
        <line :x1="PX.gw" :x2="PX.auth" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="474" y2="474"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="605" y="466">{{ s.introspect }}
        </text>
        <line :x1="PX.auth" :x2="PX.gw" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="502" y2="502"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="605" y="494">{{ s.introspectResp }}
        </text>
        <path d="M 760,524 L 820,524 L 820,548 L 764,548" fill="none" marker-end="url(#mos-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="826" y="541">{{ s.perCallGates }}</text>
        <line :x1="PX.gw" :x2="PX.backend" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="588" y2="588"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="900" y="580">{{ s.forwardHmac }}
        </text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="230"
              x="925" y="604"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="1040" y="622">{{
            s.backendN1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1040" y="638">{{ s.backendN2 }}</text>
        <line :x1="PX.backend" :x2="PX.gw" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="668" y2="668"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="900" y="660">{{ s.backendResp }}
        </text>
        <line :x1="PX.gw" :x2="PX.agent" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="688" y2="688"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="605" y="680">{{ s.toolResult }}
        </text>

        <!-- ④ refresh rotation -->
        <line :x1="PX.agent" :x2="PX.auth" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="712" y2="712"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="704">{{ s.refreshReq }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="28" rx="4" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="330" x="285" y="720"/>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="450" y="738">{{ s.rotateN }}</text>
        <line :x1="PX.auth" :x2="PX.agent" marker-end="url(#mos-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="756" y2="756"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="748">{{ s.refreshGrant }}
        </text>

        <!-- endpoint cheatsheet (fills the empty top-right) -->
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="320" x="880" y="92"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" x="894" y="112">{{ s.epT }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="894" y="128">{{ s.epS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="894" y="142">{{ s.epS2 }}</text>

        <!-- participants (on top of lifelines) -->
        <rect v-for="(p, i) in PARTS" :key="'b' + p" :fill="PFILL[i]" :stroke="PSTROKE[i]" :x="PX[p] - PW[p] / 2"
              height="46" rx="8" stroke-width="1.2" :width="PW[p]" y="20"/>
        <text v-for="p in PARTS" :key="'t' + p" :x="PX[p]" fill="var(--dc3-box-name)" font-size="10" font-weight="600"
              text-anchor="middle" y="40">{{ s[PT[p]] }}
        </text>
        <text v-for="p in PARTS" :key="'st' + p" :x="PX[p]" fill="var(--dc3-text2)" font-size="8" text-anchor="middle"
              y="56">{{ s[PS[p]] }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="786"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="795">{{ s.legAgent }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="170" y="786"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="795">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="300" y="786"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="795">{{ s.legGw }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="430" y="786"/>
        <text fill="var(--dc3-text2)" font-size="9" x="452" y="795">{{ s.legBackend }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="590" x2="614" y1="792" y2="792"/>
        <text fill="var(--dc3-text2)" font-size="9" x="620" y="795">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="700" x2="724" y1="792" y2="792"/>
        <text fill="var(--dc3-text2)" font-size="9" x="730" y="795">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
