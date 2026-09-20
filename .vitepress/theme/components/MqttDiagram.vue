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
    aria: 'MQTT 发布/订阅模型：设备把遥测 JSON 发布到上行主题，驱动常驻订阅并解析成位号值；写命令沿命令主题反向发布。发布方与订阅方只与 broker 通信，互不感知',
    modelNote: '发布/订阅模型 · 发布方与订阅方互不感知 · 无需同时在线',
    devRegion: '设备侧 · 发布方 Publisher',
    busRegion: '消息层 · MQTT Broker (topic 路由)',
    platRegion: '平台侧 · 订阅方 Subscriber',
    devName: 'MQTT 设备',
    devSub: '传感器 / 网关 / 边缘盒子',
    devSub2: 'sub: device/1001/down',
    devNote1: '上报由设备自主触发',
    devNote2: '平台离线也不影响采集端',
    brokerName: 'MQTT Broker',
    brokerSub: 'RabbitMQ MQTT 插件 :1883 · EMQX 可选 :31883',
    brokerTls: 'TLS/8883 跨公网 · keep-alive 15s',
    topicUp: 'topic: device/+/up',
    topicUpSub: '遥测上行 · 通配 + 匹配一层',
    topicDown: 'topic: device/1001/down',
    topicDownSub: '命令下行 · commandTopic',
    topicEvt: 'topic: eventTopic',
    topicEvtSub: '事件 · eventCodePath / payloadPath',
    qosNote: 'QoS 0 最多一次 · 1 至少一次 · 2 恰好一次 · 通配符 # 匹配末尾任意层',
    drvName: 'dc3-driver-mqtt',
    drvSub: 'DRIVER_SERVER · 常驻订阅',
    drvB1: '· read() 恒为 null',
    drvB2: '· 报文须含 deviceId + pointId',
    drvB3: '· 批量：满 100 条或 5s 刷出',
    drvB4: '· QoS 取不到时回退默认',
    drvSubs: 'sub: device/+/up · eventTopic',
    drvHealth: '健康 = broker 连接态事件',
    pubUp: 'publish · QoS1',
    pubUpSub: '{deviceId, pointId, value}',
    deliverUp: 'deliver',
    deliverUpSub: '订阅匹配 · JSON 解析',
    pubDown: 'publish · QoS2',
    pubDownSub: 'payloadTemplate 渲染',
    deliverDown: 'deliver',
    deliverDownSub: '设备订阅 commandTopic',
    evtFlow: '事件上报',
    pvFlow: '批量上送',
    pvName: '位号值 PointValue',
    evtName: '设备事件',
    legDev: '设备 / 发布方',
    legBroker: 'Broker / topic',
    legPlat: '驱动 / 订阅方',
    legPub: 'publish 发布流',
    legDeliver: 'deliver 投递流',
    legData: '解析输出'
  },
  en: {
    aria: 'MQTT pub/sub model: devices publish telemetry JSON to uplink topics while the driver keeps a standing subscription and parses them into point values; write commands publish back on the command topic. Publishers and subscribers only talk to the broker',
    modelNote: 'publish/subscribe · publishers and subscribers never see each other · no simultaneity required',
    devRegion: 'Device side · Publisher',
    busRegion: 'Message layer · MQTT Broker (topic routing)',
    platRegion: 'Platform · Subscriber',
    devName: 'MQTT device',
    devSub: 'sensor / gateway / edge box',
    devSub2: 'sub: device/1001/down',
    devNote1: 'reporting driven by the device',
    devNote2: 'platform downtime does not block it',
    brokerName: 'MQTT Broker',
    brokerSub: 'RabbitMQ MQTT plugin :1883 · EMQX optional :31883',
    brokerTls: 'TLS/8883 over WAN · keep-alive 15s',
    topicUp: 'topic: device/+/up',
    topicUpSub: 'telemetry uplink · + matches one level',
    topicDown: 'topic: device/1001/down',
    topicDownSub: 'command downlink · commandTopic',
    topicEvt: 'topic: eventTopic',
    topicEvtSub: 'events · eventCodePath / payloadPath',
    qosNote: 'QoS 0 at-most-once · 1 at-least-once · 2 exactly-once · wildcard # matches tail',
    drvName: 'dc3-driver-mqtt',
    drvSub: 'DRIVER_SERVER · standing subscribe',
    drvB1: '· read() always returns null',
    drvB2: '· payload needs deviceId + pointId',
    drvB3: '· batch: flush at 100 msgs or 5s',
    drvB4: '· falls back to default QoS',
    drvSubs: 'sub: device/+/up · eventTopic',
    drvHealth: 'health = broker connection state events',
    pubUp: 'publish · QoS1',
    pubUpSub: '{deviceId, pointId, value}',
    deliverUp: 'deliver',
    deliverUpSub: 'subscription match · JSON parse',
    pubDown: 'publish · QoS2',
    pubDownSub: 'rendered payloadTemplate',
    deliverDown: 'deliver',
    deliverDownSub: 'device subscribes commandTopic',
    evtFlow: 'event report',
    pvFlow: 'batched uplink',
    pvName: 'PointValue',
    evtName: 'Device event',
    legDev: 'device / publisher',
    legBroker: 'broker / topic',
    legPlat: 'driver / subscriber',
    legPub: 'publish flow',
    legDeliver: 'deliver flow',
    legData: 'parsed output'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 660">
        <defs>
          <marker id="mqtt-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mqtt-ah-bus" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-bus-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mqtt-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mqtt-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#mqtt-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="430" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="250" x="40" y="110"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="128">{{ s.devRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="430" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="380" x="470" y="110"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="482" y="128">{{ s.busRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="430" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="250" x="1030" y="110"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="1042" y="128">{{ s.platRegion }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#mqtt-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2"
              x1="262" x2="462" y1="250" y2="250"/>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="362" y="232">{{ s.pubUp }}</text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="362" y="270">{{ s.pubUpSub }}</text>
        <line marker-end="url(#mqtt-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="838" x2="1037" y1="250" y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="937" y="232">{{ s.deliverUp }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="937" y="270">{{ s.deliverUpSub }}
        </text>
        <line marker-end="url(#mqtt-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="1037" x2="838" y1="430" y2="430"/>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="937" y="412">{{ s.pubDown }}</text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="937" y="450">{{ s.pubDownSub }}</text>
        <line marker-end="url(#mqtt-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1"
              x1="462" x2="262" y1="430" y2="430"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="362" y="412">{{ s.deliverDown }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="362" y="450">{{ s.deliverDownSub }}
        </text>
        <!-- parsed outputs below driver -->
        <line marker-end="url(#mqtt-ah)" stroke="var(--dc3-arrow)" stroke-width="1"
              x1="1090" x2="1090" y1="386" y2="456"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1090" y="425">{{ s.evtFlow }}</text>
        <line marker-end="url(#mqtt-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              x1="1220" x2="1220" y1="386" y2="456"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1220" y="425">{{ s.pvFlow }}</text>

        <!-- broker nodes -->
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="340" x="490" y="150"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="660" y="176">{{
            s.brokerName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="660" y="196">{{ s.brokerSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="340"
              x="490" y="226"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="660" y="248">{{
            s.topicUp
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="266">{{ s.topicUpSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="340"
              x="490" y="290"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="660" y="312">{{
            s.topicDown
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="330">{{ s.topicDownSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="340"
              x="490" y="354"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="660" y="376">{{
            s.topicEvt
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="394">{{ s.topicEvtSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="436">{{ s.qosNote }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="456">{{ s.brokerTls }}</text>

        <!-- device node -->
        <rect fill="var(--dc3-ext-fill)" height="90" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="200" x="55" y="205"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="155" y="233">{{
            s.devName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="155" y="253">{{ s.devSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="155" y="271">{{ s.devSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="165" y="330">{{ s.devNote1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="165" y="350">{{ s.devNote2 }}</text>

        <!-- driver node -->
        <rect fill="var(--dc3-be-fill)" height="196" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="1045" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1155" y="208">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1155" y="226">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="254">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="272">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="290">{{ s.drvB3 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="308">{{ s.drvB4 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="326">{{ s.drvSubs }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="1061" y="344">{{ s.drvHealth }}</text>

        <!-- outputs -->
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="110" x="1035" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1090" y="486">{{
            s.evtName
          }}
        </text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="110"
              x="1165" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1220" y="486">{{
            s.pvName
          }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="629">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="200" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="629">{{ s.legBroker }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="360" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="629">{{ s.legPlat }}</text>
        <line marker-end="url(#mqtt-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="520" x2="570"
              y1="624" y2="624"/>
        <text fill="var(--dc3-text2)" font-size="9" x="578" y="629">{{ s.legPub }}</text>
        <line marker-end="url(#mqtt-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="700"
              x2="750" y1="624" y2="624"/>
        <text fill="var(--dc3-text2)" font-size="9" x="758" y="629">{{ s.legDeliver }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="900" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="922" y="629">{{ s.legData }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
