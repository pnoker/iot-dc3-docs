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
    aria: '变更日志生成链路：make changelog 驱动 dc3/bin/changelog.py 扫描 git 提交历史（默认从上一个 release tag 到 HEAD），逐条解析 Conventional Commits 的类型、作用域与摘要；不符合规范的提交落入 Other Changes，命中 security 或 cve 关键词的提交提升到 Security 类别，其余按 12 类固定顺序聚合并写入 dc3/doc/CHANGE.md，由文档页 include 内联展示；重新生成的 CHANGE.md 以固定提交信息 docs(release): update generated changelog 回流 git，且会被生成器识别跳过',
    regSrc: '数据源 · git 与 pom',
    regGen: '生成器 · dc3/bin/changelog.py (Python 零依赖)',
    regOut: '产物与呈现',
    g1: 'git 提交历史', g1s: 'Conventional Commits 规范',
    g2: 'git tag', g2s: 'dc3.release.YYYYMMDD.NN ← make tag',
    g3: 'pom.xml', g3s: 'dc3.version 默认版本号',
    c0: 'make changelog', c0s: 'FROM · TO · VERSION 可覆盖',
    p1: '解析提交', p1s: 'type(scope): subject · ! 破坏性',
    d1: '符合规范?',
    other: 'Other Changes', otherS: '无类别落档',
    promote: 'Security 提升', promoteS: 'security / cve 关键词',
    p2: '按版本聚合', p2s: '12 类固定顺序 · Summary · Highlights',
    skip1: '跳过固定提交:', skip2: 'docs(release): update generated changelog',
    o1: 'dc3/doc/CHANGE.md', o1s: '生成器覆盖写回',
    o2: '文档页内联', o2s: 'include 指令 · 随生成更新',
    warn1: '不要手工编辑条目', warn2: '下次 make changelog 会覆盖',
    lblDrive: '驱动', lblEach: '逐条', lblYes: '是 · 12 类映射', lblNo: '否',
    lblKeywd: '关键词提升', lblJoin: '并入 Security',
    lblLog: 'git log FROM..HEAD', lblTag: 'FROM = 上一 release tag',
    lblVer: 'dc3.version → 版本分组标题',
    lblWrite: '覆盖写回', lblInclude: 'include',
    fb: 'docs(release): update generated changelog —— 唯一允许的固定提交，生成器识别并跳过 (INCLUDE_CHANGELOG_COMMITS=true 可放开)',
    note: '链路单向：提交历史是唯一原始数据 —— 一条含糊的 update 或 fix bug 只会变成一行没有价值的发布说明，提交规范本身就是这份文档质量的前提',
    legSrc: 'git 数据源', legGen: '解析 / 聚合', legTool: '命令与产物',
    legDoc: '文档呈现', legOther: '未归类 / 告警', legFb: '固定提交回流'
  },
  en: {
    aria: 'Changelog generation pipeline: make changelog drives dc3/bin/changelog.py to scan git history (by default from the previous release tag to HEAD), parsing each Conventional Commits type, scope and subject; non-conforming commits fall into Other Changes, commits matching security or cve keywords are promoted to Security, and the rest are aggregated in the fixed 12-category order and written to dc3/doc/CHANGE.md which the docs page inlines via include; the regenerated file flows back to git under the fixed subject docs(release): update generated changelog, which the generator itself recognizes and skips',
    regSrc: 'Sources · git & pom',
    regGen: 'Generator · dc3/bin/changelog.py (Python, zero deps)',
    regOut: 'Output & presentation',
    g1: 'git history', g1s: 'Conventional Commits',
    g2: 'git tag', g2s: 'dc3.release.YYYYMMDD.NN ← make tag',
    g3: 'pom.xml', g3s: 'dc3.version default version',
    c0: 'make changelog', c0s: 'FROM · TO · VERSION overridable',
    p1: 'parse commits', p1s: 'type(scope): subject · ! breaking',
    d1: 'conforming?',
    other: 'Other Changes', otherS: 'filed without category',
    promote: 'Security promotion', promoteS: 'security / cve keywords',
    p2: 'aggregate by version', p2s: 'fixed 12 categories · Summary · Highlights',
    skip1: 'skip the fixed commit:', skip2: 'docs(release): update generated changelog',
    o1: 'dc3/doc/CHANGE.md', o1s: 'overwritten by the generator',
    o2: 'Docs page inline', o2s: 'include directive · auto-updated',
    warn1: 'never hand-edit entries', warn2: 'the next run overwrites them',
    lblDrive: 'drives', lblEach: 'per commit', lblYes: 'yes · 12 categories', lblNo: 'no',
    lblKeywd: 'keyword promotion', lblJoin: 'joins Security',
    lblLog: 'git log FROM..HEAD', lblTag: 'FROM = previous release tag',
    lblVer: 'dc3.version → version heading',
    lblWrite: 'overwrite', lblInclude: 'include',
    fb: 'docs(release): update generated changelog — the only fixed commit allowed; the generator recognizes and skips it (set INCLUDE_CHANGELOG_COMMITS=true to include)',
    note: 'The pipeline is one-way: commit history is the only raw data — a vague "update" or "fix bug" becomes a worthless release note, so commit discipline is the precondition for this document',
    legSrc: 'git sources', legGen: 'Parse / aggregate', legTool: 'Command & output',
    legDoc: 'Doc rendering', legOther: 'Uncategorized / warning', legFb: 'Fixed commit loop'
  }
} as const

