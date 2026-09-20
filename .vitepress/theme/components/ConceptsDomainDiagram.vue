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
    regionProfile: '模板域 Profile Domain · 能力定义一遍，设备复用',
    regionInstance: '实例域 Instance Domain · 现场设备的平台镜像',
    regionDriver: '接入域 Driver Domain · 协议怎么连',
    regionRuntime: '运行态数据域 Runtime Data · 只增不改的时序流水',
    tenantBand: '租户边界 Tenant Boundary',
    tenantSub: '每条业务记录带 tenantId · 控制器层 requireTenant / filterTenant 校验 · 跨租户访问判 404',
    profileName: '模板 Profile', profileSub: '能力归属根（不存子对象字段）',
    pointName: '位号 Point', pointSub: '数据项',
    commandName: '指令 Command', commandSub: '动作',
    eventName: '事件 Event', eventSub: '上报',
    deviceName: '设备 Device', deviceSub: '绑定一个模板 + 一个驱动', deviceSub2: 'enableFlag · tenantId',
    driverName: '驱动 Driver', driverSub: '协议适配服务 dc3-driver-*',
    configName: '连接配置 Config', configSub: 'Attribute 声明 + 实例值',
    pvName: '位号值 PointValue', pvSub: 'device_id + point_id + 时间戳',
    ehName: '事件流水 EventHistory', ehSub: '离散发生 · recordId',
    lblBindProfile: 'profileId · 恰好 1 个',
    lblBindDriver: 'driverId · 恰好 1 个',
    lblColumn: '列定义 → 一行行取数 1:N',
    lblDevicePoint: 'device_id + point_id',
    lblEventReport: '离散上报 1:N',
    lblFillConfig: '按驱动声明填值',
    lblTenantTag: 'tenantId',
    legProfile: '模板能力（位号/指令/事件）', legInstance: '设备实例',
    legDriver: '驱动 / 连接配置', legData: '运行态数据',
    legTenant: '租户边界', legSolid: '归属 / 绑定', legDash: '租户归属',
    aria: 'DC3 对象模型域图：模板域聚合位号、指令、事件；设备恰好绑定一个模板与一个驱动；运行态数据域按设备加位号定位位号值与事件流水；租户边界横贯全部业务数据'
  },
  en: {
    regionProfile: 'Profile Domain · define capabilities once, reuse per device',
    regionInstance: 'Instance Domain · platform mirror of a field device',
    regionDriver: 'Driver Domain · how the protocol connects',
    regionRuntime: 'Runtime Data · append-only time-series stream',
    tenantBand: 'Tenant Boundary',
    tenantSub: 'every business row carries tenantId · enforced by requireTenant / filterTenant · cross-tenant reads return 404',
    profileName: 'Profile', profileSub: 'ownership root (no child fields)',
    pointName: 'Point', pointSub: 'data item',
    commandName: 'Command', commandSub: 'action',
    eventName: 'Event', eventSub: 'report',
    deviceName: 'Device', deviceSub: 'binds one profile + one driver', deviceSub2: 'enableFlag · tenantId',
    driverName: 'Driver', driverSub: 'protocol adapter dc3-driver-*',
    configName: 'Connection Config', configSub: 'Attribute decl + values',
    pvName: 'PointValue', pvSub: 'device_id + point_id + timestamp',
    ehName: 'EventHistory', ehSub: 'discrete occurrence · recordId',
    lblBindProfile: 'profileId · exactly one',
    lblBindDriver: 'driverId · exactly one',
    lblColumn: 'column def → rows of values 1:N',
    lblDevicePoint: 'device_id + point_id',
    lblEventReport: 'discrete reports 1:N',
    lblFillConfig: 'fill values per driver decl',
    lblTenantTag: 'tenantId',
    legProfile: 'Profile capabilities (point/command/event)', legInstance: 'Device instance',
    legDriver: 'Driver / connection config', legData: 'Runtime data',
    legTenant: 'Tenant boundary', legSolid: 'ownership / binding', legDash: 'tenant ownership',
    aria: 'DC3 object-model domain map: the profile domain aggregates points, commands and events; a device binds exactly one profile and one driver; runtime data locates point values and event history by device plus point; a tenant boundary spans all business data'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1180 664">
        <defs>
          <marker id="cdd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="cdd-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cdd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cdd-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="330" x="40" y="84"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="102">{{ s.regionProfile }}</text>
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="320" x="430" y="84"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="442" y="102">{{ s.regionInstance }}</text>
        <rect fill="var(--dc3-region-amber)" height="210" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="280" x="860" y="84"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="872" y="102">{{ s.regionDriver }}</text>
        <rect fill="var(--dc3-region-be)" height="150" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1100" x="40" y="368"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="52" y="386">{{ s.regionRuntime }}</text>

        <!-- tenant boundary band -->
        <rect fill="var(--dc3-rose-fill)" height="58" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1100" x="40" y="556"/>
        <text fill="var(--dc3-rose-stroke)" font-size="11" font-weight="600" x="52" y="578">{{ s.tenantBand }}</text>
        <text fill="var(--dc3-text2)" font-size="9" x="52" y="596">{{ s.tenantSub }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="175" x2="100" y1="172" y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="86" y="204">1:N</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="205" x2="205" y1="172" y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="212" y="203">1:N</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="235" x2="310" y1="172" y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="312" y="204">1:N</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="480" x2="312" y1="150" y2="145"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="396" y="132">{{ s.lblBindProfile }}</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="700" x2="888" y1="150" y2="145"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="794" y="132">{{ s.lblBindDriver }}</text>
        <path d="M 100 278 V 428 H 516" fill="none" marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="300" y="420">{{ s.lblColumn }}</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="620" x2="620" y1="194" y2="396"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="628" y="300">{{ s.lblDevicePoint }}</text>
        <path d="M 310 278 V 486 H 860 V 460" fill="none" marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="585" y="478">{{ s.lblEventReport }}</text>
        <line marker-end="url(#cdd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="700"
              x2="888" y1="180" y2="251"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="716" y="222">{{ s.lblFillConfig }}</text>
        <line marker-end="url(#cdd-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="620" x2="620" y1="456" y2="552"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="628" y="510">{{ s.lblTenantTag }}</text>
        <line marker-end="url(#cdd-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="860" x2="860" y1="456" y2="552"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="868" y="510">{{ s.lblTenantTag }}</text>

        <!-- nodes: profile domain -->
        <rect fill="var(--dc3-be-fill)" height="54" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="100" y="118"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="205" y="141">{{
            s.profileName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="205" y="158">{{ s.profileSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="88"
              x="56" y="228"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="100" y="250">{{
            s.pointName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="100" y="266">{{ s.pointSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="98"
              x="156" y="228"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="205" y="250">{{
            s.commandName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="205" y="266">{{ s.commandSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="88"
              x="266" y="228"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="310" y="250">{{
            s.eventName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="310" y="266">{{ s.eventSub }}</text>

        <!-- nodes: instance domain -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="480" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="590" y="152">{{
            s.deviceName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="590" y="169">{{ s.deviceSub }}</text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="590" y="184">{{ s.deviceSub2 }}</text>

        <!-- nodes: driver domain -->
        <rect fill="var(--dc3-amber-fill)" height="54" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="890" y="118"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1000" y="141">{{
            s.driverName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1000" y="158">{{ s.driverSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="50" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="890" y="228"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1000" y="250">{{
            s.configName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1000" y="266">{{ s.configSub }}</text>

        <!-- nodes: runtime domain -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="520" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="620" y="423">{{
            s.pvName
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="9" text-anchor="middle" x="620" y="441">{{ s.pvSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="760" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="860" y="423">{{
            s.ehName
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="9" text-anchor="middle" x="860" y="441">{{ s.ehSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="52" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="74" y="645">{{ s.legProfile }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="268" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="290" y="645">{{ s.legInstance }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="392" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="414" y="645">{{ s.legDriver }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="576" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="598" y="645">{{ s.legData }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="712" y="636"/>
        <text fill="var(--dc3-text2)" font-size="9" x="734" y="645">{{ s.legTenant }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="836" x2="856" y1="642" y2="642"/>
        <text fill="var(--dc3-text2)" font-size="9" x="862" y="645">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="976" x2="996" y1="642"
              y2="642"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1002" y="645">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
