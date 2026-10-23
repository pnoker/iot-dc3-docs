/*
 * Fact-drift scanner: compares machine facts in the docs against the
 * upstream iot-dc3 repo (main branch — the fact source per MAINTAINING.md §1)
 * and against semantic families of known-bad legacy phrasings.
 *
 * Usage:
 *   node scripts/scan-facts.mjs [--ci] [--upstream <path-to-iot-dc3>]
 *
 * Exit code 1 in --ci mode when any drift is found.
 *
 * Three check categories (MAINTAINING.md §3):
 *   1. upstream extraction — driver dir count, .env.example DC3_IMAGE_TAG and
 *      the DC3_MQ_* variable set, pom version, dc3-cli top-level command face;
 *   2. forbidden strings — matched as SEMANTIC REGEX FAMILIES (not literals):
 *      salt-hashed-password, bare X-Auth-Token, boolean enableFlag,
 *      wrong startup order, 28/22 driver counts, … zh + en variants;
 *   3. scope — zh/, en/, root index.md and README.md (the root language gate
 *      once leaked "28 个协议驱动" because it sat outside the scan roots).
 *
 * Guard methodology (MAINTAINING.md §2): every new pattern family must be
 * negative-tested — inject one variant per family, confirm --ci fails,
 * restore. Affirmative corrective prose ("the salt does not hash the
 * password") is exempted via the negation window below.
 */

