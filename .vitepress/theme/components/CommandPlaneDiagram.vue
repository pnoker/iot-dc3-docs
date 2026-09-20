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
    aria: '命令平面全链路：调用方提交读写命令，数据中心校验后以 PENDING 落库并发布，RabbitMQ 按驱动分队投递，驱动经 expireAt 预检、去重、设备锁后执行并回执，结果写回历史表供轮询；死信与超时路径单独标出',
    subRegion: '提交侧 · 数据中心 dc3-center-data',
    busRegion: 'RabbitMQ 命令通道 · 命令下行 / 回执上行',
    drvRegion: '驱动侧 · PointCommandReceiver 处理管线',
    caller: '调用方', callerSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: ':8000 · 转发',
    ctrl: 'PointCommandController', ctrlSub: 'read / write 端点',
    valid: '下发前校验',
    v1: '· 租户 & profileId 一致', v2: '· 设备 / 位号已启用',
    v3: '· rwFlag 可写(写命令)', v4: '· 驱动状态 ONLINE',
    hist: 'dc3_point_command_history',
    h1: 'PENDING → SENT',
    h2: '终态: SUCCESS / FAILED',
    h3: 'EXPIRED / DUPLICATE / DEAD',
    poll: '轮询取结果',
    p1: 'GET get_by_command_id',
    p2: '→ PointCommandHistoryVO',
    p3: '写失败不回显值',
    cmdex: '命令交换机 dc3.e.point_command', cmdexSub: 'topic',
    cmdq: '命令队列 dc3.q.point_command.{svc}',
    cq1: 'durable · TTL 30s · DLX', cq2: '按驱动服务名分队',
    dlx: '死信 dc3.e.point_command_dead',
    dlxSub: 'TTL 到期 · 基本校验 reject',
    rex: '结果交换机 dc3.e.point_command_result', rexSub: 'topic',
    rq: '结果队列 dc3.q.point_command_result', rqSub: 'TTL 60s',
    rrcv: 'PointCommandResultReceiver', rrcvSub: '按 commandId 写终态',
    recv: 'PointCommandReceiver', recvSub: '手动 ack · 最多重投一次',
    exp: 'expireAt 预检', expSub: '过期 → EXPIRED',
    dedupe: 'Caffeine 去重', dedupeSub: '重复 → DUPLICATE',
    lock: 'DeviceLockManager', lockSub: '每设备串行锁',
    exec: '驱动读写服务', execSub: 'read() / write()',
    dev: '现场设备', devSub: 'PLC · 仪表 · 网关',
    a1: '提交', a2: '转发', a3: '校验',
    a4: '① 落库 PENDING',
    a5: '② rabbitTemplate 发布', a5b: 'CorrelationData = commandId',
    a6: 'routing {serviceName}',
    a9: '③ consume · 手动 ack',
    a16: 'TTL 30s · reject',
    a14: 'routing result',
    a15: 'consume · ack',
    a13: '④ 回执发布 result',
    a12: '⑤ 终态写入',
    a11: '⑥ 轮询',
    g1: 'expireAt 预检', g2: '去重缓存', g3: '每设备串行锁',
    g4: '读/写分发', g5: '协议执行',
    legCaller: '调用方', legSvc: '服务 / 驱动', legBus: '消息总线', legDb: '历史表',
    legAmb: '校验 / 缓存', legDead: '死信 / 异常',
    legFlow: '命令流', legDeadFlow: '死信流'
  },
  en: {
    aria: 'Command plane end to end: the caller submits a read/write command, the data center validates, persists it as PENDING and publishes; RabbitMQ fans out per driver; the driver runs expireAt pre-check, dedupe and per-device lock, executes and receipts; results are written back to the history table for polling, with dead-letter and timeout paths marked',
    subRegion: 'Submit side · Data Center dc3-center-data',
    busRegion: 'RabbitMQ command channel · downlink / receipt uplink',
    drvRegion: 'Driver side · PointCommandReceiver pipeline',
    caller: 'Caller', callerSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: ':8000 · forward',
    ctrl: 'PointCommandController', ctrlSub: 'read / write endpoints',
    valid: 'pre-dispatch validation',
    v1: '· tenant & profileId match', v2: '· device / point enabled',
    v3: '· rwFlag writable (write)', v4: '· driver ONLINE',
    hist: 'dc3_point_command_history',
    h1: 'PENDING → SENT',
    h2: 'final: SUCCESS / FAILED',
    h3: 'EXPIRED / DUPLICATE / DEAD',
    poll: 'poll for result',
    p1: 'GET get_by_command_id',
    p2: '→ PointCommandHistoryVO',
    p3: 'no value echoed on failure',
    cmdex: 'command exchange dc3.e.point_command', cmdexSub: 'topic',
    cmdq: 'command queue dc3.q.point_command.{svc}',
    cq1: 'durable · TTL 30s · DLX', cq2: 'one queue per driver',
    dlx: 'dead letter dc3.e.point_command_dead',
    dlxSub: 'TTL expiry · validation reject',
    rex: 'result exchange dc3.e.point_command_result', rexSub: 'topic',
    rq: 'result queue dc3.q.point_command_result', rqSub: 'TTL 60s',
    rrcv: 'PointCommandResultReceiver', rrcvSub: 'writes final state by commandId',
    recv: 'PointCommandReceiver', recvSub: 'manual ack · one redelivery',
    exp: 'expireAt check', expSub: 'expired → EXPIRED',
    dedupe: 'Caffeine dedupe', dedupeSub: 'dup → DUPLICATE',
    lock: 'DeviceLockManager', lockSub: 'per-device lock',
    exec: 'driver read/write', execSub: 'read() / write()',
    dev: 'Field Devices', devSub: 'PLC · Meter · Gateway',
    a1: 'submit', a2: 'forward', a3: 'validate',
    a4: '① persist PENDING',
    a5: '② rabbitTemplate publish', a5b: 'CorrelationData = commandId',
    a6: 'routing {serviceName}',
    a9: '③ consume · manual ack',
    a16: 'TTL 30s · reject',
    a14: 'routing result',
    a15: 'consume · ack',
    a13: '④ receipt publish result',
    a12: '⑤ write final state',
    a11: '⑥ poll',
    g1: 'expireAt check', g2: 'dedupe cache', g3: 'per-device lock',
    g4: 'read/write dispatch', g5: 'protocol exec',
    legCaller: 'Caller', legSvc: 'Service / driver', legBus: 'Message bus', legDb: 'History table',
    legAmb: 'Validation / cache', legDead: 'Dead letter / error',
    legFlow: 'Command flow', legDeadFlow: 'Dead-letter flow'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1380 788">
        <defs>
          <marker id="cmdp-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="cmdp-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cmdp-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cmdp-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="336" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="780" x="24" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="82">{{ s.subRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="536" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="832" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="844" y="82">{{ s.busRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="120" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1208" x="24" y="632"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="650">{{ s.drvRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="182" x2="208" y1="136"
              y2="136"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="196" y="128">{{ s.a1 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="352" x2="378" y1="136"
              y2="136"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="365" y="128">{{ s.a2 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="532" x2="558" y1="136"
              y2="136"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="545" y="128">{{ s.a3 }}</text>
        <path d="M670,180 L670,307 L524,307" fill="none" marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="596" y="300">{{ s.a4 }}</text>
        <path d="M380,252 L380,238 L800,238 L800,124 L848,124" fill="none" marker-end="url(#cmdp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="600" y="232">{{ s.a5 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="796" y="190">{{ s.a5b }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1032" x2="1032" y1="152"
              y2="170"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1042" y="166">{{ s.a6 }}</text>
        <path d="M1214,207 L1258,207 L1258,648 L1120,648 L1120,660" fill="none" marker-end="url(#cmdp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1180" y="642">{{ s.a9 }}</text>
        <path d="M1032,242 L1032,264" fill="none" marker-end="url(#cmdp-ah-rose)" stroke="var(--dc3-rose-stroke)"
              stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="1042" y="258">{{ s.a16 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1032" x2="1032" y1="406"
              y2="424"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1042" y="418">{{ s.a14 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1032" x2="1032" y1="496"
              y2="514"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1042" y="508">{{ s.a15 }}</text>
        <path d="M390,662 L390,628 L1242,628 L1242,378 L1216,378" fill="none" marker-end="url(#cmdp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="800" y="622">{{ s.a13 }}</text>
        <path d="M1032,580 L1032,610 L480,610 L480,366" fill="none" marker-end="url(#cmdp-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.5"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="472" y="480">{{ s.a12 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="298" x2="244" y1="307"
              y2="307"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="270" y="299">{{ s.a11 }}</text>
        <!-- driver pipeline arrows -->
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1028" x2="994" y1="696"
              y2="696"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1010" y="744">{{ s.g1 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="858" x2="834" y1="696"
              y2="696"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="845" y="744">{{ s.g2 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="698" x2="684" y1="696"
              y2="696"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="690" y="744">{{ s.g3 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="538" x2="534" y1="696"
              y2="696"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="534" y="744">{{ s.g4 }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="368" x2="354" y1="696"
              y2="696"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="360" y="744">{{ s.g5 }}</text>

        <!-- submit-side nodes -->
        <rect fill="var(--dc3-fe-fill)" height="72" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="140"
              x="40" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="110" y="126">
          {{ s.caller }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="110" y="144">{{ s.callerSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="72" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="210" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="280" y="126">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="280" y="144">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="72" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="380" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="455" y="126">
          {{ s.ctrl }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="455" y="144">{{ s.ctrlSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="88" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="560" y="92"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="670" y="112">
          {{ s.valid }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="572" y="132">{{ s.v1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="572" y="148">{{ s.v2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="572" y="164">{{ s.v3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="572" y="178">{{ s.v4 }}</text>
        <rect fill="var(--dc3-db-fill)" height="110" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="220"
              x="300" y="252"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="410" y="274">
          {{ s.hist }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="410" y="296">{{ s.h1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="410" y="316">{{ s.h2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="410" y="334">{{ s.h3 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="40" y="252"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="140" y="274">
          {{ s.poll }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="140" y="296">{{ s.p1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="140" y="314">{{ s.p2 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="140" y="338">{{ s.p3 }}</text>

        <!-- RabbitMQ nodes -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="360"
              x="852" y="96"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1032" y="118">
          {{ s.cmdex }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="1032" y="136">{{ s.cmdexSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="360"
              x="852" y="172"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1032" y="194">
          {{ s.cmdq }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="1032" y="212">{{ s.cq1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="1032" y="228">{{ s.cq2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="360" x="852" y="266"/>
        <text class="d-name" fill="var(--dc3-rose-stroke)" font-size="9.5" text-anchor="middle" x="1032" y="288">
          {{ s.dlx }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1032" y="306">{{ s.dlxSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="360"
              x="852" y="350"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1032" y="372">
          {{ s.rex }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="1032" y="390">{{ s.rexSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="360"
              x="852" y="426"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1032" y="450">
          {{ s.rq }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="1032" y="470">{{ s.rqSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="360"
              x="852" y="516"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1032" y="540">
          {{ s.rrcv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1032" y="558">{{ s.rrcvSub }}</text>

        <!-- driver pipeline nodes -->
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="1030" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1120" y="686">
          {{ s.recv }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1120" y="704">{{ s.recvSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="860" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="925" y="686">
          {{ s.exp }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="925" y="704">{{ s.expSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="700" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="765" y="686">
          {{ s.dedupe }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="765" y="704">{{ s.dedupeSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="540" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="610" y="686">
          {{ s.lock }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="610" y="704">{{ s.lockSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="370" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="450" y="686">
          {{ s.exec }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="450" y="704">{{ s.execSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="170"
              x="180" y="664"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="265" y="686">
          {{ s.dev }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="265" y="704">{{ s.devSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="24" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="775">{{ s.legCaller }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="130" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="152" y="775">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="260" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="282" y="775">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="390" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="775">{{ s.legDb }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="510" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="532" y="775">{{ s.legAmb }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="640" y="766"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="775">{{ s.legDead }}</text>
        <line marker-end="url(#cmdp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="770" x2="798" y1="772"
              y2="772"/>
        <text fill="var(--dc3-text2)" font-size="9" x="804" y="775">{{ s.legFlow }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="900" x2="928" y1="772"
              y2="772"/>
        <text fill="var(--dc3-text2)" font-size="9" x="934" y="775">{{ s.legDeadFlow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
