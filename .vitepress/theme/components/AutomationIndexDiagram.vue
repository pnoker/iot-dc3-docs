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
    aria: '自动化栏目定位：人、脚本与 AI 编码工具三类发起方都汇入 dc3 CLI，经网关与 dc3-center-auth 鉴权进入业务中心服务，结果确定可预测；对照 AI 栏目由大模型经对话或 MCP 自主决策，两条路互补',
    regionDet: '确定性执行 · 让人或脚本驱动（本栏目）',
    regionAi: '对照 · AI 栏目（让模型决策）',
    humanName: '人 / 运维',
    humanSub: '本地调试',
    scriptName: '脚本 / CI',
    scriptSub: '批量 · 定时 · 流水线',
    coderName: 'AI 编码工具',
    coderSub: 'Claude Code 等 · 经 shell',
    cliName: 'dc3 CLI',
    cliSub: 'TypeScript · Node ≥ 20',
    cliSub2: '三段式登录 · 12h token',
    cliSub3: '自动续期 · --format json',
    gwName: '网关 dc3-gateway',
    gwSub: ':8000 · 唯一入口',
    authName: 'dc3-center-auth',
    authSub: 'RBAC · 租户校验',
    svcName: '业务中心服务',
    svcSub: 'device · point · driver',
    llmName: 'LLM / 大模型',
    llmSub: '模型自主决策',
    llmSub2: 'Agentic · MCP',
    lblTerminal: '终端',
    lblScript: '脚本',
    lblShell: '经 shell',
    lblHttp: 'HTTP',
    lblHeaders: 'X-Auth-* 三头',
    lblPrincipal: 'principal',
    lblAllow: '放行',
    lblAi: '对话 / MCP（见 AI 栏目）',
    notePerm: 'CLI 拿不到比登录账号更多的权限 · 跨租户返回 404 而非数据',
    legHuman: '发起方',
    legCli: 'dc3 CLI',
    legSvc: '平台服务',
    legAuth: '鉴权',
    legAi: 'AI 栏目（对照）'
  },
  en: {
    aria: 'Automation section positioning: humans, scripts and AI coding tools all funnel into the dc3 CLI, pass the gateway and dc3-center-auth, and reach center services with deterministic results; in contrast the AI section lets an LLM decide via chat or MCP — the two are complementary',
    regionDet: 'Deterministic execution · driven by humans or scripts (this section)',
    regionAi: 'Contrast · AI section (let the model decide)',
    humanName: 'Human / ops',
    humanSub: 'local debugging',
    scriptName: 'Script / CI',
    scriptSub: 'batch · cron · pipeline',
    coderName: 'AI coding tool',
    coderSub: 'Claude Code etc. via shell',
    cliName: 'dc3 CLI',
    cliSub: 'TypeScript · Node ≥ 20',
    cliSub2: '3-step login · 12h token',
    cliSub3: 'auto renew · --format json',
    gwName: 'Gateway dc3-gateway',
    gwSub: ':8000 · single entry',
    authName: 'dc3-center-auth',
    authSub: 'RBAC · tenant check',
    svcName: 'Center services',
    svcSub: 'device · point · driver',
    llmName: 'LLM',
    llmSub: 'model decides',
    llmSub2: 'Agentic · MCP',
    lblTerminal: 'terminal',
    lblScript: 'script',
    lblShell: 'via shell',
    lblHttp: 'HTTP',
    lblHeaders: 'X-Auth-* headers',
    lblPrincipal: 'principal',
    lblAllow: 'allow',
    lblAi: 'chat / MCP (see AI section)',
    notePerm: 'The CLI never exceeds the login account permissions · cross-tenant returns 404, not data',
    legHuman: 'Initiator',
    legCli: 'dc3 CLI',
    legSvc: 'Platform service',
    legAuth: 'Auth',
    legAi: 'AI section (contrast)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1260 470">
        <defs>
          <marker id="aui-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="aui-ah-fe" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-fe-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="aui-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aui-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="330" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1180" x="40" y="36"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="56">{{ s.regionDet }}</text>
        <rect fill="var(--dc3-region-amber)" height="84" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="440" x="760" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="772" y="82">{{ s.regionAi }}</text>

        <!-- arrows (drawn before nodes) -->
        <path d="M 222 116 L 258 116 L 258 180 L 294 180" fill="none" marker-end="url(#aui-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="240" y="108">{{ s.lblTerminal }}</text>
        <line marker-end="url(#aui-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="222" x2="294" y1="206" y2="206"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="258" y="198">{{ s.lblScript }}</text>
        <path d="M 222 296 L 258 296 L 258 240 L 294 240" fill="none" marker-end="url(#aui-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="240" y="310">{{ s.lblShell }}</text>
        <line marker-end="url(#aui-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="492" x2="544" y1="210" y2="210"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="518" y="200">{{ s.lblHttp }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="518" y="226">{{ s.lblHeaders }}</text>
        <line marker-end="url(#aui-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="728" x2="780" y1="210" y2="210"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="754" y="202">{{ s.lblPrincipal }}</text>
        <line marker-end="url(#aui-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="964" x2="1014" y1="210" y2="210"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="989" y="202">{{ s.lblAllow }}</text>
        <path d="M 788 116 L 636 116 L 636 166" fill="none" marker-end="url(#aui-ah-fe)"
              stroke="var(--dc3-fe-stroke)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="712" y="108">{{ s.lblAi }}</text>

        <!-- node: human -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="72" y="88"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="147" y="112">{{
            s.humanName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="147" y="130">{{ s.humanSub }}</text>

        <!-- node: script / CI -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="72" y="178"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="147" y="202">{{
            s.scriptName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="147" y="220">{{ s.scriptSub }}</text>

        <!-- node: AI coding tool -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="150"
              x="72" y="268"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="147" y="292">{{
            s.coderName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="147" y="310">{{ s.coderSub }}</text>

        <!-- node: dc3 CLI -->
        <rect fill="var(--dc3-amber-fill)" height="140" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="190" x="296" y="140"/>
        <text fill="var(--dc3-box-name)" font-size="14" font-weight="700" text-anchor="middle" x="391" y="172">{{
            s.cliName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="391" y="192">{{ s.cliSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="391" y="208">{{ s.cliSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="391" y="224">{{ s.cliSub3 }}</text>

        <!-- node: gateway -->
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="546" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="636" y="198">{{
            s.gwName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="636" y="216">{{ s.gwSub }}</text>

        <!-- node: auth -->
        <rect fill="var(--dc3-rose-fill)" height="80" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="180" x="782" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="872" y="198">{{
            s.authName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="872" y="216">{{ s.authSub }}</text>

        <!-- node: center services -->
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="1016" y="170"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1106" y="198">{{
            s.svcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1106" y="216">{{ s.svcSub }}</text>

        <!-- node: LLM (AI contrast) -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="790" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="880" y="112">{{
            s.llmName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="880" y="128">{{ s.llmSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="start" x="1000" y="120">{{ s.llmSub2 }}</text>

        <!-- bottom note -->
        <text fill="var(--dc3-text2)" font-size="8" x="72" y="350">{{ s.notePerm }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="70" y="430"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="439">{{ s.legHuman }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="180" y="430"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="439">{{ s.legCli }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="300" y="430"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="439">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="430" y="430"/>
        <text fill="var(--dc3-text2)" font-size="9" x="452" y="439">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="540" y="430"/>
        <text fill="var(--dc3-text2)" font-size="9" x="562" y="439">{{ s.legAi }}</text>
        <line stroke="var(--dc3-fe-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="680" x2="696" y1="436"
              y2="436"/>
        <text fill="var(--dc3-text2)" font-size="9" x="702" y="439">{{ s.lblAi }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
