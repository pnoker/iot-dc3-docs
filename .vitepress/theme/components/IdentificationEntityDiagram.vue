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
    aria: '实体标识关系：左侧物理标识体系（物理对象、标签载体、EPC 全局唯一编码、读写器），右侧 DC3 数字身份（租户 tenantId 划定归属、设备 deviceId 唯一标识、模板、位号与业务数据），协议驱动把现场读取接入并登记为带租户归属的设备',
    regionPhy: '物理标识体系 · EPC / RFID',
    regionDc3: 'IoT DC3 数字身份 · 归属与隔离',
    obj: '物理对象', objSub: '商品 / 资产 / 现场设备',
    tag: '标签 / 铭牌', tagSub: 'RFID · 条码 · 二维码',
    epc: 'EPC 全局唯一编码', epcSub: '版本 | 厂商前缀 | 对象分类 | 序列号',
    reader: '读写器 / 扫码终端', readerSub: '供能 + 收发',
    bridge: '协议驱动', bridgeSub: '采集 / 上报',
    tenant: '租户 Tenant', tenantSub: 'tenantId · 归属与隔离边界',
    device: '设备 Device', deviceSub: 'deviceId · 平台内唯一',
    profile: '模板 Profile', profileSub: '能力模板 · profileId',
    point: '位号 Point', pointSub: 'unit · rwFlag · 换算',
    data: '业务数据', dataSub: '位号值 / 命令 / 事件',
    e1: '贴附 1 : 1', e2: '承载 ID', e3: '读取 · 无需视线',
    e4: '数据接入', e5: '登记身份 / 归属',
    e6: '1 : N 归属', e7: 'N : 1 绑定', e8: '1 : N 拥有', e9: '1 : N 落库',
    e10: 'tenantId 贯穿校验', e11: '同一标识思想',
    epcNote: '先有全局唯一 ID，物才能被全网追踪（EPCglobal 发现服务）',
    iso1: '每条业务记录都带 tenantId —— requireTenant() / filterTenant() 在控制器层校验',
    iso2: '跨租户访问返回 404（「不存在」，而非 403，避免泄露资源是否存在）',
    legPhy: '物理世界载体', legId: '标识 / 设备', legTenant: '租户边界',
    legModel: '模板 / 数据', legData: '业务数据', legDash: '标识思想 / 隔离校验'
  },
  en: {
    aria: 'Entity identification relations: on the left the physical identification system (physical object, tag carrier, globally unique EPC code, reader); on the right the DC3 digital identity (tenant tenantId for ownership, device deviceId as unique id, profile, point and business data); protocol drivers ingest field reads and register them as tenant-scoped devices',
    regionPhy: 'Physical identification · EPC / RFID',
    regionDc3: 'IoT DC3 digital identity · ownership & isolation',
    obj: 'Physical object', objSub: 'goods / asset / field device',
    tag: 'Tag / nameplate', tagSub: 'RFID · barcode · QR',
    epc: 'EPC unique code', epcSub: 'version | maker prefix | class | serial',
    reader: 'Reader / scanner', readerSub: 'power + transceive',
    bridge: 'Protocol driver', bridgeSub: 'collect / report',
    tenant: 'Tenant', tenantSub: 'tenantId · ownership boundary',
    device: 'Device', deviceSub: 'deviceId · unique in platform',
    profile: 'Profile', profileSub: 'capability template · profileId',
    point: 'Point', pointSub: 'unit · rwFlag · scaling',
    data: 'Business data', dataSub: 'point value / command / event',
    e1: 'attach 1 : 1', e2: 'carries ID', e3: 'read · no line-of-sight',
    e4: 'data ingest', e5: 'register identity / owner',
    e6: '1 : N ownership', e7: 'N : 1 binding', e8: '1 : N has', e9: '1 : N persisted',
    e10: 'tenantId checked throughout', e11: 'same identity idea',
    epcNote: 'a globally unique ID first, then the object can be tracked network-wide (EPCglobal discovery)',
    iso1: 'every business row carries tenantId — requireTenant() / filterTenant() at the controller layer',
    iso2: 'cross-tenant access returns 404 ("not found", not 403, to avoid leaking existence)',
    legPhy: 'Physical carrier', legId: 'Identity / device', legTenant: 'Tenant boundary',
    legModel: 'Template / data', legData: 'Business data', legDash: 'Identity idea / tenant check'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1320 560">
        <defs>
          <marker id="ide-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0,10 3.5,0 7"/>
          </marker>
          <marker id="ide-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0,10 3.5,0 7"/>
          </marker>
          <pattern id="ide-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#ide-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-amber)" height="400" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="540" x="30" y="70"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="44" y="90">{{ s.regionPhy }}</text>
        <rect fill="var(--dc3-region-be)" height="400" rx="12" stroke="var(--dc3-be-stroke)"
              stroke-dasharray="6,3" stroke-width="1" width="590" x="700" y="70"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="714" y="90">{{ s.regionDc3 }}</text>

        <!-- edges: physical chain -->
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="125" x2="125" y1="172"
              y2="206"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="133" y="194">{{ s.e1 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="204" x2="236" y1="240"
              y2="240"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="220" y="232">{{ s.e2 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="125" x2="125" y1="318"
              y2="274"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="133" y="300">{{ s.e3 }}</text>

        <!-- edges: bridge into DC3 -->
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="204" x2="581" y1="350"
              y2="296"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="350" y="316">{{ s.e4 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="695" x2="928" y1="280"
              y2="182"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="780" y="212">{{ s.e5 }}</text>

        <!-- edge: same identity idea (dashed rose) -->
        <line marker-end="url(#ide-ah-rose)" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4"
              stroke-width="1" x1="572" x2="714" y1="240" y2="180"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="595" y="196">{{ s.e11 }}</text>

        <!-- edges: DC3 relations -->
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="884" x2="916" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="872" y="132">{{ s.e6 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1094" x2="1126" y1="142"
              y2="142"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1092" y="132">{{ s.e7 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1005" x2="1005" y1="178"
              y2="256"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1013" y="222">{{ s.e8 }}</text>
        <line marker-end="url(#ide-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="1094" x2="1126" y1="292"
              y2="292"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="1092" y="282">{{ s.e9 }}</text>
        <path d="M 800 178 L 800 292 L 916 292" fill="none" marker-end="url(#ide-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="0.9"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="808" y="284">{{ s.e10 }}</text>

        <!-- physical nodes -->
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="50" y="112"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="125" y="136">{{
            s.obj
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="125" y="154">{{ s.objSub }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="50" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="125" y="234">{{
            s.tag
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="125" y="252">{{ s.tagSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="300" x="240" y="210"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="390" y="234">{{
            s.epc
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="390" y="252">{{ s.epcSub }}</text>
        <text fill="var(--dc3-text2)" font-size="8" x="246" y="300">{{ s.epcNote }}</text>
        <rect fill="var(--dc3-ext-fill)" height="60" rx="6" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="50" y="320"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="125" y="344">{{
            s.reader
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="125" y="362">{{ s.readerSub }}</text>

        <!-- bridge node -->
        <rect fill="var(--dc3-bus-fill)" height="70" rx="6" stroke="var(--dc3-bus-stroke)" stroke-width="1.5"
              width="110" x="585" y="250"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="600" text-anchor="middle" x="640" y="278">{{
            s.bridge
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="640" y="296">{{ s.bridgeSub }}</text>

        <!-- DC3 nodes -->
        <rect fill="var(--dc3-rose-fill)" height="64" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1.5"
              width="160" x="720" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="800" y="134">{{
            s.tenant
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="800" y="152">{{ s.tenantSub }}</text>
        <rect fill="var(--dc3-fe-fill)" height="64" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1.5"
              width="170" x="920" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1005" y="134">{{
            s.device
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1005" y="152">{{ s.deviceSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="150" x="1130" y="110"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1205" y="134">{{
            s.profile
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1205" y="152">{{ s.profileSub }}</text>
        <rect fill="var(--dc3-db-fill)" height="64" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1"
              width="170" x="920" y="260"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1005" y="284">{{
            s.point
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1005" y="302">{{ s.pointSub }}</text>
        <rect fill="var(--dc3-be-fill)" height="64" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1"
              width="150" x="1130" y="260"/>
        <text fill="var(--dc3-box-name)" font-size="11" font-weight="600" text-anchor="middle" x="1205" y="284">{{
            s.data
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1205" y="302">{{ s.dataSub }}</text>

        <!-- isolation note -->
        <rect fill="var(--dc3-rose-fill)" height="56" rx="8" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="560" x="720" y="360"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" x="734" y="382">{{ s.iso1 }}</text>
        <text fill="var(--dc3-rose-stroke)" font-size="8.5" font-weight="600" x="734" y="400">{{ s.iso2 }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-ext-fill)" height="11" rx="2" stroke="var(--dc3-ext-stroke)" stroke-width="1" width="16"
              x="40" y="505"/>
        <text fill="var(--dc3-text2)" font-size="9" x="62" y="514">{{ s.legPhy }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="185" y="505"/>
        <text fill="var(--dc3-text2)" font-size="9" x="207" y="514">{{ s.legId }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="16" x="330" y="505"/>
        <text fill="var(--dc3-text2)" font-size="9" x="352" y="514">{{ s.legTenant }}</text>
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="490" y="505"/>
        <text fill="var(--dc3-text2)" font-size="9" x="512" y="514">{{ s.legModel }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="640" y="505"/>
        <text fill="var(--dc3-text2)" font-size="9" x="662" y="514">{{ s.legData }}</text>
        <line stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,4" stroke-width="1" x1="790" x2="820" y1="510"
              y2="510"/>
        <text fill="var(--dc3-text2)" font-size="9" x="826" y="514">{{ s.legDash }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
