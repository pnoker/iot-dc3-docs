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
    aria: '读最新值时序图：调用方经网关请求 latest 接口，数据中心先批量查 Caffeine 缓存，未命中的位号一次性回源 TimescaleDB，合并后以分页 PointValueVO 返回',
    caller: '调用方', callerSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: ':8000 · 唯一入口',
    data: 'dc3-center-data', dataSub: 'PointValueServiceImpl',
    cache: 'Caffeine 本地缓存', cacheSub: 'PointValueLocalCache',
    ts: 'TimescaleDB', tsSub: 'dc3_point_value',
    m1a: 'POST /api/v3/data/point_value/latest', m1b: 'X-Auth-Tenant / Login / Token',
    m2a: '路由转发', m2b: '注入 X-Auth-Principal + Sign',
    n1: '@PreAuthorize("@perm.can(\'point_value\', \'list\')")',
    m3a: 'selectLatestPointValue(...)', m3b: '批量 · tenant + device + pointIds',
    m4: '命中的 pointId → 最新值',
    n2: '收集缓存未命中的 pointId',
    m5a: 'listLatestPointValues(未命中集)', m5b: '一次性回源',
    m6: '每个 point 的最新行',
    m7: '合并 → 分页 PointValueVO',
    m8: '200 OK · records[]',
    noteTitle: '历史区间查询不走缓存',
    noteL1: 'POST /point_value/list 直接扫时序库',
    noteL2: '按 startTime / endTime 过滤',
    legCaller: '调用方', legSvc: '网关 / 服务', legCache: '缓存', legDb: '时序库',
    legReq: '请求', legResp: '响应 / 返回'
  },
  en: {
    aria: 'Latest-value read sequence: the caller hits the latest endpoint through the gateway; the data center first batch-queries the Caffeine cache, falls back to TimescaleDB once for the missed point ids, then merges and returns a paginated PointValueVO',
    caller: 'Caller', callerSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: ':8000 · sole entry',
    data: 'dc3-center-data', dataSub: 'PointValueServiceImpl',
    cache: 'Caffeine local cache', cacheSub: 'PointValueLocalCache',
    ts: 'TimescaleDB', tsSub: 'dc3_point_value',
    m1a: 'POST /api/v3/data/point_value/latest', m1b: 'X-Auth-Tenant / Login / Token',
    m2a: 'route forward', m2b: 'inject X-Auth-Principal + Sign',
    n1: '@PreAuthorize("@perm.can(\'point_value\', \'list\')")',
    m3a: 'selectLatestPointValue(...)', m3b: 'batch · tenant + device + pointIds',
    m4: 'hit pointId → latest value',
    n2: 'collect cache-missed point ids',
    m5a: 'listLatestPointValues(missed)', m5b: 'single fallback query',
    m6: 'latest row per point',
    m7: 'merge → paginated PointValueVO',
    m8: '200 OK · records[]',
    noteTitle: 'History range query skips cache',
    noteL1: 'POST /point_value/list scans time-series DB',
    noteL2: 'filtered by startTime / endTime',
    legCaller: 'Caller', legSvc: 'Gateway / service', legCache: 'Cache', legDb: 'Time-series DB',
    legReq: 'Request', legResp: 'Response / return'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {caller: 110, gw: 330, data: 550, cache: 770, ts: 960}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1040 580">
        <defs>
          <marker id="dps-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dps-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dps-grid)" height="100%" width="100%"/>

        <!-- lifelines -->
        <line v-for="k in ['caller','gw','data','cache','ts']" :key="'ll' + k" :x1="PX[k]" :x2="PX[k]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="78" y2="520"/>

        <!-- activation bars -->
        <rect fill="var(--dc3-be-fill)" height="362" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="325" y="112"/>
        <rect fill="var(--dc3-be-fill)" height="320" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="545" y="150"/>
        <rect fill="var(--dc3-amber-fill)" height="54" stroke="var(--dc3-amber-stroke)" stroke-width="0.8" width="10"
              x="765" y="232"/>
        <rect fill="var(--dc3-db-fill)" height="54" stroke="var(--dc3-db-stroke)" stroke-width="0.8" width="10"
              x="955" y="344"/>

        <!-- messages -->
        <line :x1="PX.caller" :x2="PX.gw - 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="120" y2="120"/>
        <text :x="(PX.caller + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="104">
          {{ s.m1a }}
        </text>
        <text :x="(PX.caller + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" y="114">
          {{ s.m1b }}
        </text>
        <line :x1="PX.gw + 8" :x2="PX.data - 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="160" y2="160"/>
        <text :x="(PX.gw + PX.data) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="144">
          {{ s.m2a }}
        </text>
        <text :x="(PX.gw + PX.data) / 2" fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" y="154">
          {{ s.m2b }}
        </text>

        <!-- permission note on data lane -->
        <rect fill="var(--dc3-rose-fill)" height="24" rx="4" stroke="var(--dc3-rose-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="290" x="420" y="182"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="565" y="198">{{ s.n1 }}</text>

        <line :x1="PX.data + 8" :x2="PX.cache - 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="240" y2="240"/>
        <text :x="(PX.data + PX.cache) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="224">
          {{ s.m3a }}
        </text>
        <text :x="(PX.data + PX.cache) / 2" fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" y="234">
          {{ s.m3b }}
        </text>
        <line :x1="PX.cache - 8" :x2="PX.data + 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="278" y2="278"/>
        <text :x="(PX.data + PX.cache) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="271">
          {{ s.m4 }}
        </text>

        <!-- miss-collection note -->
        <rect fill="var(--dc3-region-be)" height="22" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="230" x="560" y="296"/>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="675" y="311">{{ s.n2 }}</text>

        <line :x1="PX.data + 8" :x2="PX.ts - 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="352" y2="352"/>
        <text :x="(PX.data + PX.ts) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="336">
          {{ s.m5a }}
        </text>
        <text :x="(PX.data + PX.ts) / 2" fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" y="346">
          {{ s.m5b }}
        </text>
        <line :x1="PX.ts - 8" :x2="PX.data + 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="390" y2="390"/>
        <text :x="(PX.data + PX.ts) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="383">
          {{ s.m6 }}
        </text>
        <line :x1="PX.data - 8" :x2="PX.gw + 8" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="428" y2="428"/>
        <text :x="(PX.gw + PX.data) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="421">
          {{ s.m7 }}
        </text>
        <line :x1="PX.gw - 8" :x2="PX.caller" marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="464" y2="464"/>
        <text :x="(PX.caller + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="457">
          {{ s.m8 }}
        </text>

        <!-- history-query note -->
        <rect fill="var(--dc3-amber-fill)" height="46" rx="4" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="330" x="620" y="478"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" font-weight="600" text-anchor="middle" x="785" y="494">
          {{ s.noteTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="785" y="508">{{ s.noteL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="785" y="520">{{ s.noteL2 }}</text>

        <!-- participant headers (drawn last so lines never overlap them) -->
        <rect fill="var(--dc3-ext-fill)" height="48" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="25" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="110" y="48">
          {{ s.caller }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="110" y="64">{{ s.callerSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="245" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="330" y="48">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="330" y="64">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="455" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="550" y="48">
          {{ s.data }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="550" y="64">{{ s.dataSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="685" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="48">
          {{ s.cache }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="770" y="64">{{ s.cacheSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="140"
              x="890" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="960" y="48">
          {{ s.ts }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="960" y="64">{{ s.tsSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="25" y="548"/>
        <text fill="var(--dc3-text2)" font-size="9" x="47" y="557">{{ s.legCaller }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="120" y="548"/>
        <text fill="var(--dc3-text2)" font-size="9" x="142" y="557">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="250" y="548"/>
        <text fill="var(--dc3-text2)" font-size="9" x="272" y="557">{{ s.legCache }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="360" y="548"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="557">{{ s.legDb }}</text>
        <line marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="470" x2="498" y1="554"
              y2="554"/>
        <text fill="var(--dc3-text2)" font-size="9" x="504" y="557">{{ s.legReq }}</text>
        <line marker-end="url(#dps-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="570"
              x2="598" y1="554" y2="554"/>
        <text fill="var(--dc3-text2)" font-size="9" x="604" y="557">{{ s.legResp }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
