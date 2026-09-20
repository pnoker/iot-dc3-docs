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
    aria: '边云协同架构：端设备经局域网一跳连到边缘网关，网关承担协议适配、过滤聚合、本地缓存补传、边缘自治与安全边界；跨广域网才到云，云侧集中设备管理、连接管理、规则引擎与数据服务，并以时序库喂养数字孪生。上行实线、下行虚线，规则引擎可下沉到边',
    regionEnd: '端 · 现场设备',
    regionEdge: '边 · 就近计算（离设备一跳局域网）',
    regionCloud: '云 · 数据中心（跨广域网）',
    sensor: '传感器 / 变送器', sensorSub: '只读位号 · 毫伏级信号',
    actuator: '执行器 / 继电器', actuatorSub: '可写位号 · 接受寄存器写入',
    plc: 'PLC / 电表 / 控制器', plcSub: '私有协议 · 就地控制回路',
    gw: '边缘网关 Edge Gateway', gwSub: '这一层的承重墙 · 五项职责',
    duty1: '协议适配', duty1Sub: 'Modbus / OPC UA / BACnet 归一',
    duty2: '过滤与聚合', duty2Sub: '降采样 · 去重 · 特征提取 · 窗口聚合',
    duty3: '本地缓存与补传', duty3Sub: '断网落盘 · 恢复后按序补传不丢点',
    duty4: '边缘自治', duty4Sub: '本地规则 · 急停联锁 · 就地告警',
    duty5: '安全边界', duty5Sub: '唯一出入口 · 鉴权加密 · 最小暴露',
    cap1: '设备管理', cap1Sub: '建模 · 注册 · 生命周期 · 远程配置',
    cap2: '连接管理', cap2Sub: '在线离线 · 心跳租约 · 会话鉴权',
    cap3: '规则引擎', cap3Sub: '阈值告警 · 联动 · 转发',
    cap4: '数据服务', cap4Sub: '时序存储 · 聚合查询 · 对外 API',
    twin: '数字孪生 / 全局分析', twinSub: '实时镜像依赖边缘上行 · 模型训练 · 跨厂对比',
    ts: '时序库 + 数据资产', tsSub: '海量位号值 · 冷热分层 · 长期留存',
    up1: '原始流 / 高频', down1: '写寄存器',
    lan: '局域网一跳',
    up2: '聚合 / 脱敏结果', proto: 'MQTT + TLS', down2: '命令 / 配置下发',
    wan: '广域网 WAN · 时延带宽断连不可控',
    sink: '可下沉到边',
    store: '写入 / 查询', feed: '聚合查询 / 喂养',
    endNote: '端只负责「接」：把物理量变成信号、把命令落到寄存器',
    edgeNote: '断网期间：采集不停 · 联锁不失效 · 告警不哑（把云当会断的依赖设计）',
    cloudNote: '云负责「广」：全局视角 · 海量存储 · 模型训练 · 统一 API',
    legEnd: '端设备', legEdge: '边缘职责', legCloud: '云侧能力',
    legStore: '存储', legUp: '上行数据（实线）', legDown: '下行命令（虚线）'
  },
  en: {
    aria: 'Edge-cloud collaboration: end devices reach the edge gateway over one LAN hop, which handles protocol adaptation, filtering and aggregation, local caching with replay, edge autonomy and the security boundary; only the WAN crossing leads to the cloud with device management, connection management, rule engine and data services, feeding the digital twin from the time-series store. Solid lines are uplink, dashed are downlink, the rule engine can sink to the edge',
    regionEnd: 'End · field devices',
    regionEdge: 'Edge · near-field compute (one LAN hop away)',
    regionCloud: 'Cloud · data center (across the WAN)',
    sensor: 'Sensor / transmitter', sensorSub: 'read-only point · mV signal',
    actuator: 'Actuator / relay', actuatorSub: 'writable point · register writes',
    plc: 'PLC / meter / controller', plcSub: 'private protocol · local loop',
    gw: 'Edge Gateway', gwSub: 'the load-bearing wall · five duties',
    duty1: 'Protocol adaptation', duty1Sub: 'normalize Modbus / OPC UA / BACnet',
    duty2: 'Filter & aggregate', duty2Sub: 'downsample · dedupe · feature · window',
    duty3: 'Local cache & replay', duty3Sub: 'buffer offline · replay in order',
    duty4: 'Edge autonomy', duty4Sub: 'local rules · interlocks · local alarms',
    duty5: 'Security boundary', duty5Sub: 'sole egress · auth/encrypt · minimal exposure',
    cap1: 'Device management', cap1Sub: 'model · register · lifecycle · config',
    cap2: 'Connection mgmt', cap2Sub: 'presence · heartbeat lease · session auth',
    cap3: 'Rule engine', cap3Sub: 'threshold alarm · linkage · forward',
    cap4: 'Data service', cap4Sub: 'time-series store · aggregate · API',
    twin: 'Digital twin / analytics', twinSub: 'live mirror needs edge uplink · training · cross-site',
    ts: 'Time-series store + assets', tsSub: 'mass point values · hot/cold tiers · retention',
    up1: 'raw stream / high-rate', down1: 'write register',
    lan: 'one LAN hop',
    up2: 'aggregated / desensitized', proto: 'MQTT + TLS', down2: 'command / config down',
    wan: 'WAN · latency, bandwidth, dropout not yours',
    sink: 'can sink to edge',
    store: 'write / query', feed: 'aggregate query / feed',
    endNote: 'end only "connects": physical quantity to signal, command to register',
    edgeNote: 'while offline: collection continues · interlocks hold · alarms not muted',
    cloudNote: 'cloud is for "breadth": global view · huge storage · training · one API',
    legEnd: 'End device', legEdge: 'Edge duty', legCloud: 'Cloud capability',
    legStore: 'Storage', legUp: 'uplink data (solid)', legDown: 'downlink command (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 600">
        <defs>
          <marker id="ec-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="ec-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ec-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ec-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="470" rx="12" stroke="var(--dc3-ext-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="200" x="30" y="70"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionEnd }}</text>
        <rect fill="var(--dc3-region-amber)" height="470" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="420" x="290" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="304" y="90">{{ s.regionEdge }}</text>
        <rect fill="var(--dc3-region-be)" height="470" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="520" x="770" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="784" y="90">{{ s.regionCloud }}</text>

        <!-- WAN divider -->
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,5" stroke-width="1" x1="724" x2="724" y1="85"
              y2="530"/>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,5" stroke-width="1" x1="754" x2="754" y1="85"
              y2="530"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" text-anchor="middle"
              transform="rotate(-90 739 400)" x="739" y="400">{{ s.wan }}
        </text>

        <!-- end -> edge arrows (LAN) -->
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="233" x2="286" y1="172"
              y2="172"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="260" y="164">{{ s.up1 }}</text>
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="286"
              x2="233" y1="194" y2="194"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="260" y="212">{{ s.down1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" font-weight="600" text-anchor="middle" x="260" y="240">{{
            s.lan
          }}
        </text>

        <!-- edge -> cloud arrows (WAN) -->
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="713" x2="766" y1="140"
              y2="140"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="740" y="132">{{ s.up2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="740" y="156">{{ s.proto }}</text>
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="766"
              x2="713" y1="186" y2="186"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="740" y="204">{{ s.down2 }}</text>

        <!-- rule engine sink-back -->
        <line marker-end="url(#ec-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="786" x2="714" y1="231" y2="231"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="750" y="224">{{ s.sink }}</text>

        <!-- cloud internal arrows -->
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1230" x2="1230" y1="268"
              y2="386"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1238" y="330">{{ s.store }}</text>
        <line marker-end="url(#ec-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="890" x2="890" y1="388"
              y2="344"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="898" y="372">{{ s.feed }}</text>

        <!-- end nodes -->
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="160" x="50" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="130" y="134">{{
            s.sensor
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="130" y="152">{{ s.sensorSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="160" x="50" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="130" y="214">{{
            s.actuator
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="130" y="232">{{ s.actuatorSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="160" x="50" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="130" y="294">{{
            s.plc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="130" y="312">{{ s.plcSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="46" y="505">{{ s.endNote }}</text>

        <!-- edge nodes -->
        <rect fill="var(--dc3-amber-fill)" height="54" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="380" x="310" y="104"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="700" text-anchor="middle" x="500" y="126">{{
            s.gw
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="144">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="310" y="166"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="500" y="188">{{
            s.duty1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="206">{{ s.duty1Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="310" y="232"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="500" y="254">{{
            s.duty2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="272">{{ s.duty2Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="310" y="298"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="500" y="320">{{
            s.duty3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="338">{{ s.duty3Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="310" y="364"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="500" y="386">{{
            s.duty4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="404">{{ s.duty4Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="380" x="310" y="430"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="500" y="452">{{
            s.duty5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="500" y="470">{{ s.duty5Sub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="310" y="505">{{ s.edgeNote }}</text>

        <!-- cloud nodes -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="240" x="790" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="910" y="136">{{
            s.cap1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="910" y="154">{{ s.cap1Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="240" x="1050" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1170" y="136">{{
            s.cap2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1170" y="154">{{ s.cap2Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="240" x="790" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="910" y="222">{{
            s.cap3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="910" y="240">{{ s.cap3Sub }}</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="240" x="1050" y="196"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1170" y="222">{{
            s.cap4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1170" y="240">{{ s.cap4Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="54" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="380" x="790" y="286"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1040" y="310">{{
            s.twin
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1040" y="328">{{ s.twinSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="500" x="790" y="390"/>
        <text fill="var(--dc3-box-name)" font-size="11.5" font-weight="600" text-anchor="middle" x="1040" y="414">{{
            s.ts
          }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="1040" y="432">{{ s.tsSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="790" y="505">{{ s.cloudNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="40" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="569">{{ s.legEnd }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="150" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="172" y="569">{{ s.legEdge }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="290" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="312" y="569">{{ s.legCloud }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="430" y="560"/>
        <text fill="var(--dc3-text2)" font-size="9" x="452" y="569">{{ s.legStore }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="570" x2="600" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="606" y="569">{{ s.legUp }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="760" x2="790" y1="565" y2="565"/>
        <text fill="var(--dc3-text2)" font-size="9" x="796" y="569">{{ s.legDown }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
