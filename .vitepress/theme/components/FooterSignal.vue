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

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const root = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let host: HTMLElement | null = null
let context: CanvasRenderingContext2D | null = null
let resizeObserver: ResizeObserver | null = null
let viewportObserver: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null
let animationFrame = 0
let running = false
let reducedMotion = false
let inViewport = false
let width = 0
let height = 0
let dpr = 1
let lastPaintAt = 0

function generatePoints(count: number, time: number, frequency: number, amplitude: number, baseline: number) {
  const points: number[] = []
  for (let index = 0; index < count; index += 1) {
    const x = index / (count - 1)
    const y = Math.sin(x * Math.PI * 1.7 * frequency + time * 0.7) * 0.5
      + Math.cos(x * Math.PI * 2.3 * frequency + time * 1.1) * 0.25
      + Math.sin(x * Math.PI * 4.1 * frequency + time * 0.5) * 0.15
    points.push(y * amplitude + baseline)
  }
  return points
}

function drawLine(points: number[], stroke: string | CanvasGradient, lineWidth: number) {
  if (!context) return
  context.beginPath()
  context.strokeStyle = stroke
  context.lineWidth = lineWidth
  context.lineJoin = 'round'
  context.lineCap = 'round'
  points.forEach((point, index) => {
    const x = index / (points.length - 1) * width
    if (index === 0) context?.moveTo(x, point)
    else context?.lineTo(x, point)
  })
  context.stroke()
}

function pointOnLine(points: number[], progress: number) {
  const position = progress * (points.length - 1)
  const index = Math.floor(position)
  const nextIndex = Math.min(points.length - 1, index + 1)
  const fraction = position - index
  return points[index] + (points[nextIndex] - points[index]) * fraction
}

function paint(time: number) {
  if (!context || !width || !height) return
  context.clearRect(0, 0, width, height)

  const count = Math.max(90, Math.floor(width / 4))
  const top = height * 0.08
  const bottom = height * 0.94
  const middle = (top + bottom) / 2
  const amplitude = (bottom - top) * 0.34
  const isDark = document.documentElement.classList.contains('dark')

  const grid = context.createLinearGradient(0, top, 0, bottom)
  grid.addColorStop(0, 'rgba(18, 150, 219, 0)')
  grid.addColorStop(0.5, isDark ? 'rgba(116, 206, 255, 0.08)' : 'rgba(18, 150, 219, 0.07)')
  grid.addColorStop(1, 'rgba(18, 150, 219, 0)')
  context.strokeStyle = grid
  context.lineWidth = 1
  for (let column = 0; column <= 24; column += 1) {
    const x = column / 24 * width
    context.beginPath()
    context.moveTo(x, top)
    context.lineTo(x, bottom)
    context.stroke()
  }
  for (let row = 1; row < 5; row += 1) {
    const y = top + (bottom - top) / 5 * row
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  const rear = generatePoints(count, time * 0.24, 0.68, amplitude * 0.58, middle - amplitude * 0.12)
  const secondary = generatePoints(count, time * 0.42, 0.96, amplitude * 0.76, middle + amplitude * 0.04)
  const main = generatePoints(count, time * 0.72, 1.28, amplitude, middle)
  const echo = generatePoints(count, time * 0.52, 1.64, amplitude * 0.43, middle + amplitude * 0.22)

  drawLine(rear, isDark ? 'rgba(110, 210, 255, 0.12)' : 'rgba(18, 150, 219, 0.1)', 1)
  drawLine(secondary, isDark ? 'rgba(77, 223, 218, 0.2)' : 'rgba(27, 178, 165, 0.17)', 1.2)
  drawLine(echo, isDark ? 'rgba(164, 169, 255, 0.17)' : 'rgba(91, 116, 235, 0.15)', 1)

  const mainGradient = context.createLinearGradient(0, 0, width, 0)
  mainGradient.addColorStop(0, 'rgba(18, 150, 219, 0.08)')
  mainGradient.addColorStop(0.2, isDark ? 'rgba(98, 205, 255, 0.8)' : 'rgba(18, 150, 219, 0.72)')
  mainGradient.addColorStop(0.52, isDark ? 'rgba(80, 226, 215, 0.84)' : 'rgba(27, 178, 165, 0.76)')
  mainGradient.addColorStop(0.78, isDark ? 'rgba(169, 173, 255, 0.78)' : 'rgba(91, 116, 235, 0.7)')
  mainGradient.addColorStop(1, 'rgba(91, 116, 235, 0.08)')

  context.beginPath()
  main.forEach((point, index) => {
    const x = index / (main.length - 1) * width
    if (index === 0) context?.moveTo(x, point)
    else context?.lineTo(x, point)
  })
  context.lineTo(width, bottom)
  context.lineTo(0, bottom)
  context.closePath()
  const area = context.createLinearGradient(0, top, 0, bottom)
  area.addColorStop(0, isDark ? 'rgba(48, 183, 242, 0.14)' : 'rgba(18, 150, 219, 0.13)')
  area.addColorStop(0.42, isDark ? 'rgba(37, 157, 211, 0.05)' : 'rgba(18, 150, 219, 0.04)')
  area.addColorStop(1, 'rgba(18, 150, 219, 0)')
  context.fillStyle = area
  context.fill()

  context.save()
  context.shadowColor = isDark ? 'rgba(78, 201, 255, 0.42)' : 'rgba(18, 150, 219, 0.28)'
  context.shadowBlur = 16
  drawLine(main, mainGradient, 2)
  context.restore()

  for (const offset of [0, 0.34, 0.68]) {
    const progress = (time * 0.045 + offset) % 1
    const x = progress * width
    const y = pointOnLine(main, progress)
    const halo = context.createRadialGradient(x, y, 0, x, y, 13)
    halo.addColorStop(0, 'rgba(229, 253, 255, 0.95)')
    halo.addColorStop(0.22, 'rgba(80, 215, 241, 0.72)')
    halo.addColorStop(1, 'rgba(18, 150, 219, 0)')
    context.beginPath()
    context.fillStyle = halo
    context.arc(x, y, 13, 0, Math.PI * 2)
    context.fill()
    context.beginPath()
    context.fillStyle = isDark ? '#dcfbff' : '#fff'
    context.arc(x, y, 2.2, 0, Math.PI * 2)
    context.fill()
  }

  const edgeFade = context.createLinearGradient(0, 0, width, 0)
  edgeFade.addColorStop(0, 'rgba(0, 0, 0, 0)')
  edgeFade.addColorStop(0.03, 'rgba(0, 0, 0, 1)')
  edgeFade.addColorStop(0.97, 'rgba(0, 0, 0, 1)')
  edgeFade.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = edgeFade
  context.globalCompositeOperation = 'destination-in'
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'
}

function frame(now: number) {
  if (!running || !context) return
  if (!lastPaintAt || now - lastPaintAt >= 33) {
    lastPaintAt = now
    paint(now / 1000)
  }
  animationFrame = requestAnimationFrame(frame)
}

function resize() {
  const element = canvas.value
  const parent = root.value
  if (!element || !parent) return
  width = parent.clientWidth
  height = parent.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5)
  element.width = Math.round(width * dpr)
  element.height = Math.round(height * dpr)
  context = element.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (!running) paint(0)
}

