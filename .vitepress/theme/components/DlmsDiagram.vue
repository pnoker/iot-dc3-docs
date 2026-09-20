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
    aria: 'DLMS/COSEM 抄表模型：驱动作为 DLMS 客户端经 TCP 4059 或串口连到表计，以 clientAddress/serverAddress 建立关联，按 OBIS 编码定位 COSEM 对象、按属性编号取值，只读无写命令',
    modelNote: '对象化寻址模型 · COSEM 对象 + OBIS 编码 + 属性编号 · 只读抄表 (无写命令)',
    platRegion: '平台侧 Platform · DLMS 客户端',
    devRegion: '计量侧 · COSEM 服务端 (电表 / 水表 / 气表 / 热表 · IEC 62056)',
    drvName: 'dc3-driver-dlms',
    drvSub: 'DLMS 客户端 · Gurux GXDLMSClient',
    drvB1: '· clientAddress=16 (公共客户端)',
    drvB2: '· 认证 NONE / LOW / HIGH + password',
    drvB3: '· 采集 cron 0/30 · 不提供写命令',
    tcpName: 'TCP :4059 (DLMS 标准端口)',
    tcpSub: 'transportType=TCP · host + port',
    serName: '串口 SERIAL (二选一)',
    serSub: 'serialPort=/dev/ttyUSB0 · baudRate 9600',
    pvName: '位号值 PointValue',
    pvArrow: '计量值上送',
    q1: 'ReadRequest ▶',
    q1Sub: 'logicalName + attributeId=2',
    q2: '◀ 属性值',
    q2Sub: '统一转字符串上报',
    meterName: 'COSEM 服务端 (表计 / 集中器)',
    meterSub: 'serverAddress=1 · 对象化数据模型',
    assocName: '关联 Association',
    assocSub: 'clientAddress ↔ serverAddress 建立会话 · 认证级别决定可读对象范围',
    obj1: 'CLOCK · 0.0.1.0.0.255',
    obj1Sub: '时钟对象 · objectType=CLOCK',
    obj2: 'REGISTER · 1.0.1.8.0.255',
    obj2Sub: '总有功电能 · 属性 2 = 当前值',
    obj3: 'REGISTER · 1.0.32.7.0.255',
    obj3Sub: 'A 相电压 · 同一编码跨厂商同义',
    obisName: 'OBIS 编码 = 6 段 A.B.C.D.E.F',
    obisSub: '计量语义标准化 · 接入前须查表确认编码与对象类型',
    cmpNote: '与 Modbus 按裸寄存器地址不同：DLMS 按『对象 + OBIS 编码 + 属性编号』寻址，语义跨厂商可移植',
    legPlat: '平台 / 客户端',
    legDev: '表计 / 服务端',
    legRead: '读：请求 ◀▶ 响应',
    legTcp: 'TCP 4059',
    legSerial: '串口 (备选)',
    legObj: 'COSEM 对象'
  },
  en: {
    aria: 'DLMS/COSEM metering model: the driver acts as DLMS client over TCP 4059 or serial, establishes an association by client/server addresses, locates COSEM objects by OBIS code and reads attribute values; read-only with no write command',
    modelNote: 'object addressing · COSEM object + OBIS code + attribute id · read-only metering (no writes)',
    platRegion: 'Platform · DLMS client',
    devRegion: 'Metering side · COSEM server (electricity / water / gas / heat · IEC 62056)',
    drvName: 'dc3-driver-dlms',
    drvSub: 'DLMS client · Gurux GXDLMSClient',
    drvB1: '· clientAddress=16 (public client)',
    drvB2: '· authentication NONE / LOW / HIGH + password',
    drvB3: '· read cron 0/30 · no write command',
    tcpName: 'TCP :4059 (DLMS standard port)',
    tcpSub: 'transportType=TCP · host + port',
    serName: 'Serial SERIAL (either/or)',
    serSub: 'serialPort=/dev/ttyUSB0 · baudRate 9600',
    pvName: 'PointValue',
    pvArrow: 'metered value uplink',
    q1: 'ReadRequest ▶',
    q1Sub: 'logicalName + attributeId=2',
    q2: '◀ attribute value',
    q2Sub: 'reported as string',
    meterName: 'COSEM server (meter / concentrator)',
    meterSub: 'serverAddress=1 · object data model',
    assocName: 'Association',
    assocSub: 'clientAddress ↔ serverAddress session · auth level scopes readable objects',
    obj1: 'CLOCK · 0.0.1.0.0.255',
    obj1Sub: 'clock object · objectType=CLOCK',
    obj2: 'REGISTER · 1.0.1.8.0.255',
    obj2Sub: 'total active energy · attribute 2 = value',
    obj3: 'REGISTER · 1.0.32.7.0.255',
    obj3Sub: 'phase A voltage · same code across vendors',
    obisName: 'OBIS code = 6 fields A.B.C.D.E.F',
    obisSub: 'standardized metering semantics · look up codes before onboarding',
    cmpNote: 'unlike raw Modbus register addresses, DLMS addresses by object + OBIS code + attribute id — portable across vendors',
    legPlat: 'platform / client',
    legDev: 'meter / server',
    legRead: 'read: request ◀▶ response',
    legTcp: 'TCP 4059',
    legSerial: 'serial (alternative)',
    legObj: 'COSEM objects'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 680">
        <defs>
          <marker id="dlms-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="dlms-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#dlms-grid)" height="100%" width="100%"/>

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
        <line marker-end="url(#dlms-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="230"
              y2="230"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="218">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="248">{{ s.q1Sub }}</text>
        <line marker-end="url(#dlms-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="290"
              y2="290"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="314">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="280">{{ s.q2Sub }}</text>

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

        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="320"
              x="80" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="274">{{
            s.tcpName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="240" y="292">{{ s.tcpSub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="330"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="354">{{
            s.serName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="372">{{ s.serSub }}</text>

        <line marker-end="url(#dlms-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="398"
              y2="430"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="418">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="434"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="454">{{
            s.pvName
          }}
        </text>

        <!-- meter nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="580"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="950" y="120">{{
            s.meterName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="140">{{ s.meterSub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="580" x="660" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="200">{{
            s.assocName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="218">{{ s.assocSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="252"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="274">{{
            s.obj1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="294">{{ s.obj1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="316"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="338">{{
            s.obj2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="358">{{ s.obj2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="402">{{
            s.obj3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="422">{{ s.obj3Sub }}</text>

        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="580"
              x="660" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="950" y="486">{{
            s.obisName
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="950" y="506">{{ s.obisSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="560">{{ s.cmpNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="653">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="653">{{ s.legDev }}</text>
        <line marker-end="url(#dlms-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="340" x2="390" y1="648"
              y2="648"/>
        <text fill="var(--dc3-text2)" font-size="9" x="398" y="653">{{ s.legRead }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="550" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="572" y="653">{{ s.legTcp }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="680" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="702" y="653">{{ s.legSerial }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="820" y="644"/>
        <text fill="var(--dc3-text2)" font-size="9" x="842" y="653">{{ s.legObj }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
