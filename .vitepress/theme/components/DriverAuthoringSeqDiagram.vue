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
    aria: '驱动注册与读写调度时序：SDK 启动后经 gRPC 向管理中心提交 RegisterBO（失败按指数退避重试至多 30 次），成功后调用协议实现 initial() 并装配 Quartz 定时任务；此后读周期触发 read() 并把 ReadPointValue 经 RabbitMQ 发布给数据中心落库；写命令由数据中心经 RabbitMQ 下发，PointCommandReceiver 消费后反向调用 write() 并把结果回执',
    ph1: '① 启动注册（带重试）', ph2: '② 一次性初始化 · 装配调度',
    ph3: '③ 读调度 · 数据上行', ph4: '④ 写命令 · 命令下行与回执',
    q: 'Quartz 调度', qSub: 'SDK 内定时器',
    c: 'DriverCustomService', cSub: '协议实现（你写的部分）',
    k: 'dc3-common-driver', kSub: '驱动 SDK',
    m: 'dc3-center-manager', mSub: ':8400 / gRPC :9400',
    b: 'RabbitMQ', bSub: 'point_value / point_command',
    d: 'dc3-center-data', dSub: ':8500 / gRPC :9500',
    m1: 'gRPC RegisterBO · 驱动 + 属性定义', n1: '落库 dc3_driver(_attribute)',
    n2: '重试: 2s→30s ×30 · 日志 n/30', m2: '注册成功',
    m3: 'initial()', n3: '一次性: 连接池 / 订阅关系',
    n4: '装配 Quartz 定时任务 (read / custom / health)',
    m4: 'read cron 0/30 * * * * ?', m5: 'read(driverConfig, pointConfig)',
    m6: 'ReadPointValue', m7: '发布 point_value', m8: '投递',
    n5: 'TimescaleDB 落库',
    m9: 'point_command (TTL 10s)', m10: 'PointCommandReceiver 消费',
    n6: '校验 · 去重 · 加锁', m11: 'write(...)', m12: 'Boolean / 异常',
    m13: 'commandResult (失败不回显值)',
    note: '上行 point_value 与下行 point_command 均由 SDK 编排 —— 协议实现只需填 read() 与 write()，不必自写 RabbitMQ / gRPC 管道',
    legSched: '调度器', legImpl: '协议实现', legSdk: 'SDK 与中心服务', legBus: '消息总线',
    legCall: '调用 / 消息', legRet: '返回 / 回执'
  },
  en: {
    aria: 'Driver registration and read/write scheduling sequence: at startup the SDK submits a RegisterBO to the manager over gRPC (retrying with exponential backoff up to 30 times), then calls initial() on the protocol implementation and wires the Quartz jobs; each read cron fires read() and the ReadPointValue is published via RabbitMQ to the data center; write commands flow the opposite way from the data center through RabbitMQ, are consumed by PointCommandReceiver, which calls write() and reports the result back',
    ph1: '① Startup registration (with retry)', ph2: '② One-off init · wire schedules',
    ph3: '③ Read schedule · data uplink', ph4: '④ Write command · downlink & receipt',
    q: 'Quartz', qSub: 'in-SDK scheduler',
    c: 'DriverCustomService', cSub: 'protocol impl (your part)',
    k: 'dc3-common-driver', kSub: 'driver SDK',
    m: 'dc3-center-manager', mSub: ':8400 / gRPC :9400',
    b: 'RabbitMQ', bSub: 'point_value / point_command',
    d: 'dc3-center-data', dSub: ':8500 / gRPC :9500',
    m1: 'gRPC RegisterBO · driver + attribute defs', n1: 'persist dc3_driver(_attribute)',
    n2: 'retry: 2s→30s ×30 · log n/30', m2: 'registered',
    m3: 'initial()', n3: 'one-off: pools / subscriptions',
    n4: 'wire Quartz jobs (read / custom / health)',
    m4: 'read cron 0/30 * * * * ?', m5: 'read(driverConfig, pointConfig)',
    m6: 'ReadPointValue', m7: 'publish point_value', m8: 'deliver',
    n5: 'stored to TimescaleDB',
    m9: 'point_command (TTL 10s)', m10: 'PointCommandReceiver consumes',
    n6: 'validate · dedupe · lock', m11: 'write(...)', m12: 'Boolean / exception',
    m13: 'commandResult (no echo on failure)',
    note: 'Both the uplink point_value and the downlink point_command are orchestrated by the SDK — the protocol impl only fills read() and write(), no hand-written RabbitMQ/gRPC plumbing',
    legSched: 'Scheduler', legImpl: 'Protocol impl', legSdk: 'SDK & center services', legBus: 'Message bus',
    legCall: 'Call / message', legRet: 'Return / receipt'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {q: 120, c: 330, k: 560, m: 790, b: 990, d: 1180}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 768">
        <defs>
          <marker id="dasq-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dasq-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dasq-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-be)" height="132" width="1280" x="24" y="100"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="116">{{ s.ph1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="90" width="1280" x="24" y="232"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="248">{{ s.ph2 }}</text>
        <rect fill="var(--dc3-region-be)" height="183" width="1280" x="24" y="322"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="338">{{ s.ph3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="160" width="1280" x="24" y="505"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="521">{{ s.ph4 }}</text>

        <!-- lifelines -->
        <line v-for="key in ['q','c','k','m','b','d']" :key="'dasq' + key" :x1="PX[key]" :x2="PX[key]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="88" y2="662"/>

        <!-- activation bars -->
        <rect fill="var(--dc3-amber-fill)" height="20" stroke="var(--dc3-amber-stroke)" stroke-width="0.8" width="10"
              x="115" y="334"/>
        <rect fill="var(--dc3-fe-fill)" height="158" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10"
              x="325" y="246"/>
        <rect fill="var(--dc3-fe-fill)" height="38" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10"
              x="325" y="578"/>
        <rect fill="var(--dc3-be-fill)" height="82" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="555" y="144"/>
        <rect fill="var(--dc3-be-fill)" height="102" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="555" y="336"/>
        <rect fill="var(--dc3-be-fill)" height="102" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="555" y="542"/>
        <rect fill="var(--dc3-be-fill)" height="82" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="785" y="144"/>
        <rect fill="var(--dc3-bus-fill)" height="40" stroke="var(--dc3-bus-stroke)" stroke-width="0.8" width="10"
              x="985" y="426"/>
        <rect fill="var(--dc3-bus-fill)" height="130" stroke="var(--dc3-bus-stroke)" stroke-width="0.8" width="10"
              x="985" y="514"/>
        <rect fill="var(--dc3-be-fill)" height="22" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1175" y="456"/>
        <rect fill="var(--dc3-be-fill)" height="130" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1175" y="514"/>

        <!-- self notes -->
        <rect fill="var(--dc3-be-fill)" height="30" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="190" x="808" y="162"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="816" y="181">{{ s.n1 }}</text>
        <rect fill="var(--dc3-be-fill)" height="30" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="190" x="576" y="180"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="584" y="199">{{ s.n2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="28" rx="4" stroke="var(--dc3-fe-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="150" x="345" y="262"/>
        <text fill="var(--dc3-fe-text)" font-size="7.5" x="353" y="280">{{ s.n3 }}</text>
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="220" x="576" y="288"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="584" y="306">{{ s.n4 }}</text>
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="150" x="1092" y="472"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="1100" y="490">{{ s.n5 }}</text>

        <!-- messages -->
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="568" x2="782" y1="150"
              y2="150"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="675" y="142">{{ s.m1 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="782"
              x2="568" y1="222" y2="222"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="675" y="214">{{ s.m2 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="552" x2="338" y1="252"
              y2="252"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="445" y="244">{{ s.m3 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="128" x2="552" y1="342"
              y2="342"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="340" y="334">{{ s.m4 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="552" x2="338" y1="372"
              y2="372"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="445" y="364">{{ s.m5 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="338"
              x2="552" y1="400" y2="400"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="445" y="392">{{ s.m6 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="568" x2="982" y1="432"
              y2="432"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="775" y="424">{{ s.m7 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="998" x2="1172" y1="462"
              y2="462"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1085" y="454">{{ s.m8 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="1172" x2="998" y1="520"
              y2="520"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1085" y="512">{{ s.m9 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="982" x2="568" y1="548"
              y2="548"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="775" y="540">{{ s.m10 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="775" y="562">{{ s.n6 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="552" x2="338" y1="584"
              y2="584"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="445" y="576">{{ s.m11 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="338"
              x2="552" y1="612" y2="612"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="445" y="604">{{ s.m12 }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="568" x2="982" y1="640"
              y2="640"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="775" y="632">{{ s.m13 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="160" x="40" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="120" y="50">
          {{ s.q }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="120" y="66">{{ s.qSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="245" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="330" y="50">
          {{ s.c }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="330" y="66">{{ s.cSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="470" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="560" y="50">
          {{ s.k }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="560" y="66">{{ s.kSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="700" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="790" y="50">
          {{ s.m }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="790" y="66">{{ s.mSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="48" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="170"
              x="905" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="990" y="50">
          {{ s.b }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="990" y="66">{{ s.bSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="1090" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1180" y="50">
          {{ s.d }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1180" y="66">{{ s.dSub }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1280" x="24" y="676"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="40" y="698">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="60" y="730"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="739">{{ s.legSched }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="160" y="730"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="739">{{ s.legImpl }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="290" y="730"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="739">{{ s.legSdk }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="480" y="730"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="739">{{ s.legBus }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="640" x2="668" y1="736"
              y2="736"/>
        <text fill="var(--dc3-text2)" font-size="9" x="674" y="739">{{ s.legCall }}</text>
        <line marker-end="url(#dasq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="800"
              x2="828" y1="736" y2="736"/>
        <text fill="var(--dc3-text2)" font-size="9" x="834" y="739">{{ s.legRet }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
