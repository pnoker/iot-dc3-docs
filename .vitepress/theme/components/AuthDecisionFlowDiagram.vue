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
    aria: '鉴权决策流：调用方带三头进入网关，网关经 gRPC 到鉴权中心核验令牌（鉴权中心负责两步登录取盐签发 12 小时令牌并维护注销名单）；网关把身份序列化为 X-Auth-Principal 并加 HMAC 签名透传给后端，后端常量时间验签；随后依次判定令牌有效、验签与 principal 完整、权限码命中、实体属于本租户，任一环节失败分别落到 401、403、404 终态，全部通过才放行；权限加载失败按 fail-closed 处理为空权限集',
    caller: '调用方', callerSub: 'Web / CLI / Agent',
    gw: 'dc3-gateway', gwSub: 'AuthenticGatewayFilter · 唯一入口',
    auth: 'dc3-center-auth', authSub: '两步登录 · 令牌 12h',
    be: '后端中心服务', beSub: 'GatewayJwtConverter 验签',
    res: '资源 / 控制器', resSub: '业务执行',
    deny: 'Caffeine 注销名单', denySub: '注销后旧令牌失效',
    cache: '权限缓存', cacheSub: '(tenantId:principalId) · 5min',
    e1a: 'X-Auth-*', e1b: '三头', e2a: 'gRPC', e2b: '核验',
    e3: 'X-Auth-Principal + X-Auth-Sign（HMAC-SHA256）', e4: '已鉴权调用',
    e5: '注销写入', e6: '读写权限集',
    e7: '进入判定链',
    stage1: '网关', stage2: '后端验签', stage3: '@PreAuthorize', stage4: 'requireTenant',
    d1: '令牌有效？', d2a: '验签通过且', d2b: 'principal 完整？',
    d3: '权限码命中？', d4: '实体属于本租户？',
    yes: '是', no: '否',
    t401a: '401', t401aS: '令牌无效 / 已注销 / 过期',
    t401b: '401 · 匿名拒绝', t401bS: '签名不符或身份头缺失',
    t403: '403', t403S: '未命中权限码（含空权限集）',
    t404: '404', t404S: '跨租户 → 「不存在」而非 403',
    pass: '放行 · 执行业务',
    fcTitle: 'fail-closed',
    fc1: '权限加载瞬时故障 →', fc2: '已认证但权限为空集', fc3: '任何守卫一律 403，', fc4: '绝不把抖动当放行',
    legCaller: '调用方 / 服务', legStage: '判定环节（菱形）', legChip: '机制芯片',
    legDeny: '拒绝终态', legPass: '放行终态', legSolid: '请求流（实线）', legDash: '辅助机制（虚线）'
  },
  en: {
    aria: 'Auth decision flow: callers enter the gateway with three headers; the gateway verifies the token over gRPC against the auth center (which issues 12-hour tokens via the two-step login and keeps the revocation denylist); the gateway serializes the identity into X-Auth-Principal with an HMAC signature for the backend, verified in constant time; the chain then checks token validity, signature and principal completeness, permission code hit, and tenant ownership — failures land on 401, 403 or 404 terminals; only full pass grants execution; permission load failure is fail-closed to an empty permission set',
    caller: 'Caller', callerSub: 'Web / CLI / Agent',
    gw: 'dc3-gateway', gwSub: 'AuthenticGatewayFilter · sole entry',
    auth: 'dc3-center-auth', authSub: 'two-step login · 12h token',
    be: 'Backend center', beSub: 'GatewayJwtConverter verifies',
    res: 'Resource / controller', resSub: 'business execution',
    deny: 'Caffeine denylist', denySub: 'revoked tokens invalid',
    cache: 'Permission cache', cacheSub: '(tenantId:principalId) · 5min',
    e1a: 'X-Auth-*', e1b: '3 headers', e2a: 'gRPC', e2b: 'verify',
    e3: 'X-Auth-Principal + X-Auth-Sign (HMAC-SHA256)', e4: 'authenticated call',
    e5: 'revoke write', e6: 'load permission set',
    e7: 'enter decision chain',
    stage1: 'gateway', stage2: 'backend verify', stage3: '@PreAuthorize', stage4: 'requireTenant',
    d1: 'token valid?', d2a: 'signature ok and', d2b: 'principal complete?',
    d3: 'permission hit?', d4: 'entity in own tenant?',
    yes: 'yes', no: 'no',
    t401a: '401', t401aS: 'invalid / revoked / expired',
    t401b: '401 · anonymous', t401bS: 'bad signature or missing header',
    t403: '403', t403S: 'no permission hit (empty set too)',
    t404: '404', t404S: 'cross-tenant → "not found", not 403',
    pass: 'ALLOW · execute',
    fcTitle: 'fail-closed',
    fc1: 'transient load failure →', fc2: 'authenticated, empty authorities', fc3: 'every guard returns 403,', fc4: 'never open on error',
    legCaller: 'Caller / service', legStage: 'decision (diamond)', legChip: 'mechanism chip',
    legDeny: 'deny terminal', legPass: 'allow terminal', legSolid: 'request flow (solid)', legDash: 'aux mechanism (dashed)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)

// decision diamonds: [cx, stageKey, q lines are rendered per-index in template]
const dias = [{ cx: 190 }, { cx: 445 }, { cx: 700 }, { cx: 955 }] as const
const stages = ['stage1', 'stage2', 'stage3', 'stage4'] as const
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1400 660">
        <defs>
          <marker id="adf-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="adf-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="adf-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#adf-grid)" height="100%" width="100%"/>

        <!-- arrows (before nodes) -->
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="202" x2="246" y1="110"
              y2="110"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="224" y="96">{{ s.e1a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="224" y="130">{{ s.e1b }}</text>
        <line marker-end="url(#adf-ah)" marker-start="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2"
              x1="472" x2="516" y1="110" y2="110"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="494" y="96">{{ s.e2a }}</text>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="494" y="130">{{ s.e2b }}</text>
        <path d="M 360 68 L 360 40 L 880 40 L 880 66" fill="none" marker-end="url(#adf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" text-anchor="middle" x="620" y="34">{{ s.e3 }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="992" x2="1036" y1="110"
              y2="110"/>
        <text fill="var(--dc3-arrow-label)" font-size="6.5" text-anchor="middle" x="1014" y="96">{{ s.e4 }}</text>
        <line marker-end="url(#adf-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="620" x2="620" y1="154" y2="216"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7" x="628" y="190">{{ s.e5 }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1"
              x1="880" x2="880" y1="154" y2="216"/>
        <text fill="var(--dc3-arrow-label)" font-size="7" x="888" y="190">{{ s.e6 }}</text>
        <path d="M 360 154 L 360 330 L 190 330 L 190 381" fill="none" marker-end="url(#adf-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.2"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="280" y="322">{{ s.e7 }}</text>

        <!-- decision chain: yes arrows -->
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="282" x2="351" y1="430"
              y2="430"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="304" y="422">{{ s.yes }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="537" x2="606" y1="430"
              y2="430"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="559" y="422">{{ s.yes }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="792" x2="861" y1="430"
              y2="430"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="814" y="422">{{ s.yes }}</text>
        <line marker-end="url(#adf-ah)" stroke="var(--dc3-be-stroke)" stroke-width="1.5" x1="1047" x2="1126"
              y1="430" y2="430"/>
        <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="1070" y="422">{{ s.yes }}</text>

        <!-- no arrows to terminals -->
        <line v-for="(d, idx) in dias" :key="'no' + idx" marker-end="url(#adf-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-width="1" :x1="d.cx" :x2="d.cx" y1="477" y2="516"/>
        <text v-for="(d, idx) in dias" :key="'nol' + idx" fill="var(--dc3-rose-stroke)" font-size="9"
              font-weight="600" :x="d.cx + 8" y="500">{{ s.no }}</text>

        <!-- row A nodes -->
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="140" x="62" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="132" y="102">{{
            s.caller
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="132" y="120">{{ s.callerSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="76" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="220" x="250" y="72"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="700" text-anchor="middle" x="360" y="98">{{
            s.gw
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="360" y="118">{{ s.gwSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="520" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="620" y="102">{{
            s.auth
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="620" y="120">{{ s.authSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="220" x="770" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="880" y="102">{{
            s.be
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="880" y="120">{{ s.beSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1"
              width="260" x="1040" y="78"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="1170" y="102">{{
            s.res
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="1170" y="120">{{ s.resSub }}</text>

        <!-- mechanism chips -->
        <rect fill="var(--dc3-rose-fill)" height="50" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="200" x="520" y="220"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="620" y="240">{{
            s.deny
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="620" y="258">{{ s.denySub }}</text>
        <rect fill="var(--dc3-amber-fill)" height="50" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="200" x="780" y="220"/>
        <text fill="var(--dc3-amber-stroke)" font-size="9" font-weight="600" text-anchor="middle" x="880" y="240">{{
            s.cache
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="880" y="258">{{ s.cacheSub }}</text>

        <!-- stage tags -->
        <text v-for="(st, idx) in stages" :key="'st' + idx" fill="var(--dc3-amber-stroke)" font-size="7.5"
              font-weight="600" text-anchor="middle" :x="dias[idx].cx" y="376">{{ s[st] }}</text>

        <!-- diamonds -->
        <polygon fill="var(--dc3-amber-fill)" points="190,385 280,430 190,475 100,430"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="190" y="434">{{
            s.d1
          }}
        </text>
        <polygon fill="var(--dc3-amber-fill)" points="445,385 535,430 445,475 355,430"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="445" y="428">{{
            s.d2a
          }}
        </text>
        <text fill="var(--dc3-box-name)" font-size="8.5" font-weight="600" text-anchor="middle" x="445" y="444">{{
            s.d2b
          }}
        </text>
        <polygon fill="var(--dc3-amber-fill)" points="700,385 790,430 700,475 610,430"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="700" y="434">{{
            s.d3
          }}
        </text>
        <polygon fill="var(--dc3-amber-fill)" points="955,385 1045,430 955,475 865,430"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
        <text fill="var(--dc3-box-name)" font-size="9" font-weight="600" text-anchor="middle" x="955" y="434">{{
            s.d4
          }}
        </text>

        <!-- deny terminals -->
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="115" y="520"/>
        <text fill="var(--dc3-rose-stroke)" font-size="12" font-weight="700" text-anchor="middle" x="190" y="544">{{
            s.t401a
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7" text-anchor="middle" x="190" y="562">{{ s.t401aS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="370" y="520"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="700" text-anchor="middle" x="445" y="544">{{
            s.t401b
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7" text-anchor="middle" x="445" y="562">{{ s.t401bS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="625" y="520"/>
        <text fill="var(--dc3-rose-stroke)" font-size="12" font-weight="700" text-anchor="middle" x="700" y="544">{{
            s.t403
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7" text-anchor="middle" x="700" y="562">{{ s.t403S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="56" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="150" x="880" y="520"/>
        <text fill="var(--dc3-rose-stroke)" font-size="12" font-weight="700" text-anchor="middle" x="955" y="544">{{
            s.t404
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7" text-anchor="middle" x="955" y="562">{{ s.t404S }}</text>

        <!-- allow terminal + fail-closed note -->
        <rect fill="var(--dc3-be-fill)" height="50" rx="25" stroke="var(--dc3-be-stroke)" stroke-width="1.5"
              width="170" x="1130" y="405"/>
        <text fill="var(--dc3-be-text)" font-size="12" font-weight="700" text-anchor="middle" x="1215" y="436">{{
            s.pass
          }}
        </text>
        <rect fill="var(--dc3-rose-fill)" height="110" rx="8" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="170" x="1130" y="500"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10" font-weight="700" text-anchor="middle" x="1215" y="522">{{
            s.fcTitle
          }}
        </text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="1215" y="544">{{ s.fc1 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="1215" y="560">{{ s.fc2 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="1215" y="580">{{ s.fc3 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="1215" y="596">{{ s.fc4 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="40" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="641">{{ s.legCaller }}</text>
        <polygon fill="var(--dc3-amber-fill)" points="200,627 218,637 200,647 182,637"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="226" y="641">{{ s.legStage }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="360" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="382" y="641">{{ s.legChip }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="480" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="641">{{ s.legDeny }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="590" y="632"/>
        <text fill="var(--dc3-text2)" font-size="9" x="612" y="641">{{ s.legPass }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="700" x2="730" y1="637" y2="637"/>
        <text fill="var(--dc3-text2)" font-size="9" x="736" y="641">{{ s.legSolid }}</text>
        <line stroke="var(--dc3-arrow)" stroke-dasharray="4,4" stroke-width="1" x1="870" x2="900" y1="637" y2="637"/>
        <text fill="var(--dc3-text2)" font-size="9" x="906" y="641">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
