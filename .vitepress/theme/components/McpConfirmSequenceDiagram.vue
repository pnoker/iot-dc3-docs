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
    aria: 'MCP HIGH 风险工具的两阶段确认时序：第一次 tools/call 不执行业务动作，鉴权中心落库一张 PENDING 确认票据并返回 confirmId；第二次携带 confirmId 与幂等键调用时，服务端校验未过期、参数摘要一致、主体未变并一次性消费后才放行执行，全程写审计日志',
    pAgent: 'AI Agent',
    pAgentSub: 'MCP 客户端 · JSON-RPC 2.0',
    pGw: 'dc3-gateway /mcp',
    pGwSub: 'McpGatewayController',
    pAuth: 'dc3-center-auth',
    pAuthSub: 'OAuthMcpRuntimeService',
    pDb: 'PostgreSQL',
    pDbSub: 'dc3_mcp_tool_confirmation',
    ph1: '① 第一次调用（未确认 · 不执行）',
    ph2: '② 第二次调用（confirmId + 幂等键 · 执行）',
    callNoConfirm: 'tools/call（HIGH 风险 · 未带确认）',
    riskGate: '风险门控判定（riskLevel=HIGH）',
    insertPending: 'INSERT 确认票据（PENDING · TTL 5m）',
    insertAck: '写入回执（confirm_id）',
    confirmRequired: 'CONFIRM_REQUIRED + confirmId',
    relayRequired: 'JSON-RPC 结果（不执行业务动作）',
    callWithConfirm: 'tools/call + confirmId + idempotency_key',
    verifyTicket: '校验确认票据',
    selectPending: 'SELECT … WHERE status=PENDING（并发护栏）',
    pendingOk: '未过期 · digest 一致 · 未消费',
    markConsumed: 'UPDATE status=CONSUMED（一次性）',
    sameSubject: '校验 principal · 连接 · 工具未变',
    authorized: 'AUTHORIZED（放行）',
    forwardHmac: '转发后端执行（X-Auth-Principal + HMAC）',
    toolResult: 'CallToolResult（结果）',
    rejectT: '任一校验失败 → 拒绝',
    rejectS: '过期 · digest 不一致 · 已消费 · 主体/连接/工具变更',
    auditT: '全程审计 dc3_mcp_audit_log',
    auditS: 'confirm_id · idempotency_key · argument_digest · risk_level · duration_ms · remote_ip',
    auditLink: '每次 HIGH 调用',
    legAgent: 'Agent', legGw: '网关', legAuth: '鉴权 / 门控', legDb: '确认票据',
    legNote: '审计 / 拒绝分支', legSolid: '请求 / 写库', legDash: '响应 / 回执'
  },
  en: {
    aria: 'Two-phase confirmation sequence for HIGH-risk MCP tools: the first tools/call executes nothing — the auth center stores a PENDING confirmation ticket and returns a confirmId; the second call carries confirmId plus an idempotency key, and only after verifying not-expired, matching argument digest, unchanged principal and single-use consumption is it executed, all audited',
    pAgent: 'AI Agent',
    pAgentSub: 'MCP client · JSON-RPC 2.0',
    pGw: 'dc3-gateway /mcp',
    pGwSub: 'McpGatewayController',
    pAuth: 'dc3-center-auth',
    pAuthSub: 'OAuthMcpRuntimeService',
    pDb: 'PostgreSQL',
    pDbSub: 'dc3_mcp_tool_confirmation',
    ph1: '① first call (unconfirmed · no execution)',
    ph2: '② second call (confirmId + idempotency key · execute)',
    callNoConfirm: 'tools/call (HIGH risk · no confirmation)',
    riskGate: 'risk gating (riskLevel=HIGH)',
    insertPending: 'INSERT ticket (PENDING · TTL 5m)',
    insertAck: 'write ack (confirm_id)',
    confirmRequired: 'CONFIRM_REQUIRED + confirmId',
    relayRequired: 'JSON-RPC result (nothing executed)',
    callWithConfirm: 'tools/call + confirmId + idempotency_key',
    verifyTicket: 'verify confirmation ticket',
    selectPending: 'SELECT … WHERE status=PENDING (concurrency guard)',
    pendingOk: 'not expired · digest match · unconsumed',
    markConsumed: 'UPDATE status=CONSUMED (single use)',
    sameSubject: 'check principal · connection · tool unchanged',
    authorized: 'AUTHORIZED',
    forwardHmac: 'forward to backend (X-Auth-Principal + HMAC)',
    toolResult: 'CallToolResult (outcome)',
    rejectT: 'any check failed → rejected',
    rejectS: 'expired · digest mismatch · consumed · principal/connection/tool changed',
    auditT: 'full audit trail dc3_mcp_audit_log',
    auditS: 'confirm_id · idempotency_key · argument_digest · risk_level · duration_ms · remote_ip',
    auditLink: 'every HIGH-risk call',
    legAgent: 'Agent', legGw: 'gateway', legAuth: 'auth / gating', legDb: 'ticket store',
    legNote: 'audit / reject branch', legSolid: 'request / write', legDash: 'response / ack'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

const PX: Record<string, number> = {agent: 140, gw: 470, auth: 800, db: 1090}
const PARTS = ['agent', 'gw', 'auth', 'db'] as const
const PT: Record<string, string> = {agent: 'pAgent', gw: 'pGw', auth: 'pAuth', db: 'pDb'}
const PS: Record<string, string> = {agent: 'pAgentSub', gw: 'pGwSub', auth: 'pAuthSub', db: 'pDbSub'}
const PW: Record<string, number> = {agent: 220, gw: 230, auth: 240, db: 280}
const PFILL = ['var(--dc3-ext-fill)', 'var(--dc3-be-fill)', 'var(--dc3-rose-fill)', 'var(--dc3-db-fill)']
const PSTROKE = ['var(--dc3-ext-stroke)', 'var(--dc3-be-stroke)', 'var(--dc3-rose-stroke)', 'var(--dc3-db-stroke)']
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 700">
        <defs>
          <marker id="mcs-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mcs-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mcs-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#mcs-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-amber)" height="220" width="1232" x="24" y="80"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="635" y="96">{{
            s.ph1
          }}
        </text>
        <rect fill="var(--dc3-region-be)" height="290" width="1232" x="24" y="300"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="635" y="316">{{
            s.ph2
          }}
        </text>

        <!-- lifelines -->
        <line v-for="p in PARTS" :key="'l' + p" :x1="PX[p]" :x2="PX[p]" stroke="var(--dc3-divider)"
              stroke-dasharray="4,4" stroke-width="1" y1="66" y2="590"/>

        <!-- ① first call: ticket created, nothing executed -->
        <line :x1="PX.agent" :x2="PX.gw" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="116" y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="305" y="108">{{ s.callNoConfirm }}
        </text>
        <line :x1="PX.gw" :x2="PX.auth" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="146" y2="146"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="138">{{ s.riskGate }}
        </text>
        <line :x1="PX.auth" :x2="PX.db" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="176" y2="176"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="945" y="168">{{ s.insertPending }}
        </text>
        <line :x1="PX.db" :x2="PX.auth" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="204" y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="945" y="196">{{ s.insertAck }}
        </text>
        <line :x1="PX.auth" :x2="PX.gw" marker-end="url(#mcs-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="5,4" stroke-width="1" y1="232" y2="232"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="635" y="224">{{
            s.confirmRequired
          }}
        </text>
        <line :x1="PX.gw" :x2="PX.agent" marker-end="url(#mcs-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="5,4" stroke-width="1" y1="260" y2="260"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="305" y="252">{{ s.relayRequired }}
        </text>

        <!-- ② second call: verify, consume, execute -->
        <line :x1="PX.agent" :x2="PX.gw" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="328" y2="328"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="305" y="320">{{ s.callWithConfirm }}
        </text>
        <line :x1="PX.gw" :x2="PX.auth" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="358" y2="358"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="350">{{ s.verifyTicket }}
        </text>
        <line :x1="PX.auth" :x2="PX.db" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="388" y2="388"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="945" y="380">{{ s.selectPending }}
        </text>
        <line :x1="PX.db" :x2="PX.auth" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="416" y2="416"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="945" y="408">{{ s.pendingOk }}
        </text>
        <line :x1="PX.auth" :x2="PX.db" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              y1="444" y2="444"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="945" y="436">{{ s.markConsumed }}
        </text>
        <path d="M 800,466 L 852,466 L 852,490 L 806,490" fill="none" marker-end="url(#mcs-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="860" y="482">{{ s.sameSubject }}</text>
        <line :x1="PX.auth" :x2="PX.gw" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="516" y2="516"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="635" y="508">{{ s.authorized }}
        </text>
        <path d="M 470,536 L 416,536 L 416,560 L 464,560" fill="none" marker-end="url(#mcs-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="410" y="552">{{ s.forwardHmac }}</text>
        <line :x1="PX.gw" :x2="PX.agent" marker-end="url(#mcs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4"
              stroke-width="1" y1="584" y2="584"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="305" y="576">{{ s.toolResult }}
        </text>

        <!-- audit connector -->
        <path d="M 470,590 L 470,636 L 756,636" fill="none" marker-end="url(#mcs-ah)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="560" y="630">{{ s.auditLink }}</text>

        <!-- reject branch + audit store -->
        <rect fill="var(--dc3-rose-fill)" height="52" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="300" x="70" y="610"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="220" y="630">{{
            s.rejectT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="220" y="648">{{ s.rejectS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="420" x="760" y="610"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="970" y="630">{{
            s.auditT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="970" y="648">{{ s.auditS }}</text>

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
              x="60" y="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="687">{{ s.legAgent }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="687">{{ s.legGw }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="260" y="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="282" y="687">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="390" y="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="687">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="520" y="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="542" y="687">{{ s.legNote }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="680" x2="704" y1="684" y2="684"/>
        <text fill="var(--dc3-text2)" font-size="9" x="710" y="687">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="830" x2="854" y1="684" y2="684"/>
        <text fill="var(--dc3-text2)" font-size="9" x="860" y="687">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
