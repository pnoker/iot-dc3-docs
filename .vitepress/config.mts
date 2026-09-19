/*
 * Copyright 2016-present the IoT DC3 original author or authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {defineConfig} from 'vitepress'
import {Lang, t} from './i18n'
import {transformHead} from './seo.mts'
import {resolveVersion} from './version.mts'
import {assertHeadingParity, assertLocaleParity, assertMarkdownHygiene, assertSidebarRegistersAllPages, SRC_EXCLUDE} from './sidebar-check.mts'

const versionInfo = resolveVersion()

// ── Nav brand title — same capsule pattern as iot-dc3-online / iot-dc3-book:
// main title + spark + AGENTIC badge on the first line, slogan on the second.
// VitePress renders siteTitle via v-html; .dc3-brand-a11y carries the full
// text for screen readers. ──
const BRAND_SPARK = '<svg class="dc3-brand-spark" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 .8c.35 3.05 2.15 4.85 5.2 5.2C8.15 6.35 6.35 8.15 6 11.2 5.65 8.15 3.85 6.35.8 6 3.85 5.65 5.65 3.85 6 .8Z"/></svg>'

const navSiteTitle = ({title, signal, accessible}: { title: string; signal: string; accessible: string }) =>
    `<span class="dc3-brand-copy" aria-hidden="true"><span class="dc3-brand-title"><strong>${title}</strong>${BRAND_SPARK}<span class="dc3-brand-agentic">AGENTIC</span></span><span class="dc3-brand-signal">${signal}</span></span><span class="dc3-brand-a11y">${accessible}</span>`

const NAV_SITE_TITLE = {
    zh: navSiteTitle({
        title: 'IoT DC3',
        signal: '感知、推理、行动、进化',
        accessible: 'IoT DC3，AGENTIC：感知、推理、行动、进化'
    }),
    en: navSiteTitle({
        title: 'IoT DC3',
        signal: 'Sense · Reason · Act · Evolve',
        accessible: 'IoT DC3, AGENTIC: Sense, Reason, Act, Evolve'
    })
} as const

// demo 入口：作者指定的多彩「应用窗口」图标（iconfont 导出；彩色块保留原配色，
// 无 fill 的黑色细节路径用 currentColor 跟随明暗主题）
const DEMO_ICON = '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M843.440552 844.747034c27.842207 3.442759 51.67669-37.693793 62.640551-63.735172 12.499862-29.678345 14.494897-62.569931 16.331035-94.737655 15.39531-270.071172 17.778759-279.022345 11.970207-308.25931-4.325517-21.768828-14.918621-43.166897-33.050483-55.984552-22.333793-15.783724-51.694345-16.172138-79.024552-15.960276l-551.953655 4.254897c-35.716414 0.282483-73.516138 1.129931-103.759448 20.144551-11.881931 7.485793-22.898759 22.775172-15.165793 34.480552 5.561379 8.386207 17.302069 9.25131 27.365517 9.25131l470.686897 0.141242c24.61131 0 51.67669 3.124966 75.917241-0.900414 21.186207-3.531034 44.738207-12.393931 66.365793-7.044414 21.327448 5.296552 36.299034 25.6 41.683862 46.892138 3.760552 14.900966 3.531034 30.190345 2.52469 45.409103-0.759172 11.369931 1.765517 20.656552 2.295172 31.779311 1.112276 24.293517 0.953379-17.196138-14.477241 293.323034-0.847448 16.896-4.625655 44.667586 10.24 56.955587 18.39669 15.183448 62.569931-24.152276 73.127724-38.929656 29.131034-40.712828 13.382621-95.126069 27.012414-141.629793" fill="#BAE113"></path><path d="M579.230897 806.470621l-392.933518-22.545655c-15.006897-0.865103-26.871172-15.483586-27.047724-33.350621l-2.824827-287.267311c-0.176552-18.820414 12.605793-34.180414 28.424827-34.180413h400.719448c15.889655 0 28.724966 15.518897 28.424828 34.427586l-4.961103 309.812965c-0.317793 19.032276-13.78869 34.021517-29.801931 33.103449z" fill="#B0A2FE"></path><path d="M747.802483 612.246069h-51.976828a25.370483 25.370483 0 0 1-25.388138-25.370483v-131.177931c0-14.000552 11.369931-25.370483 25.388138-25.370483h51.976828c14.018207 0 25.370483 11.369931 25.370483 25.388138v131.160276c0 14.000552-11.352276 25.370483-25.370483 25.370483z" fill="#F8D11C"></path><path d="M712.615724 746.831448m-72.033103 0a72.033103 72.033103 0 1 0 144.066207 0 72.033103 72.033103 0 1 0-144.066207 0Z" fill="#FF624C"></path><path fill="currentColor" d="M509.44 314.91531l111.969103-159.955862a8.827586 8.827586 0 1 0-14.477241-10.134069l-111.969103 159.955862a8.827586 8.827586 0 1 0 14.477241 10.134069zM455.980138 300.190897a8.827586 8.827586 0 1 0 12.305655-12.641104l-139.917241-136.209655a8.827586 8.827586 0 1 0-12.305655 12.641103z"></path><path fill="currentColor" d="M875.961379 306.193655l-298.478345 0.176552c-4.872828 0-0.423724 3.778207-0.423724 8.651034s3.954759 8.827586 8.827587 8.827587h290.074482c26.306207 0 49.69931 11.687724 49.257931 38.647172-7.891862 418.498207-5.296552 396.093793-12.446896 411.965793-10.946207 24.046345-31.073103 36.722759-76.340966 72.174345 1.341793-10.169379 0.388414-8.121379 8.827586-431.404138a55.172414 55.172414 0 0 0-55.207724-56.249379H549.481931a8.827586 8.827586 0 1 0 0 17.655172h240.569379c20.95669 0 37.940966 17.125517 37.534897 38.258759l-8.086069 425.295448a37.517242 37.517242 0 0 1-39.353379 36.775724L139.087448 846.035862a37.587862 37.587862 0 0 1-35.716414-37.075862l-4.590344-394.345931a36.89931 36.89931 0 0 1 15.483586-30.68469c20.215172-11.069793-9.321931-6.249931 255.311448-7.291586a8.827586 8.827586 0 1 0 0-17.655172H155.365517c52.965517-33.844966 66.983724-37.128828 131.407449-35.486897 26.323862 0.670897 15.183448 0.176552 122.032551 0.353104 4.872828 0 8.827586-3.937103 8.827586-8.827587s4.961103-8.297931 0.088276-8.297931c-122.262069-0.706207-107.625931-0.282483-130.489379-0.882758-29.042759-0.759172-61.899034-1.588966-90.112 10.028138-33.809655 13.841655-68.13131 41.136552-97.562483 56.090482-4.413793 2.242207-18.679172 22.898759-18.432 42.866759l4.590345 394.345931a55.260414 55.260414 0 0 0 52.541793 54.501517l641.059311 30.931862c30.366897 1.447724 59.921655-28.63669 94.614068-54.801655 20.338759-15.342345 43.378759-32.73269 54.907587-58.050207 9.145379-20.232828 6.161655-1.235862 14.035862-418.921931 0.582621-37.181793-30.366897-56.637793-66.913104-56.637793z"></path><path fill="currentColor" d="M251.533241 530.767448a8.827586 8.827586 0 0 0 8.827587 8.827586h225.933241a8.827586 8.827586 0 1 0 0-17.655172H260.360828a8.827586 8.827586 0 0 0-8.827587 8.827586zM486.294069 605.519448H260.360828a8.827586 8.827586 0 1 0 0 17.655173h225.933241a8.827586 8.827586 0 1 0 0-17.655173zM486.294069 689.099034H260.360828a8.827586 8.827586 0 1 0 0 17.655173h225.933241a8.827586 8.827586 0 1 0 0-17.655173zM689.081379 797.060414c-13.894621-4.943448-24.011034-13.523862-27.771586-23.48138a8.845241 8.845241 0 0 0-16.525241 6.179311c7.627034 20.356414 27.330207 29.996138 38.382345 33.933241 78.865655 28.089379 141.718069-52.841931 80.754758-118.836965-36.493241-39.547586-94.984828-18.749793-99.928276 28.530758-1.553655 14.900966 4.096 29.607724 14.759724 38.36469 15.924966 13.117293 59.409655 17.725793 54.607449-0.741517a8.827586 8.827586 0 0 0-10.752-6.338207c-9.498483 2.471724-25.652966-0.794483-32.644414-6.532414-6.038069-4.978759-9.357241-13.982897-8.421517-22.916414 3.513379-33.350621 43.943724-45.974069 69.420138-18.396689 49.099034 53.21269-1.977379 111.527724-61.863725 90.235586z"></path><path d="M617.366069 146.361379m-17.019586 0a17.019586 17.019586 0 1 0 34.039172 0 17.019586 17.019586 0 1 0-34.039172 0Z" fill="#BAE113"></path><path d="M561.611034 347.136c41.666207-2.577655 33.809655-31.70869 0.635587-58.085517a99.539862 99.539862 0 0 0-48.286897-20.833104c-68.396138-9.216-134.002759 56.072828-96.979862 71.379862 9.710345 4.025379 22.139586 3.495724 32.485517 4.360828 33.933241 2.877793 75.581793 5.437793 112.145655 3.177931z" fill="#FF624C"></path><path d="M319.240828 153.953103m-17.019587 0a17.019586 17.019586 0 1 0 34.039173 0 17.019586 17.019586 0 1 0-34.039173 0Z" fill="#BAE113"></path></svg>'

// 微信公众号：官方双气泡标识（simple-icons），currentColor 跟随圆钮品牌绿；
// viewBox 四周各留 3（30×30，图形占比 80%），与同排 ~15px 字形图标视觉一致
const WECHAT_ICON = '<svg viewBox="-3 -3 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>'

// ── i18n via locales/{lang}.json ──
// All user-facing strings are resolved through t(lang, key).
// Adding a language: create locales/<lang>.json, add to Lang type and VitePress locales block.
// Entry: [code] — code doubles as the i18n key. Code = language-relative path; single segment → directory index.
// Every published page under zh/ and en/ must appear in some group below — the
// build-time guard in sidebar-check.mts fails dev/build on an unregistered page.
type Entry = readonly [string]
type Group = { key: string; items: ReadonlyArray<Entry> }
type Pillar = {
    navKey: string
    landing: string
    paths: ReadonlyArray<string>
    activeMatch?: string
    groups: ReadonlyArray<Group>
}

// Pillar order: 架构 → 驱动 → AI → 基础 → 开发 (after nav 首页)
// Overview is absorbed into Architecture (project-overview group); Operations is
// absorbed into Develop; AI stands alone — the consolidated 5-pillar design.
const PILLARS: ReadonlyArray<Pillar> = [
    {   // ① 架构(吸收总览:introduction 系列 + quickstart 概念在此安家)
        navKey: 'pillar.architecture', landing: 'architecture',
        paths: ['architecture', 'modules', 'introduction'],
        activeMatch: '^/(zh|en)/(architecture|modules|introduction)/',
        groups: [
            {
                key: 'group.project-overview',
                items: [['architecture'], ['introduction'], ['introduction/concepts'], ['introduction/paths'], ['introduction/concepts/tenant']]
            },
            {
                key: 'group.objects-data',
                items: [['introduction/concepts/profile'], ['introduction/concepts/device'], ['introduction/concepts/driver'], ['introduction/concepts/point'], ['introduction/concepts/point-value']]
            },
            {
                key: 'group.capabilities-boundaries',
                items: [['introduction/concepts/command'], ['introduction/concepts/event'], ['introduction/concepts/attribute-config']]
            },
            {key: 'group.services-collab', items: [['architecture/services'], ['architecture/facade-modes']]},
            {
                key: 'group.pipelines-model',
                items: [['architecture/data-plane'], ['architecture/command-plane'], ['architecture/mq-topology'], ['architecture/auth-rbac'], ['architecture/domain-model']]
            },
            {key: 'group.modules', items: [['architecture/modules'], ['modules']]},
            {key: 'group.appendix', items: [['introduction/glossary'], ['introduction/license']]}
        ]
    },
    {   // ② 驱动
        navKey: 'pillar.drivers', landing: 'drivers',
        paths: ['drivers', 'operation/device-onboarding'],
        activeMatch: '^/(zh|en)/(drivers/|operation/device-onboarding)',
        groups: [
            {key: 'group.onboarding', items: [['drivers'], ['operation/device-onboarding']]},
            {
                key: 'group.industrial-bus',
                items: [['drivers/modbus-tcp'], ['drivers/modbus-rtu'], ['drivers/opc-ua'], ['drivers/opc-da'], ['drivers/plcs7'], ['drivers/melsec'], ['drivers/fins'], ['drivers/ethernet-ip']]
            },
            {
                key: 'group.scada-power',
                items: [['drivers/bacnet-ip'], ['drivers/knx'], ['drivers/iec104'], ['drivers/dnp3'], ['drivers/iec61850'], ['drivers/dlms'], ['drivers/dlt645'], ['drivers/mbus'], ['drivers/sl651'], ['drivers/snmp']]
            },
            {
                key: 'group.iot-wireless',
                items: [['drivers/mqtt'], ['drivers/coap'], ['drivers/lwm2m'], ['drivers/http'], ['drivers/ble'], ['drivers/zigbee'], ['drivers/can'], ['drivers/lorawan'], ['drivers/kafka']]
            },
            {key: 'group.serial-network', items: [['drivers/serial'], ['drivers/tcp-udp']]},
            {
                key: 'group.database',
                items: [['drivers/mysql'], ['drivers/postgresql'], ['drivers/oracle'], ['drivers/sqlserver'], ['drivers/redis']]
            },
            {key: 'group.virtual-test', items: [['drivers/virtual'], ['drivers/listening-virtual']]},
            {key: 'group.appendix-drivers', items: [['drivers/matrix']]}
        ]
    },
    {   // ③ AI(从开发提取为独立顶级 pillar)
        navKey: 'pillar.ai',
        landing: 'ai',
        paths: ['ai'],
        activeMatch: '^/(zh|en)/ai/',
        groups: [
            {key: 'group.ai-integration', items: [['ai'], ['ai/agentic'], ['ai/mcp'], ['ai/spring-ai-deep-dive']]}
        ]
    },
    {   // ④ 基础
        navKey: 'pillar.foundations', landing: 'foundations',
        paths: ['foundations'], activeMatch: '^/(zh|en)/foundations/',
        groups: [
            {key: 'group.overview', items: [['foundations']]},
            {key: 'group.perception', items: [['foundations/sensing'], ['foundations/identification']]},
            {key: 'group.network', items: [['foundations/fieldbus'], ['foundations/iot-protocols']]},
            {key: 'group.platform', items: [['foundations/edge-cloud'], ['foundations/data-pipeline']]},
            {key: 'group.application', items: [['foundations/aiot']]},
            {key: 'group.security', items: [['foundations/security']]}
        ]
    },
    {   // ⑤ 开发(吸收运维:quickstart → 部署运维 → 开发 → 前端 → 自动化 → 运营)
        navKey: 'pillar.develop',
        landing: 'development',
        paths: ['development', 'frontend', 'automation', 'quickstart', 'operation', 'guide'],
        activeMatch: '^/(zh|en)/(development|frontend|automation|quickstart|operation|guide)/',
        groups: [
            // The pillar landing must be the FIRST entry of the FIRST group —
            // every other pillar works this way, so clicking the header menu
            // always lands on the top of its sidebar.
            {key: 'group.overview', items: [['development']]},
            {key: 'group.quickstart', items: [['quickstart'], ['quickstart/environment'], ['quickstart/first-device']]},
            {
                key: 'group.deploy-ops',
                items: [['guide'], ['guide/usage'], ['guide/deployment'], ['guide/observability'], ['guide/logging'], ['guide/troubleshooting']]
            },
            {
                key: 'group.development',
                items: [['development/driver-authoring'], ['development/api-documentation'], ['development/technology-stack'], ['development/testing'], ['development/changelog']]
            },
            {key: 'group.frontend', items: [['frontend'], ['frontend/test-debugging']]},
            {key: 'group.automation', items: [['automation'], ['automation/cli']]},
            {key: 'group.operations', items: [['operation'], ['operation/data-commands'], ['operation/console-devices'], ['operation/console-entities'], ['operation/console-identity'], ['operation/console-organize'], ['operation/console-alarms'], ['operation/console-mcp'], ['operation/alarms']]}
        ]
    }
]

const COMMUNITY: ReadonlyArray<Entry> = [
    ['community/contributing'],
    ['community/code-of-conduct'],
    ['community/security'],
    ['community/faq']
]

// ── Header social icon set (website / demo / github / gitee / x / WeChat) ──
// ariaLabel doubles as the hover tooltip text (style.css renders attr(aria-label)).
// The WeChat icon has no landing page: click opens the QR modal injected by
// theme/index.ts (no-JS fallback opens the image in a new tab); hover pops a QR card.
const DC3_SITE_ICON = '<svg role="img" viewBox="0 0 1066 1024" xmlns="http://www.w3.org/2000/svg"><path d="M655.50856 261.369368a20.108601 20.108601 0 1 0 0-40.222508 20.108601 20.108601 0 0 0 0 40.222508M610.044021 226.394197a25.355938 25.355938 0 1 0 0-50.711876 25.355938 25.355938 0 0 0 0 50.711876M628.794363 292.121202a23.997679 23.997679 0 1 0 0 47.995358 23.997679 23.997679 0 0 0 0-47.995358M546.646218 193.965762a27.902674 27.902674 0 1 0 0-55.805347 27.902674 27.902674 0 0 0 0 55.805347M537.026984 281.483275a27.907979 27.907979 0 1 0 55.815959 0 27.907979 27.907979 0 0 0-55.815959 0M616.808788 436.176249a27.907979 27.907979 0 1 0 0-55.815959 27.907979 27.907979 0 0 0 0 55.815959M465.325762 175.677016a32.354155 32.354155 0 1 0 0-64.703006 32.354155 32.354155 0 0 0 0 64.703006M566.754819 385.533347a32.34885 32.34885 0 1 0-64.6977 0 32.34885 32.34885 0 1 0 64.703005 0M450.90487 257.947192a32.34885 32.34885 0 1 0 64.703006 0 32.354155 32.354155 0 1 0-64.703006 0M365.647585 175.677016a37.527212 37.527212 0 1 0-0.010611-75.054425 37.527212 37.527212 0 0 0 0.010611 75.054425M345.613264 252.264788a37.527212 37.527212 0 1 0 75.049119-0.005306 37.527212 37.527212 0 0 0-75.049119 0M435.873824 342.838383a37.527212 37.527212 0 1 0 0 75.04912 37.527212 37.527212 0 0 0 0-75.04912M249.351959 201.032953a43.278591 43.278591 0 0 0 43.27859-43.283896 43.278591 43.278591 0 0 0-43.27859-43.278591 43.278591 43.278591 0 1 0 0 86.562487M224.431088 272.84029a43.283896 43.283896 0 1 0 43.278591-43.283896 43.283896 43.283896 0 0 0-43.278591 43.283896M276.458777 401.376166a43.283896 43.283896 0 1 0 86.567793 0 43.283896 43.283896 0 0 0-86.567793 0M140.489617 379.049782c28.475689 0 51.560788-23.079793 51.560787-51.560787 0-28.475689-23.085098-51.560788-51.560787-51.560788s-51.560788 23.085098-51.560788 51.560788 23.079793 51.560788 51.560788 51.560787M192.050404 402.686674c-28.480995 0-51.566093 23.085098-51.566093 51.560787s23.085098 51.571399 51.560787 51.571399 51.571399-23.09571 51.571399-51.571399c0-28.475689-23.090404-51.560788-51.571399-51.560787M61.758342 490.676394C28.279378 490.676394 1.13542 517.820352 1.13542 551.304622c0 33.489575 27.143959 60.633534 60.633533 60.633533 33.489575 0 60.633534-27.143959 60.633534-60.633533 0-33.478964-27.143959-60.628228-60.633534-60.628228M294.943834 553.03428a20.108601 20.108601 0 1 0-34.948642 19.901679 20.108601 20.108601 0 0 0 34.948642-19.901679M252.47171 600.371731a25.361244 25.361244 0 1 0 25.095958 44.063834 25.361244 25.361244 0 0 0-25.095958-44.063834M367.616 569.996601a23.997679 23.997679 0 1 0-23.743005-41.702798 23.997679 23.997679 0 0 0 23.743005 41.702798M279.822591 719.044311a27.902674 27.902674 0 1 0-27.626778-48.494093 27.907979 27.907979 0 0 0 27.621472 48.494093M333.001617 635.590964a27.907979 27.907979 0 1 0 48.494093-27.621472 27.907979 27.907979 0 0 0-48.494093 27.621472M427.925886 489.700145a27.902674 27.902674 0 1 0 27.626777 48.494093 27.902674 27.902674 0 1 0-27.626777-48.494093M314.617368 760.699358a32.34885 32.34885 0 1 0-56.219192 32.025202 32.34885 32.34885 0 0 0 56.219192-32.025202M478.786321 624.915896a32.364767 32.364767 0 0 0-32.025202-56.224497 32.359461 32.359461 0 0 0 32.030508 56.224497M393.242528 732.515482a32.354155 32.354155 0 1 0-32.035813-56.224498 32.354155 32.354155 0 0 0 32.035813 56.224498M363.955067 847.314902a37.527212 37.527212 0 1 0-65.212352 37.145202 37.527212 37.527212 0 0 0 65.207047-37.145202M440.420808 826.813679a37.527212 37.527212 0 1 0-37.150507-65.212353 37.527212 37.527212 0 0 0 37.150507 65.212353M525.625036 717.587244a37.527212 37.527212 0 1 0-37.145202-65.207047 37.527212 37.527212 0 0 0 37.139897 65.207047M384.519959 919.62628a43.283896 43.283896 0 1 0 42.854134 75.218901 43.283896 43.283896 0 0 0-42.854134-75.218901M475.433119 846.704746a43.283896 43.283896 0 1 0 42.848829 75.224207 43.283896 43.283896 0 0 0-42.848829-75.224207M604.213057 813.098446a43.283896 43.283896 0 1 0-42.854135-75.224208 43.283896 43.283896 0 0 0 42.854135 75.224208M581.791171 923.011316c-24.740477 14.091938-33.37285 45.581264-19.286218 70.321741 14.097244 24.745782 45.581264 33.378155 70.327047 19.280912 24.740477-14.091938 33.37285-45.575959 19.286218-70.321741-14.097244-24.745782-45.58657-33.37285-70.327047-19.280912M666.417078 815.470093c-24.745782 14.091938-33.378155 45.575959-19.286218 70.321741 14.097244 24.745782 45.575959 33.378155 70.327047 19.280912 24.740477-14.091938 33.37285-45.581264 19.280912-70.321741-14.091938-24.745782-45.581264-33.378155-70.327047-19.280912M810.748021 872.755731c-29.096456 16.575005-39.246259 53.59287-22.671254 82.689326 16.575005 29.096456 53.587565 39.246259 82.694632 22.671254 29.09115-16.575005 39.246259-53.598176 22.671254-82.689327-16.575005-29.09115-53.603482-39.251565-82.694632-22.671253M754.560663 714.566301a20.108601 20.108601 0 1 0-20.002487 34.895585 20.108601 20.108601 0 0 0 20.002487-34.895585M789.456249 734.568788a25.361244 25.361244 0 1 0 25.217989-44.005472 25.361244 25.361244 0 0 0-25.217989 44.005472M704.830342 650.781181a23.997679 23.997679 0 1 0-23.875648 41.63913 23.997679 23.997679 0 0 0 23.875648-41.633824M850.057948 699.169161a27.907979 27.907979 0 1 0 27.75942-48.414508 27.907979 27.907979 0 0 0-27.75942 48.414508M768.583627 609.216332a27.902674 27.902674 0 1 0-27.748808 48.419813 27.902674 27.902674 0 1 0 27.748808-48.419813M605.030135 639.602073a27.902674 27.902674 0 1 0 27.748808-48.414814 27.902674 27.902674 0 1 0-27.748808 48.414814M940.185865 587.643358a32.34885 32.34885 0 1 0-32.173761 56.1343 32.34885 32.34885 0 0 0 32.173761-56.1343M651.539896 539.112124a32.34885 32.34885 0 0 0 11.985576 44.154031 32.34885 32.34885 0 1 0 32.173761-56.1343 32.354155 32.354155 0 0 0-44.159337 11.980269M799.653803 602.334839a32.354155 32.354155 0 1 0 32.173762-56.139606 32.354155 32.354155 0 0 0-32.173762 56.134301M996.813596 499.245098a37.516601 37.516601 0 0 0-51.210612 13.895627 37.527212 37.527212 0 1 0 51.210612-13.895627M851.798218 522.781181a37.527212 37.527212 0 1 0 37.32029-65.111544 37.527212 37.527212 0 0 0-37.32029 65.111544M714.438964 504.837306a37.516601 37.516601 0 0 0 51.205305-13.895627 37.527212 37.527212 0 1 0-51.210611 13.895627M1040.500725 383.602073a43.283896 43.283896 0 1 0-43.039834 75.107481 43.283896 43.283896 0 0 0 43.04514-75.102176M888.476518 417.40999a43.289202 43.289202 0 1 0 43.050446-75.112788 43.289202 43.289202 0 0 0-43.050446 75.112788M810.164394 382.599295a43.283896 43.283896 0 1 0-75.102176-43.04514 43.283896 43.283896 0 0 0 75.102176 43.04514M900.218031 287.038342c24.703337 14.155606 56.213886 5.608124 70.374798-19.100518 14.166218-24.703337 5.608124-56.20858-19.100518-70.369492-24.703337-14.166218-56.213886-5.61343-70.374798 19.089906-14.160912 24.708642-5.608124 56.213886 19.100518 70.374798M815.883938 179.268974c-24.708642-14.166218-56.219192-5.61343-70.380104 19.095213-14.166218 24.703337-5.608124 56.20858 19.095213 70.369492 24.708642 14.166218 56.219192 5.61343 70.380103-19.089907 14.160912-24.708642 5.608124-56.213886-19.100518-70.374798M740.670342 115.303461c29.05401 16.659896 66.10371 6.60029 82.752995-22.45372s6.60029-66.098404-22.45372-82.752995c-29.048705-16.649285-66.109016-6.60029-82.74769 22.45372-16.659896 29.048705-6.605596 66.109016 22.443109 82.752995" fill="#1296db"/></svg>'

const socialLinks = (lang: Lang) => [
    {
        icon: {svg: DC3_SITE_ICON},
        link: 'https://dc3.site',
        ariaLabel: lang === 'en' ? 'IoT DC3 website' : 'IoT DC3 主网站'
    },
    {
        icon: {svg: DEMO_ICON},
        link: 'https://demo.dc3.site',
        ariaLabel: lang === 'en' ? 'IoT DC3 live demo' : 'IoT DC3 在线 Demo'
    },
    {icon: 'github', link: 'https://github.com/pnoker/iot-dc3', ariaLabel: 'GitHub'},
    {icon: 'gitee', link: 'https://gitee.com/pnoker/iot-dc3', ariaLabel: 'Gitee'},
    {icon: 'x', link: 'https://x.com/IoTDC3', ariaLabel: 'X'},
    {
        icon: {svg: WECHAT_ICON},
        link: '/images/wechat-qrcode.jpg',
        ariaLabel: lang === 'en' ? 'WeChat Official Account' : '微信公众号'
    }
]

type SidebarItem = { text: string; link: string }
type SidebarGroup = { text: string; collapsed?: boolean; items: SidebarItem[] }

const linkOf = (lang: Lang, code: string) => {
    const p = lang === 'en' ? '/en' : '/zh'
    return code.includes('/') ? `${p}/${code}` : `${p}/${code}/`
}

const itemsOf = (lang: Lang, entries: ReadonlyArray<Entry>): SidebarItem[] =>
    entries.map(([code]) => ({text: t(lang, code), link: linkOf(lang, code)}))

// All groups are expanded by default (maintainer preference: the full outline
// stays visible; tall sections simply scroll). VitePress still lets readers
// fold groups manually and auto-expands the group holding the active link.
// The community section stays a single always-open group (4 items).
function buildSidebar(lang: Lang) {
    const p = lang === 'en' ? '/en' : '/zh'
    const sidebar: Record<string, SidebarGroup[]> = {}
    for (const pillar of PILLARS) {
        const groups: SidebarGroup[] = pillar.groups.map(g => ({
            text: t(lang, g.key),
            collapsed: false,
            items: itemsOf(lang, g.items)
        }))
        for (const path of pillar.paths) {
            const k = path.includes('/') ? `${p}/${path}` : `${p}/${path}/`
            sidebar[k] = groups
        }
    }
    sidebar[`${p}/community/`] = [{text: t(lang, 'community'), items: itemsOf(lang, COMMUNITY)}]
    // VitePress matches multi-sidebar keys by prefix after a stable sort on raw
    // segment count; keys with equal counts fall back to Object.keys insertion
    // order. Re-emit deeper keys first so e.g. /zh/operation/device-onboarding
    // (drivers sidebar) always wins over /zh/operation/ (develop sidebar),
    // independent of the PILLARS iteration order above.
    const depth = (key: string) => key.split('/').filter(Boolean).length
    return Object.fromEntries(Object.entries(sidebar).sort(([a], [b]) => depth(b) - depth(a))) as typeof sidebar
}

// Build once, guard once — config.mts runs in Node on every dev boot and
// build, so an unregistered page or a zh/en locale key drift fails startup.
const sidebars = {zh: buildSidebar('zh'), en: buildSidebar('en')}
assertSidebarRegistersAllPages(sidebars)
assertLocaleParity()
assertHeadingParity()
assertMarkdownHygiene()

function buildNav(lang: Lang) {
    const p = lang === 'en' ? '/en' : '/zh'
    const pillars = PILLARS.map(pillar => ({
        text: t(lang, pillar.navKey),
        link: linkOf(lang, pillar.landing),
        ...(pillar.activeMatch ? {activeMatch: pillar.activeMatch} : {})
    }))
    return [
        {text: lang === 'en' ? 'Home' : '首页', link: `${p}/`},
        ...pillars,
        {text: t(lang, 'community'), items: itemsOf(lang, COMMUNITY)},
        // commercial entry, aligned with the quick-entry on dc3.site
        {text: lang === 'en' ? 'Pricing' : '价格', link: `https://dc3.site${lang === 'en' ? '/en' : '/zh'}/pricing/`}
    ]
}

function uiLabels(lang: Lang) {
    return {
        editLinkText: t(lang, 'ui.editLinkText'),
        outlineLabel: t(lang, 'ui.outlineLabel'),
        lastUpdatedText: t(lang, 'ui.lastUpdatedText'),
        returnToTop: t(lang, 'ui.returnToTop'),
        sidebarMenu: t(lang, 'ui.sidebarMenu'),
        darkModeSwitch: t(lang, 'ui.darkModeSwitch'),
        lightModeSwitchTitle: t(lang, 'ui.lightModeSwitchTitle'),
        darkModeSwitchTitle: t(lang, 'ui.darkModeSwitchTitle'),
        docFooterPrev: t(lang, 'ui.docFooterPrev'),
        docFooterNext: t(lang, 'ui.docFooterNext'),
        searchButtonText: t(lang, 'ui.searchButtonText'),
        searchButtonAria: t(lang, 'ui.searchButtonAria'),
        searchNoResults: t(lang, 'ui.searchNoResults'),
        searchReset: t(lang, 'ui.searchReset'),
        searchSelect: t(lang, 'ui.searchSelect'),
        searchNavigate: t(lang, 'ui.searchNavigate'),
        searchClose: t(lang, 'ui.searchClose'),
        footerMessage: t(lang, 'ui.footerMessage')
    }
}

function localeThemeConfig(lang: Lang) {
    const u = uiLabels(lang)
    return {
        nav: buildNav(lang),
        sidebar: sidebars[lang],
        siteTitle: NAV_SITE_TITLE[lang],
        socialLinks: socialLinks(lang),
        editLink: {text: u.editLinkText},
        footer: {message: u.footerMessage, copyright: 'Copyright © 2017-2026 pnoker'},
        outline: {level: [2, 3], label: u.outlineLabel},
        lastUpdated: {
            text: u.lastUpdatedText,
            formatOptions: {dateStyle: 'short', timeStyle: 'medium'}
        },
        docFooter: {prev: u.docFooterPrev, next: u.docFooterNext},
        returnToTopLabel: u.returnToTop,
        sidebarMenuLabel: u.sidebarMenu,
        darkModeSwitchLabel: u.darkModeSwitch,
        lightModeSwitchTitle: u.lightModeSwitchTitle,
        darkModeSwitchTitle: u.darkModeSwitchTitle,
        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: u.searchButtonText,
                        buttonAriaLabel: u.searchButtonAria
                    },
                    modal: {
                        noResultsText: u.searchNoResults,
                        resetButtonTitle: u.searchReset,
                        footer: {
                            selectText: u.searchSelect,
                            navigateText: u.searchNavigate,
                            closeText: u.searchClose
                        }
                    }
                }
            }
        }
    }
}

// The root path (language gate) always redirects to /zh/ or /en/ by preference: localStorage first, otherwise browser language; the language-selection page is only a fallback for when JS is disabled
const LANG_DETECT = `(function(){var K='dc3-lang',B='/';var p;try{p=localStorage.getItem(K);}catch(e){}var r=location.pathname;if(r.length&&r[r.length-1]!=='/')r=r+'/';var rel=r.indexOf(B)===0?r.slice(B.length):r;var onEn=rel.indexOf('en/')===0;var onZh=rel.indexOf('zh/')===0;if(!onEn&&!onZh){if(!p){p=/^en/i.test(navigator.language)?'en':'zh';try{localStorage.setItem(K,p);}catch(e){}}location.replace(B+p+'/');}})();`

export default defineConfig({
    base: '/',
    lang: 'zh-CN',
    title: 'IoT DC3',
    cleanUrls: true,
    transformHead,

    sitemap: {
        hostname: 'https://docs.dc3.site'
    },
    lastUpdated: true,

    // maintainer-internal material is excluded from the public site build
    // README.md is the repo readme (not a docs page) — exclude it so dead-link checks ignore it
    // dc3/doc/** holds @include source snapshots (CHANGE.md/USAGE.md), not browsable pages
    // dc3/blog/** holds the dc3-wechat content repo (article sources for WeChat/Zhihu/CSDN), not browsable pages
    // zh/frontend/frontend-testing-guardrails.md is a maintainer-internal AI dev workflow doc
    // the list lives in sidebar-check.mts (SRC_EXCLUDE) so the build and the orphan check share one source
    srcExclude: [...SRC_EXCLUDE],

    head: [
        ['link', {rel: 'icon', href: '/images/logo.svg', type: 'image/svg+xml'}],
        ['meta', {name: 'theme-color', content: '#1296db'}],
        // Preconnect to analytics origins so the first request isn't blocked on a cold DNS/TLS handshake
        ['link', {rel: 'preconnect', href: 'https://www.googletagmanager.com'}],
        ['link', {rel: 'preconnect', href: 'https://hm.baidu.com'}],
        // Version meta — read at runtime by VersionSwitcher and VersionBanner
        ['meta', {name: 'dc3-doc-version', content: versionInfo.version}],
        ['meta', {name: 'dc3-doc-full-version', content: versionInfo.fullVersion}],
        ['meta', {name: 'dc3-doc-is-latest', content: String(versionInfo.isLatest)}],
        ['meta', {name: 'dc3-doc-latest-url', content: 'https://docs.dc3.site'}],
        // Google Analytics (GA4)
        ['script', {async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-0S37KX68Y3'}],
        ['script', {}, `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0S37KX68Y3');`],
        // Baidu Tongji (百度统计) — skip on localhost/127.0.0.1 so local dev traffic
        // never pollutes the production reports
        ['script', {}, `if(!/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname)){var _hmt = _hmt || [];
(function() {
var hm = document.createElement("script");
hm.src = "https://hm.baidu.com/hm.js?bd41b7a1501a288245f375eaef8f97cc";
var s = document.getElementsByTagName("script")[0];
s.parentNode.insertBefore(hm, s);
})();}`],
        // Google AdSense (ca-pub-7573143232245283) — site review and ad serving both
        // require this loader on every page; ads.txt lives in public/
        ['link', {rel: 'preconnect', href: 'https://pagead2.googlesyndication.com'}],
        ['script', {
            async: '',
            src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7573143232245283',
            crossorigin: 'anonymous'
        }],
        ['script', {}, LANG_DETECT]
    ],

    locales: {
        zh: {
            label: '简体中文',
            lang: 'zh-CN',
            themeConfig: localeThemeConfig('zh')
        },
        en: {
            label: 'English',
            lang: 'en-US',
            themeConfig: localeThemeConfig('en')
        }
    },

    themeConfig: {
        logo: '/images/logo.svg',

        editLink: {
            pattern: 'https://github.com/pnoker/iot-dc3-docs/edit/main/:path'
        }
    },

    markdown: {
        lineNumbers: false,
        image: {
            lazyLoading: true
        }
    }
})
