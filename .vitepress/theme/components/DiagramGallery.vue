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
import {computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useData, useRouter} from 'vitepress'

const props = defineProps<{ lang: 'zh' | 'en' }>()
const {isDark} = useData()
const router = useRouter()

// ── diagram components, lazily loaded per chunk (browser handles the rest
//    via content-visibility on the cards — no JS visibility race) ──────
const loaders = import.meta.glob<{ default: unknown }>('./*Diagram.vue')
const cache = new Map<string, ReturnType<typeof defineAsyncComponent>>()
const resolve = (name: string) => {
    if (!loaders[`./${name}.vue`]) return null
    if (!cache.has(name)) cache.set(name, defineAsyncComponent(loaders[`./${name}.vue`] as never))
    return cache.get(name)!
}

// ── data ─────────────────────────────────────────────────────────────
type Entry = { component: string, url: string, pageTitle: string, anchor?: string }
const entries = ref<Entry[]>([])
const loading = ref(true)
const query = ref('')

onMounted(async () => {
    try {
        const index = await fetch('/diagram-index.json').then(r => r.json())
        entries.value = index[props.lang] ?? []
    } finally {
        loading.value = false
    }
})

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    const list = q
        ? entries.value.filter(e =>
            e.component.toLowerCase().includes(q)
            || e.pageTitle.toLowerCase().includes(q)
            || e.url.toLowerCase().includes(q))
        : entries.value
    return [...list].sort((a, b) =>
        a.component === b.component
            ? a.pageTitle.localeCompare(b.pageTitle)
            : a.component.localeCompare(b.component))
})

// flat list drives the lightbox prev/next order
const flat = computed(() => filtered.value)

// Group by PAGE, not by component class name: readers think "the diagrams
// on the alarm page", not "AlarmErDiagram". Page order follows the url, which
// tracks the site's information architecture.
const groups = computed(() => {
    const map = new Map<string, { pageTitle: string, entries: Entry[] }>()
    for (const e of filtered.value) {
        if (!map.has(e.url)) map.set(e.url, { pageTitle: e.pageTitle, entries: [] })
        map.get(e.url)!.entries.push(e)
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([url, g]) => ({ url, ...g }))
})

// ── lightbox ─────────────────────────────────────────────────────────
const zoomIndex = ref(-1)
const zoomOpen = computed(() => zoomIndex.value >= 0 && zoomIndex.value < flat.value.length)
const zoomEntry = computed(() => flat.value[zoomIndex.value])

function openZoom(index: number) {
    zoomIndex.value = index
}

function closeZoom() {
    zoomIndex.value = -1
}

function step(delta: number) {
    if (!zoomOpen.value || flat.value.length === 0) return
    zoomIndex.value = (zoomIndex.value + delta + flat.value.length) % flat.value.length
}

function gotoPage(e: Entry) {
    closeZoom()
    router.go(e.url + (e.anchor ? `#${e.anchor}` : ''))
}

function onKey(e: KeyboardEvent) {
    if (!zoomOpen.value) return
    if (e.key === 'Escape') closeZoom()
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
}

watch(zoomOpen, v => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    if (typeof document !== 'undefined') document.body.style.overflow = ''
})

// ── copy ─────────────────────────────────────────────────────────────
const copy = computed(() => props.lang === 'en' ? {
    kicker: 'Index',
    title: 'Diagram Index',
    lead: 'Every architecture, flow, state-machine, and relationship diagram on the site, grouped by page. Click a card to enlarge; jump to its place in the text from the lightbox.',
    placeholder: 'Search diagrams, page titles, or paths…',
    count: (n: number) => `${n} diagram${n === 1 ? '' : 's'}`,
    empty: 'No diagram matches this query.',
    loading: 'Loading diagram index…',
    prev: 'Previous diagram',
    next: 'Next diagram',
    close: 'Close (Esc)',
    jump: 'Open in context',
    of: (i: number, n: number) => `${i + 1} / ${n}`,
} : {
    kicker: '图录',
    title: '图表总览',
    lead: '全站架构图、流程图、状态机与关系图按页面归组。点击卡片放大查看，从放大层直达它在正文中的位置。',
    placeholder: '搜索图表名、页面标题或路径…',
    count: (n: number) => `共 ${n} 张图`,
    empty: '没有匹配的图表。',
    loading: '正在载入图表索引…',
    prev: '上一张（←）',
    next: '下一张（→）',
    close: '关闭（Esc）',
    jump: '前往正文',
    of: (i: number, n: number) => `${i + 1} / ${n}`,
})
</script>

