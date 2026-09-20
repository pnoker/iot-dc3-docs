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
    aria: '驱动入站命令流水线：RabbitMQ 命令队列被 PointCommandReceiver 消费后先判定是否过期（超时作废）、是否重复（丢弃），再按设备加锁并调用协议 read()/write()，成功结果经 RabbitMQ 回执数据中心；异常路径失败也回执且不回显写入值。下方健康上报链路按 cron 调 deviceStatusSender 以 45 秒 TTL 续租设备状态，到期未续即判离线',
    regA: '入站命令流水线 · PointCommandReceiver（校验 → 去重 → 加锁 → 协议调用）',
    regB: '健康上报 · 状态租约（TTL 必须大于读/上报周期）',
    p0: 'RabbitMQ 命令队列', p0s: 'point_command · 本驱动队列',
    q1: '过期?', q2: '重复?',
    b1: '按设备加锁', b1s: '同设备串行执行',
    b2: 'read() / write()', b2s: '协议实现 · 异常 = 失败信号',
    b3: 'RabbitMQ', b3s: 'result 队列',
    b4: 'dc3-center-data', b4s: '命令历史落库 · 回执',
    e1: '过期作废', e1s: 'expireAt = now + 10s',
    e2: '重复丢弃', e2s: '同命令已处理',
    e3: '失败回执', e3s: 'responseValue = null · 不回显',
    lblConsume: '消费', lblNo: '否', lblYesVoid: '是 · 作废', lblYesDrop: '是 · 丢弃',
    lblLock: '加锁后调用', lblResult: 'ReadPointValue', lblAck: '回执',
    lblThrow: '抛异常', lblFailAck: '失败也回执',
    h1: 'health cron / schedule()', h1s: '0/15 * * * * ?',
    h2: 'DriverSenderService', h2s: 'deviceStatusSender · TTL 45s',
    h3: 'RabbitMQ', h3s: '状态事件',
    h4: 'dc3_entity_state', h4s: '设备状态租约',
    lblSend: 'deviceStatusSender', lblDeliver: '投递',
    lblRenew: '续租', lblExpire: '到期未续',
    o1: '保持 ONLINE', o1s: 'TTL 45s > 读周期 30s',
    o2: '判 OFFLINE · 反复掉线', o2s: 'TTL < 周期 → flap',
    note: '写命令失败不回显值（responseValue=null，避免假成功）；命令有效期 10s，超时未被驱动消费即作废；设备状态 TTL 建议 ≥ 45s',
    legBus: '消息队列', legSdk: 'SDK / 中心服务', legImpl: '协议实现',
    legFail: '失败 / 异常路径', legDec: '判定', legMain: '命令主链路'
  },
  en: {
    aria: 'Inbound command pipeline inside the driver: PointCommandReceiver consumes the RabbitMQ command queue, checks expiry (void on timeout) and duplicates (dropped), locks per device, then calls the protocol read()/write(); success results are acknowledged back to the data center via RabbitMQ while failures also report back without echoing the written value. Below, the health lane renews the device-state lease every cycle via deviceStatusSender with a 45s TTL; an expired lease marks the device offline',
    regA: 'Inbound command pipeline · PointCommandReceiver (validate → dedupe → lock → protocol call)',
    regB: 'Health reporting · state lease (TTL must exceed the read interval)',
    p0: 'RabbitMQ command queue', p0s: 'point_command · per-driver queue',
    q1: 'expired?', q2: 'duplicate?',
    b1: 'lock per device', b1s: 'serialized per device',
    b2: 'read() / write()', b2s: 'protocol impl · exception = failure',
    b3: 'RabbitMQ', b3s: 'result queue',
    b4: 'dc3-center-data', b4s: 'command history · receipt',
    e1: 'voided on timeout', e1s: 'expireAt = now + 10s',
    e2: 'duplicate dropped', e2s: 'command already handled',
    e3: 'failure receipt', e3s: 'responseValue = null · no echo',
    lblConsume: 'consume', lblNo: 'no', lblYesVoid: 'yes · void', lblYesDrop: 'yes · drop',
    lblLock: 'invoke under lock', lblResult: 'ReadPointValue', lblAck: 'receipt',
    lblThrow: 'throws', lblFailAck: 'failure also receipted',
    h1: 'health cron / schedule()', h1s: '0/15 * * * * ?',
    h2: 'DriverSenderService', h2s: 'deviceStatusSender · TTL 45s',
    h3: 'RabbitMQ', h3s: 'state events',
    h4: 'dc3_entity_state', h4s: 'device state lease',
    lblSend: 'deviceStatusSender', lblDeliver: 'deliver',
    lblRenew: 'renew', lblExpire: 'lease expired',
    o1: 'stays ONLINE', o1s: 'TTL 45s > read 30s',
    o2: 'marked OFFLINE · flapping', o2s: 'TTL < interval → flap',
    note: 'Failed writes never echo the value (responseValue=null, no fake success); commands expire after 10s if unconsumed; keep the device-state TTL at 45s or above',
    legBus: 'Message queue', legSdk: 'SDK / center services', legImpl: 'Protocol impl',
    legFail: 'Failure path', legDec: 'Decision', legMain: 'Command main flow'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 700">
        <defs>
          <marker id="daf3-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="daf3-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="daf3-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#daf3-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="310" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1220" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regA }}</text>
        <rect fill="var(--dc3-region-amber)" height="170" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="1220" x="40" y="410"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="428">{{ s.regB }}</text>

        <!-- pipeline arrows -->
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="238" x2="262" y1="168" y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="238" y="158">{{ s.lblConsume }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="356" x2="382" y1="168" y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="369" y="158">{{ s.lblNo }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="476" x2="502" y1="168" y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="489" y="158">{{ s.lblNo }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="654" x2="680" y1="168" y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="667" y="158">{{ s.lblLock }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="854" x2="932" y1="168" y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="893" y="158">{{ s.lblResult }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1084" x2="1112" y1="168"
              y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1084" y="158">{{ s.lblAck }}</text>

        <!-- error paths -->
        <line marker-end="url(#daf3-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="310" x2="310"
              y1="198" y2="238"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="318" y="222">{{ s.lblYesVoid }}</text>
        <line marker-end="url(#daf3-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="430" x2="430"
              y1="198" y2="238"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="438" y="222">{{ s.lblYesDrop }}</text>
        <line marker-end="url(#daf3-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="770" x2="770"
              y1="198" y2="238"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="778" y="222">{{ s.lblThrow }}</text>
        <line marker-end="url(#daf3-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="872" x2="986" y1="266" y2="200"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="884" y="250">{{ s.lblFailAck }}</text>

        <!-- health lane arrows -->
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="268" x2="352" y1="484"
              y2="484"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="310" y="474">{{ s.lblSend }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="574" x2="602" y1="484"
              y2="484"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="588" y="474">{{ s.lblRenew }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="744" x2="772" y1="484"
              y2="484"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="758" y="474">{{ s.lblDeliver }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="954" x2="982" y1="462"
              y2="462"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="968" y="452">{{ s.lblRenew }}</text>
        <line marker-end="url(#daf3-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="954" x2="982"
              y1="522" y2="522"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="960" y="514">{{ s.lblExpire }}</text>

        <!-- pipeline nodes -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="170"
              x="64" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="149" y="163">
          {{ s.p0 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="149" y="181">{{ s.p0s }}</text>
        <polygon fill="var(--dc3-fe-fill)" points="310,140 354,168 310,196 266,168" stroke="var(--dc3-fe-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" text-anchor="middle" x="310" y="172">
          {{ s.q1 }}
        </text>
        <polygon fill="var(--dc3-fe-fill)" points="430,140 474,168 430,196 386,168" stroke="var(--dc3-fe-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" text-anchor="middle" x="430" y="172">
          {{ s.q2 }}
        </text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="510" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="580" y="163">
          {{ s.b1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="580" y="181">{{ s.b1s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="160"
              x="690" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="770" y="163">
          {{ s.b2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="181">{{ s.b2s }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="140"
              x="940" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1010" y="163">
          {{ s.b3 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="1010" y="181">{{ s.b3s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="150"
              x="1116" y="140"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1191" y="163">
          {{ s.b4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1191" y="181">{{ s.b4s }}</text>

        <!-- error boxes -->
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="160"
              x="230" y="240"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="310" y="260">
          {{ s.e1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="310" y="278">{{ s.e1s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="160"
              x="350" y="240"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="430" y="260">
          {{ s.e2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="430" y="278">{{ s.e2s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="180"
              x="680" y="240"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="770" y="260">
          {{ s.e3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="770" y="278">{{ s.e3s }}</text>

        <!-- health nodes -->
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="64" y="458"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="164" y="480">
          {{ s.h1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="164" y="498">{{ s.h1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="356" y="458"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="461" y="480">
          {{ s.h2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="461" y="498">{{ s.h2s }}</text>
        <rect fill="var(--dc3-bus-fill)" height="52" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="130"
              x="606" y="458"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="671" y="480">
          {{ s.h3 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="671" y="498">{{ s.h3s }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="776" y="458"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="861" y="480">
          {{ s.h4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="861" y="498">{{ s.h4s }}</text>
        <rect fill="var(--dc3-be-fill)" height="44" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="250"
              x="986" y="440"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1111" y="458">
          {{ s.o1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1111" y="474">{{ s.o1s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="250"
              x="986" y="500"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" text-anchor="middle" x="1111" y="518">
          {{ s.o2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1111" y="534">{{ s.o2s }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1220" x="40" y="600"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="622">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legBus }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="190" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="669">{{ s.legSdk }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="340" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="669">{{ s.legImpl }}</text>
        <polygon fill="var(--dc3-fe-fill)" points="470,655 484,663 470,671 456,663" stroke="var(--dc3-fe-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="669">{{ s.legDec }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="560" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="669">{{ s.legFail }}</text>
        <line marker-end="url(#daf3-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="720" x2="748" y1="666"
              y2="666"/>
        <text fill="var(--dc3-text2)" font-size="9" x="754" y="669">{{ s.legMain }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
