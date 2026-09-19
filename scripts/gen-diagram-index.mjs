/*
 * Generates public/diagram-index.json — the catalog behind the /diagrams
 * figure index. Scans zh/ and en/ markdown for <XxxDiagram lang="…" />
 * usages (plus the six globally-registered diagram components), and records
 * for each usage: the component, the page URL, the page title, and the
 * anchor of the nearest preceding heading (so the gallery can deep-link to
 * the exact spot).
 *
 * Run from the repo root:  node scripts/gen-diagram-index.mjs
 */

import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

const GLOBAL_DIAGRAMS = new Set([
    'TopologyDiagram', 'LayeredDiagram', 'DataPlaneDiagram',
    'CommandPlaneDiagram', 'AuthFlowDiagram', 'FourLayersDiagram',
])

function walk(dir, out = []) {
    for (const ent of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, ent.name)
        if (ent.isDirectory()) walk(full, out)
        else if (ent.isFile() && ent.name.endsWith('.md')) out.push(full)
    }
    return out
}

function parsePage(file, lang) {
    const rel = file.split(/[\\/]/).slice(1).join('/').replace(/\.md$/, '')
    const url = rel.endsWith('/index') || rel === 'index'
        ? `/${lang}/${rel === 'index' ? '' : rel.slice(0, -'/index'.length) + '/'}`
        : `/${lang}/${rel}`
    const md = readFileSync(file, 'utf8')
    const title = md.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1] || rel
    return {url, title, md}
}

function slugify(text) {
    // matches markdown-it anchor generation closely enough for our headings
    return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
}

function scan(lang) {
    const entries = []
    for (const file of walk(lang)) {
        const {url, title, md} = parsePage(file, lang)
        let lastHeading = ''
        for (const line of md.split('\n')) {
            const h = line.match(/^(#{1,4})\s+(.+)$/)
            if (h) {
                lastHeading = slugify(h[2].replace(/[*`]/g, ''))
                continue
            }
            for (const m of line.matchAll(/<([A-Z][A-Za-z0-9]*)Diagram\b[^>]*lang="(zh|en)"/g)) {
                const component = m[1] + 'Diagram'
                entries.push({
                    component,
                    url,
                    pageTitle: title,
                    anchor: lastHeading || undefined,
                })
            }
        }
    }
    // de-duplicate (same component may appear on several pages — keep all,
    // they are distinct deep links; but drop exact component+url+anchor dupes)
    const seen = new Set()
    return entries.filter(e => {
        const key = `${e.component}|${e.url}|${e.anchor ?? ''}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

const index = {zh: scan('zh'), en: scan('en')}
if (!existsSync('public')) mkdirSync('public')
writeFileSync('public/diagram-index.json', JSON.stringify(index))
console.log(`diagram-index.json: zh=${index.zh.length} en=${index.en.length} entries`)
