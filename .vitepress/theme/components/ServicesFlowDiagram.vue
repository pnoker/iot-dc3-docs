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
    aria: '服务拓扑与健康依赖图：db 栈的 PostgreSQL 与 RabbitMQ 先行健康；应用栈内鉴权中心最先就绪，网关与管理中心依赖它，数据中心依赖管理中心，智能中心依赖数据中心，驱动只依赖管理中心并向其 gRPC 注册；Web 前端是宿主机唯一 HTTP 入口经 nginx 反代到网关',
    dbRegion: 'db 栈 docker-compose-db.yml · 先起并等健康',
    appRegion: '应用栈 docker-compose.yml · depends_on: condition: service_healthy',
    web: 'Web 前端 dc3-web',
    webS1: '8080 / 8443 · 对宿主机唯一发布的 HTTP',
    webS2: 'nginx 反代 → dc3-gateway:8000',
    pg: 'PostgreSQL + TimescaleDB', pgS1: ':5432 · pg_isready 健康检查',
    pgS2: 'pgvector · AGE',
    rb: 'RabbitMQ 消息总线', rbS1: ':5672 · rabbitmq-diagnostics ping',
    rbS2: '管理台 :15672 · MQTT :1883',
    auth: '鉴权中心 dc3-center-auth',
    authS1: 'HTTP 8300 · gRPC 9300',
    authS2: '无业务依赖 · 最先就绪',
    gw: 'dc3-gateway',
    gwS1: ':8000 · 唯一 API 聚合入口',
    gwS2: 'app 栈不发布到宿主机 · 承载 /mcp',
    mgr: '管理中心 dc3-center-manager',
    mgrS1: 'HTTP 8400 · gRPC 9400',
    mgrS2: '驱动 / 模板 / 设备 / 位号元数据',
    data: '数据中心 dc3-center-data',
    dataS1: 'HTTP 8500 · gRPC 9500',
    dataS2: '位号值落库 · 命令分发 · 告警',
    ag: '智能中心 dc3-center-agentic',
    agS1: 'HTTP 8600',
    agS2: 'Spring AI 会话 · 工具调用',
    drv: '协议驱动 dc3-driver-*',
    drvS1: '36 个协议适配容器',
    drvS2: '南向接设备 · 北向经 MQ',
    single: 'dc3-center-single',
    sgS1: 'HTTP 8100 · gRPC 9100',
    sgS2: '四中心合一进程',
    sgS3: 'dc3.facade.mode: local',
    sgS4: '本地开发 / 轻量部署',
    r1: 'nginx 反代', r2: 'gRPC 核验',
    r3: '位号值发布 (MQ)', r4: '消费 point_value',
    r5: 'JDBC',
    d12: 'depends_on 健康依赖', d3: 'depends_on', d4: 'depends_on · gRPC 注册',
    d5: 'depends_on',
    sgl: '部署拓扑', sgl2: '二选一',
    note1: 'app 栈对宿主机仅发布: Web 前端 8080/8443 与 listening-virtual 设备入站口 6270/6271; 网关 8000 仅 dev 栈发布',
    note2: '中心服务 readiness 探针带 base-path 前缀 (如 /auth/actuator/health/readiness), 网关不带; 驱动可与网关并行启动',
    legFe: '入口 / 单体', legSvc: '中心服务 / 驱动', legDb: 'PostgreSQL',
    legBus: 'RabbitMQ', legAuth: '鉴权中心', legDep: '健康依赖',
    legRun: '运行时连接'
  },
  en: {
    aria: 'Service topology with health dependencies: PostgreSQL and RabbitMQ in the db stack become healthy first; inside the app stack the auth center is ready first, gateway and manager depend on it, data depends on manager, agentic depends on data, and drivers depend only on manager where they register over gRPC; the web frontend is the only host HTTP entry reverse-proxying to the gateway',
    dbRegion: 'db stack docker-compose-db.yml · start first, wait healthy',
    appRegion: 'app stack docker-compose.yml · depends_on: condition: service_healthy',
    web: 'Web frontend dc3-web',
    webS1: '8080 / 8443 · only host-published HTTP',
    webS2: 'nginx reverse proxy → dc3-gateway:8000',
    pg: 'PostgreSQL + TimescaleDB', pgS1: ':5432 · pg_isready healthcheck',
    pgS2: 'pgvector · AGE',
    rb: 'RabbitMQ message bus', rbS1: ':5672 · rabbitmq-diagnostics ping',
    rbS2: 'mgmt :15672 · MQTT :1883',
    auth: 'Auth Center dc3-center-auth',
    authS1: 'HTTP 8300 · gRPC 9300',
    authS2: 'no business deps · ready first',
    gw: 'dc3-gateway',
    gwS1: ':8000 · sole API aggregation entry',
    gwS2: 'not host-published in app stack · serves /mcp',
    mgr: 'Manager Center dc3-center-manager',
    mgrS1: 'HTTP 8400 · gRPC 9400',
    mgrS2: 'driver / profile / device / point metadata',
    data: 'Data Center dc3-center-data',
    dataS1: 'HTTP 8500 · gRPC 9500',
    dataS2: 'value persist · command dispatch · alarms',
    ag: 'Agentic Center dc3-center-agentic',
    agS1: 'HTTP 8600',
    agS2: 'Spring AI sessions · tool calls',
    drv: 'Protocol drivers dc3-driver-*',
    drvS1: '36 protocol adapter containers',
    drvS2: 'southbound devices · northbound via MQ',
    single: 'dc3-center-single',
    sgS1: 'HTTP 8100 · gRPC 9100',
    sgS2: 'four centers in one process',
    sgS3: 'dc3.facade.mode: local',
    sgS4: 'local dev / light deployment',
    r1: 'nginx proxy', r2: 'gRPC verify',
    r3: 'publish values (MQ)', r4: 'consume point_value',
    r5: 'JDBC',
    d12: 'depends_on healthy', d3: 'depends_on', d4: 'depends_on · gRPC register',
    d5: 'depends_on',
    sgl: 'topology', sgl2: 'either / or',
    note1: 'app stack host-publishes only: web 8080/8443 and the listening-virtual device ports 6270/6271; gateway 8000 is published only in the dev stack',
    note2: 'center readiness probes carry a base-path prefix (e.g. /auth/actuator/health/readiness), the gateway does not; drivers may start in parallel with the gateway',
    legFe: 'Entry / single', legSvc: 'Centers / drivers', legDb: 'PostgreSQL',
    legBus: 'RabbitMQ', legAuth: 'Auth center', legDep: 'Health dependency',
    legRun: 'Runtime connection'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1400 720">
        <defs>
          <marker id="svf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="svf-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="svf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#svf-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="230" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="320" x="40" y="210"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="228">{{ s.dbRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="560" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="740" x="420" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="432" y="82">{{ s.appRegion }}</text>

        <!-- runtime arrows (solid) -->
        <path d="M362,140 L500,140 L500,218" fill="none" marker-end="url(#svf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="406" y="132">{{ s.r1 }}</text>
        <path d="M642,250 L670,250 L670,158 L696,158" fill="none" marker-end="url(#svf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="664" y="244">{{ s.r2 }}</text>
        <path d="M1050,584 L1050,604 L410,604 L410,395 L344,395" fill="none" marker-end="url(#svf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="700" y="598">{{ s.r3 }}</text>
        <path d="M698,420 L424,420 L424,350 L344,350" fill="none" marker-end="url(#svf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="560" y="414">{{ s.r4 }}</text>
        <path d="M948,280 L940,280 L940,330 L424,330 L424,290 L344,290" fill="none" marker-end="url(#svf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="680" y="324">{{ s.r5 }}</text>

        <!-- health-dependency arrows (amber dashed) -->
        <path d="M698,140 L540,140 L540,218" fill="none" marker-end="url(#svf-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="545" y="132">{{ s.d12 }}</text>
        <path d="M922,140 L1050,140 L1050,218" fill="none" marker-end="url(#svf-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="955" y="132">{{ s.d3 }}</text>
        <path d="M1050,304 L1050,332 L810,332 L810,358" fill="none" marker-end="url(#svf-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="935" y="326">{{ s.d3 }}</text>
        <path d="M1010,304 L1010,498" fill="none" marker-end="url(#svf-ah-amber)" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="1020" y="410">{{ s.d4 }}</text>
        <path d="M698,432 L620,432 L620,498" fill="none" marker-end="url(#svf-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="655" y="452">{{ s.d5 }}</text>

        <!-- single topology link -->
        <line stroke="var(--dc3-fe-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="1162" x2="1198" y1="300"
              y2="300"/>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="1180" y="292">{{ s.sgl }}</text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="1180" y="314">{{ s.sgl2 }}</text>

        <!-- db stack nodes -->
        <rect fill="var(--dc3-db-fill)" height="76" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="280"
              x="60" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="200" y="274">
          {{ s.pg }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="200" y="294">{{ s.pgS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="200" y="310">{{ s.pgS2 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="76" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="280"
              x="60" y="346"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="200" y="370">
          {{ s.rb }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="200" y="390">{{ s.rbS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="200" y="406">{{ s.rbS2 }}</text>

        <!-- app stack nodes -->
        <rect fill="var(--dc3-rose-fill)" height="84" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="220"
              x="700" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="810" y="118">
          {{ s.auth }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="810" y="138">{{ s.authS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="810" y="154">{{ s.authS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="810" y="170">readiness /auth/actuator/…
        </text>
        <rect fill="var(--dc3-be-fill)" height="84" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="440" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="540" y="242">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="540" y="262">{{ s.gwS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="540" y="278">{{ s.gwS2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="84" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="950" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1050" y="242">
          {{ s.mgr }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="262">{{ s.mgrS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="278">{{ s.mgrS2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="84" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="700" y="360"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="810" y="382">
          {{ s.data }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="810" y="402">{{ s.dataS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="810" y="418">{{ s.dataS2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="84" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="440" y="500"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="540" y="522">
          {{ s.ag }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="540" y="542">{{ s.agS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="540" y="558">{{ s.agS2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="84" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="950" y="500"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1050" y="522">
          {{ s.drv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="542">{{ s.drvS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="558">{{ s.drvS2 }}</text>

        <!-- web entry -->
        <rect fill="var(--dc3-fe-fill)" height="84" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="60" y="90"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="210" y="114">
          {{ s.web }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="210" y="136">{{ s.webS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="210" y="154">{{ s.webS2 }}</text>

        <!-- single monolith -->
        <rect fill="var(--dc3-fe-fill)" height="150" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="1200" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1290" y="244">
          {{ s.single }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1290" y="266">{{ s.sgS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1290" y="286">{{ s.sgS2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1290" y="306">{{ s.sgS3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1290" y="326">{{ s.sgS4 }}</text>

        <!-- notes strip -->
        <rect fill="var(--dc3-region-amber)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1340" x="40" y="624"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="644">{{ s.note1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="56" y="664">{{ s.note2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="40" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="703">{{ s.legFe }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="703">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="310" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="703">{{ s.legDb }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="440" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="703">{{ s.legBus }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="570" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="592" y="703">{{ s.legAuth }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="700" x2="728" y1="700"
              y2="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="734" y="703">{{ s.legDep }}</text>
        <line marker-end="url(#svf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="850" x2="878" y1="700"
              y2="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="884" y="703">{{ s.legRun }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
