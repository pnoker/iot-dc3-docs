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
    aria: '鉴权全链路：两步握手登录——先取一次性盐、再凭盐与明文密码换取 12 小时 JWT；此后每次请求带三个鉴权头经网关 gRPC 核验并注入 HMAC 签名身份头，后端验签、加载权限并交 @PreAuthorize 判定',
    ph1: '第一步 · 取盐 (公开端点)',
    ph2: '第二步 · 凭据换令牌 (12h JWT)',
    ph3: '第三步 · 每次请求: 网关签名 + 后端验签',
    client: '客户端', clientSub: 'Web · CLI · AI Agent',
    gw: 'dc3-gateway', gwSub: ':8000 · 转发',
    auth1: '鉴权中心 dc3-center-auth', auth1Sub: '租户存在性校验',
    auth2: '鉴权中心', auth2Sub1: 'generateToken(principal, salt, tenant)',
    auth2Sub2: '签发 JWT · 12 小时有效',
    gwF: '网关 AuthenticGatewayFilter',
    gwF1: '· gRPC 核验 (boundedElastic)',
    gwF2: '· X-Auth-Principal (JSON)',
    gwF3: '· X-Auth-Sign (HMAC-SHA256)',
    gwF4: '· 未启用则删除入站假 Sign',
    be: '后端 GatewayJwtConverter',
    be1: '· 验签: 常量时间比对',
    be2: '· 解析 principal (tenant + id)',
    be3: '· 权限加载 · 5 分钟缓存',
    be4: '· @PreAuthorize 判定',
    a1: '① /token/salt', a1b: 'tenant + name',
    a2: '转发',
    a3: '随机盐 UUID · 建议 5 分钟内使用',
    b1: '② /token/generate', b1b: 'tenant+name+salt+password',
    b2: '转发',
    b3: 'JWT (12h) · 绑定 principal_id + tenant_id',
    b5: '顺序校验',
    c1: '③ 三鉴权头', c1b: 'X-Auth-Tenant / Login / Token',
    c2: 'X-Auth-Principal + Sign',
    c3: '200 / 403 (fail-closed) / 404 (跨租户)',
    c4: 'gRPC 核验 token + denylist',
    chkTitle: 'generateToken 六步校验',
    k1: '① 租户 tenantCode 可解析', k2: '② 凭据 dc3_local_credential',
    k3: '③ 成员关系 tenant_membership', k4: '④ 盐非空',
    k5: '⑤ 密码 Argon2id / BCrypt', k6: '⑥ 过期 / 强制改密检查',
    k7: '任一失败 → 统一错误', k8: '不泄露失败环节',
    k9: '签发: KeyUtil.generateToken', k10: '绑定 principal_id + tenant_id',
    k11: '有效期 12 小时 (TOKEN_CACHE_TIMEOUT)',
    secTitle: '密钥 · 缓存 · 失败语义',
    s1: 'HMAC 密钥 AUTH_HMAC_SECRET',
    s2: 'pre/pro 为空或默认值 → 启动失败',
    s3: '开发环境空密钥 → 仅告警',
    s4: '注销: Caffeine denylist',
    s5: '(tenant:principal) 旧令牌失效',
    s6: '权限缓存 5 分钟 (tenant:principal)',
    s7: 'fail-closed: 权限故障 → 403',
    s8: '跨租户 ID 查询 → 404',
    s9: '伪造身份头: 验签不过按匿名',
    legClient: '客户端', legSvc: '网关 / 后端', legAuth: '鉴权中心',
    legAmb: '校验 / 缓存', legReq: '请求流', legResp: '响应 / 返回'
  },
  en: {
    aria: 'Full auth chain: two-step login handshake — fetch a one-time salt, then exchange salt plus clear password for a 12-hour JWT; every subsequent call carries three auth headers, verified by the gateway over gRPC and forwarded as an HMAC-signed identity header, then verified, authorized and checked by @PreAuthorize in the backend',
    ph1: 'Step 1 · fetch salt (public endpoint)',
    ph2: 'Step 2 · credentials → token (12h JWT)',
    ph3: 'Step 3 · every call: gateway signing + backend verification',
    client: 'Client', clientSub: 'Web · CLI · AI Agent',
    gw: 'dc3-gateway', gwSub: ':8000 · forward',
    auth1: 'Auth Center dc3-center-auth', auth1Sub: 'tenant existence check',
    auth2: 'Auth Center', auth2Sub1: 'generateToken(principal, salt, tenant)',
    auth2Sub2: 'issue JWT · valid 12 hours',
    gwF: 'Gateway AuthenticGatewayFilter',
    gwF1: '· gRPC verify (boundedElastic)',
    gwF2: '· X-Auth-Principal (JSON)',
    gwF3: '· X-Auth-Sign (HMAC-SHA256)',
    gwF4: '· strip fake inbound Sign if disabled',
    be: 'Backend GatewayJwtConverter',
    be1: '· verify: constant-time compare',
    be2: '· parse principal (tenant + id)',
    be3: '· permission load · 5 min cache',
    be4: '· @PreAuthorize decision',
    a1: '① /token/salt', a1b: 'tenant + name',
    a2: 'forward',
    a3: 'random salt (UUID) · use within 5 min',
    b1: '② /token/generate', b1b: 'tenant+name+salt+password',
    b2: 'forward',
    b3: 'JWT (12h) · bound to principal_id + tenant_id',
    b5: 'ordered checks',
    c1: '③ three auth headers', c1b: 'X-Auth-Tenant / Login / Token',
    c2: 'X-Auth-Principal + Sign',
    c3: '200 / 403 (fail-closed) / 404 (cross-tenant)',
    c4: 'gRPC verify token + denylist',
    chkTitle: 'generateToken: six checks',
    k1: '① tenant tenantCode resolvable', k2: '② credential dc3_local_credential',
    k3: '③ membership tenant_membership', k4: '④ salt present',
    k5: '⑤ password Argon2id / BCrypt', k6: '⑥ expire / forced change',
    k7: 'any failure → uniform error', k8: 'no step disclosed',
    k9: 'issue: KeyUtil.generateToken', k10: 'binds principal_id + tenant_id',
    k11: 'valid 12 hours (TOKEN_CACHE_TIMEOUT)',
    secTitle: 'Keys · caches · failure semantics',
    s1: 'HMAC secret AUTH_HMAC_SECRET',
    s2: 'pre/pro empty or default → boot fails',
    s3: 'dev empty secret → warning only',
    s4: 'logout: Caffeine denylist',
    s5: '(tenant:principal) old token revoked',
    s6: 'permission cache 5 min (tenant:principal)',
    s7: 'fail-closed: perm failure → 403',
    s8: 'cross-tenant by-id query → 404',
    s9: 'forged identity header → anonymous',
    legClient: 'Client', legSvc: 'Gateway / backend', legAuth: 'Auth center',
    legAmb: 'Checks / cache', legReq: 'Request flow', legResp: 'Response / return'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1380 768">
        <defs>
          <marker id="af-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="af-ah-amber" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-amber-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="af-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#af-grid)" height="100%" width="100%"/>

        <!-- phase regions -->
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1010" x="24" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="82">{{ s.ph1 }}</text>
        <rect fill="var(--dc3-region-be)" height="190" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1010" x="24" y="214"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="232">{{ s.ph2 }}</text>
        <rect fill="var(--dc3-region-be)" height="200" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1010" x="24" y="428"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="36" y="446">{{ s.ph3 }}</text>
        <rect fill="var(--dc3-region-amber)" height="350" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="300" x="1060" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="1072" y="84">{{ s.chkTitle }}</text>
        <rect fill="var(--dc3-region-amber)" height="280" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="300" x="1060" y="440"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="1072" y="460">{{ s.secTitle }}</text>

        <!-- arrows -->
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="196" x2="298" y1="126" y2="126"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="116">{{ s.a1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="144">{{ s.a1b }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="462" x2="618" y1="126" y2="126"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="540" y="116">{{ s.a2 }}</text>
        <path d="M720,172 L720,190 L119,190 L119,174" fill="none" marker-end="url(#af-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="410" y="184">{{ s.a3 }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="196" x2="298" y1="276" y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="266">{{ s.b1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="294">{{ s.b1b }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="462" x2="618" y1="276" y2="276"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="540" y="266">{{ s.b2 }}</text>
        <path d="M720,350 L720,378 L119,378 L119,324" fill="none" marker-end="url(#af-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="410" y="372">{{ s.b3 }}</text>
        <line marker-end="url(#af-ah-amber)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="822" x2="1056" y1="290" y2="290"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="938" y="282">{{ s.b5 }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="196" x2="298" y1="500" y2="500"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="490">{{ s.c1 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="247" y="518">{{ s.c1b }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="542" x2="658" y1="500" y2="500"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="600" y="490">{{ s.c2 }}</text>
        <path d="M780,562 L780,600 L119,600 L119,538" fill="none" marker-end="url(#af-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="440" y="594">{{ s.c3 }}</text>
        <path d="M420,452 L420,414 L780,414 L780,354" fill="none" marker-end="url(#af-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="600" y="408">{{ s.c4 }}</text>

        <!-- phase 1 nodes -->
        <rect fill="var(--dc3-fe-fill)" height="72" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="44" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="119" y="126">
          {{ s.client }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="119" y="146">{{ s.clientSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="72" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="300" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="380" y="126">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="380" y="146">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="72" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="200" x="620" y="100"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="720" y="126">
          {{ s.auth1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="720" y="146">{{ s.auth1Sub }}</text>

        <!-- phase 2 nodes -->
        <rect fill="var(--dc3-fe-fill)" height="72" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="44" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="119" y="276">
          {{ s.client }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="119" y="296">{{ s.clientSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="72" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="160"
              x="300" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="380" y="276">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="380" y="296">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="120" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="200" x="620" y="230"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="720" y="254">
          {{ s.auth2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="720" y="276">{{ s.auth2Sub1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="720" y="294">{{ s.auth2Sub2 }}</text>

        <!-- phase 3 nodes -->
        <rect fill="var(--dc3-fe-fill)" height="72" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="150"
              x="44" y="464"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="119" y="490">
          {{ s.client }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="119" y="510">{{ s.clientSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="300" y="452"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="420" y="474">
          {{ s.gwF }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="312" y="496">{{ s.gwF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="312" y="514">{{ s.gwF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="312" y="532">{{ s.gwF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="312" y="550">{{ s.gwF4 }}</text>
        <rect fill="var(--dc3-be-fill)" height="110" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="240"
              x="660" y="452"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="780" y="474">
          {{ s.be }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="672" y="496">{{ s.be1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="672" y="514">{{ s.be2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="672" y="532">{{ s.be3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="672" y="550">{{ s.be4 }}</text>

        <!-- check-chain panel -->
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="110">{{ s.k1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="130">{{ s.k2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="150">{{ s.k3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="170">{{ s.k4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="190">{{ s.k5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="210">{{ s.k6 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1076" y="238">{{ s.k7 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1076" y="256">{{ s.k8 }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="3,3" stroke-width="0.6" x1="1072" x2="1348" y1="276"
              y2="276"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="300">{{ s.k9 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="318">{{ s.k10 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="340">{{ s.k11 }}</text>

        <!-- security panel -->
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="486">{{ s.s1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="504">{{ s.s2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="522">{{ s.s3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="546">{{ s.s4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="564">{{ s.s5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1076" y="588">{{ s.s6 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1076" y="612">{{ s.s7 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1076" y="630">{{ s.s8 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" x="1076" y="648">{{ s.s9 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="24" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="46" y="753">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="130" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="152" y="753">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="270" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="292" y="753">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="390" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="753">{{ s.legAmb }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="510" x2="538" y1="750"
              y2="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="544" y="753">{{ s.legReq }}</text>
        <line marker-end="url(#af-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="630"
              x2="658" y1="750" y2="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="664" y="753">{{ s.legResp }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
