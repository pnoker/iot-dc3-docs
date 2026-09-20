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
    aria: '三套环境变量文件的分工与边界：仓库内的 .env.example 复制为根目录 .env，仅供 Docker Compose 对 docker-compose*.yml 做变量插值，只有 compose 显式引用的变量才进入容器，容器之间用 dc3-postgres:5432 这类服务名互访；dc3/env/dev.env 供 IDE EnvFile 插件、dc3/env/dev.env.sh 供 shell source，二者内容相同，把本地 Java 进程指向 Compose 发布在 localhost 的端口（35432、35672）；两条路径互不注入——根 .env 不进本地 Java 进程，dev.env 也不被 Compose 读取',
    tplT: '.env.example', tplS: '仓库内模板',
    cpLbl: 'cp 复制',
    envT: '.env (根目录)', envS: '本机未跟踪 · Compose 插值',
    devT: 'dc3/env/dev.env', devS: 'IDE EnvFile 插件 · 无 export',
    devsT: 'dc3/env/dev.env.sh', devsS: 'Shell source · 带 export',
    sameContent: '同内容 · 两种注入方式',
    regCompose: 'Compose 路径 · 容器世界',
    regJava: '本地 Java 路径 · 宿主机世界',
    dividerLbl: '互不注入 —— 两条路径互不交叉',
    c1: 'podman compose / make', c1s: 'docker-compose*.yml 变量插值',
    c2: '容器服务', c2s: '仅 environment / env_file 显式引用的变量注入',
    c3: '容器内互访', c3s: 'dc3-postgres:5432 · dc3-rabbitmq:5672',
    j1: 'IDE / java -jar', j1s: 'Run Config 挂 EnvFile 或 shell 环境',
    j2: '本地 Java 进程', j2s: 'auth / manager / data / agentic / driver',
    j3: '经发布端口接入', j3s: 'localhost:35432 · localhost:35672',
    lblInterp: '插值渲染', lblResolve: '服务名解析',
    lblInject: '环境变量注入', lblLocalhost: '指向 localhost',
    srcCompose: 'Compose 插值源', srcEnvfile: 'EnvFile 插件', srcSource: 'source 加载',
    lblInternal: '容器别名互访', lblHost: '★ localhost 发布端口',
    pgT: 'dc3-postgres', pgInt: 'internal: dc3-postgres:5432', pgHost: 'host ★ localhost:35432',
    mqT: 'dc3-rabbitmq', mqInt: 'internal: dc3-rabbitmq:5672', mqHost: 'host ★ localhost:35672',
    note1: '根 .env 不会自动注入本地 Java 进程 —— 在里面写 POSTGRES_HOST=localhost 不影响任何容器，也不会被 IDE 读到',
    note2: 'dc3/env/dev.env(.sh) 不被 Compose 读取 —— 两套文件用途不同，不是同一个文件，别互相复制',
    legJava: '本地 Java 路径', legCompose: 'Compose 路径', legCtr: '容器服务',
    legDep: '依赖容器', legTpl: '模板文件', legRed: '边界 / 禁区'
  },
  en: {
    aria: 'Division of labor and boundaries across the three env-file sets: the in-repo .env.example is copied to the root .env which only serves Docker Compose interpolation of docker-compose*.yml — only variables explicitly referenced enter containers, and containers reach each other by service names like dc3-postgres:5432; dc3/env/dev.env feeds the IDE EnvFile plugin while dc3/env/dev.env.sh is for shell sourcing, identical content in two injection styles, pointing local Java processes at the ports Compose publishes on localhost (35432, 35672); the two paths never inject into each other — the root .env never reaches a local JVM and dev.env is never read by Compose',
    tplT: '.env.example', tplS: 'in-repo template',
    cpLbl: 'cp copy',
    envT: '.env (repo root)', envS: 'untracked · Compose interpolation',
    devT: 'dc3/env/dev.env', devS: 'IDE EnvFile plugin · no export',
    devsT: 'dc3/env/dev.env.sh', devsS: 'Shell source · with export',
    sameContent: 'same content · two injection styles',
    regCompose: 'Compose path · container world',
    regJava: 'Local Java path · host world',
    dividerLbl: 'no cross injection — the two paths never meet',
    c1: 'podman compose / make', c1s: 'interpolates docker-compose*.yml',
    c2: 'container services', c2s: 'only explicitly referenced vars are injected',
    c3: 'in-container access', c3s: 'dc3-postgres:5432 · dc3-rabbitmq:5672',
    j1: 'IDE / java -jar', j1s: 'Run Config EnvFile or shell env',
    j2: 'local Java process', j2s: 'auth / manager / data / agentic / driver',
    j3: 'via published ports', j3s: 'localhost:35432 · localhost:35672',
    lblInterp: 'interpolate', lblResolve: 'service-name DNS',
    lblInject: 'env injection', lblLocalhost: 'points at localhost',
    srcCompose: 'Compose interpolation source', srcEnvfile: 'EnvFile plugin', srcSource: 'source load',
    lblInternal: 'container aliases', lblHost: '★ localhost published ports',
    pgT: 'dc3-postgres', pgInt: 'internal: dc3-postgres:5432', pgHost: 'host ★ localhost:35432',
    mqT: 'dc3-rabbitmq', mqInt: 'internal: dc3-rabbitmq:5672', mqHost: 'host ★ localhost:35672',
    note1: 'The root .env never reaches a local JVM — writing POSTGRES_HOST=localhost there changes no container and is never read by the IDE',
    note2: 'dc3/env/dev.env(.sh) is never read by Compose — the two sets serve different purposes, they are not the same file, do not copy between them',
    legJava: 'Local Java path', legCompose: 'Compose path', legCtr: 'Container services',
    legDep: 'Dependency containers', legTpl: 'Template file', legRed: 'Boundary / forbidden'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 660">
        <defs>
          <marker id="evd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="evd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#evd-grid)" height="100%" width="100%"/>

        <!-- path regions -->
        <rect fill="var(--dc3-region-amber)" height="300" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="560" x="40" y="170"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="188">{{ s.regCompose }}
        </text>
        <rect fill="var(--dc3-region-be)" height="300" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="660" x="640" y="170"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="652" y="188">{{ s.regJava }}</text>

        <!-- boundary divider -->
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,4" stroke-width="1" x1="610" x2="610" y1="64"
              y2="470"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" text-anchor="middle" x="610" y="58">
          {{ s.dividerLbl }}
        </text>

        <!-- file to path arrows -->
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="252" x2="296" y1="96" y2="96"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="274" y="88">{{ s.cpLbl }}</text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="400" x2="190" y1="126" y2="216"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="296" y="178">{{ s.srcCompose }}</text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="938" x2="800" y1="126"
              y2="216"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="830" y="154">{{ s.srcEnvfile }}
        </text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1203" x2="850" y1="126"
              y2="216"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="960" y="150">{{ s.srcSource }}
        </text>

        <!-- path internal arrows -->
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="189" x2="189" y1="272"
              y2="296"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="197" y="288">{{ s.lblInterp }}</text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="189" x2="189" y1="352"
              y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="197" y="368">{{ s.lblResolve }}</text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="789" x2="789" y1="272"
              y2="296"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="797" y="288">{{ s.lblInject }}</text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="789" x2="789" y1="352"
              y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="797" y="368">{{ s.lblLocalhost }}</text>

        <!-- both worlds reach the same containers -->
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="150" x2="300" y1="436"
              y2="480"/>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="820" y1="436"
              y2="480"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="310" y="468">{{ s.lblInternal }}
        </text>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="700" x2="540" y1="436"
              y2="480"/>
        <line marker-end="url(#evd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="860" x2="1020" y1="436"
              y2="480"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="910" y="468">{{ s.lblHost }}</text>

        <!-- file nodes -->
        <rect fill="var(--dc3-ext-fill)" height="52" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="210"
              x="40" y="70"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="145" y="92">
          {{ s.tplT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="145" y="110">{{ s.tplS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="300" y="70"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="400" y="92">
          {{ s.envT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="400" y="110">{{ s.envS }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1070" y="62">{{ s.sameContent }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="820" y="70"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="940" y="92">
          {{ s.devT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="940" y="110">{{ s.devS }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="230"
              x="1090" y="70"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1205" y="92">
          {{ s.devsT }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1205" y="110">{{ s.devsS }}</text>

        <!-- compose path nodes -->
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="250" x="64" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="189" y="242">
          {{ s.c1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="189" y="260">{{ s.c1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="64" y="300"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="189" y="322">
          {{ s.c2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="189" y="340">{{ s.c2s }}</text>
        <rect fill="var(--dc3-db-fill)" height="52" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="250"
              x="64" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="189" y="402">
          {{ s.c3 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7" text-anchor="middle" x="189" y="420">{{ s.c3s }}</text>

        <!-- local java path nodes -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="664" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="789" y="242">
          {{ s.j1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="789" y="260">{{ s.j1s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="664" y="300"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="789" y="322">
          {{ s.j2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="789" y="340">{{ s.j2s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="664" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="789" y="402">
          {{ s.j3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="789" y="420">{{ s.j3s }}</text>

        <!-- dependency containers (shared by both worlds) -->
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.5" width="420"
              x="200" y="484"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="410" y="506">
          {{ s.pgT }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" x="220" y="532">{{ s.pgInt }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="600" y="532">{{ s.pgHost }}</text>
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="420" x="700" y="484"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="910" y="506">
          {{ s.mqT }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" x="720" y="532">{{ s.mqInt }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="1100" y="532">{{ s.mqHost }}</text>

        <!-- note -->
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1260" x="40" y="566"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="56" y="584">{{ s.note1 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="56" y="600">{{ s.note2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="643">{{ s.legJava }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="210" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="232" y="643">{{ s.legCompose }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="360" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="643">{{ s.legCtr }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="490" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="512" y="643">{{ s.legDep }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="640" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="643">{{ s.legTpl }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,4" stroke-width="1" x1="790" x2="818" y1="640"
              y2="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="824" y="643">{{ s.legRed }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
