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
    aria: '可观测性可选栈两条管道：日志侧核心栈把 JSON 文件日志写入共享 logs 卷，Logstash 挂载同卷解析打标后写入 Elasticsearch（内部 9200，堆由 DC3_ES_JAVA_OPTS 调整），人在 Kibana 5601 检索；指标侧各服务经 Micrometer 暴露 Prometheus 端点，连同 postgres-exporter 与 nginx-exporter 一并被 Prometheus（内部 9090，保留 7 天）周期抓取，Grafana 3000 以它为数据源画看板；EMQX 提供 MQTT 接入（31883）与 Dashboard（18083），APM 需 optional 栈的接收容器与核心栈的 APM_AGENT_ENABLE 双重开关齐备才有数据',
    regCore: '核心栈（被观测对象） · dev 或 app',
    regLogs: 'Logs · ELK 管道（日志检索）',
    regMetrics: 'Metrics · Prometheus（指标看板）',
    regOpt: '可选接入 · MQTT 与 APM',
    core: 'dc3-web · gateway · auth / manager / data / agentic · drivers',
    coreS: 'make up STACK=dev|app —— 崩了不影响核心链路，只是少了观测',
    tagMetric: 'Micrometer 指标端点', tagMetricS: '/actuator/prometheus',
    tagLogs: 'JSON 文件日志', tagLogsS: '写入共享 logs 卷',
    L1: 'logs 卷', L1s: 'Docker 共享卷',
    L2: 'Logstash', L2s: '解析 · 打标',
    L3: 'Elasticsearch', L3s: '内部 :9200 · ES_JAVA_OPTS',
    L4: 'Kibana', L4s: '★ :5601 检索',
    lblRead: '读取', lblWrite: '写入', lblSearch: '检索',
    E1: 'postgres-exporter', E1s: '数据库指标',
    E2: 'nginx-exporter', E2s: '前端 nginx 指标',
    P1: 'Prometheus', P1s: '内部 :9090 · 保留 7d',
    G1: 'Grafana', G1s: '★ :3000 · GF_SERVER_ROOT_URL',
    lblScrape: '抓取', lblDs: '数据源',
    lblScrapeM: '周期抓取 /prometheus',
    lblVolume: 'JSON 文件落卷',
    M1: 'EMQX', M1s: 'MQTT ★ :31883 · Dashboard ★ :18083',
    A1: 'dc3-apm', A1s: '接收端 · 随 ELK 起 · 内部',
    A2: 'APM Agent (核心栈)', A2s: 'APM_AGENT_ENABLE=true 才挂载',
    lblOtlp: 'OTLP 上报',
    n1a: '双重开关: ① apm 容器 (optional 栈)',
    n1b: '② agent 开关 (核心栈) —— 两者齐备才有数据',
    legHuman: '人的入口 (★ = 宿主机发布)', legPipe: '采集 / 监控组件',
    legStore: '存储引擎', legSvc: '平台服务 / Exporter', legVol: '共享卷', legOpt: '可选链路'
  },
  en: {
    aria: 'Two pipelines of the optional observability stack: on the logs side the core stack writes JSON file logs into the shared logs volume, Logstash mounts the same volume, parses and tags events into Elasticsearch (internal 9200, heap sized by DC3_ES_JAVA_OPTS) and humans search them in Kibana on 5601; on the metrics side each service exposes Micrometer Prometheus endpoints which, together with postgres-exporter and nginx-exporter, are scraped periodically by Prometheus (internal 9090, 7-day retention) while Grafana on 3000 dashboards on top of it; EMQX provides MQTT access (31883) and its dashboard (18083), and APM data only flows when both the optional-stack receiver container and the core-stack APM_AGENT_ENABLE switch are present',
    regCore: 'Core stack (observed) · dev or app',
    regLogs: 'Logs · ELK pipeline (log search)',
    regMetrics: 'Metrics · Prometheus (dashboards)',
    regOpt: 'Optional attach · MQTT & APM',
    core: 'dc3-web · gateway · auth / manager / data / agentic · drivers',
    coreS: 'make up STACK=dev|app — if it dies the core link still runs, you just lose the view',
    tagMetric: 'Micrometer endpoints', tagMetricS: '/actuator/prometheus',
    tagLogs: 'JSON file logs', tagLogsS: 'into the shared logs volume',
    L1: 'logs volume', L1s: 'shared Docker volume',
    L2: 'Logstash', L2s: 'parse · tag',
    L3: 'Elasticsearch', L3s: 'internal :9200 · ES_JAVA_OPTS',
    L4: 'Kibana', L4s: '★ :5601 search',
    lblRead: 'read', lblWrite: 'write', lblSearch: 'search',
    E1: 'postgres-exporter', E1s: 'database metrics',
    E2: 'nginx-exporter', E2s: 'frontend nginx metrics',
    P1: 'Prometheus', P1s: 'internal :9090 · 7d retention',
    G1: 'Grafana', G1s: '★ :3000 · GF_SERVER_ROOT_URL',
    lblScrape: 'scrape', lblDs: 'data source',
    lblScrapeM: 'periodic scrape /prometheus',
    lblVolume: 'JSON files land in the volume',
    M1: 'EMQX', M1s: 'MQTT ★ :31883 · Dashboard ★ :18083',
    A1: 'dc3-apm', A1s: 'receiver · starts with ELK · internal',
    A2: 'APM Agent (core stack)', A2s: 'mounted only when APM_AGENT_ENABLE=true',
    lblOtlp: 'OTLP report',
    n1a: 'Double switch: ① apm container (optional stack)',
    n1b: '② agent flag (core stack) — data flows only when both are on',
    legHuman: 'Human entry (★ = published)', legPipe: 'Collection / monitoring',
    legStore: 'Storage engine', legSvc: 'Platform services / exporters', legVol: 'Shared volume', legOpt: 'Optional link'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 600">
        <defs>
          <marker id="obs-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="obs-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="obs-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#obs-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="100" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="60"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="78">{{ s.regCore }}</text>
        <rect fill="var(--dc3-region-amber)" height="170" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="780" x="40" y="190"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="208">{{ s.regLogs }}</text>
        <rect fill="var(--dc3-region-amber)" height="170" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="440" x="860" y="190"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="872" y="208">{{ s.regMetrics }}
        </text>
        <rect fill="var(--dc3-region-be)" height="140" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="400"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="418">{{ s.regOpt }}</text>

        <!-- arrows -->
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="216" x2="252" y1="278"
              y2="278"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="234" y="270">{{ s.lblRead }}</text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="426" x2="462" y1="278"
              y2="278"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="444" y="270">{{ s.lblWrite }}</text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="656" x2="692" y1="278"
              y2="278"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="674" y="270">{{ s.lblSearch }}
        </text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1062" x2="1088" y1="250"
              y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="1075" y="242">{{ s.lblScrape }}
        </text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1062" x2="1088" y1="304"
              y2="272"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="1058" y="296">{{ s.lblScrape }}
        </text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1185" x2="1185" y1="276"
              y2="290"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="1193" y="288">{{ s.lblDs }}</text>
        <line marker-end="url(#obs-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="786" x2="1184" y1="142" y2="224"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="985" y="176">{{ s.lblScrapeM }}
        </text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1085" x2="152" y1="142"
              y2="242"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="810" y="166">{{ s.lblVolume }}
        </text>
        <line marker-end="url(#obs-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="658" x2="604" y1="476"
              y2="476"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="631" y="468">{{ s.lblOtlp }}</text>

        <!-- core stack -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="560"
              x="64" y="92"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="344" y="114">
          {{ s.core }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="344" y="132">{{ s.coreS }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="250" x="660" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="785" y="116">
          {{ s.tagMetric }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="785" y="132">{{ s.tagMetricS }}</text>
        <rect fill="var(--dc3-bus-fill)" height="48" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="290"
              x="940" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1085" y="116">
          {{ s.tagLogs }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="1085" y="132">{{ s.tagLogsS }}</text>

        <!-- ELK -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="150"
              x="64" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="139" y="272">
          {{ s.L1 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="139" y="290">{{ s.L1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="170" x="254" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="339" y="272">
          {{ s.L2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="339" y="290">{{ s.L2s }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="190"
              x="464" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="559" y="272">
          {{ s.L3 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="559" y="290">{{ s.L3s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="120"
              x="694" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="754" y="272">
          {{ s.L4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="754" y="290">{{ s.L4s }}</text>

        <!-- Prometheus / Grafana -->
        <rect fill="var(--dc3-be-fill)" height="44" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="880" y="228"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="970" y="246">
          {{ s.E1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="970" y="262">{{ s.E1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="44" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="880" y="282"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="970" y="300">
          {{ s.E2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="970" y="316">{{ s.E2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="190" x="1090" y="228"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1185" y="248">
          {{ s.P1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1185" y="264">{{ s.P1s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="1090" y="292"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1185" y="312">
          {{ s.G1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1185" y="328">{{ s.G1s }}</text>

        <!-- EMQX / APM -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="280"
              x="64" y="448"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="204" y="470">
          {{ s.M1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="204" y="488">{{ s.M1s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="402" y="448"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="502" y="470">
          {{ s.A1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="502" y="488">{{ s.A1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="660" y="448"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="780" y="470">
          {{ s.A2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="780" y="488">{{ s.A2s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="72" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="320" x="940" y="440"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" x="956" y="464">{{ s.n1a }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="956" y="484">{{ s.n1b }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="568"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="577">{{ s.legHuman }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="290" y="568"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="577">{{ s.legPipe }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="450" y="568"/>
        <text fill="var(--dc3-text2)" font-size="9" x="472" y="577">{{ s.legStore }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="600" y="568"/>
        <text fill="var(--dc3-text2)" font-size="9" x="622" y="577">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="790" y="568"/>
        <text fill="var(--dc3-text2)" font-size="9" x="812" y="577">{{ s.legVol }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3" stroke-width="1" x1="920" x2="948" y1="574"
              y2="574"/>
        <text fill="var(--dc3-text2)" font-size="9" x="954" y="577">{{ s.legOpt }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
