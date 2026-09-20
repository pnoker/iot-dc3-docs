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
    aria: '自动识别与定位技术选型平面：横轴为作用距离（厘米到广域），纵轴为单件与部署成本。条码、NFC、RFID 各频段构成识别族，蓝牙信标、UWB、基站、GNSS 构成定位族；距离越远，功率、电池与部署成本越高',
    regionId: "自动识别 · 回答「这是哪一个」",
    regionPos: "定位 · 回答「它在哪里」",
    legId: '识别技术（身份）', legPos: '定位技术（坐标）', legTrend: '权衡趋势',
    xTitle: '作用距离（读距 / 覆盖）→',
    yTitle: '单件 / 部署成本 ↑',
    tx1: '厘米', tx2: '十厘米', tx3: '米', tx4: '十米', tx5: '百米', tx6: '公里 / 广域',
    ty1: '极低', ty2: '低', ty3: '中', ty4: '高',
    trend: '更远 → 更费电 / 更贵',
    bc: '条码 / 二维码', bcSub: '光学 · 需视线 · 抗污差',
    nfc: 'NFC', nfcSub: '约 4cm · 手机内置 · 双向',
    lf: 'RFID LF / HF', lfSub: '厘米级 · 抗金属液体 · 13.56MHz',
    uhfP: 'RFID UHF 无源', uhfPSub: '4–7m · 批量盘点 · 几分钱',
    uhfA: 'RFID UHF 有源', uhfASub: '几十米 · 带电池 · 可带传感',
    ble: '蓝牙信标', bleSub: '米级 RSSI · 部署便宜 · 区域级',
    uwb: 'UWB', uwbSub: '10–30cm · 需部署锚点 · 测飞行时间',
    cell: '基站定位', cellSub: '几十–几百米 · 无需硬件 · 兜底',
    gnss: 'GNSS (GPS/北斗)', gnssSub: '米级 · 室外 · 室内失效',
    hint1: '仓储批量盘点 → UHF RFID',
    hint2: '户外车辆调度 → GNSS',
    hint3: '室内人员追踪 → UWB',
    hint4: '碰一碰配网 / 支付 → NFC'
  },
  en: {
    aria: 'Identification and positioning selection plane: the X axis is operating range (centimeters to wide area), the Y axis is per-unit and deployment cost. Barcode, NFC and the RFID bands form the identification family; BLE beacon, UWB, cellular and GNSS form the positioning family; the farther the range, the higher the power, battery and deployment cost',
    regionId: "Identification · which one is it",
    regionPos: "Positioning · where is it",
    legId: 'Identification (identity)', legPos: 'Positioning (coordinates)', legTrend: 'Trade-off trend',
    xTitle: 'Operating range (read / coverage) →',
    yTitle: 'Unit / deployment cost ↑',
    tx1: 'cm', tx2: '10 cm', tx3: 'meters', tx4: '10 m', tx5: '100 m', tx6: 'km / wide',
    ty1: 'minimal', ty2: 'low', ty3: 'medium', ty4: 'high',
    trend: 'farther → more power / cost',
    bc: 'Barcode / QR', bcSub: 'optical · line-of-sight · soil-averse',
    nfc: 'NFC', nfcSub: '~4cm · phone-built-in · two-way',
    lf: 'RFID LF / HF', lfSub: 'cm-level · metal/liquid resistant',
    uhfP: 'RFID UHF passive', uhfPSub: '4–7m · bulk scan · pennies',
    uhfA: 'RFID UHF active', uhfASub: 'tens of m · battery · sensing',
    ble: 'BLE beacon', bleSub: 'meter RSSI · cheap · zone-level',
    uwb: 'UWB', uwbSub: '10–30cm · anchors · time-of-flight',
    cell: 'Cellular', cellSub: 'tens–hundreds m · no extra HW',
    gnss: 'GNSS (GPS/BeiDou)', gnssSub: 'meter · outdoor · fails indoors',
    hint1: 'Warehouse inventory → UHF RFID',
    hint2: 'Outdoor fleet → GNSS',
    hint3: 'Indoor tracking → UWB',
    hint4: 'Tap-to-pair / pay → NFC'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 640">
        <defs>
          <marker id="idch-axis" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow-label)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="idch-trend" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="idch-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#idch-grid)" height="100%" width="100%"/>

        <!-- semantic regions inside the plane -->
        <rect fill="var(--dc3-region-be)" height="380" rx="12" stroke="var(--dc3-fe-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="540" x="160" y="90"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="176" y="110">{{ s.regionId }}</text>
        <rect fill="var(--dc3-region-amber)" height="380" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="450" x="720" y="90"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="736" y="110">{{ s.regionPos }}</text>

        <!-- faint reading guides (drawn before nodes) -->
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="205" x2="205" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="385" x2="385" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="565" x2="565" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="745" x2="745" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="925" x2="925" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="1095" x2="1095" y1="120" y2="478"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="152" x2="1180" y1="470" y2="470"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="152" x2="1180" y1="387" y2="387"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="152" x2="1180" y1="304" y2="304"/>
        <line stroke="var(--dc3-grid)" stroke-dasharray="2,6" stroke-width="1" x1="152" x2="1180" y1="221" y2="221"/>

        <!-- trade-off trend -->
        <line marker-end="url(#idch-trend)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4"
              stroke-width="1.2" x1="620" x2="800" y1="470" y2="140"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="812" y="138">{{ s.trend }}</text>

        <!-- axes -->
        <line marker-end="url(#idch-axis)" stroke="var(--dc3-arrow-label)" stroke-width="1.2" x1="150" x2="1188"
              y1="480" y2="480"/>
        <text fill="var(--dc3-arrow-label)" font-size="10" font-weight="600" text-anchor="middle" x="670"
              y="504">{{ s.xTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="205" y="498">{{ s.tx1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="385" y="498">{{ s.tx2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="565" y="498">{{ s.tx3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="745" y="498">{{ s.tx4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="925" y="498">{{ s.tx5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1095" y="498">{{ s.tx6 }}</text>
        <line marker-end="url(#idch-axis)" stroke="var(--dc3-arrow-label)" stroke-width="1.2" x1="150" x2="150"
              y1="490" y2="68"/>
        <text fill="var(--dc3-arrow-label)" font-size="10" font-weight="600" text-anchor="middle"
              transform="rotate(-90 118 280)" x="118" y="280">{{ s.yTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="142" y="473">{{ s.ty1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="142" y="390">{{ s.ty2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="142" y="307">{{ s.ty3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="end" x="142" y="224">{{ s.ty4 }}</text>

        <!-- identification nodes (fe) -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="175" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="250" y="422">{{
            s.bc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="250" y="440">{{ s.bcSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="175" y="310"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="250" y="332">{{
            s.lf
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="250" y="350">{{ s.lfSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="340" y="330"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="415" y="352">{{
            s.nfc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="415" y="370">{{ s.nfcSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="430" y="396"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="505" y="418">{{
            s.uhfP
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="505" y="436">{{ s.uhfPSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="150" x="500" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="575" y="218">{{
            s.uhfA
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="575" y="236">{{ s.uhfASub }}</text>

        <!-- positioning nodes (be) -->
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="150" x="735" y="390"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="810" y="412">{{
            s.ble
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="810" y="430">{{ s.bleSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="150" x="745" y="186"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="820" y="208">{{
            s.uwb
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="820" y="226">{{ s.uwbSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="150" x="1010" y="406"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1085" y="428">{{
            s.cell
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1085" y="446">{{ s.cellSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="150" x="1010" y="300"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1085" y="322">{{
            s.gnss
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1085" y="340">{{ s.gnssSub }}</text>

        <!-- legend (inside empty top-left of the plane) -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="176" y="128"/>
        <text fill="var(--dc3-text2)" font-size="9" x="198" y="137">{{ s.legId }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="360" y="128"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="137">{{ s.legPos }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1.2" x1="550" x2="580" y1="133"
              y2="133"/>
        <text fill="var(--dc3-text2)" font-size="9" x="586" y="137">{{ s.legTrend }}</text>

        <!-- scenario hints -->
        <rect fill="var(--dc3-amber-fill)" height="34" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="40" y="545"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="180" y="566">{{
            s.hint1
          }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="34" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="345" y="545"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="485" y="566">{{
            s.hint2
          }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="34" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="650" y="545"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="790" y="566">{{
            s.hint3
          }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="34" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="955" y="545"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1095" y="566">{{
            s.hint4
          }}
        </text>
      </svg>
    </div>
  </DiagramFrame>
</template>
