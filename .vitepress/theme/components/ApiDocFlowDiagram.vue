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
    aria: 'API 文档生成与聚合流程：Controller 上的 springdoc 注解（@Tag/@Operation/@Parameter/@Schema 及 x-dc3-ai 扩展）在运行时由四个业务中心各自生成 OpenAPI JSON（路径带各自 base-path 前缀），网关通过 springdoc.swagger-ui.urls 把四份文档聚合为一个带服务下拉的 Swagger UI；开发者经 8000 端口访问，make openapi 可导出契约快照，MCP 聚合器读取 x-dc3-ai 落库为工具风险目录；生产 profile 下 springdoc 端点整体关闭',
    regCenter: '四个业务中心 · 注解在运行时各自生成',
    regGw: '网关聚合 · 对外唯一入口',
    regConsumer: '消费方',
    ann: 'Controller 注解: @Tag · @Operation · @Parameter · @Schema + x-dc3-ai 风险扩展',
    genLbl: 'springdoc 运行时生成',
    c1: 'dc3-center-auth :8300', c1s: '/auth/v3/api-docs',
    c2: 'dc3-center-manager :8400', c2s: '/manager/v3/api-docs',
    c3: 'dc3-center-data :8500', c3s: '/data/v3/api-docs',
    c4: 'dc3-center-agentic :8600', c4s: '/agentic/v3/api-docs',
    jsonLbl: '各中心 OpenAPI JSON',
    gw: 'dc3-gateway :8000',
    gwS: 'springdoc.swagger-ui.urls 聚合 · /v3/api-docs/{svc} 抹平 base-path',
    k1: '开发者浏览器', k1s: 'swagger-ui.html · Authorize 三件套',
    k2: 'make openapi', k2s: '导出各中心 JSON → build/openapi',
    k3: 'MCP 聚合器', k3s: '读取 x-dc3-ai 风险标注',
    k4: 'dc3_mcp_tool_catalog', k4s: 'riskLevel · 破坏性 · 幂等 · 开放世界',
    lblBrowse: 'HTTP :8000', lblExport: '拉取 JSON', lblAi: 'x-dc3-ai 扩展', lblPersist: '风险策略落库',
    note: '生产 profile (pro) 由各中心 application-pro.yml 关闭: springdoc.api-docs.enabled=false · swagger-ui.enabled=false —— 端点不存在，不暴露任何文档',
    legAnno: '注解 / 人的入口', legSvc: '中心服务 / 网关', legTool: '工具链',
    legMcp: 'MCP / 安全', legDb: '工具目录表', legDash: '导出 / 聚合读取'
  },
  en: {
    aria: 'API doc generation and aggregation: springdoc annotations on controllers (@Tag/@Operation/@Parameter/@Schema plus the x-dc3-ai extension) are rendered at runtime by the four business centers into their own OpenAPI JSON (each under its base-path prefix); the gateway merges the four via springdoc.swagger-ui.urls into one Swagger UI with a service dropdown; developers browse port 8000, make openapi exports contract snapshots, and the MCP aggregator reads x-dc3-ai into the tool risk catalog; the pro profile disables the springdoc endpoints entirely',
    regCenter: 'Four business centers · annotations generate at runtime',
    regGw: 'Gateway aggregation · the single entry',
    regConsumer: 'Consumers',
    ann: 'Controller annotations: @Tag · @Operation · @Parameter · @Schema + x-dc3-ai risk extension',
    genLbl: 'springdoc renders at runtime',
    c1: 'dc3-center-auth :8300', c1s: '/auth/v3/api-docs',
    c2: 'dc3-center-manager :8400', c2s: '/manager/v3/api-docs',
    c3: 'dc3-center-data :8500', c3s: '/data/v3/api-docs',
    c4: 'dc3-center-agentic :8600', c4s: '/agentic/v3/api-docs',
    jsonLbl: 'per-center OpenAPI JSON',
    gw: 'dc3-gateway :8000',
    gwS: 'springdoc.swagger-ui.urls merge · /v3/api-docs/{svc} flattens base-paths',
    k1: 'Developer browser', k1s: 'swagger-ui.html · Authorize headers',
    k2: 'make openapi', k2s: 'export JSON → build/openapi',
    k3: 'MCP aggregator', k3s: 'reads x-dc3-ai risk metadata',
    k4: 'dc3_mcp_tool_catalog', k4s: 'riskLevel · destructive · idempotent · openWorld',
    lblBrowse: 'HTTP :8000', lblExport: 'pull JSON', lblAi: 'x-dc3-ai extension', lblPersist: 'risk policy persisted',
    note: 'The pro profile disables springdoc in each application-pro.yml: api-docs.enabled=false · swagger-ui.enabled=false — the endpoints do not exist, nothing is exposed',
    legAnno: 'Annotations / human entry', legSvc: 'Center services / gateway', legTool: 'Tooling',
    legMcp: 'MCP / security', legDb: 'Tool catalog table', legDash: 'Export / aggregate read'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 700">
        <defs>
          <marker id="adf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="adf-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="adf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#adf-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="196" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1200" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regCenter }}</text>
        <rect fill="var(--dc3-region-be)" height="110" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="880" x="40" y="290"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="308">{{ s.regGw }}</text>
        <rect fill="var(--dc3-region-amber)" height="310" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="320" x="940" y="290"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="952" y="308">{{ s.regConsumer }}
        </text>

        <!-- annotation band to centers -->
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="189" x2="189" y1="146"
              y2="172"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="469" x2="469" y1="146"
              y2="172"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="749" x2="749" y1="146"
              y2="172"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1029" x2="1029" y1="146"
              y2="172"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="200" y="164">{{ s.genLbl }}</text>

        <!-- centers to gateway -->
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="189" x2="420" y1="236"
              y2="318"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="469" x2="500" y1="236"
              y2="318"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="749" x2="580" y1="236"
              y2="318"/>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1029" x2="660" y1="236"
              y2="318"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="96" y="286">{{ s.jsonLbl }}</text>

        <!-- consumer arrows -->
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="958" x2="674" y1="342"
              y2="340"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="816" y="332">{{ s.lblBrowse }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="958"
              x2="674" y1="418" y2="360"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="816" y="400">{{ s.lblExport }}</text>
        <line marker-end="url(#adf-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="958" x2="668" y1="492" y2="384"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="815" y="448">{{ s.lblAi }}</text>
        <line marker-end="url(#adf-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="1100" x2="1100"
              y1="518" y2="532"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="1108" y="529">{{ s.lblPersist }}</text>

        <!-- annotation band -->
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="1152"
              x="64" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="640" y="126">
          {{ s.ann }}
        </text>

        <!-- center nodes -->
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="64" y="176"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="189" y="200">
          {{ s.c1 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="189" y="220">{{ s.c1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="344" y="176"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="469" y="200">
          {{ s.c2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="469" y="220">{{ s.c2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="624" y="176"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="749" y="200">
          {{ s.c3 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="749" y="220">{{ s.c3s }}</text>
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="904" y="176"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1029" y="200">
          {{ s.c4 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="1029" y="220">{{ s.c4s }}</text>

        <!-- gateway -->
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="420"
              x="250" y="322"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="460" y="348">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="368">{{ s.gwS }}</text>

        <!-- consumer nodes -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="960" y="316"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1100" y="338">
          {{ s.k1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1100" y="356">{{ s.k1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="960" y="392"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1100" y="414">
          {{ s.k2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1100" y="432">{{ s.k2s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="52" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="280" x="960" y="466"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1100" y="488">
          {{ s.k3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1100" y="506">{{ s.k3s }}</text>
        <rect fill="var(--dc3-db-fill)" height="52" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="280"
              x="960" y="534"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1100" y="556">
          {{ s.k4 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1100" y="574">{{ s.k4s }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1200" x="40" y="620"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="642">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="681">{{ s.legAnno }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="230" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="252" y="681">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="410" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="681">{{ s.legTool }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="510" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="532" y="681">{{ s.legMcp }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="640" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="681">{{ s.legDb }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="830" x2="858" y1="678" y2="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="864" y="681">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
