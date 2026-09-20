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
    aria: 'API 调用时序：客户端先从网关打开聚合 Swagger UI 发现四个中心的文档；登录走两步握手——POST token/salt 用租户与用户名换随机盐，再 POST token/generate 连同盐提交明文密码换取 12 小时有效的 JWT（盐与 DC3_SECURITY_KEY 拼接作为 HMAC-SHA256 签名密钥，密码由 Argon2id 或 BCrypt 校验）；随后携带 X-Auth-Tenant、X-Auth-Login、X-Auth-Token 三个鉴权头调用业务接口，网关校验并以 HMAC 签名注入 X-Auth-Principal 后转发对应中心',
    ph1: '① 发现聚合文档', ph2: '② 取盐 (公开端点)',
    ph3: '③ 换 token (公开端点)', ph4: '④ 带鉴权头调用业务接口',
    cl: '客户端', clSub: 'curl / dc3 CLI / Swagger UI',
    gw: 'dc3-gateway', gwSub: ':8000 · 唯一 HTTP 入口',
    au: 'dc3-center-auth', auSub: ':8300 · 取盐 / 签发 token',
    mg: 'dc3-center-manager', mgSub: ':8400 · 业务接口示例',
    m1: 'GET /swagger-ui.html', n1: 'swagger-ui.urls 服务下拉',
    m2: '聚合 UI (四中心分组)',
    m3: 'POST /api/v3/auth/token/salt {tenant, name}',
    m4: '/auth/token/salt', n2: '生成随机盐 (建议 5 分钟内使用)',
    m5: 'R<String> salt',
    m6: 'POST /api/v3/auth/token/generate {tenant, name, salt, password}',
    m7: '/auth/token/generate (明文密码 · 依赖 HTTPS)',
    n3a: 'Argon2id / BCrypt 校验密码', n3b: 'salt + DC3_SECURITY_KEY → HMAC-SHA256 签名',
    m8: 'JWT (12 小时有效)', m9: 'token',
    m10: 'POST /api/v3/manager/device/list',
    hdrNote: 'X-Auth-Tenant · X-Auth-Login · X-Auth-Token',
    n4a: '校验 token → HMAC 签名', n4b: '注入 X-Auth-Principal',
    m11: '转发 (带租户上下文)', m12: 'R<T> 统一响应', m13: 'R<T> 响应',
    note: '公开端点仅 /api/v3/auth/token/** · 密码以明文提交依赖 HTTPS 保护传输 · 盐不参与密码哈希，仅与 DC3_SECURITY_KEY 拼接作 JWT 签名密钥',
    legClient: '客户端', legSvc: '网关 / 中心服务', legReq: '请求',
    legResp: '响应', legAuth: '鉴权三件套'
  },
  en: {
    aria: 'API call sequence: the client first opens the aggregated Swagger UI on the gateway to discover the four centers docs; login is a two-step handshake — POST token/salt exchanges tenant plus username for a random salt, then POST token/generate submits the plaintext password with the salt for a 12-hour JWT (the salt concatenated with DC3_SECURITY_KEY forms the HMAC-SHA256 signing key, and the password is verified with Argon2id or BCrypt); subsequent business calls carry the X-Auth-Tenant, X-Auth-Login and X-Auth-Token headers, the gateway validates them, injects the HMAC-signed X-Auth-Principal and forwards to the target center',
    ph1: '① Discover aggregated docs', ph2: '② Fetch salt (public)',
    ph3: '③ Exchange token (public)', ph4: '④ Call business API with auth headers',
    cl: 'Client', clSub: 'curl / dc3 CLI / Swagger UI',
    gw: 'dc3-gateway', gwSub: ':8000 · the only HTTP entry',
    au: 'dc3-center-auth', auSub: ':8300 · salt / token issuing',
    mg: 'dc3-center-manager', mgSub: ':8400 · business API sample',
    m1: 'GET /swagger-ui.html', n1: 'swagger-ui.urls service dropdown',
    m2: 'aggregated UI (four groups)',
    m3: 'POST /api/v3/auth/token/salt {tenant, name}',
    m4: '/auth/token/salt', n2: 'random salt (use within ~5 min)',
    m5: 'R<String> salt',
    m6: 'POST /api/v3/auth/token/generate {tenant, name, salt, password}',
    m7: '/auth/token/generate (plaintext password · over HTTPS)',
    n3a: 'verify password: Argon2id / BCrypt', n3b: 'salt + DC3_SECURITY_KEY → HMAC-SHA256 signing',
    m8: 'JWT (valid 12h)', m9: 'token',
    m10: 'POST /api/v3/manager/device/list',
    hdrNote: 'X-Auth-Tenant · X-Auth-Login · X-Auth-Token',
    n4a: 'validate token → HMAC sign', n4b: 'inject X-Auth-Principal',
    m11: 'forward (with tenant context)', m12: 'R<T> unified response', m13: 'R<T> response',
    note: 'Only /api/v3/auth/token/** is public · the password travels in plaintext relying on HTTPS · the salt never hashes the password, it only keys the JWT HMAC with DC3_SECURITY_KEY',
    legClient: 'Client', legSvc: 'Gateway / center services', legReq: 'Request',
    legResp: 'Response', legAuth: 'Auth header trio'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {cl: 230, gw: 590, au: 900, mg: 1150}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 740">
        <defs>
          <marker id="ads-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="ads-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ads-grid)" height="100%" width="100%"/>

        <!-- phase bands -->
        <rect fill="var(--dc3-region-be)" height="100" width="1252" x="24" y="100"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="116">{{ s.ph1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="120" width="1252" x="24" y="200"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="216">{{ s.ph2 }}</text>
        <rect fill="var(--dc3-region-be)" height="160" width="1252" x="24" y="320"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="40" y="336">{{ s.ph3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="170" width="1252" x="24" y="480"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" x="40" y="496">{{ s.ph4 }}</text>

        <!-- lifelines -->
        <line v-for="key in ['cl','gw','au','mg']" :key="'ads' + key" :x1="PX[key]" :x2="PX[key]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="88" y2="652"/>

        <!-- activation bars -->
        <rect v-for="b in [{x:225,y:124,h:66},{x:225,y:216,h:90},{x:225,y:334,h:134},{x:225,y:496,h:152}]"
              :key="'acl' + b.y" fill="var(--dc3-fe-fill)" height="b.h" stroke="var(--dc3-fe-stroke)"
              stroke-width="0.8" width="10" :x="b.x" :y="b.y"/>
        <rect v-for="b in [{x:585,y:124,h:66},{x:585,y:216,h:90},{x:585,y:334,h:134},{x:585,y:496,h:152}]"
              :key="'agw' + b.y" fill="var(--dc3-be-fill)" height="b.h" stroke="var(--dc3-be-stroke)"
              stroke-width="0.8" width="10" :x="b.x" :y="b.y"/>
        <rect fill="var(--dc3-be-fill)" height="58" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10" x="895"
              y="244"/>
        <rect fill="var(--dc3-be-fill)" height="82" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10" x="895"
              y="362"/>
        <rect fill="var(--dc3-be-fill)" height="52" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="1145" y="574"/>

        <!-- self notes -->
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="200" x="612" y="140"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="620" y="158">{{ s.n1 }}</text>
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="220" x="912" y="258"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="920" y="276">{{ s.n2 }}</text>
        <rect fill="var(--dc3-be-fill)" height="40" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="240" x="912" y="378"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="920" y="394">{{ s.n3a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="920" y="410">{{ s.n3b }}</text>
        <rect fill="var(--dc3-be-fill)" height="40" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="210" x="612" y="524"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="620" y="540">{{ s.n4a }}</text>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="620" y="556">{{ s.n4b }}</text>
        <rect fill="var(--dc3-be-fill)" height="28" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="180" x="960" y="588"/>
        <text fill="var(--dc3-be-text)" font-size="7.5" x="968" y="606">{{ s.m12 }}</text>

        <!-- messages -->
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="240" x2="578" y1="130"
              y2="130"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="122">{{ s.m1 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="578"
              x2="240" y1="182" y2="182"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="174">{{ s.m2 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="240" x2="578" y1="222"
              y2="222"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="410" y="214">{{ s.m3 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="598" x2="888" y1="250"
              y2="250"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="745" y="242">{{ s.m4 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="888"
              x2="598" y1="298" y2="298"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="745" y="290">{{ s.m5 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="240" x2="578" y1="340"
              y2="340"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="410" y="332">{{ s.m6 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="598" x2="888" y1="368"
              y2="368"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="745" y="360">{{ s.m7 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="888"
              x2="598" y1="440" y2="440"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="745" y="432">{{ s.m8 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="578"
              x2="240" y1="462" y2="462"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="454">{{ s.m9 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="240" x2="578" y1="502"
              y2="502"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="410" y="494">{{ s.m10 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="410" y="514">{{ s.hdrNote }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="598" x2="1138" y1="580"
              y2="580"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="870" y="572">{{ s.m11 }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="1138"
              x2="598" y1="622" y2="622"/>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="578"
              x2="240" y1="644" y2="644"/>
        <text fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" x="410" y="636">{{ s.m13 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-fe-fill)" height="52" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="280"
              x="90" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="230" y="52">
          {{ s.cl }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="230" y="70">{{ s.clSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="480" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="590" y="52">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="590" y="70">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="790" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="900" y="52">
          {{ s.au }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="900" y="70">{{ s.auSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="220"
              x="1040" y="30"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1150" y="52">
          {{ s.mg }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1150" y="70">{{ s.mgSub }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1252" x="24" y="664"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="40" y="686">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="60" y="716"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="725">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="160" y="716"/>
        <text fill="var(--dc3-text2)" font-size="9" x="182" y="725">{{ s.legSvc }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="340" x2="368" y1="722"
              y2="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="374" y="725">{{ s.legReq }}</text>
        <line marker-end="url(#ads-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="450"
              x2="478" y1="722" y2="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="484" y="725">{{ s.legResp }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="580" y="725">{{ s.hdrNote }} → {{ s.legAuth }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
