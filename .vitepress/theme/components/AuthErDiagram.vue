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
    aria: '鉴权实体关系图：dc3_principal 是根身份，本地凭据挂在 principal 上，租户成员关系显式声明归属（一个 USER 可属多租户）；角色归属在租户内（role_principal_bind 带 tenant_id），资源授权全局（role_resource_bind 无 tenant_id），资源即三段式权限码；外部身份两张表已建未实现',
    idRegion: '身份域 · principal 为根',
    rbacRegion: '租户 · 角色 · 资源 (RBAC 绑定域)',
    prName: 'dc3_principal', prTag: '«根身份»',
    prF1: '+ principal_id PK', prF2: '+ principal_type',
    prF3: '  USER / SERVICE_ACCOUNT / SYSTEM',
    prF4: '+ source_type (LOCAL / EXTERNAL 预留)',
    prF5: '  身份不内嵌租户',
    prF6: '  用户只是身份的一种',
    crName: 'dc3_local_credential', crTag: '«本地凭据»',
    crF1: '+ principal_id FK → principal', crF2: '+ password_hash',
    crF3: '  Argon2id (新) / BCrypt (seed)', crF4: '+ password_expire_time',
    crF5: '+ require_password_change', crF6: '凭据挂身份而非用户表',
    tnName: 'dc3_tenant', tnTag: '«租户»',
    tnF1: '+ tenant_id PK', tnF2: '+ tenant_code 唯一',
    tnF3: '登录由 tenant + name 定位',
    mbName: 'dc3_tenant_membership', mbTag: '«租户成员关系»',
    mbF1: '+ tenant_id FK → tenant', mbF2: '+ principal_id FK → principal',
    mbF3: 'UQ (tenant_id, principal_id)', mbF4: 'USER 可属多租户 (多行)',
    mbF5: 'SERVICE_ACCOUNT 单租户',
    rpbName: 'dc3_role_principal_bind', rpbTag: '«主体-角色绑定»',
    rpbF1: '+ tenant_id FK', rpbF2: '+ principal_id FK', rpbF3: '+ role_id FK',
    rpbF4: '主体在该租户内的角色',
    rpbF5: '缓存键 (tenantId:principalId)',
    roName: 'dc3_role', roTag: '«角色»',
    roF1: '+ role_id PK', roF2: '+ role_name',
    roF3: '归属作用域: 租户内', roF4: '(经 rpb 携带 tenant_id)',
    rrbName: 'dc3_role_resource_bind', rrbTag: '«角色-资源绑定»',
    rrbF1: '+ role_id FK', rrbF2: '+ resource_id FK',
    rrbF3: '无 tenant_id · 全局', rrbF4: '同角色定义跨租户复用',
    rsName: 'dc3_resource', rsTag: '«资源 = 权限码»',
    rsF1: '+ resource_id PK', rsF2: '+ code 三段式',
    rsF3: '  {service}:{domain}:{scope}', rsF4: '例 dc3-center-data:',
    rsF5: '  point_command:list', rsF6: 'seed 管理员 = 通配 *',
    idpName: 'dc3_identity_provider', idpTag: '«外部 IdP · 未实现»',
    idpF1: '+ provider_type', idpF2: '  (OIDC / SAML)',
    idpF3: '登录端点未实现 · 关闭',
    eidName: 'dc3_external_identity', eidTag: '«外部身份绑定 · 未实现»',
    eidF1: '+ provider_id FK', eidF2: '+ principal_id FK',
    eidF3: '表已建 · 02-auth.sql',
    c1: '1─N', c2: '1 ─ N', c3: '挂 principal',
    c4: 'principal_id ▼', c5: 'N ─ 1 · 未实现', c6: 'N─1',
    c7: '1 ─ N', c8: 'N',
    legId: '身份 / 凭据', legTn: '租户 / 角色', legBind: '绑定 / 成员',
    legRes: '资源码', legFuture: '外部身份 (未实现)', legRel: '关系连线'
  },
  en: {
    aria: 'Auth entity-relation diagram: dc3_principal is the root identity with local credentials attached; tenant membership is explicit (a USER may belong to several tenants); role assignment is tenant-scoped via role_principal_bind while resource grants are global via role_resource_bind, resources being three-part permission codes; the two external-identity tables exist but are unimplemented',
    idRegion: 'Identity · principal as the root',
    rbacRegion: 'Tenant · Role · Resource (RBAC binding domain)',
    prName: 'dc3_principal', prTag: '«root identity»',
    prF1: '+ principal_id PK', prF2: '+ principal_type',
    prF3: '  USER / SERVICE_ACCOUNT / SYSTEM',
    prF4: '+ source_type (LOCAL / EXTERNAL reserved)',
    prF5: '  no tenant embedded on identity',
    prF6: '  users are just one type',
    crName: 'dc3_local_credential', crTag: '«local credential»',
    crF1: '+ principal_id FK → principal', crF2: '+ password_hash',
    crF3: '  Argon2id (new) / BCrypt (seed)', crF4: '+ password_expire_time',
    crF5: '+ require_password_change', crF6: 'hangs off principal, not user',
    tnName: 'dc3_tenant', tnTag: '«tenant»',
    tnF1: '+ tenant_id PK', tnF2: '+ tenant_code unique',
    tnF3: 'login locates by tenant + name',
    mbName: 'dc3_tenant_membership', mbTag: '«tenant membership»',
    mbF1: '+ tenant_id FK → tenant', mbF2: '+ principal_id FK → principal',
    mbF3: 'UQ (tenant_id, principal_id)', mbF4: 'USER in many tenants (rows)',
    mbF5: 'SERVICE_ACCOUNT single-tenant',
    rpbName: 'dc3_role_principal_bind', rpbTag: '«principal-role bind»',
    rpbF1: '+ tenant_id FK', rpbF2: '+ principal_id FK', rpbF3: '+ role_id FK',
    rpbF4: 'roles of the principal in a tenant',
    rpbF5: 'cache key (tenantId:principalId)',
    roName: 'dc3_role', roTag: '«role»',
    roF1: '+ role_id PK', roF2: '+ role_name',
    roF3: 'assignment scope: tenant', roF4: '(tenant_id via rpb)',
    rrbName: 'dc3_role_resource_bind', rrbTag: '«role-resource bind»',
    rrbF1: '+ role_id FK', rrbF2: '+ resource_id FK',
    rrbF3: 'no tenant_id · global', rrbF4: 'role reused across tenants',
    rsName: 'dc3_resource', rsTag: '«resource = permission code»',
    rsF1: '+ resource_id PK', rsF2: '+ code three parts',
    rsF3: '  {service}:{domain}:{scope}', rsF4: 'e.g. dc3-center-data:',
    rsF5: '  point_command:list', rsF6: 'seed admin = wildcard *',
    idpName: 'dc3_identity_provider', idpTag: '«external IdP · TODO»',
    idpF1: '+ provider_type', idpF2: '  (OIDC / SAML)',
    idpF3: 'login endpoint disabled',
    eidName: 'dc3_external_identity', eidTag: '«external identity · TODO»',
    eidF1: '+ provider_id FK', eidF2: '+ principal_id FK',
    eidF3: 'tables exist · 02-auth.sql',
    c1: '1─N', c2: '1 ─ N', c3: 'on principal',
    c4: 'principal_id ▼', c5: 'N ─ 1 · TODO', c6: 'N─1',
    c7: '1 ─ N', c8: 'N',
    legId: 'Identity / credential', legTn: 'Tenant / role', legBind: 'Binding / membership',
    legRes: 'Resource code', legFuture: 'External identity (TODO)', legRel: 'Relation'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1400 768">
        <defs>
          <marker id="aer-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="aer-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#aer-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="210" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="644" x="494" y="64"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="600" x="506" y="82">{{ s.idRegion }}</text>
        <rect fill="var(--dc3-region-amber)" height="360" rx="12" stroke="var(--dc3-amber-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="1320" x="54" y="384"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="66" y="402">{{ s.rbacRegion }}</text>

        <!-- relations -->
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="280" x2="308" y1="480" y2="480"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="294" y="472">{{ s.c1 }}</text>
        <path d="M600,264 L600,350 L440,350 L440,408" fill="none" marker-end="url(#aer-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="520" y="344">{{ s.c4 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="680" x2="680" y1="264"
              y2="406"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="690" y="340">{{ s.c4 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="772" x2="858" y1="150" y2="150"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="815" y="140">{{ s.c2 }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="815" y="168">{{ s.c3 }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="180" x2="180" y1="200" y2="228"/>
        <text fill="var(--dc3-text2)" font-size="8" x="190" y="218">{{ s.c2 }}</text>
        <path d="M302,295 L400,295 L400,220 L506,220" fill="none" marker-end="url(#aer-ah)"
              stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="351" y="289">{{ s.c5 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="852" x2="878" y1="490" y2="490"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="865" y="482">{{ s.c6 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="975" x2="975" y1="552"
              y2="598"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="985" y="580">{{ s.c7 }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1122" x2="1138" y1="665"
              y2="665"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="1130" y="657">{{ s.c8 }}</text>

        <!-- dc3_principal -->
        <rect fill="var(--dc3-rose-fill)" height="180" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="260" x="510" y="84"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="640" y="108">
          {{ s.prName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="640" y="124">{{ s.prTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="518" x2="762" y1="132" y2="132"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="522" y="152">{{ s.prF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="522" y="170">{{ s.prF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="530" y="186">{{ s.prF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="522" y="206">{{ s.prF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="530" y="222">{{ s.prF5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="530" y="238">{{ s.prF6 }}</text>

        <!-- dc3_local_credential -->
        <rect fill="var(--dc3-rose-fill)" height="140" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="260" x="860" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="990" y="134">
          {{ s.crName }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="990" y="150">{{ s.crTag }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="0.6" x1="868" x2="1112" y1="158" y2="158"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="872" y="178">{{ s.crF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="872" y="196">{{ s.crF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="880" y="212">{{ s.crF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="872" y="230">{{ s.crF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="872" y="244">{{ s.crF5 }}</text>

        <!-- dc3_tenant -->
        <rect fill="var(--dc3-be-fill)" height="140" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="210"
              x="70" y="410"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="175" y="434">
          {{ s.tnName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="175" y="450">{{ s.tnTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="78" x2="272" y1="458" y2="458"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="82" y="478">{{ s.tnF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="82" y="496">{{ s.tnF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="82" y="518">{{ s.tnF3 }}</text>

        <!-- dc3_tenant_membership -->
        <rect fill="var(--dc3-amber-fill)" height="160" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="260" x="310" y="410"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="440" y="434">
          {{ s.mbName }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="440" y="450">{{ s.mbTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="318" x2="562" y1="458" y2="458"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="322" y="478">{{ s.mbF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="322" y="496">{{ s.mbF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="322" y="514">{{ s.mbF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="322" y="532">{{ s.mbF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="322" y="550">{{ s.mbF5 }}</text>

        <!-- dc3_role_principal_bind -->
        <rect fill="var(--dc3-amber-fill)" height="160" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="230" x="620" y="410"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="735" y="434">
          {{ s.rpbName }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="735" y="450">{{ s.rpbTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="628" x2="842" y1="458" y2="458"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="632" y="478">{{ s.rpbF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="632" y="496">{{ s.rpbF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="632" y="514">{{ s.rpbF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="632" y="532">{{ s.rpbF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="632" y="552">{{ s.rpbF5 }}</text>

        <!-- dc3_role -->
        <rect fill="var(--dc3-be-fill)" height="140" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="190"
              x="880" y="410"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="975" y="434">
          {{ s.roName }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="975" y="450">{{ s.roTag }}</text>
        <line stroke="var(--dc3-be-stroke)" stroke-width="0.6" x1="888" x2="1062" y1="458" y2="458"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="478">{{ s.roF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="892" y="496">{{ s.roF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="892" y="518">{{ s.roF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="892" y="534">{{ s.roF4 }}</text>

        <!-- dc3_role_resource_bind -->
        <rect fill="var(--dc3-amber-fill)" height="130" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="220" x="900" y="600"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="9.5" text-anchor="middle" x="1010" y="624">
          {{ s.rrbName }}
        </text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" text-anchor="middle" x="1010" y="640">{{ s.rrbTag }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-width="0.6" x1="908" x2="1112" y1="648" y2="648"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="912" y="668">{{ s.rrbF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="912" y="686">{{ s.rrbF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="912" y="704">{{ s.rrbF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="912" y="720">{{ s.rrbF4 }}</text>

        <!-- dc3_resource -->
        <rect fill="var(--dc3-fe-fill)" height="140" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="220"
              x="1140" y="600"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="1250" y="624">
          {{ s.rsName }}
        </text>
        <text fill="var(--dc3-fe-text)" font-size="8" text-anchor="middle" x="1250" y="640">{{ s.rsTag }}</text>
        <line stroke="var(--dc3-fe-stroke)" stroke-width="0.6" x1="1148" x2="1352" y1="648" y2="648"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1152" y="668">{{ s.rsF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1152" y="686">{{ s.rsF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1160" y="702">{{ s.rsF3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1152" y="718">{{ s.rsF4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1160" y="732">{{ s.rsF5 }}</text>

        <!-- future tables -->
        <rect fill="var(--dc3-ext-fill)" height="110" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="5,4"
              stroke-width="1" width="240" x="60" y="90"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="180" y="114">
          {{ s.idpName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="180" y="130">{{ s.idpTag }}</text>
        <line stroke="var(--dc3-ext-stroke)" stroke-width="0.6" stroke-dasharray="5,4" x1="68" x2="292" y1="138"
              y2="138"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="158">{{ s.idpF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="80" y="174">{{ s.idpF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="72" y="192">{{ s.idpF3 }}</text>
        <rect fill="var(--dc3-ext-fill)" height="130" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="5,4"
              stroke-width="1" width="240" x="60" y="230"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="180" y="254">
          {{ s.eidName }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="180" y="270">{{ s.eidTag }}</text>
        <line stroke="var(--dc3-ext-stroke)" stroke-width="0.6" stroke-dasharray="5,4" x1="68" x2="292" y1="278"
              y2="278"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="298">{{ s.eidF1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="316">{{ s.eidF2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="72" y="334">{{ s.eidF3 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="60" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="753">{{ s.legId }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="190" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="212" y="753">{{ s.legTn }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="320" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="342" y="753">{{ s.legBind }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="470" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="492" y="753">{{ s.legRes }}</text>
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="16" x="590" y="744"/>
        <text fill="var(--dc3-text2)" font-size="9" x="612" y="753">{{ s.legFuture }}</text>
        <line marker-end="url(#aer-ah)" stroke="var(--dc3-arrow)" stroke-width="1.5" x1="770" x2="798" y1="750"
              y2="750"/>
        <text fill="var(--dc3-text2)" font-size="9" x="804" y="753">{{ s.legRel }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
