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
    aria: '开发规范总览：左半边是本服务内 Controller(VO)→Service(BO)→Manager(DO) 的分层直落与 MapStruct 转换，跨过标注"必须经 facade"的虚线边界后，任何跨服务读写都先抽象为 facade 契约、再按 DC3_FACADE_MODE 选择 grpc 或 local 传输；下方是从 quickstart 到驱动开发、API 文档、测试，再经验证、提交到 CI 门禁的开发路径',
    regionIn: '本服务内 · 每层只认一种数据表示',
    regionCross: '跨服务 · 先契约（facade）再选传输',
    regionPath: '开发路径 · 从跑通到提交',
    cliName: '客户端',
    cliSub: '请求 / 响应 VO',
    ctrlName: 'Controller',
    ctrlSub: '只认 VO',
    svcName: 'Service',
    svcSub: '只认 BO',
    mgrName: 'Manager / Mapper',
    mgrSub: '只认 DO · select*',
    pgName: 'PostgreSQL',
    pgSub: 'JDBC · dc3_* schema',
    facName: '*Facade 接口',
    facSub: '契约 · facade-api',
    grpcName: 'facade-grpc',
    grpcSub: '分布式',
    localName: 'facade-local-*',
    localSub: '单体',
    otherName: '其他中心',
    otherSub: 'Auth / Manager…',
    modeL1: 'DC3_FACADE_MODE',
    modeL2: 'grpc=分布式 · local=单体',
    startName: '本地已跑通',
    startSub: 'quickstart · 起栈',
    drvName: '驱动开发',
    drvSub: '复制 virtual 模板',
    apiName: 'API 文档',
    apiSub: 'OpenAPI · 鉴权头',
    testName: '测试',
    testSub: 'unit · it · e2e',
    verName: '验证',
    verSub: 'mvn compile',
    verSub2: 'make test(-it)',
    cmtName: '提交',
    cmtSub: 'Conventional Commits',
    cmtSub2: 'type(scope): subject',
    ciName: 'CI 门禁',
    ciSub: '不合规格式拦截',
    ciSub2: 'CHANGE.md 生成',
    lblVo: 'VO',
    lblMapStruct: 'MapStruct',
    lblBuilder: '*Builder',
    lblDo: 'DO·Builder',
    lblMybatis: 'MyBatis',
    lblMust1: '必须经',
    lblMust2: 'facade',
    lblGrpc: 'grpc',
    lblLocal: 'local',
    lblGrpcWire: 'gRPC',
    lblInproc: '进程内',
    lblNewProto: '新协议',
    lblApiTune: '调接口',
    lblRunTest: '跑测试',
    lblCompile: '编译',
    lblJoint: '联调',
    lblRegress: '回归',
    lblSelf: '自查格式',
    lblPush: '推送',
    noteAgents: '权威规范以仓库根 AGENTS.md 为准 · 本页与它冲突时以 AGENTS.md 为准',
    legClient: '客户端',
    legFe: '前端 / API 层',
    legBe: '后端服务',
    legData: '数据层',
    legAmber: '契约 / 流程',
    legBoundary: '跨服务边界（必须经 facade）'
  },
  en: {
    aria: 'Development overview: the left half shows the in-service layering Controller(VO) → Service(BO) → Manager(DO) with MapStruct conversion; across the dashed "must go via facade" boundary, any cross-service read/write is first abstracted as a facade contract, then routed over grpc or local per DC3_FACADE_MODE; the bottom band shows the path from quickstart through driver authoring, API docs and testing, then verify, commit and CI gate',
    regionIn: 'In-service · each layer knows one representation',
    regionCross: 'Cross-service · contract (facade) first, transport second',
    regionPath: 'Dev path · from running to committing',
    cliName: 'Client',
    cliSub: 'request / response VO',
    ctrlName: 'Controller',
    ctrlSub: 'VO only',
    svcName: 'Service',
    svcSub: 'BO only',
    mgrName: 'Manager / Mapper',
    mgrSub: 'DO only · select*',
    pgName: 'PostgreSQL',
    pgSub: 'JDBC · dc3_* schema',
    facName: '*Facade interface',
    facSub: 'contract · facade-api',
    grpcName: 'facade-grpc',
    grpcSub: 'distributed',
    localName: 'facade-local-*',
    localSub: 'monolith',
    otherName: 'Other centers',
    otherSub: 'Auth / Manager…',
    modeL1: 'DC3_FACADE_MODE',
    modeL2: 'grpc=distributed · local=monolith',
    startName: 'Stack running locally',
    startSub: 'quickstart · boot',
    drvName: 'Driver authoring',
    drvSub: 'copy virtual template',
    apiName: 'API docs',
    apiSub: 'OpenAPI · auth headers',
    testName: 'Testing',
    testSub: 'unit · it · e2e',
    verName: 'Verify',
    verSub: 'mvn compile',
    verSub2: 'make test(-it)',
    cmtName: 'Commit',
    cmtSub: 'Conventional Commits',
    cmtSub2: 'type(scope): subject',
    ciName: 'CI gate',
    ciSub: 'rejects bad subjects',
    ciSub2: 'CHANGE.md generated',
    lblVo: 'VO',
    lblMapStruct: 'MapStruct',
    lblBuilder: '*Builder',
    lblDo: 'DO·Builder',
    lblMybatis: 'MyBatis',
    lblMust1: 'must go via',
    lblMust2: 'facade',
    lblGrpc: 'grpc',
    lblLocal: 'local',
    lblGrpcWire: 'gRPC',
    lblInproc: 'in-process',
    lblNewProto: 'new protocol',
    lblApiTune: 'wire APIs',
    lblRunTest: 'run tests',
    lblCompile: 'compile',
    lblJoint: 'integrate',
    lblRegress: 'regress',
    lblSelf: 'self-check subject',
    lblPush: 'push',
    noteAgents: 'The authoritative spec is AGENTS.md at the repo root · on conflict, AGENTS.md wins',
    legClient: 'Client',
    legFe: 'Frontend / API layer',
    legBe: 'Backend service',
    legData: 'Data layer',
    legAmber: 'Contract / process',
    legBoundary: 'Cross-service boundary (must go via facade)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 600">
        <defs>
          <marker id="di2-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="di2-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="di2-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#di2-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="232" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="656" x="40" y="36"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="56">{{ s.regionIn }}</text>
        <rect fill="var(--dc3-region-amber)" height="232" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="552" x="768" y="36"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="780" y="56">{{ s.regionCross }}</text>
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1280" x="40" y="300"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="320">{{ s.regionPath }}</text>

        <!-- arrows: in-service descent -->
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="206" x2="276" y1="118" y2="118"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="241" y="110">{{ s.lblVo }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="442" x2="512" y1="118" y2="118"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="477" y="108">{{ s.lblMapStruct }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="477" y="132">{{ s.lblBuilder }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="596" x2="596" y1="154" y2="192"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="606" y="176">{{ s.lblDo }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="514" x2="444" y1="228" y2="228"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="479" y="220">{{ s.lblMybatis }}</text>

        <!-- the boundary itself: cross-service must go via facade -->
        <line marker-end="url(#di2-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"
              x1="678" x2="784" y1="118" y2="118"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" text-anchor="middle" x="731" y="106">{{
            s.lblMust1
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" text-anchor="middle" x="731" y="134">{{
            s.lblMust2
          }}
        </text>

        <!-- arrows: transport selection -->
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="950" x2="996" y1="104" y2="88"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="968" y="80">{{ s.lblGrpc }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="950" x2="996" y1="132" y2="148"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="968" y="164">{{ s.lblLocal }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1142" x2="1186" y1="88" y2="104"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1152" y="78">{{ s.lblGrpcWire }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1142" x2="1186" y1="148"
              y2="132"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1152" y="166">{{ s.lblInproc }}</text>

        <!-- arrows: dev path -->
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="252" x2="336" y1="378" y2="352"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="282" y="352">{{ s.lblNewProto }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="252" x2="336" y1="392" y2="414"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="284" y="422">{{ s.lblApiTune }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="252" x2="336" y1="406" y2="478"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="268" y="452">{{ s.lblRunTest }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="532" x2="596" y1="352" y2="398"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="550" y="342">{{ s.lblCompile }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="532" x2="596" y1="416" y2="416"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="564" y="408">{{ s.lblJoint }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="532" x2="596" y1="478" y2="442"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="552" y="494">{{ s.lblRegress }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="772" x2="826" y1="418" y2="418"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="799" y="410">{{ s.lblSelf }}</text>
        <line marker-end="url(#di2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1022" x2="1066" y1="418"
              y2="418"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1044" y="410">{{ s.lblPush }}</text>

        <!-- nodes: in-service layering -->
        <rect fill="var(--dc3-ext-fill)" height="68" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="140"
              x="64" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="134" y="112">{{
            s.cliName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="134" y="130">{{ s.cliSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="68" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="160"
              x="280" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="360" y="112">{{
            s.ctrlName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="360" y="130">{{ s.ctrlSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="68" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="516" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="596" y="112">{{
            s.svcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="596" y="130">{{ s.svcSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="160"
              x="516" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="596" y="220">{{
            s.mgrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="596" y="238">{{ s.mgrSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="160"
              x="280" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="360" y="220">{{
            s.pgName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="360" y="238">{{ s.pgSub }}</text>

        <!-- nodes: facade contract + transports -->
        <rect fill="var(--dc3-amber-fill)" height="68" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="160" x="788" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="700" text-anchor="middle" x="868" y="112">{{
            s.facName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="868" y="130">{{ s.facSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="1000" y="64"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1070" y="82">{{
            s.grpcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1070" y="98">{{ s.grpcSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="1000" y="124"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1070" y="142">{{
            s.localName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1070" y="158">{{ s.localSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="118"
              x="1190" y="92"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1249" y="110">{{
            s.otherName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1249" y="126">{{ s.otherSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1070" y="196">{{ s.modeL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1070" y="210">{{ s.modeL2 }}</text>

        <!-- nodes: dev path -->
        <rect fill="var(--dc3-amber-fill)" height="72" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="70" y="356"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="160" y="384">{{
            s.startName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="160" y="402">{{ s.startSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="340" y="324"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="435" y="346">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="435" y="364">{{ s.drvSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="340" y="392"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="435" y="414">{{
            s.apiName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="435" y="432">{{ s.apiSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="340" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="435" y="482">{{
            s.testName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="435" y="500">{{ s.testSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="600" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="685" y="406">{{
            s.verName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="685" y="424">{{ s.verSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="685" y="440">{{ s.verSub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="830" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="925" y="406">{{
            s.cmtName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="925" y="424">{{ s.cmtSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="925" y="440">{{ s.cmtSub2 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="1070" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1170" y="406">{{
            s.ciName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1170" y="424">{{ s.ciSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1170" y="440">{{ s.ciSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="70" y="536">{{ s.noteAgents }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="70" y="566"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="575">{{ s.legClient }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="180" y="566"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="575">{{ s.legFe }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="320" y="566"/>
        <text fill="var(--dc3-text2)" font-size="9" x="342" y="575">{{ s.legBe }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="440" y="566"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="575">{{ s.legData }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="550" y="566"/>
        <text fill="var(--dc3-text2)" font-size="9" x="572" y="575">{{ s.legAmber }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="680" x2="700" y1="572"
              y2="572"/>
        <text fill="var(--dc3-text2)" font-size="9" x="706" y="575">{{ s.legBoundary }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
