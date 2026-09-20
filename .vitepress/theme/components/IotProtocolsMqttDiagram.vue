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
    aria: 'MQTT 协议模型：设备把消息发布到主题、平台订阅主题，双方只与 broker 打交道而互不知地址；broker 维护主题树并提供 retain 保留与 LWT 遗嘱机制；命令经下行主题发布；底部对比 QoS 0/1/2 三档投递保证的握手差异',
    regionPub: '发布方 · 设备（Publish）',
    regionBroker: 'MQTT Broker · 主题路由',
    regionSub: '订阅方（Subscribe）',
    regionQos: 'QoS 三档投递保证 · 发布与订阅各声明、按较弱方生效',
    dev1: '温度传感器', dev1Sub: 'publish device/1001/up',
    dev2: '智能电表', dev2Sub: 'publish device/1002/up',
    devNote: '电池供电 · 休眠唤醒即发',
    broker: 'MQTT Broker', brokerSub: 'EMQX / Mosquitto / RabbitMQ-MQTT',
    topicLine1: '主题树 device/{id}/up · device/{id}/down',
    topicLine2: '通配订阅 device/+/up · 共享订阅负载均衡',
    portLine: 'TCP :1883 · TLS :8883 · 版本 3.1.1 / 5.0',
    retain: 'Retain 保留消息', retainSub: 'broker 缓存每主题最后一条 · 新订阅者立即收到',
    lwt: 'LWT 遗嘱消息', lwtSub: '设备异常掉线 · broker 代发预设消息感知离线',
    brokerNote: '发布方与订阅方互不知地址 · 无需同时在线 · 天然扇出',
    plat: '平台 / DC3 MQTT 驱动', platSub: '订阅被动接收 · read() 不轮询',
    third: '第三方应用 / 告警', thirdSub: '多订阅者 · 可共享订阅分担',
    e1: 'PUBLISH · QoS 0/1', e2: 'PUBLISH',
    e3: '推送（订阅匹配）', e4: 'SUBSCRIBE device/+/up',
    e5: '推送（多订阅者扇出）', e6: 'PUBLISH device/{id}/down', e7: '命令下发（写入）',
    q0: 'QoS 0 · 最多一次', q0n1: '发出即忘：不确认、不重传', q0n2: '适合高频、可容忍丢点的遥测',
    q1: 'QoS 1 · 至少一次', q1n: '未确认重发 → 不丢但可能重复，下游需幂等',
    q2: 'QoS 2 · 恰好一次', q2n: '四次握手不丢不重，开销最重 · 留给关键命令',
    aPub: 'PUBLISH', aAck: 'PUBACK', aRec: 'PUBREC', aRel: 'PUBREL', aComp: 'PUBCOMP',
    dev: '设备', brk: 'Broker',
    legPub: '发布设备', legBroker: 'Broker', legSub: '订阅方', legThird: '第三方',
    legUp: '上行遥测（实线）', legDown: '下行命令（虚线）'
  },
  en: {
    aria: 'MQTT protocol model: devices publish to topics and the platform subscribes, both talking only to the broker without knowing each other; the broker keeps the topic tree and offers retain and last-will; commands go via down topics; the bottom strip contrasts the handshake differences of QoS 0/1/2',
    regionPub: 'Publishers · devices',
    regionBroker: 'MQTT Broker · topic routing',
    regionSub: 'Subscribers',
    regionQos: 'QoS levels · declared by each side, weaker wins',
    dev1: 'Temperature sensor', dev1Sub: 'publish device/1001/up',
    dev2: 'Smart meter', dev2Sub: 'publish device/1002/up',
    devNote: 'battery powered · wake and publish',
    broker: 'MQTT Broker', brokerSub: 'EMQX / Mosquitto / RabbitMQ-MQTT',
    topicLine1: 'topic tree device/{id}/up · device/{id}/down',
    topicLine2: 'wildcard sub device/+/up · shared subscription',
    portLine: 'TCP :1883 · TLS :8883 · versions 3.1.1 / 5.0',
    retain: 'Retained message', retainSub: 'broker caches last message per topic · new subs get it at once',
    lwt: 'Last Will (LWT)', lwtSub: 'unexpected offline · broker publishes the will',
    brokerNote: 'publishers and subscribers do not know each other · no simultaneity required',
    plat: 'Platform / DC3 MQTT driver', platSub: 'passive receive via subscribe · read() does not poll',
    third: 'Third-party app / alarms', thirdSub: 'multiple subscribers · shared subscription',
    e1: 'PUBLISH · QoS 0/1', e2: 'PUBLISH',
    e3: 'push (topic match)', e4: 'SUBSCRIBE device/+/up',
    e5: 'push (fan-out)', e6: 'PUBLISH device/{id}/down', e7: 'command delivery (write)',
    q0: 'QoS 0 · at most once', q0n1: 'fire and forget: no ack, no retry', q0n2: 'for high-rate, loss-tolerant telemetry',
    q1: 'QoS 1 · at least once', q1n: 'retry until PUBACK → no loss but duplicates, consumer must be idempotent',
    q2: 'QoS 2 · exactly once', q2n: 'four-way handshake, heaviest · reserve for critical commands',
    aPub: 'PUBLISH', aAck: 'PUBACK', aRec: 'PUBREC', aRel: 'PUBREL', aComp: 'PUBCOMP',
    dev: 'device', brk: 'Broker',
    legPub: 'Publisher', legBroker: 'Broker', legSub: 'Subscriber', legThird: 'Third party',
    legUp: 'uplink telemetry (solid)', legDown: 'downlink command (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 570">
        <defs>
          <marker id="ipm-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ipm-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ipm-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="220" rx="12" stroke="var(--dc3-ext-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="240" x="30" y="70"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionPub }}</text>
        <rect fill="var(--dc3-region-amber)" height="300" rx="12" stroke="var(--dc3-bus-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="420" x="330" y="70"/>
        <text fill="var(--dc3-bus-text)" font-size="10" font-weight="600" x="344" y="90">{{ s.regionBroker }}</text>
        <rect fill="var(--dc3-region-be)" height="220" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="480" x="810" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="824" y="90">{{ s.regionSub }}</text>
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1260" x="30" y="390"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="410">{{ s.regionQos }}</text>

        <!-- arrows (before nodes) -->
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="244" x2="346" y1="138"
              y2="128"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="295" y="118">{{ s.e1 }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="244" x2="346" y1="218"
              y2="178"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="295" y="210">{{ s.e2 }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="734" x2="826" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="780" y="122">{{ s.e3 }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="826" x2="734" y1="168"
              y2="168"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="780" y="186">{{ s.e4 }}</text>
        <path d="M 700 91 L 700 58 L 1160 58 L 1160 91" fill="none" marker-end="url(#ipm-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="930" y="52">{{ s.e5 }}</text>
        <path d="M 930 213 L 930 235 L 640 235 L 640 219" fill="none" marker-end="url(#ipm-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="790" y="230">{{ s.e6 }}</text>
        <path d="M 380 219 L 380 262 L 145 262 L 145 250" fill="none" marker-end="url(#ipm-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="end" x="262" y="256">{{ s.e7 }}</text>

        <!-- QoS strip arrows -->
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="78" x2="402" y1="436"
              y2="436"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="240" y="428">{{ s.aPub }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="498" x2="822" y1="428"
              y2="428"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="660" y="420">{{ s.aPub }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="822" x2="498" y1="446"
              y2="446"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="660" y="459">{{ s.aAck }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="918" x2="1242" y1="424"
              y2="424"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1080" y="416">{{ s.aPub }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1242" x2="918" y1="440"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1080" y="434">{{ s.aRec }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="918" x2="1242" y1="456"
              y2="456"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1080" y="450">{{ s.aRel }}</text>
        <line marker-end="url(#ipm-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1242" x2="918" y1="472"
              y2="472"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1080" y="466">{{ s.aComp }}</text>

        <!-- publisher nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="190" x="50" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="145" y="132">{{
            s.dev1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="145" y="150">{{ s.dev1Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="190" x="50" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="145" y="212">{{
            s.dev2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="145" y="230">{{ s.dev2Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="50" y="278">{{ s.devNote }}</text>

        <!-- broker node -->
        <rect fill="var(--dc3-bus-fill)" height="120" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="380" x="350" y="95"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="700" text-anchor="middle" x="540" y="118">{{
            s.broker
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="540" y="134">{{ s.brokerSub }}</text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="540" y="156">{{ s.topicLine1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="540" y="172">{{ s.topicLine2 }}</text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="540" y="196">{{ s.portLine }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="180" x="350" y="255"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="440" y="274">{{
            s.retain
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="440" y="290">{{ s.retainSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="180" x="550" y="255"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="640" y="274">{{
            s.lwt
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="640" y="290">{{ s.lwtSub }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="350" y="345">{{ s.brokerNote }}</text>

        <!-- subscriber nodes -->
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="200" x="830" y="95"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="930" y="120">{{
            s.plat
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="930" y="138">{{ s.platSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="200" x="1060" y="95"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1160" y="120">{{
            s.third
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1160" y="138">{{ s.thirdSub }}</text>

        <!-- QoS strip nodes -->
        <text fill="var(--dc3-amber-stroke)" font-size="9.5" font-weight="700" text-anchor="middle" x="240"
              y="412">{{ s.q0 }}
        </text>
        <rect fill="var(--dc3-ext-fill)" height="14" rx="3" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="14" x="58" y="429"/>
        <rect fill="var(--dc3-bus-fill)" height="14" rx="3" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="14" x="406" y="429"/>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="240" y="472">{{ s.q0n1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="240" y="488">{{ s.q0n2 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="9.5" font-weight="700" text-anchor="middle" x="660"
              y="412">{{ s.q1 }}
        </text>
        <rect fill="var(--dc3-ext-fill)" height="14" rx="3" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="14" x="478" y="421"/>
        <rect fill="var(--dc3-bus-fill)" height="14" rx="3" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="14" x="826" y="421"/>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="660" y="486">{{ s.q1n }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="9.5" font-weight="700" text-anchor="middle" x="1080"
              y="412">{{ s.q2 }}
        </text>
        <rect fill="var(--dc3-ext-fill)" height="14" rx="3" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="14" x="898" y="417"/>
        <rect fill="var(--dc3-bus-fill)" height="14" rx="3" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="14" x="1246" y="417"/>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="1080" y="498">{{ s.q2n }}</text>
        <text fill="var(--dc3-text2)" font-size="6.5" x="58" y="424">{{ s.dev }}</text>
        <text fill="var(--dc3-text2)" font-size="6.5" x="424" y="424">{{ s.brk }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="40" y="540"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="549">{{ s.legPub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="160" y="540"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="549">{{ s.legBroker }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="280" y="540"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="549">{{ s.legSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="390" y="540"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="549">{{ s.legThird }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="510" x2="540" y1="545" y2="545"/>
        <text fill="var(--dc3-text2)" font-size="9" x="546" y="549">{{ s.legUp }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="700" x2="730" y1="545" y2="545"/>
        <text fill="var(--dc3-text2)" font-size="9" x="736" y="549">{{ s.legDown }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
