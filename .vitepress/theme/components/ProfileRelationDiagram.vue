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
    pointTitle: '位号 POINT · dc3_point',
    commandTitle: '指令 COMMAND · dc3_command',
    eventTitle: '事件 EVENT · dc3_event',
    profileTitle: '模板 PROFILE · dc3_profile',
    deviceTitle: '设备 DEVICE · dc3_device',
    lblOwns: 'profileId 归属（三者并列）',
    lblBind: 'Device.profileId · 恰好一个',
    shareTitle: '共享范围 profileShareFlag',
    shareTenant: 'TENANT — 租户内共享，租户下设备可引用',
    shareDriver: 'DRIVER — 驱动内共享，归属该驱动的设备可引用',
    shareUser: 'USER — 用户私有，仅创建者可见',
    verTitle: '版本演进 version',
    verL1: '能力变更时递增 version · 显式可查询',
    verL2: '模板改一处 · 复用它的设备同步生效',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legHeader: '表头 = 实体', legOneN: '1:N 一对多', legOneOne: '1:1 恰好一个',
    aria: '模板实体关系图：PROFILE 表是位号、指令、事件三类能力的归属根（各带 profileId 外键，一对多）；DEVICE 通过单一 profileId 外键恰好绑定一个模板，一个模板可被多个设备复用；共享范围分租户、驱动、用户三档，能力变更递增版本'
  },
  en: {
    pointTitle: 'POINT · dc3_point',
    commandTitle: 'COMMAND · dc3_command',
    eventTitle: 'EVENT · dc3_event',
    profileTitle: 'PROFILE · dc3_profile',
    deviceTitle: 'DEVICE · dc3_device',
    lblOwns: 'profileId ownership (three peers)',
    lblBind: 'Device.profileId · exactly one',
    shareTitle: 'Share scope profileShareFlag',
    shareTenant: 'TENANT — shared across the tenant',
    shareDriver: 'DRIVER — shared within its driver',
    shareUser: 'USER — private to the creator',
    verTitle: 'Version evolution',
    verL1: 'bump version on capability change',
    verL2: 'edit once · all reusing devices follow',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legHeader: 'header = entity', legOneN: '1:N one-to-many', legOneOne: '1:1 exactly one',
    aria: 'Profile entity-relationship diagram: the PROFILE table is the ownership root of points, commands and events (each carries a profileId FK, one-to-many); a DEVICE binds exactly one profile via the single profileId FK while one profile serves many devices; share scope has tenant/driver/user tiers and version increments on capability changes'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1200 700">
        <defs>
          <marker id="prd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="prd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#prd-grid)" height="100%" width="100%"/>

        <!-- connectors: PROFILE trunk to three capability children -->
        <path d="M 480 332 H 400" fill="none" stroke="var(--dc3-arrow)" stroke-width="1"/>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="400" x2="400" y1="145" y2="537"/>
        <path d="M 400 145 H 316" fill="none" marker-end="url(#prd-ah)" stroke="var(--dc3-arrow)" stroke-width="1"/>
        <path d="M 400 345 H 316" fill="none" marker-end="url(#prd-ah)" stroke="var(--dc3-arrow)" stroke-width="1"/>
        <path d="M 400 537 H 316" fill="none" marker-end="url(#prd-ah)" stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="462" y="326">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="378" y="139">N</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="378" y="339">N</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="378" y="531">N</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="408" y="326">{{ s.lblOwns }}</text>

        <!-- connector: DEVICE binds PROFILE (1:1 from device side) -->
        <line marker-end="url(#prd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="870" x2="746" y1="345" y2="332"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="808" y="322">{{ s.lblBind }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="852" y="360">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="752" y="328">1</text>

        <!-- POINT entity -->
        <rect fill="var(--dc3-be-fill)" height="150" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="60" y="70"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="250" x="60" y="70"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="85">{{ s.pointTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="102">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="302" y="102">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="117">pointName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="132">pointCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="302" y="132">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="147">pointTypeFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="162">rwFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="177">unit</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="192">baseValue · multiple</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="207">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="302" y="207">FK</text>

        <!-- COMMAND entity -->
        <rect fill="var(--dc3-be-fill)" height="150" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="60" y="270"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="250" x="60" y="270"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="285">{{ s.commandTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="302">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="302" y="302">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="317">commandName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="332">commandCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="302" y="332">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="347">commandTypeFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="362">callTypeFlag (sync/async)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="377">timeout</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="392">commandParam 1:N</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="407">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="302" y="407">FK</text>

        <!-- EVENT entity -->
        <rect fill="var(--dc3-be-fill)" height="135" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="60" y="470"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="250" x="60" y="470"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="485">{{ s.eventTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="502">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="302" y="502">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="517">eventName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="532">eventCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="302" y="532">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="547">eventTypeFlag · eventLevelFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="562">eventExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="577">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="302" y="577">FK</text>

        <!-- PROFILE entity -->
        <rect fill="var(--dc3-be-fill)" height="165" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="260"
              x="480" y="250"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="260" x="480" y="250"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="490" y="265">{{ s.profileTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="282">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="722" y="282">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="297">profileName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="312">profileCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="722" y="312">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="327">profileShareFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="342">profileTypeFlag (system/driver/user)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="357">version</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="372">profileExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="387">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="402">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="722" y="402">FK</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="150" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="270"
              x="870" y="270"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="270" x="870" y="270"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="880" y="285">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="302">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="1132" y="302">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="317">deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="332">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1132" y="332">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="347">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1132" y="347">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="362">deviceExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="377">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="880" y="392">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1132" y="392">FK</text>

        <!-- share scope card -->
        <rect fill="var(--dc3-region-be)" height="86" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="260" x="480" y="440"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="490" y="458">{{ s.shareTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="476">{{ s.shareTenant }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="494">{{ s.shareDriver }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="512">{{ s.shareUser }}</text>

        <!-- version card -->
        <rect fill="var(--dc3-region-be)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="260" x="480" y="542"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="490" y="560">{{ s.verTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="578">{{ s.verL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="490" y="596">{{ s.verL2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-stroke)" height="11" rx="2" width="16" x="870" y="470"/>
        <text fill="var(--dc3-text2)" font-size="9" x="892" y="479">{{ s.legHeader }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="870" y="500">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="888" y="500">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="870" y="518">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="888" y="518">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="870" y="536">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="888" y="536">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="870" x2="890" y1="556" y2="556"/>
        <text fill="var(--dc3-text2)" font-size="9" x="896" y="559">{{ s.legOneN }}</text>
        <line marker-end="url(#prd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="870" x2="890" y1="576" y2="576"/>
        <text fill="var(--dc3-text2)" font-size="9" x="896" y="579">{{ s.legOneOne }}</text>
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
