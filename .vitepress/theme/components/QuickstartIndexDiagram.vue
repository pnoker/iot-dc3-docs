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
    aria: '本地开发五步流程与产出物：起 db 栈容器、source dev.env 指向 localhost 端口、构建 jar、起 dev 栈、跑测试；第二步依赖第一步的容器端口，第四步依赖第一步的 DB/MQ 与第三步的 jar；上方为先决条件，下方列出常见坑与上线密钥警示',
    regionPre: '先决条件 · 半容器模式（依赖在容器 · Java 在宿主机）',
    podName: 'Podman',
    podSub: '容器运行时',
    jdkName: 'JDK 21',
    jdkSub: '强制 · 低版本失败',
    mvnName: 'Maven 3.9+',
    mvnSub: '内置 settings.xml',
    pnpmName: 'pnpm',
    pnpmSub: '前端/CLI · 可跳过',
    lblContainer: '起容器',
    lblCompile: '编译',
    lblBuild: '构建',
    s1Name: '① make up-db',
    s1Sub: '起 db 栈容器',
    s1Sub2: 'PostgreSQL + RabbitMQ',
    s1Sub3: '国内源 up-db-cn',
    s2Name: '② source dev.env.sh',
    s2Sub: '导出本地变量',
    s2Sub2: 'POSTGRES_HOST=localhost',
    s2Sub3: '仅当前 shell 生效',
    s3Name: '③ make package',
    s3Sub: '多模块构建',
    s3Sub2: '产物 dc3-*.jar',
    s3Sub3: '不依赖容器',
    s4Name: '④ make up-dev',
    s4Sub: '起开发栈',
    s4Sub2: '网关 :8000 可登录',
    s4Sub3: 'Auth→…→Gateway 顺序',
    s5Name: '⑤ make test',
    s5Sub: '单元测试',
    s5Sub2: 'it 需容器 · e2e 后端',
    s5Sub3: '改完先跑兜底',
    lblPorts: '容器端口',
    lblVars: '变量就绪',
    lblJar: 'jar 就绪',
    lblStackUp: '栈已起',
    lblEnv: 'localhost 指向',
    lblDeps: 'DB/MQ 须就绪',
    artTitle: '产出物 · 下一步依赖上一步的产物',
    a1Name: 'PostgreSQL :35432',
    a1Sub: 'RabbitMQ :35672',
    a2Name: 'shell 变量',
    a2Sub: '仅当前 shell',
    a3Name: 'dc3-*.jar',
    a3Sub: '各服务可执行 jar',
    a4Name: '网关 :8000',
    a4Sub: '登录 token 12h',
    a5Name: 'unit 绿',
    a5Sub: 'it 另需容器',
    pit1: '常见坑：忘 source dev.env.sh · podman 未启 · 端口被占 · 首启 initdb 慢',
    pit2: '上线前必换 DC3_SECURITY_KEY / AUTH_HMAC_SECRET（Gateway fail-fast 拒绝启动）',
    legPre: '先决条件',
    legDocker: '容器 / 构建步骤',
    legEnv: '环境 / 验证',
    legStack: '起栈',
    legArt: '产出物'
  },
  en: {
    aria: 'Local development in five steps with artifacts: start the db stack, source dev.env to point at localhost ports, build the jars, bring up the dev stack and run tests; step two depends on step one ports, step four depends on step one DB/MQ and step three jars; prerequisites sit on top, common pitfalls and the secret-rotation warning at the bottom',
    regionPre: 'Prerequisites · semi-container mode (deps in containers · Java on host)',
    podName: 'Podman',
    podSub: 'container runtime',
    jdkName: 'JDK 21',
    jdkSub: 'required · older fails',
    mvnName: 'Maven 3.9+',
    mvnSub: 'settings.xml bundled',
    pnpmName: 'pnpm',
    pnpmSub: 'web/CLI · skippable',
    lblContainer: 'containers',
    lblCompile: 'compile',
    lblBuild: 'build',
    s1Name: '① make up-db',
    s1Sub: 'start db stack',
    s1Sub2: 'PostgreSQL + RabbitMQ',
    s1Sub3: 'CN mirror up-db-cn',
    s2Name: '② source dev.env.sh',
    s2Sub: 'export local vars',
    s2Sub2: 'POSTGRES_HOST=localhost',
    s2Sub3: 'current shell only',
    s3Name: '③ make package',
    s3Sub: 'multi-module build',
    s3Sub2: 'artifacts dc3-*.jar',
    s3Sub3: 'no containers needed',
    s4Name: '④ make up-dev',
    s4Sub: 'start dev stack',
    s4Sub2: 'gateway :8000 login',
    s4Sub3: 'Auth→…→Gateway order',
    s5Name: '⑤ make test',
    s5Sub: 'unit tests',
    s5Sub2: 'it needs runtime · e2e',
    s5Sub3: 'run first after edits',
    lblPorts: 'container ports',
    lblVars: 'vars ready',
    lblJar: 'jar ready',
    lblStackUp: 'stack up',
    lblEnv: 'localhost targets',
    lblDeps: 'DB/MQ must be up',
    artTitle: 'Artifacts · each step feeds the next',
    a1Name: 'PostgreSQL :35432',
    a1Sub: 'RabbitMQ :35672',
    a2Name: 'shell vars',
    a2Sub: 'current shell only',
    a3Name: 'dc3-*.jar',
    a3Sub: 'executable jars',
    a4Name: 'Gateway :8000',
    a4Sub: 'login token 12h',
    a5Name: 'unit green',
    a5Sub: 'it needs containers',
    pit1: 'Pitfalls: forgot to source dev.env.sh · podman down · ports busy · slow first initdb',
    pit2: 'Rotate DC3_SECURITY_KEY / AUTH_HMAC_SECRET before production (Gateway fail-fast)',
    legPre: 'Prerequisite',
    legDocker: 'Container / build step',
    legEnv: 'Env / verify',
    legStack: 'Stack up',
    legArt: 'Artifact'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 520">
        <defs>
          <marker id="qi-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="qi-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#qi-grid)" height="100%" width="100%"/>

        <!-- region: prerequisites -->
        <rect fill="var(--dc3-region-amber)" height="88" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1240" x="40" y="36"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="56">{{ s.regionPre }}</text>

        <!-- arrows: prerequisites feed the steps (drawn before nodes) -->
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="170"
              x2="170" y1="112" y2="146"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="180" y="134">{{ s.lblContainer }}</text>
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="410"
              x2="620" y1="112" y2="146"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="566" y="152">{{ s.lblCompile }}</text>
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="650"
              x2="655" y1="112" y2="146"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="666" y="134">{{ s.lblBuild }}</text>

        <!-- arrows: forward pipeline -->
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="272" x2="326" y1="200" y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="299" y="192">{{ s.lblPorts }}</text>
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="532" x2="586" y1="200" y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="559" y="192">{{ s.lblVars }}</text>
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="792" x2="846" y1="200" y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="819" y="192">{{ s.lblJar }}</text>
        <line marker-end="url(#qi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1052" x2="1106" y1="200"
              y2="200"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1079" y="192">{{ s.lblStackUp }}</text>

        <!-- arrows: long-range dependencies routed below the row -->
        <path d="M 430 252 L 430 292 L 880 292 L 880 254" fill="none" marker-end="url(#qi-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="655" y="284">{{ s.lblEnv }}</text>
        <path d="M 170 252 L 170 322 L 940 322 L 940 254" fill="none" marker-end="url(#qi-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="555" y="314">{{ s.lblDeps }}</text>

        <!-- nodes: prerequisites -->
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="70" y="66"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="170" y="84">{{
            s.podName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="170" y="98">{{ s.podSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="310" y="66"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="410" y="84">{{
            s.jdkName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="410" y="98">{{ s.jdkSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="550" y="66"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="650" y="84">{{
            s.mvnName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="650" y="98">{{ s.mvnSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="200"
              x="790" y="66"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="890" y="84">{{
            s.pnpmName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="890" y="98">{{ s.pnpmSub }}</text>

        <!-- nodes: five steps -->
        <rect fill="var(--dc3-amber-fill)" height="100" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="70" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12.5" font-weight="700" text-anchor="middle" x="170" y="178">{{
            s.s1Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="170" y="196">{{ s.s1Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="170" y="212">{{ s.s1Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="170" y="228">{{ s.s1Sub3 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="100" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="330" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="430" y="178">{{
            s.s2Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="430" y="196">{{ s.s2Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="430" y="212">{{ s.s2Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="430" y="228">{{ s.s2Sub3 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="100" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="590" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12.5" font-weight="700" text-anchor="middle" x="690" y="178">{{
            s.s3Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="690" y="196">{{ s.s3Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="690" y="212">{{ s.s3Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="690" y="228">{{ s.s3Sub3 }}</text>
        <rect fill="var(--dc3-be-fill)" height="100" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="850" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12.5" font-weight="700" text-anchor="middle" x="950" y="178">{{
            s.s4Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="196">{{ s.s4Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="212">{{ s.s4Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="950" y="228">{{ s.s4Sub3 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="100" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="1110" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12.5" font-weight="700" text-anchor="middle" x="1210" y="178">{{
            s.s5Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1210" y="196">{{ s.s5Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1210" y="212">{{ s.s5Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1210" y="228">{{ s.s5Sub3 }}</text>

        <!-- artifacts row -->
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" font-weight="600" x="70" y="352">{{ s.artTitle }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="70" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="170" y="382">{{
            s.a1Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="170" y="396">{{ s.a1Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="330" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="430" y="382">{{
            s.a2Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="430" y="396">{{ s.a2Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="590" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="690" y="382">{{
            s.a3Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="690" y="396">{{ s.a3Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="850" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="950" y="382">{{
            s.a4Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="950" y="396">{{ s.a4Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="48" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="1110" y="362"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1210" y="382">{{
            s.a5Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1210" y="396">{{ s.a5Sub }}</text>

        <!-- pitfalls + legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="70" y="436">{{ s.pit1 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="70" y="454">{{ s.pit2 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="70" y="486"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="495">{{ s.legPre }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="180" y="486"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="495">{{ s.legDocker }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="340" y="486"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="495">{{ s.legEnv }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="470" y="486"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="495">{{ s.legStack }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="560" y="486"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="495">{{ s.legArt }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
