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
    aria: 'Maven 模块依赖流：部署单元（网关、四个中心、单体与 36 个驱动）编译期只依赖 facade-api 接口，依赖方向单向向下；facade-grpc 与 facade-local 两个实现运行时按 DC3_FACADE_MODE 二选一注入；grpc 实现下沉到 dc3-api-* 的 protobuf 桩；驱动经 rabbitmq 与数据中心交换值和命令；公共库与领域库被所有部署单元复用，契约层不反向依赖任何业务',
    regionDeploy: '部署单元 · 打成进程跑起来（对外只有网关 HTTP :8000）',
    regionFacade: 'facade 三态 · 跨服务契约（业务代码只依赖接口）',
    regionCommon: '公共与契约库 · 不单独运行（依赖只向下，契约不反向依赖业务）',
    gw: 'dc3-gateway', gwS: ':8000 · 唯一对外',
    auth: 'dc3-center-auth', authS: ':8300 / gRPC 9300',
    mgr: 'dc3-center-manager', mgrS: ':8400 / gRPC 9400',
    data: 'dc3-center-data', dataS: ':8500 / gRPC 9500',
    agentic: 'dc3-center-agentic', agenticS: ':8600 · 无 gRPC 端口',
    single: 'dc3-center-single', singleS: '三合一 :8100 · local',
    drivers: 'dc3-driver-*', driversS: '36 个独立进程',
    fapi: 'dc3-common-facade-api · Java 接口',
    fapiS: '控制器 / service 只 @Autowired 它，永不绑定实现',
    fgrpc: 'dc3-common-facade-grpc', fgrpcS: 'gRPC 实现（分布式默认）',
    flocal: 'dc3-common-facade-local-*', flocalS: '进程内直连（单体）',
    apiLib: 'dc3-api-{auth,manager,data,driver}', apiLibS: 'protobuf / gRPC 合约 · 改 proto 即改契约',
    baseLib: 'dc3-common 基础', baseLibS: 'constant · model · exception · public · web · log · thread',
    dalLib: '数据访问', dalLibS: 'dal · postgres · repository · sql',
    mqLib: '通信', mqLibS: 'rabbitmq（dc3.e.value 等）· mqtt',
    domainLib: '领域库 dc3-common-{auth, manager, data, driver, gateway, agentic}',
    domainLibS: '每个中心进程几乎只是对应领域库的运行外壳；center-single 共用同一套，区别仅在 facade 实现与打包',
    railLabel: '编译期依赖 · 单向向下（全部部署单元如此）',
    eImplGrpc: 'impl · grpc 时', eImplLocal: 'impl · local 时',
    eStub: 'gRPC 桩', eMq: '值 / 命令经 MQ',
    eDep1: '复用', eDep2: '复用', eDep3: '复用',
    modeChip: 'DC3_FACADE_MODE 二选一注入',
    legDeploy: '部署单元（进程）', legFacade: 'facade 三态', legCommon: '公共 / 契约库',
    legCompile: '编译期依赖（实线）', legRuntime: '运行时注入（虚线）'
  },
  en: {
    aria: 'Maven module dependency flow: deploy units (gateway, four centers, the single merge and 36 drivers) depend at compile time only on the facade-api interfaces, dependency direction strictly downward; facade-grpc and facade-local are injected at runtime by DC3_FACADE_MODE; the grpc implementation sinks into the dc3-api-* protobuf stubs; drivers exchange values and commands with the data center via rabbitmq; common and domain libraries are shared by all units and the contract layer never depends back on business code',
    regionDeploy: 'Deploy units · packaged as processes (only the gateway exposes :8000)',
    regionFacade: 'facade tri-state · cross-service contract (code depends on interfaces only)',
    regionCommon: 'Common & contract libs · never run alone (deps point down, never back)',
    gw: 'dc3-gateway', gwS: ':8000 · sole external',
    auth: 'dc3-center-auth', authS: ':8300 / gRPC 9300',
    mgr: 'dc3-center-manager', mgrS: ':8400 / gRPC 9400',
    data: 'dc3-center-data', dataS: ':8500 / gRPC 9500',
    agentic: 'dc3-center-agentic', agenticS: ':8600 · no gRPC port',
    single: 'dc3-center-single', singleS: '3-in-1 :8100 · local',
    drivers: 'dc3-driver-*', driversS: '36 separate processes',
    fapi: 'dc3-common-facade-api · Java interfaces',
    fapiS: 'controllers / services @Autowired it only, never an impl',
    fgrpc: 'dc3-common-facade-grpc', fgrpcS: 'gRPC impl (distributed default)',
    flocal: 'dc3-common-facade-local-*', flocalS: 'in-process (monolith)',
    apiLib: 'dc3-api-{auth,manager,data,driver}', apiLibS: 'protobuf / gRPC contract',
    baseLib: 'dc3-common base', baseLibS: 'constant · model · exception · public · web · log · thread',
    dalLib: 'Data access', dalLibS: 'dal · postgres · repository · sql',
    mqLib: 'Messaging', mqLibS: 'rabbitmq (dc3.e.value etc.) · mqtt',
    domainLib: 'Domain libs dc3-common-{auth, manager, data, driver, gateway, agentic}',
    domainLibS: 'each center process is nearly a shell around its domain lib; center-single shares the same set',
    railLabel: 'compile-time dependency · strictly downward (all units)',
    eImplGrpc: 'impl · when grpc', eImplLocal: 'impl · when local',
    eStub: 'gRPC stubs', eMq: 'values / commands via MQ',
    eDep1: 'reuse', eDep2: 'reuse', eDep3: 'reuse',
    modeChip: 'DC3_FACADE_MODE picks one at runtime',
    legDeploy: 'Deploy unit (process)', legFacade: 'facade tri-state', legCommon: 'Common / contract lib',
    legCompile: 'compile-time dep (solid)', legRuntime: 'runtime injection (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)

// deploy unit boxes: [nameKey, subKey, x]
const units = [
  ['gw', 'gwS', 49], ['auth', 'authS', 231], ['mgr', 'mgrS', 413], ['data', 'dataS', 595],
  ['agentic', 'agenticS', 777], ['single', 'singleS', 959], ['drivers', 'driversS', 1141]
] as const
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 600">
        <defs>
          <marker id="mf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#mf-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="110" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1300" x="30" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionDeploy }}</text>
        <rect fill="var(--dc3-region-amber)" height="120" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1000" x="180" y="200"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="194" y="220">{{ s.regionFacade }}</text>
        <rect fill="var(--dc3-region-be)" height="180" rx="12" stroke="var(--dc3-db-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1300" x="30" y="350"/>
        <text fill="var(--dc3-db-text)" font-size="10" font-weight="600" x="44" y="370">{{ s.regionCommon }}</text>

        <!-- dependency rail: drops from all units, one labeled arrow into facade-api -->
        <line v-for="(u, idx) in units" :key="'d' + idx" stroke="var(--dc3-arrow)" stroke-width="1"
              :x1="u[2] + 85" :x2="u[2] + 85" y1="162" y2="182"/>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="134" x2="1226" y1="182" y2="182"/>
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="680" x2="680" y1="182"
              y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1000" y="176">{{ s.railLabel }}</text>

        <!-- facade impl arrows (dashed runtime) -->
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"
              x1="454" x2="486" y1="270" y2="270"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="372" y="316">{{ s.eImplGrpc }}</text>
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"
              x1="886" x2="874" y1="270" y2="270"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="1020" y="316">{{ s.eImplLocal }}</text>

        <!-- grpc -> protobuf stubs -->
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="325" x2="240" y1="304"
              y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="210" y="344">{{ s.eStub }}</text>

        <!-- drivers rail drop -> messaging lib -->
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1155" x2="1155" y1="182"
              y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1163" y="330">{{ s.eMq }}</text>

        <!-- domain libs reuse arrows -->
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="520" x2="520" y1="468"
              y2="444"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="528" y="460">{{ s.eDep1 }}</text>
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="835" x2="835" y1="468"
              y2="444"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="843" y="460">{{ s.eDep2 }}</text>
        <line marker-end="url(#mf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1155" x2="1155" y1="468"
              y2="444"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="1163" y="460">{{ s.eDep3 }}</text>

        <!-- deploy units -->
        <g v-for="(u, idx) in units" :key="'u' + idx">
          <rect :fill="idx === 6 ? 'var(--dc3-bus-fill)' : 'var(--dc3-be-fill)'" height="70" rx="6"
                :stroke="idx === 6 ? 'var(--dc3-bus-stroke)' : 'var(--dc3-be-stroke)'" stroke-width="1"
                width="170" :x="u[2]" y="90"/>
          <text :x="u[2] + 85" fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle"
                y="118">{{ s[u[0]] }}
          </text>
          <text :x="u[2] + 85" fill="var(--dc3-text2)" font-size="7" text-anchor="middle" y="138">
            {{ s[u[1]] }}
          </text>
        </g>

        <!-- facade boxes -->
        <rect fill="var(--dc3-amber-fill)" height="70" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="380" x="490" y="230"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="700" text-anchor="middle" x="680" y="256">{{
            s.fapi
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="680" y="276">{{ s.fapiS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="60" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="250" x="200" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="325" y="264">{{
            s.fgrpc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="325" y="282">{{ s.fgrpcS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="60" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="240" x="890" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1010" y="264">{{
            s.flocal
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1010" y="282">{{ s.flocalS }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" font-weight="600" text-anchor="middle" x="680" y="316">{{
            s.modeChip
          }}
        </text>

        <!-- common libs -->
        <rect fill="var(--dc3-db-fill)" height="60" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="300" x="50" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" text-anchor="middle" x="200" y="404">{{
            s.apiLib
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="200" y="422">{{ s.apiLibS }}</text>
        <rect fill="var(--dc3-db-fill)" height="60" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="300" x="370" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="520" y="404">{{
            s.baseLib
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7" text-anchor="middle" x="520" y="422">{{ s.baseLibS }}</text>
        <rect fill="var(--dc3-db-fill)" height="60" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="290" x="690" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="835" y="404">{{
            s.dalLib
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="835" y="422">{{ s.dalLibS }}</text>
        <rect fill="var(--dc3-db-fill)" height="60" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="310" x="1000" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1155" y="404">{{
            s.mqLib
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="1155" y="422">{{ s.mqLibS }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="1260" x="50" y="470"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="680" y="492">{{
            s.domainLib
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="680" y="510">{{ s.domainLibS }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="40" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="569">{{ s.legDeploy }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="190" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="569">{{ s.drivers }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="310" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="569">{{ s.legFacade }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="440" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="569">{{ s.legCommon }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="600" x2="630" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="636" y="569">{{ s.legCompile }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="800" x2="830" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="836" y="569">{{ s.legRuntime }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
