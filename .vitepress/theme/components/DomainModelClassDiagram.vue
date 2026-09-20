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
    aria: '领域模型类图：API 层 PointController 与 PointVO、业务层 PointService 与 PointBO、持久层 PointManager 与 PointDO 三层调用链，右侧 MapStruct PointBuilder 负责 VO/BO/DO 双向转换，枚举与 JSON 扩展在 @AfterMapping 钩子里手工映射',
    apiRegion: 'API 层 · Controller ↔ VO (域枚举)',
    bizRegion: '业务层 · Service ↔ BO (域枚举 · TenantOwned)',
    perRegion: '持久层 · Manager ↔ DO (裸 Byte · 表镜像)',
    mapRegion: '转换层 · MapStruct *Builder',
    ctrl: 'PointController',
    ctrlF1: '· 收发 PointVO', ctrlF2: '· @PreAuthorize 守卫', ctrlF3: '· CRUD 动词约定',
    svc: 'PointService',
    svcF1: '· 业务逻辑传 BO', svcF2: '· 裸 Byte 不出持久层', svcF3: '· get*/list* 门面',
    mgr: 'PointManager',
    mgrF1: '· select* 仅在此层', mgrF2: '· buildDOByBO 后落库', mgrF3: '· 读取反向 buildBOByDO',
    vo: 'PointVO', voTag: '«API 形态»',
    voF1: '+ pointTypeFlag: PointTypeEnum', voF2: '+ rwFlag: RwTypeEnum',
    voF3: '+ enableFlag: EnableFlagEnum', voF4: '+ baseValue/multiple: BigDecimal',
    bo: 'PointBO', boTag: '«业务形态»',
    boF1: '+ 同 VO 的枚举字段', boF2: '+ 继承 BaseBO',
    boF3: '+ 实现 TenantOwned (tenantId)', boF4: '+ 换算 BigDecimal (DO 为 Double)',
    do_: 'PointDO', doTag: '«表镜像»',
    doF1: '+ @TableName dc3_point', doF2: '+ pointTypeFlag / rwFlag: Byte',
    doF3: '+ pointExt: JsonExt (Jackson)', doF4: '+ @TableId ASSIGN_ID · @TableLogic',
    bld: 'PointBuilder', bldTag: '«MapStruct 转换器»',
    bldM1: '+ buildVOByBO(BO) → VO', bldM2: '+ buildBOByVO(VO) → BO',
    bldM3: '+ buildBOByDO(DO) → BO', bldM4: '+ buildDOByBO(BO) → DO',
    bldH: '@AfterMapping 钩子:',
    bldH1: '· Byte → 枚举   ofIndex(byte)', bldH2: '· 枚举 → Byte   getIndex()',
    bldH3: '· JSON 串 → 扩展   parseObject', bldH4: '· 扩展 → JSON 串   toJsonString',
    bldN1: '同名同类型字段自动映射', bldN2: '枚举字段先 @Mapping(ignore=true)',
    bldN3: 'null 安全: 枚举为空则不写', bldN4: '漏写钩子 → 编译失败或静默丢值',
    bldX1: 'PointExt: JsonExt ⇄ PointExt', bldX2: 'BaseExt 三件套: type·version·remark',
    bldX3: '加字段口诀: DO 加 Byte + 枚举,', bldX4: '两个方向的 @AfterMapping 都要补',
    a1d: 'buildBOByVO()', a1u: 'buildVOByBO()',
    a2d: 'buildDOByBO()', a2u: 'buildBOByDO()',
    a3: 'VO ↔ BO', a4: 'BO ↔ DO',
    a8: 'VO 收发', a7: '传 BO', a6: 'select*',
    legApi: 'API 形态', legBiz: '业务形态', legDb: '表镜像', legSvc: '调用链组件',
    legMap: 'MapStruct 转换', legCall: '调用', legRet: '返回'
  },
  en: {
    aria: 'Domain-model class diagram: the three-layer call chain — PointController with PointVO in the API layer, PointService with PointBO in the business layer, PointManager with PointDO in the persistence layer — plus the MapStruct PointBuilder on the right converting VO/BO/DO both ways, with enum and JSON-extension mapping done in @AfterMapping hooks',
    apiRegion: 'API layer · Controller ↔ VO (domain enums)',
    bizRegion: 'Business layer · Service ↔ BO (domain enums · TenantOwned)',
    perRegion: 'Persistence · Manager ↔ DO (raw Byte · table mirror)',
    mapRegion: 'Mapping layer · MapStruct *Builder',
    ctrl: 'PointController',
    ctrlF1: '· sends/receives PointVO', ctrlF2: '· @PreAuthorize guards', ctrlF3: '· CRUD verb convention',
    svc: 'PointService',
    svcF1: '· business logic in BO', svcF2: '· raw Byte never leaks up', svcF3: '· get*/list* facade',
    mgr: 'PointManager',
    mgrF1: '· select* only in this layer', mgrF2: '· persists via buildDOByBO', mgrF3: '· reads back buildBOByDO',
    vo: 'PointVO', voTag: '«API shape»',
    voF1: '+ pointTypeFlag: PointTypeEnum', voF2: '+ rwFlag: RwTypeEnum',
    voF3: '+ enableFlag: EnableFlagEnum', voF4: '+ baseValue/multiple: BigDecimal',
    bo: 'PointBO', boTag: '«business shape»',
    boF1: '+ same enum fields as VO', boF2: '+ extends BaseBO',
    boF3: '+ implements TenantOwned (tenantId)', boF4: '+ BigDecimal scaling (Double in DO)',
    do_: 'PointDO', doTag: '«table mirror»',
    doF1: '+ @TableName dc3_point', doF2: '+ pointTypeFlag / rwFlag: Byte',
    doF3: '+ pointExt: JsonExt (Jackson)', doF4: '+ @TableId ASSIGN_ID · @TableLogic',
    bld: 'PointBuilder', bldTag: '«MapStruct converter»',
    bldM1: '+ buildVOByBO(BO) → VO', bldM2: '+ buildBOByVO(VO) → BO',
    bldM3: '+ buildBOByDO(DO) → BO', bldM4: '+ buildDOByBO(BO) → DO',
    bldH: '@AfterMapping hooks:',
    bldH1: '· Byte → enum   ofIndex(byte)', bldH2: '· enum → Byte   getIndex()',
    bldH3: '· JSON str → ext   parseObject', bldH4: '· ext → JSON str   toJsonString',
    bldN1: 'same-name same-type auto-mapped', bldN2: 'enum fields @Mapping(ignore=true) first',
    bldN3: 'null-safe: empty enum not written', bldN4: 'missing hook → compile fail / silent loss',
    bldX1: 'PointExt: JsonExt ⇄ PointExt', bldX2: 'BaseExt trio: type·version·remark',
    bldX3: 'new field: Byte on DO + enum,', bldX4: 'add @AfterMapping both directions',
    a1d: 'buildBOByVO()', a1u: 'buildVOByBO()',
    a2d: 'buildDOByBO()', a2u: 'buildBOByDO()',
    a3: 'VO ↔ BO', a4: 'BO ↔ DO',
    a8: 'VO in/out', a7: 'pass BO', a6: 'select*',
    legApi: 'API shape', legBiz: 'Business shape', legDb: 'Table mirror', legSvc: 'Call-chain class',
    legMap: 'MapStruct mapping', legCall: 'Call', legRet: 'Return'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1160 692">
        <defs>
          <marker id="dmc-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dmc-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dmc-grid)" height="100%" width="100%"/>

        <!-- layer regions -->
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="660" x="24" y="64"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="36" y="82">{{ s.apiRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="660" x="24" y="262"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="280">{{ s.bizRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="660" x="24" y="460"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="36" y="478">{{ s.perRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="566" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="424" x="716" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="728" y="82">{{ s.mapRegion }}</text>

        <!-- vertical call chain arrows -->
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="140" x2="140" y1="202"
              y2="304"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="148" y="244">{{ s.a1d }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="200"
              x2="200" y1="304" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="208" y="260">{{ s.a1u }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="140" x2="140" y1="400"
              y2="502"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="148" y="445">{{ s.a2d }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="200"
              x2="200" y1="502" y2="400"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="208" y="460">{{ s.a2u }}</text>

        <!-- horizontal layer arrows -->
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="282" x2="358" y1="155"
              y2="155"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="320" y="147">{{ s.a8 }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="282" x2="358" y1="353"
              y2="353"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="320" y="345">{{ s.a7 }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="282" x2="358" y1="551"
              y2="551"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="320" y="543">{{ s.a6 }}</text>

        <!-- builder conversion arrows -->
        <line marker-end="url(#dmc-ah)" marker-start="url(#dmc-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1.5" x1="602" x2="728" y1="150" y2="150"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="665" y="142">{{ s.a3 }}</text>
        <line marker-end="url(#dmc-ah)" marker-start="url(#dmc-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1.5" x1="602" x2="728" y1="348" y2="348"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="665" y="340">{{ s.a4 }}</text>
        <line marker-end="url(#dmc-ah)" marker-start="url(#dmc-ah)" stroke="var(--dc3-amber-stroke)"
              stroke-width="1.5" x1="602" x2="728" y1="545" y2="545"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="665" y="537">{{ s.a4 }}</text>

        <!-- API layer nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="170" y="134">
          {{ s.ctrl }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="156">{{ s.ctrlF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="172">{{ s.ctrlF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="188">{{ s.ctrlF3 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="360" y="104"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="480" y="126">
          {{ s.vo }}
        </text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="480" y="140">{{ s.voTag }}</text>
        <line stroke="var(--dc3-fe-stroke)" stroke-width="0.6" x1="368" x2="592" y1="146" y2="146"/>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="164">{{ s.voF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="180">{{ s.voF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="196">{{ s.voF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="210">{{ s.voF4 }}</text>

        <!-- business layer nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="308"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="170" y="332">
          {{ s.svc }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="354">{{ s.svcF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="370">{{ s.svcF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="386">{{ s.svcF3 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="110" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="240" x="360" y="302"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="480" y="324">
          {{ s.bo }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="480" y="338">{{ s.boTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="368" x2="592" y1="344" y2="344"/>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="362">{{ s.boF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="378">{{ s.boF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="394">{{ s.boF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="410">{{ s.boF4 }}</text>

        <!-- persistence layer nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="506"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="170" y="530">
          {{ s.mgr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="552">{{ s.mgrF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="568">{{ s.mgrF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="584">{{ s.mgrF3 }}</text>
        <rect fill="var(--dc3-db-fill)" height="110" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="240"
              x="360" y="500"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="480" y="522">
          {{ s.do_ }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="480" y="536">{{ s.doTag }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="0.6" x1="368" x2="592" y1="542" y2="542"/>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="560">{{ s.doF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="576">{{ s.doF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="592">{{ s.doF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="372" y="608">{{ s.doF4 }}</text>

        <!-- PointBuilder -->
        <rect fill="var(--dc3-amber-fill)" height="530" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="392" x="732" y="104"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="928" y="128">
          {{ s.bld }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="928" y="142">{{ s.bldTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="740" x2="1116" y1="150" y2="150"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="170">{{ s.bldM1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="188">{{ s.bldM2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="206">{{ s.bldM3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="224">{{ s.bldM4 }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,3" stroke-width="0.6" x1="740" x2="1116" y1="240"
              y2="240"/>
        <text fill="var(--dc3-be-text)" font-size="8.5" font-weight="600" x="744" y="260">{{ s.bldH }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="748" y="280">{{ s.bldH1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="748" y="298">{{ s.bldH2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="748" y="316">{{ s.bldH3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="748" y="334">{{ s.bldH4 }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,3" stroke-width="0.6" x1="740" x2="1116" y1="352"
              y2="352"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="372">{{ s.bldN1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="390">{{ s.bldN2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="408">{{ s.bldN3 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="744" y="426">{{ s.bldN4 }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,3" stroke-width="0.6" x1="740" x2="1116" y1="444"
              y2="444"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="464">{{ s.bldX1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="482">{{ s.bldX2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="506">{{ s.bldX3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="744" y="524">{{ s.bldX4 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="24" y="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="665">{{ s.legApi }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="130" y="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="152" y="665">{{ s.legBiz }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="240" y="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="262" y="665">{{ s.legDb }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="360" y="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="665">{{ s.legSvc }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="500" x2="528" y1="662"
              y2="662"/>
        <text fill="var(--dc3-text2)" font-size="9" x="534" y="665">{{ s.legCall }}</text>
        <line marker-end="url(#dmc-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="600"
              x2="628" y1="662" y2="662"/>
        <text fill="var(--dc3-text2)" font-size="9" x="634" y="665">{{ s.legRet }}</text>
        <line marker-end="url(#dmc-ah)" marker-start="url(#dmc-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              x1="710" x2="738" y1="662" y2="662"/>
        <text fill="var(--dc3-text2)" font-size="9" x="744" y="665">{{ s.legMap }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
