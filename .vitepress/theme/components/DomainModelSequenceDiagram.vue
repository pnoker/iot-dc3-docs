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
    aria: '跨层调用时序（读一行位号）：调用方经控制器、服务、管理器查库拿到裸 Byte 的 PointDO，管理器用 PointBuilder.buildBOByDO 连同 @AfterMapping 钩子把标志位转成域枚举、JSON 扩展反序列化成 PointBO，服务再 buildVOByBO 转成 PointVO 返回',
    caller: '调用方', callerSub: 'HTTP 客户端',
    ctrl: 'PointController', ctrlSub: 'API 层 · VO',
    svc: 'PointService', svcSub: '业务层 · BO',
    mgr: 'PointManager', mgrSub: '持久层 · DO',
    bld: 'PointBuilder', bldSub: 'MapStruct 转换',
    db: 'PostgreSQL', dbSub: 'dc3_point',
    m1: '① GET /manager/point/get_by_id',
    m2: '② get(id) · tenantId',
    m3: '③ selectById(id)',
    m4: '④ SELECT ... WHERE point_id = ?',
    m5: '⑤ PointDO (标志位是裸 Byte)',
    n1: 'buildBOByDO() · @AfterMapping',
    m6: '⑥ DO → BO',
    m7: '⑦ PointBO (域枚举)',
    m8: '⑧ PointBO',
    n2: 'buildVOByBO()',
    m9: '⑨ BO → VO',
    m10: '⑩ PointVO',
    m11: '⑪ PointVO',
    m12: '⑫ 200 · R<PointVO>',
    na1: '钩子: Byte→枚举 ofIndex', na2: 'pointExt → parseObject',
    nb1: 'BO / VO 同为域枚举', nb2: '直接同名映射',
    wTitle: '写路径反向 (对照)',
    w1: 'Controller: buildBOByVO(VO) → BO    →    Service: buildDOByBO(BO) → DO',
    w2: '反方向钩子: enum.getIndex() 写回 Byte · JsonUtil.toJsonString 落 JSON 扩展',
    legApi: 'API / 调用方', legBiz: '业务 / 持久', legMap: 'MapStruct', legDb: '数据库',
    legReq: '调用', legResp: '返回'
  },
  en: {
    aria: 'Cross-layer read sequence for one point row: the caller goes through controller, service and manager to fetch a raw-Byte PointDO; the manager runs PointBuilder.buildBOByDO whose @AfterMapping hooks turn flag bytes into domain enums and deserialize the JSON extension into PointBO; the service then builds the PointVO via buildVOByBO and returns it',
    caller: 'Caller', callerSub: 'HTTP client',
    ctrl: 'PointController', ctrlSub: 'API layer · VO',
    svc: 'PointService', svcSub: 'business layer · BO',
    mgr: 'PointManager', mgrSub: 'persistence · DO',
    bld: 'PointBuilder', bldSub: 'MapStruct mapping',
    db: 'PostgreSQL', dbSub: 'dc3_point',
    m1: '① GET /manager/point/get_by_id',
    m2: '② get(id) · tenantId',
    m3: '③ selectById(id)',
    m4: '④ SELECT ... WHERE point_id = ?',
    m5: '⑤ PointDO (flags are raw Byte)',
    n1: 'buildBOByDO() · @AfterMapping',
    m6: '⑥ DO → BO',
    m7: '⑦ PointBO (domain enums)',
    m8: '⑧ PointBO',
    n2: 'buildVOByBO()',
    m9: '⑨ BO → VO',
    m10: '⑩ PointVO',
    m11: '⑪ PointVO',
    m12: '⑫ 200 · R<PointVO>',
    na1: 'hook: Byte→enum ofIndex', na2: 'pointExt → parseObject',
    nb1: 'BO / VO share domain enums', nb2: 'direct same-name mapping',
    wTitle: 'Write path in reverse (for contrast)',
    w1: 'Controller: buildBOByVO(VO) → BO    →    Service: buildDOByBO(BO) → DO',
    w2: 'reverse hooks: enum.getIndex() back to Byte · JsonUtil.toJsonString for JSON ext',
    legApi: 'API / caller', legBiz: 'Business / persistence', legMap: 'MapStruct', legDb: 'Database',
    legReq: 'Call', legResp: 'Return'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {caller: 90, ctrl: 290, svc: 500, mgr: 710, bld: 920, db: 1120}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 736">
        <defs>
          <marker id="dmseq-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dmseq-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dmseq-grid)" height="100%" width="100%"/>

        <!-- lifelines -->
        <line v-for="k in ['caller','ctrl','svc','mgr','bld','db']" :key="'ll' + k" :x1="PX[k]" :x2="PX[k]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="78" y2="628"/>

        <!-- activation bars -->
        <rect fill="var(--dc3-fe-fill)" height="516" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10"
              x="285" y="102"/>
        <rect fill="var(--dc3-be-fill)" height="470" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="495" y="142"/>
        <rect fill="var(--dc3-be-fill)" height="250" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="705" y="182"/>
        <rect fill="var(--dc3-amber-fill)" height="206" stroke="var(--dc3-amber-stroke)" stroke-width="0.8" width="10"
              x="915" y="340"/>
        <rect fill="var(--dc3-db-fill)" height="54" stroke="var(--dc3-db-stroke)" stroke-width="0.8" width="10"
              x="1115" y="222"/>

        <!-- messages -->
        <line :x1="PX.caller" :x2="PX.ctrl - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="110" y2="110"/>
        <text :x="(PX.caller + PX.ctrl) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="102">
          {{ s.m1 }}
        </text>
        <line :x1="PX.ctrl + 8" :x2="PX.svc - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="150" y2="150"/>
        <text :x="(PX.ctrl + PX.svc) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="142">
          {{ s.m2 }}
        </text>
        <line :x1="PX.svc + 8" :x2="PX.mgr - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="190" y2="190"/>
        <text :x="(PX.svc + PX.mgr) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="182">
          {{ s.m3 }}
        </text>
        <line :x1="PX.mgr + 8" :x2="PX.db - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="230" y2="230"/>
        <text :x="(PX.mgr + PX.db) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="222">
          {{ s.m4 }}
        </text>
        <line :x1="PX.db - 8" :x2="PX.mgr + 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="268" y2="268"/>
        <text :x="(PX.mgr + PX.db) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="260">
          {{ s.m5 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="22" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="220" x="725" y="286"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="733" y="301">{{ s.n1 }}</text>
        <line :x1="PX.mgr + 8" :x2="PX.bld - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="348" y2="348"/>
        <text :x="(PX.mgr + PX.bld) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="340">
          {{ s.m6 }}
        </text>
        <line :x1="PX.bld - 8" :x2="PX.mgr + 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="386" y2="386"/>
        <text :x="(PX.mgr + PX.bld) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="378">
          {{ s.m7 }}
        </text>
        <line :x1="PX.mgr - 8" :x2="PX.svc + 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="424" y2="424"/>
        <text :x="(PX.svc + PX.mgr) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="416">
          {{ s.m8 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="22" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="160" x="515" y="442"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="523" y="457">{{ s.n2 }}</text>
        <line :x1="PX.svc + 8" :x2="PX.bld - 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5" y1="500" y2="500"/>
        <text :x="(PX.svc + PX.bld) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="492">
          {{ s.m9 }}
        </text>
        <line :x1="PX.bld - 8" :x2="PX.svc + 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="536" y2="536"/>
        <text :x="(PX.svc + PX.bld) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="528">
          {{ s.m10 }}
        </text>
        <line :x1="PX.svc - 8" :x2="PX.ctrl + 8" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="572" y2="572"/>
        <text :x="(PX.ctrl + PX.svc) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="564">
          {{ s.m11 }}
        </text>
        <line :x1="PX.ctrl - 8" :x2="PX.caller" marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="608" y2="608"/>
        <text :x="(PX.caller + PX.ctrl) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="600">
          {{ s.m12 }}
        </text>

        <!-- builder hook notes -->
        <rect fill="var(--dc3-amber-fill)" height="36" rx="4" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="170" x="935" y="292"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="1020" y="306">{{ s.na1 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="1020" y="320">{{ s.na2 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="36" rx="4" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="170" x="935" y="446"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="1020" y="460">{{ s.nb1 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="1020" y="474">{{ s.nb2 }}</text>

        <!-- write-path strip -->
        <rect fill="var(--dc3-region-amber)" height="58" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1120" x="60" y="640"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="76" y="660">{{ s.wTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="76" y="678">{{ s.w1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="76" y="692">{{ s.w2 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-ext-fill)" height="48" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="160"
              x="10" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="90" y="48">
          {{ s.caller }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="90" y="64">{{ s.callerSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="205" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="290" y="48">
          {{ s.ctrl }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="290" y="64">{{ s.ctrlSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="420" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="500" y="48">
          {{ s.svc }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="500" y="64">{{ s.svcSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="625" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="710" y="48">
          {{ s.mgr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="710" y="64">{{ s.mgrSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="835" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="920" y="48">
          {{ s.bld }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="920" y="64">{{ s.bldSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="170"
              x="1035" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1120" y="48">
          {{ s.db }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1120" y="64">{{ s.dbSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="721">{{ s.legApi }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="180" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="721">{{ s.legBiz }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="330" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="352" y="721">{{ s.legMap }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="460" y="712"/>
        <text fill="var(--dc3-text2)" font-size="9" x="482" y="721">{{ s.legDb }}</text>
        <line marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="580" x2="608" y1="718"
              y2="718"/>
        <text fill="var(--dc3-text2)" font-size="9" x="614" y="721">{{ s.legReq }}</text>
        <line marker-end="url(#dmseq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="680"
              x2="708" y1="718" y2="718"/>
        <text fill="var(--dc3-text2)" font-size="9" x="714" y="721">{{ s.legResp }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
