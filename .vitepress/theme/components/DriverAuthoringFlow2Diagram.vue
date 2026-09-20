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
    aria: '驱动属性配置与采集调度两张链路：启动期 application.yml 的 dc3.driver 经 SDK 宽松绑定为 DriverProperties、组装 RegisterBO、经 gRPC 提交管理中心落库 dc3_driver 与 dc3_driver_attribute，管理侧据此渲染设备配置表单；运行期 Quartz 按 read cron 遍历 DriverMetadata 缓存、向线程池提交每设备读任务、调用协议实现 read() 得到 ReadPointValue、经 RabbitMQ 发布 point_value 由数据中心落库',
    regBoot: '启动期 · 属性注册链路（配置如何变成管理中心的表单）',
    regRun: '运行期 · 读调度（数据如何出站）',
    a1: 'application.yml', a1s: 'dc3.driver.*',
    a2: 'DriverProperties', a2s: 'SDK 宽松绑定',
    a3: 'RegisterBO', a3s: '驱动元数据 + 属性定义',
    a4: 'dc3-center-manager', a4s: '注册入口 :8400',
    a5: 'dc3_driver /', a5s: 'dc3_driver_attribute',
    u1: 'Web 配置表单', u1s: '按属性定义渲染 · 填设备配置值',
    u2: 'DriverMetadata 缓存', u2s: '运行时 Map<String, AttributeBO>',
    lblBind: '宽松绑定', lblBuild: '组装', lblGrpc: 'gRPC 提交', lblPersist: '落库',
    lblForm: '表单定义', lblConfig: '配置值', lblCache: '拉取 / 事件刷新',
    r1: 'DriverReadScheduleJob', r1s: 'Quartz · cron 0/30 * * * * ?',
    r2: 'DriverMetadata', r2s: '设备 / 位号 / 配置缓存',
    r3: '读线程池', r3s: '每设备一任务',
    r4: 'read(...)', r4s: 'DriverCustomService 协议实现',
    r5: 'RabbitMQ', r5s: 'point_value 队列',
    r6: 'dc3-center-data', r6s: '消费 · TimescaleDB 落库',
    lblIter: '遍历设备', lblTask: '提交任务', lblCall: '调用', lblPub: '发布', lblConsume: '消费',
    lblValue: 'ReadPointValue',
    lblProvide: '提供设备与配置值（跨期通道）',
    note: 'read() / write() 抛异常是 SDK 约定的失败信号 —— 不要静默吞异常；单个位号读取失败不应拖垮整轮采集',
    legCfg: '配置 / 协议实现', legSdk: 'SDK 与中心服务', legSched: '调度器',
    legBus: '消息总线', legDb: '持久化', legDash: '运行时数据通道'
  },
  en: {
    aria: 'Two linked chains for driver attributes and collection scheduling: at startup dc3.driver in application.yml is loose-bound into DriverProperties, packed into a RegisterBO and submitted over gRPC to the manager, persisting into dc3_driver and dc3_driver_attribute which drive the per-device config forms; at runtime Quartz fires the read cron, walks the DriverMetadata cache, submits one task per device to the thread pool, calls the protocol read(), and the resulting ReadPointValue is published to RabbitMQ and consumed by the data center into TimescaleDB',
    regBoot: 'Startup · attribute registration (config becomes manager forms)',
    regRun: 'Runtime · read schedule (how data leaves the driver)',
    a1: 'application.yml', a1s: 'dc3.driver.*',
    a2: 'DriverProperties', a2s: 'SDK loose binding',
    a3: 'RegisterBO', a3s: 'driver metadata + attribute defs',
    a4: 'dc3-center-manager', a4s: 'registry :8400',
    a5: 'dc3_driver /', a5s: 'dc3_driver_attribute',
    u1: 'Web config form', u1s: 'rendered from defs · device config values',
    u2: 'DriverMetadata cache', u2s: 'runtime Map<String, AttributeBO>',
    lblBind: 'bind', lblBuild: 'pack', lblGrpc: 'gRPC submit', lblPersist: 'persist',
    lblForm: 'form defs', lblConfig: 'config values', lblCache: 'pull / event refresh',
    r1: 'DriverReadScheduleJob', r1s: 'Quartz · cron 0/30 * * * * ?',
    r2: 'DriverMetadata', r2s: 'device / point / config cache',
    r3: 'read pool', r3s: 'one task per device',
    r4: 'read(...)', r4s: 'DriverCustomService protocol impl',
    r5: 'RabbitMQ', r5s: 'point_value queue',
    r6: 'dc3-center-data', r6s: 'consume · store to TimescaleDB',
    lblIter: 'walk devices', lblTask: 'submit task', lblCall: 'invoke', lblPub: 'publish', lblConsume: 'consume',
    lblValue: 'ReadPointValue',
    lblProvide: 'provides devices & configs (cross-phase channel)',
    note: 'Exceptions thrown from read()/write() are the SDK failure contract — never swallow them; a single failed point must not sink the whole collection round',
    legCfg: 'Config / protocol impl', legSdk: 'SDK & center services', legSched: 'Scheduler',
    legBus: 'Message bus', legDb: 'Persistence', legDash: 'Runtime data channel'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1280 700">
        <defs>
          <marker id="daf2-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="daf2-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#daf2-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1200" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regBoot }}</text>
        <rect fill="var(--dc3-region-be)" height="250" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1200" x="40" y="350"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="368">{{ s.regRun }}</text>

        <!-- cross-region channel (drawn first) -->
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="615"
              x2="415" y1="262" y2="402"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="515" y="326">{{ s.lblProvide }}</text>

        <!-- startup chain arrows -->
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="248" x2="288" y1="147" y2="147"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="268" y="139">{{ s.lblBind }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="476" x2="516" y1="147" y2="147"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="496" y="139">{{ s.lblBuild }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="714" x2="772" y1="147" y2="147"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="743" y="139">{{ s.lblGrpc }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="970" x2="1028" y1="147" y2="147"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="999" y="139">{{ s.lblPersist }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="871" x2="871" y1="176" y2="208"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="879" y="196">{{ s.lblForm }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="776" x2="712" y1="234" y2="234"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="744" y="228">{{ s.lblConfig }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="615"
              x2="615" y1="208" y2="178"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="623" y="200">{{ s.lblCache }}</text>

        <!-- runtime chain arrows -->
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="278" x2="326" y1="433" y2="433"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="302" y="425">{{ s.lblIter }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="504" x2="542" y1="433" y2="433"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="523" y="425">{{ s.lblTask }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="690" x2="738" y1="433" y2="433"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="714" y="425">{{ s.lblCall }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="906" x2="976" y1="433" y2="433"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="941" y="425">{{ s.lblValue }}</text>
        <line marker-end="url(#daf2-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1060" x2="1060" y1="462"
              y2="492"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1068" y="482">{{ s.lblConsume }}</text>

        <!-- startup nodes -->
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="64" y="118"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="154" y="142">
          {{ s.a1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="154" y="160">{{ s.a1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="292" y="118"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="382" y="142">
          {{ s.a2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="382" y="160">{{ s.a2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="520" y="118"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="615" y="142">
          {{ s.a3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="615" y="160">{{ s.a3s }}</text>
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="776" y="118"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="871" y="142">
          {{ s.a4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="871" y="160">{{ s.a4s }}</text>
        <rect fill="var(--dc3-db-fill)" height="58" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="180"
              x="1032" y="118"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1122" y="142">
          {{ s.a5 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8.5" text-anchor="middle" x="1122" y="160">{{ s.a5s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="776" y="210"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="871" y="230">
          {{ s.u1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="871" y="246">{{ s.u1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="520" y="210"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="615" y="230">
          {{ s.u2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="615" y="246">{{ s.u2s }}</text>

        <!-- runtime nodes -->
        <rect fill="var(--dc3-amber-fill)" height="58" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="210" x="64" y="404"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="169" y="428">
          {{ s.r1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="169" y="446">{{ s.r1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="170"
              x="330" y="404"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="415" y="428">
          {{ s.r2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="415" y="446">{{ s.r2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="58" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="140"
              x="546" y="404"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="616" y="428">
          {{ s.r3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="616" y="446">{{ s.r3s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="58" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="160"
              x="742" y="404"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="822" y="428">
          {{ s.r4 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="822" y="446">{{ s.r4s }}</text>
        <rect fill="var(--dc3-bus-fill)" height="58" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="160"
              x="980" y="404"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1060" y="428">
          {{ s.r5 }}
        </text>
        <text fill="var(--dc3-bus-text)" font-size="8" text-anchor="middle" x="1060" y="446">{{ s.r5s }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="980" y="494"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1060" y="514">
          {{ s.r6 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1060" y="530">{{ s.r6s }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1200" x="40" y="612"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="636">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="681">{{ s.legCfg }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="220" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="242" y="681">{{ s.legSdk }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="410" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="432" y="681">{{ s.legSched }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="520" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="542" y="681">{{ s.legBus }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="640" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="681">{{ s.legDb }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="1" x1="760" x2="788" y1="678" y2="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="794" y="681">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
