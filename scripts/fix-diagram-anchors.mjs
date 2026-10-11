#!/usr/bin/env node
/*
 * fix-diagram-anchors — build-chain step (runs BETWEEN two vitepress builds).
 *
 * gen-diagram-index.mjs guesses each diagram's deep-link anchor by slugifying
 * the nearest preceding markdown heading. That guess can drift from the ids
 * markdown-it-anchor actually renders (numbered headings, punctuation, CJK).
 * This script reads the REAL ids from the first build's dist HTML, matches
 * them against each diagram-index entry's section heading text, and rewrites
 * public/diagram-index.json in place; the second vitepress build then ships
 * the corrected index (the /diagrams gallery fetches it at runtime).
 *
 * Guard semantics (MAINTAINING.md §2): a diagram whose section cannot be
 * matched to any rendered heading on its page — or whose page is missing
 * from dist — fails the chain with exit 1 instead of shipping a dead link.
 *
 * Run from the repo root after a completed build:  node scripts/fix-diagram-anchors.mjs
 */

import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs'
import {join, relative} from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const DIST = join(ROOT, '.vitepress', 'dist')
const INDEX_FILE = join(ROOT, 'public', 'diagram-index.json')

// ── collect dist HTML pages: relPath (no extension, no trailing /index) → file
function walkHtml(dir, out = []) {
    for (const ent of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, ent.name)
        if (ent.isDirectory()) walkHtml(full, out)
        else if (ent.isFile() && ent.name.endsWith('.html')) out.push(full)
    }
    return out
}

// '/zh/drivers/' → 'zh/drivers'; '/zh/architecture' → 'zh/architecture'
const urlKey = (url) => url.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\/index$/, '')

if (!existsSync(DIST)) {
    console.error('fix-diagram-anchors: .vitepress/dist not found — run after a completed vitepress build')
    process.exit(1)
}
if (!existsSync(INDEX_FILE)) {
    console.error('fix-diagram-anchors: public/diagram-index.json not found — run gen-diagram-index.mjs first')
    process.exit(1)
}

const pages = new Map()
for (const file of walkHtml(DIST)) {
    const key = relative(DIST, file)
        .split(/[\\/]/).join('/')
        .replace(/\.html$/, '')
        .replace(/\/index$/, '')
    pages.set(key, file)
}

// ── heading text normalization — applied identically to the rendered HTML
// text and the section text captured by gen-diagram-index (which strips
// markdown decoration: * ` [ ] ( ) #). Entities decode first, tags (incl.
// the permalink anchor and its zero-width space) strip out.
const decodeEntities = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
const normalize = (s) => decodeEntities(String(s))
    .replace(/<[^>]*>/g, '')       // tags: header-anchor link, code spans…
    .replace(/\u200b/g, '')        // zero-width space inside the anchor link
    .replace(/[*`[\]()#&]/g, '')   // same decoration set gen-diagram-index strips
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

// page file → Map(normalized heading text → real rendered id); first occurrence
// wins (duplicate heading texts differ only by markdown-it's -1 suffix, and
// the deep link to the first occurrence is never worse than the old guess)
const headingIndex = new Map()
for (const [key, file] of pages) {
    const html = readFileSync(file, 'utf8')
    const headings = new Map()
    for (const m of html.matchAll(/<h([1-6]) id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
        const text = normalize(m[3])
        if (text && !headings.has(text)) headings.set(text, m[2])
    }
    headingIndex.set(key, headings)
}

// ── backfill anchors into the diagram index
const index = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
const unmatched = []
let fixed = 0
let kept = 0

for (const lang of Object.keys(index)) {
    for (const entry of index[lang]) {
        if (!entry.section) continue // diagram before any heading — links to page top
        const key = urlKey(entry.url)
        const headings = headingIndex.get(key)
        if (!headings) {
            unmatched.push(`${lang} ${entry.component} → ${entry.url} (page missing from dist)`)
            continue
        }
        const realId = headings.get(normalize(entry.section))
        if (!realId) {
            unmatched.push(`${lang} ${entry.component} → ${entry.url}#? section "${entry.section}"`)
            continue
        }
        if (realId === entry.anchor) kept++
        else {
            entry.anchor = realId
            fixed++
        }
    }
}

if (unmatched.length) {
    console.error(`fix-diagram-anchors: ${unmatched.length} diagram deep-links could not be resolved:`)
    for (const u of unmatched) console.error('  - ' + u)
    process.exit(1)
}

writeFileSync(INDEX_FILE, JSON.stringify(index))
console.log(`  ✅ diagram anchors verified against dist: ${fixed} corrected, ${kept} already exact`)
