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
    aria: 'CoAP 双模式模型：客户端模式下驱动按周期对资源路径 GET、写命令 PUT；服务端模式下驱动监听 /data 资源，设备主动 POST 上报 PointValue JSON。两者都跑在 UDP 5683 上',
    modelNote: '请求/响应模型 (类 REST) · GET / PUT / POST + 资源路径 · UDP 承载 · 报文仅几十字节',
    laneClient: '客户端模式 CLIENT (默认 mode=CLIENT) · 驱动主动读写',
    laneServer: '服务端模式 SERVER / BOTH (显式开启) · 设备主动上报',
    drvName: 'dc3-driver-coap',
    drvSub: 'CoAP 客户端 · Eclipse Californium',
    drvB1: '· 采集 cron 0/30 GET readPath',
    drvB2: '· clientTimeout 5s · CON 重传 4 次',
    trName: 'UDP 5683',
    trSub: 'DTLS/CoAPS 5684 (配置预留) · CON/NON 确认',
    cdevName: 'CoAP 设备 (受限终端)',
    cdevSub: '电池供电 · NB-IoT / 6LoWPAN',
    cdevSub2: '资源可经 /.well-known/core 发现',
    q1: 'GET coap://host:5683/temp ▶',
    q2: '◀ 2.05 Content · payload 即位号值',
    qw: 'PUT writePath ▶',
    qwSub: 'application/json · 2.04 Changed',
    sdevName: '受限终端',
    sdevSub: '偶尔醒来主动上报 · 不接受轮询',
    sdevSub2: '省电省流量的推送场景',
    srvName: 'CoAP 服务端 (Californium)',
    srvSub: 'serverHost 0.0.0.0 · serverPort 5683',
    srvSub2: '注册 /data 资源接收上报',
    outName: 'PointValue JSON 解析',
    outSub: '· 须含 deviceId + pointId',
    outSub2: '· 缺失 → 丢弃 + warn 日志',
    p1: 'POST /data ▶',
    p1Sub: '遥测 JSON',
    p2: '解析转发 ▶',
    p2Sub: '批量上送位号值',
    errNote: '空 body → 4.00 Bad Request · 解析失败静默丢弃不影响其它消息',
    legDrv: '驱动 (客户端/服务端)',
    legDev: '设备 / 终端',
    legRead: '读 GET / 响应',
    legWrite: '写 PUT',
    legPush: '上报 POST',
    legProto: '协议 / 传输'
  },
  en: {
    aria: 'CoAP dual-mode model: in client mode the driver GETs resource paths per schedule and PUTs on write commands; in server mode the driver listens on /data and devices POST PointValue JSON actively. Both ride on UDP 5683',
    modelNote: 'request/response (REST-like) · GET / PUT / POST + resource paths · over UDP · messages tens of bytes',
    laneClient: 'client mode CLIENT (default) · driver actively reads/writes',
    laneServer: 'server mode SERVER / BOTH (explicit) · devices push',
    drvName: 'dc3-driver-coap',
    drvSub: 'CoAP client · Eclipse Californium',
    drvB1: '· read cron 0/30 GETs readPath',
    drvB2: '· clientTimeout 5s · CON retransmit 4',
    trName: 'UDP 5683',
    trSub: 'DTLS/CoAPS 5684 (reserved) · CON/NON ack',
    cdevName: 'CoAP device (constrained)',
    cdevSub: 'battery-powered · NB-IoT / 6LoWPAN',
    cdevSub2: 'resources discoverable via /.well-known/core',
    q1: 'GET coap://host:5683/temp ▶',
    q2: '◀ 2.05 Content · payload is the value',
    qw: 'PUT writePath ▶',
    qwSub: 'application/json · 2.04 Changed',
    sdevName: 'constrained device',
    sdevSub: 'wakes up and pushes · cannot be polled',
    sdevSub2: 'power/bandwidth saving push cases',
    srvName: 'CoAP server (Californium)',
    srvSub: 'serverHost 0.0.0.0 · serverPort 5683',
    srvSub2: 'registers /data to receive reports',
    outName: 'PointValue JSON parse',
    outSub: '· must contain deviceId + pointId',
    outSub2: '· otherwise dropped with a warn',
    p1: 'POST /data ▶',
    p1Sub: 'telemetry JSON',
    p2: 'parse & forward ▶',
    p2Sub: 'batched point values',
    errNote: 'empty body → 4.00 Bad Request · parse failures dropped silently',
    legDrv: 'driver (client/server)',
    legDev: 'device / endpoint',
    legRead: 'read GET / response',
    legWrite: 'write PUT',
    legPush: 'push POST',
    legProto: 'protocol / transport'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="coap-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="coap-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="coap-ah-bus" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-bus-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="coap-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#coap-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- lane regions -->
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.laneClient }}</text>
        <rect fill="var(--dc3-region-amber)" height="250" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="340"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="358">{{ s.laneServer }}</text>

        <!-- lane 1 arrows -->
        <line marker-end="url(#coap-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="428" x2="852" y1="170"
              y2="170"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="640" y="160">{{ s.q1 }}</text>
        <line marker-end="url(#coap-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="852" x2="428" y1="215"
              y2="215"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="640" y="207">{{ s.q2 }}</text>
        <line marker-end="url(#coap-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="428" x2="852" y1="262" y2="262"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="560" y="254">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="560" y="278">{{ s.qwSub }}</text>

        <!-- lane 2 arrows -->
        <line marker-end="url(#coap-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="418" x2="522"
              y1="455" y2="455"/>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="470" y="443">{{ s.p1 }}</text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="470" y="474">{{ s.p1Sub }}</text>
        <line marker-end="url(#coap-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="858" x2="962" y1="455"
              y2="455"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="910" y="443">{{ s.p2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="910" y="474">{{ s.p2Sub }}</text>

        <!-- lane 1 nodes -->
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="340"
              x="80" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="250" y="138">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="250" y="158">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="182">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="200">{{ s.drvB2 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="60" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="280"
              x="500" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="640" y="108">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="640" y="128">{{ s.trSub }}</text>

        <rect fill="var(--dc3-ext-fill)" height="110" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="380" x="860" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1050" y="138">{{
            s.cdevName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1050" y="158">{{ s.cdevSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="180">{{ s.cdevSub2 }}</text>

        <!-- lane 2 nodes -->
        <rect fill="var(--dc3-ext-fill)" height="110" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="340" x="70" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="428">{{
            s.sdevName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="448">{{ s.sdevSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="470">{{ s.sdevSub2 }}</text>

        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="530" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="690" y="428">{{
            s.srvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="690" y="448">{{ s.srvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="690" y="470">{{ s.srvSub2 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="970" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1110" y="428">{{
            s.outName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1110" y="450">{{ s.outSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1110" y="468">{{ s.outSub2 }}</text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="660" y="560">{{ s.errNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legDrv }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="240" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="262" y="669">{{ s.legDev }}</text>
        <line marker-end="url(#coap-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="410" x2="460" y1="664"
              y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="468" y="669">{{ s.legRead }}</text>
        <line marker-end="url(#coap-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="610" x2="660" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="668" y="669">{{ s.legWrite }}</text>
        <line marker-end="url(#coap-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="760" x2="810"
              y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="818" y="669">{{ s.legPush }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="920" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="942" y="669">{{ s.legProto }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
