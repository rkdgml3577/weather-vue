<script setup>
import { computed } from 'vue'

/* ===== 선 아이콘 세트 =====
 * 이모지는 플랫폼마다 모양이 다르고 톤을 맞출 수 없어 직접 그린 SVG로 대체했다.
 * 모두 24×24 좌표계 · stroke 기반 · currentColor를 따르므로 글자색과 함께 움직인다.
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
  /* 채워 그리는 아이콘(도장 느낌)일 때 */
  filled: { type: Boolean, default: false },
})

const PATHS = {
  wind: [
    'M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2',
    'M9.6 4.6A2 2 0 1 1 11 8H2',
    'M10.8 19.4A2 2 0 1 0 12 16H2',
  ],
  droplet: [
    'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5.5 12 3c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
  ],
  bolt: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  search: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.35-4.35'],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  target: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
    'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  globe: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M2 12h20',
    'M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  ],
  refresh: ['M20.5 12a8.5 8.5 0 1 1-2.5-6', 'M21 3v6h-6'],
  loader: [
    'M12 3v3',
    'M12 18v3',
    'M5.6 5.6l2.1 2.1',
    'M16.3 16.3l2.1 2.1',
    'M3 12h3',
    'M18 12h3',
    'M5.6 18.4l2.1-2.1',
    'M16.3 7.7l2.1-2.1',
  ],
  alert: [
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
  sunset: [
    'M17 18a5 5 0 0 0-10 0',
    'M12 2v7',
    'M4.2 10.2l1.4 1.4',
    'M1 18h2',
    'M21 18h2',
    'M18.4 11.6l1.4-1.4',
    'M23 22H1',
    'M16 5l-4 4-4-4',
  ],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6.5V12l3.5 2'],
  flag: ['M4 15s1.2-1 4-1 5.2 2 8 2 4-1 4-1V3s-1.2 1-4 1-5.2-2-8-2-4 1-4 1z', 'M4 22v-7'],
  club: ['M15.5 2.5 9.5 16.5', 'M9.5 16.5c-1.6 1-2.3 2.6-1.3 3.7 1 1.1 2.8.6 4-1l1.1-1.9z'],
  calculator: [
    'M5 2.5h14v19H5z',
    'M8 6h8',
    'M8.5 11h.01',
    'M12 11h.01',
    'M15.5 11h.01',
    'M8.5 15h.01',
    'M12 15h.01',
    'M15.5 15h.01',
    'M8.5 18.5h7',
  ],
  bag: ['M5.5 8h13l1 12.5h-15z', 'M9 8V6a3 3 0 0 1 6 0v2'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4.5', 'M12 8h.01'],
  chart: ['M3.5 3.5v17h17', 'M7 15l3.5-4.5 3 3L19 7'],
  help: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M9.2 9.2a3 3 0 0 1 5.8 1c0 2-3 2.6-3 2.6',
    'M12 17.5h.01',
  ],
  check: ['M20 6.5 9.5 17 4.5 12'],
  rain: [
    'M19.5 16.5A4.5 4.5 0 0 0 18 7.7h-1.2A7.5 7.5 0 1 0 4.5 15',
    'M8 18.5v2.5',
    'M12 19v3',
    'M16 18.5v2.5',
  ],
  plus: ['M12 5.5v13', 'M5.5 12h13'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  home: ['M3.5 10.5 12 3.5l8.5 7', 'M5.5 9.5V20.5h13V9.5'],
  book: ['M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5z', 'M8 3v18'],
  thumb: [
    'M7 21V10.5',
    'M7 10.5 10.8 2.6A2.6 2.6 0 0 1 14 5.1v3.9h4.9a2 2 0 0 1 2 2.4l-1.4 7.2a2 2 0 0 1-2 1.4H7',
  ],
  frown: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M8.5 16c.9-1.2 2.1-1.8 3.5-1.8s2.6.6 3.5 1.8',
    'M9 9.5h.01',
    'M15 9.5h.01',
  ],
}

const paths = computed(() => PATHS[props.name] ?? [])
const px = computed(() => `${props.size}px`)
</script>

<template>
  <svg
    class="app-icon"
    :class="{ filled }"
    :width="px"
    :height="px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: -0.16em;
}
.app-icon.filled {
  fill: currentColor;
  fill-opacity: 0.14;
}
</style>
