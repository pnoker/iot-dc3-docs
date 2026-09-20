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
    aria: 'CLI 命令执行时序：终端首次通过 auth login 完成取盐与换 token，核心层把 JWT 与盐写入权限 0600 的 tokens.json、密码交给凭据存储；此后每次命令调用前 TokenManager 检查 token 剩余有效期，进入续期阈值（默认 1 小时）即先经凭据存储取密码静默重登，再携带 X-Auth-Tenant、X-Auth-Login、X-Auth-Token 三件套调用网关 /api/v3/*，由网关路由到对应中心；若仍收到 401 则续期后自动重试一次；结果按 --format 输出，成功退出 0、任何错误退出 1',
    ph1: '① 配置与登录（首次）', ph2: '② 调用前 token 检查与静默续期',
    ph3: '③ 携带鉴权头调用网关', ph4: '④ 401 兜底 · 输出与退出码',
    t: '终端', tSub: 'shell / 脚本 / AI Agent',
    c: 'dc3 命令模块', cSub: 'device / point / command…',
    k: '核心层', kSub: 'TokenManager · HttpApiClient',
    r: 'CredentialStore', rSub: '四级解析链',
    g: 'dc3-gateway', gSub: ':8000 · /api/v3/*',
    v: '中心服务', vSub: 'auth / manager / data / agentic',
    m1: 'dc3 auth login (首次)', m2: '登录编排',
    m3: 'POST salt → POST generate', m4: 'JWT (12h)',
    n1: '写 tokens.json (0600) · 密码入凭据存储',
    m5: 'dc3 point read 456789 --format json',
    n2: '解析 --profile · --format',
    m6: '调用前检查 exp',
    n3a: '剩余有效期 < renewal_threshold_hours', n3b: '(profile 配置 · 默认 1 小时) ?',
    m7: '取密码 (keychain → encrypted → env → prompt)',
    m8: '密码', m9: '静默重登 salt → generate',
    m10: 'POST /api/v3/data/point_value/latest',
    hdr: 'X-Auth-Tenant · X-Auth-Login · X-Auth-Token',
    m11: '路由到数据中心', m12: 'R<T>', m13: 'R<T>',
    m14: '401 (时钟漂移 / 服务重启)',
    n4a: '续期 (重走 salt → generate)', n4b: '自动重试一次原请求',
    m16: '结果 (json / table / yaml)', m17: 'stdout · exit 0',
    errNote: '任何错误: stderr · process.exit(1)',
    note: '每个命令都支持 --format json：Agent 先看退出码 (0/1) 判定成败，再读 stderr 的错误信息决定是否重新登录或重试',
    legTerm: '终端 / 命令模块', legCore: '核心层 / 网关 / 中心', legSec: '凭据 / 错误路径',
    legCall: '调用 / 消息', legDash: '返回 / 兜底'
  },
  en: {
    aria: 'CLI command execution sequence: on first use the terminal runs auth login to fetch a salt and exchange a JWT which the core layer stores in the 0600-permission tokens.json while the password goes to the credential store; before every later call TokenManager checks the remaining token validity and, inside the renewal window (default 1 hour), silently re-logs-in by resolving the password through the store; the request then carries the X-Auth-Tenant, X-Auth-Login and X-Auth-Token headers to the gateway /api/v3/* which routes to the target center; a residual 401 triggers renewal plus one automatic retry; output follows --format with exit code 0 on success and 1 on any error',
    ph1: '① Config & login (first use)', ph2: '② Pre-call token check & silent renewal',
    ph3: '③ Call gateway with auth headers', ph4: '④ 401 fallback · output & exit code',
    t: 'Terminal', tSub: 'shell / scripts / AI agents',
    c: 'dc3 command module', cSub: 'device / point / command…',
    k: 'Core layer', kSub: 'TokenManager · HttpApiClient',
    r: 'CredentialStore', rSub: 'four-level chain',
    g: 'dc3-gateway', gSub: ':8000 · /api/v3/*',
    v: 'Center service', vSub: 'auth / manager / data / agentic',
    m1: 'dc3 auth login (first use)', m2: 'orchestrate login',
    m3: 'POST salt → POST generate', m4: 'JWT (12h)',
    n1: 'write tokens.json (0600) · password to store',
    m5: 'dc3 point read 456789 --format json',
    n2: 'resolve --profile · --format',
    m6: 'check exp before call',
    n3a: 'remaining validity < renewal_threshold_hours', n3b: '(per profile · default 1 hour) ?',
    m7: 'resolve password (keychain → encrypted → env → prompt)',
    m8: 'password', m9: 'silent re-login salt → generate',
    m10: 'POST /api/v3/data/point_value/latest',
    hdr: 'X-Auth-Tenant · X-Auth-Login · X-Auth-Token',
    m11: 'route to data center', m12: 'R<T>', m13: 'R<T>',
    m14: '401 (clock skew / service restart)',
    n4a: 'renew (salt → generate again)', n4b: 'retry the request once',
    m16: 'result (json / table / yaml)', m17: 'stdout · exit 0',
    errNote: 'any error: stderr · process.exit(1)',
    note: 'Every command supports --format json: an agent reads the exit code (0/1) first, then stderr to decide whether to re-login or retry',
    legTerm: 'Terminal / command modules', legCore: 'Core / gateway / centers', legSec: 'Credentials / error path',
    legCall: 'Call / message', legDash: 'Return / fallback'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {t: 140, c: 370, k: 610, r: 830, g: 1040, v: 1230}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 750">
        <defs>
          <marker id="ccs-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="ccs-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="ccs-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ccs-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-be)" height="110" width="1272" x="24" y="100"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="116">{{ s.ph1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="190" width="1272" x="24" y="210"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="226">{{ s.ph2 }}</text>
        <rect fill="var(--dc3-region-be)" height="130" width="1272" x="24" y="400"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="416">{{ s.ph3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="120" width="1272" x="24" y="530"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="546">{{ s.ph4 }}</text>

        <!-- lifelines -->
        <line v-for="key in ['t','c','k','r','g','v']" :key="'ccs' + key" :x1="PX[key]" :x2="PX[key]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="88" y2="650"/>

        <!-- activation bars -->
        <rect v-for="b in [{y:120,h:16},{y:234,h:16},{y:624,h:16}]" :key="'bt' + b.y" fill="var(--dc3-fe-fill)"
              height="b.h" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10" x="135" :y="b.y"/>
        <rect v-for="b in [{y:120,h:94},{y:234,h:42},{y:598,h:40}]" :key="'bc' + b.y" fill="var(--dc3-fe-fill)"
              height="b.h" stroke="var(--dc3-fe-stroke)" stroke-width="0.8" width="10" x="365" :y="b.y"/>
        <rect v-for="b in [{y:146,h:68},{y:258,h:146},{y:420,h:112},{y:542,h:76}]" :key="'bk' + b.y"
              fill="var(--dc3-be-fill)" height="b.h" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="605" :y="b.y"/>
        <rect fill="var(--dc3-rose-fill)" height="42" stroke="var(--dc3-rose-stroke)" stroke-width="0.8" width="10"
              x="825" y="336"/>
        <rect v-for="b in [{y:170,h:44},{y:384,h:20},{y:418,h:116},{y:542,h:18}]" :key="'bg' + b.y"
              fill="var(--dc3-be-fill)" height="b.h" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1035" :y="b.y"/>
        <rect fill="var(--dc3-be-fill)" height="44" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1225" y="462"/>

        <!-- self notes -->
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="230" x="622" y="216"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="630" y="234">{{ s.n1 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="28" rx="4" stroke="var(--dc3-fe-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="190" x="382" y="284"/>
        <text fill="var(--dc3-fe-text)" font-size="7.5" x="390" y="302">{{ s.n2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="44" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="230" x="622" y="282"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="630" y="298">{{ s.n3a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="630" y="314">{{ s.n3b }}</text>
        <rect fill="var(--dc3-be-fill)" height="44" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="220" x="622" y="554"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="630" y="570">{{ s.n4a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="630" y="586">{{ s.n4b }}</text>

        <!-- messages -->
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="150" x2="360" y1="126"
              y2="126"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="255" y="118">{{ s.m1 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="378" x2="600" y1="152"
              y2="152"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="490" y="144">{{ s.m2 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="618" x2="1030" y1="178"
              y2="178"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="825" y="170">{{ s.m3 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1030"
              x2="618" y1="202" y2="202"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="825" y="194">{{ s.m4 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="150" x2="360" y1="240"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="255" y="232">{{ s.m5 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="378" x2="600" y1="266"
              y2="266"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="490" y="258">{{ s.m6 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="618" x2="820" y1="344"
              y2="344"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="720" y="336">{{ s.m7 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="820"
              x2="618" y1="370" y2="370"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="720" y="362">{{ s.m8 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="618" x2="1030" y1="392"
              y2="392"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="825" y="384">{{ s.m9 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="618" x2="1030" y1="428"
              y2="428"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="825" y="420">{{ s.m10 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="825" y="442">{{ s.hdr }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="1048" x2="1220" y1="470"
              y2="470"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1135" y="462">{{ s.m11 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1220"
              x2="1048" y1="498" y2="498"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="1135" y="490">{{ s.m12 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1030"
              x2="618" y1="522" y2="522"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="825" y="514">{{ s.m13 }}</text>
        <line marker-end="url(#ccs-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1"
              x1="1030" x2="618" y1="550" y2="550"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="825" y="542">{{ s.m14 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="605"
              x2="377" y1="606" y2="606"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="490" y="598">{{ s.m16 }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="360" x2="150" y1="630"
              y2="630"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="255" y="622">{{ s.m17 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" x="420" y="622">{{ s.errNote }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="55" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="140" y="50">
          {{ s.t }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="140" y="66">{{ s.tSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="190"
              x="275" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="370" y="50">
          {{ s.c }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="370" y="66">{{ s.cSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="510" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="610" y="50">
          {{ s.k }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="610" y="66">{{ s.kSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="180" x="740" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="830" y="50">
          {{ s.r }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="830" y="66">{{ s.rSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="950" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1040" y="50">
          {{ s.g }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1040" y="66">{{ s.gSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="1140" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1230" y="50">
          {{ s.v }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1230" y="66">{{ s.vSub }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1272" x="24" y="664"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="40" y="686">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="716"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="725">{{ s.legTerm }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="250" y="716"/>
        <text fill="var(--dc3-text2)" font-size="9" x="272" y="725">{{ s.legCore }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="480" y="716"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="725">{{ s.legSec }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="680" x2="708" y1="722"
              y2="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="714" y="725">{{ s.legCall }}</text>
        <line marker-end="url(#ccs-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="850"
              x2="878" y1="722" y2="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="884" y="725">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
