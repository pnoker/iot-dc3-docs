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
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useData} from 'vitepress'

const LABELS = {
  zh: {close: '关闭（Esc）'},
  en: {close: 'Close (Esc)'}
} as const

const {lang} = useData()
const t = computed(() => LABELS[(lang.value || '').startsWith('en') ? 'en' : 'zh'])

const open = ref(false)

function show() {
  open.value = true
}

function hide() {
  open.value = false
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) hide()
}

watch(open, v => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <!-- inline: the diagram renders in the page flow; click anywhere on it to zoom -->
  <Teleport :disabled="!open" to="body">
    <div
        v-if="!open"
        class="dc3-frame"
        role="button"
        :tabindex="0"
        :aria-label="'Click to enlarge'"
        @click="show"
        @keydown.enter="show"
    >
      <slot/>
    </div>

    <!-- fullscreen overlay: the same diagram enlarged, scrollable when taller -->
    <div
        v-else
        :aria-label="t.close"
        aria-modal="true"
        class="dc3-frame is-open"
        role="dialog"
        @click.self="hide"
    >
      <button :aria-label="t.close" class="dc3-frame__close" type="button" @click="hide">
        <svg fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
             stroke-width="2" viewBox="0 0 24 24" width="18">
          <line x1="18" x2="6" y1="6" y2="18"/>
          <line x1="6" x2="18" y1="6" y2="18"/>
        </svg>
      </button>
      <div class="dc3-frame__figure">
        <slot/>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* inline (default): the whole diagram area is clickable */
.dc3-frame {
  position: relative;
  display: block;
  cursor: zoom-in;
  transition: opacity 0.15s ease;
}

.dc3-frame:hover {
  opacity: 0.92;
}

.dc3-frame:focus-visible {
  outline: 2px solid rgba(18, 150, 219, 0.5);
  outline-offset: 4px;
  border-radius: 8px;
}

/* fullscreen overlay */
.dc3-frame.is-open {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: auto;
  padding: clamp(24px, 4vw, 56px);
  background: rgba(0, 0, 0, 0.82);
  cursor: zoom-out;
  animation: dc3-frame-fade 0.18s ease both;
}

@keyframes dc3-frame-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dc3-frame.is-open .dc3-frame__figure {
  display: block;
  position: relative;
  z-index: 1;
  width: min(96vw, 1440px);
  cursor: default;
  animation: dc3-frame-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes dc3-frame-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

/* Inside the overlay, the diagram wrapper fills the figure width */
.dc3-frame.is-open .dc3-frame__figure .dc3-diagram,
.dc3-frame.is-open .dc3-frame__figure .dc3-arch,
.dc3-frame.is-open .dc3-frame__figure .dc3-arch-diagram {
  width: 100%;
  max-width: none;
  overflow-x: visible;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
}

.dc3-frame.is-open .dc3-frame__figure svg {
  width: 100%;
  height: auto;
  max-width: none;
}

.dc3-frame__close {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.dc3-frame__close:hover {
  background: rgba(255, 255, 255, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .dc3-frame.is-open,
  .dc3-frame.is-open .dc3-frame__figure {
    animation: none;
  }
}
</style>
