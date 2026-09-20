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
    aria: 'Driver SDK 的 SPI 类图：DriverCustomService 是不声明任何新方法的聚合接口，泛化连接七个能力接口——生命周期、元数据监听、驱动健康、设备健康、协议读写、自定义命令与校验；SDK 运行时服务注入聚合接口调用全部钩子；36 个具体驱动实现全部或子集，virtual 是开发模板，listening-virtual 反向监听接入',
    regionSdk: 'dc3-common-driver · Driver SDK 的 SPI（一个聚合接口，七项契约）',
    regionImpl: '具体驱动 dc3-driver-* · 实现全部或子集',
    agg: 'DriverCustomService',
    aggStereo: '«聚合接口 · 自身不声明方法»',
    aggSub: 'extends 7 个能力接口',
    i1: 'DriverLifecycle', i1a: 'initial() 启动初始化', i1b: '调度注册 / 生命周期',
    i2: 'DriverMetadataListener', i2a: 'event(...) 元数据变更', i2b: 'ADD / DELETE / UPDATE 刷新缓存',
    i3: 'DriverHealth', i3a: '驱动级健康上报', i3b: 'ONLINE / OFFLINE / FAULT / MAINTAIN',
    i4: 'DeviceHealth', i4a: '单设备健康上报', i4b: 'TTL 必须 > 采集周期',
    i5: 'DriverProtocol', i5a: 'read() → ReadPointValue', i5b: 'write() → Boolean（失败不回显）',
    i6: 'DriverCommand', i6a: '自定义命令处理', i6b: '命令属性渲染报文',
    i7: 'DriverValidator', i7a: 'validate(...) 校验', i7b: 'simulate() 确定性合成值',
    runtime: 'SDK 运行时服务（驱动作者一般无需触碰）',
    rt1: 'DriverRegisterService 注册 · 指数退避重试 · DriverScheduleService Quartz 调度',
    rt2: 'DriverSenderService 发送：pointValueSender / deviceStatusSender',
    virtual: 'dc3-driver-virtual · 驱动开发模板',
    vSub: '复制改名即新驱动 · 演示注册/调度/读写/健康全流程',
    listening: 'dc3-driver-listening-virtual · 反向监听接入',
    lSub: '不主动轮询 · 监听 TCP 6270 / UDP 6271 等外部推数',
    edgeExtends: 'extends',
    edgeUses: '«uses» 注入并调用全部钩子', edgeUsesShort: '«uses»',
    edgeImpl: '«implements» 全部或子集',
    legAgg: '聚合接口', legIface: '能力接口', legRuntime: 'SDK 运行时', legCore: '核心读写契约',
    legDriver: '具体驱动', legExt: 'extends（实线三角）', legImpl: 'implements（虚线）'
  },
  en: {
    aria: 'Driver SDK SPI class diagram: DriverCustomService is an aggregate interface declaring no new methods, generalizing seven capability interfaces — lifecycle, metadata listener, driver health, device health, protocol read/write, custom command and validation; the SDK runtime injects the aggregate to invoke all hooks; the 36 concrete drivers implement all or a subset, virtual being the authoring template and listening-virtual the reverse listener',
    regionSdk: 'dc3-common-driver · Driver SDK SPI (one aggregate, seven contracts)',
    regionImpl: 'Concrete drivers dc3-driver-* · implement all or a subset',
    agg: 'DriverCustomService',
    aggStereo: '«aggregate · declares no methods»',
    aggSub: 'extends 7 capability interfaces',
    i1: 'DriverLifecycle', i1a: 'initial() startup', i1b: 'schedule registration / lifecycle',
    i2: 'DriverMetadataListener', i2a: 'event(...) metadata change', i2b: 'ADD / DELETE / UPDATE refresh',
    i3: 'DriverHealth', i3a: 'driver-level health', i3b: 'ONLINE / OFFLINE / FAULT / MAINTAIN',
    i4: 'DeviceHealth', i4a: 'per-device health', i4b: 'TTL must exceed poll cycle',
    i5: 'DriverProtocol', i5a: 'read() → ReadPointValue', i5b: 'write() → Boolean (no echo on fail)',
    i6: 'DriverCommand', i6a: 'custom command', i6b: 'render payload from attributes',
    i7: 'DriverValidator', i7a: 'validate(...)', i7b: 'simulate() deterministic synthetic value',
    runtime: 'SDK runtime services (authors rarely touch)',
    rt1: 'DriverRegisterService register · exponential backoff · DriverScheduleService Quartz',
    rt2: 'DriverSenderService sends: pointValueSender / deviceStatusSender',
    virtual: 'dc3-driver-virtual · authoring template',
    vSub: 'copy & rename for a new driver · demonstrates the full flow',
    listening: 'dc3-driver-listening-virtual · reverse listener',
    lSub: 'no polling · listens TCP 6270 / UDP 6271 for pushed data',
    edgeExtends: 'extends',
    edgeUses: '«uses» injects & invokes all hooks', edgeUsesShort: '«uses»',
    edgeImpl: '«implements» all or subset',
    legAgg: 'Aggregate interface', legIface: 'Capability interface', legRuntime: 'SDK runtime', legCore: 'core read/write',
    legDriver: 'Concrete driver', legExt: 'extends (solid triangle)', legImpl: 'implements (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)

// interface boxes: [dictKey, x]; width 170, y 260, height 104
const ifaces = [
  ['i1', 40], ['i2', 225], ['i3', 410], ['i4', 595],
  ['i5', 780], ['i6', 965], ['i7', 1150]
] as const
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 600">
        <defs>
          <marker id="mc-tri" markerHeight="12" markerWidth="14" orient="auto" refX="12" refY="5">
            <path d="M 1 1 L 12 5 L 1 9 Z" fill="var(--dc3-fe-fill)" stroke="var(--dc3-arrow)" stroke-width="1"/>
          </marker>
          <marker id="mc-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mc-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#mc-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="330" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1300" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionSdk }}</text>
        <rect fill="var(--dc3-region-amber)" height="110" rx="12" stroke="var(--dc3-ext-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1300" x="30" y="420"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="44" y="440">{{ s.regionImpl }}</text>

        <!-- generalization fan (before nodes) -->
        <line v-for="(it, idx) in ifaces" :key="'g' + idx" marker-end="url(#mc-tri)"
              stroke="var(--dc3-arrow)" stroke-width="1" x1="680" :x2="it[1] + 85" y1="186" y2="254"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" font-style="italic" x="692" y="222">{{ s.edgeExtends }}</text>

        <!-- runtime -> aggregate -->
        <line marker-end="url(#mc-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"
              x1="876" x2="846" y1="140" y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="855" y="128">{{
            s.edgeUsesShort
          }}
        </text>

        <!-- implements arrows -->
        <line marker-end="url(#mc-tri)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"
              x1="360" x2="360" y1="451" y2="367"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="368" y="412">{{ s.edgeImpl }}</text>
        <line marker-end="url(#mc-tri)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"
              x1="1010" x2="1010" y1="451" y2="367"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="1018" y="412">{{ s.edgeImpl }}</text>

        <!-- aggregate -->
        <rect fill="var(--dc3-amber-fill)" height="86" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="2"
              width="320" x="520" y="100"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-style="italic" text-anchor="middle" x="680" y="122">
          {{ s.aggStereo }}
        </text>
        <text fill="var(--dc3-box-name)" font-size="14" font-weight="700" text-anchor="middle" x="680" y="148">{{
            s.agg
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="680" y="170">{{ s.aggSub }}</text>

        <!-- SDK runtime -->
        <rect fill="var(--dc3-be-fill)" height="100" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="430" x="880" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1095" y="114">{{
            s.runtime
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1095" y="136">{{ s.rt1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1095" y="154">{{ s.rt2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1095" y="176">dc3-common-driver</text>

        <!-- seven capability interfaces -->
        <g v-for="(it, idx) in ifaces" :key="'i' + idx">
          <rect :fill="idx === 4 ? 'var(--dc3-bus-fill)' : 'var(--dc3-fe-fill)'" :stroke="idx === 4 ? 'var(--dc3-bus-stroke)' : 'var(--dc3-fe-stroke)'"
                :stroke-width="idx === 4 ? 1.5 : 1" height="104" rx="6" width="170" :x="it[1]" y="260"/>
          <rect :fill="idx === 4 ? 'var(--dc3-bus-fill)' : 'var(--dc3-fe-fill)'" :stroke="idx === 4 ? 'var(--dc3-bus-stroke)' : 'var(--dc3-fe-stroke)'"
                height="24" rx="6" width="170" :x="it[1]" y="260"/>
          <text :x="it[1] + 85" :fill="idx === 4 ? 'var(--dc3-bus-text)' : 'var(--dc3-fe-text)'" font-size="9"
                font-weight="700" text-anchor="middle" y="276">{{ s[it[0]] }}
          </text>
          <text :x="it[1] + 85" fill="var(--dc3-box-name)" font-size="7.5" text-anchor="middle" y="306">
            {{ s[it[0] + 'a'] }}
          </text>
          <text :x="it[1] + 85" fill="var(--dc3-text2)" font-size="7" text-anchor="middle" y="326">
            {{ s[it[0] + 'b'] }}
          </text>
        </g>

        <!-- concrete drivers -->
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="600" x="60" y="455"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="360" y="479">{{
            s.virtual
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="360" y="497">{{ s.vSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="620" x="700" y="455"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1010" y="479">{{
            s.listening
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1010" y="497">{{ s.lSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="40" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="569">{{ s.legAgg }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="150" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="172" y="569">{{ s.legIface }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="290" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="569">{{ s.legRuntime }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="410" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="569">{{ s.legCore }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="550" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="572" y="569">{{ s.legDriver }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="680" x2="710" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="716" y="569">{{ s.legExt }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="880" x2="910" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="916" y="569">{{ s.legImpl }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
