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
    profileTitle: '模板 PROFILE · dc3_profile',
    cmdTitle: '指令 COMMAND · dc3_command',
    paramTitle: '指令参数 COMMAND_PARAM',
    callTitle: '调用提交 COMMAND_CALL',
    histTitle: '调用记录 COMMAND_HISTORY',
    deviceTitle: '设备 DEVICE（引用）',
    lblOwns: '1:N 指令定义挂模板',
    lblParams: '1:N 输入/输出参数',
    lblMatch: 'commandId 匹配定义',
    lblSubmit: '提交 → 落记录 PENDING',
    lblCaller: 'deviceId 发起调用',
    cmpTitle: '两类下行不要混淆',
    cmpL1: '写位号 PointCommand — 改一个量',
    cmpL2: '· DriverCustomService.write()',
    cmpL3: '· 队列 dc3.e.point_command',
    cmpL4: '自定义指令 Command — 带参数动作',
    cmpL5: '· DriverCommand.execute()',
    cmpL6: '· 队列 dc3.e.command',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 一对多', legCall: '调用发起（虚线）', legCmp: '对比注记（虚线框）',
    aria: '指令实体关系图：指令定义通过 profileId 挂在模板下并携带输入输出参数；一次调用由设备发起、按 commandId 匹配定义并携带 paramValues 参数表；数据中心把它落成 COMMAND_HISTORY 记录并推进状态；写位号与自定义指令是两条独立下行链路'
  },
  en: {
    profileTitle: 'PROFILE · dc3_profile',
    cmdTitle: 'COMMAND · dc3_command',
    paramTitle: 'COMMAND_PARAM · dc3_command_param',
    callTitle: 'COMMAND_CALL · submit body',
    histTitle: 'COMMAND_HISTORY · dc3_command_history',
    deviceTitle: 'DEVICE (referenced)',
    lblOwns: '1:N command defs on profile',
    lblParams: '1:N input/output params',
    lblMatch: 'commandId matches definition',
    lblSubmit: 'submit → PENDING record',
    lblCaller: 'deviceId originates call',
    cmpTitle: 'two distinct downlinks',
    cmpL1: 'Point write — changes one quantity',
    cmpL2: '· DriverCustomService.write()',
    cmpL3: '· queue dc3.e.point_command',
    cmpL4: 'Custom command — parameterized action',
    cmpL5: '· DriverCommand.execute()',
    cmpL6: '· queue dc3.e.command',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N one-to-many', legCall: 'call origin (dashed)', legCmp: 'comparison note (dashed)',
    aria: 'Command entity-relationship diagram: command definitions attach to a profile via profileId and carry input/output params; a call originates from a device, matches the definition by commandId and carries a paramValues map; the data center persists it as a COMMAND_HISTORY record and advances its status; point writes and custom commands are two independent downlinks'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 680">
        <defs>
          <marker id="cmr-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cmr-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cmr-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <path d="M 280 125 H 380 V 250 H 466" fill="none" marker-end="url(#cmr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="325" y="117">{{ s.lblOwns }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="288" y="119">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="446" y="244">N</text>
        <path d="M 470 345 H 400 V 375 H 284" fill="none" marker-end="url(#cmr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="437" y="337">{{ s.lblParams }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="452" y="339">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="290" y="369">N</text>
        <line marker-end="url(#cmr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="560" x2="560" y1="390" y2="466"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="568" y="432">{{ s.lblMatch }}</text>
        <line marker-end="url(#cmr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="770" x2="876" y1="530" y2="530"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="823" y="520">{{ s.lblSubmit }}</text>
        <line marker-end="url(#cmr-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="284"
              x2="466" y1="530" y2="530"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="375" y="520">{{ s.lblCaller }}</text>

        <!-- PROFILE entity -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="80"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="220" x="60" y="80"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="95">{{ s.profileTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="112">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="272" y="112">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="127">profileName · profileCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="142">version</text>

        <!-- COMMAND entity -->
        <rect fill="var(--dc3-be-fill)" height="180" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="300"
              x="470" y="210"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="300" x="470" y="210"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="480" y="225">{{ s.cmdTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="242">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="762" y="242">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="257">commandName · commandCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="762" y="257">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="272">commandTypeFlag (custom/config/action)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="287">callTypeFlag (sync/async)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="302">timeout（秒）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="317">commandExt（协议映射·幂等）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="332">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="347">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="762" y="347">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="362">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="762" y="362">FK</text>

        <!-- COMMAND_PARAM entity -->
        <rect fill="var(--dc3-be-fill)" height="150" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="60" y="300"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="220" x="60" y="300"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="315">{{ s.paramTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="332">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="272" y="332">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="347">paramName · paramCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="362">paramDirectionFlag (in/out)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="377">paramTypeFlag（复用 PointTypeEnum）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="392">requiredFlag · defaultValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="407">commandId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="272" y="407">FK</text>

        <!-- COMMAND_CALL entity -->
        <rect fill="var(--dc3-fe-fill)" height="120" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="470" y="470"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="300" x="470" y="470"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="480" y="485">{{ s.callTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="502">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="762" y="502">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="517">commandId · commandCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="532">paramValues Map&lt;String,String&gt;</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="547">source · expireAt</text>

        <!-- COMMAND_HISTORY entity -->
        <rect fill="var(--dc3-db-fill)" height="120" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="280"
              x="880" y="470"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="280" x="880" y="470"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="890" y="485">{{ s.histTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="890" y="502">recordId</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="1142" y="502">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="890" y="517">deviceId · commandId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1142" y="517">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="890" y="532">status（0..7 状态机）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="890" y="547">errorCode · finishedAt</text>

        <!-- DEVICE referenced ghost -->
        <rect fill="var(--dc3-ext-fill)" height="90" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="220" x="60" y="485"/>
        <rect fill="none" height="22" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="220" x="60"
              y="485"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="70" y="500">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="517">id · deviceName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="532">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="272" y="532">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="547">enableFlag</text>

        <!-- comparison card -->
        <rect fill="none" height="150" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="280" x="880" y="210"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="892" y="230">{{ s.cmpTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="252">{{ s.cmpL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="270">{{ s.cmpL2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="288">{{ s.cmpL3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="310">{{ s.cmpL4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="328">{{ s.cmpL5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="346">{{ s.cmpL6 }}</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="650">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="650">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="650">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="650">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="650">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="650">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="360" x2="380" y1="647" y2="647"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="650">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.8" x1="510" x2="530" y1="647" y2="647"/>
        <text fill="var(--dc3-text2)" font-size="9" x="536" y="650">{{ s.legCall }}</text>
        <rect fill="none" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-dasharray="3,2" stroke-width="1"
              width="16" x="660" y="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="682" y="650">{{ s.legCmp }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style>
/* ER diagrams share a monospace field font; each Relation component re-declares this class */
.dc3-er svg text {
  font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace;
}

.dc3-er svg text[font-size='10'],
.dc3-er svg text[font-size='10.5'] {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif;
}
</style>
