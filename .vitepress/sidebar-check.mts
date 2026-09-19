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

// Build-time guards for the sidebar. This module runs wherever config.mts is
// loaded — `vitepress dev` boot and `vitepress build` — so a forgotten sidebar
// registration fails immediately at startup instead of shipping an orphan page
// that only search engines can reach.

import {existsSync, readFileSync, readdirSync} from 'node:fs'
import {join, relative, sep} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

// Single source of truth for VitePress `srcExclude`. config.mts spreads this
// into its own srcExclude so the build skip-list and the orphan-check
// skip-list below can never drift apart.
export const SRC_EXCLUDE: readonly string[] = [
    'superpowers/**',
    'README.md',
    'dc3/doc/**',
    'dc3/blog/**',
    // maintainer-internal AI development workflow doc (English, lives in the
    // zh tree, zero inbound links) — intentionally not part of the public site
    'zh/frontend/frontend-testing-guardrails.md',
    // maintainer guide — not a site page
    'MAINTAINING.md'
]

// Supports the two shapes used in SRC_EXCLUDE: '<prefix>/**' and exact paths.
const isExcluded = (relPath: string): boolean =>
    SRC_EXCLUDE.some(pattern =>
        pattern.endsWith('/**')
            ? relPath.startsWith(pattern.slice(0, -2))
            : relPath === pattern
    )

function walkMarkdown(dir: string, out: string[] = []): string[] {
    for (const ent of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, ent.name)
        if (ent.isDirectory()) walkMarkdown(full, out)
        else if (ent.isFile() && ent.name.endsWith('.md')) out.push(full)
    }
    return out
}

// 'zh/drivers/index.md' → 'drivers' (a directory index collapses to the
// directory code); 'zh/index.md' → '' (the language homepage, rendered by
// layout:home, never a sidebar entry).
function toCode(langDir: string, file: string): string {
    const rel = relative(langDir, file).split(sep).join('/').replace(/\.md$/, '')
    if (rel === 'index') return ''
    return rel.endsWith('/index') ? rel.slice(0, -'/index'.length) : rel
}

// '/zh/drivers/modbus-tcp' → 'drivers/modbus-tcp' (same code space as toCode)
const codeFromLink = (link: string): string =>
    link.replace(/^\/(zh|en)\//, '').replace(/\/$/, '')

type SidebarGroupLike = { items: ReadonlyArray<{ link: string }> }
type MultiSidebarLike = Readonly<Record<string, ReadonlyArray<SidebarGroupLike>>>

// Every markdown page under zh/ and en/ (minus SRC_EXCLUDE and the homepages)
// must be reachable from that language's sidebar. Validates the built sidebar
// objects — not the PILLARS input — so it stays correct however the sidebar
// is assembled.
export function assertSidebarRegistersAllPages(sidebars: Readonly<Record<'zh' | 'en', MultiSidebarLike>>): void {
    const problems: string[] = []
    for (const lang of ['zh', 'en'] as const) {
        const registered = new Set<string>()
        for (const groups of Object.values(sidebars[lang]))
            for (const group of groups)
                for (const item of group.items) registered.add(codeFromLink(item.link))

        const langDir = join(root, lang)
        for (const file of walkMarkdown(langDir)) {
            const relPath = relative(root, file).split(sep).join('/')
            if (isExcluded(relPath)) continue
            const code = toCode(langDir, file)
            if (code === '' || registered.has(code)) continue
            problems.push(`  ${relPath} — register it in PILLARS/COMMUNITY (.vitepress/config.mts) + locales/${lang}.json`)
        }
    }
    if (problems.length) {
        throw new Error(`[sidebar-check] orphan pages (exist on disk, missing from the sidebar):\n${problems.join('\n')}\n  Every published page must be reachable from its language's left sidebar.`)
    }
}

// Markdown hygiene: catches the two recurring rendering defects this site
// has shipped before — bold markers split across a hard line break (renders
// literal asterisks) and single-line ::: containers (the closer must sit on
// its own line, otherwise the container title and following text render
// outside the box). Code fences, inline code spans and 4+ asterisk runs
// (password placeholders) are excluded before counting.
export function assertMarkdownHygiene(): void {
    const stripNoise = (md: string) =>
        md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '').replace(/\*{4,}/g, '')
    const problems: string[] = []
    for (const lang of ['zh', 'en'] as const) {
        for (const file of walkMarkdown(join(root, lang))) {
            const relPath = relative(root, file).split(sep).join('/')
            if (isExcluded(relPath)) continue
            const raw = readFileSync(file, 'utf8')
            for (const para of stripNoise(raw).split(/\n\s*\n/)) {
                if (para.includes('**') && para.split('**').length % 2 === 0) {
                    problems.push(`  ${relPath} — unbalanced ** in paragraph: ${para.split('\n')[0].slice(0, 48)}`)
                }
            }
            for (const line of raw.split('\n')) {
                if (/^:::.*:::\s*$/.test(line.trim()) && line.trim() !== ':::') {
                    problems.push(`  ${relPath} — single-line ::: container: ${line.slice(0, 48)}`)
                }
            }
        }
    }
    if (problems.length) {
        throw new Error(`[sidebar-check] markdown rendering defects:\n${problems.join('\n')}`)
    }
}

// locales/zh.json and locales/en.json must carry the same key set so both
// languages resolve every sidebar/nav entry to their own copy (t() falls back
// to zh silently — this guard makes the drift visible at build time instead).
export function assertLocaleParity(): void {
    const readKeys = (file: string) => Object.keys(JSON.parse(readFileSync(join(root, file), 'utf8')))
    const zh = readKeys('locales/zh.json')
    const en = readKeys('locales/en.json')
    const zhOnly = zh.filter(k => !en.includes(k))
    const enOnly = en.filter(k => !zh.includes(k))
    if (zhOnly.length || enOnly.length) {
        throw new Error(`[sidebar-check] locale key drift between locales/zh.json and locales/en.json:\n  zh-only: ${zhOnly.join(', ') || '—'}\n  en-only: ${enOnly.join(', ') || '—'}`)
    }
}

// zh/en content parity: every mirrored markdown pair (minus SRC_EXCLUDE) must
// carry the same number of headings (# .. ####). A section present in one
// language but missing from the other is content drift — the pair has stopped
// being a translation of itself, and readers of one language silently miss
// whole sections.
export function assertHeadingParity(): void {
    // strip fenced code blocks first — `#`-comments inside them (bash,
    // properties) must not count as headings
    const headingCount = (file: string) =>
        readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '').split('\n')
            .filter(line => /^#{1,4} /.test(line)).length
    const problems: string[] = []
    for (const file of walkMarkdown(join(root, 'zh'))) {
        const relPath = relative(root, file).split(sep).join('/')
        if (isExcluded(relPath)) continue
        const enFile = join(root, relPath.replace(/^zh\//, 'en/'))
        if (!existsSync(enFile)) {
            problems.push(`  ${relPath} — no en counterpart`)
            continue
        }
        const [zhCount, enCount] = [headingCount(file), headingCount(enFile)]
        if (zhCount !== enCount) problems.push(`  ${relPath} — headings zh=${zhCount} en=${enCount}`)
    }
    if (problems.length) {
        throw new Error(`[sidebar-check] zh/en heading drift (sections missing from one language):\n${problems.join('\n')}`)
    }
}
