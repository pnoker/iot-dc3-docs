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
    aria: 'IEC 60870-5-104 远动模型：主站经 TCP 2404 连接远动设备，发总召唤后接收遥测遥信，遥控遥调向下发送；报文由类型标识、传送原因、公共地址与信息对象地址按字节宽度切分',
    modelNote: '电力远动模型 · 主站请求 + 服务端主动上送 (四遥) · TCP 2404',
    platRegion: '平台侧 Platform · 104 客户端 (主站)',
    devRegion: '远动侧 · 变电站 / RTU / 配电终端 DTU·FTU (104 服务端)',
    drvName: 'dc3-driver-iec104',
    drvSub: 'IEC 60870-5-104 客户端 (主站)',
    drvB1: '· host / port / asduAddress 必填',
    drvB2: '· COT/CA/IOA 字节宽度须与对端一致',
    drvB3: '· 连接超时 connectTimeout 10s',
    asduName: 'ASDU 报文解剖 (无字段分隔符)',
    asduSub1: '类型标识 + 传送原因 COT (cotLength 2B)',
    asduSub2: '+ 公共地址 CA (2B) + 信息对象地址 IOA (3B)',
    asduSub3: '公共地址区分同连接下多个逻辑站',
    wrName: '遥控 / 遥调 (execute)',
    wrSub: 'sendCommand 模板渲染 · 当前未真正下发遥控帧',
    pvName: '位号值 PointValue',
    pvArrow: '遥测/遥信上送',
    q1: '总召唤 Interrogation ▶',
    q1Sub: '按站召唤全部数据',
    q2: '◀ 遥测 M_ME_NC_1',
    q2Sub: '短浮点遥测 (默认 asduType)',
    q3: '◀ 遥信 M_SP_NA_1',
    q3Sub: '单点遥信状态',
    qw: '遥控 C_SC_NA_1 ▶',
    qwSub: '仅渲染模板 (见实现状态)',
    rtuName: '104 服务端 (远动设备)',
    rtuSub: '应答召唤 · 事件突发主动上送',
    t1: '遥测 Telemetry',
    t1Sub: 'M_ME_NC_1 · 短浮点 · IOA 定位',
    t2: '遥信 Telesignaling',
    t2Sub: 'M_SP_NA_1 · 单点状态',
    t3: '遥控 Telecontrol',
    t3Sub: 'C_SC_NA_1 · 命令下发',
    t4: '遥调 Telesetpoint',
    t4Sub: '设点命令 · 下发',
    ioaName: 'IOA 信息对象地址 + ASDU 类型',
    ioaSub: 'IOA 唯一定位一个数据点 · ASDU 类型决定数据语义',
    widthNote: '字段宽度 (典型 2/2/3) 与对端组态一字不差，否则报文按错误边界切分、地址错位',
    skelNote: '当前协议读写路径为骨架 · 排查面向接入参数与网络可达性',
    legPlat: '平台 / 主站',
    legDev: '远动设备',
    legUp: '上行：遥测 / 遥信',
    legPoll: '总召唤',
    legCtrl: '遥控/遥调 (未下发)',
    legFrame: 'ASDU / 四遥'
  },
  en: {
    aria: 'IEC 60870-5-104 telepower model: the master connects to the RTU over TCP 2404, sends interrogation then receives measured values and single-point signals; control commands go downstream; ASDUs are split by field byte widths',
    modelNote: 'power telecontrol · master requests + unsolicited server pushes (four functions) · TCP 2404',
    platRegion: 'Platform · 104 client (master)',
    devRegion: 'Telecontrol side · substation / RTU / DTU·FTU (104 server)',
    drvName: 'dc3-driver-iec104',
    drvSub: 'IEC 60870-5-104 client (master)',
    drvB1: '· host / port / asduAddress required',
    drvB2: '· COT/CA/IOA widths must match the peer',
    drvB3: '· connect timeout 10s',
    asduName: 'ASDU anatomy (no field delimiters)',
    asduSub1: 'type id + cause of transmission COT (2B)',
    asduSub2: '+ common address CA (2B) + object address IOA (3B)',
    asduSub3: 'CA separates logical stations on one link',
    wrName: 'Telecontrol (execute)',
    wrSub: 'sendCommand template rendered · frame not actually sent yet',
    pvName: 'PointValue',
    pvArrow: 'telemetry/signaling uplink',
    q1: 'Interrogation ▶',
    q1Sub: 'request all data of the station',
    q2: '◀ measured M_ME_NC_1',
    q2Sub: 'short float (default asduType)',
    q3: '◀ single-point M_SP_NA_1',
    q3Sub: 'single-point status',
    qw: 'command C_SC_NA_1 ▶',
    qwSub: 'template render only (see status)',
    rtuName: '104 server (RTU)',
    rtuSub: 'answers interrogation · pushes events spontaneously',
    t1: 'Telemetry',
    t1Sub: 'M_ME_NC_1 · short float · by IOA',
    t2: 'Telesignaling',
    t2Sub: 'M_SP_NA_1 · single point',
    t3: 'Telecontrol',
    t3Sub: 'C_SC_NA_1 · command downlink',
    t4: 'Telesetpoint',
    t4Sub: 'set-point command · downlink',
    ioaName: 'IOA + ASDU type',
    ioaSub: 'IOA uniquely locates a data point · ASDU type gives the semantics',
    widthNote: 'field widths (typically 2/2/3) must match the peer exactly or frames split on wrong boundaries',
    skelNote: 'protocol R/W is currently a skeleton · troubleshoot addressing and reachability',
    legPlat: 'platform / master',
    legDev: 'RTU',
    legUp: 'uplink: telemetry / signaling',
    legPoll: 'interrogation',
    legCtrl: 'control (not sent)',
    legFrame: 'ASDU / four functions'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="i104-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="i104-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="i104-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#i104-grid)" height="100%" width="100%"/>

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
        <line marker-end="url(#i104-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="180"
              y2="180"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="170">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="196">{{ s.q1Sub }}</text>
        <line marker-end="url(#i104-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="290"
              y2="290"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="280">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="306">{{ s.q2Sub }}</text>
        <line marker-end="url(#i104-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="350"
              y2="350"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="340">{{ s.q3 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="366">{{ s.q3Sub }}</text>
        <line marker-end="url(#i104-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="440" y2="440"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="430">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="456">{{ s.qwSub }}</text>

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

        <rect fill="var(--dc3-amber-fill)" height="90" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="274">{{
            s.asduName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="294">{{ s.asduSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="312">{{ s.asduSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="330">{{ s.asduSub3 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="408"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="432">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="452">{{ s.wrSub }}</text>

        <line marker-end="url(#i104-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="478"
              y2="508"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="498">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="512"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="532">{{
            s.pvName
          }}
        </text>

        <!-- device nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="580"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="950" y="120">{{
            s.rtuName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="140">{{ s.rtuSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="660" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="815" y="208">{{
            s.t1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="815" y="228">{{ s.t1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="990" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1145" y="208">{{
            s.t2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1145" y="228">{{ s.t2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="660" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="815" y="298">{{
            s.t3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="815" y="318">{{ s.t3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="310"
              x="990" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1145" y="298">{{
            s.t4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1145" y="318">{{ s.t4Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="580" x="660" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="950" y="406">{{
            s.ioaName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="426">{{ s.ioaSub }}</text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="950" y="486">{{ s.widthNote }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="526">{{ s.skelNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="669">{{ s.legDev }}</text>
        <line marker-end="url(#i104-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="340" x2="390" y1="664"
              y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="398" y="669">{{ s.legUp }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="560" y="669">{{ s.legPoll }}</text>
        <line marker-end="url(#i104-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="680" x2="730" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="738" y="669">{{ s.legCtrl }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="930" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="952" y="669">{{ s.legFrame }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
