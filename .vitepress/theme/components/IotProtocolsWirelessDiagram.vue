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
    aria: '无线与广域接入对比平面：横轴覆盖距离从十米到广域，纵轴速率带宽。免授权频段区含 BLE、Zigbee、Wi-Fi 与 LPWAN 的 LoRaWAN，授权蜂窝区含 NB-IoT 与 5G；距离越远速率与功耗越低的权衡趋势贯穿全图，底部给出各技术的汇聚路径与应用层协议正交组合的提示',
    regionIsm: '免授权 ISM 频段（自建网 · 免资费 · 易拥塞）',
    regionLic: '授权蜂窝（运营商承载 · 深覆盖 · 计费）',
    licNote: '授权频段：覆盖穿透好 · 合规 · 按流量计费',
    trend: '距离 ↑ → 速率 ↓ · 功耗 ↓',
    xTitle: '覆盖距离 →', yTitle: '速率 / 带宽 ↑',
    tx1: '十米', tx2: '百米', tx3: '千米', tx4: '数公里', tx5: '广域 · 蜂窝',
    ty1: '高', ty2: '中', ty3: '低', ty4: '极低',
    ble: 'BLE 低功耗蓝牙', bleSub: '2.4G · 极低功耗 · 纽扣电池数年',
    zigbee: 'Zigbee', zigbeeSub: '802.15.4 mesh 互中继 · 楼宇家居',
    wifi: 'Wi-Fi', wifiSub: '高带宽 · 高功耗 · 视频与网关回传',
    lora: 'LoRaWAN', loraSub: 'Sub-GHz LPWAN · 极低速率 · 自建网',
    nb: 'NB-IoT', nbSub: '蜂窝 LPWAN · 省电 · 海量低速连接',
    g5: '5G', g5Sub: 'eMBB / uRLLC · 高功耗 · 视频与远程控制',
    ortho: '应用层协议 × 无线接入 = 正交组合',
    orthoL1: '同一份 MQTT 报文可跑在 Wi-Fi，也可跑在 NB-IoT 蜂窝链路上',
    orthoL2: '选型分两步：先按消息模型选应用层协议，再按物理约束选无线',
    aggr1: 'BLE / Zigbee → 手机或网关中继',
    aggr2: 'LoRaWAN → 自建网关 (NS)',
    aggr3: 'NB-IoT / 5G → 运营商核心网',
    aggr4: '→ broker / REST → DC3 MQTT·CoAP·HTTP 驱动',
    legIsm: '免授权短距', legLpwan: '免授权 LPWAN', legLic: '授权蜂窝',
    legTrend: '权衡趋势（虚线）'
  },
  en: {
    aria: 'Wireless and wide-area comparison plane: the X axis is coverage from ten meters to wide area, the Y axis is rate. The unlicensed ISM band holds BLE, Zigbee, Wi-Fi and the LoRaWAN LPWAN, the licensed cellular band holds NB-IoT and 5G; a trade-off trend of lower rate and lower power at longer range runs across the chart, with aggregation paths and the orthogonality tip at the bottom',
    regionIsm: 'Unlicensed ISM (self-built · free · congestible)',
    regionLic: 'Licensed cellular (carrier · deep coverage · billed)',
    licNote: 'licensed band: good penetration · compliant · metered',
    trend: 'range ↑ → rate ↓ · power ↓',
    xTitle: 'coverage →', yTitle: 'rate / bandwidth ↑',
    tx1: '10 m', tx2: '100 m', tx3: 'km', tx4: 'km+', tx5: 'wide · cellular',
    ty1: 'high', ty2: 'mid', ty3: 'low', ty4: 'very low',
    ble: 'BLE', bleSub: '2.4G · ultra-low power · coin cell for years',
    zigbee: 'Zigbee', zigbeeSub: '802.15.4 mesh relay · home & building',
    wifi: 'Wi-Fi', wifiSub: 'high bandwidth · high power · video backhaul',
    lora: 'LoRaWAN', loraSub: 'Sub-GHz LPWAN · tiny rate · self-built',
    nb: 'NB-IoT', nbSub: 'cellular LPWAN · frugal · massive low-rate',
    g5: '5G', g5Sub: 'eMBB / uRLLC · power hungry · video & remote control',
    ortho: 'App protocol × radio = orthogonal',
    orthoL1: 'the same MQTT packet runs over Wi-Fi or over an NB-IoT link',
    orthoL2: 'choose in two steps: message model first, then physical constraints',
    aggr1: 'BLE / Zigbee → phone or gateway relay',
    aggr2: 'LoRaWAN → self-built NS gateway',
    aggr3: 'NB-IoT / 5G → carrier core',
    aggr4: '→ broker / REST → DC3 MQTT·CoAP·HTTP drivers',
    legIsm: 'Unlicensed short', legLpwan: 'Unlicensed LPWAN', legLic: 'Licensed cellular',
    legTrend: 'Trade-off (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 600">
        <defs>
          <marker id="ipw-axis" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow-label)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="ipw-trend" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="ipw-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ipw-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ipw-grid)" height="100%" width="100%"/>

        <!-- band regions -->
        <rect fill="var(--dc3-region-be)" height="350" rx="12" stroke="var(--dc3-fe-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="640" x="180" y="80"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="192" y="100">{{ s.regionIsm }}</text>
        <rect fill="var(--dc3-region-amber)" height="350" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="360" x="820" y="80"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="832" y="100">{{ s.regionLic }}</text>

        <!-- reading guides -->
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="240" x2="240" y1="150" y2="428"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="420" x2="420" y1="150" y2="428"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="600" x2="600" y1="150" y2="428"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="780" x2="780" y1="150" y2="428"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="1000" x2="1000" y1="150" y2="428"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="180" x2="1180" y1="165" y2="165"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="180" x2="1180" y1="245" y2="245"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="180" x2="1180" y1="325" y2="325"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="180" x2="1180" y1="405" y2="405"/>

        <!-- trade-off trend -->
        <line marker-end="url(#ipw-trend)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4"
              stroke-width="1.2" x1="430" x2="556" y1="212" y2="370"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" font-weight="600" text-anchor="middle"
              transform="rotate(52 503 276)" x="503" y="276">{{ s.trend }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" x="860" y="245">{{ s.licNote }}</text>

        <!-- axes -->
        <line marker-end="url(#ipw-axis)" stroke="var(--dc3-arrow-label)" stroke-width="1.2" x1="170" x2="1190"
              y1="430" y2="430"/>
        <text fill="var(--dc3-arrow-label)" font-size="10" font-weight="600" text-anchor="middle" x="680"
              y="454">{{ s.xTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="448">{{ s.tx1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="420" y="448">{{ s.tx2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="600" y="448">{{ s.tx3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="780" y="448">{{ s.tx4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1000" y="448">{{ s.tx5 }}</text>
        <line marker-end="url(#ipw-axis)" stroke="var(--dc3-arrow-label)" stroke-width="1.2" x1="170" x2="170"
              y1="440" y2="70"/>
        <text fill="var(--dc3-arrow-label)" font-size="10" font-weight="600" text-anchor="middle"
              transform="rotate(-90 140 255)" x="140" y="255">{{ s.yTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="162" y="168">{{ s.ty1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="162" y="248">{{ s.ty2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="162" y="328">{{ s.ty3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="162" y="408">{{ s.ty4 }}</text>

        <!-- nodes: unlicensed short -->
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="175" y="321"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="250" y="344">{{
            s.ble
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="250" y="362">{{ s.bleSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="255" y="251"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="330" y="274">{{
            s.zigbee
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="330" y="292">{{ s.zigbeeSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="255" y="141"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="330" y="164">{{
            s.wifi
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="330" y="182">{{ s.wifiSub }}</text>

        <!-- nodes: LPWAN -->
        <rect fill="var(--dc3-bus-fill)" height="58" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="150" x="575" y="361"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="650" y="384">{{
            s.lora
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="650" y="402">{{ s.loraSub }}</text>

        <!-- nodes: licensed -->
        <rect fill="var(--dc3-amber-fill)" height="58" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="825" y="321"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="900" y="344">{{
            s.nb
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="900" y="362">{{ s.nbSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="58" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="985" y="141"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1060" y="164">{{
            s.g5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1060" y="182">{{ s.g5Sub }}</text>

        <!-- legend inside plot -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="192" y="112"/>
        <text fill="var(--dc3-text2)" font-size="9" x="214" y="121">{{ s.legIsm }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="310" y="112"/>
        <text fill="var(--dc3-text2)" font-size="9" x="332" y="121">{{ s.legLpwan }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="440" y="112"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="121">{{ s.legLic }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1.2" x1="580" x2="610" y1="117"
              y2="117"/>
        <text fill="var(--dc3-text2)" font-size="9" x="616" y="121">{{ s.legTrend }}</text>

        <!-- orthogonality card -->
        <rect fill="var(--dc3-be-fill)" height="76" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="420" x="30" y="490"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="700" text-anchor="middle" x="240" y="512">{{
            s.ortho
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="240" y="532">{{ s.orthoL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="240" y="550">{{ s.orthoL2 }}</text>

        <!-- aggregation chips -->
        <rect fill="var(--dc3-ext-fill)" height="36" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="190" x="480" y="494"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="575" y="516">{{
            s.aggr1
          }}
        </text>
        <line marker-end="url(#ipw-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="672" x2="686" y1="512"
              y2="512"/>
        <rect fill="var(--dc3-ext-fill)" height="36" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="180" x="690" y="494"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="780" y="516">{{
            s.aggr2
          }}
        </text>
        <line marker-end="url(#ipw-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="872" x2="886" y1="512"
              y2="512"/>
        <rect fill="var(--dc3-ext-fill)" height="36" rx="8" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="170" x="890" y="494"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="975" y="516">{{
            s.aggr3
          }}
        </text>
        <rect fill="var(--dc3-be-fill)" height="36" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="250" x="1060" y="494"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="1185" y="516">{{
            s.aggr4
          }}
        </text>
        <line marker-end="url(#ipw-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1028" x2="1056" y1="512"
              y2="512"/>
      </svg>
    </div>
  </DiagramFrame>
</template>
