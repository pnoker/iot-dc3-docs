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
    pointTitle: '位号 POINT · dc3_point',
    pvTitle: '位号值 POINT_VALUE · dc3_point_value',
    deviceTitle: '设备 DEVICE · dc3_device',
    cmdTitle: '指令 COMMAND · dc3_command',
    cmdGhost: '动作型能力 · 与位号并列',
    lblOwns: '1:N · 位号定义挂模板',
    lblValues: '1:N · 列定义 → 一行行取数',
    lblLocate: 'device_id + point_id',
    lblInherit: '继承模板的位号集合',
    lblNoLink: '× 无外键 · 位号读写不登记指令表',
    convTitle: '原始值 → 工程值换算',
    convFormula: '工程值 = rawValue × multiple + baseValue',
    convNote: '再按 valueDecimal 保留小数 · 默认 multiple=1 · baseValue=0',
    rwTitle: 'rwFlag 读写能力（决定能否写）',
    rwRo: 'READ_ONLY — 只读（默认），写请求被拒',
    rwWo: 'WRITE_ONLY — 只写',
    rwRw: 'READ_WRITE — 可读可写',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 一对多', legInherit: '继承（虚线）', legNoRel: '无关系（×）',
    aria: '位号实体关系图：位号定义通过 profileId 挂在模板下与指令事件并列；一个位号随时间产生成千上万条位号值，由设备加位号共同定位；设备经模板继承位号集合；位号与指令表之间没有外键，能否写唯一取决于 rwFlag'
  },
  en: {
    profileTitle: 'PROFILE · dc3_profile',
    pointTitle: 'POINT · dc3_point',
    pvTitle: 'POINT_VALUE · dc3_point_value',
    deviceTitle: 'DEVICE · dc3_device',
    cmdTitle: 'COMMAND · dc3_command',
    cmdGhost: 'action capability · peer of point',
    lblOwns: '1:N · point defs live on profile',
    lblValues: '1:N · column def → rows of values',
    lblLocate: 'device_id + point_id',
    lblInherit: 'inherits profile point set',
    lblNoLink: '× no FK · point read/write never registers here',
    convTitle: 'raw → engineering value',
    convFormula: 'calValue = rawValue × multiple + baseValue',
    convNote: 'rounded by valueDecimal · defaults multiple=1 · baseValue=0',
    rwTitle: 'rwFlag (decides writability)',
    rwRo: 'READ_ONLY — read only (default), writes rejected',
    rwWo: 'WRITE_ONLY — write only',
    rwRw: 'READ_WRITE — both',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N one-to-many', legInherit: 'inheritance (dashed)', legNoRel: 'no relation (×)',
    aria: 'Point entity-relationship diagram: point definitions attach to a profile via profileId, peer to commands and events; one point yields unbounded point values located by device plus point; a device inherits the point set through its profile; there is no foreign key between points and the command table — writability depends solely on rwFlag'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 640">
        <defs>
          <marker id="ptn-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="ptn-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ptn-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <line marker-end="url(#ptn-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="290" x2="466" y1="250" y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="378" y="240">{{ s.lblOwns }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="298" y="244">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="452" y="244">N</text>
        <line marker-end="url(#ptn-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="760" x2="936" y1="250" y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="848" y="240">{{ s.lblValues }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="768" y="244">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="922" y="244">N</text>
        <path d="M 615 450 V 400 H 1065 V 319" fill="none" marker-end="url(#ptn-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="840" y="392">{{ s.lblLocate }}</text>
        <path d="M 470 500 H 175 V 309" fill="none" marker-end="url(#ptn-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="300" y="492">{{ s.lblInherit }}</text>
        <path d="M 500 350 V 420 H 175 V 446" fill="none" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="0.8"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" text-anchor="middle" x="338" y="412">×
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="352" y="412">{{ s.lblNoLink }}</text>

        <!-- conversion card -->
        <rect fill="var(--dc3-region-be)" height="86" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="360" x="60" y="60"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="72" y="78">{{ s.convTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="98">{{ s.convFormula }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="116">{{ s.convNote }}</text>

        <!-- rwFlag card -->
        <rect fill="var(--dc3-region-amber)" height="100" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="280" x="910" y="60"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="922" y="78">{{ s.rwTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="922" y="98">{{ s.rwRo }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="922" y="116">{{ s.rwWo }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="922" y="134">{{ s.rwRw }}</text>

        <!-- PROFILE entity -->
        <rect fill="var(--dc3-be-fill)" height="105" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="230"
              x="60" y="200"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="230" x="60" y="200"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="215">{{ s.profileTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="232">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="282" y="232">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="247">profileName · profileCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="262">version</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="277">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="292">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="282" y="292">FK</text>

        <!-- POINT entity -->
        <rect fill="var(--dc3-be-fill)" height="210" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.2"
              width="290" x="470" y="140"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="290" x="470" y="140"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="480" y="155">{{ s.pointTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="172">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="752" y="172">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="187">pointName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="202">pointCode（模板内唯一）</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="752" y="202">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="217">pointTypeFlag (8 种类型)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="232">rwFlag (r / w / rw)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="247">unit（工程单位）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="262">baseValue（换算偏移）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="277">multiple（换算倍率）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="292">valueDecimal（小数精度）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="307">pointExt（协议映射·约束·采集策略）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="322">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="337">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="337">FK</text>

        <!-- POINT_VALUE entity -->
        <rect fill="var(--dc3-db-fill)" height="135" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="250"
              x="940" y="180"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="250" x="940" y="180"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="950" y="195">{{ s.pvTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="212">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1182" y="212">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="227">pointId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1182" y="227">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="242">rawValue · calValue · numValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="257">createTime（时间戳）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="272">append-only · 只增不改</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="950" y="287">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1182" y="287">FK</text>

        <!-- COMMAND ghost entity -->
        <rect fill="var(--dc3-ext-fill)" height="105" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="230" x="60" y="450"/>
        <rect fill="none" height="22" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="230" x="60"
              y="450"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="70" y="465">{{ s.cmdTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="482">id · commandCode · callTypeFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="497">{{ s.cmdGhost }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="512">位号读写走 PointCommand 链路</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="527">队列 dc3.e.point_command</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="290"
              x="470" y="450"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="290" x="470" y="450"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="480" y="465">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="482">id · deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="497">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="497">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="512">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="512">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="527">enableFlag · tenantId</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="604">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="604">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="604">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="604">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="604">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="604">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="360" x2="380" y1="601" y2="601"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="604">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.8" x1="510" x2="530" y1="601" y2="601"/>
        <text fill="var(--dc3-text2)" font-size="9" x="536" y="604">{{ s.legInherit }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="680" x2="700" y1="601"
              y2="601"/>
        <text fill="var(--dc3-text2)" font-size="9" x="706" y="604">{{ s.legNoRel }}</text>
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
