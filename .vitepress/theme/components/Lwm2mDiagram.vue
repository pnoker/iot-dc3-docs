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
    aria: 'LwM2M 模型：驱动内嵌 LwM2M 服务端，设备先以 endpoint 名注册上来，驱动再按对象/实例/资源三段路径对设备发起读与写。对象模型把设备管理与数据采集标准化',
    modelNote: '设备注册 + 资源读写模型 · 架在 CoAP 之上 · 本驱动内嵌 LwM2M 服务端 (反向接入)',
    platRegion: '平台侧 Platform · 内嵌 LwM2M 服务端 (Eclipse Leshan)',
    devRegion: '设备侧 · LwM2M 客户端 (NB-IoT 模组 / 智能表计 / 环境传感)',
    srvName: 'dc3-driver-lwm2m · 内嵌服务端',
    srvSub: 'CoAP UDP :5683 · DTLS :5684',
    srvSub2: '监听端口为进程级配置 · 不在设备上填',
    regName: '注册表 Registry',
    regSub: '设备在线 = endpoint 仍注册 (isDeviceRegistered) · 名字须一字不差',
    rwName: '周期读 Read / 写 Write',
    rwSub: 'cron 0/30 · 复用位号的三段路径 · 无独立命令属性',
    pvName: '位号值 PointValue',
    pvArrow: '资源值上送',
    obsNote: 'observe=true 预留未生效 · 值仍靠 30 秒主动轮询，无订阅推送',
    portNote: 'serverHost/serverPort/securePort/PSK 声明在册、尚未喂给 Leshan → 按默认 5683 明文接入',
    a1: '注册 Register ▶',
    a1Sub: 'POST /rd?ep=<endpoint>',
    a2: 'Read 请求 ▶',
    a2Sub: 'GET /3303/0/5700',
    a3: '◀ 资源值',
    a3Sub: 'ReadResponse payload',
    a4: 'Write ▶',
    a4Sub: 'PUT /3/0/13',
    devName: 'LwM2M 客户端',
    devSub: 'endpoint: urn:imei:<IMEI> · 注册后定期续约',
    treeName: '对象树 Object Model (设备能力标准化)',
    obj1: 'Object 3 · Device 设备',
    obj1Sub: '资源: 制造商 / 型号 / 电量 (3/0/*)',
    obj2: 'Object 6 · Location 位置',
    obj2Sub: '资源: 纬度 / 经度 / 时间戳 (6/0/*)',
    obj3: 'Object 3303 · Temperature 温度',
    obj3Sub: '资源: 5700 传感器读数 · 5701 最小值',
    pathName: '三段资源路径',
    pathSub: '/<objectId>/<objectInstanceId>/<resourceId> · 实例区分同型多路',
    mgmtNote: '固件升级 / 远程配置也被标准化进对象模型 → 电信级远程运维场景常用',
    legPlat: '平台 / 内嵌服务端',
    legDev: '设备 / LwM2M 客户端',
    legReg: '注册流',
    legRead: '读资源 ◀▶ 响应',
    legWrite: '写资源',
    legObj: '对象树'
  },
  en: {
    aria: 'LwM2M model: the driver embeds an LwM2M server; devices register by endpoint name first, then the driver reads and writes resources on the device by three-segment object/instance/resource paths. The object model standardizes device management and data collection',
    modelNote: 'registration + resource R/W model · rides on CoAP · this driver embeds the LwM2M server (inverted access)',
    platRegion: 'Platform · embedded LwM2M server (Eclipse Leshan)',
    devRegion: 'Device side · LwM2M client (NB-IoT module / smart meter / sensor)',
    srvName: 'dc3-driver-lwm2m · embedded server',
    srvSub: 'CoAP UDP :5683 · DTLS :5684',
    srvSub2: 'listen ports are process-level config, not per device',
    regName: 'Registry',
    regSub: 'online = endpoint still registered (isDeviceRegistered) · exact name match',
    rwName: 'periodic Read / Write',
    rwSub: 'cron 0/30 · reuses the point three-segment path · no command attributes',
    pvName: 'PointValue',
    pvArrow: 'resource value uplink',
    obsNote: 'observe=true reserved, not effective · values still rely on 30s polling',
    portNote: 'serverHost/serverPort/securePort/PSK declared but not wired into Leshan → use default 5683 plaintext',
    a1: 'Register ▶',
    a1Sub: 'POST /rd?ep=<endpoint>',
    a2: 'Read request ▶',
    a2Sub: 'GET /3303/0/5700',
    a3: '◀ resource value',
    a3Sub: 'ReadResponse payload',
    a4: 'Write ▶',
    a4Sub: 'PUT /3/0/13',
    devName: 'LwM2M client',
    devSub: 'endpoint: urn:imei:<IMEI> · renews registration',
    treeName: 'Object Model (standardized capabilities)',
    obj1: 'Object 3 · Device',
    obj1Sub: 'resources: manufacturer / model / battery (3/0/*)',
    obj2: 'Object 6 · Location',
    obj2Sub: 'resources: lat / lon / timestamp (6/0/*)',
    obj3: 'Object 3303 · Temperature',
    obj3Sub: 'resources: 5700 reading · 5701 min value',
    pathName: 'three-segment resource path',
    pathSub: '/<objectId>/<objectInstanceId>/<resourceId> · instances separate duplicates',
    mgmtNote: 'firmware update / remote config are standardized too → common in carrier-grade remote ops',
    legPlat: 'platform / embedded server',
    legDev: 'device / LwM2M client',
    legReg: 'registration flow',
    legRead: 'read resource ◀▶ response',
    legWrite: 'write resource',
    legObj: 'object tree'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 720">
        <defs>
          <marker id="lwm2-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="lwm2-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="lwm2-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="lwm2-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#lwm2-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" text-anchor="middle" x="660" y="26">{{
            s.modelNote
          }}
        </text>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="600" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="520" x="40" y="50"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="68">{{ s.platRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="600" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="520" x="760" y="50"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="772" y="68">{{ s.devRegion }}</text>

        <!-- gap arrows -->
        <line marker-end="url(#lwm2-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="748" x2="572" y1="150" y2="150"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" text-anchor="middle" x="660" y="138">{{ s.a1 }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="660" y="166">{{ s.a1Sub }}</text>
        <line marker-end="url(#lwm2-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="572" x2="748" y1="250"
              y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="660" y="240">{{ s.a2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="660" y="266">{{ s.a2Sub }}</text>
        <line marker-end="url(#lwm2-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="748" x2="572" y1="320"
              y2="320"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="660" y="312">{{ s.a3 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="660" y="336">{{ s.a3Sub }}</text>
        <line marker-end="url(#lwm2-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="572" x2="748" y1="400" y2="400"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" text-anchor="middle" x="660" y="390">{{ s.a4 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="660" y="416">{{ s.a4Sub }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="480"
              x="80" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="320" y="122">{{
            s.srvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="320" y="142">{{ s.srvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="320" y="162">{{ s.srvSub2 }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="480"
              x="80" y="220"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="320" y="244">{{
            s.regName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="320" y="264">{{ s.regSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="480"
              x="80" y="310"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="320" y="334">{{
            s.rwName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="320" y="354">{{ s.rwSub }}</text>

        <line marker-end="url(#lwm2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="320" x2="320" y1="380"
              y2="410"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="330" y="400">{{ s.pvArrow }}</text>
        <rect fill="var(--dc3-fe-fill)" height="32" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="480"
              x="80" y="414"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="320" y="434">{{
            s.pvName
          }}
        </text>

        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="320" y="486">{{ s.obsNote }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="320" y="530">{{ s.portNote }}</text>

        <!-- device nodes -->
        <rect fill="var(--dc3-ext-fill)" height="70" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="440"
              x="800" y="96"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="1020" y="122">{{
            s.devName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1020" y="144">{{ s.devSub }}</text>

        <rect fill="var(--dc3-fe-fill)" height="36" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="440"
              x="800" y="200"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1020" y="222">{{
            s.treeName
          }}
        </text>

        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="440"
              x="800" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1020" y="272">{{
            s.obj1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1020" y="292">{{ s.obj1Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="440"
              x="800" y="318"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1020" y="340">{{
            s.obj2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1020" y="360">{{ s.obj2Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="440"
              x="800" y="386"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1020" y="408">{{
            s.obj3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1020" y="428">{{ s.obj3Sub }}</text>

        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="440"
              x="800" y="466"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1020" y="490">{{
            s.pathName
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="1020" y="510">{{ s.pathSub }}</text>

        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1020" y="570">{{ s.mgmtNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="680"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="689">{{ s.legPlat }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="250" y="680"/>
        <text fill="var(--dc3-text2)" font-size="9" x="272" y="689">{{ s.legDev }}</text>
        <line marker-end="url(#lwm2-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="420" x2="470" y1="684" y2="684"/>
        <text fill="var(--dc3-text2)" font-size="9" x="478" y="689">{{ s.legReg }}</text>
        <line marker-end="url(#lwm2-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="580" x2="630" y1="684"
              y2="684"/>
        <text fill="var(--dc3-text2)" font-size="9" x="638" y="689">{{ s.legRead }}</text>
        <line marker-end="url(#lwm2-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="790" x2="840" y1="684" y2="684"/>
        <text fill="var(--dc3-text2)" font-size="9" x="848" y="689">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="960" y="680"/>
        <text fill="var(--dc3-text2)" font-size="9" x="982" y="689">{{ s.legObj }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
