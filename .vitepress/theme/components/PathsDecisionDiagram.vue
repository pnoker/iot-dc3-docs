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
import {computed} from 'vue'
import DiagramFrame from './DiagramFrame.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), {lang: 'zh'})

const DICT = {
  zh: {
    aria: '按角色选择路径的决策树：从「你想做什么」出发，依次经过先评估、接入运营、部署生产、二次开发、自动化接 AI 五个菱形判定，是则进入对应角色路径卡（评估者、设备运营、DevOps、后端开发者、自动化集成者），全部否定则走贡献者路径；每张卡内给出带序号的推荐阅读顺序',
    start: '你想做什么？',
    q1: '先评估平台？', q2: '接入设备 / 日常运营？', q3: '部署到生产？',
    q4: '后端二次开发？', q5: '自动化 / 接 AI？',
    yes: '是', no: '否',
    b1: '是 · 评估者', b2: '是 · 运营', b3: '是 · DevOps',
    b4: '是 · 开发者', b5: '是 · 集成者', b6: '都不是 · 贡献者',
    r1: '评估者路径', r1s: '① 平台定位 → ② 核心概念 → ③ 系统架构总览 → ④ 快速开始起栈 + 导入 demo 数据',
    r2: '设备接入 / 运营路径', r2s: '① 核心概念 → ② 第一个设备端到端 → ③ 设备接入（选驱动） → ④ 数据与命令 → ⑤ 告警与通知 → ⑥ 控制台日常操作',
    r3: '运维 / DevOps 路径', r3s: '① 部署模式与镜像源 → ② 生产部署（单机到 k8s） → ③ 安全策略三条硬约束 → ④ 可观测性与日志 → ⑤ 故障排查',
    r4: '后端开发者路径', r4s: '① 架构总览与服务拓扑 → ② 数据平面 / 命令平面 → ③ 领域模型 → ④ 驱动开发（virtual 模板派生） → ⑤ API 文档与测试',
    r5: '自动化 / AI 路径', r5s: '① CLI 使用指南 → ② AI Agent / MCP 集成（OAuth 2.1） → ③ Agentic 中心会话与工具调用',
    r6: '贡献者路径', r6s: '① 开发概览与规范 → ② 本地与 CI 测试 → ③ 贡献指南 · 行为准则 · 安全策略',
    r1o: '产出：判断值不值得投入，能不能跑起来',
    r2o: '产出：设备上平台、数据可见、命令可控、告警到人',
    r3o: '产出：栈安全地跑在生产，出事有据可查',
    r4o: '产出：新协议驱动 / 新能力上线',
    r5o: '产出：脚本与 AI Agent 安全读写设备',
    r6o: '产出：提交的驱动 / 修复 / 文档被合并',
    regionCards: '六条角色路径卡（颜色区分，按序号读）',
    combo: '常见组合：先评估 → 再运营 → 需要时二次开发 → 贡献回流',
    tipsTitle: '怎么用这张图',
    tips1: '① 找到最像你的',
    tips2: '    那个判定',
    tips3: '② 照序号顺序读，',
    tips4: '    少走弯路',
    tips5: '③ 角色可组合：',
    tips6: '    先评估 → 再运营',
    tips7: '④ 每一步都链到',
    tips8: '    对应章节',
    legRole: '角色路径（颜色区分）', legDiamond: '菱形 = 判定', legArrow: '箭头 = 阅读路径'
  },
  en: {
    aria: 'Role-based path decision tree: starting from what you want to do, pass five diamonds — evaluate first, onboard/operate, deploy to production, backend customization, automation/AI — a yes enters the matching role card (evaluator, operations, DevOps, backend developer, integrator); all no leads to the contributor path; each card lists the numbered reading order',
    start: 'What do you want to do?',
    q1: 'Evaluating first?', q2: 'Onboarding / operations?', q3: 'Deploy to production?',
    q4: 'Backend customization?', q5: 'Automation / AI?',
    yes: 'yes', no: 'no',
    b1: 'yes · evaluator', b2: 'yes · operations', b3: 'yes · DevOps',
    b4: 'yes · developer', b5: 'yes · integrator', b6: 'none · contributor',
    r1: 'Evaluator path', r1s: '① positioning → ② core concepts → ③ architecture overview → ④ quickstart stack + demo data',
    r2: 'Onboarding / operations path', r2s: '① concepts → ② first device end-to-end → ③ onboarding (pick a driver) → ④ data & commands → ⑤ alarms → ⑥ console daily ops',
    r3: 'Ops / DevOps path', r3s: '① deploy modes & images → ② production deploy (single to k8s) → ③ security hard rules → ④ observability & logging → ⑤ troubleshooting',
    r4: 'Backend developer path', r4s: '① architecture & topology → ② data / command planes → ③ domain model → ④ driver authoring (from virtual) → ⑤ API docs & testing',
    r5: 'Automation / AI path', r5s: '① CLI guide → ② AI Agent / MCP (OAuth 2.1) → ③ Agentic center sessions & tools',
    r6: 'Contributor path', r6s: '① dev overview & conventions → ② local & CI tests → ③ contributing · conduct · security',
    r1o: 'outcome: is it worth it, does it run',
    r2o: 'outcome: devices online, data visible, commands work, alarms reach people',
    r3o: 'outcome: the stack runs safely in production',
    r4o: 'outcome: a new driver / capability ships',
    r5o: 'outcome: scripts and agents read/write devices safely',
    r6o: 'outcome: your driver / fix / docs get merged',
    regionCards: 'Six role path cards (color-coded, read in order)',
    combo: 'common combo: evaluate → operate → customize when needed → contribute back',
    tipsTitle: 'How to use',
    tips1: '① find the branch',
    tips2: '    that fits you',
    tips3: '② read in order,',
    tips4: '    fewer detours',
    tips5: '③ roles combine:',
    tips6: '    evaluate → operate',
    tips7: '④ every step links',
    tips8: '    to its chapter',
    legRole: 'Role path (color-coded)', legDiamond: 'diamond = decision', legArrow: 'arrow = reading path'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)

// diamond centers on the spine x=240
const diamonds = [
  { q: 'q1', cy: 134, b: 'b1' },
  { q: 'q2', cy: 242, b: 'b2' },
  { q: 'q3', cy: 350, b: 'b3' },
  { q: 'q4', cy: 458, b: 'b4' },
  { q: 'q5', cy: 566, b: 'b5' }
] as const

// role cards: [titleKey, subKey, y, fillVar, strokeVar]
const cards = [
  ['r1', 'r1s', 90, 'var(--dc3-fe-fill)', 'var(--dc3-fe-stroke)'],
  ['r2', 'r2s', 198, 'var(--dc3-be-fill)', 'var(--dc3-be-stroke)'],
  ['r3', 'r3s', 306, 'var(--dc3-amber-fill)', 'var(--dc3-amber-stroke)'],
  ['r4', 'r4s', 414, 'var(--dc3-bus-fill)', 'var(--dc3-bus-stroke)'],
  ['r5', 'r5s', 522, 'var(--dc3-db-fill)', 'var(--dc3-db-stroke)'],
  ['r6', 'r6s', 630, 'var(--dc3-rose-fill)', 'var(--dc3-rose-stroke)']
] as const
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1360 780">
        <defs>
          <marker id="pd-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="pd-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#pd-grid)" height="100%" width="100%"/>

        <!-- cards region (behind cards) -->
        <rect fill="var(--dc3-region-be)" height="658" rx="12" stroke="var(--dc3-arrow)" stroke-dasharray="6,3"
              stroke-width="1" width="780" x="410" y="72"/>
        <text fill="var(--dc3-text2)" font-size="10" font-weight="600" x="424" y="728">{{ s.regionCards }}</text>

        <!-- start pill -->
        <rect fill="var(--dc3-ext-fill)" height="46" rx="23" stroke="var(--dc3-ext-stroke)" stroke-width="1.5"
              width="200" x="140" y="40"/>
        <text fill="var(--dc3-box-name)" font-size="13" font-weight="700" text-anchor="middle" x="240" y="69">{{
            s.start
          }}
        </text>
        <line marker-end="url(#pd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="240" x2="240" y1="88"
              y2="98"/>

        <!-- spine: no-arrows between diamonds -->
        <line v-for="idx in 4" :key="'n' + idx" marker-end="url(#pd-ah)" stroke="var(--dc3-arrow)"
              stroke-width="1.2" x1="240" x2="240" :y1="diamonds[idx - 1].cy + 38" :y2="diamonds[idx].cy - 40"/>
        <text v-for="idx in 4" :key="'nl' + idx" fill="var(--dc3-arrow-label)" font-size="9" font-weight="600"
              x="248" :y="diamonds[idx - 1].cy + 62">{{ s.no }}</text>
        <!-- final else to contributor card -->
        <path d="M 240 604 L 240 674 L 416 674" fill="none" marker-end="url(#pd-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1.2"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9" font-weight="600" x="252" y="650">{{ s.b6 }}</text>

        <!-- diamonds + yes branches -->
        <g v-for="(d, idx) in diamonds" :key="'d' + idx">
          <polygon fill="var(--dc3-amber-fill)" :points="`240,${d.cy - 36} 340,${d.cy} 240,${d.cy + 36} 140,${d.cy}`"
                   stroke="var(--dc3-amber-stroke)" stroke-width="1.5"/>
          <text fill="var(--dc3-box-name)" font-size="9.5" font-weight="600" text-anchor="middle" x="240"
                :y="d.cy + 4">{{ s[d.q] }}
          </text>
          <line marker-end="url(#pd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="342" x2="414"
                :y1="d.cy" :y2="d.cy"/>
          <text fill="var(--dc3-be-text)" font-size="9" font-weight="600" x="350" :y="d.cy - 10">{{ s[d.b] }}</text>
        </g>

        <!-- role cards -->
        <g v-for="(c, idx) in cards" :key="'c' + idx">
          <rect :fill="c[3]" height="88" rx="8" :stroke="c[4]" stroke-width="1.5" width="760" x="420" :y="c[2]"/>
          <text :x="444" :y="c[2] + 26" :fill="c[4]" font-size="13" font-weight="700">{{ s[c[0]] }}</text>
          <text :x="444" :y="c[2] + 50" fill="var(--dc3-box-name)" font-size="9">{{ s[c[1]] }}</text>
          <text :x="444" :y="c[2] + 70" fill="var(--dc3-text2)" font-size="8">{{ s[c[0] + 'o'] }}</text>
        </g>

        <!-- usage tips card -->
        <rect fill="var(--dc3-ext-fill)" height="628" rx="10" stroke="var(--dc3-ext-stroke)" stroke-width="1"
              width="150" x="1200" y="90"/>
        <text fill="var(--dc3-box-name)" font-size="10.5" font-weight="700" text-anchor="middle" x="1275" y="118">{{
            s.tipsTitle
          }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="160">{{ s.tips1 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="178">{{ s.tips2 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="210">{{ s.tips3 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="228">{{ s.tips4 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="260">{{ s.tips5 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="278">{{ s.tips6 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="310">{{ s.tips7 }}</text>
        <text fill="var(--dc3-text2)" font-size="8.5" x="1214" y="328">{{ s.tips8 }}</text>

        <!-- combination strip -->
        <text fill="var(--dc3-arrow-label)" font-size="9.5" font-weight="600" x="40" y="738">{{ s.combo }}</text>

        <!-- legend -->
        <polygon fill="var(--dc3-amber-fill)" points="60,752 84,764 60,776 36,764"
                 stroke="var(--dc3-amber-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-text2)" font-size="9" x="92" y="768">{{ s.legDiamond }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="220" y="758"/>
        <text fill="var(--dc3-text2)" font-size="9" x="242" y="768">{{ s.legRole }}</text>
        <line marker-end="url(#pd-ah)" stroke="var(--dc3-arrow)" stroke-width="1.2" x1="400" x2="430" y1="763"
              y2="763"/>
        <text fill="var(--dc3-text2)" font-size="9" x="436" y="768">{{ s.legArrow }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
