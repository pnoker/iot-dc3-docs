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
    aria: 'Agentic 会话持久化 ER 图：dc3_session 会话表居中，dc3_message 多轮消息与 dc3_attachment 附件分别以 N 比 1 经 conversation_id 指向会话；session_ext 以 JSONB 展开模型偏好；MessageChatMemoryRepository 按窗口 30 读回历史，交给 ChatClient 组装上下文',
    region: 'PostgreSQL · schema dc3_agentic · 会话持久化（跨重启续接 · 可审计）',
    sessionT: 'dc3_session · 会话',
    sessionRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · UK'],
      ['tenant_id', 'BIGINT · 租户隔离'],
      ['title', 'VARCHAR'],
      ['session_ext', 'JSONB · ▸ 展开'],
      ['created_at', 'TIMESTAMPTZ']
    ],
    messageT: 'dc3_message · 消息',
    messageRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · FK'],
      ['role', 'user · assistant'],
      ['content', 'TEXT'],
      ['model', 'VARCHAR'],
      ['message_index', 'INT · 轮次'],
      ['created_at', 'TIMESTAMPTZ']
    ],
    attachT: 'dc3_attachment · 附件',
    attachRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · FK'],
      ['file_name', 'VARCHAR'],
      ['content_type', 'VARCHAR'],
      ['file_size', 'BIGINT'],
      ['file_path', 'VARCHAR']
    ],
    attachNote: '* 文件本体落盘 AGENTIC_ATTACHMENT_STORAGE_PATH · 表内只存元数据',
    extT: 'session_ext · JSONB（会话偏好）',
    extL1: 'model · 提供方与模型名',
    extL2: 'temperature · 采样温度',
    extL3: 'maxTokens · 最大输出 token',
    extL4: '▸ 偏好跨轮沿用 · 不必每次重传',
    relMsgCard: 'N : 1',
    relMsgFk: 'conversation_id',
    relAttCard: 'N : 1',
    relAttFk: 'conversation_id',
    relExtCard: '1 : 1 · 展开',
    repoT: 'MessageChatMemoryRepository 适配器',
    repoS1: '按 conversation_id 读回历史消息',
    repoS2: '窗口 historyWindowSize = 30（默认）',
    readLabel: '读历史（最近 30 轮）',
    ccT: 'ChatClient · Spring AI',
    ccS1: '上下文 = 历史窗口 + 本轮提问',
    ccS2: '答完把新消息写回 dc3_message',
    feedLabel: '组装 prompt · 交给模型',
    legDb: '数据表（dc3_agentic）',
    legExt: 'JSONB 展开',
    legRepo: '读取适配器',
    legCc: '推理客户端',
    legFk: '外键关系（实线）',
    legRead: '读取流（虚线）'
  },
  en: {
    aria: 'Agentic chat persistence ER diagram: dc3_session in the center, dc3_message and dc3_attachment each reference the session N-to-1 via conversation_id; session_ext expands model preferences as JSONB; MessageChatMemoryRepository reads history back with window 30 and hands it to ChatClient to assemble the context',
    region: 'PostgreSQL · schema dc3_agentic · persistent sessions (survive restarts · auditable)',
    sessionT: 'dc3_session · session',
    sessionRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · UK'],
      ['tenant_id', 'BIGINT · tenant-scoped'],
      ['title', 'VARCHAR'],
      ['session_ext', 'JSONB · ▸ expand'],
      ['created_at', 'TIMESTAMPTZ']
    ],
    messageT: 'dc3_message · message',
    messageRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · FK'],
      ['role', 'user · assistant'],
      ['content', 'TEXT'],
      ['model', 'VARCHAR'],
      ['message_index', 'INT · turn'],
      ['created_at', 'TIMESTAMPTZ']
    ],
    attachT: 'dc3_attachment · attachment',
    attachRows: [
      ['id', 'BIGINT · PK'],
      ['conversation_id', 'UUID · FK'],
      ['file_name', 'VARCHAR'],
      ['content_type', 'VARCHAR'],
      ['file_size', 'BIGINT'],
      ['file_path', 'VARCHAR']
    ],
    attachNote: '* file bytes land in AGENTIC_ATTACHMENT_STORAGE_PATH · table stores metadata only',
    extT: 'session_ext · JSONB (preferences)',
    extL1: 'model · provider and model name',
    extL2: 'temperature · sampling temp',
    extL3: 'maxTokens · max output tokens',
    extL4: '▸ preferences carry over to next turns',
    relMsgCard: 'N : 1',
    relMsgFk: 'conversation_id',
    relAttCard: 'N : 1',
    relAttFk: 'conversation_id',
    relExtCard: '1 : 1 · expand',
    repoT: 'MessageChatMemoryRepository adapter',
    repoS1: 'reads history by conversation_id',
    repoS2: 'window historyWindowSize = 30 (default)',
    readLabel: 'read history (last 30 turns)',
    ccT: 'ChatClient · Spring AI',
    ccS1: 'context = history window + this turn',
    ccS2: 'new messages written back to dc3_message',
    feedLabel: 'assemble prompt · to model',
    legDb: 'table (dc3_agentic)',
    legExt: 'JSONB expansion',
    legRepo: 'read adapter',
    legCc: 'chat client',
    legFk: 'FK relation (solid)',
    legRead: 'read flow (dashed)'
  }
} as const
const s = computed(() => DICT[props.lang] ?? DICT.zh)

