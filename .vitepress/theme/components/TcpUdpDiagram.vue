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
    aria: 'TCP/UDP 通用 socket 模型：TCP 模式按设备缓存长连接、断连失效重连，UDP 模式每轮临时建 DatagramSocket 收发；发 HEX 指令收原始字节，再按偏移切片、按格式解码成位号值',
    modelNote: '通用 socket 底座 · TCP 长连接缓存 vs UDP 逐次收发 · 字节流语义全靠属性配置描述',
    platRegion: '平台侧 Platform · DRIVER_CLIENT (主动连设备)',
    drvName: 'dc3-driver-tcp-udp',
    drvSub: 'JDK Socket / DatagramSocket · 不引入协议库',
    drvB1: '· 发什么 (sendCommand) 与怎么解析 (帧规则) 全靠配置',
    wrName: '写命令 Write',
    wrSub1: 'sendCommand 模板 ${value} 替换后整帧 HEX 发出',
    wrSub2: 'TCP 复用长连接 · UDP 临时 socket',
    protoName: 'protocol 二选一',
    protoSub1: 'TCP / UDP · host:port 指向设备 (端口默认 502 仅占位)',
    protoSub2: 'delimiter 按分隔符切包 (预留)',
    tcpLane: 'TCP 模式 (protocol=TCP) · 长连接',
    tcpDrv: '驱动 · TCP 客户端',
    tcpDrvSub: '长连接按设备缓存 (tcpConnectMap)',
    tcpDrvSub2: '断连/通信异常 → 失效并重连',
    tcpChip: 'TCP 字节流',
    tcpChipSub: '面向连接 · 有序可靠',
    tcpChipSub2: 'connectTimeout 5s · readTimeout 3s',
    tcpDev: '私有协议设备',
    tcpDevSub: '串口转网口模块 · 自研单片机 · 私有网关',
    tcpBackoff: '连续 3 次连接/读写失败 → 60 秒退避窗口',
    a1: 'HEX 指令 ▶',
    a2: '◀ 回包字节',
    a3: 'TCP 流 ◀▶',
    udpLane: 'UDP 模式 (protocol=UDP) · 无连接',
    udpDrv: '驱动 · UDP 端点',
    udpDrvSub: '每轮采集临时新建 DatagramSocket',
    udpDrvSub2: '发包 → 等回包 → 随即关闭',
    udpChip: 'UDP 数据报',
    udpChipSub: '尽力投递 · 无序不重复保证',
    udpChipSub2: 'readTimeout 3s 等待回包',
    udpDev: '私有协议设备',
    udpDevSub: '只在端口上收发数据报的终端',
    parseRegion: '回包 → 位号值 (位号属性描述，两模式共用)',
    p1: '回包帧 raw',
    p1Sub: '整段原始字节',
    p2: '① 切帧',
    p2Sub: 'dataOffset + dataLength 切出目标字节',
    p3: '② 解码',
    p3Sub: 'dataFormat (HEX/ASCII/INT16/UINT16/INT32/FLOAT) × byteOrder (BIG/LITTLE)',
    p4: '位号值 PointValue',
    p4Sub: '越界不报错 → 整帧 HEX 原样返回',
    f1: '切片',
    f2: '转值',
    f3: '上送',
    legDrv: '平台 / 驱动',
    legDev: '设备',
    legProto: '传输 (TCP/UDP)',
    legParse: '解析输出',
    legWrite: '读指令 / 回包'
  },
  en: {
    aria: 'Generic socket model: TCP mode caches one long connection per device with invalidation and reconnect, UDP mode opens a throwaway DatagramSocket per poll; HEX commands out, raw bytes back, sliced by offset and decoded by format into point values',
    modelNote: 'generic socket base · cached TCP long connection vs per-poll UDP · byte semantics fully config-driven',
    platRegion: 'Platform · DRIVER_CLIENT (connects out to devices)',
    drvName: 'dc3-driver-tcp-udp',
    drvSub: 'JDK Socket / DatagramSocket · no protocol library',
    drvB1: '· what to send (sendCommand) and how to parse are pure config',
    wrName: 'Write command',
    wrSub1: 'sendCommand template ${value} rendered, sent as HEX frame',
    wrSub2: 'TCP reuses the long connection · UDP a throwaway socket',
    protoName: 'protocol either/or',
    protoSub1: 'TCP / UDP · host:port points at the device (default 502 is a placeholder)',
    protoSub2: 'delimiter-based framing (reserved)',
    tcpLane: 'TCP mode (protocol=TCP) · long connection',
    tcpDrv: 'driver · TCP client',
    tcpDrvSub: 'connection cached per device (tcpConnectMap)',
    tcpDrvSub2: 'broken / failed → invalidated, reconnects',
    tcpChip: 'TCP byte stream',
    tcpChipSub: 'connection-oriented · ordered, reliable',
    tcpChipSub2: 'connectTimeout 5s · readTimeout 3s',
    tcpDev: 'private-protocol device',
    tcpDevSub: 'serial-to-Ethernet · DIY MCU · private gateway',
    tcpBackoff: '3 consecutive failures → 60s back-off window',
    a1: 'HEX command ▶',
    a2: '◀ reply bytes',
    a3: 'TCP stream ◀▶',
    udpLane: 'UDP mode (protocol=UDP) · connectionless',
    udpDrv: 'driver · UDP endpoint',
    udpDrvSub: 'fresh DatagramSocket per poll',
    udpDrvSub2: 'send → await reply → close',
    udpChip: 'UDP datagram',
    udpChipSub: 'best effort · no ordering guarantee',
    udpChipSub2: 'readTimeout 3s waiting for reply',
    udpDev: 'private-protocol device',
    udpDevSub: 'endpoints that just exchange datagrams',
    parseRegion: 'reply → point value (point attributes, shared by both modes)',
    p1: 'raw reply frame',
    p1Sub: 'the whole byte blob',
    p2: '① slice',
    p2Sub: 'dataOffset + dataLength cut the target bytes',
    p3: '② decode',
    p3Sub: 'dataFormat (HEX/ASCII/INT16/UINT16/INT32/FLOAT) × byteOrder (BIG/LITTLE)',
    p4: 'PointValue',
    p4Sub: 'out-of-range is not an error → whole frame returned as HEX',
    f1: 'slice',
    f2: 'to value',
    f3: 'uplink',
    legDrv: 'platform / driver',
    legDev: 'device',
    legProto: 'transport (TCP/UDP)',
    legParse: 'parsed output',
    legWrite: 'command / reply'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 780">
        <defs>
          <marker id="tu-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="tu-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#tu-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="670" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- platform region -->
        <rect fill="var(--dc3-region-be)" height="140" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="40"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="58">{{ s.platRegion }}</text>

        <!-- TCP lane -->
        <rect fill="var(--dc3-region-be)" height="160" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="200"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="218">{{ s.tcpLane }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="512" y1="265"
              y2="265"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="460" y="255">{{ s.a1 }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="512" x2="408" y1="305"
              y2="305"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="460" y="320">{{ s.a2 }}</text>
        <line marker-end="url(#tu-ah)" marker-start="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="768" x2="872" y1="285" y2="285"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="820" y="275">{{ s.a3 }}</text>

        <!-- UDP lane -->
        <rect fill="var(--dc3-region-amber)" height="160" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="380"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="398">{{ s.udpLane }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="512" y1="445"
              y2="445"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="460" y="435">{{ s.a1 }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="512" x2="408" y1="485"
              y2="485"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="460" y="500">{{ s.a2 }}</text>
        <line marker-end="url(#tu-ah)" marker-start="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="768" x2="872" y1="465" y2="465"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="820" y="455">{{ s.a3 }}</text>

        <!-- parse region -->
        <rect fill="var(--dc3-region-be)" height="150" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="560"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="578">{{ s.parseRegion }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="348" x2="392" y1="630"
              y2="630"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="370" y="620">{{ s.f1 }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="668" x2="712" y1="630"
              y2="630"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="690" y="620">{{ s.f2 }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="988" x2="1032" y1="630"
              y2="630"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1010" y="620">{{ s.f3 }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="460"
              x="80" y="76"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="310" y="104">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="310" y="124">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="148">{{ s.drvB1 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="90" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="580" y="76"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="720" y="102">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="720" y="122">{{ s.wrSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="720" y="140">{{ s.wrSub2 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="90" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="890" y="76"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1080" y="102">{{
            s.protoName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="122">{{ s.protoSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="140">{{ s.protoSub2 }}</text>

        <!-- TCP lane nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="266">{{
            s.tcpDrv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="286">{{ s.tcpDrvSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="304">{{ s.tcpDrvSub2 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="90" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="240"
              x="520" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="640" y="266">{{
            s.tcpChip
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="640" y="286">{{ s.tcpChipSub }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="304">{{ s.tcpChipSub2 }}</text>

        <rect fill="var(--dc3-ext-fill)" height="90" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="380"
              x="880" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1070" y="266">{{
            s.tcpDev
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="286">{{ s.tcpDevSub }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="1070" y="306">{{ s.tcpBackoff }}
        </text>

        <!-- UDP lane nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="420"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="446">{{
            s.udpDrv
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="466">{{ s.udpDrvSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="484">{{ s.udpDrvSub2 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="90" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="240"
              x="520" y="420"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="640" y="446">{{
            s.udpChip
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="640" y="466">{{ s.udpChipSub }}</text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="640" y="484">{{ s.udpChipSub2 }}</text>

        <rect fill="var(--dc3-ext-fill)" height="90" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="380"
              x="880" y="420"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1070" y="446">{{
            s.udpDev
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="466">{{ s.udpDevSub }}</text>

        <!-- parse nodes -->
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="80" y="595"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="210" y="620">{{
            s.p1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="210" y="640">{{ s.p1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="400" y="595"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="530" y="620">{{
            s.p2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="530" y="640">{{ s.p2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="720" y="595"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="850" y="620">{{
            s.p3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="850" y="640">{{ s.p3Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="70" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="1040" y="595"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1170" y="620">{{
            s.p4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1170" y="640">{{ s.p4Sub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="753">{{ s.legDrv }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="753">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="340" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="753">{{ s.legProto }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="530" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="552" y="753">{{ s.legParse }}</text>
        <line marker-end="url(#tu-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="670" x2="720" y1="748"
              y2="748"/>
        <text fill="var(--dc3-text2)" font-size="9" x="728" y="753">{{ s.legWrite }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