import {existsSync, readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

const args = process.argv.slice(2)
const ci = args.includes('--ci')
const upstreamIdx = args.indexOf('--upstream')
const upstream = upstreamIdx >= 0 ? args[upstreamIdx + 1] : null
const problems = []
const notes = []

// ── helpers ──────────────────────────────────────────────────────────

function walk(dir, out = [], ext = '.md') {
    if (!existsSync(dir)) return out
    for (const ent of readdirSync(dir, {withFileTypes: true})) {
        const full = join(dir, ent.name)
        if (ent.isDirectory()) walk(full, out, ext)
        else if (ent.isFile() && ent.name.endsWith(ext)) out.push(full)
    }
    return out
}

// Scan roots: the two language trees plus the root language gate and the
// repo readme (both sit outside zh/ and en/ and were a guard blind spot).
const DOC_FILES = [
    ...walk('zh'),
    ...walk('en'),
    ...['index.md', 'README.md'].filter(f => existsSync(f)),
]

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

// ── 1. forbidden semantic families ───────────────────────────────────
// Matched line by line with backticks stripped (inline code like
// `password` must not shield a violation). Families marked `negatable`
// skip matches whose immediate context marks them as corrective prose
// ("the salt does not hash the password", "bare token → 401").

// negation BEFORE the match → the line teaches the opposite (correct form)
const NEG_BEFORE = /\b(not|never|no|without|don'?t|doesn'?t|won'?t|isn'?t|aren'?t|avoid|rather than)\b/i
const NEG_BEFORE_ZH = /不要|不该|不得|不会|不能|不可|不用|不需|不再是|并非|而非|无需|禁止|切勿|请勿|裸|错误|无效|失效|已废弃|旧口径/i
// wrongness marker AFTER the match → the snippet is shown as the bad example
const NEG_AFTER = /401|wrong|invalid|incorrect|fails?|error|错误|无效|失效/i
const NEG_AFTER_ZH = /返回 ?401|错误示例|反例/

const BEFORE_WINDOW = 40
const AFTER_WINDOW = 30

function isCorrectiveContext(line, match) {
    // negation INSIDE the match: "the salt is not used to hash the password"
    if (NEG_BEFORE.test(match[0]) || NEG_BEFORE_ZH.test(match[0])) return true
    const before = line.slice(Math.max(0, match.index - BEFORE_WINDOW), match.index)
    if (NEG_BEFORE.test(before) || NEG_BEFORE_ZH.test(before)) return true
    const after = line.slice(match.index + match[0].length, match.index + match[0].length + AFTER_WINDOW)
    return NEG_AFTER.test(after) || NEG_AFTER_ZH.test(after)
}

const FORBIDDEN = [
    {
        key: 'salt-hashed-password',
        negatable: true,
        why: '登录提交明文密码（服务端 Argon2 校验，盐不参与密码哈希、不参与 JWT HMAC 密钥）',
        patterns: [
            // EN: "hash the password with (the|that) salt" / "Hash password with salt"
            /hash(?:es|ed|ing)?\s+(?:the\s+)?password\s+(?:with|using)\s+(?:the|that|a|your)?\s*salt/i,
            // EN: "the password hashed with the salt" (password first)
            /password\s+(?:that\s+(?:was|is)\s+)?hash(?:ed|ing)?\s+(?:with|using)\s+(?:the|that|a|your)?\s*salt/i,
            // EN reversed: "use the salt … to hash the password"
            /\bsalt\b[^\n]{0,40}?\bhash(?:es|ed|ing)?\s+(?:the\s+)?password/i,
            // placeholders / identifiers of the old hashed-password narrative
            /<hashed(?:\s+password)?>|\bhashed password\b|salt-hashed password|PASSWORD_HASH/i,
            // ZH: 用盐哈希(密码)后 / 盐把(将)密码哈希 / 密码…哈希后提交
            /用盐[对将]?[进]?哈希|盐[把将][^\n]{0,8}密码[^\n]{0,8}哈希|(?:密码|口令)[^\n]{0,10}哈希后(?:再|即|便)?(?:提交|发送|上传|置换|登录)/,
        ],
    },
    {
        key: 'bare-x-auth-token',
        negatable: true,
        why: 'X-Auth-Token 的值必须是 JSON {"salt":"...","token":"..."}（裸 token 401）',
        patterns: [
            // ANY `X-Auth-Token:` occurrence whose value does not open with {
            // (JSON object) — covers -H curl lines, raw header lines, shell
            // assignments (`H_TOKEN='X-Auth-Token: <ACCESS_TOKEN>'`, the exact
            // bp-1 regression shape) and prose. [ \t]*(?![ \t]*\{) cannot be
            // tricked by whitespace backtracking the way \s*(?!\{) can.
            /X-Auth-Token:[ \t]*(?![ \t]*\{)/,
        ],
    },
    {
        key: 'enable-flag-boolean',
        negatable: true,
        why: 'enableFlag 一律写字符串 "ENABLE"（JSON 布尔值是错误形态）',
        patterns: [
            /["']?enableFlag["']?\s*:\s*(?:true|false)\b/i,
        ],
    },
    {
        key: 'wrong-startup-order',
        negatable: true,
        // Only flag Gateway-first chains on lines that talk about ORDERING —
        // "gateway → data center → driver" is a legitimate request/trace path
        // (e.g. the logging page's traceId flow), not a startup claim.
        requires: /(启动|开机|顺序|依赖|依次|先启动|start(?:s|ed|ing)?|startup|boot|launch|order|first)/i,
        why: '启动顺序应为 Auth → Manager → Data → Agentic → Gateway → Driver（Gateway 不是首启服务）',
        patterns: [
            /Gateway\s*(?:→|->|=>)\s*(?:Auth|Manager|Data|Agentic)\b/i,
        ],
    },
    {
        // absolute ban per MAINTAINING §1 — no negation exemption
        key: 'driver-count-28',
        negatable: false,
        why: '驱动口径全站统一 36（中英文、meta、正文一律不写 28）',
        patterns: [
            /28\s*个(?:多协议|协议|接入|连接|内置)?驱动/,
            /28\s*个多协议/,
            /28\s*(?:款|类|种)\S{0,6}驱动/,
            /\b28\s+(?:built-?in|protocol|driver|connectivity|multi-?protocol|plug-?in|available|supported|offered)?\s*-?\s*(?:drivers?|driver\s+modules)\b/i,
            /\b28\s+built-?in\b/i,
            /\b(?:built[\s-]?in|ships|bundles|includes|offers|provides)\s+28\s+(?:drivers?|protocol)/i,
        ],
    },
    {
        key: 'driver-count-22',
        negatable: false,
        why: 'compose 内置全部 36 个驱动容器（22/28 时代旧口径）',
        patterns: [
            /22\s*个(?:内置)?驱动容器/,
            /\b(?:ships|bundles|includes)\s+22\b/i,
        ],
    },
    {
        key: 'single-line-container',
        negatable: false,
        why: '单行 ::: 容器渲染缺陷（闭合必须独占一行；且 20 页应为「完整」）',
        patterns: [
            /实现状态：可用 :::/,
        ],
    },
    {
        key: 'legacy-contact-email',
        negatable: false,
        why: '联系邮箱用 pnokers@icloud.com',
        patterns: [
            /pnokers?@gmail\./i,
        ],
    },
]

for (const file of DOC_FILES) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((rawLine, i) => {
        // inline-code backticks must not shield a violation
        const line = rawLine.replace(/`/g, '')
        for (const fam of FORBIDDEN) {
            if (fam.requires && !fam.requires.test(line)) continue
            for (const re of fam.patterns) {
                const m = re.exec(line)
                if (!m) continue
                if (fam.negatable && isCorrectiveContext(line, m)) continue
                problems.push(`${file}:${i + 1}  [${fam.key}] ${fam.why}`)
                break // one report per family per line
            }
        }
    })
}

// ── 2. upstream-extracted facts (main branch is the fact source) ─────

const up = findUpstream()
if (!up) {
    notes.push('上游仓库不可达，跳过上游提取检查（--upstream <path> 指定）')
} else {
    // 2a. driver directory count — site canon is 36
    const driverDir = join(up, 'dc3-driver')
    if (existsSync(driverDir)) {
        const drivers = readdirSync(driverDir, {withFileTypes: true})
            .filter(e => e.isDirectory() && e.name.startsWith('dc3-driver-')).length
        notes.push(`上游 dc3-driver 目录数: ${drivers}（本站口径 36）`)
        if (drivers !== 36) {
            problems.push(`上游 main 驱动目录数 ${drivers} ≠ 口径 36：按 MAINTAINING.md §1 重审驱动总览与全站计数`)
        }
    }

    // 2b. DC3_IMAGE_TAG — every docs *claim* of the default must equal the
    // upstream default. A command-prefix override (`DC3_IMAGE_TAG=x docker
    // compose …`) is an explicit per-invocation override, not a claim about
    // the default (the native-stack docs rely on it: driver -native images
    // only exist from the 2026.10 line), so those are exempt.
    const envFile = join(up, '.env.example')
    if (existsSync(envFile)) {
        const envText = readFileSync(envFile, 'utf8')
        const upstreamTag = envText.match(/^DC3_IMAGE_TAG=(.+)$/m)?.[1]?.trim()
        notes.push(`上游 .env.example DC3_IMAGE_TAG 默认: ${upstreamTag ?? '(未找到)'}`)
        if (upstreamTag) {
            const tagRe = /DC3_IMAGE_TAG=([\w.\-]+)/g
            const overridePrefixRe = /\b(?:docker|podman|make)\b/
            for (const file of DOC_FILES) {
                const md = readFileSync(file, 'utf8')
                let m
                while ((m = tagRe.exec(md))) {
                    if (m[1] === upstreamTag) continue
                    // same-line command prefix after the assignment → explicit override, exempt
                    const lineEnd = md.indexOf('\n', m.index)
                    const restOfLine = md.slice(m.index + m[0].length, lineEnd === -1 ? md.length : lineEnd)
                    if (overridePrefixRe.test(restOfLine)) continue
                    problems.push(`${file}  DC3_IMAGE_TAG=${m[1]} 与上游 .env.example 默认 ${upstreamTag} 不一致（docs 声称的默认 tag 必须 == 上游）`)
                }
            }
        }

        // 2c. DC3_MQ_* variable set — docs must not name variables upstream dropped
        const upstreamMq = new Set([...envText.matchAll(/^DC3_MQ_[A-Z_]+(?==)/gm)].map(m => m[0]))
        const docMq = new Set()
        for (const file of DOC_FILES) {
            for (const m of readFileSync(file, 'utf8').matchAll(/\bDC3_MQ_[A-Z_]+\b/g)) docMq.add(m[0])
        }
        for (const v of docMq) {
            if (!upstreamMq.has(v)) {
                problems.push(`文档提到 ${v}，但上游 .env.example 已无此变量（改名/删除后文档未跟）`)
            }
        }
        for (const v of upstreamMq) {
            if (!docMq.has(v)) notes.push(`上游变量 ${v} 文档未提及（覆盖缺口，非错误）`)
        }
    }

    // 2d. pom version (informational)
    const pom = join(up, 'pom.xml')
    if (existsSync(pom)) {
        const version = readFileSync(pom, 'utf8').match(/<version>(\d{4}\.\d+\.\d+)<\/version>/)?.[1]
        notes.push(`上游 pom 版本: ${version ?? '(未解析)'}`)
    }

    // 2e. compose bundled drivers
    const compose = join(up, 'dc3', 'docker-compose.yml')
    if (existsSync(compose)) {
        const bundled = new Set()
        for (const m of readFileSync(compose, 'utf8').matchAll(/dc3-driver-([a-z0-9-]+):/g)) bundled.add(m[1])
        notes.push(`上游 compose 内置驱动容器: ${bundled.size} 个`)
        if (bundled.size !== 36) {
            notes.push(`  → compose 内置 ${bundled.size} 个（文档写“全部 36”），需与 main 复核`)
        }
    }

    // 2f. dc3-cli top-level command face — cli.md follows main (MAINTAINING §1)
    const cliSrc = join(up, 'dc3-cli', 'src')
    if (existsSync(cliSrc)) {
        const upstreamCmds = new Set()
        for (const file of [join(cliSrc, 'index.ts'), ...walk(join(cliSrc, 'commands'), [], '.ts')]) {
            const src = readFileSync(file, 'utf8')
            for (const m of src.matchAll(/program\s*\.command\('([a-z][a-z-]*)'\)/g)) upstreamCmds.add(m[1])
        }
        // the path-aware help command is registered as 'help [commands...]' —
        // the single-word name regex above cannot see it, but `dc3 help <cmd>` is real
        upstreamCmds.add('help')
        if (upstreamCmds.size) {
            notes.push(`上游 dc3-cli 顶层命令: ${[...upstreamCmds].sort().join(' ')}`)
            // the command-face reference pages. Prose like "the `dc3` entry point"
            // or "cd <iot-dc3 checkout>/dc3-cli" must not look like commands, so
            // only fenced code blocks and `dc3 …` code spans drive the comparison.
            const faceFiles = ['zh/automation/cli.md', 'en/automation/cli.md'].filter(f => existsSync(f))
            const covered = new Set()
            const see = (cmd, where) => {
                if (upstreamCmds.has(cmd)) covered.add(cmd)
                else problems.push(`${where}  dc3 ${cmd} 不在上游命令面（上游: ${[...upstreamCmds].sort().join(' ')}）`)
            }
            for (const file of faceFiles) {
                let inBlock = false
                readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
                    if (/^\s*```/.test(line)) {
                        inBlock = !inBlock
                        return
                    }
                    if (inBlock) {
                        const m = line.match(/^\s*\$?\s*dc3\s+([a-z][a-z-]*)/)
                        if (m) see(m[1], `${file}:${i + 1}`)
                    } else {
                        for (const m of line.matchAll(/`dc3\s+([a-z][a-z-]+)[^`]*`/g)) see(m[1], `${file}:${i + 1}`)
                    }
                })
            }
            for (const c of upstreamCmds) {
                if (!covered.has(c)) {
                    problems.push(`上游 dc3-cli 命令 ${c} 未出现在 zh/en automation/cli.md（命令面跟随 main，CLI 变更须同期更新文档）`)
                }
            }
        } else {
            notes.push('未能从上游 dc3-cli 提取到顶层命令（注册写法变化？）')
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
