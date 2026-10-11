#!/usr/bin/env node
/**
 * 生成 llms-full.txt —— llms.txt 的全量正文版，供 LLM 深度索引（AEO）。
 * 在 `vitepress build` 之后运行：遍历源 Markdown，逐页输出「标题 + 正文全文」。
 * 输出到 dist（随站点部署），源 Markdown 是单一事实来源，无需另维护。
 *
 * 排除口径复用 .vitepress/sidebar-check.mts 的 SRC_EXCLUDE（单一事实来源）：
 * 站点构建刻意排除的维护者内部页（如 zh/frontend/frontend-testing-guardrails.md）
 * 不得泄入 llms-full.txt——否则 AEO 通道发布一个站点本身 404 的 URL（2026-10 审计 site-3）。
 */
const {readFileSync, writeFileSync, readdirSync, statSync, mkdirSync} = require('node:fs')
const {join, relative, resolve, dirname} = require('node:path')

const SITE_URL = 'https://docs.dc3.site'
const ROOT = resolve(__dirname, '..')
const CONTENT_DIRS = ["zh","en"]
const CONTENT_BASE = resolve(__dirname, "..")
const OUT = join(ROOT, ".vitepress/dist/llms-full.txt")

const EXCLUDE_FILES = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md'])
const EXCLUDE_DIRS = new Set(['.vitepress', 'public', 'node_modules', '.github', "dc3"])

// Parse SRC_EXCLUDE out of sidebar-check.mts (a .mts module cannot be
// require()d from CommonJS). Loud failure instead of silent mis-exclusion
// if the literal ever changes shape.
function readSrcExclude() {
  const src = readFileSync(join(ROOT, '.vitepress', 'sidebar-check.mts'), 'utf8')
  const m = src.match(/export const SRC_EXCLUDE[^=]*=\s*\[([\s\S]*?)\]/)
  if (!m) {
    throw new Error('generate-llms-full: cannot parse SRC_EXCLUDE from .vitepress/sidebar-check.mts — keep it a plain string-array literal')
  }
  return m[1]
    .replace(/\/\/[^\n]*/g, '') // strip line comments inside the array
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

// supports the two shapes used in SRC_EXCLUDE: '<prefix>/**' and exact paths
const SRC_EXCLUDE = readSrcExclude()
const isSrcExcluded = (relPath) =>
  SRC_EXCLUDE.some((pattern) =>
    pattern.endsWith('/**')
      ? relPath.startsWith(pattern.slice(0, -2))
      : relPath === pattern
  )

function walk(dir, out = []) {
  let entries = []
  try { entries = readdirSync(dir) } catch { return out }
  entries.sort()
  for (const name of entries) {
    if (name.startsWith('.') || EXCLUDE_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (name.endsWith('.md') && !EXCLUDE_FILES.has(name)) out.push(full)
  }
  return out
}

function urlOf(file) {
  let rel = relative(CONTENT_BASE, file).replace(/\\/g, '/').replace(/\.md$/, '')
  if (rel === 'index') return `${SITE_URL}/`
  if (rel.endsWith('/index')) return `${SITE_URL}/${rel.slice(0, -6)}/`
  return `${SITE_URL}/${rel}`
}

function parse(src) {
  let title = ''
  let body = src
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m)
    if (t) title = t[1].trim().replace(/^['"]|['"]$/g, '')
    body = src.slice(fm[0].length)
  }
  body = body.trim()
  if (!title) {
    const h = body.match(/^#\s+(.+)$/m)
    if (h) title = h[1].trim()
  }
  // 去掉与标题重复的首个 H1，避免正文里再出现一次标题
  body = body.replace(/^#\s+[^\n]*\n?/, '').trim()
  return {title: title || 'Untitled', body}
}

const files = CONTENT_DIRS.flatMap(d => walk(d))
const parts = []
for (const file of files) {
  const rel = relative(CONTENT_BASE, file).replace(/\\/g, '/')
  if (isSrcExcluded(rel)) continue // same skip-list as the site build
  const {title, body} = parse(readFileSync(file, 'utf8'))
  parts.push(`# ${title}\n\nURL: ${urlOf(file)}\n\n${body}\n\n---\n`)
}

mkdirSync(dirname(OUT), {recursive: true})
writeFileSync(OUT, parts.join('\n'), 'utf8')
console.log(`  ✅ llms-full.txt generated: ${parts.length} pages → ${OUT}`)
