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
    aria: 'AIoT 应用层闭环：感知采集归一位号值流，理解层用规则与模型产出异常与预测，决策层给出建议或命令（高风险写动作须人工确认），行动层下发命令回写物理世界并告警通知，追溯层以命令回执与审计回放校准基线、重训模型，形成感知—理解—决策—行动—追溯的闭环',
    region: 'AIoT 应用层 · 感知—理解—决策—行动—追溯 闭环',
    senseT: '① 感知',
    senseS1: '端 / 边缘采集',
    senseS2: '归一化位号值流 · 事件流',
    underT: '② 理解',
    underS1: '规则托底 + 模型补强',
    underS2: '统计 · ML · 大模型 RAG',
    decideT: '③ 决策',
    decideS1: '越界 / 异常 / 预测 → 建议',
    decideS2: '高风险写动作须人工确认',
    actT: '④ 行动',
    actS1: '告警通知 · 命令下发',
    actS2: '写动作可审计 · 可回退',
    traceT: '⑤ 追溯',
    traceS1: '命令回执 · 审计 · 回放',
    traceS2: '基线校准 · 模型重训',
    devT: '现场设备',
    devS: 'PLC · 传感器 · 电表（物理世界）',
    humanT: '运维人员',
    humanS: '确认高风险 · 处置告警',
    eSense: '归一位号值流 · 语义化',
    eUnderstand: '异常 · 预测 · 建议',
    eDecide: '触发：规则 或 模型建议',
    eAct: '命令回执 · 审计',
    eTrace: '反馈：校准 · 重训（防漂移）',
    eWrite: '命令回写物理世界（闭环判据）',
    eSample: '新的采集值',
    eConfirmReq: '高风险写 · 待确认',
    eConfirmGo: '确认 · 放行',
    legSense: '感知 / 接入', legUnder: '理解 / 分析', legDecide: '决策', legAct: '行动 / 执行',
    legTrace: '追溯', legDev: '物理世界', legHuman: '人工介入',
    legSolid: '主链路', legDash: '人工确认'
  },
  en: {
    aria: 'AIoT application-layer closed loop: sensing collects normalized point-value streams, understanding produces anomalies and predictions via rules plus models, deciding turns them into advice or commands (high-risk writes need human confirmation), acting dispatches commands back into the physical world with alarms and notifications, and tracing uses receipts, audits and replay to recalibrate baselines and retrain models — sense, understand, decide, act, trace',
    region: 'AIoT application layer · sense — understand — decide — act — trace loop',
    senseT: '① Sense',
    senseS1: 'device / edge collection',
    senseS2: 'normalized point values · events',
    underT: '② Understand',
    underS1: 'rules as baseline + models on top',
    underS2: 'stats · ML · LLM with RAG',
    decideT: '③ Decide',
    decideS1: 'threshold / anomaly / predict → advice',
    decideS2: 'high-risk writes need human approval',
    actT: '④ Act',
    actS1: 'alarms · notifications · commands',
    actS2: 'writes auditable · revertible',
    traceT: '⑤ Trace',
    traceS1: 'receipts · audit · replay',
    traceS2: 'baseline recalibration · retraining',
    devT: 'Field devices',
    devS: 'PLC · sensors · meters (physical world)',
    humanT: 'Operator',
    humanS: 'confirm high-risk · handle alarms',
    eSense: 'normalized, semantic value stream',
    eUnderstand: 'anomalies · predictions · advice',
    eDecide: 'trigger: rule or model advice',
    eAct: 'command receipts · audit',
    eTrace: 'feedback: recalibrate · retrain (anti-drift)',
    eWrite: 'commands act on the physical world (loop test)',
    eSample: 'new samples',
    eConfirmReq: 'high-risk write · awaiting approval',
    eConfirmGo: 'confirm · go',
    legSense: 'sense / ingest', legUnder: 'understand / analyze', legDecide: 'decide', legAct: 'act / execute',
    legTrace: 'trace', legDev: 'physical world', legHuman: 'human in the loop',
    legSolid: 'main loop', legDash: 'human confirmation'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 690">
        <defs>
          <marker id="aiot-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="aiot-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="aiot-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aiot-grid)" height="100%" width="100%"/>

        <!-- loop region -->
        <rect fill="var(--dc3-region-be)" height="570" rx="16" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1090" x="120" y="56"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="132" y="74">{{ s.region }}</text>

        <!-- ring edges (drawn before nodes) -->
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="770" x2="1005" y1="140"
              y2="230"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="820" y="152">{{ s.eSense }}</text>
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1000" x2="905" y1="314"
              y2="510"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="975" y="420">{{ s.eUnderstand }}</text>
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="790" x2="530" y1="552"
              y2="552"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="660" y="544">{{ s.eDecide }}</text>
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="310" x2="300" y1="510"
              y2="314"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="330" y="420">{{ s.eAct }}</text>
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="290" x2="550" y1="230"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="420" y="105">{{ s.eTrace }}</text>

        <!-- write-back and sampling edges -->
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="500" x2="560" y1="510"
              y2="372"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="end" x="516" y="443">{{ s.eWrite }}</text>
        <line marker-end="url(#aiot-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="600" x2="640" y1="304"
              y2="156"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="660" y="235">{{ s.eSample }}</text>

        <!-- human confirmation edges -->
        <line marker-end="url(#aiot-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"
              x1="840" x2="845" y1="510" y2="372"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="end" x="830" y="445">{{ s.eConfirmReq }}</text>
        <line marker-end="url(#aiot-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"
              x1="740" x2="527" y1="339" y2="510"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="628" y="498">{{ s.eConfirmGo }}</text>

        <!-- ① sense -->
        <rect fill="var(--dc3-fe-fill)" height="84" rx="8" stroke="var(--dc3-fe-stroke)" stroke-width="1.5" width="220"
              x="550" y="72"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="660" y="100">{{
            s.senseT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="660" y="122">{{ s.senseS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="140">{{ s.senseS2 }}</text>

        <!-- ② understand -->
        <rect fill="var(--dc3-amber-fill)" height="84" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="240" x="950" y="230"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="1070" y="258">{{
            s.underT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1070" y="280">{{ s.underS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="298">{{ s.underS2 }}</text>

        <!-- ③ decide -->
        <rect fill="var(--dc3-bus-fill)" height="84" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="240" x="790" y="510"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="910" y="538">{{
            s.decideT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="910" y="560">{{ s.decideS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="910" y="578">{{ s.decideS2 }}</text>

        <!-- ④ act -->
        <rect fill="var(--dc3-be-fill)" height="84" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1.5" width="240"
              x="290" y="510"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="410" y="538">{{
            s.actT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="410" y="560">{{ s.actS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="410" y="578">{{ s.actS2 }}</text>

        <!-- ⑤ trace -->
        <rect fill="var(--dc3-db-fill)" height="84" rx="8" stroke="var(--dc3-db-stroke)" stroke-width="1.5" width="240"
              x="130" y="230"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="600" text-anchor="middle" x="250" y="258">{{
            s.traceT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="250" y="280">{{ s.traceS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="250" y="298">{{ s.traceS2 }}</text>

        <!-- interior: physical world + operator -->
        <rect fill="var(--dc3-ext-fill)" height="68" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1.2"
              width="190" x="505" y="304"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="600" y="330">{{
            s.devT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="600" y="350">{{ s.devS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="66" rx="8" stroke="var(--dc3-rose-stroke)" stroke-width="1.2"
              width="190" x="740" y="306"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="835" y="332">{{
            s.humanT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="835" y="352">{{ s.humanS }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="120" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="142" y="659">{{ s.legSense }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="240" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="262" y="659">{{ s.legUnder }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="390" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="659">{{ s.legDecide }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="500" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="522" y="659">{{ s.legAct }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="630" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="652" y="659">{{ s.legTrace }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="720" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="742" y="659">{{ s.legDev }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="860" y="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="882" y="659">{{ s.legHuman }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="990" x2="1014" y1="656" y2="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1020" y="659">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="1110" x2="1134" y1="656"
              y2="656"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1140" y="659">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
