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
    deviceTitle: '设备 DEVICE · dc3_device',
    pointTitle: '位号 POINT · dc3_point',
    pvTitle: '位号值 POINT_VALUE · dc3_point_value',
    driverTitle: '驱动 DRIVER · dc3_driver',
    tenantTitle: '租户 TENANT · dc3_tenant',
    ehTitle: '事件流水 EVENT_HISTORY',
    lblDevice: 'device_id · 1:N',
    lblPoint: '1:N · 列定义 → 一行行取数',
    lblDriver: 'driver_id · 1:N 采集者',
    lblTenant: 'tenantId · 隔离边界',
    lblPeer: '并列上行（无外键）',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 一对多', legTenant: '租户隔离（虚线）', legPeer: '互补并列（虚线）',
    aria: '位号值实体关系图：一条位号值由设备与位号共同定位并带采集驱动与租户归属；rawValue 保留原始值、calValue 是换算后工程值、numValue 供数值聚合；与事件流水并列于上行链路，一个连续采样一个离散发生'
  },
  en: {
    deviceTitle: 'DEVICE · dc3_device',
    pointTitle: 'POINT · dc3_point',
    pvTitle: 'POINT_VALUE · dc3_point_value',
    driverTitle: 'DRIVER · dc3_driver',
    tenantTitle: 'TENANT · dc3_tenant',
    ehTitle: 'EVENT_HISTORY · dc3_event_history',
    lblDevice: 'device_id · 1:N',
    lblPoint: '1:N · column def → rows of values',
    lblDriver: 'driver_id · 1:N collector',
    lblTenant: 'tenantId · isolation boundary',
    lblPeer: 'peer uplink (no FK)',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N one-to-many', legTenant: 'tenant isolation (dashed)', legPeer: 'complementary peer (dashed)',
    aria: 'Point value entity-relationship diagram: each point value is located by device plus point and carries the collecting driver and tenant ownership; rawValue keeps the raw reading, calValue the scaled engineering value and numValue feeds numeric aggregation; it peers with event history on the uplink — continuous sampling versus discrete occurrence'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 680">
        <defs>
          <marker id="pvr-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="pvr-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="pvr-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#pvr-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <line marker-end="url(#pvr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="590" x2="590" y1="175" y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="598" y="206">{{ s.lblDevice }}</text>
        <line marker-end="url(#pvr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="310" x2="466" y1="300" y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="388" y="290">{{ s.lblPoint }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="318" y="294">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="452" y="294">N</text>
        <line marker-end="url(#pvr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="950" x2="784" y1="275" y2="275"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="866" y="265">{{ s.lblDriver }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="938" y="294">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="790" y="294">N</text>
        <path d="M 175 496 V 440 H 560 V 399" fill="none" marker-end="url(#pvr-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="360" y="432">{{ s.lblTenant }}</text>
        <path d="M 640 496 V 436 H 690 V 399" fill="none" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,4"
              stroke-width="0.8"/>
        <text fill="var(--dc3-text2)" font-size="8" x="648" y="470">{{ s.lblPeer }}</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="270"
              x="490" y="70"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="270" x="490" y="70"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="500" y="85">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="102">id · deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="117">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="117">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="132">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="132">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="147">enableFlag</text>

        <!-- POINT entity -->
        <rect fill="var(--dc3-be-fill)" height="135" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="60" y="230"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="250" x="60" y="230"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="245">{{ s.pointTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="262">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="302" y="262">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="277">pointName · pointCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="302" y="277">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="292">pointTypeFlag · rwFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="307">unit · multiple · baseValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="322">valueDecimal</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="337">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="302" y="337">FK</text>

        <!-- POINT_VALUE entity -->
        <rect fill="var(--dc3-db-fill)" height="165" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.2"
              width="310" x="470" y="230"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="310" x="470" y="230"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="480" y="245">{{ s.pvTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="262">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="262">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="277">pointId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="277">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="292">rawValue（原始值 · 可回溯重算）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="307">calValue（工程值 · 人可读）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="322">numValue（数值投影 · 聚合用）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="337">hasLatestValue · driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="337">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="352">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="352">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="367">createTime（快照时间戳）</text>

        <!-- DRIVER entity -->
        <rect fill="var(--dc3-amber-fill)" height="90" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="230" x="950" y="230"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="230" x="950" y="230"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="960" y="245">{{ s.driverTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="262">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="1172" y="262">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="277">driverName · serviceName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="960" y="292">driverTypeFlag</text>

        <!-- TENANT entity -->
        <rect fill="var(--dc3-rose-fill)" height="75" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="230" x="60" y="500"/>
        <rect fill="var(--dc3-rose-stroke)" height="22" rx="6" width="230" x="60" y="500"/>
        <text fill="var(--dc3-rose-fill)" font-size="10" font-weight="600" x="70" y="515">{{ s.tenantTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="532">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="282" y="532">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="547">tenantCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="282" y="547">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="562">enableFlag</text>

        <!-- EVENT_HISTORY entity -->
        <rect fill="var(--dc3-db-fill)" height="105" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="280"
              x="470" y="500"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="280" x="470" y="500"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="480" y="515">{{ s.ehTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="532">recordId (UUID)</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="742" y="532">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="547">deviceId · eventId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="742" y="547">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="562">paramValues · message</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="577">occurTime</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="644">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="644">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="644">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="644">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="644">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="644">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="360" x2="380" y1="641" y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="644">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="510" x2="530" y1="641"
              y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="536" y="644">{{ s.legTenant }}</text>
        <line stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="690" x2="710" y1="641"
              y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="716" y="644">{{ s.legPeer }}</text>
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