<template>
  <div :class="{ 'dg-dark': isDark }" class="dg">
    <!-- page header (site voice: kicker pill + title + lead) -->
    <header class="dg-head">
      <p class="dg-kicker">{{ copy.kicker }}</p>
      <h2 class="dg-title">{{ copy.title }}</h2>
      <p class="dg-lead">{{ copy.lead }}</p>
    </header>

    <!-- toolbar: full-width search + count -->
    <div class="dg-toolbar">
      <div class="dg-search-wrap">
        <svg aria-hidden="true" class="dg-search-icon" fill="none" height="15" stroke="currentColor"
             stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="15">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" x2="16.65" y1="21" y2="16.65"/>
        </svg>
        <input v-model="query" :aria-label="copy.placeholder" :placeholder="copy.placeholder" class="dg-search"
               type="search">
      </div>
      <span class="dg-count">{{ loading ? '…' : copy.count(filtered.length) }}</span>
    </div>

    <!-- loading skeletons -->
    <div v-if="loading" class="dg-grid">
      <div v-for="i in 8" :key="i" class="dg-card dg-skeleton">
        <div class="dg-thumb dg-shimmer"/>
        <div class="dg-card-foot"><span class="dg-shimmer-line"/></div>
      </div>
    </div>

    <!-- results -->
    <p v-else-if="filtered.length === 0" class="dg-empty">{{ copy.empty }}</p>

    <section v-for="group in groups" v-else :key="group.url" class="dg-section">
      <h3 class="dg-group-title">
        <span class="dg-group-name">{{ group.pageTitle }}</span>
        <span class="dg-group-note">{{ group.entries.length }}</span>
      </h3>
      <div class="dg-grid">
        <article
          v-for="e in group.entries"
          :key="e.url + (e.anchor ?? '')"
          :aria-label="e.pageTitle + ' — ' + e.component"
          class="dg-card"
          role="button"
          :tabindex="0"
          @click="openZoom(flat.indexOf(e))"
          @keydown.enter="openZoom(flat.indexOf(e))"
        >
          <div class="dg-thumb">
            <component :is="resolve(e.component)" :lang="props.lang"/>
          </div>
          <footer class="dg-card-foot">
            <span :title="e.component" class="dg-page">{{ e.component }}</span>
            <span
              :aria-label="copy.jump"
              class="dg-jump"
              role="link"
              :tabindex="0"
              @click.stop="gotoPage(e)"
              @keydown.enter.stop="gotoPage(e)"
            >{{ copy.jump }} ↗</span>
          </footer>
        </article>
      </div>
    </section>

    <!-- lightbox -->
    <Teleport to="body">
      <div v-if="zoomOpen && zoomEntry" :aria-label="copy.close" aria-modal="true" class="dg-zoom" role="dialog"
           @click.self="closeZoom">
        <button :aria-label="copy.close" class="dg-zoom-close" type="button" @click="closeZoom">
          <svg fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
               stroke-width="2" viewBox="0 0 24 24" width="18">
            <line x1="18" x2="6" y1="6" y2="18"/>
            <line x1="6" x2="18" y1="6" y2="18"/>
          </svg>
        </button>
        <button :aria-label="copy.prev" class="dg-zoom-nav dg-zoom-nav--prev" type="button" @click="step(-1)">
          <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
               stroke-width="2" viewBox="0 0 24 24" width="20">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button :aria-label="copy.next" class="dg-zoom-nav dg-zoom-nav--next" type="button" @click="step(1)">
          <svg fill="none" height="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
               stroke-width="2" viewBox="0 0 24 24" width="20">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <figure class="dg-zoom-figure">
          <header class="dg-zoom-head">
            <span class="dg-zoom-title">{{ zoomEntry.component }}</span>
            <span class="dg-zoom-page">{{ zoomEntry.pageTitle }}</span>
          </header>
          <div class="dg-zoom-body">
            <component :is="resolve(zoomEntry.component)" :key="zoomEntry.component + zoomIndex" :lang="props.lang"/>
          </div>
          <footer class="dg-zoom-foot">
            <span class="dg-zoom-counter">{{ copy.of(zoomIndex, flat.length) }}</span>
            <button class="dg-zoom-jump" type="button" @click="gotoPage(zoomEntry)">{{ copy.jump }} ↗</button>
          </footer>
        </figure>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dg {
  --dg-card: #ffffff;
  --dg-card-soft: var(--vp-c-bg-soft);
  --dg-ink: var(--vp-c-text-1);
  --dg-ink-2: var(--vp-c-text-2);
  --dg-line: var(--vp-c-divider);
  --dg-tint: rgba(18, 150, 219, 0.07);
  --dg-shadow: 0 8px 24px rgba(16, 42, 72, 0.06);
  --dg-shadow-hover: 0 14px 32px rgba(16, 42, 72, 0.13);
  max-width: 1280px;
  margin: 0 auto;
  padding: 8px 4px 40px;
}

