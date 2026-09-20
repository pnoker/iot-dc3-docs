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
    aria: '四个 Compose 栈的叠加关系：底层 db 栈提供 dc3-postgres 与 dc3-rabbitmq 两个基础设施容器，是所有应用栈的依赖；其上 dev 栈与 app 栈二选一——dev 从本地 Dockerfile 现场构建网关与四个中心供调试，app 直接拉预构建镜像并附带前端与驱动容器用于评估与生产；optional 栈按需叠在最上层，提供 EMQX、ELK、Prometheus 与 Grafana 等可观测性组件；发布边界上生产形态只有 dc3-web（8080/8443）与 listening-virtual 驱动（6270）发布到宿主机，dev 栈为调试额外发布网关与各中心端口，其余一律只在 dc3net 内部',
    regOpt: 'STACK=optional · 可观测性（按需叠加，不影响核心链路）',
    regDev: 'STACK=dev · 源码构建',
    regApp: 'STACK=app · 预构建镜像',
    regDb: 'STACK=db · 基础设施（任何应用栈都依赖它先就绪）',
    regEdge: '宿主机发布边界',
    o1: 'EMQX', o1s: 'MQTT broker · Dashboard',
    o2: 'ELK', o2s: 'ES · Logstash · Kibana',
    o3: 'Prometheus + Grafana', o3s: '指标抓取 · 看板',
    o4: 'APM + Exporters', o4s: '接收端 · 指标导出',
    devBox: 'dc3-gateway + 四中心', devSub: 'auth / manager / data / agentic',
    devNote: '本地 Dockerfile 现场 build · 改代码重 build · 前端 pnpm dev 单独起',
    appBox: 'dc3-web + 网关 + 四中心 + 驱动组', appSub: 'dc3-driver-* 预置容器',
    appNote: '拉远端镜像 · 不编译 · 评估 / 演示 / 生产',
    xor: '二选一 (dev XOR app)',
    lblStack: 'make up STACK=optional 按需叠加',
    lblDepends: 'depends_on: service_healthy',
    db1: 'dc3-postgres', db1s: 'PG + AGE / TimescaleDB / pgvector —— 元数据 · 时序 · 告警 · 会话',
    db2: 'dc3-rabbitmq', db2s: '数据流 / 命令流消息总线',
    appHead: 'app 栈（生产形态）· 仅两项对外',
    p1: '★ dc3-web', p1s: ':8080 / :8443 前端反代网关',
    p2: '★ listening-virtual', p2s: 'TCP :6270 (6271 实际也按 TCP 发布)',
    devHead: 'dev 栈（调试便利 · 勿照搬到生产）',
    e1: '★ gateway + 四中心 HTTP', e1s: ':8000 · :8300-:8600',
    e2: '★ gRPC', e2s: 'auth :9300 · manager :9400 · data :9500',
    e3: '★ db 发布端口', e3s: ':35432 · :35672 · :15672',
    n1: '其余端口一律仅 dc3net 内部互访',
    n2: '默认绑定 DC3_BIND_HOST=127.0.0.1',
    n3: '跨机访问改 0.0.0.0 前先收敛端口',
    netLine: '共享网络 dc3net —— 容器别名互访: dc3-postgres · dc3-rabbitmq · dc3-elasticsearch · dc3-prometheus …',
    legOpt: 'optional 栈', legApp: '应用栈 (dev / app)', legDb: '基础设施',
    legBus: '消息总线', legPub: '对外发布端口', legEdge: '边界说明'
  },
  en: {
    aria: 'How the four Compose stacks layer: the db stack at the bottom provides dc3-postgres and dc3-rabbitmq as the dependency of every application stack; above it dev and app are mutually exclusive — dev builds the gateway and four centers from local Dockerfiles for debugging while app pulls prebuilt images with the web frontend and driver containers for evaluation and production; the optional stack layers on top on demand with EMQX, ELK, Prometheus and Grafana; at the publish boundary the production app stack exposes only dc3-web (8080/8443) and the listening-virtual driver (6270) to the host, the dev stack additionally publishes the gateway and center ports for debugging, and everything else stays inside dc3net',
    regOpt: 'STACK=optional · observability (layered on demand, core runs without it)',
    regDev: 'STACK=dev · source build',
    regApp: 'STACK=app · prebuilt images',
    regDb: 'STACK=db · infrastructure (every app stack waits for it)',
    regEdge: 'Host publish boundary',
    o1: 'EMQX', o1s: 'MQTT broker · Dashboard',
    o2: 'ELK', o2s: 'ES · Logstash · Kibana',
    o3: 'Prometheus + Grafana', o3s: 'metrics scrape · dashboards',
    o4: 'APM + Exporters', o4s: 'receiver · metric exporters',
    devBox: 'dc3-gateway + four centers', devSub: 'auth / manager / data / agentic',
    devNote: 'built from local Dockerfiles · rebuild after code changes · frontend via pnpm dev',
    appBox: 'dc3-web + gateway + centers + drivers', appSub: 'bundled dc3-driver-* containers',
    appNote: 'pulls remote images · no compile · eval / demo / production',
    xor: 'choose one (dev XOR app)',
    lblStack: 'make up STACK=optional, layered on demand',
    lblDepends: 'depends_on: service_healthy',
    db1: 'dc3-postgres', db1s: 'PG + AGE / TimescaleDB / pgvector — metadata · series · alarms · sessions',
    db2: 'dc3-rabbitmq', db2s: 'data / command message bus',
    appHead: 'app stack (production) · only two published',
    p1: '★ dc3-web', p1s: ':8080 / :8443 reverse-proxies gateway',
    p2: '★ listening-virtual', p2s: 'TCP :6270 (6271 also published as TCP)',
    devHead: 'dev stack (debug convenience · never copy to prod)',
    e1: '★ gateway + centers HTTP', e1s: ':8000 · :8300-:8600',
    e2: '★ gRPC', e2s: 'auth :9300 · manager :9400 · data :9500',
    e3: '★ db published ports', e3s: ':35432 · :35672 · :15672',
    n1: 'every other port stays inside dc3net',
    n2: 'default bind DC3_BIND_HOST=127.0.0.1',
    n3: 'switch to 0.0.0.0 only after pruning ports',
    netLine: 'Shared dc3net network — containers reach each other by alias: dc3-postgres · dc3-rabbitmq · dc3-elasticsearch · dc3-prometheus …',
    legOpt: 'optional stack', legApp: 'App stacks (dev / app)', legDb: 'Infrastructure',
    legBus: 'Message bus', legPub: 'Published ports', legEdge: 'Boundary note'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 720">
        <defs>
          <marker id="usd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="usd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#usd-grid)" height="100%" width="100%"/>

        <!-- regions: layered top to bottom -->
        <rect fill="var(--dc3-region-amber)" height="140" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="900" x="40" y="90"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="108">{{ s.regOpt }}</text>
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="430" x="40" y="290"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="308">{{ s.regDev }}</text>
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="430" x="510" y="290"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="522" y="308">{{ s.regApp }}</text>
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-db-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="900" x="40" y="510"/>
        <text fill="var(--dc3-db-stroke)" font-size="10" font-weight="600" x="52" y="528">{{ s.regDb }}</text>
        <rect fill="var(--dc3-region-amber)" height="550" rx="12" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="320" x="980" y="90"/>
        <text fill="var(--dc3-ext-stroke)" font-size="10" font-weight="600" x="992" y="108">{{ s.regEdge }}</text>

        <!-- stacking arrows -->
        <line marker-end="url(#usd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="255" x2="255" y1="232"
              y2="284"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="264" y="262">{{ s.lblStack }}</text>
        <line marker-end="url(#usd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="725" x2="725" y1="232"
              y2="284"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="734" y="262">{{ s.lblStack }}</text>
        <line marker-end="url(#usd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="255" x2="255" y1="462"
              y2="504"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="264" y="488">{{ s.lblDepends }}</text>
        <line marker-end="url(#usd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="725" x2="725" y1="462"
              y2="504"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="734" y="488">{{ s.lblDepends }}</text>
        <!-- XOR divider -->
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,4" stroke-width="1" x1="490" x2="490" y1="300"
              y2="450"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="490" y="282">{{ s.xor }}</text>

        <!-- optional nodes -->
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="64" y="130"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="164" y="152">
          {{ s.o1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="164" y="170">{{ s.o1s }}</text>
        <rect fill="var(--dc3-db-fill)" height="52" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="284" y="130"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="384" y="152">
          {{ s.o2 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="384" y="170">{{ s.o2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="504" y="130"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="604" y="152">
          {{ s.o3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="604" y="170">{{ s.o3s }}</text>
        <rect fill="var(--dc3-ext-fill)" height="52" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="724" y="130"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="824" y="152">
          {{ s.o4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="824" y="170">{{ s.o4s }}</text>

        <!-- dev stack -->
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="382"
              x="64" y="340"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="255" y="362">
          {{ s.devBox }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="255" y="380">{{ s.devSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="64" y="420">{{ s.devNote }}</text>

        <!-- app stack -->
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="382"
              x="534" y="340"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="725" y="362">
          {{ s.appBox }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="725" y="380">{{ s.appSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="534" y="420">{{ s.appNote }}</text>

        <!-- db stack -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="400"
              x="64" y="556"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="264" y="578">
          {{ s.db1 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="264" y="596">{{ s.db1s }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="400"
              x="504" y="556"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="704" y="578">
          {{ s.db2 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="704" y="596">{{ s.db2s }}</text>

        <!-- publish boundary -->
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="1000" y="140">{{ s.appHead }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="1000" y="152"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1140" y="170">
          {{ s.p1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1140" y="186">{{ s.p1s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="1000" y="204"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1140" y="222">
          {{ s.p2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1140" y="238">{{ s.p2s }}</text>
        <line stroke="var(--dc3-divider)" stroke-width="1" x1="1000" x2="1280" y1="262" y2="262"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="1000" y="286">{{ s.devHead }}</text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="1000" y="296"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1140" y="314">
          {{ s.e1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1140" y="330">{{ s.e1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="1000" y="348"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1140" y="366">
          {{ s.e2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1140" y="382">{{ s.e2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="1000" y="400"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1140" y="418">
          {{ s.e3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1140" y="434">{{ s.e3s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="76" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="280" x="1000" y="460"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="1012" y="482">{{ s.n1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1012" y="500">{{ s.n2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1012" y="518">{{ s.n3 }}</text>

        <!-- network line -->
        <text fill="var(--dc3-text2)" font-size="8.5" x="40" y="668">{{ s.netLine }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="60" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="703">{{ s.legOpt }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="200" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="703">{{ s.legApp }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="390" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="703">{{ s.legDb }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="520" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="542" y="703">{{ s.legBus }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="640" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="703">{{ s.legPub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="800" y="694"/>
        <text fill="var(--dc3-text2)" font-size="9" x="822" y="703">{{ s.legEdge }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
