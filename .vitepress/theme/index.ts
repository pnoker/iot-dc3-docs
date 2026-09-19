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

import type {Theme} from 'vitepress'
import {h, onBeforeUnmount, onMounted} from 'vue'
import DefaultTheme from 'vitepress/theme'
import mediumZoom from 'medium-zoom'
import 'medium-zoom/dist/style.css'
import './style.css'
import TopologyDiagram from './components/TopologyDiagram.vue'
import LayeredDiagram from './components/LayeredDiagram.vue'
import DataPlaneDiagram from './components/DataPlaneDiagram.vue'
import CommandPlaneDiagram from './components/CommandPlaneDiagram.vue'
import AuthFlowDiagram from './components/AuthFlowDiagram.vue'
import FourLayersDiagram from './components/FourLayersDiagram.vue'
import HeroLogo from './components/HeroLogo.vue'
import HeroMesh from './components/HeroMesh.vue'
import HeroParticles from './components/HeroParticles.vue'
import HeroWaves from './components/HeroWaves.vue'
import VersionBanner from './components/VersionBanner.vue'
import FooterSignal from './components/FooterSignal.vue'

// The language preference is written back to localStorage after internal navigation (including the top language switcher), so the head inline script can keep it on refresh.
function persistLang(path: string) {
    try {
        localStorage.setItem('dc3-lang', path.indexOf('/en') === 0 ? 'en' : 'zh')
    } catch (e) {
        // silently skip when localStorage is unavailable
    }
}

// WeChat Official Account icon click: pop the QR modal in-place instead of
// navigating (the hover QR card stays as a quick preview). Document-level
// delegation so the icon works in the desktop navbar, the tablet extra menu
// and the mobile drawer alike; copy follows the site language.
function openWechatModal(trigger: HTMLAnchorElement) {
    const en = document.documentElement.lang.startsWith('en')
    const label = trigger.getAttribute('aria-label') || (en ? 'WeChat Official Account' : '微信公众号')
    const closeLabel = en ? 'Close' : '关闭'
    const hint = en ? 'Scan on WeChat to follow' : '微信扫码关注'
    const modal = document.createElement('div')
    modal.className = 'dc3-wechat-modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('aria-label', label)
    modal.innerHTML = `
        <div class="dc3-wechat-modal__scrim"></div>
        <div class="dc3-wechat-modal__card">
          <button class="dc3-wechat-modal__close" type="button" aria-label="${closeLabel}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <p class="dc3-wechat-modal__title">${label}</p>
          <div class="dc3-wechat-modal__qr"><img src="/images/wechat-qrcode.jpg" alt="${label}"></div>
          <p class="dc3-wechat-modal__hint">${hint}</p>
        </div>`
    let closed = false
    const close = () => {
        if (closed) return
        closed = true
        document.removeEventListener('keydown', onKey, true)
        document.body.classList.remove('dc3-modal-open')
        modal.classList.add('is-closing')
        window.setTimeout(() => modal.remove(), 170)
        trigger.focus()
    }
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') close()
        if (event.key === 'Tab') {
            // The close button is the only focusable element: keep focus inside
            event.preventDefault()
            modal.querySelector<HTMLButtonElement>('.dc3-wechat-modal__close')?.focus()
        }
    }
    modal.querySelector('.dc3-wechat-modal__close')?.addEventListener('click', close)
    modal.querySelector('.dc3-wechat-modal__scrim')?.addEventListener('click', close)
    document.addEventListener('keydown', onKey, true)
    document.body.appendChild(modal)
    document.body.classList.add('dc3-modal-open')
    modal.querySelector<HTMLButtonElement>('.dc3-wechat-modal__close')?.focus()
}

function handleWechatIconClick(event: MouseEvent) {
    if (event.defaultPrevented || !(event.target instanceof Element)) return
    const link = event.target.closest<HTMLAnchorElement>('.VPSocialLink[href*="wechat-qrcode"]')
    if (!link) return
    event.preventDefault()
    openWechatModal(link)
}

const theme: Theme = {
    extends: DefaultTheme,

    // Home hero: three background layers (HeroMesh protocol-mesh semantic base at z0 + HeroWaves wave dot-matrix + full-width converging particles HeroParticles, home-hero-before), and the image area is the logo particle animation (home-hero-image)
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'layout-top': () => h(VersionBanner),
            'home-hero-before': () => [h(HeroMesh), h(HeroWaves), h(HeroParticles)],
            'home-hero-image': () => h(HeroLogo),
            // The footer oscilloscope wave — self-attaches into .VPFooter, which
            // the default theme only renders on pages without a sidebar (i.e. the
            // home layout); the canvas stops itself when its host is hidden.
            'layout-bottom': () => h(FooterSignal)
        })
    },

    setup() {
        onMounted(() => {
            mediumZoom('.vp-doc img:not(.no-zoom):not(.dc3-diagram img)', {
                background: 'rgba(0, 0, 0, 0.78)',
                margin: 24
            })
            document.addEventListener('click', handleWechatIconClick)
        })
        onBeforeUnmount(() => {
            document.removeEventListener('click', handleWechatIconClick)
            document.querySelector('.dc3-wechat-modal')?.remove()
            document.body.classList.remove('dc3-modal-open')
        })
    },

    enhanceApp({app, router}) {
        app.component('TopologyDiagram', TopologyDiagram)
        app.component('LayeredDiagram', LayeredDiagram)
        app.component('DataPlaneDiagram', DataPlaneDiagram)
        app.component('CommandPlaneDiagram', CommandPlaneDiagram)
        app.component('AuthFlowDiagram', AuthFlowDiagram)
        app.component('FourLayersDiagram', FourLayersDiagram)
        if (typeof window === 'undefined' || !router) {
            return
        }
        persistLang(window.location.pathname)
        const previous = router.onAfterRouteChanged
        router.onAfterRouteChanged = function (to) {
            persistLang(to)
            return previous ? previous.call(this, to) : undefined
        }
    }
}

export default theme
