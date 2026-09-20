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
    aria: '三层配置层次图：Param 业务层由 Profile 模板定义命令与事件参数；Attribute 协议层由驱动启动时注册本协议需要的配置项；Config 实例层为每台设备填写具体值——驱动运行时采集下发前按设备与位号读取 Config；一句话：Attribute 说有这个坑，Config 说这个坑填什么',
    r1: '① Param 业务层 · 命令 / 事件参数 (与协议无关)',
    r2: '② Attribute 协议层 · 驱动声明有哪些坑',
    r3: '③ Config 实例层 · 每台设备填的值',
    useRegion: '使用方 · 定义存储与运行时读取',
    p1: 'Profile 模板定义', p1Sub1: '命令/事件的能力清单', p1Sub2: '业务语义·不含协议',
    p2: '驱动启动注册', p2Sub1: '读 application.yml', p2Sub2: '声明本协议配置项',
    p3: '设备接入配置', p3Sub1: 'POST *_attribute_config/add', p3Sub2: '为属性填具体值',
    l1: 'Param (业务层)', l1Tag: 'CommandParamDO · EventParamDO',
    l1F1: '模板里一个命令/事件的', l1F2: '输入输出参数定义',
    l2: 'Attribute (协议层)', l2Tag: 'Driver/Point/Command/Event AttributeDO',
    l2F1: '定义「有哪些项」· 不含值', l2F2: '例: 位号需要寄存器地址',
    l3: 'Config (实例层)', l3Tag: '*AttributeConfigDO',
    l3F1: 'attributeId + deviceId + pointId', l3F2: '+ config_value · 例: 40001',
    rt1: '管理中心 dc3-center-manager', rt1Sub: '保存三层定义 · 提供 CRUD 接口',
    rt2: '驱动运行时', rt2Sub1: '采集/下发前按 deviceId (+pointId)',
    rt2Sub2: '读 Config 拿到本设备的参数值',
    rt3: '字段速记 (point_attribute_config)',
    rt3F1: 'attributeId → 指向哪个属性 (哪个坑)',
    rt3F2: 'deviceId / pointId → 哪台设备的哪个位号',
    rt3F3: 'configValue → 填的值 (坑里填什么)',
    a1: '定义', a2: '注册 1─N', a3: '填值',
    a4: '1─N · 每台设备各填一行',
    a5: '入库', a6: '入库 · CRUD', a7: 'gRPC · 元数据查询',
    a8: '采集前读 Config',
    sum1: '一句话: Attribute 说「有这个坑」, Config 说「这个坑填什么」;',
    sum2: 'Param 是与协议无关的业务参数; Config 的请求字段正是 attributeId / deviceId / pointId / configValue',
    legTpl: '模板 / 驱动', legOp: '配置操作方', legParam: 'Param 业务层',
    legAttr: 'Attribute 协议层', legCfg: 'Config 实例层', legFlow: '产生 / 读取流'
  },
  en: {
    aria: 'Three-layer config view: the business Param layer defines command/event parameters on the profile; the protocol Attribute layer is registered by drivers at startup declaring which config slots the protocol needs; the instance Config layer holds the concrete per-device values — drivers read Config by device and point before collecting or dispatching. In short: Attribute says the slot exists, Config fills it',
    r1: '① Param business layer · command / event params (protocol-agnostic)',
    r2: '② Attribute protocol layer · driver-declared slots',
    r3: '③ Config instance layer · per-device values',
    useRegion: 'Consumers · storage and runtime reads',
    p1: 'Profile template', p1Sub1: 'capability list of cmd/event', p1Sub2: 'business semantics, no protocol',
    p2: 'Driver startup', p2Sub1: 'reads application.yml', p2Sub2: 'declares protocol config items',
    p3: 'Device onboarding', p3Sub1: 'POST *_attribute_config/add', p3Sub2: 'fills concrete values',
    l1: 'Param (business)', l1Tag: 'CommandParamDO · EventParamDO',
    l1F1: 'input/output parameters of a', l1F2: 'command/event in the template',
    l2: 'Attribute (protocol)', l2Tag: 'Driver/Point/Command/Event AttributeDO',
    l2F1: 'defines which items exist, no values', l2F2: 'e.g. a point needs a register address',
    l3: 'Config (instance)', l3Tag: '*AttributeConfigDO',
    l3F1: 'attributeId + deviceId + pointId', l3F2: '+ config_value · e.g. 40001',
    rt1: 'Manager Center dc3-center-manager', rt1Sub: 'stores all three layers · CRUD APIs',
    rt2: 'Driver runtime', rt2Sub1: 'before collect/dispatch, by deviceId (+pointId)',
    rt2Sub2: 'reads Config for this device\'s values',
    rt3: 'Field cheat-sheet (point_attribute_config)',
    rt3F1: 'attributeId → which attribute (which slot)',
    rt3F2: 'deviceId / pointId → which device\'s which point',
    rt3F3: 'configValue → the filled value',
    a1: 'define', a2: 'register 1─N', a3: 'fill',
    a4: '1─N · one row per device',
    a5: 'store', a6: 'store · CRUD', a7: 'gRPC · metadata query',
    a8: 'read Config before collect',
    sum1: 'In short: Attribute says the slot exists, Config fills it;',
    sum2: 'Param is protocol-agnostic; Config request fields are attributeId / deviceId / pointId / configValue',
    legTpl: 'Template / driver', legOp: 'Config operator', legParam: 'Param business',
    legAttr: 'Attribute protocol', legCfg: 'Config instance', legFlow: 'Produce / read flow'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1200 664">
        <defs>
          <marker id="dml-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dml-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dml-grid)" height="100%" width="100%"/>

        <!-- layer regions -->
        <rect fill="var(--dc3-region-amber)" height="150" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="760" x="24" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="36" y="82">{{ s.r1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="150" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="760" x="24" y="234"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" x="36" y="252">{{ s.r2 }}</text>
        <rect fill="var(--dc3-region-amber)" height="150" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="760" x="24" y="404"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="36" y="422">{{ s.r3 }}</text>
        <rect fill="var(--dc3-region-be)" height="490" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="506" x="670" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="682" y="82">{{ s.useRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="236" x2="288" y1="145"
              y2="145"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="262" y="135">{{ s.a1 }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="236" x2="288" y1="315"
              y2="315"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="262" y="305">{{ s.a2 }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="236" x2="288" y1="485"
              y2="485"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="262" y="475">{{ s.a3 }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="460" x2="460" y1="372"
              y2="428"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="470" y="402">{{ s.a4 }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="632" x2="688" y1="145"
              y2="145"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="660" y="135">{{ s.a5 }}</text>
        <path d="M632,315 L660,315 L660,225 L760,225 L760,202" fill="none" marker-end="url(#dml-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="706" y="219">{{ s.a6 }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="860" x2="860" y1="202"
              y2="238"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="870" y="224">{{ s.a7 }}</text>
        <path d="M632,485 L660,485 L660,380 L805,380 L805,364" fill="none" marker-end="url(#dml-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="732" y="374">{{ s.a8 }}</text>

        <!-- producers -->
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="44" y="90"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="139" y="118">
          {{ s.p1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="140">{{ s.p1Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="156">{{ s.p1Sub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="44" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="139" y="288">
          {{ s.p2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="310">{{ s.p2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="326">{{ s.p2Sub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="44" y="430"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="139" y="458">
          {{ s.p3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="480">{{ s.p3Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="139" y="496">{{ s.p3Sub2 }}</text>

        <!-- layer boxes -->
        <rect fill="var(--dc3-amber-fill)" height="110" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="340" x="290" y="90"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="460" y="114">
          {{ s.l1 }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="460" y="130">{{ s.l1Tag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="298" x2="622" y1="138" y2="138"/>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="160">{{ s.l1F1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="178">{{ s.l1F2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="110" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="340" x="290" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="460" y="284">
          {{ s.l2 }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="460" y="300">{{ s.l2Tag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="298" x2="622" y1="308" y2="308"/>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="330">{{ s.l2F1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="348">{{ s.l2F2 }}</text>
        <rect fill="var(--dc3-db-fill)" height="110" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.5"
              width="340" x="290" y="430"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="460" y="454">
          {{ s.l3 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="460" y="470">{{ s.l3Tag }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="0.6" x1="298" x2="622" y1="478" y2="478"/>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="500">{{ s.l3F1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="460" y="518">{{ s.l3F2 }}</text>

        <!-- consumers -->
        <rect fill="var(--dc3-be-fill)" height="100" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="450"
              x="690" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="915" y="126">
          {{ s.rt1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="150">{{ s.rt1Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="450"
              x="690" y="240"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="915" y="266">
          {{ s.rt2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="290">{{ s.rt2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="308">{{ s.rt2Sub2 }}</text>
        <rect fill="var(--dc3-region-amber)" height="130" rx="6" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="4,3" stroke-width="1" width="450" x="690" y="400"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="915" y="424">
          {{ s.rt3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="450">{{ s.rt3F1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="470">{{ s.rt3F2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="915" y="490">{{ s.rt3F3 }}</text>

        <!-- summary strip -->
        <rect fill="var(--dc3-region-be)" height="46" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1150" x="24" y="570"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" text-anchor="middle" x="599" y="590">
          {{ s.sum1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="599" y="606">{{ s.sum2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="24" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="645">{{ s.legTpl }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="140" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="162" y="645">{{ s.legOp }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="266" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="288" y="645">{{ s.legParam }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="400" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="645">{{ s.legAttr }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="540" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="562" y="645">{{ s.legCfg }}</text>
        <line marker-end="url(#dml-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="670" x2="698" y1="642"
              y2="642"/>
        <text fill="var(--dc3-text2)" font-size="9" x="704" y="645">{{ s.legFlow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
