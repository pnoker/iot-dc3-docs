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
    aria: 'EtherNet/IP 接入模型：驱动通过 CIP Data Table Read/Write 服务按标签名读写 Allen-Bradley PLC，显式报文走 TCP 44818，返回字节按 tagType 小端解码',
    modelNote: '主从 / 请求-响应模型 · CIP 按标签名寻址 (而非寄存器地址)',
    platRegion: '平台侧 Platform · CIP 客户端',
    devRegion: '设备侧 · Allen-Bradley PLC (ControlLogix / CompactLogix)',
    drvName: 'dc3-driver-ethernet-ip',
    drvSub: 'CIP 客户端 · 手工组帧',
    drvB1: '· slot 背板槽位 (校验必填)',
    drvB2: '· timeout 5000ms → 套接字 SoTimeout',
    drvB3: '· 读写异常 → 连接失效重连',
    trName: 'TCP 44818 · CIP 显式报文',
    trSub: '隐式 I/O (UDP 2222) 本驱动不涉及',
    wrName: '写命令 Write',
    wrSub: '按 tagType 编码值 · sendCommand 模板预留未消费',
    pvName: '位号值 PointValue',
    pvArrow: '标签值上送',
    q1: 'Data Table Read ▶',
    q1Sub: 'tagName=Motor_Speed',
    q2: '◀ 单元素值',
    q2Sub: '小端字节 · elementCount 暂固定 1',
    qw: 'Data Table Write ▶',
    qwSub: '按 tagType 编码写入',
    plcName: 'ControlLogix / CompactLogix CPU',
    plcSub: '背板 slot 定位 CPU 模块 · ODVA CIP 生态',
    tagsName: '控制器标签表 Controller Tags (按名访问)',
    tag1: 'Motor_Speed · DINT',
    tag1Sub: '4 字节整型',
    tag2: 'Valve_Open · BOOL',
    tag2Sub: '1 字节开关量',
    tag3: 'Batch_Name · STRING',
    tag3Sub: 'ASCII 文本',
    typeChip: 'tagType 决定字节解码 (驱动不探测类型)',
    typeSub: 'BOOL/SINT 1B · INT 2B · DINT 4B · REAL 4B · STRING · 小端序',
    cmpNote: '与 Modbus 寄存器地址不同：CIP 直接按 PLC 工程变量名读写，程序改动后地址不漂移；标签名必须与工程逐字一致',
    legPlat: '平台 / 驱动',
    legDev: 'PLC / 设备',
    legRead: '读标签 ◀▶ 响应',
    legWrite: '写标签',
    legProto: '协议 / 传输',
    legTag: '标签表'
  },
  en: {
    aria: 'EtherNet/IP access model: the driver reads and writes Allen-Bradley PLC tags by name via CIP Data Table Read/Write services, explicit messaging over TCP 44818, reply bytes decoded little-endian by tagType',
    modelNote: 'master/slave request-response · CIP addresses tags by name (not register numbers)',
    platRegion: 'Platform · CIP client',
    devRegion: 'Device side · Allen-Bradley PLC (ControlLogix / CompactLogix)',
    drvName: 'dc3-driver-ethernet-ip',
    drvSub: 'CIP client · hand-built frames',
    drvB1: '· slot backplane position (validated, required)',
    drvB2: '· timeout 5000ms → socket SoTimeout',
    drvB3: '· R/W failure invalidates the connection',
    trName: 'TCP 44818 · CIP explicit messaging',
    trSub: 'implicit I/O (UDP 2222) not used by this driver',
    wrName: 'Write command',
    wrSub: 'value encoded by tagType · sendCommand template reserved',
    pvName: 'PointValue',
    pvArrow: 'tag value uplink',
    q1: 'Data Table Read ▶',
    q1Sub: 'tagName=Motor_Speed',
    q2: '◀ single element',
    q2Sub: 'little-endian · elementCount pinned to 1',
    qw: 'Data Table Write ▶',
    qwSub: 'encoded by tagType',
    plcName: 'ControlLogix / CompactLogix CPU',
    plcSub: 'backplane slot locates the CPU · ODVA CIP ecosystem',
    tagsName: 'Controller Tags (addressed by name)',
    tag1: 'Motor_Speed · DINT',
    tag1Sub: '4-byte integer',
    tag2: 'Valve_Open · BOOL',
    tag2Sub: '1-byte discrete',
    tag3: 'Batch_Name · STRING',
    tag3Sub: 'ASCII text',
    typeChip: 'tagType drives decoding (driver never probes)',
    typeSub: 'BOOL/SINT 1B · INT 2B · DINT 4B · REAL 4B · STRING · little-endian',
    cmpNote: 'unlike Modbus register numbers, CIP reads PLC project variables by name — addresses do not drift; tag names must match the project character for character',
    legPlat: 'platform / driver',
    legDev: 'PLC / device',
    legRead: 'read tag ◀▶ response',
    legWrite: 'write tag',
    legProto: 'protocol / transport',
    legTag: 'tag table'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 680">
        <defs>
          <marker id="eip-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="eip-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="eip-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#eip-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="580" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="580" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="660" x="620" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="632" y="68">{{ s.devRegion }}</text>

        <!-- gap arrows -->
        <line marker-end="url(#eip-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="230"
              y2="230"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="218">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="248">{{ s.q1Sub }}</text>
        <line marker-end="url(#eip-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="290"
              y2="290"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="314">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="280">{{ s.q2Sub }}</text>
        <line marker-end="url(#eip-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="382" y2="382"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="370">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="400">{{ s.qwSub }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="120" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="122">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="142">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="166">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="184">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="202">{{ s.drvB3 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="320"
              x="80" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="274">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="240" y="294">{{ s.trSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="350"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="374">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="394">{{ s.wrSub }}</text>

        <line marker-end="url(#eip-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="420"
              y2="452"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="440">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="456"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="476">{{
            s.pvName
          }}
        </text>

        <!-- PLC nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="580"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="950" y="120">{{
            s.plcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="140">{{ s.plcSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="36" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="218">{{
            s.tagsName
          }}
        </text>

        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="248"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="268">{{
            s.tag1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="286">{{ s.tag1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="306"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="326">{{
            s.tag2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="344">{{ s.tag2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="364"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="384">{{
            s.tag3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="402">{{ s.tag3Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="580" x="660" y="440"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="464">{{
            s.typeChip
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="484">{{ s.typeSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="546">{{ s.cmpNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="653">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="653">{{ s.legDev }}</text>
        <line marker-end="url(#eip-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="340" x2="390" y1="648"
              y2="648"/>
        <text fill="var(--dc3-text2)" font-size="9" x="398" y="653">{{ s.legRead }}</text>
        <line marker-end="url(#eip-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="550" x2="600" y1="648" y2="648"/>
        <text fill="var(--dc3-text2)" font-size="9" x="608" y="653">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="720" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="742" y="653">{{ s.legProto }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="880" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="902" y="653">{{ s.legTag }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