.dg-dark {
  --dg-card: #161f2b;
  --dg-tint: rgba(30, 150, 230, 0.1);
  --dg-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  --dg-shadow-hover: 0 14px 34px rgba(0, 0, 0, 0.38);
}

/* ── page header ─────────────────────────────────────────────────── */
.dg-head { margin: 18px 0 22px; }

.dg-kicker {
  display: inline-block;
  margin: 0 0 12px;
  padding: 3px 12px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 32%, var(--dg-line));
  border-radius: 999px;
  background: var(--dg-tint);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 640;
  letter-spacing: 0.12em;
}

.dg-title {
  margin: 0 0 8px;
  color: var(--dg-ink);
  font-size: clamp(26px, 3.4vw, 36px);
  font-weight: 740;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.dg-lead {
  max-width: 720px;
  margin: 0;
  color: var(--dg-ink-2);
  font-size: 15px;
  line-height: 1.7;
}

/* ── toolbar: full-width search ──────────────────────────────────── */
.dg-toolbar {
  position: sticky;
  top: calc(var(--vp-nav-height) + 10px);
  z-index: 10;
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 0 0 22px;
}

.dg-search-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.dg-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--dg-ink-2);
  pointer-events: none;
}

.dg-search {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 16px 10px 38px;
  border: 1px solid var(--dg-line);
  border-radius: 999px;
  background: var(--dg-card);
  box-shadow: var(--dg-shadow);
  color: var(--dg-ink);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dg-search:focus {
  border-color: rgba(18, 150, 219, 0.55);
  box-shadow: 0 0 0 3px rgba(18, 150, 219, 0.15);
}

.dg-count {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--dg-line);
  border-radius: 999px;
  background: var(--dg-card);
  box-shadow: var(--dg-shadow);
  color: var(--dg-ink-2);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── groups ──────────────────────────────────────────────────────── */
.dg-section { margin-bottom: 26px; }

.dg-group-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--dg-line);
  color: var(--dg-ink);
  font-size: 15px;
  font-weight: 650;
}

.dg-group-name::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 2px;
  background: var(--vp-c-brand-1);
  vertical-align: baseline;
}

.dg-group-note {
  min-width: 20px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--dg-tint);
  color: var(--vp-c-brand-1);
  font-size: 11.5px;
  font-weight: 640;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* ── responsive grid: 1 → 2 → 3 → 4 columns by available width ──── */
.dg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 16px;
}

/* ── card ────────────────────────────────────────────────────────── */
.dg-card {
  display: flex;
  flex-direction: column;
  /* diagrams carry intrinsic SVG widths — without min-width:0 they force
     the grid track open and the gallery collapses to a single column */
  min-width: 0;
  border: 1px solid var(--dg-line);
  border-radius: 12px;
  background: var(--dg-card);
  box-shadow: var(--dg-shadow);
  cursor: zoom-in;
  /* the browser skips rendering off-screen cards — same effect as the old
     IntersectionObserver lazy-mount, but without its hydration race */
  content-visibility: auto;
  contain-intrinsic-size: auto 260px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.dg-card:hover,
.dg-card:focus-visible {
  border-color: rgba(18, 150, 219, 0.45);
  box-shadow: var(--dg-shadow-hover);
  transform: translateY(-2px);
  outline: none;
}

.dg-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  padding: 12px;
  border-radius: 12px 12px 0 0;
  background: var(--dg-card-soft);
}

