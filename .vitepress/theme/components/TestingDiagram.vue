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
    aria: '后端测试金字塔三层：底层单元测试最多最快（Surefire，JUnit 5、Mockito、AssertJ、StepVerifier，不启动 Spring 上下文）；中层集成测试用 Testcontainers 拉起真实 PostgreSQL/TimescaleDB、RabbitMQ 与 MQTT 验证跨组件协作（Failsafe 执行 *IT.java）；顶层 E2E 最少最慢，验证端到端业务链路且默认关闭，由 DC3_E2E 环境变量门禁显式启用；覆盖率由 JaCoCo 聚合把关（行覆盖 20%、分支 15%，低于即阻断），CI 上 ci/test/e2e 三个工作流与本地命令一一对应',
    l1: 'E2E 测试', l1a: '端到端业务链路 · 最少最慢',
    l1b: '命令下发 · 事件路由 · 时序表操作',
    l2: '集成测试', l2a: '真实基础设施 · 跨组件协作',
    l2b: 'Testcontainers: PG/Timescale · RabbitMQ · MQTT',
    l2c: 'gRPC InProcess · Failsafe 执行 *IT.java',
    l3: '单元测试', l3a: '孤立业务逻辑 · 不启动 Spring 上下文',
    l3b: 'JUnit 5 · Mockito 5 · AssertJ',
    l3c: 'Reactor StepVerifier 验证响应式',
    c1: 'make test-e2e', c1a: 'DC3_E2E=true 门禁 (@EnabledIfEnvironmentVariable)',
    c1b: 'dc3-e2e 模块 · 共享 Docker 网络',
    c2: 'make test-it', c2a: 'Failsafe · 需容器运行时 (podman/Docker)',
    c2b: 'dc3-common-test 复用单例容器与 harness',
    c3: 'make test', c3a: 'Surefire · 毫秒级 · 无需容器',
    c3b: '改 bug 先写能复现的回归测试再修复',
    lblLeader: '命令与门禁',
    axis1: '▲ 越往下越多、越快、越独立      ▼ 越往上越少、越慢、越接近真实链路',
    axis2: '选层判断: 能不碰外部依赖用单元 · 非真容器不可复现才上集成 · 验证整条链路才动 E2E',
    regGate: '门禁与 CI · GitHub Actions',
    cov: 'JaCoCo 覆盖率门禁', covS: 'line ≥ 20% · branch ≥ 15% · make coverage',
    ci1: 'ci.yml', ci1s: 'push / PR · 快速编译',
    ci2: 'test.yml', ci2s: '单元 + 集成 + 覆盖率',
    ci3: 'e2e.yml', ci3s: 'E2E · push / 手动触发',
    lblReport: 'JaCoCo 聚合', lblGate: '低于门槛即阻断合并',
    legE2e: 'E2E 层', legIt: '集成 / CI', legUnit: '单元层', legCov: '覆盖率门禁', legDash: '聚合 / 阻断关系'
  },
  en: {
    aria: 'The backend testing pyramid: the unit base is the largest and fastest (Surefire with JUnit 5, Mockito, AssertJ and StepVerifier, no Spring context); the integration middle uses Testcontainers to bring up real PostgreSQL/TimescaleDB, RabbitMQ and MQTT for cross-component behavior (Failsafe runs *IT.java); the E2E top is the smallest and slowest, covers end-to-end flows and stays off by default behind the DC3_E2E gate; JaCoCo aggregates coverage with 20% line and 15% branch minimums blocking merges below them, and the ci/test/e2e GitHub workflows mirror the local commands one-to-one',
    l1: 'E2E tests', l1a: 'end-to-end flows · fewest, slowest',
    l1b: 'command dispatch · event routing · time-series ops',
    l2: 'Integration tests', l2a: 'real infrastructure · cross-component',
    l2b: 'Testcontainers: PG/Timescale · RabbitMQ · MQTT',
    l2c: 'gRPC InProcess · Failsafe runs *IT.java',
    l3: 'Unit tests', l3a: 'isolated logic · no Spring context',
    l3b: 'JUnit 5 · Mockito 5 · AssertJ',
    l3c: 'Reactor StepVerifier for reactive code',
    c1: 'make test-e2e', c1a: 'DC3_E2E=true gate (@EnabledIfEnvironmentVariable)',
    c1b: 'dc3-e2e module · shared Docker network',
    c2: 'make test-it', c2a: 'Failsafe · needs a container runtime',
    c2b: 'dc3-common-test reuses singleton containers',
    c3: 'make test', c3a: 'Surefire · milliseconds · no containers',
    c3b: 'reproduce a bug with a failing test before fixing',
    lblLeader: 'command & gate',
    axis1: '▲ down: more, faster, isolated      ▲ up: fewer, slower, closer to production',
    axis2: 'pick a layer: unit when no external deps · integration only when real containers are required · E2E only for whole-chain verification',
    regGate: 'Gates & CI · GitHub Actions',
    cov: 'JaCoCo coverage gate', covS: 'line ≥ 20% · branch ≥ 15% · make coverage',
    ci1: 'ci.yml', ci1s: 'push / PR · quick build',
    ci2: 'test.yml', ci2s: 'unit + integration + coverage',
    ci3: 'e2e.yml', ci3s: 'E2E · push / manual',
    lblReport: 'JaCoCo aggregate', lblGate: 'below thresholds blocks merge',
    legE2e: 'E2E layer', legIt: 'Integration / CI', legUnit: 'Unit layer', legCov: 'Coverage gate', legDash: 'Aggregate / gate relation'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 660">
        <defs>
          <marker id="tsg-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="tsg-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#tsg-grid)" height="100%" width="100%"/>

        <!-- gate region -->
        <rect fill="var(--dc3-region-be)" height="110" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1220" x="40" y="480"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="498">{{ s.regGate }}</text>

        <!-- leader lines from layers to command callouts -->
        <line marker-end="url(#tsg-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="585"
              x2="894" y1="148" y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="742" y="132">{{ s.lblLeader }}</text>
        <line marker-end="url(#tsg-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="645"
              x2="894" y1="245" y2="245"/>
        <line marker-end="url(#tsg-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="765"
              x2="894" y1="358" y2="358"/>
        <!-- unit layer feeds the coverage report -->
        <line marker-end="url(#tsg-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="460"
              x2="254" y1="434" y2="512"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="330" y="478">{{ s.lblReport }}</text>
        <!-- coverage gate blocks CI merge -->
        <line marker-end="url(#tsg-ah)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="736" y1="546" y2="546"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="572" y="538">{{ s.lblGate }}</text>

        <!-- pyramid layers -->
        <polygon fill="var(--dc3-rose-fill)" points="385,100 535,100 625,190 295,190" stroke="var(--dc3-rose-stroke)"
                 stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" text-anchor="middle" x="460" y="138">
          {{ s.l1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="460" y="158">{{ s.l1a }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="460" y="174">{{ s.l1b }}</text>
        <polygon fill="var(--dc3-be-fill)" points="295,190 625,190 740,300 180,300" stroke="var(--dc3-be-stroke)"
                 stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12.5" text-anchor="middle" x="460" y="226">
          {{ s.l2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="460" y="248">{{ s.l2a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="460" y="266">{{ s.l2b }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="460" y="284">{{ s.l2c }}</text>
        <polygon fill="var(--dc3-fe-fill)" points="180,300 740,300 880,430 40,430" stroke="var(--dc3-fe-stroke)"
                 stroke-width="1.5"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="13" text-anchor="middle" x="460" y="346">
          {{ s.l3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="460" y="370">{{ s.l3a }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="460" y="388">{{ s.l3b }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="460" y="406">{{ s.l3c }}</text>

        <!-- axis notes -->
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" text-anchor="middle" x="470" y="454">{{ s.axis1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="470" y="470">{{ s.axis2 }}</text>

        <!-- command callouts -->
        <rect fill="var(--dc3-rose-fill)" height="76" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="360"
              x="900" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1080" y="134">
          {{ s.c1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1080" y="152">{{ s.c1a }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1080" y="168">{{ s.c1b }}</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="360"
              x="900" y="210"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1080" y="234">
          {{ s.c2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1080" y="252">{{ s.c2a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1080" y="268">{{ s.c2b }}</text>
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="360"
              x="900" y="320"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1080" y="344">
          {{ s.c3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1080" y="362">{{ s.c3a }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1080" y="378">{{ s.c3b }}</text>

        <!-- gates -->
        <rect fill="var(--dc3-db-fill)" height="60" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="340"
              x="64" y="516"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="234" y="540">
          {{ s.cov }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="234" y="560">{{ s.covS }}</text>
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="740" y="516"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="865" y="540">
          {{ s.ci2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="865" y="560">{{ s.ci2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="60" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="1010" y="516"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1135" y="540">
          {{ s.ci3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1135" y="560">{{ s.ci3s }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" x="470" y="566">{{ s.ci1 }} · {{ s.ci1s }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="629">{{ s.legUnit }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="180" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="629">{{ s.legIt }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="310" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="629">{{ s.legE2e }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="420" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="442" y="629">{{ s.legCov }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="580" x2="608" y1="626" y2="626"/>
        <text fill="var(--dc3-text2)" font-size="9" x="614" y="629">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
