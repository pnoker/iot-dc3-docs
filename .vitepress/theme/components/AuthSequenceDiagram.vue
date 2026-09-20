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
    aria: '鉴权时序图：一次受保护请求带三个鉴权头到网关，网关在 boundedElastic 线程池里 gRPC 核验令牌与注销名单，拿回身份后以 HMAC 签名透传，后端常量时间验签、按租户与身份加载权限集（5 分钟缓存）并交 @PreAuthorize 判定',
    client: '客户端', clientSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: 'AuthenticGatewayFilter',
    auth: 'dc3-center-auth', authSub: ':9300 · gRPC 校验',
    be: '后端服务', beSub: 'manager / data / agentic',
    pc: '权限缓存', pcSub: 'AuthPermissionProvider',
    m1: '① GET /api/... + 3 鉴权头',
    n1: 'boundedElastic 阻塞式解析',
    m2: '② gRPC 校验 token (阻塞)',
    n2: 'token + denylist (注销名单)',
    m3: 'PrincipalHeader 返回',
    n3: '签名: X-Auth-Sign (HMAC-SHA256) · 未启用删假 Sign',
    m4: '③ 转发 + X-Auth-Principal + Sign',
    n4: '验签: 常量时间比对',
    m5: '④ 加载权限集 (tenant:principal)',
    m6: '资源码集合 · 5min TTL',
    n5: '@PreAuthorize 判定',
    m7: '⑤ 业务响应 R',
    m8: '200 / 401 / 403',
    fcTitle: 'fail-closed 失败语义',
    fc1: '权限加载故障 → 空权限 → 403 (不放行)',
    fc2: '跨租户 ID 查询 → 404 (非 403)',
    legClient: '客户端', legSvc: '网关 / 后端', legAuth: '鉴权中心',
    legCache: '权限缓存', legReq: '请求', legResp: '响应 / 返回'
  },
  en: {
    aria: 'Auth sequence: one protected call carries three auth headers to the gateway, which verifies token and denylist over gRPC on boundedElastic, signs the resolved identity with HMAC and forwards it; the backend verifies with constant-time compare, loads the permission set by tenant and principal (5-minute cache) and hands over to @PreAuthorize',
    client: 'Client', clientSub: 'Web · CLI · AI',
    gw: 'dc3-gateway', gwSub: 'AuthenticGatewayFilter',
    auth: 'dc3-center-auth', authSub: ':9300 · gRPC verify',
    be: 'Backend service', beSub: 'manager / data / agentic',
    pc: 'Permission cache', pcSub: 'AuthPermissionProvider',
    m1: '① GET /api/... + 3 auth headers',
    n1: 'blocking parse on boundedElastic',
    m2: '② gRPC verify token (blocking)',
    n2: 'token + denylist (revoked)',
    m3: 'PrincipalHeader returned',
    n3: 'sign: X-Auth-Sign (HMAC-SHA256) · strip fake Sign if off',
    m4: '③ forward + X-Auth-Principal + Sign',
    n4: 'verify: constant-time compare',
    m5: '④ load permissions (tenant:principal)',
    m6: 'resource codes · 5min TTL',
    n5: '@PreAuthorize decision',
    m7: '⑤ business response R',
    m8: '200 / 401 / 403',
    fcTitle: 'fail-closed semantics',
    fc1: 'permission load failure → empty → 403 (never open)',
    fc2: 'cross-tenant by-id query → 404 (not 403)',
    legClient: 'Client', legSvc: 'Gateway / backend', legAuth: 'Auth center',
    legCache: 'Perm cache', legReq: 'Request', legResp: 'Response / return'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
const PX = {client: 110, gw: 330, auth: 570, be: 800, pc: 1000}
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1080 700">
        <defs>
          <marker id="aseq-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="aseq-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aseq-grid)" height="100%" width="100%"/>

        <!-- lifelines -->
        <line v-for="k in ['client','gw','auth','be','pc']" :key="'ll' + k" :x1="PX[k]" :x2="PX[k]"
              stroke="var(--dc3-divider)" stroke-dasharray="4,4" stroke-width="1" y1="78" y2="640"/>

        <!-- activation bars -->
        <rect fill="var(--dc3-be-fill)" height="478" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="325" y="108"/>
        <rect fill="var(--dc3-rose-fill)" height="94" stroke="var(--dc3-rose-stroke)" stroke-width="0.8" width="10"
              x="565" y="197"/>
        <rect fill="var(--dc3-be-fill)" height="200" stroke="var(--dc3-be-stroke)" stroke-width="0.8" width="10"
              x="795" y="347"/>
        <rect fill="var(--dc3-amber-fill)" height="52" stroke="var(--dc3-amber-stroke)" stroke-width="0.8" width="10"
              x="995" y="422"/>

        <!-- messages -->
        <line :x1="PX.client" :x2="PX.gw - 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="115" y2="115"/>
        <text :x="(PX.client + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="107">
          {{ s.m1 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="24" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="210" x="345" y="143"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="353" y="159">{{ s.n1 }}</text>
        <line :x1="PX.gw + 8" :x2="PX.auth - 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="205" y2="205"/>
        <text :x="(PX.gw + PX.auth) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="197">
          {{ s.m2 }}
        </text>
        <rect fill="var(--dc3-rose-fill)" height="24" rx="4" stroke="var(--dc3-rose-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="200" x="585" y="228"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="593" y="244">{{ s.n2 }}</text>
        <line :x1="PX.auth - 8" :x2="PX.gw + 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="285" y2="285"/>
        <text :x="(PX.gw + PX.auth) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="277">
          {{ s.m3 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="24" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="215" x="345" y="305"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="353" y="321">{{ s.n3 }}</text>
        <line :x1="PX.gw + 8" :x2="PX.be - 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="360" y2="360"/>
        <text :x="(PX.gw + PX.be) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="352">
          {{ s.m4 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="24" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="170" x="815" y="383"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="823" y="399">{{ s.n4 }}</text>
        <line :x1="PX.be + 8" :x2="PX.pc - 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5"
              y1="435" y2="435"/>
        <text :x="(PX.be + PX.pc) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="427">
          {{ s.m5 }}
        </text>
        <line :x1="PX.pc - 8" :x2="PX.be + 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="468" y2="468"/>
        <text :x="(PX.be + PX.pc) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="460">
          {{ s.m6 }}
        </text>
        <rect fill="var(--dc3-region-be)" height="24" rx="4" stroke="var(--dc3-be-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="150" x="815" y="488"/>
        <text fill="var(--dc3-be-text)" font-size="8" x="823" y="504">{{ s.n5 }}</text>
        <line :x1="PX.be - 8" :x2="PX.gw + 8" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="545" y2="545"/>
        <text :x="(PX.gw + PX.be) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="537">
          {{ s.m7 }}
        </text>
        <line :x1="PX.gw - 8" :x2="PX.client" marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)"
              stroke-dasharray="5,4" stroke-width="1" y1="578" y2="578"/>
        <text :x="(PX.client + PX.gw) / 2" fill="var(--dc3-arrow-label)" font-size="8.5" text-anchor="middle" y="570">
          {{ s.m8 }}
        </text>

        <!-- fail-closed note -->
        <rect fill="var(--dc3-rose-fill)" height="48" rx="4" stroke="var(--dc3-rose-stroke)" stroke-dasharray="3,2"
              stroke-width="0.8" width="420" x="640" y="600"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" text-anchor="middle" x="850" y="616">
          {{ s.fcTitle }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="850" y="630">{{ s.fc1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="850" y="642">{{ s.fc2 }}</text>

        <!-- participant headers -->
        <rect fill="var(--dc3-fe-fill)" height="48" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="170"
              x="25" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="110" y="48">
          {{ s.client }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="110" y="64">{{ s.clientSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="180"
              x="240" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="330" y="48">
          {{ s.gw }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="330" y="64">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-rose-fill)" height="48" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="200" x="470" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="570" y="48">
          {{ s.auth }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="570" y="64">{{ s.authSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="48" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="700" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="800" y="48">
          {{ s.be }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="800" y="64">{{ s.beSub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="48" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="150" x="925" y="28"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1000" y="48">
          {{ s.pc }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" text-anchor="middle" x="1000" y="64">{{ s.pcSub }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="25" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="47" y="677">{{ s.legClient }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="120" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="142" y="677">{{ s.legSvc }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="260" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="282" y="677">{{ s.legAuth }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="390" y="668"/>
        <text fill="var(--dc3-text2)" font-size="9" x="412" y="677">{{ s.legCache }}</text>
        <line marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="520" x2="548" y1="674"
              y2="674"/>
        <text fill="var(--dc3-text2)" font-size="9" x="554" y="677">{{ s.legReq }}</text>
        <line marker-end="url(#aseq-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="5,4" stroke-width="1" x1="620"
              x2="648" y1="674" y2="674"/>
        <text fill="var(--dc3-text2)" font-size="9" x="654" y="677">{{ s.legResp }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
