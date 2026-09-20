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
    aria: '传感与测量体系：物理量经敏感元件、信号调理、A/D 转换变成原始码，再按位号换算参数落成工程值；执行链是感知的镜像，命令值经 D/A、功率驱动回到物理动作，构成闭环',
    regionAnalog: '物理世界 · 模拟域（读路径上半段）',
    regionDigital: '数字域（量化）',
    regionDc3: 'IoT DC3 · 位号模型（工程值）',
    regionAct: '执行链 · 写路径（感知的镜像）',
    phy: '物理量', phySub: '温度 / 压力 / 振动 / 位移',
    sen: '敏感元件', senSub: '能量转换 · 电阻/电容/压电/热电',
    cond: '信号调理', condSub: '放大 / 滤波 / 电平搬移 / 激励',
    adc: 'A/D 转换', adcSub: '采样率 × 量化位数',
    raw: '原始码', rawSub: '寄存器读数 · 例 2531',
    conv: '线性换算', convSub: 'multiple / baseValue',
    pv: '位号值 PointValue', pvSub: 'unit=℃ · 25.31 · rwFlag',
    pvWrite: '可写位号 Point', pvWriteSub: 'rwFlag = READ/WRITE',
    cmd: '命令值', cmdSub: '上层决策 / 设定值',
    da: 'D/A 转换', daSub: '数字量 → 模拟量',
    drv: '功率驱动', drvSub: '放大 / 隔离 / 阀门定位',
    act: '执行器', actSub: '电机 / 阀门 / 继电器',
    eff: '物理动作', effSub: '转速 / 开度 / 通断',
    e1: '能量转换', e2: 'mV 级信号', e3: '滤波后模拟量',
    e4: '量化', e5: 'raw code', e6: '工程值',
    e7: 'rwFlag 可写', e8: '设定值', e9: '模拟量',
    e10: '驱动信号', e11: '反向能量转换',
    loopLabel: '闭环 · 再传感',
    formula: '工程值 = 原始值 × multiple + baseValue',
    accNote: '分辨率 = 看得多细 · 精度 = 看得对',
    nyqNote: '奈奎斯特：fs ≥ 2 × fmax，欠采样混叠不可逆',
    enobNote: '有效位数 ENOB 受噪声地板限制',
    famNote: '标定：零点 + 斜率（必要时整条曲线）',
    legAnalog: '物理 / 模拟域', legDigital: '数字域', legDc3: 'DC3 位号模型',
    legAct: '执行链（写）', legRead: '读路径（实线）', legWrite: '写路径 / 闭环（虚线）'
  },
  en: {
    aria: 'Sensing and measurement chain: a physical quantity passes the sensing element, signal conditioning and A/D conversion into a raw code, then is scaled by point coefficients into an engineering value; the actuation chain mirrors sensing, turning command values via D/A and power drive back into physical action',
    regionAnalog: 'Physical world · analog domain (read path)',
    regionDigital: 'Digital domain (quantize)',
    regionDc3: 'IoT DC3 · point model (engineering value)',
    regionAct: 'Actuation chain · write path (mirror of sensing)',
    phy: 'Physical quantity', phySub: 'temp / pressure / vibration',
    sen: 'Sensing element', senSub: 'resistive / capacitive / piezo / thermoelectric',
    cond: 'Signal conditioning', condSub: 'amplify / filter / shift / excite',
    adc: 'A/D conversion', adcSub: 'sample rate × bit depth',
    raw: 'Raw code', rawSub: 'register reading, e.g. 2531',
    conv: 'Linear scaling', convSub: 'multiple / baseValue',
    pv: 'PointValue', pvSub: 'unit=℃ · 25.31 · rwFlag',
    pvWrite: 'Writable Point', pvWriteSub: 'rwFlag = READ/WRITE',
    cmd: 'Command value', cmdSub: 'decision / setpoint',
    da: 'D/A conversion', daSub: 'digital → analog',
    drv: 'Power drive', drvSub: 'amplify / isolate / position',
    act: 'Actuator', actSub: 'motor / valve / relay',
    eff: 'Physical action', effSub: 'speed / opening / on-off',
    e1: 'energy conversion', e2: 'mV signal', e3: 'filtered analog',
    e4: 'quantize', e5: 'raw code', e6: 'eng. value',
    e7: 'rwFlag writable', e8: 'setpoint', e9: 'analog',
    e10: 'drive signal', e11: 'reverse conversion',
    loopLabel: 'closed loop · re-sense',
    formula: 'eng. value = raw × multiple + baseValue',
    accNote: 'resolution = fineness · accuracy = correctness',
    nyqNote: 'Nyquist: fs ≥ 2 × fmax, aliasing is irreversible',
    enobNote: 'effective bits (ENOB) limited by noise floor',
    famNote: 'calibration: zero + slope (full curve if needed)',
    legAnalog: 'Physical / analog', legDigital: 'Digital', legDc3: 'DC3 point model',
    legAct: 'Actuation (write)', legRead: 'read path (solid)', legWrite: 'write / loop (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 610">
        <defs>
          <marker id="sens-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="sens-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#sens-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="260" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="500" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionAnalog }}</text>
        <rect fill="var(--dc3-region-be)" height="260" rx="12" stroke="var(--dc3-fe-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="310" x="545" y="70"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="559" y="90">{{ s.regionDigital }}</text>
        <rect fill="var(--dc3-region-be)" height="260" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="370" x="880" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="894" y="90">{{ s.regionDc3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="190" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1210" x="30" y="340"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="360">{{ s.regionAct }}</text>

        <!-- read-path arrows (analog chain) -->
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="162" x2="201" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="182" y="156">{{ s.e1 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="332" x2="371" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="352" y="156">{{ s.e2 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="517" x2="556" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="537" y="156">{{ s.e3 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="684" x2="706" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="695" y="156">{{ s.e4 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="837" x2="891" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="864" y="156">{{ s.e5 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1019" x2="1046" y1="165"
              y2="165"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1033" y="156">{{ s.e6 }}</text>

        <!-- pv -> cmd (write trigger, dashed vertical) -->
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="1195"
              x2="1195" y1="205" y2="396"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1145" y="380">{{ s.e7 }}</text>

        <!-- write-path arrows (right to left) -->
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="1056"
              x2="1021" y1="435" y2="435"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1038" y="426">{{ s.e8 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="891"
              x2="876" y1="435" y2="435"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="862" y="455">{{ s.e9 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="721"
              x2="706" y1="435" y2="435"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="692" y="455">{{ s.e10 }}</text>
        <line marker-end="url(#sens-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="371"
              x2="356" y1="435" y2="435"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="342" y="455">{{ s.e11 }}</text>

        <!-- closed loop: physical action -> physical quantity -->
        <path d="M 38 430 C 12 340 12 240 42 172" fill="none" marker-end="url(#sens-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="3,3" stroke-width="0.9"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" font-weight="600" text-anchor="middle" transform="rotate(-90 22 305)"
              x="22" y="305">{{ s.loopLabel }}</text>

        <!-- analog nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="115" x="47" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="104" y="158">{{
            s.phy
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="104" y="176">{{ s.phySub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="125" x="207" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="269" y="158">{{
            s.sen
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="269" y="176">{{ s.senSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="140" x="377" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="447" y="158">{{
            s.cond
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="447" y="176">{{ s.condSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="46" y="228">{{ s.famNote }}</text>

        <!-- digital nodes -->
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="120" x="564" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="624" y="158">{{
            s.adc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="624" y="176">{{ s.adcSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="125" x="712" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="774" y="158">{{
            s.raw
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="774" y="176">{{ s.rawSub }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="560" y="230">{{ s.nyqNote }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="560" y="250">{{ s.enobNote }}</text>

        <!-- DC3 nodes -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="120" x="899" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="959" y="158">{{
            s.conv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="959" y="176">{{ s.convSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="175" x="1049" y="130"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1136" y="158">{{
            s.pv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1136" y="176">{{ s.pvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" font-weight="600" x="895" y="228">{{ s.formula }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="895" y="248">{{ s.accNote }}</text>

        <!-- actuation nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="130" x="46" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="111" y="428">{{
            s.eff
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="111" y="446">{{ s.effSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="125" x="226" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="288" y="428">{{
            s.act
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="288" y="446">{{ s.actSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="70" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="140" x="407" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="477" y="428">{{
            s.drv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="477" y="446">{{ s.drvSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="70" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="125" x="592" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="654" y="428">{{
            s.da
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="654" y="446">{{ s.daSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="130" x="878" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="943" y="428">{{
            s.cmd
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="943" y="446">{{ s.cmdSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="175" x="1058" y="400"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1145" y="428">{{
            s.pvWrite
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1145" y="446">{{ s.pvWriteSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="40" y="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="574">{{ s.legAnalog }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="180" y="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="202" y="574">{{ s.legDigital }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="290" y="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="574">{{ s.legDc3 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="440" y="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="462" y="574">{{ s.legAct }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="590" x2="620" y1="570" y2="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="626" y="574">{{ s.legRead }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="760" x2="790" y1="570" y2="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="796" y="574">{{ s.legWrite }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
