<!--
  - Copyright 2016-present the IoT DC3 original author or authors.
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -->
<script lang="ts" setup>
import {computed} from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), {lang: 'zh'})

const DICT = {
  zh: {
    stageA: '阶段 A · 声明期（驱动启动时）',
    stageB: '阶段 B · 配置期（集成者）',
    stageC: '阶段 C · 运行期（采集执行）',
    s1: '① 读 application.yml', s1Sub1: 'driver-attribute: host · port …',
    s1Sub2: 'point-attribute: registerAddress …',
    s2: '② 随注册上报 Manager', s2Sub1: 'RegisterBO 携带属性集',
    s2Sub2: 'DriverInitRunner 触发 · 失败退避重试',
    s3: '③ 属性定义落库', s3Sub1: '唯一键 tenant_id + driver_id',
    s3Sub2: '+ attribute_code · 写入或更新',
    s4: '④ 设备编辑页加载属性列', s4Sub1: '按当前 driverId 列出配置项',
    s4Sub2: '按类型与默认值渲染表单',
    s5: '⑤ 集成者逐项填值', s5Sub1: 'host = 192.168.1.10 · port = 502',
    s5Sub2: 'registerAddress = 40001',
    s6: '⑥ 配置值落库', s6Sub1: 'DriverAttributeConfig 一台设备一份',
    s6Sub2: 'PointAttributeConfig 每位号一份',
    s7: '⑦ 驱动拉取配置', s7Sub1: '按配置连接设备网关',
    s7Sub2: '组装协议报文要素',
    s8: '⑧ 采集 / 执行', s8Sub1: '读寄存器 / 订阅 Topic → 位号值',
    s8Sub2: '自定义指令 execute() 渲染报文',
    lblParse: '解析声明', lblReport: '上报注册', lblRender: '页面按属性渲染表单',
    lblFill: '逐项填写', lblSave: '保存 Config', lblLoad: '运行时读取', lblRun: '生效采集',
    chipDecl: 'DriverAttribute / PointAttribute', chipDeclSub: '声明（模具 · 权威来源是驱动）',
    chipCfg: 'DriverAttributeConfig / PointAttributeConfig', chipCfgSub: '实例值（浇出来的件）',
    chipFix: '缺采集 → 多半 Config 填错（页面改值即可）',
    chipFixSub: '缺能力 → Attribute 未声明（改 yml 重启）',
    chipScope: '位号读写走位号属性配置',
    chipScopeSub: '指令属性仅 execute() 自定义指令消费',
    legStage: '阶段（区域）', legDecl: '驱动侧', legCfg: '集成侧',
    legRun: '执行侧', legStore: '落库产出',
    aria: '属性与配置的三阶段流程：声明期驱动从 application.yml 读取配置项并随注册上报 Manager 按唯一键落库；配置期设备编辑页按驱动声明渲染表单、集成者逐项填值形成 Config；运行期驱动拉取配置连接设备并组装协议报文完成采集与指令执行'
  },
  en: {
    stageA: 'Stage A · Declare (at driver startup)',
    stageB: 'Stage B · Configure (integrator)',
    stageC: 'Stage C · Runtime (collect & execute)',
    s1: '(1) Read application.yml', s1Sub1: 'driver-attribute: host · port …',
    s1Sub2: 'point-attribute: registerAddress …',
    s2: '(2) Report with registration', s2Sub1: 'RegisterBO carries attribute set',
    s2Sub2: 'triggered by DriverInitRunner · backoff retry',
    s3: '(3) Persist attribute defs', s3Sub1: 'unique key tenant_id + driver_id',
    s3Sub2: '+ attribute_code · upsert',
    s4: '(4) Device editor loads columns', s4Sub1: 'list config items by driverId',
    s4Sub2: 'render form by type & default',
    s5: '(5) Integrator fills values', s5Sub1: 'host = 192.168.1.10 · port = 502',
    s5Sub2: 'registerAddress = 40001',
    s6: '(6) Persist config values', s6Sub1: 'DriverAttributeConfig one per device',
    s6Sub2: 'PointAttributeConfig one per point',
    s7: '(7) Driver pulls configs', s7Sub1: 'connect the device gateway',
    s7Sub2: 'assemble protocol payload parts',
    s8: '(8) Collect / execute', s8Sub1: 'read register / subscribe topic → point value',
    s8Sub2: 'custom command execute() renders payload',
    lblParse: 'parse decl', lblReport: 'report & register', lblRender: 'form rendered from decl',
    lblFill: 'fill each', lblSave: 'save Config', lblLoad: 'load at runtime', lblRun: 'take effect',
    chipDecl: 'DriverAttribute / PointAttribute', chipDeclSub: 'declaration (mold · driver is authoritative)',
    chipCfg: 'DriverAttributeConfig / PointAttributeConfig', chipCfgSub: 'concrete values (the casting)',
    chipFix: 'no collection → likely wrong Config (fix in UI)',
    chipFixSub: 'no capability → Attribute not declared (edit yml, restart)',
    chipScope: 'point read/write uses point attribute configs',
    chipScopeSub: 'command attributes only consumed by execute()',
    legStage: 'stage (region)', legDecl: 'driver side', legCfg: 'integrator side',
    legRun: 'execution side', legStore: 'persisted artifacts',
    aria: 'Attribute & config three-stage flow: at startup the driver reads config items from application.yml and registers them with the manager under a unique key; during configuration the device editor renders a form from the declarations and the integrator fills values into Config; at runtime the driver pulls configs, connects the device and assembles protocol payloads for collection and command execution'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 640">
        <defs>
          <marker id="acf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="acf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#acf-grid)" height="100%" width="100%"/>

        <!-- stage regions -->
        <rect fill="var(--dc3-region-amber)" height="440" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="390" x="40" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="88">{{ s.stageA }}</text>
        <rect fill="var(--dc3-region-be)" height="440" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="390" x="460" y="70"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="472" y="88">{{ s.stageB }}</text>
        <rect fill="var(--dc3-region-amber)" height="440" rx="12" stroke="var(--dc3-ext-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="380" x="880" y="70"/>
        <text fill="var(--dc3-ext-stroke)" font-size="10" font-weight="600" x="892" y="88">{{ s.stageC }}</text>

        <!-- arrows -->
        <line marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="235" x2="235" y1="216" y2="256"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="243" y="240">{{ s.lblParse }}</text>
        <line marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="235" x2="235" y1="336" y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="243" y="360">{{ s.lblReport }}</text>
        <path d="M 410 418 H 440 V 190 H 476" fill="none" marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="448" y="300">{{ s.lblRender }}</text>
        <line marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="655" x2="655" y1="216" y2="256"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="663" y="240">{{ s.lblFill }}</text>
        <line marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="655" x2="655" y1="336" y2="376"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="663" y="360">{{ s.lblSave }}</text>
        <path d="M 830 418 H 860 V 228 H 896" fill="none" marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="868" y="330">{{ s.lblLoad }}</text>
        <line marker-end="url(#acf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1070" x2="1070" y1="266"
              y2="326"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1078" y="300">{{ s.lblRun }}</text>

        <!-- stage A nodes -->
        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="350" x="60" y="140"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="235" y="162">{{
            s.s1
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="235" y="182">{{ s.s1Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="235" y="200">{{ s.s1Sub2 }}</text>
        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="350" x="60" y="260"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="235" y="282">{{
            s.s2
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="235" y="302">{{ s.s2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="235" y="320">{{ s.s2Sub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="350"
              x="60" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="235" y="402">{{
            s.s3
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="235" y="422">{{ s.s3Sub1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="235" y="440">{{ s.s3Sub2 }}</text>

        <!-- stage B nodes -->
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="350"
              x="480" y="140"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="655" y="162">{{
            s.s4
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="655" y="182">{{ s.s4Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="655" y="200">{{ s.s4Sub2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="350"
              x="480" y="260"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="655" y="282">{{
            s.s5
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="655" y="302">{{ s.s5Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="655" y="320">{{ s.s5Sub2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="350"
              x="480" y="380"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="655" y="402">{{
            s.s6
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="655" y="422">{{ s.s6Sub1 }}</text>
        <text fill="var(--dc3-be-text)" font-size="8.5" text-anchor="middle" x="655" y="440">{{ s.s6Sub2 }}</text>

        <!-- stage C nodes -->
        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="340" x="900" y="190"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1070" y="212">{{
            s.s7
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="232">{{ s.s7Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="250">{{ s.s7Sub2 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="86" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="340"
              x="900" y="330"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1070" y="352">{{
            s.s8
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="372">{{ s.s8Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1070" y="392">{{ s.s8Sub2 }}</text>

        <!-- artifact chips -->
        <rect fill="var(--dc3-db-fill)" height="44" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="260"
              x="60" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" x="72" y="548">{{ s.chipDecl }}</text>
        <text fill="var(--dc3-db-text)" font-size="8" x="72" y="564">{{ s.chipDeclSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="44" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="300"
              x="340" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" x="352" y="548">{{ s.chipCfg }}</text>
        <text fill="var(--dc3-db-text)" font-size="8" x="352" y="564">{{ s.chipCfgSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="300" x="660" y="530"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" font-weight="600" x="672" y="548">{{ s.chipFix }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="672" y="564">{{ s.chipFixSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,3"
              stroke-width="1" width="300" x="980" y="530"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" x="992" y="548">{{ s.chipScope }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="992" y="564">{{ s.chipScopeSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-region-amber)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="42" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="64" y="613">{{ s.legStage }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="170" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="192" y="613">{{ s.legDecl }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="280" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="302" y="613">{{ s.legCfg }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="400" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="613">{{ s.legRun }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="520" y="604"/>
        <text fill="var(--dc3-text2)" font-size="9" x="542" y="613">{{ s.legStore }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style scoped>
/* palette + card chrome come from the site-level .dc3-diagram wrapper */
</style>
