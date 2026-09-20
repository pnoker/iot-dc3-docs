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
    header: '所有请求经网关 · 三个鉴权头 X-Auth-Tenant / X-Auth-Login / X-Auth-Token · 令牌绑定调用方 tenantId',
    start: 'API 请求', startSub: '带鉴权头',
    gw: '网关 · 控制器', gwSub: '解出调用方租户',
    d1: '单条按 ID?',
    b1: '批量 filterTenant()', b1Sub: 'list / latest / history',
    b2: '剔除别家租户条目', b2Sub: '只返回本租户数据 · 不报错',
    q: '查库取实体',
    d2: 'tenantId 一致?',
    ok: '返回数据 200', okSub: 'requireTenant 通过',
    nf: '抛 NotFoundException', nfSub: '对外 404 · 不泄露存在性',
    plannedTitle: '规划中 · 当前未启用',
    plannedL1: '库级自动 WHERE tenant_id = ?',
    plannedL2: 'MybatisPlus 拦截器统一兜底',
    note404: '查不到 = 真不存在 或 属于别家租户——对调用方两者无差别（404 而非 403）',
    lblHttp: 'HTTP', lblEnter: '进入', lblNo: '[否] 批量', lblYes: '[是] 单条',
    lblCompare: '比对', lblSame: '[是] 本租户', lblDiff: '[否] 跨租户/不存在', lblFuture: '未来统一兜底',
    lblFilter: '过滤',
    legStart: '请求入口', legCenter: '网关 / 服务', legDecision: '决策分支',
    legAllow: '放行', legDeny: '拒绝（404）', legPlanned: '规划中（虚线）',
    aria: '租户隔离决策流程：请求经网关解出调用方租户后分流——单条按 ID 查询先取实体再比对 tenantId，一致放行、不一致或不存在抛 NotFoundException 返回 404；批量走 filterTenant 直接剔除别家租户条目；库级自动追加租户条件仍在规划中'
  },
  en: {
    header: 'all requests pass the gateway · headers X-Auth-Tenant / X-Auth-Login / X-Auth-Token bind the caller tenantId',
    start: 'API request', startSub: 'with auth headers',
    gw: 'Gateway · Controller', gwSub: 'resolve caller tenant',
    d1: 'single by ID?',
    b1: 'batch filterTenant()', b1Sub: 'list / latest / history',
    b2: 'drop other tenants', b2Sub: 'own-tenant rows only · no error',
    q: 'load entity by ID',
    d2: 'tenantId matches?',
    ok: 'return data 200', okSub: 'requireTenant passed',
    nf: 'throw NotFoundException', nfSub: '404 outside · no existence leak',
    plannedTitle: 'planned · not enabled today',
    plannedL1: 'automatic WHERE tenant_id = ?',
    plannedL2: 'MybatisPlus interceptor fallback',
    note404: 'not found = missing or another tenant — indistinguishable to the caller (404, not 403)',
    lblHttp: 'HTTP', lblEnter: 'enter', lblNo: '[no] batch', lblYes: '[yes] single',
    lblCompare: 'compare', lblSame: '[yes] same tenant', lblDiff: '[no] cross/absent', lblFuture: 'future fallback',
    lblFilter: 'filter',
    legStart: 'request entry', legCenter: 'gateway / service', legDecision: 'decision',
    legAllow: 'allow', legDeny: 'deny (404)', legPlanned: 'planned (dashed)',
    aria: 'Tenant isolation decision flow: after the gateway resolves the caller tenant the flow branches — a single by-ID lookup loads the entity and compares tenantId, matching passes while mismatch or absence throws NotFoundException as 404; batch queries run filterTenant to silently drop other tenants rows; database-level automatic tenant conditions remain planned'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 640">
        <defs>
          <marker id="tad-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="tad-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#tad-grid)" height="100%" width="100%"/>

        <!-- header note -->
        <text fill="var(--dc3-text2)" font-size="9" x="60" y="44">{{ s.header }}</text>

        <!-- flow arrows -->
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="286" y1="118" y2="118"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="263" y="108">{{ s.lblHttp }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="470" x2="501" y1="116" y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="485" y="106">{{ s.lblEnter }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="665" x2="736" y1="116" y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="700" y="106">{{ s.lblNo }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="920" x2="956" y1="116" y2="116"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="938" y="106">{{ s.lblFilter }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="585" x2="585" y1="158" y2="206"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="593" y="188">{{ s.lblYes }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="585" x2="585" y1="260" y2="284"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="593" y="278">{{ s.lblCompare }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="670" x2="786" y1="330"
              y2="330"/>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="728" y="320">{{ s.lblSame }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="585" x2="585" y1="372"
              y2="446"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="593" y="415">{{ s.lblDiff }}</text>
        <line marker-end="url(#tad-ah)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="710" x2="996" y1="478" y2="478"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="853" y="468">{{ s.lblFuture }}</text>

        <!-- nodes -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="60" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="150" y="112">{{
            s.start
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="150" y="130">{{ s.startSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="290" y="88"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="380" y="110">{{
            s.gw
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="380" y="128">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="740" y="88"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="830" y="110">{{
            s.b1
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="830" y="128">{{ s.b1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="960" y="88"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="110">{{
            s.b2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="128">{{ s.b2Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="510" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="585" y="240">{{
            s.q
          }}
        </text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="790" y="302"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="875" y="324">{{
            s.ok
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="875" y="342">{{ s.okSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="250"
              x="460" y="450"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="585" y="472">{{
            s.nf
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="585" y="490">{{ s.nfSub }}</text>

        <!-- decision diamonds -->
        <polygon fill="var(--dc3-region-amber)" points="585,74 665,116 585,158 505,116"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="585" y="120">{{
            s.d1
          }}
        </text>
        <polygon fill="var(--dc3-region-amber)" points="585,288 670,330 585,372 500,330"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="585" y="334">{{
            s.d2
          }}
        </text>

        <!-- planned card -->
        <rect fill="var(--dc3-amber-fill)" height="90" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,3"
              stroke-width="1" width="240" x="1000" y="420"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="1012" y="440">{{ s.plannedTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1012" y="460">{{ s.plannedL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1012" y="478">{{ s.plannedL2 }}</text>

        <!-- 404 note -->
        <rect fill="var(--dc3-rose-fill)" height="40" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="620" x="60" y="560"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="72" y="584">{{ s.note404 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="720" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="742" y="579">{{ s.legStart }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="840" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="862" y="579">{{ s.legCenter }}</text>
        <polygon fill="var(--dc3-region-amber)" points="970,576 980,570 990,576 980,582"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="996" y="579">{{ s.legDecision }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="1100" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1122" y="579">{{ s.legDeny }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="60" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="629">{{ s.legPlanned }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="1" x1="240" x2="260" y1="626" y2="626"/>
        <text fill="var(--dc3-text2)" font-size="9" x="266" y="629">{{ s.legAllow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
