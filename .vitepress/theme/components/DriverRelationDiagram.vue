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
    attrTitle: '驱动属性 DRIVER_ATTRIBUTE · 声明',
    driverTitle: '驱动 DRIVER · dc3_driver',
    deviceTitle: '设备 DEVICE · dc3_device',
    cfgTitle: '驱动属性配置 DRIVER_ATTRIBUTE_CONFIG · 值',
    pvTitle: '位号值 POINT_VALUE · dc3_point_value',
    esTitle: '实体状态 ENTITY_STATE · dc3_entity_state',
    esType: 'entity_type_flag = 3 (驱动)',
    lblRegister: '启动时注册 1:N',
    lblOwn: 'driverId · 一驱动多设备',
    lblFill: 'attributeId 填值',
    lblDeviceCfg: 'deviceId · 一台设备一份',
    lblProduce: '采集上报 1:N',
    lblLease: '运行态租约 1:1',
    noteMold: 'DriverAttribute = 配置项的声明（模具）',
    noteCast: 'DriverAttributeConfig = 设备填的具体值（浇出来的件）',
    legPk: 'PK 主键', legFk: 'FK 外键', legDecl: '驱动声明',
    legValue: '设备填值', legRun: '运行态', legOneN: '1:N 一对多',
    aria: '驱动实体关系图：驱动启动时把身份与一组 DriverAttribute 配置项声明注册到管理中心，一台驱动承载多台设备；每台设备按声明的属性模板填 DriverAttributeConfig 连接值；驱动按模板位号采集产出位号值；其在线状态是 dc3_entity_state 里的独立租约'
  },
  en: {
    attrTitle: 'DRIVER_ATTRIBUTE · declaration',
    driverTitle: 'DRIVER · dc3_driver',
    deviceTitle: 'DEVICE · dc3_device',
    cfgTitle: 'DRIVER_ATTRIBUTE_CONFIG · values',
    pvTitle: 'POINT_VALUE · dc3_point_value',
    esTitle: 'ENTITY_STATE · dc3_entity_state',
    esType: 'entity_type_flag = 3 (driver)',
    lblRegister: 'registers at startup 1:N',
    lblOwn: 'driverId · one driver, many devices',
    lblFill: 'attributeId value',
    lblDeviceCfg: 'deviceId · one per device',
    lblProduce: 'collects & reports 1:N',
    lblLease: 'runtime lease 1:1',
    noteMold: 'DriverAttribute = declaration of config slots (the mold)',
    noteCast: 'DriverAttributeConfig = concrete values filled per device (the casting)',
    legPk: 'PK primary key', legFk: 'FK foreign key', legDecl: 'driver declaration',
    legValue: 'device-filled values', legRun: 'runtime', legOneN: '1:N one-to-many',
    aria: 'Driver entity-relationship diagram: at startup a driver registers its identity plus a set of DriverAttribute declarations with the manager; one driver carries many devices; each device fills DriverAttributeConfig connection values against the declared template; the driver collects profile points into point values; its online state is a separate lease in dc3_entity_state'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 700">
        <defs>
          <marker id="drv-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="drv-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="drv-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#drv-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <path d="M 490 290 H 400 V 140 H 324" fill="none" marker-end="url(#drv-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="412" y="132">{{ s.lblRegister }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="478" y="284">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="330" y="132">N</text>
        <path d="M 960 140 H 900 V 300 H 784" fill="none" marker-end="url(#drv-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="908" y="230">{{ s.lblOwn }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="792" y="294">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="944" y="134">N</text>
        <line marker-end="url(#drv-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="190" x2="190" y1="200" y2="456"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="198" y="330">{{ s.lblFill }}</text>
        <path d="M 960 170 H 870 V 530 H 344" fill="none" marker-end="url(#drv-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="878" y="350">{{ s.lblDeviceCfg }}</text>
        <path d="M 780 380 H 920 V 490 H 956" fill="none" marker-end="url(#drv-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="850" y="372">{{ s.lblProduce }}</text>
        <line marker-end="url(#drv-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="635" x2="635" y1="410" y2="476"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="643" y="447">{{ s.lblLease }}</text>

        <!-- DRIVER_ATTRIBUTE entity -->
        <rect fill="var(--dc3-amber-fill)" height="120" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="260" x="60" y="80"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="260" x="60" y="80"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="70" y="95">{{ s.attrTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="112">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="312" y="112">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="127">attributeName · attributeCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="142">attributeTypeFlag (string/int/float…)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="157">defaultValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="172">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="312" y="172">FK</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="960" y="80"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="260" x="960" y="80"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="970" y="95">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="112">id · deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="127">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1212" y="127">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="142">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1212" y="142">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="157">enableFlag · tenantId</text>

        <!-- DRIVER entity -->
        <rect fill="var(--dc3-amber-fill)" height="180" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="290" x="490" y="230"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="290" x="490" y="230"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="500" y="245">{{ s.driverTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="262">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="772" y="262">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="277">driverName · driverCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="292">serviceName · serviceHost</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="307">driverTypeFlag (client/server/gw/conn)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="322">driverExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="337">enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="352">signature · version</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="367">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="367">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="392">自注册: DriverInitRunner → RegisterBO</text>

        <!-- DRIVER_ATTRIBUTE_CONFIG entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="60" y="460"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="280" x="60" y="460"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="70" y="475">{{ s.cfgTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="492">attributeId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="332" y="492">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="507">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="332" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="522">configValue (如 host=192.168.1.10)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="537">configExt · enableFlag</text>

        <!-- ENTITY_STATE entity -->
        <rect fill="var(--dc3-rose-fill)" height="90" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="290" x="490" y="480"/>
        <rect fill="var(--dc3-rose-stroke)" height="22" rx="6" width="290" x="490" y="480"/>
        <text fill="var(--dc3-rose-fill)" font-size="10" font-weight="600" x="500" y="495">{{ s.esTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="512">entity_id</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="772" y="512">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="527">{{ s.esType }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="542">state · expire_time · lease_version</text>

        <!-- POINT_VALUE entity -->
        <rect fill="var(--dc3-db-fill)" height="105" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="260"
              x="960" y="460"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="260" x="960" y="460"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="970" y="475">{{ s.pvTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="492">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1212" y="492">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="507">deviceId · pointId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1212" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="522">rawValue · calValue · numValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="970" y="537">createTime</text>

        <!-- mold/casting note -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="520" x="700" y="600"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="712" y="616">{{ s.noteMold }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="712" y="632">{{ s.noteCast }}</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="616">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="616">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="60" y="634">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="634">{{ s.legFk }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="160" y="625"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="634">{{ s.legDecl }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="300" y="625"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="634">{{ s.legValue }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="440" y="625"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="634">{{ s.legRun }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="540" x2="560" y1="630" y2="630"/>
        <text fill="var(--dc3-text2)" font-size="9" x="566" y="634">{{ s.legOneN }}</text>
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
