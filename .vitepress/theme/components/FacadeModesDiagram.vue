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
    aria: 'Facade 模式图：业务代码只依赖协议中立的 *Facade 接口（facade-api 契约），由 dc3.facade.mode 开关经 @ConditionalOnProperty 择一装配——grpc 模式注入 DeviceGrpcFacade 跨进程 gRPC 调用独立管理中心，local 模式注入 DeviceLocalFacade 在 dc3-center-single 单进程内直调目标 Service；切换的是部署拓扑而非传输协议',
    biz: '业务代码 (数据中心 / 智能中心 …)',
    bizS1: '只依赖协议中立的 *Facade 接口 · 不 import gRPC stub / protobuf',
    bizS2: '切换模式不改一行业务代码 —— 只换被注入的那个 Bean',
    api: 'dc3-common-facade-api · 16 个 *Facade 契约',
    apiS1: 'DeviceFacade · PointValueFacade · TenantFacade · PermissionFacade …',
    apiS2: '两套实现接同一接口 · 返回同样的 BO / Page 类型',
    sw1: 'dc3.facade.mode = grpc | local',
    sw2: '@ConditionalOnProperty 择一装配 · 缺省 grpc (matchIfMissing = true)',
    grpcRegion: 'grpc 模式 (默认) · 分布式部署',
    localRegion: 'local 模式 · 单体部署',
    grpcImpl: 'DeviceGrpcFacade', grpcImplTag: '«dc3-common-facade-grpc»',
    grpcImplS: '跨进程 gRPC 调用',
    grpcSrv: '管理中心 dc3-center-manager',
    grpcSrvS1: '独立 Spring Boot 进程',
    grpcSrvS2: 'DeviceService · HTTP 8400 / gRPC 9400',
    grpcSrvS3: '可独立扩缩容 / 重启',
    grpcMore1: '其余 15 个 *Facade 同构装配:',
    grpcMore2: 'PointValueGrpcFacade → data :9500 · TenantGrpcFacade → auth :9300 · PermissionGrpcFacade → …',
    localImpl: 'DeviceLocalFacade', localImplTag: '«dc3-common-facade-local-*»',
    localImplS: '进程内方法调用 · 无网络开销',
    localSrv: 'dc3-center-single',
    localSrvS1: '四中心合一进程',
    localSrvS2: 'DeviceService 同 JVM · HTTP 8100 / gRPC 9100',
    localSrvS3: '启动快 · 断点直达',
    localMore1: '其余 15 个 *Facade 同构装配:',
    localMore2: 'PointValueLocalFacade → 同进程 PointValueService · TenantLocalFacade → 同进程 … · 全部零网络往返',
    a0: '依赖注入 *Facade',
    a1: 'mode=grpc', a2: 'mode=local',
    a3: 'gRPC :9400', a4: '同 JVM 直调',
    grpcNote1: '适用: 分布式部署 · 按中心独立扩缩容 · 生产环境',
    grpcNote2: '故障域隔离: 一个中心崩溃不拖垮其它 · DC3_FACADE_MODE=grpc',
    localNote1: '适用: 本地开发 · 小型单机 · 调试',
    localNote2: '典型搭配: dc3-center-single 单体 · DC3_FACADE_MODE=local',
    warnTitle: '判别实际模式以注入的环境变量为准',
    warn1: '鉴权中心 base application.yml 写着 local (本地覆盖项), 但分布式编排注入 DC3_FACADE_MODE=grpc 会覆盖它——不要只看某个 yml 的字面值; local 要求目标 Service 在同一进程内',
    legBiz: '业务代码 / 单体', legSvc: 'facade 实现 / 中心', legSw: '模式开关',
    legCall: '调用', legWire: '按 mode 装配的分支'
  },
  en: {
    aria: 'Facade-mode diagram: business code depends only on protocol-neutral *Facade interfaces (the facade-api contracts); the dc3.facade.mode switch picks one implementation via @ConditionalOnProperty — grpc injects DeviceGrpcFacade making cross-process gRPC calls to the standalone manager center, while local injects DeviceLocalFacade calling the target service in-process inside dc3-center-single; the switch changes deployment topology, not transport protocol',
    biz: 'Business code (Data Center / Agentic …)',
    bizS1: 'depends only on protocol-neutral *Facade interfaces · no gRPC stub / protobuf imports',
    bizS2: 'switching modes changes no business code — only the injected bean',
    api: 'dc3-common-facade-api · 16 *Facade contracts',
    apiS1: 'DeviceFacade · PointValueFacade · TenantFacade · PermissionFacade …',
    apiS2: 'both implementations share one interface · same BO / Page types',
    sw1: 'dc3.facade.mode = grpc | local',
    sw2: '@ConditionalOnProperty picks one · default grpc (matchIfMissing = true)',
    grpcRegion: 'grpc mode (default) · distributed',
    localRegion: 'local mode · monolith',
    grpcImpl: 'DeviceGrpcFacade', grpcImplTag: '«dc3-common-facade-grpc»',
    grpcImplS: 'cross-process gRPC call',
    grpcSrv: 'Manager Center dc3-center-manager',
    grpcSrvS1: 'standalone Spring Boot process',
    grpcSrvS2: 'DeviceService · HTTP 8400 / gRPC 9400',
    grpcSrvS3: 'independently scalable / restartable',
    grpcMore1: 'the other 15 *Facades wire the same way:',
    grpcMore2: 'PointValueGrpcFacade → data :9500 · TenantGrpcFacade → auth :9300 · PermissionGrpcFacade → …',
    localImpl: 'DeviceLocalFacade', localImplTag: '«dc3-common-facade-local-*»',
    localImplS: 'in-process method call · zero network',
    localSrv: 'dc3-center-single',
    localSrvS1: 'four centers in one process',
    localSrvS2: 'DeviceService same JVM · HTTP 8100 / gRPC 9100',
    localSrvS3: 'fast startup · direct breakpoints',
    localMore1: 'the other 15 *Facades wire the same way:',
    localMore2: 'PointValueLocalFacade → in-process PointValueService · TenantLocalFacade → in-process … · zero network hops',
    a0: '@Autowired *Facade',
    a1: 'mode=grpc', a2: 'mode=local',
    a3: 'gRPC :9400', a4: 'same JVM',
    grpcNote1: 'For: distributed deployment · per-center scaling · production',
    grpcNote2: 'isolated failure domains · DC3_FACADE_MODE=grpc',
    localNote1: 'For: local development · small single machine · debugging',
    localNote2: 'typical pair: dc3-center-single · DC3_FACADE_MODE=local',
    warnTitle: 'Judge the effective mode by the injected environment variable',
    warn1: 'the auth center base application.yml says local (a local override), but distributed compose injects DC3_FACADE_MODE=grpc which wins — never trust a single yml literal; local requires the target Service in the same process',
    legBiz: 'Business / single', legSvc: 'Facade impl / center', legSw: 'Mode switch',
    legCall: 'Call', legWire: 'branch wired by mode'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 868">
        <defs>
          <marker id="fmd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="fmd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#fmd-grid)" height="100%" width="100%"/>

        <!-- mode regions -->
        <rect fill="var(--dc3-region-be)" height="290" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="640" x="24" y="400"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="418">{{ s.grpcRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="290" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="640" x="700" y="400"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="712" y="418">{{ s.localRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="680" x2="680" y1="170"
              y2="208"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="692" y="194">{{ s.a0 }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1.5" x1="420" x2="420" y1="290"
              y2="438"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="end" x="412" y="330">{{ s.a1 }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1.5" x1="940" x2="940" y1="290"
              y2="438"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="948" y="330">{{ s.a2 }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="322" x2="398" y1="485"
              y2="485"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="360" y="477">{{ s.a3 }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="998" x2="1074" y1="485"
              y2="485"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1036" y="477">{{ s.a4 }}</text>

        <!-- business code -->
        <rect fill="var(--dc3-fe-fill)" height="80" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="800"
              x="280" y="90"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="680" y="114">
          {{ s.biz }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="680" y="136">{{ s.bizS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="680" y="156">{{ s.bizS2 }}</text>

        <!-- facade api contracts -->
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="800"
              x="280" y="210"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="680" y="234">
          {{ s.api }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="680" y="256">{{ s.apiS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="680" y="276">{{ s.apiS2 }}</text>

        <!-- mode switch bar -->
        <rect fill="var(--dc3-amber-fill)" height="44" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="400" x="480" y="322"/>
        <text class="d-name" fill="var(--dc3-amber-stroke)" font-size="9.5" text-anchor="middle" x="680" y="340">
          {{ s.sw1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="680" y="356">{{ s.sw2 }}</text>

        <!-- grpc mode nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="260"
              x="60" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="190" y="464">
          {{ s.grpcImpl }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="190" y="482">{{ s.grpcImplTag }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="190" y="504">{{ s.grpcImplS }}</text>
        <rect fill="var(--dc3-be-fill)" height="130" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="400" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="520" y="464">
          {{ s.grpcSrv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="486">{{ s.grpcSrvS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="506">{{ s.grpcSrvS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="520" y="526">{{ s.grpcSrvS3 }}</text>

        <!-- local mode nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="260"
              x="736" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="866" y="464">
          {{ s.localImpl }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="866" y="482">{{ s.localImplTag }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="866" y="504">{{ s.localImplS }}</text>
        <rect fill="var(--dc3-fe-fill)" height="130" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="1076" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1196" y="464">
          {{ s.localSrv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1196" y="486">{{ s.localSrvS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1196" y="506">{{ s.localSrvS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1196" y="526">{{ s.localSrvS3 }}</text>

        <!-- same-wiring info rows -->
        <rect fill="var(--dc3-region-be)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="580" x="60" y="600"/>
        <text fill="var(--dc3-be-text)" font-size="8.5" font-weight="600" x="76" y="622">{{ s.grpcMore1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="76" y="642">{{ s.grpcMore2 }}</text>
        <rect fill="var(--dc3-region-be)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="580" x="736" y="600"/>
        <text fill="var(--dc3-fe-text)" font-size="8.5" font-weight="600" x="752" y="622">{{ s.localMore1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="752" y="642">{{ s.localMore2 }}</text>

        <!-- compare notes -->
        <rect fill="var(--dc3-region-be)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="640" x="24" y="710"/>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="40" y="732">{{ s.grpcNote1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="40" y="752">{{ s.grpcNote2 }}</text>
        <rect fill="var(--dc3-region-amber)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="640" x="700" y="710"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="716" y="732">{{ s.localNote1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="716" y="752">{{ s.localNote2 }}</text>

        <!-- env-override warning -->
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1316" x="24" y="778"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="40" y="796">{{ s.warnTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="40" y="814">{{ s.warn1 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="24" y="840"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="849">{{ s.legBiz }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="170" y="840"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="849">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="340" y="840"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="849">{{ s.legSw }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="470" x2="498" y1="846"
              y2="846"/>
        <text fill="var(--dc3-text2)" font-size="9" x="504" y="849">{{ s.legCall }}</text>
        <line marker-end="url(#fmd-ah)" stroke="var(--dc3-amber-stroke)" stroke-width="1.5" x1="560" x2="588" y1="846"
              y2="846"/>
        <text fill="var(--dc3-text2)" font-size="9" x="594" y="849">{{ s.legWire }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
