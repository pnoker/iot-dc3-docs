/*
 * Fact-drift scanner: compares machine facts in the docs against the
 * upstream iot-dc3 repo (when reachable) and against a registry of
 * known-good values / forbidden legacy strings.
 *
 * Usage:
 *   node scripts/scan-facts.mjs [--ci] [--upstream <path-to-iot-dc3>]
 *
 * Exit code 1 in --ci mode when any drift is found.
 */

import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

const args = process.argv.slice(2)
const ci = args.includes('--ci')
const upstreamIdx = args.indexOf('--upstream')
const upstream = upstreamIdx >= 0 ? args[upstreamIdx + 1] : new URL('../.upstream-hint', import.meta.url).pathname
const problems = []
const notes = []

// ── helpers ──────────────────────────────────────────────────────────

function walk(dir, out = []) {
    if (!existsSync(dir)) return out
    for (const ent of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, ent.name)
        if (ent.isDirectory()) walk(full, out)
        else if (ent.isFile() && ent.name.endsWith('.md')) out.push(full)
    }
    return out
}

function findUpstream() {
    const candidates = [
        upstream,
        join(process.cwd(), '..', 'iot-dc3'),
        'C:/Users/pnoker/Code/github/iot-dc3',
    ].filter(Boolean)
    for (const c of candidates) {
        if (existsSync(join(c, 'pom.xml'))) return c
    }
    return null
}

// ── 1. forbidden legacy strings (regressions fixed on 2026-09-19/20) ─

const FORBIDDEN = [
    {pattern: /<hashed>|PASSWORD_HASH|salt-hashed password|用盐哈希后|盐把密码哈希/, why: '登录提交明文密码（服务端 Argon2 校验）'},
    {pattern: /X-Auth-Token: <token>'/, why: "X-Auth-Token 必须是 JSON {\"salt\",\"token\"}"},
    {pattern: /Gateway → Auth → Manager/, why: '启动顺序应为 Auth → Manager → Data → Agentic → Gateway → Driver'},
    {pattern: /22 个驱动容器|ships 22 by/, why: 'compose 内置全部 36 个驱动容器（28 时代旧口径）'},
    {pattern: /28 个驱动|28 个协议驱动|28 个接入驱动|28 个多协议|28 built-in drivers|28 protocol drivers|28 driver modules|28 connectivity/, why: '驱动口径统一为 36'},
    {pattern: /实现状态：可用 :::/, why: '单行容器渲染缺陷（且 20 页应为「完整」）'},
    {pattern: /pnokers@gmail/, why: '联系邮箱用 pnokers@icloud.com'},
]

for (const file of walk('zh').concat(walk('en'))) {
    const md = readFileSync(file, 'utf8')
    for (const {pattern, why} of FORBIDDEN) {
        if (pattern.test(md)) {
            const line = md.split('\n').findIndex(l => pattern.test(l)) + 1
            problems.push(`${file}:${line}  ${why}`)
        }
    }
}

// ── 2. upstream-extracted facts ──────────────────────────────────────

const up = findUpstream()
if (!up) {
    notes.push('上游仓库不可达，跳过上游提取检查（--upstream <path> 指定）')
} else {
    // 2a. driver count
    const driverDir = join(up, 'dc3-driver')
    if (existsSync(driverDir)) {
        const drivers = readdirSync(driverDir, {withFileTypes: true})
            .filter(e => e.isDirectory() && e.name.startsWith('dc3-driver-')).length
        notes.push(`上游 dc3-driver 目录数: ${drivers}（本站口径 36；release 线 28）`)
        if (drivers !== 36) {
            notes.push(`  → 与口径 36 不一致：main=${drivers}。若 release 已追平，按 MAINTAINING.md 第 4 节第 14 项处理`)
        }
    }

    // 2b. image tag default
    const envFile = join(up, '.env.example')
    if (existsSync(envFile)) {
        const tag = readFileSync(envFile, 'utf8').match(/^DC3_IMAGE_TAG=(.+)$/m)?.[1]?.trim()
        notes.push(`上游 .env.example DC3_IMAGE_TAG 默认: ${tag ?? '(未找到)'}`)
        if (tag && tag !== '2026.6') {
            problems.push(`上游默认 tag 已变为 ${tag}，文档警告框与 services/usage 表述需复核（当前按 2026.6 未发布撰写）`)
        }
    }

    // 2c. pom version
    const pom = join(up, 'pom.xml')
    if (existsSync(pom)) {
        const version = readFileSync(pom, 'utf8').match(/<version>(\d{4}\.\d+\.\d+)<\/version>/)?.[1]
        notes.push(`上游 pom 版本: ${version ?? '(未解析)'}`)
    }

    // 2d. compose bundled drivers
    const compose = join(up, 'dc3', 'docker-compose.yml')
    if (existsSync(compose)) {
        const bundled = new Set()
        for (const m of readFileSync(compose, 'utf8').matchAll(/dc3-driver-([a-z0-9-]+):/g)) bundled.add(m[1])
        notes.push(`上游 compose 内置驱动容器: ${bundled.size} 个`)
        if (bundled.size !== 36) {
            notes.push(`  → compose 内置 ${bundled.size} 个（文档写"全部 36"）；若这是 release 检出属预期，main 才是 36`)
        }
    }
}

// ── report ───────────────────────────────────────────────────────────

for (const n of notes) console.log('  ℹ ' + n)
if (problems.length) {
    console.error(`\n✘ 发现 ${problems.length} 处事实漂移/残留：`)
    for (const p of problems) console.error('  - ' + p)
    if (ci) process.exit(1)
} else {
    console.log('\n✔ 无禁用串残留' + (up ? '；上游提取见上' : ''))
}
