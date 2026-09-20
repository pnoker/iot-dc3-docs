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
    aria: 'BACnet/IP 接入模型：驱动以本地设备身份加入网络，先 UDP 广播 Who-Is 发现远端设备（I-Am 应答），再按对象类型+实例号+属性周期读 PRESENT_VALUE，并支持向输出对象写值',
    modelNote: '主从 / 请求-响应 · 第一步广播发现，第二步周期轮询 · 远端设备不主动上报',
    platRegion: '平台侧 Platform · BACnet 发起方 (client)',
    devRegion: '楼宇设备侧 · 远端 BACnet 设备 (空调 / 照明 / 冷机 / 温控器)',
    drvName: 'dc3-driver-bacnet-ip',
    drvSub: 'BACnet 客户端 · BACnet4J · DRIVER_CLIENT',
    drvB1: '· LocalDevice 按设备 ID 缓存',
    drvB2: '· 在线判定 = isInitialized()',
    drvB3: '· 采集 cron 0/30 · 健康 cron 0/15',
    locName: '本地设备 LocalDevice',
    locSub1: '实例号 1001 · 绑定 0.0.0.0:47808',
    locSub2: '广播 255.255.255.255 · 请求超时 6000ms',
    locSub3: '实例号须与网络上现有设备不冲突',
    wrName: '写命令 Write',
    wrSub: 'ANALOG_* 写浮点 · BINARY_* 写开关 · MULTI_STATE_* 写整数',
    pvName: '位号值 PointValue',
    pvArrow: '属性值上送',
    d1: 'Who-Is 广播 ▶ (UDP)',
    d1Sub: '找实例号 9001',
    d2: '◀ I-Am 应答',
    d2Sub: '远端设备自报身份',
    q1: 'ReadProperty ▶',
    q1Sub: 'ANALOG_INPUT:1 · PRESENT_VALUE',
    q2: '◀ 属性值',
    q2Sub: '字符串形态回传',
    qw: 'WriteProperty ▶',
    qwSub: '按对象类型编码写值',
    rdevName: 'BACnet 设备 · 实例号 9001',
    rdevSub: '对象模型统一描述设备能力 · 不绑定硬件',
    devObj: 'DEVICE',
    devObjSub: '实例号唯一',
    obj1: 'ANALOG_INPUT : 1',
    obj1Sub: '属性 PRESENT_VALUE · 模拟量输入只读',
    obj2: 'ANALOG_OUTPUT : 1',
    obj2Sub: '属性 PRESENT_VALUE · 可写 (按类型编码)',
    obj3: 'BINARY_INPUT : 2',
    obj3Sub: '属性 PRESENT_VALUE · 开关量输入',
    edge1: '含对象',
    addrName: '寻址三层结构',
    addrSub: '设备实例号 remoteDeviceId → 对象类型+实例 → 属性 propertyId',
    enumNote: 'objectType 10 种 / propertyId 7 种 · 必须精确大写枚举名，拼错静默回退默认值',
    bbmdName: 'UDP 广播默认不跨三层路由',
    bbmdSub: '跨网段需部署 BBMD + 改定向广播地址',
    blockNote: '找不到 remoteDeviceId → 阻塞直至超时再报错',
    legPlat: '平台 / 驱动',
    legDev: '楼宇设备',
    legDisc: '发现阶段 (Who-Is/I-Am)',
    legRead: '读属性',
    legWrite: '写属性',
    legTree: '对象模型'
  },
  en: {
    aria: 'BACnet/IP access model: the driver joins the network as a local device, discovers remote devices via UDP Who-Is broadcast (I-Am reply), then periodically reads PRESENT_VALUE by object type + instance + property, and writes to output objects',
    modelNote: 'master/slave request-response · broadcast discovery first, periodic polling second · remotes never report on their own',
    platRegion: 'Platform · BACnet initiator (client)',
    devRegion: 'Building side · remote BACnet devices (HVAC / lighting / chiller)',
    drvName: 'dc3-driver-bacnet-ip',
    drvSub: 'BACnet client · BACnet4J · DRIVER_CLIENT',
    drvB1: '· LocalDevice cached per device id',
    drvB2: '· online = isInitialized()',
    drvB3: '· read cron 0/30 · health cron 0/15',
    locName: 'LocalDevice',
    locSub1: 'instance 1001 · bind 0.0.0.0:47808',
    locSub2: 'broadcast 255.255.255.255 · timeout 6000ms',
    locSub3: 'instance id must be unique on the network',
    wrName: 'Write command',
    wrSub: 'ANALOG_* float · BINARY_* on/off · MULTI_STATE_* integer',
    pvName: 'PointValue',
    pvArrow: 'property value uplink',
    d1: 'Who-Is broadcast ▶ (UDP)',
    d1Sub: 'looking for instance 9001',
    d2: '◀ I-Am reply',
    d2Sub: 'remote identifies itself',
    q1: 'ReadProperty ▶',
    q1Sub: 'ANALOG_INPUT:1 · PRESENT_VALUE',
    q2: '◀ property value',
    q2Sub: 'returned as string',
    qw: 'WriteProperty ▶',
    qwSub: 'value encoded by object type',
    rdevName: 'BACnet device · instance 9001',
    rdevSub: 'object model describes capability · hardware-agnostic',
    devObj: 'DEVICE',
    devObjSub: 'unique instance',
    obj1: 'ANALOG_INPUT : 1',
    obj1Sub: 'PRESENT_VALUE · analog input, read-only',
    obj2: 'ANALOG_OUTPUT : 1',
    obj2Sub: 'PRESENT_VALUE · writable (typed encoding)',
    obj3: 'BINARY_INPUT : 2',
    obj3Sub: 'PRESENT_VALUE · binary input',
    edge1: 'has objects',
    addrName: 'three-level addressing',
    addrSub: 'device instance → object type + instance → property id',
    enumNote: '10 object types / 7 property ids · exact uppercase names, typos silently fall back',
    bbmdName: 'UDP broadcast does not cross routers',
    bbmdSub: 'cross-subnet needs BBMD + directed broadcast address',
    blockNote: 'unknown remoteDeviceId → blocks until timeout before failing',
    legPlat: 'platform / driver',
    legDev: 'building devices',
    legDisc: 'discovery (Who-Is/I-Am)',
    legRead: 'read property',
    legWrite: 'write property',
    legTree: 'object model'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="bac-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="bac-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="bac-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="bac-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#bac-grid)" height="100%" width="100%"/>

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

        <!-- discovery arrows (dashed amber) -->
        <line marker-end="url(#bac-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="408" x2="612" y1="160" y2="160"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" text-anchor="middle" x="510" y="148">{{ s.d1 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="510" y="176">{{ s.d1Sub }}</text>
        <line marker-end="url(#bac-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="612" x2="408" y1="210" y2="210"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" text-anchor="middle" x="510" y="234">{{ s.d2 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="510" y="202">{{ s.d2Sub }}</text>
        <!-- polling arrows (solid) -->
        <line marker-end="url(#bac-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="288">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="316">{{ s.q1Sub }}</text>
        <line marker-end="url(#bac-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="360"
              y2="360"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="384">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="352">{{ s.q2Sub }}</text>
        <!-- write arrow (dashed rose) -->
        <line marker-end="url(#bac-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="460" y2="460"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="448">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="478">{{ s.qwSub }}</text>

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
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="274">{{
            s.locName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="294">{{ s.locSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="312">{{ s.locSub2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="330">{{ s.locSub3 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="434"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="458">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="240" y="476">{{ s.wrSub }}</text>

        <line marker-end="url(#bac-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="494"
              y2="524"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="514">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="528"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="548">{{
            s.pvName
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="240" y="592">{{ s.blockNote }}
        </text>

        <!-- object tree edges -->
        <path d="M 820 210 L 840 210 L 840 206 L 856 206" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <path d="M 820 210 L 840 210 L 840 272 L 856 272" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <path d="M 820 210 L 840 210 L 840 338 L 856 338" fill="none" stroke="var(--dc3-arrow)" stroke-width="0.8"/>
        <text fill="var(--dc3-text2)" font-size="7" x="836" y="250">{{ s.edge1 }}</text>

        <!-- device nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="580"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="950" y="120">{{
            s.rdevName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="140">{{ s.rdevSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="40" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="140"
              x="680" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="750" y="208">{{
            s.devObj
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="750" y="222">{{ s.devObjSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="180"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="200">{{
            s.obj1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="220">{{ s.obj1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="246"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="266">{{
            s.obj2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="286">{{ s.obj2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="380"
              x="860" y="312"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1050" y="332">{{
            s.obj3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1050" y="352">{{ s.obj3Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="580" x="660" y="420"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="950" y="446">{{
            s.addrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="466">{{ s.addrSub }}</text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="950" y="516">{{ s.enumNote }}
        </text>

        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="580" x="660" y="536"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="950" y="556">{{
            s.bbmdName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="574">{{ s.bbmdSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="190" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="669">{{ s.legDev }}</text>
        <line marker-end="url(#bac-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="320" x2="370" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="378" y="669">{{ s.legDisc }}</text>
        <line marker-end="url(#bac-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="560" x2="610" y1="664"
              y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="618" y="669">{{ s.legRead }}</text>
        <line marker-end="url(#bac-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="700" x2="750" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="758" y="669">{{ s.legWrite }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="0.8" x1="880" x2="926" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="934" y="669">{{ s.legTree }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
