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
    aria: '运营核心循环：接入设备后看数据、下命令、收告警四步依次推进，每一步依赖前一步的产物并各有成功信号；告警触发处置后回到下命令形成闭环；AI 运营是可选的进阶分支，所有操作经网关 8000 与三鉴权头完成',
    s1Name: '① 接入设备',
    s1Sub: '驱动注册 · 心跳租约',
    s1Page: 'device-onboarding',
    s2Name: '② 看数据',
    s2Sub: '位号值 · 历史查询',
    s2Page: 'data-commands',
    s3Name: '③ 下命令',
    s3Sub: '读/写 · 异步回执 ≤10s',
    s3Page: 'data-commands',
    s4Name: '④ 收告警',
    s4Sub: '规则引擎 · 通知通道',
    s4Page: 'alarms',
    lblA: '设备在线',
    lblB: '位号有值',
    lblC: '回执终态',
    sigTitle: '成功信号 · 做对了应该看到什么',
    g1Name: '✓ 设备在线',
    g1Sub: '心跳租约未过期',
    g2Name: '✓ 位号有值',
    g2Sub: 'calValue / createTime 非空',
    g3Name: '✓ 命令有回执',
    g3Sub: 'status 到终态',
    lblVerify: '验证',
    lblAdvance: '进阶（可选）',
    aiName: '⑤ AI 运营（可选）',
    aiSub: '自然语言查控 · agentic',
    lblAlarm: '告警触发',
    lblAct: '处置 · 写命令',
    capGw: '所有操作经 Gateway :8000 · 三鉴权头 X-Auth-Tenant / Login / Token',
    capLoop: '核心闭环：告警 → 处置 → 命令（回到 ③）',
    legStep: '核心步骤',
    legCmd: '命令通道',
    legAlarm: '告警 / 处置',
    legAi: 'AI 进阶',
    legSignal: '成功信号'
  },
  en: {
    aria: 'Operations core loop: onboard devices, view data, send commands and receive alarms advance in order, each step depending on the previous one and carrying its own success signal; an alarm triggers remediation that loops back to sending commands; AI operations is the optional advanced branch, and everything goes through gateway 8000 with the three auth headers',
    s1Name: '① Onboard device',
    s1Sub: 'driver register · heartbeat',
    s1Page: 'device-onboarding',
    s2Name: '② View data',
    s2Sub: 'point values · history',
    s2Page: 'data-commands',
    s3Name: '③ Send command',
    s3Sub: 'read/write · async receipt ≤10s',
    s3Page: 'data-commands',
    s4Name: '④ Receive alarm',
    s4Sub: 'rule engine · notification',
    s4Page: 'alarms',
    lblA: 'device online',
    lblB: 'values present',
    lblC: 'receipt final',
    sigTitle: 'Success signals · what done-right looks like',
    g1Name: '✓ Device online',
    g1Sub: 'heartbeat lease alive',
    g2Name: '✓ Values present',
    g2Sub: 'calValue / createTime set',
    g3Name: '✓ Command receipt',
    g3Sub: 'status reaches final',
    lblVerify: 'verify',
    lblAdvance: 'advanced (optional)',
    aiName: '⑤ AI ops (optional)',
    aiSub: 'natural-language · agentic',
    lblAlarm: 'alarm fires',
    lblAct: 'act · write command',
    capGw: 'Everything via Gateway :8000 · headers X-Auth-Tenant / Login / Token',
    capLoop: 'Core loop: alarm → actuation → command (back to ③)',
    legStep: 'Core step',
    legCmd: 'Command channel',
    legAlarm: 'Alarm / actuation',
    legAi: 'AI advanced',
    legSignal: 'Success signal'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 430">
        <defs>
          <marker id="opi-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="opi-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="opi-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#opi-grid)" height="100%" width="100%"/>

        <!-- arrows: task progression (drawn before nodes) -->
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="292" x2="386" y1="129" y2="129"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="339" y="121">{{ s.lblA }}</text>
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="602" x2="696" y1="129" y2="129"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="649" y="121">{{ s.lblB }}</text>
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="912" x2="1006" y1="129" y2="129"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="959" y="121">{{ s.lblC }}</text>

        <!-- arrows: success-signal drops + AI branch -->
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="185"
              x2="185" y1="170" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="195" y="214">{{ s.lblVerify }}</text>
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="495"
              x2="495" y1="170" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="505" y="214">{{ s.lblVerify }}</text>
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="805"
              x2="805" y1="170" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="815" y="214">{{ s.lblVerify }}</text>
        <line marker-end="url(#opi-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="1115"
              x2="1115" y1="170" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1125" y="214">{{ s.lblAdvance }}</text>

        <!-- arrow: alarm-triggered remediation loops back to commands -->
        <path d="M 1006 280 L 940 280 L 940 150 L 914 150" fill="none" marker-end="url(#opi-ah-amber)"
              stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="973" y="270">{{ s.lblAlarm }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="973" y="296">{{ s.lblAct }}</text>

        <!-- node: step 1 -->
        <rect fill="var(--dc3-be-fill)" height="78" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="80" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="700" text-anchor="middle" x="185" y="118">{{
            s.s1Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="185" y="136">{{ s.s1Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="185" y="152">{{ s.s1Page }}</text>

        <!-- node: step 2 -->
        <rect fill="var(--dc3-be-fill)" height="78" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="390" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="700" text-anchor="middle" x="495" y="118">{{
            s.s2Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="495" y="136">{{ s.s2Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="495" y="152">{{ s.s2Page }}</text>

        <!-- node: step 3 -->
        <rect fill="var(--dc3-bus-fill)" height="78" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="210"
              x="700" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="700" text-anchor="middle" x="805" y="118">{{
            s.s3Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="805" y="136">{{ s.s3Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="805" y="152">{{ s.s3Page }}</text>

        <!-- node: step 4 -->
        <rect fill="var(--dc3-amber-fill)" height="78" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="210" x="1010" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="700" text-anchor="middle" x="1115" y="118">{{
            s.s4Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1115" y="136">{{ s.s4Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1115" y="152">{{ s.s4Page }}</text>

        <!-- success-signal chips -->
        <text fill="var(--dc3-text2)" font-size="8" x="80" y="240">{{ s.sigTitle }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="210"
              x="80" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="185" y="274">{{
            s.g1Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="185" y="292">{{ s.g1Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="210"
              x="390" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="495" y="274">{{
            s.g2Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="495" y="292">{{ s.g2Sub }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="210"
              x="700" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="805" y="274">{{
            s.g3Name
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="805" y="292">{{ s.g3Sub }}</text>

        <!-- node: AI ops (optional) -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="210"
              x="1010" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1115" y="274">{{
            s.aiName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1115" y="292">{{ s.aiSub }}</text>

        <!-- captions -->
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="655" y="340">{{ s.capGw }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="655" y="362">{{ s.capLoop }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="70" y="392"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="401">{{ s.legStep }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="180" y="392"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="401">{{ s.legCmd }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="310" y="392"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="401">{{ s.legAlarm }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="450" y="392"/>
        <text fill="var(--dc3-text2)" font-size="9" x="472" y="401">{{ s.legAi }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="570" y="392"/>
        <text fill="var(--dc3-text2)" font-size="9" x="592" y="401">{{ s.legSignal }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
