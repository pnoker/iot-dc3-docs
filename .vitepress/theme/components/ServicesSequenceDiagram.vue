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
    aria: '就绪时序图：db 栈的 PostgreSQL 与 RabbitMQ 先通过健康检查；应用栈内鉴权中心最先就绪，网关与管理中心随之并行启动；数据中心等管理中心健康，智能中心等数据中心；驱动只依赖管理中心，就绪后向其 gRPC 注册并开始向 RabbitMQ 发布位号值',
    db: 'db 栈', dbSub: 'PostgreSQL + RabbitMQ',
    auth: 'dc3-center-auth', authSub: ':8300/:9300 · 最先就绪',
    gw: 'dc3-gateway', gwSub: ':8000',
    mgr: 'dc3-center-manager', mgrSub: ':8400/:9400',
    data: 'dc3-center-data', dataSub: ':8500/:9500',
    ag: 'dc3-center-agentic', agSub: ':8600',
    drv: 'dc3-driver-*', drvSub: '36 个协议驱动',
    s1a: 'pg_isready · rabbitmq ping', s1b: 'db 栈健康',
    m1: '① db 栈健康 → 启动应用栈',
    s2a: 'readiness /auth/actuator/…', s2b: '→ UP',
    m2: '② healthy',
    m3: "②' healthy (与网关并行)",
    s3a: 'readiness 无 base-path 前缀', s3b: '→ UP',
    s4a: 'readiness 带 base-path 前缀', s4b: '→ UP',
    m4: '③ healthy',
    s5a: 'readiness /data/actuator/…', s5b: '→ UP',
    m5: '④ healthy',
    m6: "④' healthy (仅依赖 manager)",
    s6a: 'readiness → UP', s6b: '开始服务请求',
    m7: '⑤ gRPC 注册 (协议属性定义)',
    m8: '⑥ 位号值发布 point_value',
    note1: '启动顺序由 depends_on: condition: service_healthy 强制，不靠人工 sleep；',
    note2: '驱动只依赖 manager，与管理中心就绪后即可启动、无需等网关；网关与管理中心在 auth 就绪后并行启动',
    legDb: '基础设施', legAuth: '鉴权中心', legSvc: '中心服务', legDrv: '协议驱动',
    legGo: '启动许可', legData: '注册 / 数据'
  },
  en: {
    aria: 'Readiness sequence: PostgreSQL and RabbitMQ in the db stack pass health checks first; inside the app stack the auth center becomes ready first and the gateway and manager start in parallel afterwards; data waits for manager, agentic waits for data; drivers depend only on manager, register over gRPC once ready and start publishing point values to RabbitMQ',
    db: 'db stack', dbSub: 'PostgreSQL + RabbitMQ',
    auth: 'dc3-center-auth', authSub: ':8300/:9300 · first ready',
    gw: 'dc3-gateway', gwSub: ':8000',
    mgr: 'dc3-center-manager', mgrSub: ':8400/:9400',
    data: 'dc3-center-data', dataSub: ':8500/:9500',
    ag: 'dc3-center-agentic', agSub: ':8600',
    drv: 'dc3-driver-*', drvSub: '36 protocol drivers',
    s1a: 'pg_isready · rabbitmq ping', s1b: 'db stack healthy',
    m1: '① db healthy → start app stack',
    s2a: 'readiness /auth/actuator/…', s2b: '→ UP',
    m2: '② healthy',
    m3: "②' healthy (parallel with gw)",
    s3a: 'readiness, no base-path prefix', s3b: '→ UP',
    s4a: 'readiness with base-path prefix', s4b: '→ UP',
    m4: '③ healthy',
    s5a: 'readiness /data/actuator/…', s5b: '→ UP',
    m5: '④ healthy',
    m6: "④' healthy (manager only)",
    s6a: 'readiness → UP', s6b: 'serving requests',
    m7: '⑤ gRPC register (protocol attributes)',
    m8: '⑥ publish point_value',
    note1: 'Start order is enforced by depends_on: condition: service_healthy, not by manual sleeps;',
    note2: 'drivers depend only on manager and start right after it, without waiting for the gateway; gateway and manager start in parallel once auth is ready',
    legDb: 'Infrastructure', legAuth: 'Auth center', legSvc: 'Center services', legDrv: 'Protocol drivers',
    legGo: 'Start permission', legData: 'Register / data'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {db: 100, auth: 300, gw: 500, mgr: 700, data: 890, ag: 1060, drv: 1220}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 726">
        <defs>
          <marker id="svs-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="svs-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#svs-grid)" height="100%" width="100%"/>

        <!-- lifelines -->
        <line v-for="k in ['db','auth','gw','mgr','data','ag','drv']" :key="'ll' + k" :x1="PX[k]" :x2="PX[k]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="78" y2="610"/>

        <!-- activation bars -->
        <rect fill="var(--dc3-db-fill)" height="516" stroke="var(--dc3-db-stroke)" stroke-width="0.8" width="10"
              x="95" y="92"/>
        <rect fill="var(--dc3-rose-fill)" height="160" stroke="var(--dc3-rose-stroke)" stroke-width="0.8" width="10"
              x="295" y="145"/>
        <rect fill="var(--dc3-be-fill)" height="110" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="495" y="222"/>
        <rect fill="var(--dc3-be-fill)" height="340" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="695" y="257"/>
        <rect fill="var(--dc3-be-fill)" height="70" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="885" y="377"/>
        <rect fill="var(--dc3-be-fill)" height="100" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1055" y="452"/>
        <rect fill="var(--dc3-amber-fill)" height="130" stroke="var(--dc3-amber-stroke)" stroke-width="0.8" width="10"
              x="1215" y="487"/>

        <!-- db stack self note -->
        <rect fill="var(--dc3-db-fill)" height="36" rx="4" stroke="var(--dc3-db-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="180" x="115" y="96"/>
        <text fill="var(--dc3-db-text)" font-size="7.5" x="123" y="110">{{ s.s1a }}</text>
        <text fill="var(--dc3-db-text)" font-size="7.5" x="123" y="124">{{ s.s1b }}</text>

        <!-- messages -->
        <line :x1="PX.db + 8" :x2="PX.auth - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="155" y2="155"/>
        <text :x="(PX.db + PX.auth) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="147">
          {{ s.m1 }}
        </text>
        <rect fill="var(--dc3-rose-fill)" height="36" rx="4" stroke="var(--dc3-rose-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="180" x="315" y="172"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="323" y="186">{{ s.s2a }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="323" y="200">{{ s.s2b }}</text>
        <line :x1="PX.auth + 8" :x2="PX.gw - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="230" y2="230"/>
        <text :x="(PX.auth + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="222">
          {{ s.m2 }}
        </text>
        <line :x1="PX.auth + 8" :x2="PX.mgr - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="265" y2="265"/>
        <text :x="(PX.auth + PX.mgr) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="257">
          {{ s.m3 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="36" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="180" x="515" y="282"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="523" y="296">{{ s.s3a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="523" y="310">{{ s.s3b }}</text>
        <rect fill="var(--dc3-region-be)" height="36" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="170" x="715" y="328"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="723" y="342">{{ s.s4a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="723" y="356">{{ s.s4b }}</text>
        <line :x1="PX.mgr + 8" :x2="PX.data - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="385" y2="385"/>
        <text :x="(PX.mgr + PX.data) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="377">
          {{ s.m4 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="36" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="150" x="905" y="402"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="913" y="416">{{ s.s5a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="913" y="430">{{ s.s5b }}</text>
        <line :x1="PX.data + 8" :x2="PX.ag - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="460" y2="460"/>
        <text :x="(PX.data + PX.ag) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="452">
          {{ s.m5 }}
        </text>
        <line :x1="PX.mgr + 8" :x2="PX.drv - 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="495" y2="495"/>
        <text :x="(PX.mgr + PX.drv) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="487">
          {{ s.m6 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="36" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="140" x="1075" y="512"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="1083" y="526">{{ s.s6a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="1083" y="540">{{ s.s6b }}</text>
        <line :x1="PX.drv - 8" :x2="PX.mgr + 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="570" y2="570"/>
        <text :x="(PX.mgr + PX.drv) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="562">
          {{ s.m7 }}
        </text>
        <line :x1="PX.drv - 8" :x2="PX.db + 8" marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="605" y2="605"/>
        <text :x="(PX.db + PX.drv) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="597">
          {{ s.m8 }}
        </text>

        <!-- bottom note -->
        <rect fill="var(--dc3-region-amber)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1180" x="60" y="636"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="76" y="656">{{ s.note1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="76" y="676">{{ s.note2 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="180"
              x="10" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="100" y="48">
          {{ s.db }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="100" y="64">{{ s.dbSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="170"
              x="215" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="300" y="48">
          {{ s.auth }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="300" y="64">{{ s.authSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="415" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="500" y="48">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="500" y="64">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="615" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="700" y="48">
          {{ s.mgr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="700" y="64">{{ s.mgrSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="810" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="890" y="48">
          {{ s.data }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="890" y="64">{{ s.dataSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="985" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1060" y="48">
          {{ s.ag }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1060" y="64">{{ s.agSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="140" x="1150" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1220" y="48">
          {{ s.drv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1220" y="64">{{ s.drvSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="60" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="709">{{ s.legDb }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="180" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="709">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="300" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="322" y="709">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="420" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="442" y="709">{{ s.legDrv }}</text>
        <line marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="550" x2="578" y1="706"
              y2="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="584" y="709">{{ s.legGo }}</text>
        <line marker-end="url(#svs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="700"
              x2="728" y1="706" y2="706"/>
        <text fill="var(--dc3-text2)" font-size="9" x="734" y="709">{{ s.legData }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
