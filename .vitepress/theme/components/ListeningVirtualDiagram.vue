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
    aria: '监听型虚拟驱动模型：设备主动连到驱动的 TCP 6270 / UDP 6271 监听端口推送二进制帧，帧结构为 22 字节设备名 + 1 字节关键字 + 变长载荷，驱动按设备 ID、关键字、位号名三步解析成位号值，写命令经登记的 Channel 回写',
    modelNote: '监听型被动接收 (DRIVER_SERVER) · 设备主动推帧 · read=null · 写走登记 Channel 回写',
    devRegion: '设备侧 · 主动推送的终端',
    lisRegion: '驱动监听层 · Netty (进程级端口)',
    frameRegion: '帧结构与解析 (自定演示协议 · 无 driver-attribute)',
    dev1: 'GPS / 北斗终端',
    dev1Sub: '定位 · 速度 · 高程',
    dev2: '传感网关',
    dev2Sub: '私有二进制帧推送',
    devN1: '设备自主周期推送 · 平台不轮询',
    devN2: '在线与推送无关 · 默认上报在线',
    a1: 'TCP :6270 推帧 ▶',
    a2: 'UDP :6271 数据报 ▶',
    tcpName: 'TCP 监听 :6270',
    tcpSub: '环境变量 TCP_PORT 覆盖',
    udpName: 'UDP 监听 :6271',
    udpSub: '环境变量 UDP_PORT 覆盖',
    d1: '字节流 ▼',
    d2: '数据报 ▼',
    hdlName: 'NettyServerHandler',
    hdlSub: 'TCP/UDP 共用同一套解析逻辑',
    hdlSub2: '按收到 ByteBuf 原样解析 · 不组帧 (TCP 可能粘包)',
    wrName: '写回 Write',
    wrSub1: '命令值经登记 Channel (DEVICE_CHANNEL_MAP) 写回设备 · 5s flush',
    wrSub2: '仅 TCP 通道可靠 · UDP 无连接通道回写常失败',
    wrArrow: '回写 ▲',
    parseArrow: '解析 ▶',
    frC1: '设备名 · 22B',
    frC1Sub: '数字设备 ID',
    frC2: '关键字 · 1B',
    frC2Sub: 'hex 62',
    frC3: '数据载荷 · 变长',
    frC3Sub: 'start..end 切片',
    ruler: '偏移 0 ──────── 22 ── 23 ──────── 变长 (start/end 相对整帧)',
    st1: '① 设备 ID 匹配',
    st1Sub: '前 22 字节转数字 → 平台设备',
    st1Sub2: '解析失败 / 无设备 → 该帧丢弃',
    st2: '② 关键字比对',
    st2Sub: '第 23 字节 (hex) == 位号 key',
    st2Sub2: '不匹配的位号这一帧不出值',
    st3: '③ 按位号名解析 (6 个固定位号名)',
    st3Sub1: 'altitude float · speed double · level long',
    st3Sub2: 'direction int · locked bool · coordinate string(start..end)',
    st3Sub3: '定长数值按大端读 · 越界该位号不出值',
    f1: 'ID 命中',
    f2: 'key 命中',
    pvName: '位号值 PointValue',
    pvArrow: 'pointValueSender ▼',
    legDev: '设备 (推送方)',
    legLis: '监听层 Netty',
    legFrame: '帧 / 解析',
    legPush: '推送流',
    legWrite: '回写流 (仅 TCP 可靠)'
  },
  en: {
    aria: 'Listening virtual driver model: devices actively connect to the driver TCP 6270 / UDP 6271 listeners and push binary frames of 22-byte device name + 1-byte keyword + variable payload; the driver resolves them in three steps (device id, keyword, point name) into point values, and writes go back over registered channels',
    modelNote: 'passive listening (DRIVER_SERVER) · devices push frames · read=null · writes go over registered channels',
    devRegion: 'Device side · actively pushing endpoints',
    lisRegion: 'Driver listener · Netty (process-level ports)',
    frameRegion: 'Frame and parsing (demo protocol · no driver-attribute)',
    dev1: 'GPS / BeiDou terminal',
    dev1Sub: 'position · speed · altitude',
    dev2: 'sensor gateway',
    dev2Sub: 'private binary frame push',
    devN1: 'devices push on their own schedule · no polling',
    devN2: 'online is push-independent · reported online by default',
    a1: 'TCP :6270 frame push ▶',
    a2: 'UDP :6271 datagram ▶',
    tcpName: 'TCP listen :6270',
    tcpSub: 'overridable via TCP_PORT',
    udpName: 'UDP listen :6271',
    udpSub: 'overridable via UDP_PORT',
    d1: 'byte stream ▼',
    d2: 'datagram ▼',
    hdlName: 'NettyServerHandler',
    hdlSub: 'one parse path shared by TCP/UDP',
    hdlSub2: 'parses ByteBuf as received · no framing (TCP may stick)',
    wrName: 'Write-back',
    wrSub1: 'command value written over the registered Channel (DEVICE_CHANNEL_MAP) · 5s flush',
    wrSub2: 'only TCP channels are reliable · UDP write-back usually fails',
    wrArrow: 'write back ▲',
    parseArrow: 'parse ▶',
    frC1: 'device name · 22B',
    frC1Sub: 'numeric device id',
    frC2: 'keyword · 1B',
    frC2Sub: 'hex 62',
    frC3: 'payload · variable',
    frC3Sub: 'slice start..end',
    ruler: 'offset 0 ──────── 22 ── 23 ──────── variable (start/end over the whole frame)',
    st1: '① match device id',
    st1Sub: 'first 22 bytes parsed as number → platform device',
    st1Sub2: 'parse failure / unknown device → frame dropped',
    st2: '② compare keyword',
    st2Sub: 'byte 23 (hex) == point key',
    st2Sub2: 'non-matching points yield nothing this frame',
    st3: '③ parse by point name (6 fixed names)',
    st3Sub1: 'altitude float · speed double · level long',
    st3Sub2: 'direction int · locked bool · coordinate string(start..end)',
    st3Sub3: 'fixed-width numbers big-endian · out of range yields nothing',
    f1: 'id matched',
    f2: 'key matched',
    pvName: 'PointValue',
    pvArrow: 'pointValueSender ▼',
    legDev: 'devices (pushers)',
    legLis: 'Netty listener',
    legFrame: 'frame / parsing',
    legPush: 'push flow',
    legWrite: 'write-back (TCP only reliable)'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 650">
        <defs>
          <marker id="lvir-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="lvir-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="lvir-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#lvir-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="670" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="460" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="280" x="40" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.devRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="460" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="380" x="380" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="392" y="68">{{ s.lisRegion }}</text>
        <rect fill="var(--dc3-region-be)" height="460" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="500" x="800" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="812" y="68">{{ s.frameRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="294" x2="392" y1="128"
              y2="128"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="343" y="116">{{ s.a1 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="294" x2="392" y1="213"
              y2="213"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="343" y="203">{{ s.a2 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="485" x2="485" y1="166"
              y2="196"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="495" y="186">{{ s.d1 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="668" x2="668" y1="166"
              y2="196"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="678" y="186">{{ s.d2 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="754" x2="792" y1="245"
              y2="245"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="773" y="233">{{ s.parseArrow }}
        </text>
        <line marker-end="url(#lvir-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="396" x2="324" y1="362" y2="362"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="360" y="352">{{ s.wrArrow }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1050" x2="1050" y1="286"
              y2="302"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1110" y="298">{{ s.f1 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1050" x2="1050" y1="382"
              y2="398"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="1110" y="394">{{ s.f2 }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1050" x2="1050" y1="492"
              y2="526"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1050" y="514">{{ s.pvArrow }}</text>

        <!-- device nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="220"
              x="70" y="93"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="180" y="121">{{
            s.dev1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="141">{{ s.dev1Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="220"
              x="70" y="178"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="180" y="206">{{
            s.dev2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="226">{{ s.dev2Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="300">{{ s.devN1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="180" y="320">{{ s.devN2 }}</text>

        <!-- listener nodes -->
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="170"
              x="400" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="485" y="122">{{
            s.tcpName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="485" y="140">{{ s.tcpSub }}</text>
        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="165"
              x="585" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="668" y="122">{{
            s.udpName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="7.5" text-anchor="middle" x="668" y="140">{{ s.udpSub }}</text>

        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="350"
              x="400" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="575" y="226">{{
            s.hdlName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="575" y="246">{{ s.hdlSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="575" y="266">{{ s.hdlSub2 }}</text>

        <rect fill="var(--dc3-rose-fill)" height="84" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="350" x="400" y="320"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="575" y="344">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="575" y="366">{{ s.wrSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="575" y="386">{{ s.wrSub2 }}</text>

        <!-- frame cells -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="820" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="905" y="122">{{
            s.frC1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="905" y="142">{{ s.frC1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="70"
              x="1000" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1035" y="122">{{
            s.frC2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1035" y="142">{{ s.frC2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="4" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="1080" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="1180" y="122">{{
            s.frC3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1180" y="142">{{ s.frC3Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1050" y="184">{{ s.ruler }}</text>

        <!-- parse steps -->
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="460"
              x="820" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="234">{{
            s.st1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="254">{{ s.st1Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="272">{{ s.st1Sub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="460"
              x="820" y="306"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="330">{{
            s.st2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="350">{{ s.st2Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="368">{{ s.st2Sub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="90" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="460"
              x="820" y="402"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="426">{{
            s.st3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1050" y="448">{{ s.st3Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1050" y="466">{{ s.st3Sub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1050" y="484">{{ s.st3Sub3 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="36" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="460"
              x="820" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="552">{{
            s.pvName
          }}
        </text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="60" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="619">{{ s.legDev }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="210" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="232" y="619">{{ s.legLis }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="360" y="610"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="619">{{ s.legFrame }}</text>
        <line marker-end="url(#lvir-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="500" x2="550" y1="614"
              y2="614"/>
        <text fill="var(--dc3-text2)" font-size="9" x="558" y="619">{{ s.legPush }}</text>
        <line marker-end="url(#lvir-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="640" x2="690" y1="614" y2="614"/>
        <text fill="var(--dc3-text2)" font-size="9" x="698" y="619">{{ s.legWrite }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
