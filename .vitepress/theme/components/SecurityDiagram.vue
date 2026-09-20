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
    aria: '物联网安全层次图：设备、通信、平台、数据四层防线自上而下串联，数据流经每层；右侧威胁卡片（设备伪造、固件篡改、重放、中间人、DDoS、越权跨租户、脱库）以虚线攻击箭头指向对应防线，卡内给出对策，体现纵深防御——任何单点被攻破都不至于全盘失守',
    motto: '纵深防御：每一层都设一道关，任何单点被攻破都不至于全盘失守；边界之外皆不可信',
    l1: '① 设备安全 · 信任从硬件开始',
    l2: '② 通信安全 · 加密 + 认证 + 防重放',
    l3: '③ 平台安全 · 认证 · 授权 · 隔离 · 审计',
    l4: '④ 数据安全 · 隐私 · 脱敏 · 合规',
    c11: '安全启动', c11S: 'Bootloader 逐级验签',
    c12: '密钥存储', c12S: 'SE / TEE · 可用不可读',
    c13: '验签 OTA', c13S: '验签后写入 · 支持回滚',
    c21: '加密', c21S: 'TLS (TCP) / DTLS (UDP)',
    c22: '双向认证', c22S: '证书 / PSK · 防假平台假设备',
    c23: '防重放', c23S: '时间戳 · 单调序号 · nonce',
    c31: '认证', c31S: '两步握手 · 令牌可验有时效',
    c32: '授权 RBAC', c32S: '最小权限 · fail-closed',
    c33: '租户隔离 + 审计', c33S: '跨租户 404 不泄露 · 操作留痕',
    c41: '隐私', c41S: '最小采集 · 目的限定',
    c42: '脱敏', c42S: '展示 / 导出 / 喂 AI 前掩码',
    c43: '合规', c43S: 'GDPR · 个保法 · 跨境约束',
    c44: '静态加密 + 最小留存', c44S: '落库 / 磁盘加密 · 过期即删',
    t1: '设备伪造', t1S: '对策：一机一密 / 设备证书',
    t2: '固件篡改', t2S: '对策：安全启动 + 验签 OTA + 回滚',
    t3: '重放攻击', t3S: '对策：时间戳 / 序号 / nonce',
    t4: '中间人 MITM', t4S: '对策：双向认证 + TLS / DTLS',
    t5: 'DDoS', t5S: '对策：入口收敛单一网关 + 限流',
    t6: '越权 / 跨租户', t6S: '对策：RBAC fail-closed + 租户隔离',
    t7: '脱库 / 隐私泄露', t7S: '对策：静态加密 + 脱敏 + 最小留存',
    a1: '仿冒上报', a2: '刷恶意固件', a3: '录包重放',
    a4: '窃听 / 改包', a5: '海量请求', a6: '越界访问', a7: '拖库 / 泄露',
    f1: '采集数据上送', f2: '汇聚进入平台', f3: '落库 / 对外使用',
    dc3Title: 'IoT DC3 落点',
    dc3L1: '唯一对外入口 dc3-gateway :8000 · 两步登录换 12h 令牌 · 网关 HMAC 签名 X-Auth-Sign、后端常量时间验签',
    dc3L2: 'RBAC 查不到权限 = 403（fail-closed）· 跨租户访问 = 404 · 生产弱密钥启动即失败 · 跨网链路必开 TLS',
    legL1: '设备防线', legL2: '通信防线', legL3: '平台防线', legL4: '数据防线',
    legThreat: '威胁 + 对策', legAttack: '攻击路径（虚线）', legFlow: '数据流向（实线）'
  },
  en: {
    aria: 'IoT security layers: device, communication, platform and data defenses stacked top-down with the data flow crossing each layer; threat cards on the right (device spoofing, firmware tamper, replay, MITM, DDoS, privilege escalation/cross-tenant, DB breach) point dashed attack arrows at the matching layer with countermeasures inside the card, embodying defense in depth',
    motto: 'Defense in depth: a gate at every layer, no single breach is fatal; everything beyond the boundary is untrusted',
    l1: '① Device security · trust from hardware',
    l2: '② Communication · encrypt + auth + anti-replay',
    l3: '③ Platform · authn · RBAC · isolation · audit',
    l4: '④ Data · privacy · masking · compliance',
    c11: 'Secure boot', c11S: 'bootloader verifies each stage',
    c12: 'Key storage', c12S: 'SE / TEE · usable, unreadable',
    c13: 'Signed OTA', c13S: 'verify then write · rollback',
    c21: 'Encryption', c21S: 'TLS (TCP) / DTLS (UDP)',
    c22: 'Mutual auth', c22S: 'cert / PSK · no fake peers',
    c23: 'Anti-replay', c23S: 'timestamp · seq · nonce',
    c31: 'Authentication', c31S: 'two-step login · expiring token',
    c32: 'RBAC authz', c32S: 'least privilege · fail-closed',
    c33: 'Tenant isolation + audit', c33S: '404 not 403 · full trail',
    c41: 'Privacy', c41S: 'minimal collection · purpose',
    c42: 'Masking', c42S: 'mask before display / export / AI',
    c43: 'Compliance', c43S: 'GDPR · PIPL · cross-border',
    c44: 'Encrypt at rest + retention', c44S: 'disk / DB encryption · expire & delete',
    t1: 'Device spoofing', t1S: 'fix: per-device key / certificate',
    t2: 'Firmware tamper', t2S: 'fix: secure boot + signed OTA + rollback',
    t3: 'Replay', t3S: 'fix: timestamp / seq / nonce',
    t4: 'MITM', t4S: 'fix: mutual auth + TLS / DTLS',
    t5: 'DDoS', t5S: 'fix: single gateway entry + rate limit',
    t6: 'Privilege / cross-tenant', t6S: 'fix: fail-closed RBAC + isolation',
    t7: 'DB breach / privacy leak', t7S: 'fix: encrypt at rest + mask + retention',
    a1: 'spoofed report', a2: 'flash malware', a3: 'replay capture',
    a4: 'tap / alter', a5: 'flood', a6: 'unauthorized access', a7: 'dump / leak',
    f1: 'collected data up', f2: 'aggregated into platform', f3: 'persist / consume',
    dc3Title: 'IoT DC3 mapping',
    dc3L1: 'single entry dc3-gateway :8000 · two-step login, 12h token · gateway HMAC X-Auth-Sign, constant-time verify at backend',
    dc3L2: 'permission miss = 403 (fail-closed) · cross-tenant = 404 · weak prod key fails startup · TLS mandatory across networks',
    legL1: 'Device layer', legL2: 'Comm layer', legL3: 'Platform layer', legL4: 'Data layer',
    legThreat: 'Threat + fix', legAttack: 'Attack path (dashed)', legFlow: 'Data flow (solid)'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 760">
        <defs>
          <marker id="sec-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="sec-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="sec-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#sec-grid)" height="100%" width="100%"/>

        <text fill="var(--dc3-text2)" font-size="10.5" font-weight="600" x="30" y="52">{{ s.motto }}</text>

        <!-- defense layers (regions) -->
        <rect fill="var(--dc3-region-amber)" height="130" rx="12" stroke="var(--dc3-ext-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="730" x="30" y="70"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="44" y="90">{{ s.l1 }}</text>
        <rect fill="var(--dc3-region-amber)" height="130" rx="12" stroke="var(--dc3-bus-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="730" x="30" y="210"/>
        <text fill="var(--dc3-bus-text)" font-size="10" font-weight="600" x="44" y="230">{{ s.l2 }}</text>
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="730" x="30" y="350"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="44" y="370">{{ s.l3 }}</text>
        <rect fill="var(--dc3-region-be)" height="130" rx="12" stroke="var(--dc3-db-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="730" x="30" y="490"/>
        <text fill="var(--dc3-db-text)" font-size="10" font-weight="600" x="44" y="510">{{ s.l4 }}</text>

        <!-- data flow between layers -->
        <line marker-end="url(#sec-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="90" x2="90" y1="204"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="100" y="224">{{ s.f1 }}</text>
        <line marker-end="url(#sec-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="90" x2="90" y1="344"
              y2="380"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="100" y="364">{{ s.f2 }}</text>
        <line marker-end="url(#sec-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="90" x2="90" y1="484"
              y2="520"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="100" y="504">{{ s.f3 }}</text>

        <!-- attack arrows -->
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="112" y2="100"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="98">{{ s.a1 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="188" y2="160"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="168">{{ s.a2 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="298" y2="250"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="262">{{ s.a3 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="374" y2="320"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="336">{{ s.a4 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="484" y2="400"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="430">{{ s.a5 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="560" y2="440"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="498">{{ s.a6 }}</text>
        <line marker-end="url(#sec-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4"
              stroke-width="1" x1="1056" x2="768" y1="670" y2="560"/>
        <text fill="var(--dc3-rose-stroke)" font-size="7.5" text-anchor="middle" x="905" y="606">{{ s.a7 }}</text>

        <!-- device layer chips -->
        <rect fill="var(--dc3-ext-fill)" height="62" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="200" x="50" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="150" y="134">{{
            s.c11
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="150" y="152">{{ s.c11S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="62" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="200" x="270" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="370" y="134">{{
            s.c12
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="370" y="152">{{ s.c12S }}</text>
        <rect fill="var(--dc3-ext-fill)" height="62" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="200" x="490" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="590" y="134">{{
            s.c13
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="590" y="152">{{ s.c13S }}</text>

        <!-- communication layer chips -->
        <rect fill="var(--dc3-bus-fill)" height="62" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="200" x="50" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="150" y="274">{{
            s.c21
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="150" y="292">{{ s.c21S }}</text>
        <rect fill="var(--dc3-bus-fill)" height="62" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="200" x="270" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="370" y="274">{{
            s.c22
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="370" y="292">{{ s.c22S }}</text>
        <rect fill="var(--dc3-bus-fill)" height="62" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1"
              width="200" x="490" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="590" y="274">{{
            s.c23
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="590" y="292">{{ s.c23S }}</text>

        <!-- platform layer chips -->
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="50" y="390"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="150" y="414">{{
            s.c31
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="150" y="432">{{ s.c31S }}</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="270" y="390"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="370" y="414">{{
            s.c32
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="370" y="432">{{ s.c32S }}</text>
        <rect fill="var(--dc3-be-fill)" height="62" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="200" x="490" y="390"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="590" y="414">{{
            s.c33
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="590" y="432">{{ s.c33S }}</text>

        <!-- data layer chips -->
        <rect fill="var(--dc3-db-fill)" height="62" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="170" x="40" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="125" y="554">{{
            s.c41
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="125" y="572">{{ s.c41S }}</text>
        <rect fill="var(--dc3-db-fill)" height="62" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="170" x="220" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="305" y="554">{{
            s.c42
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="305" y="572">{{ s.c42S }}</text>
        <rect fill="var(--dc3-db-fill)" height="62" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="170" x="400" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="10" font-weight="600" text-anchor="middle" x="485" y="554">{{
            s.c43
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="485" y="572">{{ s.c43S }}</text>
        <rect fill="var(--dc3-db-fill)" height="62" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="170" x="580" y="530"/>
        <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="665" y="554">{{
            s.c44
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="665" y="572">{{ s.c44S }}</text>

        <!-- threat cards -->
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="80"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="104">{{
            s.t1
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="122">{{ s.t1S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="156"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="180">{{
            s.t2
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="198">{{ s.t2S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="266"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="290">{{
            s.t3
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="308">{{ s.t3S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="342"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="366">{{
            s.t4
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="384">{{ s.t4S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="452"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="476">{{
            s.t5
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="494">{{ s.t5S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="528"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="552">{{
            s.t6
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="570">{{ s.t6S }}</text>
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="220" x="1060" y="638"/>
        <text fill="var(--dc3-rose-stroke)" font-size="10.5" font-weight="700" text-anchor="middle" x="1170" y="662">{{
            s.t7
          }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="7.5" text-anchor="middle" x="1170" y="680">{{ s.t7S }}</text>

        <!-- DC3 mapping card -->
        <rect fill="var(--dc3-be-fill)" height="70" rx="8" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="900" x="30" y="648"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="700" x="46" y="670">{{ s.dc3Title }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="46" y="690">{{ s.dc3L1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="46" y="708">{{ s.dc3L2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="950" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="972" y="731">{{ s.legL1 }}</text>
        <rect fill="var(--dc3-bus-fill)" height="11" rx="2" stroke="var(--dc3-bus-stroke)" stroke-width="1" width="16"
              x="1050" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1072" y="731">{{ s.legL2 }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="1140" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="1162" y="731">{{ s.legThreat }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="30" x2="60" y1="727"
              y2="727"/>
        <text fill="var(--dc3-text2)" font-size="9" x="66" y="731">{{ s.legAttack }}</text>
        <line stroke="var(--dc3-arrow)" stroke-width="1.2" x1="200" x2="230" y1="727" y2="727"/>
        <text fill="var(--dc3-text2)" font-size="9" x="236" y="731">{{ s.legFlow }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="370" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="392" y="731">{{ s.legL3 }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="480" y="722"/>
        <text fill="var(--dc3-text2)" font-size="9" x="502" y="731">{{ s.legL4 }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
