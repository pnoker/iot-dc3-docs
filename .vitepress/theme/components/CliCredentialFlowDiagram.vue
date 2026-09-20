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
    aria: 'CLI 三段式登录与四级凭据解析：dc3 auth login 先经 token/salt 用租户与用户名换取盐，再把明文密码连同盐提交 token/generate 换回 JWT，解析 iat 与 exp 后连同 salt 写入权限 0600 的 tokens.json，密码本身不入该文件而交凭据存储保管；续期或 401 重登需要密码时按固定优先级解析——先问 OS 钥匙串，再问 AES-256-GCM 加密文件，再读 DC3_PASSWORD 环境变量，最后回落交互式 prompt',
    regA: '登录 · 三段式 token 链路',
    regB: '续期 / 401 重登 · 密码四级解析链（可用且命中即采用）',
    l1: 'dc3 auth login', l1s: '--tenant · --username',
    l2: 'POST token/salt', l2s: '租户 + 用户名 → salt',
    l3: 'POST token/generate', l3s: '明文密码 + salt → JWT',
    l4: '~/.dc3/tokens.json', l4s: '权限 0600 · token/salt/iat/exp',
    l5: '后续 API 调用', l5s: 'X-Auth-Tenant · Login · Token',
    s1: '① 取盐', s2: '② 换 token', s3: '③ 保存', lblCarry: '携带',
    pw1: '密码不入 tokens.json', pw2: '交凭据存储后端保管',
    entryLbl: 'token 临期或 401 —— 需重新走 salt → generate，取回密码',
    k1: 'OS 钥匙串', k1s: 'Keychain / Secret Service / CredMan',
    k2: 'encrypted 加密文件', k2s: '~/.dc3/credentials.enc · AES-256-GCM + scrypt',
    k3: '环境变量', k3s: 'DC3_PASSWORD (CI/CD)',
    q: '可用?',
    yes: '是', noNext: '否 · 下一级', noLast: '否 · 兜底',
    prompt: '交互 prompt', promptS: '不落盘 · 无法静默续期',
    note1a: 'dc3 config set auth.store <type> 选择当前 profile 的后端',
    note1b: '--no-save / --store prompt 时 token 过期后必须手动 dc3 auth login',
    note2a: 'keychain 日常默认 · encrypted 钥匙串不可用时回落',
    note2b: 'env 供 CI/脚本 · prompt 最安全但不可自动续期',
    legCli: '登录命令与调用', legHttp: 'HTTP 端点 / 钥匙串', legFile: 'token / 加密文件',
    legChain: '解析链 / 环境变量', legFall: '兜底与风险', legDec: '判定'
  },
  en: {
    aria: 'CLI three-stage login and four-level credential resolution: dc3 auth login exchanges tenant plus username for a salt via token/salt, submits the plaintext password with the salt to token/generate for a JWT, decodes iat and exp and writes token, salt and timestamps into the 0600-permission tokens.json while the password itself goes to a credential store; when renewal or a 401 re-login needs the password, resolution follows a fixed priority — OS keychain first, then the AES-256-GCM encrypted file, then the DC3_PASSWORD environment variable, and finally an interactive prompt fallback',
    regA: 'Login · three-stage token chain',
    regB: 'Renewal / 401 re-login · four-level password resolution (first hit wins)',
    l1: 'dc3 auth login', l1s: '--tenant · --username',
    l2: 'POST token/salt', l2s: 'tenant + username → salt',
    l3: 'POST token/generate', l3s: 'plaintext password + salt → JWT',
    l4: '~/.dc3/tokens.json', l4s: '0600 perms · token/salt/iat/exp',
    l5: 'subsequent API calls', l5s: 'X-Auth-Tenant · Login · Token',
    s1: '① salt', s2: '② token', s3: '③ persist', lblCarry: 'carries',
    pw1: 'password never enters tokens.json', pw2: 'kept by the credential store',
    entryLbl: 'token near expiry or a 401 — salt → generate again, needs the password',
    k1: 'OS keychain', k1s: 'Keychain / Secret Service / CredMan',
    k2: 'encrypted file', k2s: '~/.dc3/credentials.enc · AES-256-GCM + scrypt',
    k3: 'environment', k3s: 'DC3_PASSWORD (CI/CD)',
    q: 'available?',
    yes: 'yes', noNext: 'no · next level', noLast: 'no · fallback',
    prompt: 'interactive prompt', promptS: 'never persisted · no silent renewal',
    note1a: 'dc3 config set auth.store <type> picks the backend for the profile',
    note1b: 'with --no-save / --store prompt you must re-run dc3 auth login after expiry',
    note2a: 'keychain is the daily default · encrypted is the fallback',
    note2b: 'env serves CI/scripts · prompt is safest but cannot auto-renew',
    legCli: 'Login command & calls', legHttp: 'HTTP endpoint / keychain', legFile: 'token / encrypted file',
    legChain: 'Chain / env var', legFall: 'Fallback & risk', legDec: 'Decision'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 680">
        <defs>
          <marker id="ccf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="ccf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ccf-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1220" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regA }}</text>
        <rect fill="var(--dc3-region-amber)" height="290" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="1220" x="40" y="310"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="52" y="328">{{ s.regB }}</text>

        <!-- login chain arrows -->
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="238" x2="288" y1="138"
              y2="138"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="263" y="130">{{ s.s1 }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="476" x2="526" y1="138"
              y2="138"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="501" y="130">{{ s.s2 }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="734" x2="784" y1="138"
              y2="138"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="759" y="130">{{ s.s3 }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="992" x2="1042" y1="138"
              y2="138"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1017" y="130">{{ s.lblCarry }}
        </text>

        <!-- entry path into the resolution chain (routed around the keychain box) -->
        <path d="M 888,168 L 888,290 L 150,290 L 150,440 L 208,440" fill="none" marker-end="url(#ccf-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="519" y="282">{{ s.entryLbl }}
        </text>

        <!-- resolution chain arrows -->
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="260" x2="260" y1="404"
              y2="388"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="268" y="400">{{ s.yes }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="308" x2="510" y1="440"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="409" y="432">{{ s.noNext }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="560" x2="560" y1="404"
              y2="388"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="568" y="400">{{ s.yes }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="608" x2="810" y1="440"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="709" y="432">{{ s.noNext }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="860" x2="860" y1="404"
              y2="388"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="868" y="400">{{ s.yes }}</text>
        <line marker-end="url(#ccf-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="908" x2="994" y1="440"
              y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="950" y="432">{{ s.noLast }}</text>

        <!-- login nodes -->
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="64" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="149" y="134">
          {{ s.l1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="149" y="152">{{ s.l1s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="292" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="382" y="134">
          {{ s.l2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="382" y="152">{{ s.l2s }}</text>
        <rect fill="var(--dc3-be-fill)" height="56" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="530" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="630" y="134">
          {{ s.l3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="630" y="152">{{ s.l3s }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="200"
              x="788" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="888" y="134">
          {{ s.l4 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="888" y="152">{{ s.l4s }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="180"
              x="1046" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1136" y="134">
          {{ s.l5 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1136" y="152">{{ s.l5s }}</text>
        <rect fill="var(--dc3-rose-fill)" height="40" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="200" x="530" y="184"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="630" y="200">{{ s.pw1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="630" y="216">{{ s.pw2 }}</text>

        <!-- resolution hit boxes -->
        <rect fill="var(--dc3-be-fill)" height="44" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="170" y="340"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="260" y="360">
          {{ s.k1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="260" y="376">{{ s.k1s }}</text>
        <rect fill="var(--dc3-db-fill)" height="44" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="180"
              x="470" y="340"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="560" y="360">
          {{ s.k2 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7" text-anchor="middle" x="560" y="376">{{ s.k2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="770" y="340"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="860" y="360">
          {{ s.k3 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7" text-anchor="middle" x="860" y="376">{{ s.k3s }}</text>

        <!-- diamonds -->
        <polygon fill="var(--dc3-ext-fill)" points="260,406 306,440 260,474 214,440" stroke="var(--dc3-ext-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="260" y="444">
          {{ s.q }}
        </text>
        <polygon fill="var(--dc3-ext-fill)" points="560,406 606,440 560,474 514,440" stroke="var(--dc3-ext-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="560" y="444">
          {{ s.q }}
        </text>
        <polygon fill="var(--dc3-ext-fill)" points="860,406 906,440 860,474 814,440" stroke="var(--dc3-ext-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="860" y="444">
          {{ s.q }}
        </text>

        <!-- prompt fallback -->
        <rect fill="var(--dc3-rose-fill)" height="52" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="200"
              x="998" y="414"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" text-anchor="middle" x="1098" y="436">
          {{ s.prompt }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1098" y="454">{{ s.promptS }}</text>

        <!-- notes -->
        <rect fill="var(--dc3-ext-fill)" height="44" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="560" x="64" y="522"/>
        <text fill="var(--dc3-text2)" font-size="8" x="76" y="540">{{ s.note1a }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="76" y="556">{{ s.note1b }}</text>
        <rect fill="var(--dc3-region-amber)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="580" x="648" y="522"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="660" y="540">{{ s.note2a }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" x="660" y="556">{{ s.note2b }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="649">{{ s.legCli }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="230" y="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="252" y="649">{{ s.legHttp }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="420" y="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="442" y="649">{{ s.legFile }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="610" y="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="632" y="649">{{ s.legChain }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="790" y="640"/>
        <text fill="var(--dc3-text2)" font-size="9" x="812" y="649">{{ s.legFall }}</text>
        <polygon fill="var(--dc3-ext-fill)" points="970,635 984,643 970,651 956,643" stroke="var(--dc3-ext-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="992" y="649">{{ s.legDec }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
