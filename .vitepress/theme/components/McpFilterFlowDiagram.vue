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
    aria: 'MCP 工具可见性过滤流程：Agent 经网关 introspect 校验后读取约 330+ 条的工具目录，再依次通过主体 RBAC 权限、MCP 连接白名单、风险策略三层求交集得到 tools/list 可见集；tools/call 时还要叠加 OAuth scope 与 HIGH 风险两阶段确认',
    region: 'tools/list 可见性流水线',
    agentT: 'AI Agent · MCP 客户端',
    agentS1: 'tools/list · tools/call（JSON-RPC 2.0）',
    agentS2: 'Authorization: Bearer access_token（JWT · 15min）',
    gwT: 'dc3-gateway · McpGatewayController',
    gwS1: 'introspect（gRPC）→ active · principal · scope · tenant · connection_id',
    catT: 'dc3_mcp_tool_catalog',
    catS1: '~330+ 工具 · tool_id = {service}:{METHOD}:{path}',
    catS2: 'x-dc3-ai：riskLevel · destructive · idempotent · openWorld',
    catS3: '目录刷新：管理端手动触发，无定时推送',
    f1T: '① principal RBAC（主体权限）',
    f1S1: '权限码 = PermissionProvider.listPermissionCodes',
    f1S2: '跨租户数据对 Agent 不可见',
    f2T: '② MCP 连接白名单',
    f2S1: 'dc3_mcp_connection_tool · enable_flag=1 放行',
    f2S2: '目录里有 ≠ 该连接放行',
    f3T: '③ 风险策略',
    f3S1: 'HIGH 默认隐藏 · 显式开启才可见',
    f3S2: 'LOW / MEDIUM 正常返回',
    resT: '可见 / 可调工具集 = ① ∩ ② ∩ ③',
    resS1: '→ tools/list 返回给 Agent',
    resS2: 'tools/call 再叠加 ④ scope 与 ⑤ 风险确认',
    interLabel: '交集',
    callT: '④ OAuth scope（调用时）',
    callS1: 'mcp:tools:list',
    callS2: 'mcp:tools:call · call:high',
    confirmT: '⑤ HIGH 两阶段确认',
    confirmS1: 'CONFIRM_REQUIRED + confirmId',
    confirmS2: '重调：confirmId + idempotency_key',
    confirmS3: '（详见 HIGH 风险确认时序图）',
    elbowLabel: 'tools/call 时叠加',
    chip1T: 'dc3_resource',
    chip1S: 'resource_code · permission_code（RBAC 权限码）',
    srcPerm: '权限码来源',
    chip2T: 'dc3_mcp_connection_tool',
    chip2S: 'connection_id × tool_id × enable_flag',
    srcAllow: '白名单来源',
    chip3T: 'x-dc3-ai · riskLevel',
    chip3S: 'LOW / MEDIUM / HIGH（注解手工标注）',
    srcRisk: '风险等级来源',
    postMcp: 'POST /mcp',
    readCatalog: '读取工具目录',
    filterLabel: '逐条过滤（求交集）',
    resultLabel: '返回交集',
    returnLabel: 'tools/list 返回交集（响应）',
    legAgent: 'Agent', legGw: '网关', legDb: '目录 / 来源表', legFilter: '过滤层 / 策略',
    legCall: '调用时附加闸门', legSolid: '主流程', legDash: '来源 / 响应'
  },
  en: {
    aria: 'MCP tool visibility filtering: after the gateway introspect check the agent reads the ~330+ tool catalog, then intersects principal RBAC permissions, the MCP connection allowlist and risk policy to derive the tools/list result; tools/call additionally requires OAuth scope and the HIGH-risk two-phase confirmation',
    region: 'tools/list visibility pipeline',
    agentT: 'AI Agent · MCP client',
    agentS1: 'tools/list · tools/call (JSON-RPC 2.0)',
    agentS2: 'Authorization: Bearer access_token (JWT · 15min)',
    gwT: 'dc3-gateway · McpGatewayController',
    gwS1: 'introspect (gRPC) → active · principal · scope · tenant · connection_id',
    catT: 'dc3_mcp_tool_catalog',
    catS1: '~330+ tools · tool_id = {service}:{METHOD}:{path}',
    catS2: 'x-dc3-ai: riskLevel · destructive · idempotent · openWorld',
    catS3: 'refresh: manual admin endpoint, no scheduled push',
    f1T: '① principal RBAC',
    f1S1: 'codes = PermissionProvider.listPermissionCodes',
    f1S2: 'cross-tenant data invisible to the agent',
    f2T: '② MCP connection allowlist',
    f2S1: 'dc3_mcp_connection_tool · enable_flag=1 to pass',
    f2S2: 'in catalog ≠ allowed for the connection',
    f3T: '③ risk policy',
    f3S1: 'HIGH hidden by default · opt-in only',
    f3S2: 'LOW / MEDIUM returned normally',
    resT: 'visible / callable set = ① ∩ ② ∩ ③',
    resS1: '→ returned by tools/list',
    resS2: 'tools/call adds ④ scope and ⑤ risk confirmation',
    interLabel: 'intersection',
    callT: '④ OAuth scope (at call time)',
    callS1: 'mcp:tools:list',
    callS2: 'mcp:tools:call · call:high',
    confirmT: '⑤ HIGH two-phase confirm',
    confirmS1: 'CONFIRM_REQUIRED + confirmId',
    confirmS2: 'retry: confirmId + idempotency_key',
    confirmS3: '(see the HIGH-risk confirm sequence)',
    elbowLabel: 'applied on tools/call',
    chip1T: 'dc3_resource',
    chip1S: 'resource_code · permission_code (RBAC codes)',
    srcPerm: 'permission source',
    chip2T: 'dc3_mcp_connection_tool',
    chip2S: 'connection_id × tool_id × enable_flag',
    srcAllow: 'allowlist source',
    chip3T: 'x-dc3-ai · riskLevel',
    chip3S: 'LOW / MEDIUM / HIGH (manually annotated)',
    srcRisk: 'risk-level source',
    postMcp: 'POST /mcp',
    readCatalog: 'read tool catalog',
    filterLabel: 'filter each tool (intersect)',
    resultLabel: 'intersection',
    returnLabel: 'tools/list response (intersection)',
    legAgent: 'agent', legGw: 'gateway', legDb: 'catalog / source tables', legFilter: 'filter / policy',
    legCall: 'extra gates at call time', legSolid: 'main flow', legDash: 'source / response'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 800">
        <defs>
          <marker id="mff-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mff-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mff-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#mff-grid)" height="100%" width="100%"/>

        <!-- pipeline region (spine) -->
        <rect fill="var(--dc3-region-be)" height="706" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="376" x="322" y="54"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="334" y="68">{{ s.region }}</text>

        <!-- main flow arrows -->
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="142"
              y2="164"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="532" y="158">{{ s.postMcp }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="226"
              y2="248"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="532" y="242">{{ s.readCatalog }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="334"
              y2="356"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="532" y="350">{{ s.filterLabel }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="422"
              y2="468"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="542" y="450">{{ s.interLabel }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="534"
              y2="580"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="542" y="562">{{ s.interLabel }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="646"
              y2="666"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="532" y="662">{{ s.resultLabel }}</text>

        <!-- intersection caps on the two mid arrows -->
        <circle cx="520" cy="445" fill="var(--dc3-amber-fill)" r="14" stroke="var(--dc3-amber-stroke)"
                stroke-width="1.2"/>
        <text fill="var(--dc3-amber-stroke)" font-size="13" font-weight="600" text-anchor="middle" x="520" y="450">∩
        </text>
        <circle cx="520" cy="557" fill="var(--dc3-amber-fill)" r="14" stroke="var(--dc3-amber-stroke)"
                stroke-width="1.2"/>
        <text fill="var(--dc3-amber-stroke)" font-size="13" font-weight="600" text-anchor="middle" x="520" y="562">∩
        </text>

        <!-- tools/call extra gates (left), folded into the result -->
        <path d="M 180,574 L 180,706 L 334,706" fill="none" marker-end="url(#mff-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="196" y="699">{{ s.elbowLabel }}</text>

        <!-- source chips (right) -->
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="704" x2="854" y1="390" y2="390"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="716" y="384">{{ s.srcPerm }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="704" x2="854" y1="502" y2="502"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="716" y="496">{{ s.srcAllow }}</text>
        <line marker-end="url(#mff-ah)" stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="704" x2="854" y1="614" y2="614"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="716" y="608">{{ s.srcRisk }}</text>

        <!-- response path back to the agent -->
        <path d="M 700,700 L 1260,700 L 1260,104 L 706,104" fill="none" marker-end="url(#mff-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="985" y="96">{{ s.returnLabel }}
        </text>

        <!-- spine nodes -->
        <rect fill="var(--dc3-ext-fill)" height="72" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="360"
              x="340" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="94">{{
            s.agentT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="112">{{ s.agentS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="130">{{ s.agentS2 }}</text>

        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="360"
              x="340" y="166"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="190">{{
            s.gwT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="210">{{ s.gwS1 }}</text>

        <rect fill="var(--dc3-db-fill)" height="84" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="360"
              x="340" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="274">{{
            s.catT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="292">{{ s.catS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="308">{{ s.catS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="324">{{ s.catS3 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.2"
              width="360" x="340" y="358"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="382">{{
            s.f1T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="400">{{ s.f1S1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="416">{{ s.f1S2 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.2"
              width="360" x="340" y="470"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="494">{{
            s.f2T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="512">{{ s.f2S1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="528">{{ s.f2S2 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.2"
              width="360" x="340" y="582"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="606">{{
            s.f3T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="624">{{ s.f3S1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="640">{{ s.f3S2 }}</text>

        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="360"
              x="340" y="668"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="520" y="694">{{
            s.resT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="714">{{ s.resS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="732">{{ s.resS2 }}</text>

        <!-- left: tools/call extra gates -->
        <rect fill="var(--dc3-rose-fill)" height="72" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="240"
              x="60" y="384"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="180" y="406">{{
            s.callT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="424">{{ s.callS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="442">{{ s.callS2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="88" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="240"
              x="60" y="486"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="180" y="508">{{
            s.confirmT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="526">{{ s.confirmS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="180" y="544">{{ s.confirmS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="180" y="562">{{ s.confirmS3 }}</text>

        <!-- right: filter sources -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="360"
              x="858" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1038" y="384">{{
            s.chip1T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1038" y="402">{{ s.chip1S }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="360"
              x="858" y="474"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1038" y="496">{{
            s.chip2T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1038" y="514">{{ s.chip2S }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="360" x="858" y="586"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1038" y="608">{{
            s.chip3T
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1038" y="626">{{ s.chip3S }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="768"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="777">{{ s.legAgent }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="768"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="777">{{ s.legGw }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="260" y="768"/>
        <text fill="var(--dc3-text2)" font-size="9" x="282" y="777">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="440" y="768"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="777">{{ s.legFilter }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="600" y="768"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="777">{{ s.legCall }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="790" x2="814" y1="774" y2="774"/>
        <text fill="var(--dc3-text2)" font-size="9" x="820" y="777">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="920" x2="944" y1="774" y2="774"/>
        <text fill="var(--dc3-text2)" font-size="9" x="950" y="777">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