const s = computed(() => DICT[props.lang] ?? DICT.zh)
</script>

<template>
  <DiagramFrame>
    <div class="dc3-diagram">
      <svg :aria-label="s.aria" role="img" viewBox="0 0 1300 560">
        <defs>
          <marker id="cld-ah" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-arrow)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <marker id="cld-ah-rose" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
            <polygon fill="var(--dc3-rose-stroke)" points="0 0, 10 3.5, 0 7"/>
          </marker>
          <pattern id="cld-grid" height="40" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--dc3-grid)" stroke-width="0.5"/>
          </pattern>
        </defs>

        <rect fill="url(#cld-grid)" height="100%" width="100%"/>

        <!-- regions -->
        <rect fill="var(--dc3-region-be)" height="300" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="280" x="40" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="52" y="82">{{ s.regSrc }}</text>
        <rect fill="var(--dc3-region-be)" height="360" rx="12" stroke="var(--dc3-be-stroke)" stroke-dasharray="6,3"
              stroke-width="1" width="580" x="360" y="64"/>
        <text fill="var(--dc3-be-stroke)" font-size="10" font-weight="600" x="372" y="82">{{ s.regGen }}</text>
        <rect fill="var(--dc3-region-amber)" height="360" rx="12" stroke="var(--dc3-amber-stroke)"
              stroke-dasharray="6,3"
              stroke-width="1" width="300" x="960" y="64"/>
        <text fill="var(--dc3-amber-stroke)" font-size="10" font-weight="600" x="972" y="82">{{ s.regOut }}</text>

        <!-- arrows -->
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="480" x2="480" y1="162"
              y2="192"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="488" y="180">{{ s.lblDrive }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="584" x2="618" y1="222"
              y2="222"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="588" y="214">{{ s.lblEach }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="670" x2="670" y1="252"
              y2="352"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="end" x="660" y="270">{{ s.lblYes }}</text>
        <path d="M 716,222 L 775,222 L 775,286" fill="none" marker-end="url(#cld-ah-rose)"
              stroke="var(--dc3-rose-stroke)" stroke-width="1"/>
        <text fill="var(--dc3-rose-stroke)" font-size="8" x="724" y="212">{{ s.lblNo }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"
              x1="584" x2="736" y1="206" y2="138"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="655" y="164">{{ s.lblKeywd }}
        </text>
        <path d="M 870,154 L 870,382 L 684,382" fill="none" marker-end="url(#cld-ah)"
              stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" x="878" y="270">{{ s.lblJoin }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="304" x2="376" y1="158"
              y2="212"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="306" y="178">{{ s.lblLog }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="304" x2="376" y1="238"
              y2="232"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" x="306" y="258">{{ s.lblTag }}</text>
        <path d="M 180,346 L 180,440 L 530,440 L 530,412" fill="none" marker-end="url(#cld-ah)"
              stroke="var(--dc3-arrow)" stroke-width="1"/>
        <text fill="var(--dc3-arrow-label)" font-size="7.5" text-anchor="middle" x="355" y="434">{{ s.lblVer }}
        </text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="682" x2="976" y1="382"
              y2="382"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" text-anchor="middle" x="929" y="372">{{ s.lblWrite }}</text>
        <line marker-end="url(#cld-ah)" stroke="var(--dc3-arrow)" stroke-width="1" x1="1110" x2="1110" y1="354"
              y2="310"/>
        <text fill="var(--dc3-arrow-label)" font-size="8" x="1118" y="336">{{ s.lblInclude }}</text>
        <path d="M 1240,382 L 1276,382 L 1276,44 L 180,44 L 180,126" fill="none"
              marker-end="url(#cld-ah)" stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1"/>
        <text fill="var(--dc3-amber-stroke)" font-size="7.5" text-anchor="middle" x="730" y="38">{{ s.fb }}</text>

        <!-- source nodes -->
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="240"
              x="60" y="130"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="180" y="154">
          {{ s.g1 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="180" y="172">{{ s.g1s }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="240"
              x="60" y="210"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="180" y="234">
          {{ s.g2 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="7.5" text-anchor="middle" x="180" y="252">{{ s.g2s }}</text>
        <rect fill="var(--dc3-db-fill)" height="56" rx="6" stroke="var(--dc3-db-stroke)" stroke-width="1" width="240"
              x="60" y="290"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="11" text-anchor="middle" x="180" y="314">
          {{ s.g3 }}
        </text>
        <text fill="var(--dc3-db-text)" font-size="8" text-anchor="middle" x="180" y="332">{{ s.g3s }}</text>

        <!-- generator nodes -->
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="200" x="380" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="480" y="132">
          {{ s.c0 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="480" y="150">{{ s.c0s }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="200"
              x="380" y="196"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="480" y="218">
          {{ s.p1 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="480" y="236">{{ s.p1s }}</text>
        <polygon fill="var(--dc3-fe-fill)" points="670,192 716,222 670,252 624,222" stroke="var(--dc3-fe-stroke)"
                 stroke-width="1"/>
        <text fill="var(--dc3-box-name)" font-size="8" font-weight="600" text-anchor="middle" x="670" y="226">
          {{ s.d1 }}
        </text>
        <rect fill="var(--dc3-amber-fill)" height="44" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="180" x="740" y="110"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10" text-anchor="middle" x="830" y="128">
          {{ s.promote }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="830" y="144">{{ s.promoteS }}</text>
        <rect fill="var(--dc3-rose-fill)" height="44" rx="6" stroke="var(--dc3-rose-stroke)" stroke-width="1"
              width="150" x="700" y="290"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="775" y="308">
          {{ s.other }}
        </text>
        <text fill="var(--dc3-text2)" font-size="7.5" text-anchor="middle" x="775" y="324">{{ s.otherS }}</text>
        <rect fill="var(--dc3-be-fill)" height="52" rx="6" stroke="var(--dc3-be-stroke)" stroke-width="1" width="300"
              x="380" y="356"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="530" y="378">
          {{ s.p2 }}
        </text>
        <text fill="var(--dc3-be-text)" font-size="8" text-anchor="middle" x="530" y="396">{{ s.p2s }}</text>
        <rect fill="var(--dc3-ext-fill)" height="48" rx="6" stroke="var(--dc3-ext-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="200" x="380" y="290"/>
        <text fill="var(--dc3-text2)" font-size="7.5" x="390" y="310">{{ s.skip1 }}</text>
        <text fill="var(--dc3-text2)" font-size="7.5" x="390" y="326">{{ s.skip2 }}</text>

        <!-- output nodes -->
        <rect fill="var(--dc3-rose-fill)" height="60" rx="6" stroke="var(--dc3-rose-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="260" x="980" y="140"/>
        <text fill="var(--dc3-rose-stroke)" font-size="9.5" font-weight="600" text-anchor="middle" x="1110" y="166">
          {{ s.warn1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1110" y="186">{{ s.warn2 }}</text>
        <rect fill="var(--dc3-fe-fill)" height="56" rx="6" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="260"
              x="980" y="250"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1110" y="274">
          {{ s.o2 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1110" y="292">{{ s.o2s }}</text>
        <rect fill="var(--dc3-amber-fill)" height="52" rx="6" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="260" x="980" y="356"/>
        <text class="d-name" fill="var(--dc3-box-name)" font-size="10.5" text-anchor="middle" x="1110" y="378">
          {{ s.o1 }}
        </text>
        <text fill="var(--dc3-text2)" font-size="8" text-anchor="middle" x="1110" y="396">{{ s.o1s }}</text>

        <!-- note -->
        <rect fill="var(--dc3-region-amber)" height="36" rx="6" stroke="var(--dc3-amber-stroke)" stroke-dasharray="4,3"
              stroke-width="1" width="1220" x="40" y="456"/>
        <text fill="var(--dc3-amber-stroke)" font-size="8.5" x="56" y="478">{{ s.note }}</text>

        <!-- legend -->
        <rect fill="var(--dc3-db-fill)" height="11" rx="2" stroke="var(--dc3-db-stroke)" stroke-width="1" width="16"
              x="60" y="516"/>
        <text fill="var(--dc3-text2)" font-size="9" x="82" y="525">{{ s.legSrc }}</text>
        <rect fill="var(--dc3-be-fill)" height="11" rx="2" stroke="var(--dc3-be-stroke)" stroke-width="1" width="16"
              x="200" y="516"/>
        <text fill="var(--dc3-text2)" font-size="9" x="222" y="525">{{ s.legGen }}</text>
        <rect fill="var(--dc3-amber-fill)" height="11" rx="2" stroke="var(--dc3-amber-stroke)" stroke-width="1"
              width="16" x="340" y="516"/>
        <text fill="var(--dc3-text2)" font-size="9" x="362" y="525">{{ s.legTool }}</text>
        <rect fill="var(--dc3-fe-fill)" height="11" rx="2" stroke="var(--dc3-fe-stroke)" stroke-width="1" width="16"
              x="490" y="516"/>
        <text fill="var(--dc3-text2)" font-size="9" x="512" y="525">{{ s.legDoc }}</text>
        <rect fill="var(--dc3-rose-fill)" height="11" rx="2" stroke="var(--dc3-rose-stroke)" stroke-width="1" width="16"
              x="620" y="516"/>
        <text fill="var(--dc3-text2)" font-size="9" x="642" y="525">{{ s.legOther }}</text>
        <line stroke="var(--dc3-amber-stroke)" stroke-dasharray="5,4" stroke-width="1" x1="780" x2="808" y1="522"
              y2="522"/>
        <text fill="var(--dc3-text2)" font-size="9" x="814" y="525">{{ s.legFb }}</text>
      </svg>
    </div>
  </DiagramFrame>
</template>