.dg-thumb :deep(.dc3-diagram) {
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CONTAIN, never cover: a cropped diagram cannot answer "is this the one
   I'm looking for" — completeness beats filling the box. */
.dg-thumb :deep(svg) {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

.dg-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--dg-line);
  border-radius: 0 0 12px 12px;
  background: var(--dg-tint);
}

.dg-page {
  flex: 1;
  color: var(--dg-ink);
  font-size: 12.5px;
  font-weight: 560;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dg-jump {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.dg-jump:hover { text-decoration: underline; text-underline-offset: 3px; }

.dg-empty { color: var(--dg-ink-2); padding: 40px 0; text-align: center; }

/* ── skeleton shimmer ────────────────────────────────────────────── */
.dg-skeleton { pointer-events: none; }

.dg-shimmer {
  background: linear-gradient(100deg, var(--dg-card-soft) 40%, color-mix(in srgb, var(--dg-card-soft) 60%, #c8d4e0) 50%, var(--dg-card-soft) 60%);
  background-size: 200% 100%;
  animation: dg-shimmer 1.4s ease-in-out infinite;
}

.dg-dark .dg-shimmer {
  background: linear-gradient(100deg, var(--dg-card-soft) 40%, color-mix(in srgb, var(--dg-card-soft) 55%, #2b3a4d) 50%, var(--dg-card-soft) 60%);
  background-size: 200% 100%;
}

.dg-shimmer-line {
  display: inline-block;
  width: 40%;
  height: 10px;
  border-radius: 5px;
}

@keyframes dg-shimmer {
  to { background-position: -200% 0; }
}

/* ── lightbox — visual aligned with DiagramFrame / medium-zoom ───── */
.dg-zoom {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(4px);
  animation: dg-zoom-in 0.18s ease both;
}

@keyframes dg-zoom-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dg-zoom-figure {
  display: flex;
  flex-direction: column;
  width: min(96vw, 1500px);
  max-height: calc(100vh - 64px);
  border-radius: 14px;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: dg-zoom-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes dg-zoom-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.dg-zoom-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dg-zoom-title { color: var(--vp-c-text-1); font-size: 14px; font-weight: 650; }

.dg-zoom-page {
  flex: 1;
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dg-zoom-body {
  flex: 1;
  overflow: auto;
  padding: 18px;
}

.dg-zoom-body :deep(.dc3-diagram) { margin: 0; }

.dg-zoom-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-top: 1px solid var(--vp-c-divider);
}

.dg-zoom-counter { color: var(--vp-c-text-2); font-size: 12.5px; font-variant-numeric: tabular-nums; }

.dg-zoom-jump {
  padding: 5px 14px;
  border: 1px solid rgba(18, 150, 219, 0.4);
  border-radius: 999px;
  background: rgba(18, 150, 219, 0.08);
  color: var(--vp-c-brand-1);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.dg-zoom-jump:hover { background: rgba(18, 150, 219, 0.16); border-color: rgba(18, 150, 219, 0.6); }

.dg-zoom-close,
.dg-zoom-nav {
  position: fixed;
  z-index: 1;
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

.dg-zoom-close:hover,
.dg-zoom-nav:hover { background: rgba(255, 255, 255, 0.22); }

.dg-zoom-close { top: 18px; right: 18px; }

.dg-zoom-nav--prev { left: 14px; top: 50%; transform: translateY(-50%); }

.dg-zoom-nav--next { right: 14px; top: 50%; transform: translateY(-50%); }

@media (max-width: 720px) {
  .dg { padding: 8px 2px 32px; }

  .dg-toolbar { flex-wrap: wrap; }

  .dg-search-wrap { flex-basis: 100%; }

  .dg-count { margin-left: auto; }

  .dg-zoom-nav--prev,
  .dg-zoom-nav--next { top: auto; bottom: 18px; transform: none; }
  .dg-zoom-nav--prev { left: calc(50% - 52px); }
  .dg-zoom-nav--next { right: calc(50% - 52px); }
  .dg-zoom-figure { max-height: calc(100vh - 96px); }
}

@media (prefers-reduced-motion: reduce) {
  .dg-zoom,
  .dg-zoom-figure,
  .dg-shimmer { animation: none; }
  .dg-card { transition: none; }
}
</style>
