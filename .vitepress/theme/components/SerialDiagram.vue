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
    aria: '串口驱动模型：驱动作为串口主站按周期发送 HEX 指令、收回原始字节帧，按帧头帧尾定位、校验、再按格式解码成位号值；物理层只管字节，协议语义由位号属性描述',
    modelNote: '主从轮询模型 · 串口只规定字节怎么传 · 语义靠 HEX 指令 + 帧解析规则描述',
    platRegion: '平台侧 Platform · 串口主站',
    devRegion: '现场设备 · 私有报文仪表 (挂接在串口线路上的从站)',
    frameRegion: '回帧解析 parseResponse (位号属性描述 · ①定位 → ②校验 → ③解码)',
    drvName: 'dc3-driver-serial',
    drvSub: '串口主站 · jSerialComm · DRIVER_CLIENT',
    drvB1: '· 每设备一条独立串口连接 (按设备缓存)',
    drvB2: '· 在线 = 串口已打开 · 采集 cron 0/30',
    lineChip: '线路参数 (须与设备逐项一致)',
    lineSub1: '波特率 9600 · 数据位 8 · 停止位 1',
    lineSub2: '校验 0 无 · 读超时 1000ms',
    lineSub3: '无握手协商 · 任一不符即乱码/超时',
    wrName: '写命令 Write',
    wrSub1: 'sendCommand 模板 ${value} 替换',
    wrSub2: '渲染后整帧 HEX 发出 · 不读回包',
    a1: '发送 HEX 指令 ▼',
    a1Sub: '01 03 00 00 00 0A C5 CD',
    a2: '◀ 原始字节回帧',
    trName: 'RS232 点对点 · RS485/RS422 总线',
    trSub2: 'port /dev/ttyUSB0 · COM3',
    trunkLabel: '字节流 TxD/RxD',
    busLabel: 'RS485 半双工总线 (两线 D+ / D−)',
    dev1: '仪表 / 变送器',
    dev1Sub: '温度 · 压力 · 流量',
    dev2: '电表 / 水表',
    dev2Sub: '厂商私有报文',
    dev3: '扫码枪',
    dev3Sub: 'RS232 透传',
    dev4: 'PLC 串口模块',
    dev4Sub: '非标准协议网关',
    frC1: '帧头 frameHeader',
    frC1Sub: '01 03 · 定位帧起点 (indexOf)',
    frC2: '数据区 dataOffset..dataLength',
    frC2Sub: '偏移相对帧头之后 · 0 = 取到校验前',
    frC3: '校验区 checksumType',
    frC3Sub: 'CRC16 占 2B / XOR 占 1B / NONE',
    frC4: '帧尾 frameFooter',
    frC4Sub: '0D 0A · 从帧头之后反向定位',
    step1: '① 定位帧',
    step1Sub: '帧头/帧尾切出整帧',
    step2: '② 校验',
    step2Sub: '按 checksumType 比对，不符报错',
    step3: '③ 解码',
    step3Sub: 'dataFormat (HEX/ASCII/BINARY/FLOAT) × byteOrder',
    legPlat: '平台 / 主站',
    legDev: '设备 / 从站',
    legProto: '串口 / 线路',
    legFrame: '帧布局 / 解析',
    legRead: '读指令 / 回帧'
  },
  en: {
    aria: 'Serial driver model: the driver acts as serial master, sends HEX commands per cycle and receives raw byte frames, locating by header/footer, verifying checksum, then decoding by format into point values; the physical layer only carries bytes',
    modelNote: 'master/slave polling · serial only defines byte transport · semantics described by HEX commands + frame rules',
    platRegion: 'Platform · serial master',
    devRegion: 'Field devices · private-protocol instruments on the serial line',
    frameRegion: 'Response parsing parseResponse (point attributes · ①locate → ②verify → ③decode)',
    drvName: 'dc3-driver-serial',
    drvSub: 'serial master · jSerialComm · DRIVER_CLIENT',
    drvB1: '· one serial connection per device (cached)',
    drvB2: '· online = port open · read cron 0/30',
    lineChip: 'line parameters (must match the device)',
    lineSub1: 'baud 9600 · data bits 8 · stop bits 1',
    lineSub2: 'parity 0 none · read timeout 1000ms',
    lineSub3: 'no negotiation · any mismatch → garbage/timeout',
    wrName: 'Write command',
    wrSub1: 'sendCommand template ${value} replace',
    wrSub2: 'rendered frame sent as HEX · no reply read',
    a1: 'send HEX command ▼',
    a1Sub: '01 03 00 00 00 0A C5 CD',
    a2: '◀ raw byte frame',
    trName: 'RS232 point-to-point · RS485/RS422 bus',
    trSub2: 'port /dev/ttyUSB0 · COM3',
    trunkLabel: 'byte stream TxD/RxD',
    busLabel: 'RS485 half-duplex bus (D+ / D−)',
    dev1: 'instrument / transmitter',
    dev1Sub: 'temperature · pressure · flow',
    dev2: 'energy / water meter',
    dev2Sub: 'vendor private frames',
    dev3: 'barcode scanner',
    dev3Sub: 'RS232 passthrough',
    dev4: 'PLC serial module',
    dev4Sub: 'non-standard gateway',
    frC1: 'header frameHeader',
    frC1Sub: '01 03 · frame start (indexOf)',
    frC2: 'data dataOffset..dataLength',
    frC2Sub: 'offset after header · 0 = up to checksum',
    frC3: 'checksum checksumType',
    frC3Sub: 'CRC16 2B / XOR 1B / NONE',
    frC4: 'footer frameFooter',
    frC4Sub: '0D 0A · located backwards from end',
    step1: '① locate frame',
    step1Sub: 'cut by header/footer',
    step2: '② verify',
    step2Sub: 'compare per checksumType, else fail',
    step3: '③ decode',
    step3Sub: 'dataFormat (HEX/ASCII/BINARY/FLOAT) × byteOrder',
    legPlat: 'platform / master',
    legDev: 'devices / slaves',
    legProto: 'serial / line',
    legFrame: 'frame layout / parsing',
    legRead: 'command / reply'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 780">
        <defs>
          <marker id="ser-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ser-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#ser-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- platform region -->
        <rect fill="var(--dc3-region-be)" height="170" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.platRegion }}</text>

        <!-- send/receive arrows -->
        <line marker-end="url(#ser-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="520" x2="520" y1="204"
              y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="532" y="222">{{ s.a1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="532" y="240">{{ s.a1Sub }}</text>
        <line marker-end="url(#ser-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="700" y1="246"
              y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="712" y="228">{{ s.a2 }}</text>

        <!-- serial wire (trunk + bus + drops, one path) -->
        <path d="M 660 306 L 660 386 M 100 386 L 1230 386 M 220 386 L 220 416 M 530 386 L 530 416 M 840 386 L 840 416 M 1150 386 L 1150 416"
              fill="none" stroke="var(--dc3-bus-stroke)" stroke-width="1.4"/>
        <text fill="var(--dc3-bus-text)" font-size="8" x="670" y="344">{{ s.trunkLabel }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="660" y="378">{{ s.busLabel }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="440"
              x="80" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="300" y="118">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="300" y="138">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="162">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="180">{{ s.drvB2 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="110" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="340" x="560" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="730" y="116">{{
            s.lineChip
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="730" y="138">{{ s.lineSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="730" y="156">{{ s.lineSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="730" y="174">{{ s.lineSub3 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="110" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="300"
              x="940" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1090" y="116">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1090" y="138">{{ s.wrSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1090" y="156">{{ s.wrSub2 }}</text>

        <!-- transport chip (between arrows and wire) -->
        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="400"
              x="460" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="660" y="274">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="660" y="292">{{ s.trSub2 }}</text>

        <!-- device region -->
        <rect fill="var(--dc3-region-amber)" height="130" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="410"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="428">{{ s.devRegion }}</text>

        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="280"
              x="80" y="444"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="220" y="472">{{
            s.dev1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="220" y="492">{{ s.dev1Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="280"
              x="390" y="444"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="530" y="472">{{
            s.dev2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="530" y="492">{{ s.dev2Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="280"
              x="700" y="444"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="840" y="472">{{
            s.dev3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="840" y="492">{{ s.dev3Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="280"
              x="1010" y="444"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1150" y="472">{{
            s.dev4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1150" y="492">{{ s.dev4Sub }}</text>

        <!-- frame anatomy region -->
        <rect fill="var(--dc3-region-be)" height="190" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="560"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="578">{{ s.frameRegion }}</text>

        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="80" y="592"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="205" y="614">{{
            s.frC1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="205" y="632">{{ s.frC1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="350"
              x="345" y="592"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="520" y="614">{{
            s.frC2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="520" y="632">{{ s.frC2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="710" y="592"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="835" y="614">{{
            s.frC3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="835" y="632">{{ s.frC3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="975" y="592"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1100" y="614">{{
            s.frC4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1100" y="632">{{ s.frC4Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="360" x="80" y="668"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="260" y="690">{{
            s.step1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="260" y="708">{{ s.step1Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="360" x="470" y="668"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="650" y="690">{{
            s.step2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="650" y="708">{{ s.step2Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="360" x="860" y="668"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="1040" y="690">{{
            s.step3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1040" y="708">{{ s.step3Sub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="759">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="759">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="350" y="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="372" y="759">{{ s.legProto }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="530" y="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="552" y="759">{{ s.legFrame }}</text>
        <line marker-end="url(#ser-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="690" x2="740" y1="754"
              y2="754"/>
        <text fill="var(--dc3-text2)" font-size="9" x="748" y="759">{{ s.legRead }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
