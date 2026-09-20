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
    aria: 'SL651 水文遥测模型：分散野外的测站经 GPRS/4G/北斗把定时报、加报、报警报主动推送到驱动的 SL651 TCP 服务端，驱动按报文头测站地址匹配设备、按 index 取要素值并批量上送',
    modelNote: '服务端被动接收模型 · 测站主动上报 · read=null / write=false · 采集由上报触发',
    devRegion: '遥测站侧 · SL651-2014 RTU (野外分散)',
    platRegion: '平台侧 · 解析与上送 (dc3-driver-sl651)',
    rtu1: '雨量站 RTU',
    rtu1Sub: '时段雨量',
    rtu2: '水位站 RTU',
    rtu2Sub: '水位 / 流量',
    rtu3: '水库大坝站 RTU',
    rtu3Sub: '水情工情',
    trigName: '上报触发 (测站自主决定)',
    trigB1: '· 定时报 (整点)',
    trigB2: '· 加报 (要素超限)',
    trigB3: '· 报警报 (异常事件)',
    linkName: '广域链路',
    linkSub: 'GPRS / 4G / 北斗卫星',
    pushLabel: '遥测报文 push ▶',
    srvName: 'SL651 TCP 服务端',
    srvSub: '监听 :5001 · 鉴权 pwd 0000',
    srvSub2: '一个端口服务全部测站 · 站址区分设备',
    frC1: '报文头',
    frC1Sub: '测站地址 + 功能码',
    frC2: '报文体',
    frC2Sub: '遥测要素有序列表',
    parseArrow: '解析 ▼',
    cbArrow: 'onMessage 回调 ▶',
    st1: '① 站址匹配',
    st1Sub: '报文头地址(hex) ↔ deviceCode/name (不区分大小写)',
    st2: '② 要素取值',
    st2Sub: '位号 index 下标取要素列表第 N 个 (0 基)',
    st3: '③ 组装 PointValue',
    st3Sub: '遍历该设备位号按 index 取值',
    st4: '④ pointValueSender',
    st4Sub: '批量发往数据中心',
    pvName: '位号值 PointValue',
    f1: '设备命中',
    f2: '要素值',
    f3: 'PointValue 列表',
    f4: '批量上送',
    warnNote: '站址对不上 deviceCode → 静默丢弃 · 定时读取关闭 · 无写命令',
    legDev: '遥测站 (上报方)',
    legSrv: 'SL651 服务端',
    legPlat: '解析 / 上送',
    legPush: '上报推送流',
    legFrame: '报文结构'
  },
  en: {
    aria: 'SL651 hydrological telemetry model: scattered field stations push periodic, additional and alarm reports over GPRS/4G/BeiDou to the driver SL651 TCP server, which matches devices by station address, takes element values by index and uploads them in batches',
    modelNote: 'passive server model · stations push actively · read=null / write=false · collection is report-driven',
    devRegion: 'Station side · SL651-2014 RTUs (scattered in the field)',
    platRegion: 'Platform · parse and uplink (dc3-driver-sl651)',
    rtu1: 'rain gauge RTU',
    rtu1Sub: 'period rainfall',
    rtu2: 'water level RTU',
    rtu2Sub: 'level / flow',
    rtu3: 'reservoir dam RTU',
    rtu3Sub: 'regime monitoring',
    trigName: 'report triggers (decided by the station)',
    trigB1: '· periodic (on the hour)',
    trigB2: '· additional (threshold exceeded)',
    trigB3: '· alarm (abnormal event)',
    linkName: 'wide-area links',
    linkSub: 'GPRS / 4G / BeiDou satellite',
    pushLabel: 'telemetry report push ▶',
    srvName: 'SL651 TCP server',
    srvSub: 'listen :5001 · auth pwd 0000',
    srvSub2: 'one port serves all stations · address separates devices',
    frC1: 'message header',
    frC1Sub: 'station address + function code',
    frC2: 'message body',
    frC2Sub: 'ordered element list',
    parseArrow: 'parse ▼',
    cbArrow: 'onMessage callback ▶',
    st1: '① match station',
    st1Sub: 'header address (hex) ↔ deviceCode/name (case-insensitive)',
    st2: '② pick element',
    st2Sub: 'point index picks the Nth element (0-based)',
    st3: '③ build PointValue',
    st3Sub: 'walk the device points by index',
    st4: '④ pointValueSender',
    st4Sub: 'batch send to the data center',
    pvName: 'PointValue',
    f1: 'device matched',
    f2: 'element value',
    f3: 'PointValue list',
    f4: 'batch uplink',
    warnNote: 'address mismatch → silently dropped · read schedule off · no write command',
    legDev: 'stations (pushers)',
    legSrv: 'SL651 server',
    legPlat: 'parse / uplink',
    legPush: 'push flow',
    legFrame: 'message layout'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 680">
        <defs>
          <marker id="sl651-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="sl651-ah-bus" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-bus-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="sl651-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#sl651-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="580" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="380" x="40" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.devRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="580" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="880" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="892" y="68">{{ s.platRegion }}</text>

        <!-- push arrows: RTUs → server -->
        <line marker-end="url(#sl651-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="386" x2="472"
              y1="128" y2="140"/>
        <line marker-end="url(#sl651-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="386" x2="472"
              y1="212" y2="165"/>
        <line marker-end="url(#sl651-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="386" x2="472"
              y1="296" y2="190"/>
        <text fill="var(--dc3-bus-text)" font-size="9" text-anchor="middle" x="430" y="106">{{ s.pushLabel }}</text>
        <!-- server → frame cells → parse -->
        <line marker-end="url(#sl651-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="620" x2="620" y1="214"
              y2="254"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="630" y="240">{{ s.parseArrow }}</text>
        <path d="M 836 288 L 862 288 L 862 128 L 908 128" fill="none" marker-end="url(#sl651-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="740" y="110">{{ s.cbArrow }}</text>
        <!-- parse pipeline arrows -->
        <line marker-end="url(#sl651-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1080" x2="1080" y1="162"
              y2="184"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1080" y="178">{{ s.f1 }}</text>
        <line marker-end="url(#sl651-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1080" x2="1080" y1="256"
              y2="278"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1080" y="272">{{ s.f2 }}</text>
        <line marker-end="url(#sl651-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1080" x2="1080" y1="350"
              y2="372"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1080" y="366">{{ s.f3 }}</text>
        <line marker-end="url(#sl651-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1080" x2="1080" y1="444"
              y2="466"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1080" y="460">{{ s.f4 }}</text>

        <!-- station nodes -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="300"
              x="80" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="230" y="122">{{
            s.rtu1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="230" y="142">{{ s.rtu1Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="300"
              x="80" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="230" y="206">{{
            s.rtu2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="230" y="226">{{ s.rtu2Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="300"
              x="80" y="264"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="230" y="290">{{
            s.rtu3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="230" y="310">{{ s.rtu3Sub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="90" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="80" y="370"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="230" y="394">{{
            s.trigName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="96" y="418">{{ s.trigB1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="96" y="436">{{ s.trigB2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="96" y="454">{{ s.trigB3 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="300" x="80" y="490"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="230" y="514">{{
            s.linkName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="230" y="532">{{ s.linkSub }}</text>

        <!-- server node -->
        <rect fill="var(--dc3-bus-fill)" height="90" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="280"
              x="480" y="120"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="620" y="146">{{
            s.srvName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="620" y="166">{{ s.srvSub }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="620" y="184">{{ s.srvSub2 }}</text>

        <!-- frame cells -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="446" y="258"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="541" y="282">{{
            s.frC1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="541" y="300">{{ s.frC1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="646" y="258"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="741" y="282">{{
            s.frC2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="741" y="300">{{ s.frC2Sub }}</text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="640" y="360">{{ s.warnNote }}
        </text>

        <!-- platform pipeline -->
        <rect fill="var(--dc3-fe-fill)" height="66" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="920" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="120">{{
            s.st1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1080" y="140">{{ s.st1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="66" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="920" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="214">{{
            s.st2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1080" y="234">{{ s.st2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="66" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="920" y="284"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="308">{{
            s.st3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1080" y="328">{{ s.st3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="66" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="920" y="378"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="402">{{
            s.st4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1080" y="422">{{ s.st4Sub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="920" y="470"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1080" y="490">{{
            s.pvName
          }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="220" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="242" y="669">{{ s.legSrv }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="360" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="669">{{ s.legPlat }}</text>
        <line marker-end="url(#sl651-ah-bus)" stroke="var(--dc3-bus-stroke)" stroke-width="1.2" x1="510" x2="560"
              y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="568" y="669">{{ s.legPush }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="690" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="712" y="669">{{ s.legFrame }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
