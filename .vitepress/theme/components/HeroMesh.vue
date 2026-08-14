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

<!-- DC3 Protocol Mesh:首页 hero 静态背景层,Device(离散) → Protocol(汇聚) → DC3 → Agent(有序)。
     与 og-image / banner / social-preview 同源的品牌资产;极低透明度,作为 HeroWaves/HeroParticles 之下的语义底图 -->
<script lang="ts" setup>
</script>

<template>
  <svg
    class="hero-mesh"
    viewBox="0 0 1600 620"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="hero-mesh-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#38c6ec" stop-opacity="0.5"/>
        <stop offset="0.5" stop-color="#5a8dee" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#8f6ff2" stop-opacity="0.6"/>
      </linearGradient>
    </defs>

    <!-- 主脊数据流 -->
    <path
      d="M40 470 C 260 452, 460 440, 660 430 C 900 418, 1120 380, 1560 250"
      fill="none" stroke="url(#hero-mesh-fade)" stroke-opacity="0.16" stroke-width="1.2"
    />
    <path
      d="M40 470 C 260 452, 460 440, 660 430 C 900 418, 1120 380, 1560 250"
      fill="none" stroke="#5a8dee" stroke-opacity="0.14" stroke-width="1.5"
      stroke-dasharray="1 10" stroke-linecap="round"
    />

    <!-- Device:左侧离散小节点 -->
    <g fill="#38c6ec">
      <circle cx="60" cy="470" r="2.2" fill-opacity="0.2"/>
      <circle cx="96" cy="500" r="1.6" fill-opacity="0.15"/>
      <circle cx="128" cy="452" r="1.7" fill-opacity="0.16"/>
      <circle cx="162" cy="488" r="2.0" fill-opacity="0.17"/>
      <circle cx="196" cy="446" r="1.6" fill-opacity="0.14"/>
      <circle cx="226" cy="478" r="1.7" fill-opacity="0.15"/>
      <circle cx="110" cy="416" r="1.6" fill-opacity="0.13"/>
      <circle cx="212" cy="412" r="1.6" fill-opacity="0.13"/>
    </g>
    <g stroke="#38c6ec" stroke-opacity="0.12">
      <line x1="62" y1="470" x2="96" y2="500"/>
      <line x1="96" y1="500" x2="128" y2="452"/>
      <line x1="128" y1="452" x2="162" y2="488"/>
      <line x1="162" y1="488" x2="196" y2="446"/>
      <line x1="196" y1="446" x2="226" y2="478"/>
      <line x1="110" y1="416" x2="128" y2="452"/>
      <line x1="212" y1="412" x2="196" y2="446"/>
    </g>

    <!-- Protocol:小三角链开始汇聚 -->
    <g fill="none" stroke="#5a8dee" stroke-opacity="0.15">
      <path d="M320 458 L329 475 L311 475 Z"/>
      <path d="M392 442 L401 459 L383 459 Z"/>
      <path d="M464 450 L473 467 L455 467 Z"/>
    </g>
    <g fill="#5a8dee">
      <circle cx="320" cy="458" r="1.8" fill-opacity="0.18"/>
      <circle cx="392" cy="442" r="1.8" fill-opacity="0.18"/>
      <circle cx="464" cy="450" r="1.8" fill-opacity="0.18"/>
      <circle cx="520" cy="436" r="2.0" fill-opacity="0.18"/>
      <circle cx="548" cy="450" r="2.0" fill-opacity="0.18"/>
    </g>
    <g stroke="#5a8dee" stroke-opacity="0.13">
      <line x1="329" y1="466" x2="383" y2="450"/>
      <line x1="401" y1="456" x2="455" y2="458"/>
      <line x1="473" y1="460" x2="520" y2="438"/>
    </g>

    <!-- DC3:中央星团环 -->
    <circle cx="660" cy="430" r="26" fill="none" stroke="#5a8dee" stroke-opacity="0.15"/>
    <circle cx="660" cy="430" r="3.2" fill="#7cc4f5" fill-opacity="0.26"/>
    <g fill="#5a8dee">
      <circle cx="660" cy="414" r="1.9" fill-opacity="0.18"/>
      <circle cx="674" cy="419" r="1.9" fill-opacity="0.18"/>
      <circle cx="679" cy="434" r="1.9" fill-opacity="0.18"/>
      <circle cx="670" cy="447" r="1.9" fill-opacity="0.18"/>
      <circle cx="655" cy="449" r="1.9" fill-opacity="0.18"/>
      <circle cx="644" cy="439" r="1.9" fill-opacity="0.18"/>
      <circle cx="645" cy="423" r="1.9" fill-opacity="0.18"/>
    </g>
    <g stroke="#5a8dee" stroke-opacity="0.12">
      <line x1="660" y1="430" x2="660" y2="414"/>
      <line x1="660" y1="430" x2="674" y2="419"/>
      <line x1="660" y1="430" x2="679" y2="434"/>
      <line x1="660" y1="430" x2="670" y2="447"/>
      <line x1="660" y1="430" x2="655" y2="449"/>
      <line x1="660" y1="430" x2="644" y2="439"/>
      <line x1="660" y1="430" x2="645" y2="423"/>
    </g>

    <!-- Agent:右侧有序网格与弧 -->
    <g fill="#8f6ff2">
      <circle cx="1180" cy="330" r="1.8" fill-opacity="0.18"/>
      <circle cx="1210" cy="330" r="1.8" fill-opacity="0.18"/>
      <circle cx="1240" cy="330" r="1.8" fill-opacity="0.18"/>
      <circle cx="1270" cy="330" r="1.8" fill-opacity="0.18"/>
      <circle cx="1180" cy="356" r="1.8" fill-opacity="0.18"/>
      <circle cx="1210" cy="356" r="1.8" fill-opacity="0.18"/>
      <circle cx="1240" cy="356" r="1.8" fill-opacity="0.18"/>
      <circle cx="1270" cy="356" r="1.8" fill-opacity="0.18"/>
      <circle cx="1330" cy="290" r="2.4" fill-opacity="0.22"/>
      <circle cx="1362" cy="316" r="1.8" fill-opacity="0.17"/>
    </g>
    <g stroke="#8f6ff2" stroke-opacity="0.13">
      <line x1="1180" y1="330" x2="1270" y2="330"/>
      <line x1="1180" y1="356" x2="1270" y2="356"/>
      <line x1="1180" y1="330" x2="1180" y2="356"/>
      <line x1="1240" y1="330" x2="1240" y2="356"/>
      <line x1="1270" y1="330" x2="1270" y2="356"/>
    </g>
    <path d="M1240 412 A 150 150 0 0 1 1408 300" fill="none" stroke="#8f6ff2" stroke-opacity="0.12" stroke-dasharray="2 8"/>
  </svg>
</template>

<style scoped>
.hero-mesh {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
