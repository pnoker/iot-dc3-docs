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
    gwName: 'dc3-gateway :8000 · 唯一 HTTP 入口',
    gwSub: '第 0 步 make up-db && make up-dev · virtual 驱动随栈启动 · 鉴权头 X-Auth-Tenant / X-Auth-Login / X-Auth-Token',
    laneAuth: '鉴权中心 Auth · 第 1–2 步 换 token',
    laneMgr: '管理中心 Manager · 第 3–7 步 建元数据并绑定',
    laneData: '数据中心 Data · 第 8–9 步 读值与写命令',
    a1: '① 取盐 salt', a1Sub1: 'POST /api/v3/auth/token/salt', a1Sub2: '{tenant, name} → salt（5 分钟内用）',
    a2: '② 换取 token', a2Sub1: 'POST /api/v3/auth/token/generate',
    a2Sub2: '{salt, password} → ACCESS_TOKEN 12h',
    m3: '③ 确认 virtual 驱动', m3Sub: 'driver/list → <DRIVER_ID> · driverName = Virtual Driver',
    m4: '④ 加模板 Profile', m4Sub: 'profile/add → list 按名回查 <PROFILE_ID>（add 不回 ID）',
    m5: '⑤ 加位号 Point', m5Sub: 'point/add · rwFlag=READ_WRITE · FLOAT · unit °C → <POINT_ID>',
    m6: '⑥ 加设备 Device', m6Sub: 'device/add {driverId, profileId} → <DEVICE_ID>',
    m7: '⑦ 配位号属性 Config', m7Sub: 'point_attribute_config/add {attributeId, pointId, value=25.0}',
    d8: '⑧ 读实时位号值', d8Sub1: 'POST /api/v3/data/point_value/latest',
    d8Sub2: '→ rawValue · calValue · numValue 持续刷新',
    d9: '⑨ 下发写命令', d9Sub1: 'POST /api/v3/data/point_command/write {value=26.5}',
    d9Sub2: '→ commandId · 异步受理 ≠ 已执行',
    chipPoll: '轮询回执 get_by_command_id',
    chipPollSub: '终态 success / failed / timeout / expired · TTL 10s',
    lblHttp: 'HTTP', lblSalt: 'salt', lblToken: 'token 就绪',
    lblDriverId: 'driverId', lblProfileId: 'profileId', lblPointId: 'pointId',
    lblDeviceId: 'deviceId', lblEffect: 'Config 生效 · virtual 开始产值',
    lblRead: '读到值', lblPoll: '轮询',
    legGw: '网关入口', legAuth: '鉴权中心', legMgr: '管理中心',
    legData: '数据中心', legPoll: '轮询回执（虚线）',
    aria: '第一个设备黄金路径：第零步起栈后，先在鉴权中心取盐换 token，再在管理中心依次确认 virtual 驱动、建模板、建可写位号、建设备、配位号属性，最后在数据中心读实时位号值并下发写命令，凭 commandId 轮询回执终态'
  },
  en: {
    gwName: 'dc3-gateway :8000 · the only HTTP entry',
    gwSub: 'step 0 make up-db && make up-dev · virtual driver boots with the stack · headers X-Auth-Tenant / X-Auth-Login / X-Auth-Token',
    laneAuth: 'Auth Center · steps 1–2 token',
    laneMgr: 'Manager Center · steps 3–7 metadata & binding',
    laneData: 'Data Center · steps 8–9 read & write',
    a1: '(1) Fetch salt', a1Sub1: 'POST /api/v3/auth/token/salt', a1Sub2: '{tenant, name} → salt (use within 5 min)',
    a2: '(2) Exchange token', a2Sub1: 'POST /api/v3/auth/token/generate',
    a2Sub2: '{salt, password} → ACCESS_TOKEN 12h',
    m3: '(3) Confirm virtual driver', m3Sub: 'driver/list → <DRIVER_ID> · driverName = Virtual Driver',
    m4: '(4) Add profile', m4Sub: 'profile/add → list by name → <PROFILE_ID> (add returns no ID)',
    m5: '(5) Add point', m5Sub: 'point/add · rwFlag=READ_WRITE · FLOAT · unit °C → <POINT_ID>',
    m6: '(6) Add device', m6Sub: 'device/add {driverId, profileId} → <DEVICE_ID>',
    m7: '(7) Configure point config', m7Sub: 'point_attribute_config/add {attributeId, pointId, value=25.0}',
    d8: '(8) Read latest value', d8Sub1: 'POST /api/v3/data/point_value/latest',
    d8Sub2: '→ rawValue · calValue · numValue keep refreshing',
    d9: '(9) Write command', d9Sub1: 'POST /api/v3/data/point_command/write {value=26.5}',
    d9Sub2: '→ commandId · accepted ≠ executed',
    chipPoll: 'poll receipt get_by_command_id',
    chipPollSub: 'final: success / failed / timeout / expired · TTL 10s',
    lblHttp: 'HTTP', lblSalt: 'salt', lblToken: 'token ready',
    lblDriverId: 'driverId', lblProfileId: 'profileId', lblPointId: 'pointId',
    lblDeviceId: 'deviceId', lblEffect: 'config effective · virtual emits values',
    lblRead: 'value read', lblPoll: 'poll',
    legGw: 'gateway entry', legAuth: 'auth center', legMgr: 'manager center',
    legData: 'data center', legPoll: 'poll receipt (dashed)',
    aria: 'First-device golden path: after booting the stack, fetch salt and exchange a token at the auth center; at the manager center confirm the virtual driver, create a profile, a writable point, a device and the point attribute config; finally read the latest point value at the data center, issue a write command and poll the receipt by commandId for the final state'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 700">
        <defs>
          <marker id="fdd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="fdd-ah-db" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-db-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="fdd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#fdd-grid)" height="100%" width="100%"/>

        <!-- gateway band -->
        <rect fill="var(--dc3-amber-fill)" height="54" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="1220" x="60" y="70"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="670" y="92">{{
            s.gwName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="670" y="110">{{ s.gwSub }}</text>

        <!-- lanes -->
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="300" x="40" y="150"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" x="52" y="168">{{ s.laneAuth }}</text>
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="440" x="360" y="150"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="372" y="168">{{ s.laneMgr }}</text>
        <rect fill="var(--dc3-region-be)" height="500" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="460" x="820" y="150"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="832" y="168">{{ s.laneData }}</text>

        <!-- arrows -->
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="190"
              x2="190" y1="124" y2="196"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="198" y="168">{{ s.lblHttp }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="580"
              x2="580" y1="124" y2="196"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="588" y="168">{{ s.lblHttp }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="1050"
              x2="1050" y1="124" y2="196"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1058" y="168">{{ s.lblHttp }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="190" x2="190" y1="276"
              y2="326"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="198" y="306">{{ s.lblSalt }}</text>
        <path d="M 320 373 H 345 V 232 H 376" fill="none" marker-end="url(#fdd-ah)" stroke="var(--dc3-rose-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="352" y="300">{{ s.lblToken }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="580" x2="580" y1="264"
              y2="286"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="588" y="279">{{ s.lblDriverId }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="580" x2="580" y1="354"
              y2="376"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="588" y="369">{{ s.lblProfileId }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="580" x2="580" y1="444"
              y2="466"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="588" y="459">{{ s.lblPointId }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1" x1="580" x2="580" y1="534"
              y2="556"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="588" y="549">{{ s.lblDeviceId }}</text>
        <path d="M 780 592 H 810 V 238 H 836" fill="none" marker-end="url(#fdd-ah-db)" stroke="var(--dc3-db-stroke)"
              stroke-width="1"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="818" y="420">{{ s.lblEffect }}</text>
        <line marker-end="url(#fdd-ah-db)" stroke="var(--dc3-db-stroke)" stroke-width="1" x1="1050" x2="1050" y1="276"
              y2="326"/>
        <text fill="var(--dc3-db-text)" font-size="8" x="1058" y="306">{{ s.lblRead }}</text>
        <line marker-end="url(#fdd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.9" x1="1050"
              x2="1050" y1="416" y2="466"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1058" y="446">{{ s.lblPoll }}</text>

        <!-- auth nodes -->
        <rect fill="var(--dc3-rose-fill)" height="76" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="260"
              x="60" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="190" y="222">{{
            s.a1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="242">{{ s.a1Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="260">{{ s.a1Sub2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="86" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="260"
              x="60" y="330"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="190" y="352">{{
            s.a2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="372">{{ s.a2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="392">{{ s.a2Sub2 }}</text>

        <!-- manager nodes -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="400"
              x="380" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="392" y="222">{{ s.m3 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="392" y="244">{{ s.m3Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="400"
              x="380" y="290"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="392" y="312">{{ s.m4 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="392" y="334">{{ s.m4Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="400"
              x="380" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="392" y="402">{{ s.m5 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="392" y="424">{{ s.m5Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="400"
              x="380" y="470"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="392" y="492">{{ s.m6 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="392" y="514">{{ s.m6Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="400"
              x="380" y="560"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="392" y="582">{{ s.m7 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="392" y="604">{{ s.m7Sub }}</text>

        <!-- data nodes -->
        <rect fill="var(--dc3-db-fill)" height="76" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="420"
              x="840" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="852" y="222">{{ s.d8 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="852" y="242">{{ s.d8Sub1 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="852" y="262">{{ s.d8Sub2 }}</text>
        <rect fill="var(--dc3-db-fill)" height="86" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.2" width="420"
              x="840" y="330"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" x="852" y="352">{{ s.d9 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="852" y="372">{{ s.d9Sub1 }}</text>
        <text fill="var(--dc3-db-text)" font-size="8.5" x="852" y="392">{{ s.d9Sub2 }}</text>
        <rect fill="none" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="420" x="840" y="470"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="852" y="492">{{ s.chipPoll }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="852" y="514">{{ s.chipPollSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1" width="16"
              x="52" y="676"/>
        <text fill="var(--dc3-text2)" font-size="9" x="74" y="685">{{ s.legGw }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="170" y="676"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="685">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="290" y="676"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="685">{{ s.legMgr }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="410" y="676"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="685">{{ s.legData }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.9" x1="530" x2="550" y1="682" y2="682"/>
        <text fill="var(--dc3-text2)" font-size="9" x="556" y="685">{{ s.legPoll }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
