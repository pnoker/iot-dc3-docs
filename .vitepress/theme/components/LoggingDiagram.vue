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
    aria: '日志从代码到检索的完整链路：业务代码用 SLF4J 写稳定事件名与参数化占位符，MDC 为 traceId、tenantId、userId 预留槽位（当前尚未接线），可选 @Logs 切面做声明式日志；dc3-common-log 的 logback.xml 在 root 上同时挂彩色控制台 Appender 与 JSON 文件 Appender（含 mdc 与 stackTrace 字段），文件按大小与时间滚动；容器运行时接管 stdout/stderr 并以 json-file 驱动轮转，Logstash 从共享 logs 卷读取解析后写入 Elasticsearch，最终在 Kibana 按字段检索；密钥与 token 绝不明文落日志',
    regA: '应用进程内 · 业务代码只写稳定事件与结构化参数',
    regB: '容器与采集 · stdout 归容器运行时接管',
    red1: '脱敏红线: 密钥 / token / 密码 / 原始载荷绝不明文落日志',
    red2: '只记派生信息: tokenPrefix · tokenLen · valueLen · 资源 ID',
    s1: 'log.info / warn / error', s1s: '稳定事件名 + {} 参数 · 不拼接',
    s2: 'MDC', s2s: 'traceId / tenantId / userId (预留槽位)',
    s3: '@Logs AOP', s3s: '声明式 · value/type/tag/save · 可选',
    mdc1: '已规划未接线: 全仓尚无 MDC.put,',
    mdc2: '现阶段 JSON 的 mdc 项实际为空 —— 需关联字段作为消息参数显式传入',
    core: 'dc3-common-log', coreS: 'logback.xml · root=INFO · 框架噪声压 WARN',
    lblSlf4j: 'SLF4J', lblMdc: 'mdc 槽位', lblAop: '切面拦截',
    lblRoot: 'root 同时挂两个 Appender',
    ap1: 'Console Appender', ap1s: '彩色 · 本地人读',
    ap2: 'File JSON Appender', ap2s: 'logstash encoder · mdc / stackTrace',
    lblRoll: '滚动',
    roll1: 'SizeAndTimeBased 滚动:',
    roll2: '200MB × 30 文件 · 上限 20GB · .gz 归档',
    c1: '容器 stdout / stderr', c1s: '进程标准输出被容器运行时接管',
    c2: 'json-file 轮转', c2s: 'max-size 10M × max-file 20 ≈ 每容器 200M',
    c3: 'Logstash', c3s: '挂载共享 logs 卷 · 解析打标',
    c4: 'Elasticsearch', c4s: '内部 :9200 · DC3_ES_JAVA_OPTS 调堆',
    c5: 'Kibana :5601', c5s: '按字段检索 · tenantId 暂只能全文匹配',
    lblCapture: '捕获', lblPull: '读 logs 卷', lblIndex: '写索引', lblQuery: '查询',
    lblStdout: 'stdout', lblVolume: 'logs 卷共享',
    note: '两套轮转独立生效: logback 管容器内 LOG_FILE 滚动文件 · DC3_LOG_MAX_SIZE / DC3_LOG_MAX_FILE (根 .env, Compose-only) 管容器运行时捕获的 stdout —— 生产采集通常以后者为源',
    legCode: '业务代码 / 人的入口', legLog: '日志 SDK 与输出', legOps: '容器与采集',
    legStore: '存储引擎', legPolicy: '策略说明', legRed: '红线 / 未接线'
  },
  en: {
    aria: 'The full log path from code to search: business code writes stable event names with SLF4J parameterized placeholders, MDC reserves slots for traceId, tenantId and userId (not wired yet), and the optional @Logs aspect adds declarative logging; the dc3-common-log logback.xml hangs both a colored console appender and a JSON file appender (with mdc and stackTrace fields) on root, with size-and-time based rolling; the container runtime captures stdout/stderr and rotates them via the json-file driver, Logstash reads the shared logs volume and indexes into Elasticsearch, and Kibana provides field-level search; secrets and tokens are never logged in plaintext',
    regA: 'Inside the app process · code writes stable events and structured params',
    regB: 'Container & collection · stdout owned by the runtime',
    red1: 'Redaction red line: keys / tokens / passwords / raw payloads never logged',
    red2: 'Log derived facts only: tokenPrefix · tokenLen · valueLen · resource IDs',
    s1: 'log.info / warn / error', s1s: 'stable event name + {} params · no concat',
    s2: 'MDC', s2s: 'traceId / tenantId / userId (reserved slots)',
    s3: '@Logs AOP', s3s: 'declarative · value/type/tag/save · optional',
    mdc1: 'Planned but not wired: no MDC.put anywhere yet;',
    mdc2: 'the JSON mdc field is empty today — pass correlation fields as message params',
    core: 'dc3-common-log', coreS: 'logback.xml · root=INFO · framework noise at WARN',
    lblSlf4j: 'SLF4J', lblMdc: 'mdc slots', lblAop: 'aspect',
    lblRoot: 'root hangs both appenders',
    ap1: 'Console Appender', ap1s: 'colored · for humans locally',
    ap2: 'File JSON Appender', ap2s: 'logstash encoder · mdc / stackTrace',
    lblRoll: 'rolling',
    roll1: 'SizeAndTimeBased rolling:',
    roll2: '200MB × 30 files · 20GB cap · .gz archives',
    c1: 'Container stdout / stderr', c1s: 'captured by the container runtime',
    c2: 'json-file rotation', c2s: 'max-size 10M × max-file 20 ≈ 200M per container',
    c3: 'Logstash', c3s: 'mounts the shared logs volume · parses & tags',
    c4: 'Elasticsearch', c4s: 'internal :9200 · heap via DC3_ES_JAVA_OPTS',
    c5: 'Kibana :5601', c5s: 'field search · tenantId is full-text only for now',
    lblCapture: 'capture', lblPull: 'read logs volume', lblIndex: 'index', lblQuery: 'query',
    lblStdout: 'stdout', lblVolume: 'logs volume shared',
    note: 'Two independent rotations: logback rolls the in-container LOG_FILE files while DC3_LOG_MAX_SIZE / DC3_LOG_MAX_FILE (root .env, Compose-only) bound the runtime-captured stdout — production collection usually feeds on the latter',
    legCode: 'Code / human entry', legLog: 'Log SDK & output', legOps: 'Container & collection',
    legStore: 'Storage engine', legPolicy: 'Policy note', legRed: 'Red line / not wired'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 660">
        <defs>
          <marker id="lgd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="lgd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#lgd-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="480" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="760" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regA }}</text>
        <rect fill="var(--dc3-region-amber)" height="480" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="470" x="830" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="842" y="82">{{ s.regB }}</text>

        <!-- arrows: sources to core -->
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="266" x2="376" y1="190"
              y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="292" y="190">{{ s.lblSlf4j }}</text>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="266" x2="376" y1="264"
              y2="224"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="286" y="248">{{ s.lblMdc }}</text>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="266" x2="376" y1="340"
              y2="244"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="286" y="302">{{ s.lblAop }}</text>
        <!-- core to appenders -->
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="480" x2="480" y1="246" y2="368"/>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="435" x2="660" y1="370" y2="370"/>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="435" x2="435" y1="370"
              y2="396"/>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="660" x2="660" y1="370"
              y2="396"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="494" y="362">{{ s.lblRoot }}</text>
        <!-- file appender rolling -->
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="670" x2="670" y1="456"
              y2="468"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="678" y="466">{{ s.lblRoll }}</text>
        <!-- console to container stdout -->
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="532" x2="846" y1="412"
              y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="676" y="268">{{ s.lblStdout }}</text>
        <!-- file appender feeds Logstash via the shared volume -->
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="782"
              x2="846" y1="430" y2="302"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="770" y="372">{{ s.lblVolume }}</text>
        <!-- collection chain -->
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1065" x2="1065" y1="162"
              y2="186"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1073" y="178">{{ s.lblCapture }}</text>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1065" x2="1065" y1="246"
              y2="268"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1073" y="262">{{ s.lblPull }}</text>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1065" x2="1065" y1="328"
              y2="350"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1073" y="344">{{ s.lblIndex }}</text>
        <line marker-end="url(#lgd-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1065" x2="1065" y1="410"
              y2="432"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1073" y="426">{{ s.lblQuery }}</text>

        <!-- red line -->
        <rect fill="var(--dc3-rose-fill)" height="40" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="712" x="64" y="96"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" x="76" y="112">{{ s.red1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="76" y="128">{{ s.red2 }}</text>

        <!-- source nodes -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="64" y="160"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="164" y="182">
          {{ s.s1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="164" y="200">{{ s.s1s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="64" y="236"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="164" y="258">
          {{ s.s2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="164" y="276">{{ s.s2s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="64" y="312"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="164" y="334">
          {{ s.s3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="164" y="352">{{ s.s3s }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="64" y="398">{{ s.mdc1 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="64" y="412">{{ s.mdc2 }}</text>

        <!-- core -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="200"
              x="380" y="180"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="480" y="206">
          {{ s.core }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="480" y="226">{{ s.coreS }}</text>

        <!-- appenders -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="340" y="400"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="435" y="422">
          {{ s.ap1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="435" y="440">{{ s.ap1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="560" y="400"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="670" y="422">
          {{ s.ap2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="670" y="440">{{ s.ap2s }}</text>
        <rect fill="var(--dc3-ext-fill)" height="52" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="220" x="560" y="470"/>
        <text fill="var(--dc3-text2)" font-size="8" x="572" y="490">{{ s.roll1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="572" y="506">{{ s.roll2 }}</text>

        <!-- collection chain -->
        <rect fill="var(--dc3-ext-fill)" height="52" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="430"
              x="850" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1065" y="132">
          {{ s.c1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1065" y="150">{{ s.c1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="430" x="850" y="190"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1065" y="212">
          {{ s.c2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1065" y="230">{{ s.c2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="430" x="850" y="272"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1065" y="294">
          {{ s.c3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1065" y="312">{{ s.c3s }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="430"
              x="850" y="354"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1065" y="376">
          {{ s.c4 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1065" y="394">{{ s.c4s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="430"
              x="850" y="436"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1065" y="458">
          {{ s.c5 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1065" y="476">{{ s.c5s }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1260" x="40" y="566"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="590">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="637">{{ s.legCode }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="240" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="262" y="637">{{ s.legLog }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="400" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="637">{{ s.legOps }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="560" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="637">{{ s.legStore }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="710" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="732" y="637">{{ s.legPolicy }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="860" y="628"/>
        <text fill="var(--dc3-text2)" font-size="9" x="882" y="637">{{ s.legRed }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
