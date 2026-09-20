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
    aria: '驱动开发四步流程：拷贝 dc3-driver-virtual 模板并重命名、接入父 POM 与协议依赖、配置 application.yml 的 dc3.driver 元数据/调度/属性、实现聚合 7 个 SPI 的 DriverCustomService；随后 mvn 打包、java -jar 运行，由 DriverInitRunner 以指数退避重试经 gRPC 向管理中心注册，成功后驱动可被调度',
    step1: '步骤 1 · 拷贝模板并重命名', step2: '步骤 2 · 接入父 POM',
    step3: '步骤 3 · 配置 application.yml', step4: '步骤 4 · 实现协议逻辑',
    tplName: 'dc3-driver-virtual', tplSub: '模板 · 7 个 SPI 可运行示例',
    cpLabel: 'cp -r + 重命名', cpSub: '包/启动类/实现类改名',
    newName: 'dc3-driver-knx', newSub1: 'KnxDriverApplication', newSub2: 'KnxDriverCustomServiceImpl',
    parentPom: 'dc3-driver/pom.xml', parentSub: 'modules 登记新模块',
    inheritLabel: '继承父模块', modulePom: 'dc3-driver-knx/pom.xml',
    moduleSub1: '协议依赖只放本模块', moduleSub2: '如 calimero-core (KNX)',
    sdkNote1: '父模块已引入 SDK 与插件', sdkNote2: 'dc3-common-driver · boot-maven',
    cfgMeta: 'dc3.driver 元数据', cfgMetaSub: 'tenant · name · code · type',
    cfgSched: 'schedule 调度', cfgSchedSub: 'read 0/30s · custom 0/5s · health 0/15s',
    cfgDrvAttr: 'driver-attribute', cfgDrvAttrSub: 'host · port (设备级)',
    cfgPtAttr: 'point-attribute', cfgPtAttrSub: 'groupAddress (位号级)',
    svcName: 'DriverCustomService', svcSub: '实现一个接口 = 接管 7 件事',
    spiTitle: '7 个 SPI 子接口',
    spi1: 'DriverLifecycle · initial / schedule', spi2: 'DriverProtocol · read / write',
    spi3: 'DriverCommand · execute', spi4: 'DriverMetadataListener · event',
    spi5: 'DriverHealth · 驱动在线态', spi6: 'DeviceHealth · 设备在线态',
    spi7: 'DriverValidator · validate / 仿真',
    aggLabel: '聚合',
    flow1: '拷贝重命名', flow2: '构建接入', flow3: '配置注册',
    buildRegion: '构建 · 运行 · 注册（SDK 编排，与协议无关）',
    b1: 'mvn clean package', b1s: '-pl dc3-driver-knx -am',
    b2: 'java -jar', b2s: 'dc3-driver-knx.jar',
    b3: 'DriverInitRunner', b3s: 'registerWithRetry 2s→30s ×30',
    b4: 'dc3-center-manager', b4s: '登记驱动 + 属性定义',
    b5: '注册成功', b5s: 'Driver register succeeded',
    lblJar: 'jar', lblRun: 'Runner 启动', lblGrpc: 'gRPC 注册', lblOk: '成功', lblFail: '30 次耗尽',
    failBox: '注册失败退出', failSub: 'CrashLoopBackOff',
    legTpl: '模板 / 配置文件', legCode: 'Java 代码 / SDK / 服务', legBuild: '构建与运行',
    legFail: '失败路径', legMain: '主链路',
    note: '注册失败日志: Driver register failed on attempt n/30, retrying... · code 一旦投产不可改（稳定路由标识）'
  },
  en: {
    aria: 'Driver authoring in four steps: copy and rename the dc3-driver-virtual template, hook the module into the parent POM with protocol deps, configure dc3.driver metadata/schedule/attributes in application.yml, and implement DriverCustomService aggregating 7 SPIs; then mvn package, run the jar, and DriverInitRunner registers with the manager over gRPC using exponential-backoff retry until it succeeds',
    step1: 'Step 1 · Copy template & rename', step2: 'Step 2 · Hook into parent POM',
    step3: 'Step 3 · Configure application.yml', step4: 'Step 4 · Implement protocol logic',
    tplName: 'dc3-driver-virtual', tplSub: 'template · runnable sample of 7 SPIs',
    cpLabel: 'cp -r + rename', cpSub: 'rename package/app/impl classes',
    newName: 'dc3-driver-knx', newSub1: 'KnxDriverApplication', newSub2: 'KnxDriverCustomServiceImpl',
    parentPom: 'dc3-driver/pom.xml', parentSub: 'register in <modules>',
    inheritLabel: 'inherit parent', modulePom: 'dc3-driver-knx/pom.xml',
    moduleSub1: 'protocol deps only here', moduleSub2: 'e.g. calimero-core (KNX)',
    sdkNote1: 'parent already brings SDK & plugin', sdkNote2: 'dc3-common-driver · boot-maven',
    cfgMeta: 'dc3.driver metadata', cfgMetaSub: 'tenant · name · code · type',
    cfgSched: 'schedule', cfgSchedSub: 'read 0/30s · custom 0/5s · health 0/15s',
    cfgDrvAttr: 'driver-attribute', cfgDrvAttrSub: 'host · port (per device)',
    cfgPtAttr: 'point-attribute', cfgPtAttrSub: 'groupAddress (per point)',
    svcName: 'DriverCustomService', svcSub: 'one interface = 7 responsibilities',
    spiTitle: '7 SPI sub-interfaces',
    spi1: 'DriverLifecycle · initial / schedule', spi2: 'DriverProtocol · read / write',
    spi3: 'DriverCommand · execute', spi4: 'DriverMetadataListener · event',
    spi5: 'DriverHealth · driver status', spi6: 'DeviceHealth · device status',
    spi7: 'DriverValidator · validate / mock',
    aggLabel: 'aggregates',
    flow1: 'copied & renamed', flow2: 'wired into build', flow3: 'config registered',
    buildRegion: 'Build · run · register (orchestrated by the SDK)',
    b1: 'mvn clean package', b1s: '-pl dc3-driver-knx -am',
    b2: 'java -jar', b2s: 'dc3-driver-knx.jar',
    b3: 'DriverInitRunner', b3s: 'registerWithRetry 2s→30s ×30',
    b4: 'dc3-center-manager', b4s: 'driver + attribute definitions',
    b5: 'Registered', b5s: 'Driver register succeeded',
    lblJar: 'jar', lblRun: 'Runner boots', lblGrpc: 'gRPC register', lblOk: 'ok', lblFail: '30 attempts used',
    failBox: 'registration failed, exit', failSub: 'CrashLoopBackOff',
    legTpl: 'Template / config files', legCode: 'Java code / SDK / services', legBuild: 'Build & run',
    legFail: 'Failure path', legMain: 'Main flow',
    note: 'Retry log: Driver register failed on attempt n/30, retrying... · code is a stable routing id once in production'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 660">
        <defs>
          <marker id="daf1-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="daf1-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="daf1-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#daf1-grid)" height="100%" width="100%"/>

        <!-- regions (drawn first) -->
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="260" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.step1 }}</text>
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="260" x="340" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="352" y="82">{{ s.step2 }}</text>
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="260" x="640" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="652" y="82">{{ s.step3 }}</text>
        <rect fill="var(--dc3-region-be)" height="270" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="260" x="940" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="952" y="82">{{ s.step4 }}</text>
        <rect fill="var(--dc3-region-be)" height="180" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1160" x="40" y="380"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="398">{{ s.buildRegion }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="170" x2="170" y1="172" y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="178" y="180">{{ s.cpLabel }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="178" y="190">{{ s.cpSub }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="470" x2="470" y1="172" y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="478" y="184">{{ s.inheritLabel }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1070" x2="1070" y1="160" y2="178"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1078" y="172">{{ s.aggLabel }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="284" x2="356" y1="204" y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="320" y="196">{{ s.flow1 }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="584" x2="656" y1="204" y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="620" y="196">{{ s.flow2 }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="884" x2="956" y1="204" y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="920" y="196">{{ s.flow3 }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="228" x2="294" y1="468" y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="261" y="460">{{ s.lblJar }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="452" x2="518" y1="468" y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="485" y="460">{{ s.lblRun }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="726" x2="792" y1="468" y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="759" y="460">{{ s.lblGrpc }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="980" x2="1046" y1="468" y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1013" y="460">{{ s.lblOk }}</text>
        <line marker-end="url(#daf1-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="622" x2="792" y1="498" y2="522"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="700" y="520">{{ s.lblFail }}</text>

        <!-- step 1 nodes -->
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="60" y="112"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="170" y="136">
          {{ s.tplName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="156">{{ s.tplSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="192"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="170" y="214">
          {{ s.newName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="232">{{ s.newSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="246">{{ s.newSub2 }}</text>

        <!-- step 2 nodes -->
        <rect fill="var(--dc3-amber-fill)" height="58" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="360" y="112"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="470" y="136">
          {{ s.parentPom }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="470" y="156">{{ s.parentSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="360" y="192"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="470" y="214">
          {{ s.modulePom }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="470" y="232">{{ s.moduleSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="470" y="246">{{ s.moduleSub2 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="220" x="360" y="270"/>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="470" y="288">{{ s.sdkNote1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="470" y="304">{{ s.sdkNote2 }}</text>

        <!-- step 3 nodes: one config, four groups -->
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="660" y="106"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="124">
          {{ s.cfgMeta }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="140">{{ s.cfgMetaSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="660" y="160"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="178">
          {{ s.cfgSched }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="194">{{ s.cfgSchedSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="660" y="214"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="232">
          {{ s.cfgDrvAttr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="248">{{ s.cfgDrvAttrSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="660" y="268"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="286">
          {{ s.cfgPtAttr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="302">{{ s.cfgPtAttrSub }}</text>

        <!-- step 4 nodes -->
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="960" y="106"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1070" y="128">
          {{ s.svcName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="146">{{ s.svcSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="140" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="960" y="178"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1070" y="198">
          {{ s.spiTitle }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="218">{{ s.spi1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="234">{{ s.spi2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="250">{{ s.spi3 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="266">{{ s.spi4 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="282">{{ s.spi5 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="298">{{ s.spi6 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="972" y="314">{{ s.spi7 }}</text>

        <!-- build & register chain -->
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="160" x="64" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="144" y="462">
          {{ s.b1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="144" y="480">{{ s.b1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="298" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="373" y="462">
          {{ s.b2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="373" y="480">{{ s.b2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="522" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="622" y="462">
          {{ s.b3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="622" y="480">{{ s.b3s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="796" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="886" y="462">
          {{ s.b4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="886" y="480">{{ s.b4s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="130"
              x="1050" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1115" y="462">
          {{ s.b5 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1115" y="480">{{ s.b5s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="40" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="180"
              x="796" y="506"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="886" y="522">
          {{ s.failBox }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="886" y="538">{{ s.failSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="594"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="603">{{ s.legTpl }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="230" y="594"/>
        <text fill="var(--dc3-text2)" font-size="9" x="252" y="603">{{ s.legCode }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="470" y="594"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="603">{{ s.legBuild }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="640" x2="664" y1="600"
              y2="600"/>
        <text fill="var(--dc3-text2)" font-size="9" x="670" y="603">{{ s.legFail }}</text>
        <line marker-end="url(#daf1-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="790" x2="818" y1="600" y2="600"/>
        <text fill="var(--dc3-text2)" font-size="9" x="824" y="603">{{ s.legMain }}</text>

        <!-- footnote -->
        <text fill="var(--dc3-text2)" font-size="8.5" x="60" y="634">{{ s.note }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
