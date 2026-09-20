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
    aria: '数据平面类图：同一位号值在链路上的六个类形态——ReadPointValue、CalculatedPointValue、PointValue 属驱动侧，PointValueBO 属消息业务侧，PointValueDO 属持久层，PointValueVO 属 API 层，各层之间由构造、JSON 反序列化与 MapStruct Builder 衔接',
    drvRegion: '驱动侧 · 从原始读数到发送载荷',
    ctrRegion: '数据中心侧 · 消息 · 业务 · 持久 · API',
    readName: 'ReadPointValue', readTag: '«驱动 · read() 返回»',
    readF1: '+ deviceId / pointId', readF2: '+ rawValue 原始读数',
    readF3: '+ device/point 上下文', readF4: '+ 协议层原始采集',
    calcName: 'CalculatedPointValue', calcTag: '«驱动 · 换算 / 投影»',
    calcF1: '+ baseValue / multiple', calcF2: '+ finalValue 工程值字符串',
    calcF3: '+ numericValue 数值投影', calcF4: '+ numericValue 可为空',
    pvName: 'PointValue', pvTag: '«驱动发送 bean · MQ 载荷»',
    pvF1: '+ rawValue / calValue', pvF2: '+ numValue',
    pvF3: '+ createTime = 采集时刻', pvF4: 'new(read) 触发 calculate()',
    pvF5: '发往值交换机',
    boName: 'PointValueBO', boTag: '«消息 / 业务侧»',
    boF1: '+ tenantId', boF2: '+ createTime / operateTime',
    boF3: '+ 队列 JSON 反序列化', boF4: '+ 落库与告警评估输入',
    boF5: '≠ PointValue，分属不同层',
    doName: 'PointValueDO', doTag: '«持久层 · dc3_point_value»',
    doF1: '+ raw_value / cal_value TEXT', doF2: '+ num_value DOUBLE 可空',
    doF3: '+ create_time 采集时刻', doF4: '+ operate_time 落库时刻',
    doF5: 'schema dc3_history', doF6: 'TimescaleDB 超表',
    voName: 'PointValueVO', voTag: '«API 响应形态»',
    voF1: '+ deviceId / pointId', voF2: '+ rawValue / calValue / numValue',
    voF3: '+ createTime / operateTime', voF4: '+ hasLatestValue',
    voF5: '+ driverId / tenantId', voF6: 'MapStruct 映射自 DO',
    a1a: '线性换算', a1b: 'baseValue × multiple',
    a2a: 'new PointValue()', a2b: '触发 calculate()',
    a3a: 'Jackson JSON', a3b: '经 RabbitMQ 队列',
    a4: 'buildDOByBO · save', a5: 'buildBOByDO · query',
    a6: 'buildVOByBO → API 响应',
    legDrv: '驱动侧类', legBo: '消息 / 业务', legDb: '持久层', legVo: 'API 层',
    legMap: '对象转换流'
  },
  en: {
    aria: 'Data-plane class diagram: the six class faces of one point value — ReadPointValue, CalculatedPointValue and PointValue on the driver side, PointValueBO as the message/business object, PointValueDO for persistence and PointValueVO for the API, linked by construction, JSON deserialization and MapStruct builders',
    drvRegion: 'Driver side · raw reading to outbound payload',
    ctrRegion: 'Data-center side · message · business · persistence · API',
    readName: 'ReadPointValue', readTag: '«driver · read() result»',
    readF1: '+ deviceId / pointId', readF2: '+ rawValue original',
    readF3: '+ device/point context', readF4: '+ protocol-layer reading',
    calcName: 'CalculatedPointValue', calcTag: '«driver · scale / project»',
    calcF1: '+ baseValue / multiple', calcF2: '+ finalValue engineering string',
    calcF3: '+ numericValue projection', calcF4: '+ numericValue nullable',
    pvName: 'PointValue', pvTag: '«driver send bean · MQ payload»',
    pvF1: '+ rawValue / calValue', pvF2: '+ numValue',
    pvF3: '+ createTime = acquisition', pvF4: 'new(read) triggers calculate()',
    pvF5: 'published to value exchange',
    boName: 'PointValueBO', boTag: '«message / business»',
    boF1: '+ tenantId', boF2: '+ createTime / operateTime',
    boF3: '+ deserialized from queue JSON', boF4: '+ input to save & alarm',
    boF5: '≠ PointValue, different layer',
    doName: 'PointValueDO', doTag: '«persistence · dc3_point_value»',
    doF1: '+ raw_value / cal_value TEXT', doF2: '+ num_value DOUBLE null',
    doF3: '+ create_time acquired', doF4: '+ operate_time persisted',
    doF5: 'schema dc3_history', doF6: 'TimescaleDB hypertable',
    voName: 'PointValueVO', voTag: '«API response shape»',
    voF1: '+ deviceId / pointId', voF2: '+ rawValue / calValue / numValue',
    voF3: '+ createTime / operateTime', voF4: '+ hasLatestValue',
    voF5: '+ driverId / tenantId', voF6: 'MapStruct-mapped from DO',
    a1a: 'linear scaling', a1b: 'baseValue × multiple',
    a2a: 'new PointValue()', a2b: 'triggers calculate()',
    a3a: 'Jackson JSON', a3b: 'via RabbitMQ queue',
    a4: 'buildDOByBO · save', a5: 'buildBOByDO · query',
    a6: 'buildVOByBO → API response',
    legDrv: 'Driver class', legBo: 'Message / business', legDb: 'Persistence', legVo: 'API layer',
    legMap: 'Object mapping'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1040 648">
        <defs>
          <marker id="dpc-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="dpc-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#dpc-grid)" height="100%" width="100%"/>

        <!-- semantic regions -->
        <rect fill="var(--dc3-region-be)" height="230" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="860" x="90" y="80"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="102" y="98">{{ s.drvRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="230" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="860" x="90" y="350"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="102" y="368">{{ s.ctrRegion }}</text>

        <!-- arrows -->
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="312" x2="398" y1="190"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="355" y="178">{{ s.a1a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="355" y="212">{{ s.a1b }}</text>
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="622" x2="718" y1="190"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="670" y="178">{{ s.a2a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="670" y="212">{{ s.a2b }}</text>
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="825" x2="825" y1="312"
              y2="378"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" x="835" y="332">{{ s.a3a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="835" y="350">{{ s.a3b }}</text>
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="718" x2="622" y1="440" y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="670" y="430">{{ s.a4 }}</text>
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="622" x2="718" y1="495" y2="495"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="670" y="514">{{ s.a5 }}</text>
        <path d="M825,560 L825,592 L210,592 L210,572" fill="none" marker-end="url(#dpc-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="517" y="584">{{ s.a6 }}</text>

        <!-- ReadPointValue -->
        <rect fill="var(--dc3-be-fill)" height="170" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="110" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="210" y="134">
          {{ s.readName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="210" y="150">{{ s.readTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="118" x2="302" y1="158" y2="158"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="178">{{ s.readF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="196">{{ s.readF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="214">{{ s.readF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="232">{{ s.readF4 }}</text>

        <!-- CalculatedPointValue -->
        <rect fill="var(--dc3-be-fill)" height="190" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="400" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="510" y="134">
          {{ s.calcName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="510" y="150">{{ s.calcTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="408" x2="612" y1="158" y2="158"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="178">{{ s.calcF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="196">{{ s.calcF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="214">{{ s.calcF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="232">{{ s.calcF4 }}</text>

        <!-- PointValue -->
        <rect fill="var(--dc3-be-fill)" height="200" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="720" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="825" y="134">
          {{ s.pvName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="825" y="150">{{ s.pvTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="728" x2="922" y1="158" y2="158"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="178">{{ s.pvF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="196">{{ s.pvF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="214">{{ s.pvF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="232">{{ s.pvF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="250">{{ s.pvF5 }}</text>

        <!-- PointValueBO -->
        <rect fill="var(--dc3-amber-fill)" height="180" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="210" x="720" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="825" y="404">
          {{ s.boName }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="825" y="420">{{ s.boTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="728" x2="922" y1="428" y2="428"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="448">{{ s.boF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="466">{{ s.boF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="484">{{ s.boF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="732" y="502">{{ s.boF4 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="732" y="526">{{ s.boF5 }}</text>

        <!-- PointValueDO -->
        <rect fill="var(--dc3-db-fill)" height="190" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="220"
              x="400" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="510" y="404">
          {{ s.doName }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="510" y="420">{{ s.doTag }}</text>
        <line stroke="var(--dc3-db-stroke)" stroke-width="0.6" x1="408" x2="612" y1="428" y2="428"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="448">{{ s.doF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="466">{{ s.doF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="484">{{ s.doF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="502">{{ s.doF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="526">{{ s.doF5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="412" y="544">{{ s.doF6 }}</text>

        <!-- PointValueVO -->
        <rect fill="var(--dc3-fe-fill)" height="190" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="200"
              x="110" y="380"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="210" y="404">
          {{ s.voName }}
        </text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="210" y="420">{{ s.voTag }}</text>
        <line stroke="var(--dc3-fe-stroke)" stroke-width="0.6" x1="118" x2="302" y1="428" y2="428"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="448">{{ s.voF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="466">{{ s.voF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="484">{{ s.voF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="502">{{ s.voF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="520">{{ s.voF5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="122" y="544">{{ s.voF6 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="110" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="132" y="629">{{ s.legDrv }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="240" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="262" y="629">{{ s.legBo }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="400" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="629">{{ s.legDb }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="530" y="620"/>
        <text fill="var(--dc3-text2)" font-size="9" x="552" y="629">{{ s.legVo }}</text>
        <line marker-end="url(#dpc-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="650" x2="678" y1="626"
              y2="626"/>
        <text fill="var(--dc3-text2)" font-size="9" x="684" y="629">{{ s.legMap }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
