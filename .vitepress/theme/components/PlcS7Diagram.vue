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
    aria: '西门子 S7 主从模型：驱动作为 S7 客户端，把读写请求封装为 S7 PDU，经 COTP 与 TCP 102 送到 PLC，按 DB 号+字节偏移访问非优化数据块，PLC 被动应答',
    modelNote: '主从 / 请求-响应模型 · S7comm 逐层封装 · PLC 被动应答',
    platRegion: '平台侧 Platform · S7 主站 (client)',
    plcRegion: '设备侧 · 西门子 S7 PLC (STEP 7 / TIA Portal 工程)',
    drvName: 'dc3-driver-plcs7',
    drvSub: 'S7 主站 · iot-communication (S7PLC)',
    drvB1: '· 连接按 deviceId 复用 · 锁串行化读写 · 自动重连',
    drvB2: '· 读写异常 → 作废连接，下次访问重建',
    typeChip: 'plcType 决定寻址方案',
    typeSub1: 'S200 / S200_SMART / S300 / S400',
    typeSub2: 'S1200 / S1500 / SINUMERIK_828D · 填错回退 S1200',
    wrName: '写命令 Write',
    wrSub: '复用位号地址 · 按值类型写回',
    a1: '读请求 DB1.DBW0 ▼',
    a2: '▲ 应答值 (Real 4B)',
    a3: '写值 ▼ (类型编码)',
    stackName: 'S7 读/写 PDU · 参数区 + 数据区',
    cotpName: 'COTP (ISO 8073) 连接传输',
    tcpName: 'TCP · 端口 102',
    encapNote: '▼ 逐层封装 encapsulation',
    a4: 'S7 请求帧 ▼',
    a5: '▲ 应答帧',
    plcName: 'S7-1200 / S7-1500 CPU',
    plcSub: '不主动上报 · 主站不问不应答',
    reqName: '接入前置条件 (TIA Portal)',
    reqSub1: '· CPU 属性勾选『允许 PUT/GET 通信访问』',
    reqSub2: '· DB 关闭『优化的块访问』→ 偏移地址稳定',
    dbName: 'DB1 · 非优化的数据块 (字节偏移固定)',
    cell1: 'DB1.DBD0',
    cell1Sub: 'Real · 4 字节',
    cell2: 'DB1.DBW4',
    cell2Sub: 'Int · 2 字节',
    cell3: 'DB1.DBX6.0',
    cell3Sub: 'Bool · 1 位',
    cell4: '…宽度按位号类型',
    cell4Sub: 'BOOL 位 / BYTE 1B / INT 4B…',
    addrNote: '地址 = DB{dbNum}.{byteOffset}[.{bitOffset}] · bitOffset 仅布尔位号且 >0 时生效 · 一个驱动进程可连多台 PLC',
    legPlat: '平台 / 主站',
    legPlc: 'PLC / 设备',
    legRead: '读请求 / 应答',
    legWrite: '写命令',
    legProto: '协议栈',
    legDb: 'DB 内存布局'
  },
  en: {
    aria: 'Siemens S7 master/slave model: the driver, acting as S7 client, wraps read/write requests into S7 PDUs carried over COTP and TCP 102 to the PLC, addressing non-optimized data blocks by DB number and byte offset; the PLC only replies',
    modelNote: 'master/slave request-response · layered S7comm encapsulation · PLC only replies',
    platRegion: 'Platform · S7 master (client)',
    plcRegion: 'Device side · Siemens S7 PLC (STEP 7 / TIA Portal)',
    drvName: 'dc3-driver-plcs7',
    drvSub: 'S7 master · iot-communication (S7PLC)',
    drvB1: '· connection reused per deviceId · locked serial R/W · auto reconnect',
    drvB2: '· R/W failure invalidates the connection, rebuilt next access',
    typeChip: 'plcType selects addressing',
    typeSub1: 'S200 / S200_SMART / S300 / S400',
    typeSub2: 'S1200 / S1500 / SINUMERIK_828D · falls back to S1200',
    wrName: 'Write command',
    wrSub: 'reuses point address · writes by value type',
    a1: 'read request DB1.DBW0 ▼',
    a2: '▲ reply value (Real 4B)',
    a3: 'write value ▼ (typed)',
    stackName: 'S7 read/write PDU · parameter + data',
    cotpName: 'COTP (ISO 8073) transport',
    tcpName: 'TCP · port 102',
    encapNote: '▼ layered encapsulation',
    a4: 'S7 request frame ▼',
    a5: '▲ reply frame',
    plcName: 'S7-1200 / S7-1500 CPU',
    plcSub: 'never reports on its own · stays silent unless polled',
    reqName: 'Prerequisites (TIA Portal)',
    reqSub1: '· enable "PUT/GET communication" in CPU properties',
    reqSub2: '· disable "optimized block access" on the DB → stable offsets',
    dbName: 'DB1 · non-optimized data block (fixed byte offsets)',
    cell1: 'DB1.DBD0',
    cell1Sub: 'Real · 4 bytes',
    cell2: 'DB1.DBW4',
    cell2Sub: 'Int · 2 bytes',
    cell3: 'DB1.DBX6.0',
    cell3Sub: 'Bool · 1 bit',
    cell4: '…width by point type',
    cell4Sub: 'BOOL bit / BYTE 1B / INT 4B…',
    addrNote: 'address = DB{dbNum}.{byteOffset}[.{bitOffset}] · bitOffset only for boolean points > 0 · one driver process serves many PLCs',
    legPlat: 'platform / master',
    legPlc: 'PLC / device',
    legRead: 'read request / reply',
    legWrite: 'write command',
    legProto: 'protocol stack',
    legDb: 'DB memory layout'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="s7-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="s7-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="s7-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#s7-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="40"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="58">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="220" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1240" x="40" y="410"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="428">{{ s.plcRegion }}</text>

        <!-- arrows between platform and stack -->
        <line marker-end="url(#s7-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="350" x2="350" y1="174"
              y2="204"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="358" y="194">{{ s.a1 }}</text>
        <line marker-end="url(#s7-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="560" x2="560" y1="204"
              y2="174"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="568" y="194">{{ s.a2 }}</text>
        <line marker-end="url(#s7-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="1170" x2="1170" y1="174" y2="404"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" x="948" y="300">{{ s.a3 }}</text>
        <!-- arrows between stack and PLC -->
        <line marker-end="url(#s7-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="500" x2="500" y1="362"
              y2="404"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="508" y="388">{{ s.a4 }}</text>
        <line marker-end="url(#s7-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="700" y1="404"
              y2="362"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="708" y="388">{{ s.a5 }}</text>

        <!-- protocol stack bars -->
        <rect fill="var(--dc3-bus-fill)" height="44" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="380" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="660" y="236">{{
            s.stackName
          }}
        </text>
        <rect fill="var(--dc3-bus-fill)" height="44" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="380" y="262"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="660" y="288">{{
            s.cotpName
          }}
        </text>
        <rect fill="var(--dc3-bus-fill)" height="44" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="380" y="314"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="660" y="340">{{
            s.tcpName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" x="960" y="292">{{ s.encapNote }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="540"
              x="80" y="64"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="350" y="92">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="350" y="112">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="134">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="150">{{ s.drvB2 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="90" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="660" y="64"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="850" y="88">{{
            s.typeChip
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="850" y="108">{{ s.typeSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="850" y="124">{{ s.typeSub2 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="90" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="1080" y="64"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1170" y="98">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1170" y="118">{{ s.wrSub }}</text>

        <!-- PLC nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="520"
              x="80" y="436"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="340" y="464">{{
            s.plcName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="340" y="486">{{ s.plcSub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="70" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="600" x="650" y="436"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="950" y="460">{{
            s.reqName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="666" y="482">{{ s.reqSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="666" y="498">{{ s.reqSub2 }}</text>

        <!-- DB memory ruler -->
        <rect fill="var(--dc3-db-fill)" height="76" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="1170"
              x="80" y="524"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="665" y="546">{{
            s.dbName
          }}
        </text>
        <rect fill="var(--dc3-fe-fill)" height="36" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="270"
              x="90" y="556"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="225" y="571">{{
            s.cell1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="225" y="585">{{ s.cell1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="36" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="270"
              x="380" y="556"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="515" y="571">{{
            s.cell2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="515" y="585">{{ s.cell2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="36" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="270"
              x="670" y="556"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="805" y="571">{{
            s.cell3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="805" y="585">{{ s.cell3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="36" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="270"
              x="960" y="556"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1095" y="571">{{
            s.cell4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1095" y="585">{{ s.cell4Sub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="618">{{ s.addrNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="190" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="669">{{ s.legPlc }}</text>
        <line marker-end="url(#s7-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="330" x2="380" y1="664"
              y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="388" y="669">{{ s.legRead }}</text>
        <line marker-end="url(#s7-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="550" x2="600" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="608" y="669">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="740" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="762" y="669">{{ s.legProto }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="880" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="902" y="669">{{ s.legDb }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
