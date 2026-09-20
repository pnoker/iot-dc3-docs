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
    tenantTitle: '租户 TENANT · dc3_tenant',
    principalTitle: '主体 PRINCIPAL',
    memberTitle: '租户成员 TENANT_MEMBERSHIP',
    memberUk: 'UK (tenant_id, principal_id)',
    ownedRegion: 'TenantOwned 业务实体 · 每行带 tenantId',
    miniDevice: 'DEVICE', miniProfile: 'PROFILE',
    miniPv: 'POINT_VALUE', miniCmd: 'COMMAND',
    miniMore: '+ POINT / EVENT / EVENT_HISTORY / DRIVER / 属性配置 …',
    lblMember: 'principalId · 一人可属多租户',
    lblOwn: 'tenantId · 1:N 拥有',
    lblRbac: '入租户后由 RBAC 授权',
    lblMulti: '一人多租户成员',
    rbacTitle: '角色与租户正交',
    rbacL1: 'dc3_role_principal_bind 决定能做哪些操作',
    rbacL2: '租户管"能碰哪条数据" · 角色管"能做哪类操作"',
    multiTitle: '多租户成员',
    multiL1: 'alice 可同时属 default 与 acme（各一行成员关系）',
    multiL2: 'SERVICE_ACCOUNT 按设计只属一个租户',
    defaultNote: 'tenantCode = default 的租户即系统管理员租户',
    legPk: 'PK 主键', legFk: 'FK 外键', legUk: 'UK 唯一键',
    legOneN: '1:N 拥有', legMany: 'N:M 成员', legDash: '授权 / 注记（虚线）',
    aria: '租户实体关系图：主体经租户成员表加入租户，唯一键建在租户加主体上，因此一人可属多个租户；一切实现 TenantOwned 的业务实体都归租户拥有并被隔离；进入租户后再由 RBAC 绑定表决定能做哪些操作，角色与租户正交'
  },
  en: {
    tenantTitle: 'TENANT · dc3_tenant',
    principalTitle: 'PRINCIPAL',
    memberTitle: 'TENANT_MEMBERSHIP · dc3_tenant_membership',
    memberUk: 'UK (tenant_id, principal_id)',
    ownedRegion: 'TenantOwned business entities · every row carries tenantId',
    miniDevice: 'DEVICE', miniProfile: 'PROFILE',
    miniPv: 'POINT_VALUE', miniCmd: 'COMMAND',
    miniMore: '+ POINT / EVENT / EVENT_HISTORY / DRIVER / attr configs …',
    lblMember: 'principalId · a user may join many tenants',
    lblOwn: 'tenantId · 1:N ownership',
    lblRbac: 'RBAC grants after joining',
    lblMulti: 'multi-tenant membership',
    rbacTitle: 'role ⊥ tenant',
    rbacL1: 'dc3_role_principal_bind decides allowed operations',
    rbacL2: 'tenant bounds data · role bounds operations',
    multiTitle: 'multi-tenant membership',
    multiL1: 'alice can join both default and acme (one row each)',
    multiL2: 'SERVICE_ACCOUNT belongs to exactly one tenant',
    defaultNote: 'the tenant with tenantCode = default is the admin tenant',
    legPk: 'PK primary key', legFk: 'FK foreign key', legUk: 'UK unique key',
    legOneN: '1:N ownership', legMany: 'N:M membership', legDash: 'grant / note (dashed)',
    aria: 'Tenant entity-relationship diagram: principals join tenants through the membership table whose unique key is tenant plus principal, so one principal may belong to several tenants; every TenantOwned business entity is owned and isolated by tenant; after joining, the RBAC bind table decides allowed operations — role and tenant are orthogonal'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram dc3-er">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 680">
        <defs>
          <marker id="tnt-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="tnt-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#tnt-grid)" height="100%" width="100%"/>

        <!-- owned entities region -->
        <rect fill="var(--dc3-region-be)" height="300" rx="12" stroke="var(--dc3-rose-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="370" x="890" y="66"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="902" y="84">{{ s.ownedRegion }}</text>

        <!-- connectors -->
        <line marker-end="url(#tnt-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="310" x2="466" y1="280" y2="280"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="388" y="270">{{ s.lblMember }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="318" y="274">N</text>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="450" y="274">M</text>
        <line marker-end="url(#tnt-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="630" x2="630" y1="175" y2="246"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="638" y="215">{{ s.lblOwn }}</text>
        <line marker-end="url(#tnt-ah)" stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="770" x2="886" y1="120"
              y2="120"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" text-anchor="middle" x="828" y="110">{{ s.lblOwn }}</text>
        <line marker-end="url(#tnt-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="185"
              x2="185" y1="315" y2="466"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="193" y="400">{{ s.lblRbac }}</text>
        <line marker-end="url(#tnt-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="0.8" x1="560"
              x2="560" y1="355" y2="466"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="568" y="420">{{ s.lblMulti }}</text>

        <!-- TENANT entity -->
        <rect fill="var(--dc3-rose-fill)" height="105" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="280" x="490" y="70"/>
        <rect fill="var(--dc3-rose-stroke)" height="22" rx="6" width="280" x="490" y="70"/>
        <text fill="var(--dc3-rose-fill)" font-size="10" font-weight="600" x="500" y="85">{{ s.tenantTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="102">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="762" y="102">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="117">tenantName</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="132">tenantCode</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="762" y="132">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="500" y="147">tenantExt · enableFlag</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="500" y="166">{{ s.defaultNote }}</text>

        <!-- PRINCIPAL entity -->
        <rect fill="var(--dc3-fe-fill)" height="105" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="250"
              x="60" y="210"/>
        <rect fill="var(--dc3-fe-stroke)" height="22" rx="6" width="250" x="60" y="210"/>
        <text fill="var(--dc3-fe-fill)" font-size="10" font-weight="600" x="70" y="225">{{ s.principalTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="242">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="end" x="302" y="242">PK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="257">principalType: USER /</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="272">SERVICE_ACCOUNT / SYSTEM</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="287">name · salt · password</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="70" y="302">enableFlag</text>

        <!-- TENANT_MEMBERSHIP entity -->
        <rect fill="var(--dc3-be-fill)" height="105" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="320"
              x="470" y="250"/>
        <rect fill="var(--dc3-be-stroke)" height="22" rx="6" width="320" x="470" y="250"/>
        <text fill="var(--dc3-be-fill)" font-size="10" font-weight="600" x="480" y="265">{{ s.memberTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="282">tenantId · principalId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="end" x="782" y="282">FK</text>
        <text fill="var(--dc3-db-stroke)" font-size="7.5" text-anchor="end" x="782" y="297">UK</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="297">{{ s.memberUk }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="312">principalType</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="327">membershipStatus:</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="480" y="342">ACTIVE / SUSPENDED / INVITED · joinedTime</text>

        <!-- owned minis -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="164"
              x="906" y="100"/>
        <rect fill="var(--dc3-be-stroke)" height="18" rx="6" width="164" x="906" y="100"/>
        <text fill="var(--dc3-be-fill)" font-size="9" font-weight="600" x="914" y="113">{{ s.miniDevice }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="132">id</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7" text-anchor="end" x="1062" y="132">PK</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="146">deviceName</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="160">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7" text-anchor="end" x="1062" y="160">FK</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="164"
              x="1084" y="100"/>
        <rect fill="var(--dc3-be-stroke)" height="18" rx="6" width="164" x="1084" y="100"/>
        <text fill="var(--dc3-be-fill)" font-size="9" font-weight="600" x="1092" y="113">{{ s.miniProfile }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="132">id · profileCode</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="146">profileShareFlag</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="160">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7" text-anchor="end" x="1240" y="160">FK</text>
        <rect fill="var(--dc3-db-fill)" height="70" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="164"
              x="906" y="190"/>
        <rect fill="var(--dc3-db-stroke)" height="18" rx="6" width="164" x="906" y="190"/>
        <text fill="var(--dc3-db-fill)" font-size="9" font-weight="600" x="914" y="203">{{ s.miniPv }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="222">deviceId · pointId</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="236">rawValue · calValue</text>
        <text fill="var(--dc3-text2)" font-size="8" x="914" y="250">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7" text-anchor="end" x="1062" y="250">FK</text>
        <rect fill="var(--dc3-be-fill)" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="164"
              x="1084" y="190"/>
        <rect fill="var(--dc3-be-stroke)" height="18" rx="6" width="164" x="1084" y="190"/>
        <text fill="var(--dc3-be-fill)" font-size="9" font-weight="600" x="1092" y="203">{{ s.miniCmd }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="222">id · commandCode</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="236">callTypeFlag · timeout</text>
        <text fill="var(--dc3-text2)" font-size="8" x="1092" y="250">tenantId</text>
        <text fill="var(--dc3-amber-stroke)" font-size="7" text-anchor="end" x="1240" y="250">FK</text>
        <rect fill="none" height="44" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="342" x="906" y="276"/>
        <text fill="var(--dc3-text2)" font-size="8.5" x="918" y="294">{{ s.miniMore }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="918" y="310">getTenantId() → 隔离的施加对象</text>

        <!-- RBAC card -->
        <rect fill="none" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="350" x="60" y="470"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="72" y="490">{{ s.rbacTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="510">{{ s.rbacL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="72" y="528">{{ s.rbacL2 }}</text>

        <!-- multi-tenant card -->
        <rect fill="none" height="70" rx="6" stroke="var(--dc3-be-stroke)" stroke-dasharray="5,3" stroke-width="1"
              width="360" x="470" y="470"/>
        <text fill="var(--dc3-be-stroke)" font-size="9" font-weight="600" x="482" y="490">{{ s.multiTitle }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="510">{{ s.multiL1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="482" y="528">{{ s.multiL2 }}</text>

        <!-- legend -->
        <text fill="var(--dc3-rose-stroke)" font-size="8" font-weight="600" x="60" y="644">PK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="78" y="644">{{ s.legPk }}</text>
        <text fill="var(--dc3-amber-stroke)" font-size="8" font-weight="600" x="160" y="644">FK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="178" y="644">{{ s.legFk }}</text>
        <text fill="var(--dc3-db-stroke)" font-size="8" font-weight="600" x="260" y="644">UK</text>
        <text fill="var(--dc3-text2)" font-size="9" x="278" y="644">{{ s.legUk }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-width="1" x1="360" x2="380" y1="641" y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="386" y="644">{{ s.legOneN }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1" x1="500" x2="520" y1="641" y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="526" y="644">{{ s.legMany }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,3" stroke-width="0.8" x1="640" x2="660" y1="641" y2="641"/>
        <text fill="var(--dc3-text2)" font-size="9" x="666" y="644">{{ s.legDash }}</text>
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
