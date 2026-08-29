#!/usr/bin/env node
/**
 * 清理 dist/sitemap.xml —— 在 `vitepress build` 之后运行。
 * 根路径 `/` 是 JS 语言门（noindex + 客户端跳转到 /zh/ 或 /en/），不属于可索引页面；
 * sitemap 协议要求只列 canonical、可索引的 URL，故从产物中移除该条目。
 * /zh/ 与 /en/ 两个真正的语言首页仍在 sitemap 中，不受影响。
 */
const {readFileSync, writeFileSync} = require('node:fs')
const {join, resolve} = require('node:path')

const ROOT = resolve(__dirname, '..')
const OUT = join(ROOT, '.vitepress/dist/sitemap.xml')

let source
try {
    source = readFileSync(OUT, 'utf8')
} catch (_) {
    console.error(`  ❌ 未找到 ${OUT}，请在 vitepress build 之后运行本脚本`)
    process.exit(1)
}

const before = (source.match(/<url>/g) || []).length
// 逐个 <url> 块判断：loc 恰为站点根（无路径）的条目即语言门，移除
const cleaned = source.replace(/<url>[\s\S]*?<\/url>/g, block =>
    /<loc>\s*https:\/\/docs\.dc3\.site\/?\s*<\/loc>/.test(block) ? '' : block
)
const after = (cleaned.match(/<url>/g) || []).length

writeFileSync(OUT, cleaned, 'utf8')
console.log(`  ✅ sitemap cleaned: removed noindex root gate (${before} → ${after} URLs)`)