function start() {
  if (running || reducedMotion || document.hidden || !inViewport) return
  running = true
  lastPaintAt = 0
  animationFrame = requestAnimationFrame(frame)
}

function stop() {
  running = false
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function syncPlayback() {
  if (document.hidden || !inViewport) stop()
  else start()
}

onMounted(() => {
  host = document.querySelector('.VPFooter') as HTMLElement | null
  if (!host || !root.value) return
  host.insertBefore(root.value, host.firstChild)
  root.value.classList.add('is-mounted')
  host.classList.add('has-footer-signal')
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(root.value)
  themeObserver = new MutationObserver(() => {
    if (reducedMotion || !running) paint(0)
  })
  themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class']})
  viewportObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry?.isIntersecting ?? true
    syncPlayback()
    if (reducedMotion && inViewport) paint(0)
  }, {rootMargin: '180px 0px', threshold: 0.01})
  viewportObserver.observe(host)
  document.addEventListener('visibilitychange', syncPlayback)
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  viewportObserver?.disconnect()
  themeObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncPlayback)
  host?.classList.remove('has-footer-signal')
  host = null
  context = null
})
</script>

<template>
  <div ref="root" class="footer-signal" aria-hidden="true">
    <canvas ref="canvas" />
    <span class="footer-signal-scan" />
  </div>
</template>

<style scoped>
.footer-signal {
  display: none;
}

.footer-signal.is-mounted {
  position: absolute;
  z-index: 0;
  top: 8px;
  right: 0;
  left: 0;
  display: block;
  height: 96px;
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
}

.footer-signal canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.footer-signal-scan {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -24%;
  width: 24%;
  background: linear-gradient(90deg, transparent, rgba(117, 225, 255, .06), rgba(255, 255, 255, .18), transparent);
  filter: blur(6px);
  transform: skewX(-10deg);
  animation: footer-signal-scan 8s linear infinite;
}

@keyframes footer-signal-scan {
  to { left: 112%; }
}

@media (max-width: 720px) {
  .footer-signal.is-mounted {
    top: 4px;
    height: 80px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-signal-scan { animation: none; }
}
</style>
