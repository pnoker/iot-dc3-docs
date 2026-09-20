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
    aria: 'SNMP 管理端/代理模型：驱动作为管理端向设备的 UDP 161 发 GET/SET，以 MIB 树上的 OID 定位数据点；返回的变量原样成为位号值，v1/v2c 用 community 团体名认证',
    modelNote: '管理端 / 代理模型 · 以 OID 定位被管对象 · GET / SET 请求-响应',
    platRegion: '平台侧 Platform · SNMP 管理端 (manager)',
    devRegion: '被管设备 · SNMP 代理 (路由器 / 交换机 / UPS / 服务器)',
    drvName: 'dc3-driver-snmp',
    drvSub: 'SNMP 管理端 · SNMP4J · DRIVER_CLIENT',
    drvB1: '· SNMP 会话按设备缓存 · timeout 5s · retries 1',
    drvB2: '· 版本 v1 / v2c · community 明文口令',
    drvB3: '· v3 USM 字段已预留、当前不生效',
    commName: 'community 团体名',
    commSub: '明文口令 · 不匹配时设备不回包 → 表现为超时',
    wrName: '写命令 SET',
    wrSub: '复用位号 oid / snmpType · 按类型构造变量',
    pvName: '位号值 PointValue',
    pvArrow: '变量值上送',
    q1: 'GET 1.3.6.1.2.1.1.1.0 ▶',
    q1Sub: 'UDP 161',
    q2: '◀ Response',
    q2Sub: 'variable.toString() 原样上报',
    qw: 'SET oid = value ▶',
    qwSub: 'INTEGER / GAUGE32 / COUNTER32…',
    trapArrow: 'TRAP 162 ▶ (本驱动未接入)',
    agentName: 'SNMP 代理 (agent)',
    agentSub: '内置 MIB 树 · 端口状态 / 流量 / CPU / 温湿度',
    mibName: 'MIB 对象 (设备侧数据点 · OID 全局唯一)',
    leaf1: 'sysDescr · 1.3.6.1.2.1.1.1.0',
    leaf1Sub: '标量对象 · 末尾 .0 实例标识，别漏',
    leaf2: 'ifInOctets · 1.3.6.1.2.1.2.2.1.10.1',
    leaf2Sub: '表项对象 · 行索引 1 = 1 号端口流量',
    leaf3: 'ifOperStatus · 1.3.6.1.2.1.2.2.1.8.2',
    leaf3Sub: '行索引 2 = 2 号端口 up/down',
    oidNote: 'OID 写错 → 设备回 noSuchObject，被当普通字符串上报成无效数据',
    trapName: 'TRAP 主动告警 → 管理端 :162',
    trapSub: '本驱动未接入 · 能力为读 GET ✓ / 写 SET ✓ / 订阅 —',
    hsNote: '健康 = 本地 UDP 会话已建立 (不等于设备可达) · 真实失败在下一轮 read 超时显现',
    legPlat: '平台 / 管理端',
    legDev: '被管设备',
    legRead: '读 GET ◀▶ 响应',
    legWrite: '写 SET',
    legTrap: 'TRAP (未接入)',
    legMib: 'MIB / OID'
  },
  en: {
    aria: 'SNMP manager/agent model: the driver as manager sends GET/SET to the device UDP port 161, addressing data points by OIDs on the MIB tree; returned variables become point values as-is, v1/v2c authenticated by community',
    modelNote: 'manager / agent model · objects addressed by OID · GET / SET request-response',
    platRegion: 'Platform · SNMP manager',
    devRegion: 'Managed device · SNMP agent (router / switch / UPS / server)',
    drvName: 'dc3-driver-snmp',
    drvSub: 'SNMP manager · SNMP4J · DRIVER_CLIENT',
    drvB1: '· SNMP session cached per device · timeout 5s · retries 1',
    drvB2: '· versions v1 / v2c · plaintext community',
    drvB3: '· v3 USM fields reserved, not effective',
    commName: 'community',
    commSub: 'plaintext secret · mismatch → device stays silent, looks like timeout',
    wrName: 'Write command SET',
    wrSub: 'reuses point oid / snmpType · typed variable',
    pvName: 'PointValue',
    pvArrow: 'variable uplink',
    q1: 'GET 1.3.6.1.2.1.1.1.0 ▶',
    q1Sub: 'UDP 161',
    q2: '◀ Response',
    q2Sub: 'variable.toString() reported as-is',
    qw: 'SET oid = value ▶',
    qwSub: 'INTEGER / GAUGE32 / COUNTER32…',
    trapArrow: 'TRAP 162 ▶ (not wired in this driver)',
    agentName: 'SNMP agent',
    agentSub: 'built-in MIB tree · port state / traffic / CPU / temperature',
    mibName: 'MIB objects (device-side data points · globally unique OIDs)',
    leaf1: 'sysDescr · 1.3.6.1.2.1.1.1.0',
    leaf1Sub: 'scalar object · trailing .0 instance id, do not omit',
    leaf2: 'ifInOctets · 1.3.6.1.2.1.2.2.1.10.1',
    leaf2Sub: 'table object · row index 1 = port 1 traffic',
    leaf3: 'ifOperStatus · 1.3.6.1.2.1.2.2.1.8.2',
    leaf3Sub: 'row index 2 = port 2 up/down',
    oidNote: 'a wrong OID → device returns noSuchObject, reported as if it were data',
    trapName: 'TRAP alerts → manager :162',
    trapSub: 'not wired in this driver · capability: GET ✓ / SET ✓ / subscribe —',
    hsNote: 'health = local UDP session established (not device reachability) · real failures surface on next read timeout',
    legPlat: 'platform / manager',
    legDev: 'managed device',
    legRead: 'read GET ◀▶ response',
    legWrite: 'write SET',
    legTrap: 'TRAP (not wired)',
    legMib: 'MIB / OID'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 700">
        <defs>
          <marker id="snmp-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="snmp-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="snmp-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="snmp-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#snmp-grid)" height="100%" width="100%"/>

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
        <line marker-end="url(#snmp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="408" x2="612" y1="240"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="228">{{ s.q1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="258">{{ s.q1Sub }}</text>
        <line marker-end="url(#snmp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="612" x2="408" y1="300"
              y2="300"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="510" y="326">{{ s.q2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="510" y="290">{{ s.q2Sub }}</text>
        <line marker-end="url(#snmp-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="408" x2="612" y1="390" y2="390"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="510" y="378">{{ s.qw }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="510" y="408">{{ s.qwSub }}</text>
        <line marker-end="url(#snmp-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="0.9" x1="612" x2="408" y1="520" y2="520"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="510" y="508">{{ s.trapArrow }}
        </text>

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

        <rect fill="var(--dc3-amber-fill)" height="64" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="320" x="80" y="254"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="278">{{
            s.commName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="298">{{ s.commSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="358"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="240" y="382">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="402">{{ s.wrSub }}</text>

        <line marker-end="url(#snmp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="240" x2="240" y1="428"
              y2="458"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="250" y="448">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="320"
              x="80" y="462"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="240" y="482">{{
            s.pvName
          }}
        </text>

        <!-- device nodes -->
        <rect fill="var(--dc3-ext-fill)" height="56" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="580"
              x="660" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="950" y="120">{{
            s.agentName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="950" y="140">{{ s.agentSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="36" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="218">{{
            s.mibName
          }}
        </text>

        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="248"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="266">{{
            s.leaf1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="284">{{ s.leaf1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="302"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="320">{{
            s.leaf2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="338">{{ s.leaf2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="44" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="580"
              x="660" y="356"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="950" y="374">{{
            s.leaf3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="392">{{ s.leaf3Sub }}</text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="950" y="432">{{ s.oidNote }}
        </text>

        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="580" x="660" y="452"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="950" y="472">{{
            s.trapName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="490">{{ s.trapSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="950" y="540">{{ s.hsNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="200" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="669">{{ s.legDev }}</text>
        <line marker-end="url(#snmp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="340" x2="390" y1="664"
              y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="398" y="669">{{ s.legRead }}</text>
        <line marker-end="url(#snmp-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="550" x2="600" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="608" y="669">{{ s.legWrite }}</text>
        <line marker-end="url(#snmp-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="0.9" x1="700" x2="750" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="758" y="669">{{ s.legTrap }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="890" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="912" y="669">{{ s.legMib }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
