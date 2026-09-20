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
    aria: 'Modbus TCP 主从模型：IoT DC3 驱动作为主站，按采集周期经 TCP 502 轮询从站的线圈、离散输入、保持寄存器、输入寄存器四类数据区，并可写线圈与保持寄存器',
    platformRegion: '平台侧 Platform · 主站 Master',
    deviceRegion: '设备侧 · Modbus TCP 从站 / 网关 (unit ID 区分多从站)',
    schedName: '采集调度 Scheduler',
    schedSub: 'cron 0/30 * * * * ? · 主从模型：不问不答',
    schedArrow: '周期轮询 poll',
    drvName: 'dc3-driver-modbus-tcp',
    drvSub: 'Modbus 主站 (client) · modbus4j',
    drvB1: '· 连接按设备缓存 · socket 超时 5s',
    drvB2: '· slaveId 区分网关背后多台从站',
    drvB3: '· 连续 3 次失败 → 60s 退避',
    drvB4: '· 多寄存器量按位号类型拼装',
    trName: 'TCP 502 · 以太网',
    trSub: 'MBAP 头 7B + PDU · 无 CRC (由 TCP 保证)',
    wrName: '写路径 Write',
    wrSub: '仅 FC=1 写线圈 / FC=3 写保持寄存器',
    fc01: 'FC01 读线圈',
    fc01Sub: '位 · 可读可写 · 0xxxx',
    fc05: 'FC05 写线圈',
    fc02: 'FC02 读离散输入',
    fc02Sub: '位 · 只读 · 1xxxx',
    fc03: 'FC03 读保持寄存器',
    fc03Sub: '16 位字 · 可读可写 · 4xxxx',
    fc06: 'FC06 写保持寄存器',
    fc04: 'FC04 读输入寄存器',
    fc04Sub: '16 位字 · 只读 · 3xxxx',
    coilName: '线圈 Coils',
    diName: '离散输入 Discrete Inputs',
    hrName: '保持寄存器 Holding Registers',
    irName: '输入寄存器 Input Registers',
    asmName: '跨寄存器拼装',
    asmSub: '32 位 FLOAT/LONG 占 2 个寄存器 · DOUBLE 占 4 个 · 32/64 位值与字序相关',
    offsetNote: 'offset 是 0 基协议地址：习惯写法 40001 → functionCode=3 + offset=0',
    legDrv: '驱动 (主站)',
    legSlave: '从站数据区',
    legRead: '读：请求 ◀▶ 响应',
    legWrite: '写命令 (FC=1/3)',
    legProto: '协议 / 传输',
    legSched: '调度 / 说明'
  },
  en: {
    aria: 'Modbus TCP master/slave model: the IoT DC3 driver acts as master, polling the slave coils, discrete inputs, holding registers and input registers over TCP 502 per schedule, and can write coils and holding registers',
    platformRegion: 'Platform · Master',
    deviceRegion: 'Device side · Modbus TCP slave / gateway (unit ID separates slaves)',
    schedName: 'Read Scheduler',
    schedSub: 'cron 0/30 * * * * ? · master/slave: no poll, no data',
    schedArrow: 'periodic poll',
    drvName: 'dc3-driver-modbus-tcp',
    drvSub: 'Modbus master (client) · modbus4j',
    drvB1: '· connection cached per device · 5s socket timeout',
    drvB2: '· slaveId separates slaves behind a gateway',
    drvB3: '· 3 failures → 60s back-off',
    drvB4: '· multi-register values assembled by point type',
    trName: 'TCP 502 · Ethernet',
    trSub: 'MBAP header 7B + PDU · no CRC (TCP guarantees it)',
    wrName: 'Write path',
    wrSub: 'only FC=1 coil / FC=3 holding register',
    fc01: 'FC01 read coils',
    fc01Sub: 'bit · R/W · 0xxxx',
    fc05: 'FC05 write coil',
    fc02: 'FC02 read discrete inputs',
    fc02Sub: 'bit · read-only · 1xxxx',
    fc03: 'FC03 read holding registers',
    fc03Sub: '16-bit word · R/W · 4xxxx',
    fc06: 'FC06 write register',
    fc04: 'FC04 read input registers',
    fc04Sub: '16-bit word · read-only · 3xxxx',
    coilName: 'Coils',
    diName: 'Discrete Inputs',
    hrName: 'Holding Registers',
    irName: 'Input Registers',
    asmName: 'Cross-register assembly',
    asmSub: '32-bit FLOAT/LONG spans 2 registers · DOUBLE spans 4 · word order matters',
    offsetNote: 'offset is 0-based: register 40001 → functionCode=3 + offset=0',
    legDrv: 'Driver (master)',
    legSlave: 'Slave data areas',
    legRead: 'read: request ◀▶ response',
    legWrite: 'write command (FC=1/3)',
    legProto: 'protocol / transport',
    legSched: 'schedule / notes'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 700">
        <defs>
          <marker id="mtcp-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="mtcp-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="mtcp-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect fill="url(#mtcp-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="590" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="360" x="40" y="40"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="58">{{ s.platformRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="590" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="640" x="560" y="40"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="572" y="58">{{ s.deviceRegion }}</text>

        <!-- arrows (drawn before nodes) -->
        <line marker-end="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="220" x2="220" y1="148" y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="230" y="172">{{ s.schedArrow }}</text>

        <!-- read request/response: double-headed per function code -->
        <line marker-end="url(#mtcp-ah)" marker-start="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="416" x2="548" y1="240" y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="482" y="230">{{ s.fc01 }}</text>
        <line marker-end="url(#mtcp-ah)" marker-start="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="416" x2="548" y1="322" y2="322"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="482" y="312">{{ s.fc02 }}</text>
        <line marker-end="url(#mtcp-ah)" marker-start="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="416" x2="548" y1="404" y2="404"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="482" y="394">{{ s.fc03 }}</text>
        <line marker-end="url(#mtcp-ah)" marker-start="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="416" x2="548" y1="486" y2="486"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="482" y="476">{{ s.fc04 }}</text>
        <!-- write commands: dashed rose, master → slave only -->
        <line marker-end="url(#mtcp-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.9"
              x1="416" x2="548" y1="262" y2="262"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="482" y="276">{{ s.fc05 }}</text>
        <line marker-end="url(#mtcp-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.9"
              x1="416" x2="548" y1="426" y2="426"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="482" y="440">{{ s.fc06 }}</text>

        <!-- platform nodes -->
        <rect fill="var(--dc3-fe-fill)" height="60" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="80" y="86"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="220" y="110">{{
            s.schedName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="220" y="130">{{ s.schedSub }}</text>

        <rect fill="var(--dc3-be-fill)" height="270" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="280"
              x="80" y="194"/>
        <text fill="var(--dc3-box-name)" font-size="12" font-weight="600" text-anchor="middle" x="220" y="222">{{
            s.drvName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="220" y="242">{{ s.drvSub }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="272">{{ s.drvB1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="290">{{ s.drvB2 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="308">{{ s.drvB3 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" x="96" y="326">{{ s.drvB4 }}</text>

        <rect fill="var(--dc3-bus-fill)" height="56" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="280"
              x="80" y="500"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="220" y="524">{{
            s.trName
          }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8.5" text-anchor="middle" x="220" y="542">{{ s.trSub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="280" x="80" y="572"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="220" y="592">{{
            s.wrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="220" y="608">{{ s.wrSub }}</text>

        <!-- slave data areas -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="560"
              x="600" y="212"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="880" y="236">{{
            s.coilName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="880" y="254">{{ s.fc01Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="560"
              x="600" y="294"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="880" y="318">{{
            s.diName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="880" y="336">{{ s.fc02Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="560"
              x="600" y="376"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="880" y="400">{{
            s.hrName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="880" y="418">{{ s.fc03Sub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="560"
              x="600" y="458"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="880" y="482">{{
            s.irName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="880" y="500">{{ s.fc04Sub }}</text>

        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="560" x="600" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="880" y="550">{{
            s.asmName
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="880" y="568">{{ s.asmSub }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" text-anchor="middle" x="880" y="606">{{ s.offsetNote }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="60" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="669">{{ s.legDrv }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="190" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="669">{{ s.legSlave }}</text>
        <line marker-end="url(#mtcp-ah)" marker-start="url(#mtcp-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="330" x2="380" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="388" y="669">{{ s.legRead }}</text>
        <line marker-end="url(#mtcp-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="0.9" x1="540" x2="590" y1="664" y2="664"/>
        <text fill="var(--dc3-text2)" font-size="9" x="598" y="669">{{ s.legWrite }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="760" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="782" y="669">{{ s.legProto }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="900" y="660"/>
        <text fill="var(--dc3-text2)" font-size="9" x="922" y="669">{{ s.legSched }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
