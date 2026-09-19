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

<script setup lang="ts">
import {computed, defineAsyncComponent, onMounted, ref} from 'vue'
import {useData, useRouter} from 'vitepress'

const props = defineProps<{ lang: 'zh' | 'en' }>()
const {isDark} = useData()
const router = useRouter()

// Every diagram component, lazily loaded — the browser only fetches the ones
// actually rendered on screen.
const loaders = import.meta.glob<{ default: unknown }>('./*Diagram.vue')
const resolve = (name: string) => {
    const loader = loaders[`./${name}.vue`]
    if (!loader) return null
    return defineAsyncComponent(loader as never)
}

type Entry = { component: string, url: string, pageTitle: string, anchor?: string }
const entries = ref<Entry[]>([])
const query = ref('')

onMounted(async () => {
    const index = await fetch('/diagram-index.json').then(r => r.json())
    entries.value = index[props.lang] ?? []
})

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    const list = q
        ? entries.value.filter(e =>
            e.component.toLowerCase().includes(q)
            || e.pageTitle.toLowerCase().includes(q)
            || e.url.toLowerCase().includes(q))
        : entries.value
    // stable grouping: alphabetical by component, then by page
    return [...list].sort((a, b) =>
        a.component === b.component
            ? a.pageTitle.localeCompare(b.pageTitle)
            : a.component.localeCompare(b.component))
})

const groups = computed(() => {
    const map = new Map<string, Entry[]>()
    for (const e of filtered.value) {
        if (!map.has(e.component)) map.set(e.component, [])
        map.get(e.component)!.push(e)
    }
    return [...map.entries()]
})

const go = (e: Entry) => {
    router.go(e.url + (e.anchor ? `#${e.anchor}` : ''))
}

const copy = computed(() => props.lang === 'en' ? {
    placeholder: 'Search diagrams, page titles, or paths…',
    count: (n: number) => `${n} diagram${n === 1 ? '' : 's'}`,
    open: 'Open',
    empty: 'No diagram matches this query.',
    usedOn: (n: number) => `used on ${n} page${n === 1 ? '' : 's'}`,
} : {
    placeholder: '搜索图表名、页面标题或路径…',
    count: (n: number) => `共 ${n} 张图`,
    open: '前往',
    empty: '没有匹配的图表。',
    usedOn: (n: number) => `出现在 ${n} 个页面`,
})
</script>

<template>
  <div class="dg-gallery" :class="{ dark: isDark }">
    <div class="dg-toolbar">
      <input
        v-model="query"
        class="dg-search"
        type="search"
        :placeholder="copy.placeholder"
        :aria-label="copy.placeholder"
      >
      <span class="dg-count">{{ copy.count(filtered.length) }}</span>
    </div>

    <p v-if="filtered.length === 0" class="dg-empty">{{ copy.empty }}</p>

    <section v-for="[component, uses] in groups" :key="component" class="dg-group">
      <h3 class="dg-group-title">
        {{ component }}
        <span class="dg-group-note">{{ copy.usedOn(uses.length) }}</span>
      </h3>
      <article v-for="e in uses" :key="e.url + e.anchor" class="dg-card" @click="go(e)">
        <div class="dg-thumb">
          <component :is="resolve(e.component)" :lang="props.lang" />
        </div>
        <footer class="dg-card-foot">
          <span class="dg-page">{{ e.pageTitle }}</span>
          <span class="dg-open">{{ copy.open }} ↗</span>
        </footer>
      </article>
    </section>
  </div>
</template>

<style scoped>
.dg-gallery {
  --dg-card: #ffffff;
  --dg-ink: var(--vp-c-text-1);
  --dg-ink-2: var(--vp-c-text-2);
  --dg-line: var(--vp-c-divider);
  --dg-tint: rgba(18, 150, 219, 0.08);
}

.dg-gallery.dark {
  --dg-card: #161f2b;
  --dg-tint: rgba(30, 150, 230, 0.12);
}

.dg-toolbar {
  position: sticky;
  top: calc(var(--vp-nav-height) + 8px);
  z-index: 10;
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.dg-search {
  flex: 1;
  max-width: 460px;
  padding: 10px 16px;
  border: 1px solid var(--dg-line);
  border-radius: 999px;
  background: var(--dg-card);
  color: var(--dg-ink);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dg-search:focus {
  border-color: rgba(18, 150, 219, 0.55);
  box-shadow: 0 0 0 3px rgba(18, 150, 219, 0.15);
}

.dg-count { color: var(--dg-ink-2); font-size: 13px; white-space: nowrap; }

.dg-empty { color: var(--dg-ink-2); padding: 32px 0; }

.dg-group { margin-bottom: 28px; }

.dg-group-title {
  margin: 0 0 12px;
  color: var(--dg-ink);
  font-size: 15px;
  font-weight: 650;
  border-bottom: 1px solid var(--dg-line);
  padding-bottom: 8px;
}

.dg-group-note {
  margin-left: 8px;
  color: var(--dg-ink-2);
  font-size: 12px;
  font-weight: 400;
}

.dg-card {
  display: block;
  /* SVGs carry intrinsic widths (often 1400px+); without min-width:0 that
     forces the grid track open and the gallery collapses to one column. */
  min-width: 0;
  border: 1px solid var(--dg-line);
  border-radius: 12px;
  background: var(--dg-card);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.dg-card:hover {
  border-color: rgba(18, 150, 219, 0.45);
  box-shadow: 0 10px 26px rgba(12, 24, 40, 0.12);
  transform: translateY(-2px);
}

.dg-thumb {
  padding: 14px;
  overflow: hidden;
}

.dg-thumb :deep(.dc3-diagram) {
  margin: 0;
  max-height: 300px;
  overflow: hidden;
}

.dg-thumb :deep(svg) { width: 100%; height: auto; }

.dg-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-top: 1px solid var(--dg-line);
  background: var(--dg-tint);
  border-radius: 0 0 12px 12px;
}

.dg-page { color: var(--dg-ink); font-size: 13px; font-weight: 560; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dg-open { color: var(--vp-c-brand-1); font-size: 12.5px; white-space: nowrap; }

@media (min-width: 720px) {
  .dg-group { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .dg-group-title, .dg-empty { grid-column: 1 / -1; }
}

@media (min-width: 1100px) {
  .dg-group { grid-template-columns: repeat(3, 1fr); }
}
</style>
