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
    aria: '欧姆龙 FINS 帧结构：请求帧由 4 字节 TCP 长度前缀、10 字节 FINS 头、2 字节命令码与读参数组成；响应帧带 2 字节结束码与数据区。驱动按内存区代码加字地址读写 D/W/H/C 区',
    modelNote: '主从 / 请求-响应模型 · FINS/TCP 帧手工组帧 · 内存区代码 + 字地址寻址',
    reqRegion: '请求帧 Request Frame (内存区读 · 一次读 1 个字)',
    reqC1: 'TCP 长度前缀 · 4B',
    reqC1Sub: 'FINS/TCP 约定',
    reqC2: 'FINS 头 · 10B',
    reqC2Sub: 'ICF/RSV/GCT + 源/目的 节点号+单元号',
    reqC3: '命令码 0101 · 2B',
    reqC3Sub: '内存区读',
    reqC4: '读参数 · 4B',
    reqC4Sub: '存储区代码 1B + 起始字地址 2B + 字数',
    resRegion: '响应帧 Response Frame',
    resC3: '结束码 · 2B',
    resC3Sub: '非 0 = PLC 拒绝/出错',
    resC4: '数据区 · N 字',
    resC4Sub: '数据从第 14 字节起 · 大端解码',
    platRegion: '平台侧 Platform · FINS 客户端',
    plcRegion: '设备侧 · 欧姆龙 PLC (CP / CJ / CS 系列)',
    drvName: 'dc3-driver-fins',
    drvSub: 'FINS 客户端 · FINS/TCP',
    drvB1: '· 不依赖第三方协议库 · 手工组帧',
    drvB2: '· 连接/读超时 timeout 5000ms',
    drvB3: '· 源/目的节点+单元号 (默认 1/2/0/0)',
    trName: 'TCP 9600 (FINS 标准端口)',
    trSub: '每帧前加 4 字节长度前缀 · protocol 固定 TCP',
    q1: '内存区读 0101 ▶',
    q2: '◀ 结束码 0 + 数据字',
    areaD: 'D 数据存储区',
    areaDSub: '区代码 0x82 · 最常用',
    areaW: 'W 工作区',
    areaWSub: '区代码 0xB1',
    areaH: 'H 保持区',
    areaHSub: '区代码 0xB0',
    areaC: 'C 计数器区',
    areaCSub: '区代码 0x83',
    addrNote: 'D100 = memoryArea=D + address=100 (address 只填数字，不带区前缀) · 字 = 16 位',
    decNote: 'dataType 决定读 1 字或 2 字 (INT32/UINT32/FLOAT 读 2 字) · 均按大端 Big-Endian 解码 · 其它区代码静默按 D 处理',
    legPlat: '平台 / 驱动',
    legPlc: 'PLC / 内存区',
    legRead: '读：请求 ◀▶ 响应',
    legProto: '协议 / 传输',
    legFrame: '帧字节布局'
  },
  en: {
    aria: 'Omron FINS frame anatomy: a request frame is a 4-byte TCP length prefix, 10-byte FINS header, 2-byte command code and read parameters; the response carries a 2-byte end code and data. The driver reads D/W/H/C memory areas by area code + word address',
    modelNote: 'master/slave request-response · hand-built FINS/TCP frames · memory area code + word address',
    reqRegion: 'Request Frame (memory area read · one word)',
    reqC1: 'TCP length prefix · 4B',
    reqC1Sub: 'FINS/TCP convention',
    reqC2: 'FINS header · 10B',
    reqC2Sub: 'ICF/RSV/GCT + src/dst node + unit',
    reqC3: 'command 0101 · 2B',
    reqC3Sub: 'memory area read',
    reqC4: 'read params · 4B',
    reqC4Sub: 'area code 1B + start word 2B + count',
    resRegion: 'Response Frame',
    resC3: 'end code · 2B',
    resC3Sub: 'non-zero = rejected / error',
    resC4: 'data · N words',
    resC4Sub: 'data from byte 14 · big-endian',
    platRegion: 'Platform · FINS client',
    plcRegion: 'Device side · Omron PLC (CP / CJ / CS)',
    drvName: 'dc3-driver-fins',
    drvSub: 'FINS client · FINS/TCP',
    drvB1: '· no third-party protocol lib · manual framing',
    drvB2: '· connect/read timeout 5000ms',
    drvB3: '· src/dst node + unit (defaults 1/2/0/0)',
    trName: 'TCP 9600 (FINS standard port)',
    trSub: '4-byte length prefix per frame · protocol fixed TCP',
    q1: 'area read 0101 ▶',
    q2: '◀ end code 0 + data words',
    areaD: 'D data memory',
    areaDSub: 'area code 0x82 · most used',
    areaW: 'W work area',
    areaWSub: 'area code 0xB1',
    areaH: 'H holding area',
    areaHSub: 'area code 0xB0',
    areaC: 'C counter area',
    areaCSub: 'area code 0x83',
    addrNote: 'D100 = memoryArea=D + address=100 (digits only, no prefix) · word = 16 bits',
    decNote: 'dataType picks 1 or 2 words (INT32/UINT32/FLOAT read 2) · decoded big-endian · unknown area codes silently treated as D',
    legPlat: 'platform / driver',
    legPlc: 'PLC / memory areas',
    legRead: 'read: request ◀▶ response',
    legProto: 'protocol / transport',
    legFrame: 'frame byte layout'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 740">
        <defs>
          <marker id="fins-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="fins-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#fins-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="670" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- request frame region -->
        <rect fill="var(--dc3-region-be)" height="110" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.reqRegion }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="80" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="165" y="106">{{
            s.reqC1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="165" y="124">{{ s.reqC1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="258" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="448" y="106">{{
            s.reqC2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="448" y="124">{{ s.reqC2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="646" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="746" y="106">{{
            s.reqC3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="746" y="124">{{ s.reqC3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="854" y="84"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="994" y="106">{{
            s.reqC4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="994" y="124">{{ s.reqC4Sub }}</text>

        <!-- response frame region -->
        <rect fill="var(--dc3-region-amber)" height="110" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="1260" x="40" y="180"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="198">{{ s.resRegion }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="80" y="214"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="165" y="236">{{
            s.reqC1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="165" y="254">{{ s.reqC1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="258" y="214"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="448" y="236">{{
            s.reqC2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="448" y="254">{{ s.reqC2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="646" y="214"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="766" y="236">{{
            s.resC3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="766" y="254">{{ s.resC3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="240"
              x="894" y="214"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1014" y="236">{{
            s.resC4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1014" y="254">{{ s.resC4Sub }}</text>

        <!-- connection regions -->
        <rect fill="var(--dc3-region-be)" height="320" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="40" y="340"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="358">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="320" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="680" x="620" y="340"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="632" y="358">{{ s.plcRegion }}</text>

        <!-- gap arrows -->
        <line marker-end="url(#fins-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="448" x2="612" y1="420"
              y2="420"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="530" y="410">{{ s.q1 }}</text>
        <line marker-end="url(#fins-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="448" y1="480"
              y2="480"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="530" y="502">{{ s.q2 }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="130" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="408">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="428">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="452">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="470">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="488">{{ s.drvB3 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="320"
              x="80" y="540"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="564">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="240" y="582">{{ s.trSub }}</text>

        <!-- memory areas -->
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="660" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="815" y="408">{{
            s.areaD
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="815" y="428">{{ s.areaDSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="990" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1145" y="408">{{
            s.areaW
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1145" y="428">{{ s.areaWSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="660" y="465"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="815" y="493">{{
            s.areaH
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="815" y="513">{{ s.areaHSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="990" y="465"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1145" y="493">{{
            s.areaC
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1145" y="513">{{ s.areaCSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="970" y="576">{{ s.addrNote }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="970" y="600">{{ s.decNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="709">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="709">{{ s.legPlc }}</text>
        <line marker-end="url(#fins-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="340" x2="390" y1="704"
              y2="704"/>
        <text fill="var(--dc3-text2)" font-size="9" x="398" y="709">{{ s.legRead }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="560" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="709">{{ s.legProto }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="720" y="700"/>
        <text fill="var(--dc3-text2)" font-size="9" x="742" y="709">{{ s.legFrame }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
