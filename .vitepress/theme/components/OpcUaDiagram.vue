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
    aria: 'OPC UA 客户端/服务端模型：驱动作为客户端连接 opc.tcp 端点，按 NodeId（命名空间+标识符）周期读取地址空间节点值并写回六种类型，不使用订阅通知',
    modelNote: '客户端/服务端模型 · 按周期轮询节点 · 无订阅通知',
    platRegion: '平台侧 Platform · OPC UA 客户端',
    srcRegion: '设备侧 · OPC UA 服务端 (PLC / SCADA / 边缘网关)',
    drvName: 'dc3-driver-opc-ua',
    drvSub: 'OPC UA 客户端 · Eclipse Milo',
    drvB1: '· 连接超时 5s · 读/写超时各 1s',
    drvB2: '· 连接按设备缓存 · 失败即失效重连',
    drvB3: '· 取服务端发现的第一个端点',
    secName: '安全通道 SecureChannel',
    secSub: '匿名身份 + 自签名证书 dc3-opc-ua-client.pfx',
    secB: '证书生成失败时降级为纯匿名连接',
    subNote: '订阅 — ：不建 Subscription/MonitoredItem',
    wrName: '写命令 Write',
    wrSub: '复用位号 namespace/tag · INT/LONG/FLOAT/DOUBLE/BOOLEAN/STRING',
    pvName: '位号值 PointValue',
    pvArrow: '节点值上送',
    q1: 'ReadRequest ▶',
    q1Sub: 'NodeId(namespace, tag)',
    q2: '◀ DataValue',
    q2Sub: 'StatusCode = Good',
    qw: 'WriteRequest ▶',
    qwSub: '按位号类型编码',
    srvName: 'OPC UA 服务端',
    srvSub: '把现场数据以节点树对外暴露 · 内建安全策略',
    rootNode: 'Root',
    objNode: 'Objects',
    leaf1: 'ns=2 · Demo.Static.Float',
    leaf1Sub: 'FLOAT · 静态演示变量',
    leaf2: 'ns=2 · Demo.Static.Boolean',
    leaf2Sub: 'BOOLEAN · 开关量',
    leaf3: 'ns=3 · Pump.Speed',
    leaf3Sub: 'FLOAT · 工程自定义命名空间',
    edge1: '层级引用',
    edge2: 'Organizes 组织引用',
    nodeIdName: 'NodeId = namespace + tag',
    nodeIdSub: '命名空间索引隔离不同来源的标识符 · 标识符为字符串',
    badNote: '读到非 Good / 值为空 → ReadPointException · 连接失效下轮重连',
    epName: '端点 endpoint',
    epSub: 'opc.tcp://host:port/path · yml 默认 18600 (生产常见 4840)',
    legPlat: '平台 / 驱动',
    legSrv: '服务端 / 节点',
    legRead: '读：请求 ◀▶ 响应',
    legWrite: '写命令',
    legProto: '端点 / 寻址',
    legTree: '地址空间引用'
  },
  en: {
    aria: 'OPC UA client/server model: the driver connects to an opc.tcp endpoint and periodically reads node values addressed by NodeId (namespace + identifier) and writes six types back; no subscription notifications',
    modelNote: 'client/server · periodic node polling · no subscriptions',
    platRegion: 'Platform · OPC UA client',
    srcRegion: 'Device side · OPC UA server (PLC / SCADA / gateway)',
    drvName: 'dc3-driver-opc-ua',
    drvSub: 'OPC UA client · Eclipse Milo',
    drvB1: '· connect timeout 5s · read/write 1s each',
    drvB2: '· connection cached per device, invalidated on failure',
    drvB3: '· uses the first discovered endpoint',
    secName: 'SecureChannel',
    secSub: 'anonymous identity + self-signed dc3-opc-ua-client.pfx',
    secB: 'falls back to plain anonymous if the cert cannot be created',
    subNote: 'subscribe — : no Subscription/MonitoredItem',
    wrName: 'Write command',
    wrSub: 'reuses point ns/tag · INT/LONG/FLOAT/DOUBLE/BOOLEAN/STRING',
    pvName: 'PointValue',
    pvArrow: 'node value uplink',
    q1: 'ReadRequest ▶',
    q1Sub: 'NodeId(namespace, tag)',
    q2: '◀ DataValue',
    q2Sub: 'StatusCode = Good',
    qw: 'WriteRequest ▶',
    qwSub: 'encoded by point type',
    srvName: 'OPC UA server',
    srvSub: 'exposes field data as a node tree · built-in security',
    rootNode: 'Root',
    objNode: 'Objects',
    leaf1: 'ns=2 · Demo.Static.Float',
    leaf1Sub: 'FLOAT · static demo variable',
    leaf2: 'ns=2 · Demo.Static.Boolean',
    leaf2Sub: 'BOOLEAN · discrete value',
    leaf3: 'ns=3 · Pump.Speed',
    leaf3Sub: 'FLOAT · vendor namespace',
    edge1: 'hierarchical ref',
    edge2: 'Organizes references',
    nodeIdName: 'NodeId = namespace + tag',
    nodeIdSub: 'namespace index separates identifier spaces · string ids',
    badNote: 'non-Good or empty → ReadPointException · connection invalidated, reconnects next cycle',
    epName: 'endpoint',
    epSub: 'opc.tcp://host:port/path · yml default 18600 (production 4840)',
    legPlat: 'platform / driver',
    legSrv: 'server / nodes',
    legRead: 'read: request ◀▶ response',
    legWrite: 'write command',
    legProto: 'endpoint / addressing',
    legTree: 'address-space refs'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 680">
        <defs>
          <marker id="oua-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="oua-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="oua-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#oua-grid)" height="100%" width="100%"/>

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
        <line marker-end="url(#oua-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="240"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="228">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="258">{{ s.q1Sub }}</text>
        <line marker-end="url(#oua-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="326">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="290">{{ s.q2Sub }}</text>
        <line marker-end="url(#oua-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
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
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="96" y="326">{{ s.subNote }}</text>

        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="360"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="384">{{
            s.secName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="402">{{ s.secSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="420">{{ s.secB }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="460"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="484">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="240" y="502">{{ s.wrSub }}</text>

        <line marker-end="url(#oua-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="528"
              y2="556"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="548">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="560"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="580">{{
            s.pvName
          }}
        </text>

        <!-- server address-space tree edges (before nodes) -->
        <line stroke="var(--dc3-arrow)" stroke-width="0.8" x1="750" x2="750" y1="220" y2="238"/>
        <text fill="var(--dc3-text2)" font-size="7" x="760" y="234">{{ s.edge1 }}</text>
        <path d="M 820 260 L 840 260 L 840 322 L 856 322" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <path d="M 820 260 L 840 260 L 840 376 L 856 376" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <path d="M 820 260 L 840 260 L 840 430 L 856 430" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <text fill="var(--dc3-text2)" font-size="7" x="836" y="300">{{ s.edge2 }}</text>

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
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="750" y="204">{{
            s.rootNode
          }}
        </text>
        <rect fill="var(--dc3-fe-fill)" height="40" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="140"
              x="680" y="240"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="750" y="264">{{
            s.objNode
          }}
        </text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="860" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="204">{{
            s.nodeIdName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="226">{{ s.nodeIdSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="300"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="318">{{
            s.leaf1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="336">{{ s.leaf1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="354"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="372">{{
            s.leaf2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="390">{{ s.leaf2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="408"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="426">{{
            s.leaf3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="444">{{ s.leaf3Sub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="940" y="478">{{ s.badNote }}</text>

        <rect fill="var(--dc3-bus-fill)" height="48" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="560"
              x="660" y="500"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="940" y="520">{{
            s.epName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="940" y="538">{{ s.epSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="646"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="655">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="190" y="646"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="655">{{ s.legSrv }}</text>
        <line marker-end="url(#oua-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="330" x2="380" y1="650"
              y2="650"/>
        <text fill="var(--dc3-text2)" font-size="9" x="388" y="655">{{ s.legRead }}</text>
        <line marker-end="url(#oua-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
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
