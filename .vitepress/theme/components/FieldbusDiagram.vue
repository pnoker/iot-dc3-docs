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
    aria: '工业总线物理拓扑：左侧串行总线形态，主站挂在干线一端，从站经短分支接入，中继器在两段之间再生信号，干线两端接终端电阻；右侧以太网形态，客户端与各服务端经交换机星型互联，既可轮询也可订阅',
    regionSerial: '串行总线形态 · RS-485 / Modbus RTU（干线 + 分支 + 中继器）',
    regionEther: '以太网形态 · Modbus TCP / OPC UA（星型 + 交换机）',
    master: '主站 Master', masterSub: 'SCADA / 采集网关',
    repeater: '中继器', repeaterSub1: '信号再生', repeaterSub2: '扩展段长/节点',
    term: '终端电阻',
    s1: '从站 1', s2: '从站 2', s3: '从站 3', s4: '从站 4', s5: '从站 5',
    sid: 'slaveId', slaveDev1: '温度变送器', slaveDev2: '变频器', slaveDev3: '电表',
    slaveDev4: '远程 IO', slaveDev5: 'PLC 从站',
    segA: '段 A（节点数受限）', segB: '段 B',
    poll: '轮询', resp: '应答',
    client: '客户端（主站）', clientSub: 'OPC UA / Modbus TCP',
    srv1: '服务端 1', srv1Sub: 'PLC · NodeId 寻址',
    srv2: '服务端 2', srv2Sub: '电表 · 寄存器 + 功能码',
    srv3: '服务端 3', srv3Sub: '仪表 / 远程 IO',
    switch: '交换机 Switch', switchSub: '星型 · 全双工',
    lk1: 'IP + 端口 :502', lk2: '轮询 / 读写', lk3: '一问一答', lk4: '值变推送（订阅）',
    noteSerial: '物理形态：一条干线 + 短分支（反射小）；两端终端电阻；中继器扩展段长与节点数',
    noteEther: '星型全双工，每设备独享带宽；OPC UA 可浏览地址空间并订阅推送，省去无谓轮询',
    m1: '主从 / 请求-响应', m1a: 'Modbus · S7 · IEC104 · FINS', m1b: '寻址：功能码 + 0 基寄存器偏移',
    m2: '客户端-服务器', m2a: 'OPC UA / DA · EtherNet/IP (CIP)', m2b: '寻址：NodeId / 标签名 · 可订阅',
    m3: '发布-订阅', m3a: 'CAN · MQTT', m3b: '寻址：CAN ID / 主题 · 广播过滤',
    legMaster: '主站 / 客户端', legSlave: '从站 / 服务端', legTrunk: '总线干线 / 链路',
    legRep: '中继器 / 交换机', legPoll: '轮询 / 读写（实线）', legSub: '订阅推送（虚线）'
  },
  en: {
    aria: 'Fieldbus physical topology: on the left the serial bus form, with the master on the trunk, slaves on short drops, a repeater regenerating the signal between two segments and terminators at both trunk ends; on the right the Ethernet form, a star around a switch where clients poll or subscribe to servers',
    regionSerial: 'Serial bus · RS-485 / Modbus RTU (trunk + drops + repeater)',
    regionEther: 'Ethernet · Modbus TCP / OPC UA (star + switch)',
    master: 'Master', masterSub: 'SCADA / acquisition gateway',
    repeater: 'Repeater', repeaterSub1: 'signal regen', repeaterSub2: 'extend segment',
    term: 'terminator',
    s1: 'Slave 1', s2: 'Slave 2', s3: 'Slave 3', s4: 'Slave 4', s5: 'Slave 5',
    sid: 'slaveId', slaveDev1: 'temp transmitter', slaveDev2: 'VFD', slaveDev3: 'power meter',
    slaveDev4: 'remote IO', slaveDev5: 'PLC slave',
    segA: 'Segment A (node-limited)', segB: 'Segment B',
    poll: 'poll', resp: 'resp',
    client: 'Client (master)', clientSub: 'OPC UA / Modbus TCP',
    srv1: 'Server 1', srv1Sub: 'PLC · NodeId addressing',
    srv2: 'Server 2', srv2Sub: 'meter · register + fn code',
    srv3: 'Server 3', srv3Sub: 'instrument / remote IO',
    switch: 'Switch', switchSub: 'star · full-duplex',
    lk1: 'IP + port :502', lk2: 'poll / read-write', lk3: 'req-resp', lk4: 'push on change (sub)',
    noteSerial: 'one trunk + short drops (less reflection); terminators at both ends; repeater extends length and node count',
    noteEther: 'star full-duplex, dedicated bandwidth per device; OPC UA can browse the address space and subscribe instead of polling',
    m1: 'Master-slave / req-resp', m1a: 'Modbus · S7 · IEC104 · FINS', m1b: 'address: fn code + 0-based register',
    m2: 'Client-server', m2a: 'OPC UA / DA · EtherNet/IP (CIP)', m2b: 'address: NodeId / tag name · subscribable',
    m3: 'Publish-subscribe', m3a: 'CAN · MQTT', m3b: 'address: CAN ID / topic · broadcast filter',
    legMaster: 'Master / client', legSlave: 'Slave / server', legTrunk: 'Bus trunk / link',
    legRep: 'Repeater / switch', legPoll: 'Poll / R-W (solid)', legSub: 'Subscription push (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 600">
        <defs>
          <marker id="fb-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="fb-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="fb-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#fb-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="380" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="640" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionSerial }}</text>
        <rect fill="var(--dc3-region-be)" height="380" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="590" x="700" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="714" y="90">{{ s.regionEther }}</text>

        <!-- serial: trunk (before nodes) -->
        <line stroke="var(--dc3-bus-stroke)" stroke-width="3" x1="100" x2="350" y1="298" y2="298"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="3" x1="405" x2="650" y1="298" y2="298"/>
        <!-- master tap + drops -->
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="115" x2="115" y1="174" y2="298"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="190" x2="190" y1="298" y2="340"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="292" x2="292" y1="298" y2="340"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="450" x2="450" y1="298" y2="340"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="535" x2="535" y1="298" y2="340"/>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="1.5" x1="620" x2="620" y1="298" y2="340"/>
        <!-- poll / response pair -->
        <line marker-end="url(#fb-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="122" x2="176" y1="288"
              y2="288"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="140" y="281">{{ s.poll }}</text>
        <line marker-end="url(#fb-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="176" x2="122" y1="310"
              y2="310"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="140" y="323">{{ s.resp }}</text>
        <!-- segment labels + terminators -->
        <text fill="var(--dc3-text2)" font-size="8" x="220" y="268">{{ s.segA }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="490" y="268">{{ s.segB }}</text>
        <rect fill="var(--dc3-ext-fill)" height="18" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="8" x="92" y="289"/>
        <text fill="var(--dc3-text2)" font-size="7.5" x="96" y="326">{{ s.term }}</text>
        <rect fill="var(--dc3-ext-fill)" height="18" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="8" x="650" y="289"/>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="end" x="612" y="330">{{ s.term }}</text>

        <!-- ethernet: links (before nodes) -->
        <line marker-end="url(#fb-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="815" x2="958" y1="154"
              y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="845" y="200">{{ s.lk1 }}</text>
        <line marker-end="url(#fb-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1015" x2="1015" y1="154"
              y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1023" y="205">{{ s.lk2 }}</text>
        <line marker-end="url(#fb-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1185" x2="1042" y1="154"
              y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1110" y="195">{{ s.lk3 }}</text>
        <line marker-end="url(#fb-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="1175" x2="1082" y1="350" y2="298"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="1095" y="345">{{ s.lk4 }}</text>

        <!-- serial: master node -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="130" x="50" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="115" y="136">{{
            s.master
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="115" y="154">{{ s.masterSub }}</text>

        <!-- serial: repeater -->
        <rect fill="var(--dc3-amber-fill)" height="60" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="55" x="350" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" text-anchor="middle" x="377" y="288">{{
            s.repeater
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="377" y="304">{{ s.repeaterSub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="377" y="318">{{ s.repeaterSub2 }}</text>

        <!-- serial: slaves -->
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="84" x="148" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="190" y="358">{{
            s.s1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="190" y="374">{{ s.sid }}=1</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="190" y="390">{{ s.slaveDev1 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="84" x="250" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="292" y="358">{{
            s.s2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="292" y="374">{{ s.sid }}=2</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="292" y="390">{{ s.slaveDev2 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="84" x="408" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="450" y="358">{{
            s.s3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="450" y="374">{{ s.sid }}=3</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="450" y="390">{{ s.slaveDev3 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="84" x="493" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="535" y="358">{{
            s.s4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="535" y="374">{{ s.sid }}=4</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="535" y="390">{{ s.slaveDev4 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="84" x="578" y="340"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="620" y="358">{{
            s.s5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="620" y="374">{{ s.sid }}=5</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="620" y="390">{{ s.slaveDev5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="44" y="436">{{ s.noteSerial }}</text>

        <!-- ethernet nodes -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="170" x="730" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="815" y="116">{{
            s.client
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="815" y="134">{{ s.clientSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="940" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1015" y="116">{{
            s.srv1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1015" y="134">{{ s.srv1Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="1110" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1185" y="116">{{
            s.srv2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1185" y="134">{{ s.srv2Sub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="64" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="1100" y="350"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1175" y="376">{{
            s.srv3
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1175" y="394">{{ s.srv3Sub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="56" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1.5"
              width="160" x="920" y="270"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1000" y="294">{{
            s.switch
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1000" y="312">{{ s.switchSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="714" y="436">{{ s.noteEther }}</text>

        <!-- communication model cards -->
        <rect fill="var(--dc3-amber-fill)" height="68" rx="8" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="400" x="40" y="470"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="240"
              y="492">{{ s.m1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="510">{{ s.m1a }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="240" y="526">{{ s.m1b }}</text>
        <rect fill="var(--dc3-bus-fill)" height="68" rx="8" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="400" x="460" y="470"/>
        <text fill="var(--dc3-bus-text)" font-size="10.5" font-weight="700" text-anchor="middle" x="660"
              y="492">{{ s.m2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="510">{{ s.m2a }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="660" y="526">{{ s.m2b }}</text>
        <rect fill="var(--dc3-be-fill)" height="68" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="400" x="880" y="470"/>
        <text fill="var(--dc3-be-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1080"
              y="492">{{ s.m3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="510">{{ s.m3a }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1080" y="526">{{ s.m3b }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="40" y="562"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="571">{{ s.legMaster }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="185" y="562"/>
        <text fill="var(--dc3-text2)" font-size="9" x="207" y="571">{{ s.legSlave }}</text>
        <line stroke="var(--dc3-bus-stroke)" stroke-width="3" x1="330" x2="360" y1="567" y2="567"/>
        <text fill="var(--dc3-text2)" font-size="9" x="366" y="571">{{ s.legTrunk }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="510" y="562"/>
        <text fill="var(--dc3-text2)" font-size="9" x="532" y="571">{{ s.legRep }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="670" x2="700" y1="567" y2="567"/>
        <text fill="var(--dc3-text2)" font-size="9" x="706" y="571">{{ s.legPoll }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="880" x2="910" y1="567"
              y2="567"/>
        <text fill="var(--dc3-text2)" font-size="9" x="916" y="571">{{ s.legSub }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
