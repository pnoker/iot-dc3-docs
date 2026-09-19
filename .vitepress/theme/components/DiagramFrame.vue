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
// 透传包装：历史上这里渲染一个“放大镜”按钮并维护一套自己的全屏态，
// 与图库的放大层（点卡片即放大）语义重复——文档里点放大镜、图库里点卡片，
// 两套放大入口嵌套冲突（图库放大层里再出现放大镜尤其没意义）。
// 按统一裁决：放大镜全站移除，本组件退化为纯 slot 包装，
// 保留文件以免改动 112 个图表组件的引用。
</script>

<template>
  <slot/>
</template>
