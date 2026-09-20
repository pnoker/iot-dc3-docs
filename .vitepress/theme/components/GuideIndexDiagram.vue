<!--
  - Copyright 2016-present the IoT DC3 original author or authors.
  - Licensed under AGPL-3.0. See LICENSE.
  -->
<script lang="ts" setup>
import {computed} from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), {lang: 'zh'})

const DICT = {
  zh: {
    aria: '部署运维全貌：本地开发路线由 db 栈提供 PostgreSQL 与 RabbitMQ、dev 栈发布网关 8000 供宿主 Java 调试；容器化路线的 app 栈全容器编排、对外仅 Web 8080/8443 反代；optional 可观测栈可叠加在任意栈上；生产部署沿单机 Compose、Swarm、Kubernetes、Helm 演进并做上线加固；日志规范、故障排查与 .env 边界横切支撑',
    regionLocal: '本地开发路线 · quickstart 负责',
    regionContainer: '容器化部署路线 · usage 负责',
    dbName: 'db 栈 · 最小依赖',
    dbSub: 'PostgreSQL + RabbitMQ',
    dbSub2: 'make up-db(-cn)',
    devName: 'dev 栈 · 开发调试',
    devSub: '网关 :8000 宿主可达',
    devSub2: 'make up-dev(-cn)',
    lblDepend: '依赖底座',
    noteLocal: 'Java 在宿主机 · source dc3/env/dev.env.sh',
    appName: 'app 栈 · 全容器',
    appSub: '网关 + 四中心 + 驱动',
    appSub2: '对外仅 Web 8080/8443',
    webName: 'Web 前端',
    webSub: 'nginx 反代 → 内部网关',
    webSub2: ':8080 / :8443',
    lblProxy: '反代',
    noteApp: 'app 栈不发布 8000 · 宿主验证走 dev 栈',
    optName: 'optional 栈 · 可观测（叠加）',
    optSub: 'EMQX · ELK · Prometheus · Grafana',
    optSub2: 'make up-optional',
    lblStack: '叠加',
    chainTitle: '生产部署路径 · deployment',
    composeName: '单机 Compose',
    composeSub: '起步',
    swarmName: 'Docker Swarm',
    swarmSub: '多机',
    k8sName: 'Kubernetes',
    k8sSub: '编排',
    helmName: 'Helm',
    helmSub: 'Charts',
    lblEvolve: '演进',
    hardName: '生产加固',
    hardSub: '密钥必换 · fail-fast',
    lblBefore: '上线前',
    supportTitle: '横切支持 · 栈起来之后',
    logName: '日志规范 logging',
    logSub: '彩色控制台 + 滚动 JSON',
    trbName: '故障排查 troubleshooting',
    trbSub: '端口 · DB/MQ · 401/403 · 驱动注册',
    envName: '.env 只给 Compose 插值',
    envSub: '本地 Java 用 dev.env(.sh) 指向 localhost',
    legFe: '前端入口',
    legBe: '容器栈',
    legDb: '数据栈',
    legAmber: '可观测 / 流程',
    legRose: '加固 / 排查'
  },
  en: {
    aria: 'Deployment and ops overview: the local-dev route runs on the db stack (PostgreSQL + RabbitMQ) with the dev stack exposing gateway 8000 for host-side Java; the containerized app stack runs everything in containers with only Web 8080/8443 proxied outward; the optional observability stack overlays any of them; production evolves from single-host Compose through Swarm and Kubernetes to Helm with hardening before launch; logging, troubleshooting and the .env boundary support everything',
    regionLocal: 'Local dev route · owned by quickstart',
    regionContainer: 'Containerized route · owned by usage',
    dbName: 'db stack · minimal deps',
    dbSub: 'PostgreSQL + RabbitMQ',
    dbSub2: 'make up-db(-cn)',
    devName: 'dev stack · debugging',
    devSub: 'gateway :8000 on host',
    devSub2: 'make up-dev(-cn)',
    lblDepend: 'foundation',
    noteLocal: 'Java on host · source dc3/env/dev.env.sh',
    appName: 'app stack · all containers',
    appSub: 'gateway + 4 centers + drivers',
    appSub2: 'only Web 8080/8443 exposed',
    webName: 'Web frontend',
    webSub: 'nginx proxy → internal gateway',
    webSub2: ':8080 / :8443',
    lblProxy: 'proxy',
    noteApp: 'app stack never publishes 8000 · verify via dev stack',
    optName: 'optional stack · observability (overlay)',
    optSub: 'EMQX · ELK · Prometheus · Grafana',
    optSub2: 'make up-optional',
    lblStack: 'overlay',
    chainTitle: 'Production path · deployment',
    composeName: 'Compose',
    composeSub: 'single host',
    swarmName: 'Docker Swarm',
    swarmSub: 'multi-host',
    k8sName: 'Kubernetes',
    k8sSub: 'orchestration',
    helmName: 'Helm',
    helmSub: 'Charts',
    lblEvolve: 'evolve',
    hardName: 'Hardening',
    hardSub: 'rotate secrets · fail-fast',
    lblBefore: 'before launch',
    supportTitle: 'Cross-cutting support · after the stack is up',
    logName: 'Logging',
    logSub: 'colored console + rolling JSON',
    trbName: 'Troubleshooting',
    trbSub: 'ports · DB/MQ · 401/403 · driver register',
    envName: '.env is for Compose only',
    envSub: 'local Java uses dev.env(.sh) → localhost',
    legFe: 'Frontend entry',
    legBe: 'Container stack',
    legDb: 'Data stack',
    legAmber: 'Observability / process',
    legRose: 'Hardening / troubleshooting'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 560">
        <defs>
          <marker id="gi-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="gi-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="gi-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#gi-grid)" height="100%" width="100%"/>

        <!-- regions: two routes -->
        <rect fill="var(--dc3-region-be)" height="310" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="310" x="40" y="60"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="80">{{ s.regionLocal }}</text>
        <rect fill="var(--dc3-region-be)" height="310" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="310" x="950" y="60"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="962" y="80">{{ s.regionContainer }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="195" x2="195" y1="202" y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="205" y="238">{{ s.lblDepend }}</text>
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1105" x2="1105" y1="268"
              y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1115" y="240">{{ s.lblProxy }}</text>
        <line marker-end="url(#gi-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="428" x2="354" y1="160" y2="160"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="390" y="152">{{ s.lblStack }}</text>
        <line marker-end="url(#gi-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="772" x2="946" y1="160" y2="160"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="860" y="152">{{ s.lblStack }}</text>
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="542" x2="562" y1="292" y2="292"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="552" y="284">{{ s.lblEvolve }}</text>
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="678" x2="698" y1="292" y2="292"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="688" y="284">{{ s.lblEvolve }}</text>
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="804" x2="834" y1="292" y2="292"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="819" y="284">{{ s.lblEvolve }}</text>
        <line marker-end="url(#gi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="870" x2="870" y1="322" y2="350"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="880" y="340">{{ s.lblBefore }}</text>

        <!-- node: db stack -->
        <rect fill="var(--dc3-db-fill)" height="80" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="262"
              x="64" y="120"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="195" y="146">{{
            s.dbName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="195" y="164">{{ s.dbSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="195" y="180">{{ s.dbSub2 }}</text>

        <!-- node: dev stack -->
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="262"
              x="64" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="195" y="296">{{
            s.devName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="195" y="314">{{ s.devSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="195" y="330">{{ s.devSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="64" y="356">{{ s.noteLocal }}</text>

        <!-- node: app stack -->
        <rect fill="var(--dc3-be-fill)" height="80" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="262"
              x="974" y="120"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1105" y="146">{{
            s.appName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1105" y="164">{{ s.appSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1105" y="180">{{ s.appSub2 }}</text>

        <!-- node: web frontend -->
        <rect fill="var(--dc3-fe-fill)" height="80" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="262"
              x="974" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1105" y="296">{{
            s.webName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1105" y="314">{{ s.webSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1105" y="330">{{ s.webSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="974" y="356">{{ s.noteApp }}</text>

        <!-- node: optional observability stack -->
        <rect fill="var(--dc3-amber-fill)" height="80" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="340" x="430" y="120"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="600" y="146">{{
            s.optName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="600" y="164">{{ s.optSub }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="600" y="180">{{ s.optSub2 }}</text>

        <!-- production path chain -->
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="430" y="250">{{ s.chainTitle }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="110"
              x="430" y="264"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="485" y="286">{{
            s.composeName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="485" y="302">{{ s.composeSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="110"
              x="566" y="264"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="621" y="286">{{
            s.swarmName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="621" y="302">{{ s.swarmSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="100"
              x="702" y="264"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="752" y="286">{{
            s.k8sName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="752" y="302">{{ s.k8sSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="96"
              x="838" y="264"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="886" y="286">{{
            s.helmName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="886" y="302">{{ s.helmSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="60" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="140" x="800" y="352"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="870" y="374">{{
            s.hardName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="870" y="392">{{ s.hardSub }}</text>

        <!-- cross-cutting support -->
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="64" y="420">{{ s.supportTitle }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="64" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="204" y="454">{{
            s.logName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="204" y="472">{{ s.logSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="380" x="404" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="594" y="454">{{
            s.trbName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="594" y="472">{{ s.trbSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="406" x="834" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1037" y="454">{{
            s.envName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1037" y="472">{{ s.envSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="70" y="520"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="529">{{ s.legFe }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="180" y="520"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="529">{{ s.legBe }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="280" y="520"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="529">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="390" y="520"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="529">{{ s.legAmber }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="540" y="520"/>
        <text fill="var(--dc3-text2)" font-size="9" x="562" y="529">{{ s.legRose }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
