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
    driverTitle: '驱动 DRIVER · dc3_driver',
    deviceTitle: '设备 DEVICE · dc3_device',
    pvTitle: '位号值 POINT_VALUE · dc3_point_value',
    ehTitle: '事件流水 EVENT_HISTORY',
    esTitle: '实体状态 ENTITY_STATE',
    esType: 'entity_type_flag = 6 (设备)',
    lblProfile: 'profileId · 一模板多设备',
    lblDriver: 'driverId · 一驱动多设备',
    lblPv: 'device_id + point_id · 1:N',
    lblEh: 'deviceId · 1:N',
    lblEs: '运行态租约 1:1 · 不在 dc3_device',
    legPk: 'PK 主键', legFk: 'FK 外键', legOneN: '1:N 一对多',
    legOneOne: '1:1 租约（虚线）', legMeta: '配置元数据', legRun: '运行态数据',
    aria: '设备实体关系图：设备通过 profileId 绑定恰好一个模板、通过 driverId 绑定一个驱动，两者都是一对多的被复用方；运行期设备与位号共同定位位号值、与事件定义共同定位事件流水；在线状态是 dc3_entity_state 表里的独立租约而非设备表字段'
  },
  en: {
    profileTitle: 'PROFILE · dc3_profile',
    driverTitle: 'DRIVER · dc3_driver',
    deviceTitle: 'DEVICE · dc3_device',
    pvTitle: 'POINT_VALUE · dc3_point_value',
    ehTitle: 'EVENT_HISTORY · dc3_event_history',
    esTitle: 'ENTITY_STATE · dc3_entity_state',
    esType: 'entity_type_flag = 6 (device)',
    lblProfile: 'profileId · one profile, many devices',
    lblDriver: 'driverId · one driver, many devices',
    lblPv: 'device_id + point_id · 1:N',
    lblEh: 'deviceId · 1:N',
    lblEs: 'runtime lease 1:1 · not on dc3_device',
    legPk: 'PK primary key', legFk: 'FK foreign key', legOneN: '1:N one-to-many',
    legOneOne: '1:1 lease (dashed)', legMeta: 'config metadata', legRun: 'runtime data',
    aria: 'Device entity-relationship diagram: a device binds exactly one profile via profileId and one driver via driverId, both reused one-to-many; at runtime device plus point locates point values and device plus event definition locates event history; online state is a separate lease in dc3_entity_state, not a device-table column'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 640">
        <defs>
          <marker id="drd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="drd-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="drd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#drd-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <path d="M 290 160 H 400 V 325 H 486" fill="none" marker-end="url(#drd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="388" y="150">{{ s.lblProfile }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="296" y="152">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="462" y="316">N</text>
        <path d="M 950 160 H 850 V 325 H 764" fill="none" marker-end="url(#drd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="900" y="150">{{ s.lblDriver }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="934" y="152">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="770" y="316">N</text>
        <path d="M 560 400 V 430 H 200 V 456" fill="none" marker-end="url(#drd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="368" y="424">{{ s.lblPv }}</text>
        <line marker-end="url(#drd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="625" x2="625" y1="400" y2="456"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="633" y="432">{{ s.lblEh }}</text>
        <path d="M 690 400 V 430 H 1025 V 456" fill="none" marker-end="url(#drd-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="858" y="424">{{ s.lblEs }}</text>

        <!-- PROFILE entity -->
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="230"
              x="60" y="80"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="230" x="60" y="80"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="95">{{ s.profileTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="112">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="282" y="112">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="127">profileName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="142">profileCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="282" y="142">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="157">version · enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="172">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="282" y="172">FK</text>

        <!-- DRIVER entity -->
        <rect fill="var(--dc3-amber-fill)" height="120" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="250" x="950" y="80"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="250" x="950" y="80"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="960" y="95">{{ s.driverTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="112">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="1232" y="112">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="127">driverName · driverCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="142">serviceName · serviceHost</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="157">driverTypeFlag · enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="172">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1232" y="172">FK</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="150" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="270"
              x="490" y="250"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="270" x="490" y="250"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="500" y="265">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="282">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="750" y="282">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="297">deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="312">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="750" y="312">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="327">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="750" y="327">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="342">deviceExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="357">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="372">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="750" y="372">FK</text>

        <!-- POINT_VALUE entity -->
        <rect fill="var(--dc3-db-fill)" height="120" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="280"
              x="60" y="460"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="280" x="60" y="460"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="70" y="475">{{ s.pvTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="492">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="332" y="492">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="507">pointId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="332" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="522">rawValue · calValue · numValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="537">createTime (时间戳)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="552">append-only 历史流水</text>

        <!-- EVENT_HISTORY entity -->
        <rect fill="var(--dc3-db-fill)" height="120" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="270"
              x="470" y="460"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="270" x="470" y="460"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="480" y="475">{{ s.ehTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="492">recordId (UUID)</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="732" y="492">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="507">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="732" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="522">eventId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="732" y="522">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="537">eventCode · paramValues</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="552">occurTime</text>

        <!-- ENTITY_STATE entity -->
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="270" x="890" y="460"/>
        <rect fill="var(--dc3-rose-stroke)" height="22" rx="6" width="270" x="890" y="460"/>
        <text fill="var(--dc3-rose-fill)" font-size="10" font-weight="600" x="900" y="475">{{ s.esTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="900" y="492">entity_id</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1152" y="492">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="900" y="507">{{ s.esType }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="900" y="522">state 0 online · 1 offline</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="900" y="537">expire_time (租约)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="900" y="552">lease_version</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="612">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="612">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="612">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="612">{{ s.legFk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="260" x2="280" y1="609" y2="609"/>
        <text fill="var(--dc3-text2)" font-size="9" x="286" y="612">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="410" x2="430" y1="609"
              y2="609"/>
        <text fill="var(--dc3-text2)" font-size="9" x="436" y="612">{{ s.legOneOne }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="610" y="603"/>
        <text fill="var(--dc3-text2)" font-size="9" x="632" y="612">{{ s.legMeta }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="750" y="603"/>
        <text fill="var(--dc3-text2)" font-size="9" x="772" y="612">{{ s.legRun }}</text>
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
