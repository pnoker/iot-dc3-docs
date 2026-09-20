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
    profileTitle: '模板 PROFILE · dc3_profile',
    eventTitle: '事件 EVENT · dc3_event',
    paramTitle: '事件参数 EVENT_PARAM',
    histTitle: '事件流水 EVENT_HISTORY',
    alarmTitle: '实体告警 ENTITY_ALARM',
    lblOwns: '1:N 事件定义挂模板',
    lblParams: '1:N 出参声明',
    lblInst: '定义 → 实例 1:N · 驱动上报',
    lblAlarm: '命中规则才有',
    typeCard: '类型 eventTypeFlag: info 信息 · alert 告警 · fault 故障 · lifecycle 生命周期',
    levelCard: '级别 eventLevelFlag: 0 LOW · 1 MEDIUM · 2 HIGH · 3 CRITICAL',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 一对多', legAlarm: '告警派生（虚线）', legChip: '枚举注记',
    aria: '事件实体关系图：事件定义通过 profileId 挂在模板下并声明携带的输出参数；某台设备某时刻真的报了一次成为事件流水记录；原始流水每次上报都记，只有命中告警规则才派生出运行态告警；类型分信息告警故障生命周期四档、级别分四档'
  },
  en: {
    profileTitle: 'PROFILE · dc3_profile',
    eventTitle: 'EVENT · dc3_event',
    paramTitle: 'EVENT_PARAM · dc3_event_param',
    histTitle: 'EVENT_HISTORY · dc3_event_history',
    alarmTitle: 'ENTITY_ALARM · dc3_entity_alarm',
    lblOwns: '1:N event defs on profile',
    lblParams: '1:N output params',
    lblInst: 'definition → instance 1:N via driver',
    lblAlarm: 'only on rule hit',
    typeCard: 'eventTypeFlag: info · alert · fault · lifecycle',
    levelCard: 'eventLevelFlag: 0 LOW · 1 MEDIUM · 2 HIGH · 3 CRITICAL',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N one-to-many', legAlarm: 'alarm derivation (dashed)', legChip: 'enum note',
    aria: 'Event entity-relationship diagram: event definitions attach to a profile via profileId and declare their output params; a real report from a device becomes an event history record; raw history stores every report while only rule hits derive runtime alarms; four type tiers and four level tiers exist'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 660">
        <defs>
          <marker id="evr-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="evr-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="evr-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#evr-grid)" height="100%" width="100%"/>

        <!-- connectors -->
        <line marker-end="url(#evr-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="590" x2="590" y1="150" y2="226"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="598" y="192">{{ s.lblOwns }}</text>
        <path d="M 470 285 H 380 V 275 H 294" fill="none" marker-end="url(#evr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="382" y="267">{{ s.lblParams }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="458" y="279">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="298" y="269">N</text>
        <path d="M 540 365 V 420 H 205 V 456" fill="none" marker-end="url(#evr-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="372" y="412">{{ s.lblInst }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="548" y="392">1</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="213" y="450">N</text>
        <line marker-end="url(#evr-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.8"
              x1="350" x2="466" y1="530" y2="530"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="408" y="520">{{ s.lblAlarm }}</text>

        <!-- PROFILE entity -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="470" y="60"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="240" x="470" y="60"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="480" y="75">{{ s.profileTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="92">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="702" y="92">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="107">profileName · profileCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="122">version</text>

        <!-- EVENT entity -->
        <rect fill="var(--dc3-be-fill)" height="135" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.2" width="290"
              x="470" y="230"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="290" x="470" y="230"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="480" y="245">{{ s.eventTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="262">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="752" y="262">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="277">eventName · eventCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="752" y="277">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="292">eventTypeFlag（四档）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="307">eventLevelFlag（四档）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="322">eventExt (JSON)</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="337">profileId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="752" y="337">FK</text>

        <!-- EVENT_PARAM entity -->
        <rect fill="var(--dc3-be-fill)" height="90" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="230"
              x="60" y="230"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="230" x="60" y="230"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="70" y="245">{{ s.paramTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="262">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="282" y="262">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="277">paramName · paramCode</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="292">paramTypeFlag（复用 PointTypeEnum）</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="307">eventId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="282" y="307">FK</text>

        <!-- EVENT_HISTORY entity -->
        <rect fill="var(--dc3-db-fill)" height="150" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="290"
              x="60" y="460"/>
        <rect fill="var(--dc3-db-stroke)" height="22" rx="6" width="290" x="60" y="460"/>
        <text fill="var(--dc3-db-fill)" font-size="10" font-weight="600" x="70" y="475">{{ s.histTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="492">recordId (UUID)</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="342" y="492">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="507">deviceId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="342" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="522">eventId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="342" y="522">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="537">eventCode · type · level</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="552">paramValues · message</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="567">occurTime</text>

        <!-- ENTITY_ALARM entity -->
        <rect fill="var(--dc3-rose-fill)" height="90" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="250"
              x="470" y="460"/>
        <rect fill="var(--dc3-rose-stroke)" height="22" rx="6" width="250" x="470" y="460"/>
        <text fill="var(--dc3-rose-fill)" font-size="10" font-weight="600" x="480" y="475">{{ s.alarmTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="492">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="712" y="492">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="507">entity_type · entity_id</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="712" y="507">FK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="522">alarm_status · alarm_level</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="537">由规则引擎生成/更新</text>

        <!-- enum chips -->
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="340" x="850" y="230"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="862" y="246">{{ s.typeCard }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="262">DOOR_FORCED · SENSOR_FAULT …</text>
        <rect fill="var(--dc3-region-amber)" height="40" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="340" x="850" y="290"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="862" y="306">{{ s.levelCard }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="862" y="322">CRITICAL 命中规则即生成告警</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="644">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="644">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="644">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="644">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="644">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="644">{{ s.legUk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="360" x2="380" y1="641" y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="644">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3" stroke-width="0.8" x1="510" x2="530" y1="641"
              y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="536" y="644">{{ s.legAlarm }}</text>
        <rect fill="var(--dc3-region-amber)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="680" y="634"/>
        <text fill="var(--dc3-text2)" font-size="9" x="702" y="644">{{ s.legChip }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>

<style>
/* ER diagrams share a monospace field font; each Relation component re-declares this class */
.dc3-er svg text {
  font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace;
}

.dc3-er svg text[font-size='10'],
.dc3-er svg text[font-size='10.5'] {
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif;
}
</style>
