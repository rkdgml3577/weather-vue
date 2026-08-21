<script setup>
defineProps({
  holeDeg: Number, // 홀(타겟) 진행 방향 0=북, 90=동, 180=남, 270=서
  playerLevel: String, // beginner | amateur | pro
})

defineEmits(['update:holeDeg', 'update:playerLevel'])

const HOLE_DIRECTIONS = [
  { deg: 0, label: '북 ↑' },
  { deg: 90, label: '동 →' },
  { deg: 180, label: '남 ↓' },
  { deg: 270, label: '서 ←' },
]

const PLAYER_LEVELS = [
  { value: 'beginner', label: '초급' },
  { value: 'amateur', label: '중급' },
  { value: 'pro', label: '상급' },
]
</script>

<template>
  <div class="caddy-picker">
    <span class="picker-label">⛳ 홀 방향:</span>
    <button
      v-for="dir in HOLE_DIRECTIONS"
      :key="dir.deg"
      :class="{ active: holeDeg === dir.deg }"
      @click="$emit('update:holeDeg', dir.deg)"
    >
      {{ dir.label }}
    </button>
  </div>

  <div class="caddy-picker">
    <span class="picker-label">🏌️ 플레이어:</span>
    <button
      v-for="lv in PLAYER_LEVELS"
      :key="lv.value"
      :class="{ active: playerLevel === lv.value }"
      @click="$emit('update:playerLevel', lv.value)"
    >
      {{ lv.label }}
    </button>
    <span class="picker-hint">실력이 낮을수록 탄도가 높아 바람 영향을 크게 받습니다.</span>
  </div>
</template>

<style scoped>
.caddy-picker {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.caddy-picker:last-child {
  margin-bottom: 0;
}
.picker-label {
  font-size: 13px;
  font-weight: 700;
  margin-right: 2px;
}
.picker-hint {
  width: 100%;
  margin-top: 2px;
  font-size: 11px;
  color: var(--c-text-sub);
}
.caddy-picker button {
  padding: 6px 14px;
  border: 1px solid var(--c-border-strong);
  border-radius: 999px;
  background: var(--c-surface);
  color: var(--c-text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
}
.caddy-picker button:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}
.caddy-picker button.active {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: #fff;
  font-weight: 700;
}
</style>
