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
    aria: 'OPC DA 通信模型：驱动经 Windows DCOM 远程调用（以 CLSID 定位服务，无固定 TCP 端口）连接 OPC DA Server，按 group/tag 读写标签，值带 COM 变体类型',
    modelNote: '客户端/服务端模型 · 承载在 Windows COM/DCOM 之上 · 周期读标签',
    platRegion: '平台侧 Platform · OPC DA 客户端',
    srcRegion: '设备侧 · Windows 主机上的 OPC DA Server (SCADA / 组态软件)',
    drvName: 'dc3-driver-opc-da',
    drvSub: 'OPC DA 客户端 · J-Interop (纯 Java DCOM)',
    drvB1: '· 连接按设备缓存 · 读失败销毁重连',
    drvB2: '· 值按 COM 变体类型 VARIANT 转换',
    drvB3: '· 驱动可跑 Linux · 对端必须是 Windows',
    credName: 'DCOM 凭据',
    credSub: 'username / password · 需远程激活权限',
    wrName: '写命令 Write',
    wrSub: 'SHORT/INT/LONG/FLOAT/DOUBLE/BOOLEAN/STRING',
    pvName: '位号值 PointValue',
    pvArrow: '标签值上送',
    q1: 'item.read() ▶',
    q1Sub: 'group + tag 定位 item',
    q2: '◀ JIVariant 值',
    q2Sub: 'VT_I4 / VT_R8 / VT_BOOL / VT_BSTR',
    qw: 'item.write() ▶',
    qwSub: '构造 JIVariant 写回',
    srvName: 'OPC DA Server',
    srvSub: '2.0 / 3.0 · 把底层 PLC/仪表点位暴露为标签',
    grpName: 'GROUP 分组',
    grpSub: '客户端创建/查找',
    item1: 'Channel1.Device1.TagA',
    item1Sub: '标签 item · 命名以 Server 浏览为准',
    item2: 'Channel1.Device1.TagB',
    item2Sub: '一组成员若干标签',
    edge1: '含分组',
    edge2: '含标签 item',
    clsidName: 'CLSID 定位 (非端口)',
    clsidSub: 'COM 类标识符 · 由厂商决定 · 注册表/浏览工具查取',
    dcomName: 'DCOM 远程过程调用',
    dcomSub: '操作系统层需配好 DCOM 权限 · 防火墙放行 · 前置条件',
    warnNote: '读失败 → 销毁并移除连接 · 下轮自动重连',
    legPlat: '平台 / 驱动',
    legSrv: 'Windows 服务端',
    legRead: '读：请求 ◀▶ 响应',
    legWrite: '写命令',
    legProto: 'DCOM / 寻址',
    legTree: '分组 / 标签'
  },
  en: {
    aria: 'OPC DA communication model: the driver reaches the OPC DA Server through Windows DCOM remote calls (located by CLSID, no fixed TCP port), reads and writes tags by group/tag, values carried as COM variants',
    modelNote: 'client/server · carried on Windows COM/DCOM · periodic tag reads',
    platRegion: 'Platform · OPC DA client',
    srcRegion: 'Device side · OPC DA Server on Windows (SCADA / HMI)',
    drvName: 'dc3-driver-opc-da',
    drvSub: 'OPC DA client · J-Interop (pure Java DCOM)',
    drvB1: '· connection cached per device, destroyed on read failure',
    drvB2: '· values converted from COM VARIANT types',
    drvB3: '· driver runs on Linux · peer must be Windows',
    credName: 'DCOM credentials',
    credSub: 'username / password · remote activation rights',
    wrName: 'Write command',
    wrSub: 'SHORT/INT/LONG/FLOAT/DOUBLE/BOOLEAN/STRING',
    pvName: 'PointValue',
    pvArrow: 'tag value uplink',
    q1: 'item.read() ▶',
    q1Sub: 'group + tag locate the item',
    q2: '◀ JIVariant value',
    q2Sub: 'VT_I4 / VT_R8 / VT_BOOL / VT_BSTR',
    qw: 'item.write() ▶',
    qwSub: 'builds a JIVariant to write',
    srvName: 'OPC DA Server',
    srvSub: '2.0 / 3.0 · exposes PLC/instrument points as tags',
    grpName: 'GROUP',
    grpSub: 'created/found by the client',
    item1: 'Channel1.Device1.TagA',
    item1Sub: 'tag item · names come from server browsing',
    item2: 'Channel1.Device1.TagB',
    item2Sub: 'a group holds several items',
    edge1: 'has group',
    edge2: 'has item',
    clsidName: 'located by CLSID (not a port)',
    clsidSub: 'COM class id · vendor-defined · read from registry/browser',
    dcomName: 'DCOM remote procedure call',
    dcomSub: 'OS-level DCOM permissions required · firewall open · prerequisite',
    warnNote: 'read failure → destroy and drop connection · reconnects next cycle',
    legPlat: 'platform / driver',
    legSrv: 'Windows server',
    legRead: 'read: request ◀▶ response',
    legWrite: 'write command',
    legProto: 'DCOM / addressing',
    legTree: 'group / items'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 680">
        <defs>
          <marker id="oda-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="oda-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="oda-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#oda-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="650" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="560" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="400" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="560" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="640" x="620" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="632" y="68">{{ s.srcRegion }}</text>

        <!-- gap arrows -->
        <line marker-end="url(#oda-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="240"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="228">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="258">{{ s.q1Sub }}</text>
        <line marker-end="url(#oda-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="326">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="290">{{ s.q2Sub }}</text>
        <line marker-end="url(#oda-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="492" y2="492"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="480">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="510">{{ s.qwSub }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="130" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="80" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="240" y="226">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="240" y="246">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="272">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="290">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="308">{{ s.drvB3 }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="370"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="394">{{
            s.credName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="414">{{ s.credSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="464"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="488">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="240" y="506">{{ s.wrSub }}</text>

        <line marker-end="url(#oda-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="524"
              y2="556"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="546">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="560"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="580">{{
            s.pvName
          }}
        </text>

        <!-- server tree edges (before nodes) -->
        <line stroke="var(--dc3-arrow)" stroke-width="0.8" x1="750" x2="750" y1="152" y2="180"/>
        <text fill="var(--dc3-text2)" font-size="7" x="760" y="170">{{ s.edge1 }}</text>
        <path d="M 820 200 L 846 200 L 846 322 L 856 322" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <path d="M 820 200 L 846 200 L 846 376 L 856 376" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <text fill="var(--dc3-text2)" font-size="7" x="842" y="300">{{ s.edge2 }}</text>

        <!-- server nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="560"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="940" y="120">{{
            s.srvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="940" y="140">{{ s.srvSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="40" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="140"
              x="680" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="750" y="198">{{
            s.grpName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="750" y="212">{{ s.grpSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="300"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="318">{{
            s.item1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="336">{{ s.item1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="354"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="372">{{
            s.item2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="390">{{ s.item2Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="860" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="204">{{
            s.clsidName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="226">{{ s.clsidSub }}</text>

        <rect fill="var(--dc3-bus-fill)" height="64" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="660" y="440"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="940" y="464">{{
            s.dcomName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="940" y="484">{{ s.dcomSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="940" y="540">{{ s.warnNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="646"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="655">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="190" y="646"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="655">{{ s.legSrv }}</text>
        <line marker-end="url(#oda-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="330" x2="380" y1="650"
              y2="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="388" y="655">{{ s.legRead }}</text>
        <line marker-end="url(#oda-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="560" x2="610" y1="650" y2="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="618" y="655">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="750" y="646"/>
        <text fill="var(--dc3-text2)" font-size="9" x="772" y="655">{{ s.legProto }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="0.8" x1="900" x2="946" y1="650" y2="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="954" y="655">{{ s.legTree }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
