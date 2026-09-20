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
    aria: '本地起不来连不上的排障决策树：先确认 PostgreSQL 与 RabbitMQ 依赖容器 healthy；再确认本地 Java 进程已 source dc3/env/dev.env.sh 加载环境变量（根 .env 只服务 Compose）；再排查端口占用（Address already in use，用 lsof 或 Get-NetTCPConnection 找 PID）；再核对启动顺序 Auth → Manager → Data → Agentic → Gateway → Driver；最后检查取盐换 token 后的三个鉴权头与网关 HMAC 密钥；五关皆过则读日志关键字定位根因',
    startT: '起不来 / 连不上', startS: 'API 经网关 8000 · 中心 gRPC · 驱动走 RabbitMQ',
    entryLbl: '症状入口', railLbl: '按序自上而下排除',
    q1a: '依赖容器', q1b: 'healthy ?',
    q2a: '环境变量', q2b: '已加载 ?',
    q3a: '端口', q3b: '未占用 ?',
    q4a: '启动顺序', q4b: '正确 ?',
    q5a: '鉴权头', q5b: '三件套齐 ?',
    yes: '是', no: '否',
    r1t: '依赖未就绪', r1a: 'Connection refused · Channel shutdown · vhost not found',
    r1b: 'make ps STACK=db 等 healthy · 核对 host 端口 35432 / 35672',
    r2t: '连接指向错误主机', r2a: '根 .env 只服务 Compose，改它对本地 Java 不生效',
    r2b: 'source dc3/env/dev.env.sh · IDE 用 EnvFile 挂 dc3/env/dev.env',
    r3t: '端口被占用', r3a: 'Address already in use · Web server failed to start',
    r3b: 'lsof / ss / netstat / Get-NetTCPConnection 找 PID → kill 或覆盖端口',
    r4t: '启动顺序错', r4a: 'gRPC UNAVAILABLE · 驱动注册失败 · 下游拿不到上游',
    r4b: 'Auth → Manager → Data → Agentic → Gateway → Driver，每起一个等就绪',
    r5t: '鉴权失败 401 / 403', r5a: '取盐 → 换 token → 带 X-Auth-Tenant / Login / Token',
    r5b: '网关跳 HMAC: AUTH_HMAC_SECRET —— pre/pro 弱密钥直接 fail-fast',
    finalT: '日志关键字定位 —— 前四关排掉后，根因几乎都在日志里',
    finalK1: 'Connection refused / Channel shutdown —— 依赖或 vhost 连不通',
    finalK2: 'Address already in use —— 端口冲突，按 PID 处理',
    finalK3: 'Driver register failed on attempt n/30 —— 注册重试中，查 CENTER_MANAGER_HOST',
    finalK4: 'UnknownHostException / pre·pro fail-fast —— 本地源码调试一律用 dev profile',
    noteA: '顺序不是随意的: 变量没加载会让所有连接指向错误主机，端口占用让进程在绑定阶段就退出，',
    noteB: '而启动顺序决定 gRPC facade 与驱动注册能否成功 —— 先排前四关，剩下的几乎都能在日志关键字里看到根因',
    legSym: '症状入口', legDec: '判定', legRoot: '根因与处理',
    legDone: '解析终点', legOrder: '排查顺序'
  },
  en: {
    aria: 'Troubleshooting decision tree for a local stack that will not start or connect: first confirm the PostgreSQL and RabbitMQ dependency containers are healthy; then confirm the local Java process loaded dc3/env/dev.env.sh (the root .env only serves Compose); then check for port conflicts (Address already in use, find the PID with lsof or Get-NetTCPConnection); then verify the boot order Auth → Manager → Data → Agentic → Gateway → Driver; finally check the three auth headers after the salt/token handshake and the gateway HMAC secret; with all five gates passed, hunt the root cause in log keywords',
    startT: 'Won\'t start / can\'t connect', startS: 'API via gateway 8000 · centers gRPC · drivers RabbitMQ',
    entryLbl: 'symptom entry', railLbl: 'eliminate top-down, in order',
    q1a: 'dependency', q1b: 'containers healthy?',
    q2a: 'environment', q2b: 'vars loaded?',
    q3a: 'ports', q3b: 'not taken?',
    q4a: 'boot order', q4b: 'correct?',
    q5a: 'auth headers', q5b: 'all three present?',
    yes: 'yes', no: 'no',
    r1t: 'Dependencies not ready', r1a: 'Connection refused · Channel shutdown · vhost not found',
    r1b: 'make ps STACK=db, wait healthy · check host ports 35432 / 35672',
    r2t: 'Wrong target host', r2a: 'the root .env only serves Compose, local Java never sees it',
    r2b: 'source dc3/env/dev.env.sh · or load dc3/env/dev.env via the IDE EnvFile plugin',
    r3t: 'Port already in use', r3a: 'Address already in use · Web server failed to start',
    r3b: 'lsof / ss / netstat / Get-NetTCPConnection to find the PID → kill or override the port',
    r4t: 'Wrong boot order', r4a: 'gRPC UNAVAILABLE · driver registration fails · downstream starves',
    r4b: 'Auth → Manager → Data → Agentic → Gateway → Driver, wait for each to be ready',
    r5t: 'Auth failed 401 / 403', r5a: 'fetch salt → exchange token → send X-Auth-Tenant / Login / Token',
    r5b: 'gateway hop HMAC: AUTH_HMAC_SECRET — weak keys fail-fast on pre/pro',
    finalT: 'Hunt log keywords — with the four gates cleared, the cause is almost always in the logs',
    finalK1: 'Connection refused / Channel shutdown — dependency or vhost unreachable',
    finalK2: 'Address already in use — port conflict, handle by PID',
    finalK3: 'Driver register failed on attempt n/30 — retrying, check CENTER_MANAGER_HOST',
    finalK4: 'UnknownHostException / pre·pro fail-fast — local source debugging always uses the dev profile',
    noteA: 'The order matters: unloaded vars point every connection at the wrong host, a taken port kills the process at bind time,',
    noteB: 'and boot order decides whether gRPC facades and driver registration succeed — clear the four gates first, then read the keywords',
    legSym: 'Symptom entry', legDec: 'Decision', legRoot: 'Root cause & fix',
    legDone: 'Resolution end', legOrder: 'Check order'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const CX = 340
const ROWS = [160, 272, 384, 496, 608]
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 848">
        <defs>
          <marker id="tsd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="tsd-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="tsd-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="tsd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#tsd-grid)" height="100%" width="100%"/>

        <!-- order rail -->
        <line marker-end="url(#tsd-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="80" x2="80" y1="126" y2="636"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" text-anchor="middle" x="80" y="114">{{ s.railLbl }}
        </text>

        <!-- spine arrows (entry + yes branches) -->
        <line marker-end="url(#tsd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="340" x2="340" y1="104"
              y2="126"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="348" y="118">{{ s.entryLbl }}</text>
        <line v-for="(cy, i) in ROWS" :key="'yes' + i" marker-end="url(#tsd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1" x1="340" x2="340" :y1="cy + 36" :y2="cy + 76"/>
        <text v-for="(cy, i) in ROWS.slice(0, 4)" :key="'yeslbl' + i" fill="var(--dc3-arrow-label)" font-size="8"
              x="348" :y="cy + 60">{{ s.yes }}</text>
        <line marker-end="url(#tsd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="340" x2="340" y1="642"
              y2="656"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="348" y="652">{{ s.yes }}</text>

        <!-- no branches to root-cause boxes -->
        <line v-for="(cy, i) in ROWS" :key="'no' + i" marker-end="url(#tsd-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="394" x2="556" :y1="cy" :y2="cy"/>
        <text v-for="(cy, i) in ROWS" :key="'nolbl' + i" fill="var(--dc3-rose-stroke)" font-size="8" x="400"
              :y="cy - 6">{{ s.no }}</text>

        <!-- start node -->
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5" width="240"
              x="220" y="56"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11.5" text-anchor="middle" x="340" y="78">
          {{ s.startT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="340" y="94">{{ s.startS }}</text>

        <!-- diamonds -->
        <g v-for="(cy, i) in ROWS" :key="'dia' + i">
          <polygon :points="`${CX},${cy - 32} ${CX + 52},${cy} ${CX},${cy + 32} ${CX - 52},${cy}`"
                   fill="var(--dc3-ext-fill)" stroke="var(--dc3-ext-stroke)" stroke-width="1"/>
          <text fill="var(--dc3-box-name)" font-size="8" font-weight="600" text-anchor="middle" x="340" :y="cy - 3">
            {{ s['q' + (i + 1) + 'a'] }}
          </text>
          <text fill="var(--dc3-box-name)" font-size="8" font-weight="600" text-anchor="middle" x="340" :y="cy + 11">
            {{ s['q' + (i + 1) + 'b'] }}
          </text>
        </g>

        <!-- root cause boxes -->
        <g v-for="(cy, i) in ROWS" :key="'root' + i">
          <rect fill="var(--dc3-rose-fill)" height="76" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
                width="660" x="560" :y="cy - 46"/>
          <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="600" x="576" :y="cy - 22">
            {{ s['r' + (i + 1) + 't'] }}
          </text>
          <text fill="var(--dc3-text2)" font-size="8" x="576" :y="cy - 4">{{ s['r' + (i + 1) + 'a'] }}</text>
          <text fill="var(--dc3-text2)" font-size="8" x="576" :y="cy + 14">{{ s['r' + (i + 1) + 'b'] }}</text>
        </g>

        <!-- final node: keyword cheatsheet -->
        <rect fill="var(--dc3-be-fill)" height="96" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="1000"
              x="220" y="660"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" x="240" y="682">{{ s.finalT }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="240" y="702">{{ s.finalK1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="240" y="718">{{ s.finalK2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="240" y="734">{{ s.finalK3 }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="240" y="748">{{ s.finalK4 }}</text>

        <!-- why this order -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1000" x="220" y="768"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="236" y="784">{{ s.noteA }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="236" y="800">{{ s.noteB }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="820"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="829">{{ s.legSym }}</text>
        <polygon fill="var(--dc3-ext-fill)" points="200,815 214,823 200,831 186,823" stroke="var(--dc3-ext-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="829">{{ s.legDec }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="310" y="820"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="829">{{ s.legRoot }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="470" y="820"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="829">{{ s.legDone }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="640" x2="668" y1="826"
              y2="826"/>
        <text fill="var(--dc3-text2)" font-size="9" x="674" y="829">{{ s.legOrder }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
