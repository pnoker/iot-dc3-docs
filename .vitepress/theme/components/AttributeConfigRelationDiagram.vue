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
    driverTitle: '驱动 DRIVER · dc3_driver',
    deviceTitle: '设备 DEVICE · dc3_device',
    daTitle: '驱动属性 DRIVER_ATTRIBUTE · 连接级',
    paTitle: '位号属性 POINT_ATTRIBUTE · 位号级',
    dacTitle: '驱动属性配置 DRIVER_ATTRIBUTE_CONFIG',
    pacTitle: '位号属性配置 POINT_ATTRIBUTE_CONFIG',
    ghostTitle: '同构扩展（指令 / 事件）',
    ghostL1: 'CommandAttribute(Config) — 指令协议映射',
    ghostL2: '· 仅 execute() 自定义指令消费',
    ghostL3: 'EventAttribute(Config) — 事件解析路径',
    ghostL4: '· 常见于监听型驱动',
    lblRef: 'driverId · 一驱动多设备',
    lblRegDa: '注册 · 连接级声明',
    lblRegPa: '注册 · 位号级声明',
    lblFillDa: 'attributeId · 一台设备一份',
    lblFillPa: 'attributeId · 每位号一份',
    lblDevDa: 'deviceId',
    lblDevPa: 'deviceId + pointId',
    lblGhost: '同构',
    scopeTitle: '作用范围差异',
    scopeL1: '连接级：一台设备填一份（host/port）',
    scopeL2: '位号级：每个位号各填一份（寄存器地址）',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 一对多', legRef: '设备侧引用（虚线）', legGhost: '同构扩展（虚线）',
    aria: '属性与配置实体关系图：驱动注册连接级 DriverAttribute 与位号级 PointAttribute 两档声明；设备侧按声明填 DriverAttributeConfig（一台设备一份连接值）与 PointAttributeConfig（每位号一份采集映射）；指令属性与事件属性是同构扩展，分别服务于自定义指令协议映射与事件解析'
  },
  en: {
    driverTitle: 'DRIVER · dc3_driver',
    deviceTitle: 'DEVICE · dc3_device',
    daTitle: 'DRIVER_ATTRIBUTE · connection scope',
    paTitle: 'POINT_ATTRIBUTE · point scope',
    dacTitle: 'DRIVER_ATTRIBUTE_CONFIG',
    pacTitle: 'POINT_ATTRIBUTE_CONFIG',
    ghostTitle: 'Isomorphic extensions (command / event)',
    ghostL1: 'CommandAttribute(Config) — command mapping',
    ghostL2: '· consumed only by execute()',
    ghostL3: 'EventAttribute(Config) — event parsing path',
    ghostL4: '· common on listening drivers',
    lblRef: 'driverId · one driver, many devices',
    lblRegDa: 'register · connection scope',
    lblRegPa: 'register · point scope',
    lblFillDa: 'attributeId · one per device',
    lblFillPa: 'attributeId · one per point',
    lblDevDa: 'deviceId',
    lblDevPa: 'deviceId + pointId',
    lblGhost: 'isomorphic',
    scopeTitle: 'scope difference',
    scopeL1: 'connection: one set per device (host/port)',
    scopeL2: 'point: one set per point (register address)',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N one-to-many', legRef: 'device-side reference (dashed)', legGhost: 'extension (dashed)',
    aria: 'Attribute & config entity-relationship diagram: the driver registers connection-scoped DriverAttribute and point-scoped PointAttribute declarations; the device side fills DriverAttributeConfig (one connection value per device) and PointAttributeConfig (one acquisition mapping per point); command and event attributes are isomorphic extensions for custom-command mapping and event parsing'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 720">
        <defs>
          <marker id="acr-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="acr-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#acr-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <line marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="300" x2="486" y1="110" y2="110"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="393" y="100">{{ s.lblRef }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="470" y="104">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="308" y="104">N</text>
        <path d="M 540 175 V 230 H 195 V 286" fill="none" marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="368" y="222">{{ s.lblRegDa }}</text>
        <path d="M 730 175 V 240 H 605 V 286" fill="none" marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="670" y="232">{{ s.lblRegPa }}</text>
        <line marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="195" x2="195" y1="410" y2="516"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="203" y="468">{{ s.lblFillDa }}</text>
        <line marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="605" x2="605" y1="410" y2="516"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="613" y="468">{{ s.lblFillPa }}</text>
        <path d="M 60 120 H 36 V 490 H 110 V 514" fill="none" marker-end="url(#acr-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="73" y="482">{{ s.lblDevDa }}</text>
        <path d="M 240 160 V 240 H 420 V 480 H 640 V 516" fill="none" marker-end="url(#acr-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="530" y="472">{{ s.lblDevPa }}</text>
        <line marker-end="url(#acr-ah)" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="740" x2="846" y1="350" y2="350"/>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="793" y="340">{{ s.lblGhost }}</text>

        <!-- DRIVER entity -->
        <rect fill="var(--dc3-amber-fill)" height="105" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="290" x="490" y="70"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="290" x="490" y="70"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="500" y="85">{{ s.driverTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="102">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="772" y="102">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="117">driverName · driverCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="132">serviceName · driverTypeFlag</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="147">enableFlag · tenantId</text>

        <!-- DEVICE entity -->
        <rect fill="var(--dc3-fe-fill)" height="90" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="60" y="70"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="240" x="60" y="70"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="70" y="85">{{ s.deviceTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="102">id · deviceName · deviceCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="117">driverId（选择驱动）</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="282" y="117">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="132">enableFlag · tenantId</text>

        <!-- DRIVER_ATTRIBUTE entity -->
        <rect fill="var(--dc3-amber-fill)" height="120" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="270" x="60" y="290"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="270" x="60" y="290"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="70" y="305">{{ s.daTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="322">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="322" y="322">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="337">attributeName · attributeCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="322" y="337">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="352">attributeTypeFlag（8 种类型）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="367">defaultValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="382">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="322" y="382">FK</text>

        <!-- POINT_ATTRIBUTE entity -->
        <rect fill="var(--dc3-amber-fill)" height="120" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="270" x="470" y="290"/>
        <rect fill="var(--dc3-amber-stroke)" height="22" rx="6" width="270" x="470" y="290"/>
        <text fill="var(--dc3-amber-fill)" font-size="10" font-weight="600" x="480" y="305">{{ s.paTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="322">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="732" y="322">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="337">attributeName · attributeCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="732" y="337">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="352">attributeTypeFlag（8 种类型）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="367">defaultValue</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="382">driverId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="732" y="382">FK</text>

        <!-- DRIVER_ATTRIBUTE_CONFIG entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="270"
              x="60" y="520"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="270" x="60" y="520"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="70" y="535">{{ s.dacTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="552">attributeId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="322" y="552">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="567">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="322" y="567">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="582">configValue（如 192.168.1.10）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="597">configExt · enableFlag</text>

        <!-- POINT_ATTRIBUTE_CONFIG entity -->
        <rect fill="var(--dc3-fe-fill)" height="120" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="470" y="520"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="300" x="470" y="520"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="480" y="535">{{ s.pacTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="552">attributeId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="762" y="552">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="567">deviceId · pointId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="762" y="567">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="582">configValue（如 40001）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="597">configExt · enableFlag</text>

        <!-- isomorphic extension ghost -->
        <rect fill="none" height="120" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3" stroke-width="1"
              width="330" x="850" y="290"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="862" y="310">{{ s.ghostTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="334">{{ s.ghostL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="352">{{ s.ghostL2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="374">{{ s.ghostL3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="392">{{ s.ghostL4 }}</text>

        <!-- scope card -->
        <rect fill="var(--dc3-region-amber)" height="62" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="330" x="850" y="440"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="862" y="458">{{ s.scopeTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="476">{{ s.scopeL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="494">{{ s.scopeL2 }}</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="690">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="690">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="690">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="690">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="690">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="690">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="360" x2="380" y1="687" y2="687"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="690">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.8" x1="510" x2="530" y1="687" y2="687"/>
        <text fill="var(--dc3-text2)" font-size="9" x="536" y="690">{{ s.legRef }}</text>
        <line stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="690" x2="710" y1="687"
              y2="687"/>
        <text fill="var(--dc3-text2)" font-size="9" x="716" y="690">{{ s.legGhost }}</text>
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