/* table row height: header band 30px + rows of 24px */
const rowH = 24
</script>
<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1240 600">
        <defs>
          <marker id="ager-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ager-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ager-grid)" height="100%" width="100%"/>

        <!-- region: dc3_agentic schema -->
        <rect fill="var(--dc3-region-be)" height="392" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1160" x="40" y="54"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="72">{{ s.region }}</text>

        <!-- relations (drawn before tables so endpoints stay clean) -->
        <line marker-end="url(#ager-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="380" x2="470" y1="190"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="425" y="180">{{ s.relMsgCard }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="425" y="203">{{ s.relMsgFk }}</text>
        <line marker-end="url(#ager-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="860" x2="770" y1="190"
              y2="190"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="815" y="180">{{ s.relAttCard }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="815" y="203">{{ s.relAttFk }}</text>
        <line marker-end="url(#ager-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="620" x2="620" y1="258"
              y2="316"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="632" y="292">{{ s.relExtCard }}</text>

        <!-- read flow (dashed) from dc3_message down to the adapter -->
        <line marker-end="url(#ager-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="220"
              x2="220" y1="302" y2="484"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" x="232" y="400">{{ s.readLabel }}</text>

        <!-- dc3_message table -->
        <rect fill="var(--dc3-db-fill)" height="198" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="320"
              x="60" y="104"/>
        <line stroke="var(--dc3-db-stroke)" stroke-opacity="0.4" stroke-width="0.6" x1="60" x2="380" y1="134"
              y2="134"/>
        <text fill="var(--dc3-db-text)" font-size="11" font-weight="600" x="72" y="124">{{ s.messageT }}</text>
        <line v-for="i in 6" :key="'msr'+i" stroke="var(--dc3-divider)" stroke-opacity="0.35" stroke-width="0.5"
              x1="60" x2="380" :y1="134 + i * rowH" :y2="134 + i * rowH"/>
        <template v-for="(r, i) in s.messageRows" :key="'mt'+i">
          <text fill="var(--dc3-text2)" font-size="8.5" x="72" :y="134 + i * rowH + 16.5">{{ r[0] }}</text>
          <text :fill="r[1].includes('FK') ? 'var(--dc3-rose-stroke)' : 'var(--dc3-db-stroke)'"
                font-size="8" text-anchor="end" x="368" :y="134 + i * rowH + 16.5">{{ r[1] }}</text>
        </template>

        <!-- dc3_session table (center, the aggregate root) -->
        <rect fill="var(--dc3-db-fill)" height="174" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1.5"
              width="300" x="470" y="84"/>
        <line stroke="var(--dc3-db-stroke)" stroke-opacity="0.4" stroke-width="0.6" x1="470" x2="770" y1="114"
              y2="114"/>
        <text fill="var(--dc3-db-text)" font-size="11" font-weight="600" x="482" y="104">{{ s.sessionT }}</text>
        <line v-for="i in 5" :key="'ssr'+i" stroke="var(--dc3-divider)" stroke-opacity="0.35" stroke-width="0.5"
              x1="470" x2="770" :y1="114 + i * rowH" :y2="114 + i * rowH"/>
        <template v-for="(r, i) in s.sessionRows" :key="'st'+i">
          <text fill="var(--dc3-text2)" font-size="8.5" x="482" :y="114 + i * rowH + 16.5">{{ r[0] }}</text>
          <text :fill="r[1].includes('FK') ? 'var(--dc3-rose-stroke)' : 'var(--dc3-db-stroke)'"
                font-size="8" text-anchor="end" x="758" :y="114 + i * rowH + 16.5">{{ r[1] }}</text>
        </template>

        <!-- dc3_attachment table -->
        <rect fill="var(--dc3-db-fill)" height="174" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="330"
              x="860" y="104"/>
        <line stroke="var(--dc3-db-stroke)" stroke-opacity="0.4" stroke-width="0.6" x1="860" x2="1190" y1="134"
              y2="134"/>
        <text fill="var(--dc3-db-text)" font-size="11" font-weight="600" x="872" y="124">{{ s.attachT }}</text>
        <line v-for="i in 5" :key="'asr'+i" stroke="var(--dc3-divider)" stroke-opacity="0.35" stroke-width="0.5"
              x1="860" x2="1190" :y1="134 + i * rowH" :y2="134 + i * rowH"/>
        <template v-for="(r, i) in s.attachRows" :key="'at'+i">
          <text fill="var(--dc3-text2)" font-size="8.5" x="872" :y="134 + i * rowH + 16.5">{{ r[0] }}</text>
          <text :fill="r[1].includes('FK') ? 'var(--dc3-rose-stroke)' : 'var(--dc3-db-stroke)'"
                font-size="8" text-anchor="end" x="1178" :y="134 + i * rowH + 16.5">{{ r[1] }}</text>
        </template>
        <text fill="var(--dc3-text2)" font-size="7.5" x="860" y="290">{{ s.attachNote }}</text>

        <!-- session_ext JSONB expansion -->
        <rect fill="var(--dc3-db-fill)" height="112" rx="6" stroke="var(--dc3-db-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="300" x="470" y="316"/>
        <text fill="var(--dc3-db-text)" font-size="10" font-weight="600" x="482" y="336">{{ s.extT }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="360">{{ s.extL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="380">{{ s.extL2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="400">{{ s.extL3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="420">{{ s.extL4 }}</text>

        <!-- read adapter + chat client (outside the DB region) -->
        <rect fill="var(--dc3-amber-fill)" height="76" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="340" x="60" y="486"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="230" y="510">{{
            s.repoT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="230" y="530">{{ s.repoS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="230" y="548">{{ s.repoS2 }}</text>
        <line marker-end="url(#ager-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="400" x2="818" y1="524"
              y2="524"/>
        <text fill="var(--dc3-arrow-label)" font-size="9" text-anchor="middle" x="610" y="516">{{ s.feedLabel }}</text>
        <rect fill="var(--dc3-fe-fill)" height="76" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="360"
              x="820" y="486"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1000" y="510">{{
            s.ccT
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1000" y="530">{{ s.ccS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="9" text-anchor="middle" x="1000" y="548">{{ s.ccS2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="60" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="579">{{ s.legDb }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-dasharray="3,2"
              stroke-width="1" width="16" x="230" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="252" y="579">{{ s.legExt }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="380" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="402" y="579">{{ s.legRepo }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="530" y="570"/>
        <text fill="var(--dc3-text2)" font-size="9" x="552" y="579">{{ s.legCc }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="680" x2="700" y1="576" y2="576"/>
        <text fill="var(--dc3-text2)" font-size="9" x="706" y="579">{{ s.legFk }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="850" x2="870" y1="576" y2="576"/>
        <text fill="var(--dc3-text2)" font-size="9" x="876" y="579">{{ s.legRead }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
