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
    aria: 'dc3-cli 模块结构：dc3 入口把命令行解析到 14 个命令模块——入口与配置（config、auth）、面向管理中心的六个元数据模块（device、driver、point、profile、group、label）、面向数据与运行态的五个模块（event、command、alert、dashboard、topic）以及对接 Agentic 中心的 chat；所有模块共用同一组核心组件：HttpApiClient 统一经网关 /api/v3/* 通信、ProfileConfig 管理多配置档、TokenManager 负责续期与 401 重试、CredentialStore 四级凭据存储',
    entry: 'dc3', entrySub: 'TypeScript CLI · Node ≥ 20 · pnpm link',
    fanout: '入口解析为 14 个命令模块',
    regEntry: '入口与配置',
    regMeta: '元数据 · 管理中心',
    regRun: '运行态 · 数据中心',
    regAi: 'AI · Agentic',
    mConfig: 'dc3 config', mConfigS: 'gateway · 租户 · store · profile',
    mAuth: 'dc3 auth', mAuthS: 'login / logout / status / token',
    mDevice: 'dc3 device', mDeviceS: 'CRUD · 计数 · 在线态',
    mDriver: 'dc3 driver', mDriverS: '列表 · 详情 · 运行态',
    mPoint: 'dc3 point', mPointS: 'CRUD · 读值 · 历史 · 写值',
    mProfile: 'dc3 profile', mProfileS: '模板 CRUD',
    mGroup: 'dc3 group', mGroupS: '设备分组',
    mLabel: 'dc3 label', mLabelS: '标签管理',
    mEvent: 'dc3 event', mEventS: '事件定义 · 事件历史',
    mCommand: 'dc3 command', mCommandS: '命令列表 · 调用 · 回执',
    mAlert: 'dc3 alert', mAlertS: '概览 · 确认 · 趋势 · Top',
    mDash: 'dc3 dashboard', mDashS: '统计 · 拓扑 · 健康 · 实时流',
    mTopic: 'dc3 topic', mTopicS: '主题列表',
    mChat: 'dc3 chat', mChatS1: '与 Agentic 对话', mChatS2: '可选流式 · 指定模型',
    regCore: '核心层 · 所有模块共用（模块只描述"做什么"）',
    coreUse: '全部模块 → 共用核心层：网关请求 · profile 解析 · token 续期 · 密码读取',
    cHttp: 'HttpApiClient', cHttpS: '/api/v3/* · X-Auth-* 头 · --format json',
    cConf: 'ProfileConfig', cConfS: '~/.dc3 · 多 profile 互不干扰',
    cToken: 'TokenManager', cTokenS: '续期阈值 1h · 401 兜底重试一次',
    cCred: 'CredentialStore', cCredS: 'keychain / encrypted / env / prompt',
    opt1: '全局选项: --profile · --format json|table|yaml · --verbose · --ci (无色 · json · 严格退出码)',
    opt2: '退出码: 0 成功 · 1 任何错误（顶层捕获后 process.exit(1)，不细分错误类别）',
    legEntry: '入口 / 配置', legCmd: '命令模块 / 核心服务', legSec: '凭据安全',
    legNote: '约定说明', legDep: '共用依赖'
  },
  en: {
    aria: 'dc3-cli module structure: the dc3 entry parses the command line into 14 command modules — entry & config (config, auth), six metadata modules backed by the manager center (device, driver, point, profile, group, label), five runtime modules backed by the data center (event, command, alert, dashboard, topic) and chat which talks to the agentic center; every module shares the same core: HttpApiClient for all /api/v3/* gateway traffic, ProfileConfig for named profiles, TokenManager for renewal and 401 retry, and the four-level CredentialStore',
    entry: 'dc3', entrySub: 'TypeScript CLI · Node ≥ 20 · pnpm link',
    fanout: 'entry parses into 14 command modules',
    regEntry: 'Entry & config',
    regMeta: 'Metadata · manager center',
    regRun: 'Runtime · data center',
    regAi: 'AI · agentic',
    mConfig: 'dc3 config', mConfigS: 'gateway · tenant · store · profile',
    mAuth: 'dc3 auth', mAuthS: 'login / logout / status / token',
    mDevice: 'dc3 device', mDeviceS: 'CRUD · count · status',
    mDriver: 'dc3 driver', mDriverS: 'list · detail · status',
    mPoint: 'dc3 point', mPointS: 'CRUD · read · history · write',
    mProfile: 'dc3 profile', mProfileS: 'profile CRUD',
    mGroup: 'dc3 group', mGroupS: 'device groups',
    mLabel: 'dc3 label', mLabelS: 'label management',
    mEvent: 'dc3 event', mEventS: 'definitions · history',
    mCommand: 'dc3 command', mCommandS: 'list · call · receipt',
    mAlert: 'dc3 alert', mAlertS: 'overview · ack · trends · top',
    mDash: 'dc3 dashboard', mDashS: 'stats · topology · health · stream',
    mTopic: 'dc3 topic', mTopicS: 'topic list',
    mChat: 'dc3 chat', mChatS1: 'chat with agentic center', mChatS2: 'optional stream · model choice',
    regCore: 'Core layer · shared by all modules (modules only say "what")',
    coreUse: 'all modules → shared core: gateway calls · profile resolution · token renewal · password fetch',
    cHttp: 'HttpApiClient', cHttpS: '/api/v3/* · X-Auth-* headers · --format json',
    cConf: 'ProfileConfig', cConfS: '~/.dc3 · isolated profiles',
    cToken: 'TokenManager', cTokenS: '1h renewal window · one 401 retry',
    cCred: 'CredentialStore', cCredS: 'keychain / encrypted / env / prompt',
    opt1: 'Global options: --profile · --format json|table|yaml · --verbose · --ci (no color · json · strict exit codes)',
    opt2: 'Exit codes: 0 success · 1 any error (top-level catch then process.exit(1), no per-class codes)',
    legEntry: 'Entry / config', legCmd: 'Command modules / core', legSec: 'Credential security',
    legNote: 'Conventions', legDep: 'Shared dependency'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1340 720">
        <defs>
          <marker id="clc-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="clc-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#clc-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="240" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="300" x="40" y="150"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="52" y="168">{{ s.regEntry }}</text>
        <rect fill="var(--dc3-region-be)" height="240" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="440" x="360" y="150"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="372" y="168">{{ s.regMeta }}</text>
        <rect fill="var(--dc3-region-be)" height="240" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="280" x="820" y="150"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="832" y="168">{{ s.regRun }}</text>
        <rect fill="var(--dc3-region-be)" height="240" rx="12" stroke="var(--dc3-fe-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="180" x="1120" y="150"/>
        <text fill="var(--dc3-fe-stroke)" font-size="10" font-weight="600" x="1132" y="168">{{ s.regAi }}</text>
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1260" x="40" y="430"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="448">{{ s.regCore }}</text>

        <!-- fan-out arrows -->
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="670" x2="670" y1="108" y2="130"/>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="190" x2="1210" y1="130" y2="130"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="190" x2="190" y1="130"
              y2="146"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="580" x2="580" y1="130"
              y2="146"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="960" x2="960" y1="130"
              y2="146"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1210" x2="1210" y1="130"
              y2="146"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="670" y="122">{{ s.fanout }}</text>

        <!-- module groups to core arrows -->
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="190" x2="190" y1="392"
              y2="426"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="580" x2="580" y1="392"
              y2="426"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="960" x2="960" y1="392"
              y2="426"/>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1210" x2="1210" y1="392"
              y2="426"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="670" y="414">{{ s.coreUse }}
        </text>

        <!-- entry node -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5" width="220"
              x="560" y="56"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="12" text-anchor="middle" x="670" y="78">
          {{ s.entry }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="670" y="96">{{ s.entrySub }}</text>

        <!-- entry & config modules -->
        <rect fill="var(--dc3-fe-fill)" height="50" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="60" y="190"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="190" y="210">
          {{ s.mConfig }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="228">{{ s.mConfigS }}</text>
        <rect fill="var(--dc3-fe-fill)" height="50" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="60" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="190" y="280">
          {{ s.mAuth }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="190" y="298">{{ s.mAuthS }}</text>

        <!-- metadata modules -->
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="380" y="190"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="445" y="208">
          {{ s.mDevice }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="445" y="226">{{ s.mDeviceS }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="525" y="190"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="590" y="208">
          {{ s.mDriver }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="590" y="226">{{ s.mDriverS }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="670" y="190"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="735" y="208">
          {{ s.mPoint }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="735" y="226">{{ s.mPointS }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="380" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="445" y="278">
          {{ s.mProfile }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="445" y="296">{{ s.mProfileS }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="525" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="590" y="278">
          {{ s.mGroup }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="590" y="296">{{ s.mGroupS }}</text>
        <rect fill="var(--dc3-be-fill)" height="50" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="130"
              x="670" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="735" y="278">
          {{ s.mLabel }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="735" y="296">{{ s.mLabelS }}</text>

        <!-- runtime modules -->
        <rect fill="var(--dc3-be-fill)" height="38" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="840" y="172"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="960" y="188">
          {{ s.mEvent }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="960" y="202">{{ s.mEventS }}</text>
        <rect fill="var(--dc3-be-fill)" height="38" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="840" y="216"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="960" y="232">
          {{ s.mCommand }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="960" y="246">{{ s.mCommandS }}</text>
        <rect fill="var(--dc3-be-fill)" height="38" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="840" y="260"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="960" y="276">
          {{ s.mAlert }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="960" y="290">{{ s.mAlertS }}</text>
        <rect fill="var(--dc3-be-fill)" height="38" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="840" y="304"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="960" y="320">
          {{ s.mDash }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="960" y="334">{{ s.mDashS }}</text>
        <rect fill="var(--dc3-be-fill)" height="38" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="840" y="348"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="960" y="364">
          {{ s.mTopic }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="960" y="378">{{ s.mTopicS }}</text>

        <!-- chat module -->
        <rect fill="var(--dc3-fe-fill)" height="100" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="140"
              x="1140" y="220"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="1210" y="246">
          {{ s.mChat }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1210" y="266">{{ s.mChatS1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1210" y="282">{{ s.mChatS2 }}</text>

        <!-- core layer nodes -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="270"
              x="64" y="470"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="199" y="494">
          {{ s.cHttp }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="199" y="514">{{ s.cHttpS }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="366" y="470"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="491" y="494">
          {{ s.cConf }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="491" y="514">{{ s.cConfS }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="270"
              x="648" y="470"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="783" y="494">
          {{ s.cToken }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="783" y="514">{{ s.cTokenS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="300"
              x="944" y="470"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1094" y="494">
          {{ s.cCred }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1094" y="514">{{ s.cCredS }}</text>

        <!-- conventions note -->
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1260" x="40" y="590"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="56" y="608">{{ s.opt1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="56" y="624">{{ s.opt2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="681">{{ s.legEntry }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="210" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="232" y="681">{{ s.legCmd }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="400" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="422" y="681">{{ s.legSec }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="560" y="672"/>
        <text fill="var(--dc3-text2)" font-size="9" x="582" y="681">{{ s.legNote }}</text>
        <line marker-end="url(#clc-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="700" x2="728" y1="678"
              y2="678"/>
        <text fill="var(--dc3-text2)" font-size="9" x="734" y="681">{{ s.legDep }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
