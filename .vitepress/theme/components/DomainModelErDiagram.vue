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
    aria: '领域模型 ER 图：dc3_profile 是根，下挂位号、命令、事件三类模板能力；dc3_device 以单一 profile_id 外键绑模板、再绑驱动；右侧两层——协议层 Attribute 由驱动启动注册（定义有哪些坑），实例层 Config 为每台设备填具体值（坑里填什么）',
    tplRegion: '模板域 · Profile 是根 (绑定即继承能力)',
    attrRegion: '协议层 Attribute · 驱动启动注册 (有这个坑)',
    cfgRegion: '实例层 Config · 这个坑填什么',
    pfName: 'dc3_profile', pfTag: '«根 · 一类设备的能力清单»',
    pfF1: '+ profile_id PK', pfF2: '+ profile_name',
    pfF3: '+ profile_share_flag', pfF4: '  TENANT / DRIVER / USER',
    pfF5: '+ tenant_id', pfF6: '设备绑模板即继承全部能力',
    ptName: 'dc3_point', ptTag: '«位号 · 数据最小单位»',
    ptF1: '+ point_id PK', ptF2: '+ profile_id FK → profile',
    ptF3: '+ point_type_flag (8 枚举值)', ptF4: '+ rw_flag 读/写方向',
    ptF5: '+ unit · value_decimal = 6', ptF6: '+ base_value / multiple',
    ptF7: '可写性由 rw_flag 决定',
    cmName: 'dc3_command', cmTag: '«自定义命令»',
    cmF1: '+ command_id PK', cmF2: '+ profile_id FK',
    cmF3: '参数: dc3_command_param',
    evName: 'dc3_event', evTag: '«事件定义»',
    evF1: '+ event_id PK', evF2: '+ profile_id FK',
    evF3: '+ event_type_flag (4 类)', evF4: '参数: dc3_event_param',
    dvName: 'dc3_device', dvTag: '«设备实例»',
    dvF1: '+ device_id PK', dvF2: '+ profile_id FK → 唯一模板',
    dvF3: '  (单值外键 · 非多对多!)', dvF4: '+ driver_id FK → driver',
    dvF5: '+ enable_flag · tenant_id',
    drName: 'dc3_driver', drTag: '«协议驱动»',
    drF1: '+ driver_id PK', drF2: '+ service_name · driver_type',
    paName: 'dc3_point_attribute', paTag: '«协议层»',
    paF1: '+ id PK · driver_id FK', paF2: '例: 寄存器地址',
    paF3: '驱动启动时注册',
    daName: 'dc3_driver_attribute', daTag: '«协议层»',
    daF1: '+ id PK · driver_id FK', daF2: '例: 从机地址',
    daF3: '驱动启动时注册',
    caName: 'dc3_command_attribute', caTag: '«协议层»',
    caF1: '+ id PK · driver_id FK', caF2: '命令的协议参数项',
    eaName: 'dc3_event_attribute', eaTag: '«协议层»',
    eaF1: '+ id PK · driver_id FK', eaF2: '事件的协议参数项',
    pcName: 'dc3_point_attribute_config', pcTag: '«实例值»',
    pcF1: '+ attribute_id FK', pcF2: '+ device_id FK · point_id FK',
    pcF3: '+ config_value', pcF4: '例: 寄存器 40001',
    pcF5: '每设备每位号一行',
    dcName: 'dc3_driver_attribute_config', dcTag: '«实例值»',
    dcF1: '+ attribute_id FK', dcF2: '+ device_id FK',
    dcF3: '+ config_value', dcF4: '例: 从机号 = 1',
    dcF5: 'command/event config 同构',
    c1: 'N ─ 1', c2: 'profile_id', c3: 'profile_id 单值',
    c4: 'N ─ 1', c5: '注册', c6: 'driver_id · 1─N',
    c7: '1 ─ N', c8: 'attribute_id',
    legTpl: '模板 / 驱动', legDev: '设备实例', legAttr: 'Attribute 协议层',
    legCfg: 'Config 实例值', legRel: '关系连线', legWarn: '单外键警示'
  },
  en: {
    aria: 'Domain-model ER diagram: dc3_profile is the root with point, command and event capabilities; dc3_device binds exactly one profile via a single-valued foreign key and one driver; on the right, protocol-layer Attributes are registered by drivers at startup (which slots exist), while instance-layer Configs hold the concrete per-device values (what fills the slot)',
    tplRegion: 'Template domain · Profile is the root',
    attrRegion: 'Protocol layer Attribute · driver-registered at startup',
    cfgRegion: 'Instance layer Config · what fills the slot',
    pfName: 'dc3_profile', pfTag: '«root · capability list of a device class»',
    pfF1: '+ profile_id PK', pfF2: '+ profile_name',
    pfF3: '+ profile_share_flag', pfF4: '  TENANT / DRIVER / USER',
    pfF5: '+ tenant_id', pfF6: 'binding inherits all capabilities',
    ptName: 'dc3_point', ptTag: '«point · smallest data unit»',
    ptF1: '+ point_id PK', ptF2: '+ profile_id FK → profile',
    ptF3: '+ point_type_flag (8 enum values)', ptF4: '+ rw_flag direction',
    ptF5: '+ unit · value_decimal = 6', ptF6: '+ base_value / multiple',
    ptF7: 'writability decided by rw_flag',
    cmName: 'dc3_command', cmTag: '«custom command»',
    cmF1: '+ command_id PK', cmF2: '+ profile_id FK',
    cmF3: 'params: dc3_command_param',
    evName: 'dc3_event', evTag: '«event definition»',
    evF1: '+ event_id PK', evF2: '+ profile_id FK',
    evF3: '+ event_type_flag (4 kinds)', evF4: 'params: dc3_event_param',
    dvName: 'dc3_device', dvTag: '«device instance»',
    dvF1: '+ device_id PK', dvF2: '+ profile_id FK → one profile',
    dvF3: '  (single FK · not many-to-many!)', dvF4: '+ driver_id FK → driver',
    dvF5: '+ enable_flag · tenant_id',
    drName: 'dc3_driver', drTag: '«protocol driver»',
    drF1: '+ driver_id PK', drF2: '+ service_name · driver_type',
    paName: 'dc3_point_attribute', paTag: '«protocol»',
    paF1: '+ id PK · driver_id FK', paF2: 'e.g. register address',
    paF3: 'registered at driver startup',
    daName: 'dc3_driver_attribute', daTag: '«protocol»',
    daF1: '+ id PK · driver_id FK', daF2: 'e.g. slave address',
    daF3: 'registered at driver startup',
    caName: 'dc3_command_attribute', caTag: '«protocol»',
    caF1: '+ id PK · driver_id FK', caF2: 'protocol params of a command',
    eaName: 'dc3_event_attribute', eaTag: '«protocol»',
    eaF1: '+ id PK · driver_id FK', eaF2: 'protocol params of an event',
    pcName: 'dc3_point_attribute_config', pcTag: '«instance value»',
    pcF1: '+ attribute_id FK', pcF2: '+ device_id FK · point_id FK',
    pcF3: '+ config_value', pcF4: 'e.g. register 40001',
    pcF5: 'one row per device per point',
    dcName: 'dc3_driver_attribute_config', dcTag: '«instance value»',
    dcF1: '+ attribute_id FK', dcF2: '+ device_id FK',
    dcF3: '+ config_value', dcF4: 'e.g. slave id = 1',
    dcF5: 'command/event config isomorphic',
    c1: 'N ─ 1', c2: 'profile_id', c3: 'profile_id single',
    c4: 'N ─ 1', c5: 'register', c6: 'driver_id · 1─N',
    c7: '1 ─ N', c8: 'attribute_id',
    legTpl: 'Template / driver', legDev: 'Device instance', legAttr: 'Attribute protocol',
    legCfg: 'Config instance value', legRel: 'Relation', legWarn: 'single-FK warning'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1400 726">
        <defs>
          <marker id="dmer-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dmer-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dmer-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="600" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="880" x="24" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="82">{{ s.tplRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="330" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="430" x="940" y="64"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" x="952" y="82">{{ s.attrRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="430" x="940" y="414"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="952" y="432">{{ s.cfgRegion }}</text>

        <!-- relations -->
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="372" x2="498" y1="190"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="435" y="182">{{ s.c1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="435" y="212">{{ s.c2 }}</text>
        <path d="M372,420 L440,420 L440,270 L496,270" fill="none" marker-end="url(#dmer-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="405" y="412">{{ s.c1 }}</text>
        <path d="M372,580 L460,580 L460,290 L496,290" fill="none" marker-end="url(#dmer-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="405" y="572">{{ s.c1 }}</text>
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="650" x2="650" y1="358"
              y2="304"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="660" y="326">{{ s.c1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="660" y="344">{{ s.c3 }}</text>
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="560" x2="560" y1="510"
              y2="536"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="570" y="528">{{ s.c4 }}</text>
        <path d="M802,590 L908,590 L908,160 L956,160" fill="none" marker-end="url(#dmer-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="932" y="152">{{ s.c5 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="900" y="380">{{ s.c6 }}</text>
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1055" x2="1055" y1="222"
              y2="446"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1065" y="300">{{ s.c7 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1065" y="318">{{ s.c8 }}</text>
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1265" x2="1265" y1="222"
              y2="446"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1275" y="330">{{ s.c7 }}</text>

        <!-- template domain nodes -->
        <rect fill="var(--dc3-be-fill)" height="200" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="270" x="100" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="235" y="124">
          {{ s.ptName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="235" y="140">{{ s.ptTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="108" x2="362" y1="148" y2="148"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="168">{{ s.ptF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="186">{{ s.ptF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="204">{{ s.ptF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="222">{{ s.ptF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="240">{{ s.ptF5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="258">{{ s.ptF6 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="112" y="282">{{ s.ptF7 }}</text>
        <rect fill="var(--dc3-be-fill)" height="200" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="300" x="500" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="650" y="124">
          {{ s.pfName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="650" y="140">{{ s.pfTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="508" x2="792" y1="148" y2="148"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="168">{{ s.pfF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="186">{{ s.pfF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="204">{{ s.pfF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="520" y="222">{{ s.pfF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="244">{{ s.pfF5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="512" y="268">{{ s.pfF6 }}</text>
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="270"
              x="100" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="235" y="384">
          {{ s.cmName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="235" y="400">{{ s.cmTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="108" x2="362" y1="408" y2="408"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="428">{{ s.cmF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="446">{{ s.cmF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="464">{{ s.cmF3 }}</text>
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="270"
              x="100" y="520"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="235" y="544">
          {{ s.evName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="235" y="560">{{ s.evTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="108" x2="362" y1="568" y2="568"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="588">{{ s.evF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="606">{{ s.evF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="112" y="624">{{ s.evF3 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="150" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="500" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="650" y="384">
          {{ s.dvName }}
        </text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="650" y="400">{{ s.dvTag }}</text>
        <line stroke="var(--dc3-fe-stroke)" stroke-width="0.6" x1="508" x2="792" y1="408" y2="408"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="428">{{ s.dvF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="446">{{ s.dvF2 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="520" y="464">{{ s.dvF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="484">{{ s.dvF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="502">{{ s.dvF5 }}</text>
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="300"
              x="500" y="540"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="650" y="564">
          {{ s.drName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="650" y="580">{{ s.drTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="508" x2="792" y1="588" y2="588"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="608">{{ s.drF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="512" y="626">{{ s.drF2 }}</text>

        <!-- protocol layer attributes -->
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="190" x="960" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9" text-anchor="middle" x="1055" y="122">
          {{ s.paName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1055" y="136">{{ s.paTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="968" x2="1142" y1="144" y2="144"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="164">{{ s.paF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="182">{{ s.paF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="968" y="204">{{ s.paF3 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="190" x="1170" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9" text-anchor="middle" x="1265" y="122">
          {{ s.daName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1265" y="136">{{ s.daTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="1178" x2="1352" y1="144" y2="144"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="164">{{ s.daF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="182">{{ s.daF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1178" y="204">{{ s.daF3 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="190" x="960" y="240"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9" text-anchor="middle" x="1055" y="262">
          {{ s.caName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1055" y="276">{{ s.caTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="968" x2="1142" y1="284" y2="284"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="304">{{ s.caF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="322">{{ s.caF2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="190" x="1170" y="240"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9" text-anchor="middle" x="1265" y="262">
          {{ s.eaName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1265" y="276">{{ s.eaTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="1178" x2="1352" y1="284" y2="284"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="304">{{ s.eaF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="322">{{ s.eaF2 }}</text>

        <!-- instance layer configs -->
        <rect fill="var(--dc3-db-fill)" height="180" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="190"
              x="960" y="450"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="8" text-anchor="middle" x="1055" y="472">
          {{ s.pcName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1055" y="486">{{ s.pcTag }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="0.6" x1="968" x2="1142" y1="494" y2="494"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="514">{{ s.pcF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="968" y="532">{{ s.pcF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="552">{{ s.pcF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="968" y="574">{{ s.pcF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="968" y="596">{{ s.pcF5 }}</text>
        <rect fill="var(--dc3-db-fill)" height="180" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="190"
              x="1170" y="450"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="8" text-anchor="middle" x="1265" y="472">
          {{ s.dcName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1265" y="486">{{ s.dcTag }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="0.6" x1="1178" x2="1352" y1="494" y2="494"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="514">{{ s.dcF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="532">{{ s.dcF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="552">{{ s.dcF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1178" y="574">{{ s.dcF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1178" y="596">{{ s.dcF5 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="24" y="690"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="699">{{ s.legTpl }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="150" y="690"/>
        <text fill="var(--dc3-text2)" font-size="9" x="172" y="699">{{ s.legDev }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="280" y="690"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="699">{{ s.legAttr }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="440" y="690"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="699">{{ s.legCfg }}</text>
        <line marker-end="url(#dmer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="600" x2="628" y1="696"
              y2="696"/>
        <text fill="var(--dc3-text2)" font-size="9" x="634" y="699">{{ s.legRel }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="9" x="720" y="699">{{ s.legWarn }}: device.profile_id</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
