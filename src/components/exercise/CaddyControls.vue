<script setup>
defineProps({
  holeDeg: Number, // 홀(타겟) 진행 방향 0=북, 90=동, 180=남, 270=서
  playerLevel: String, // beginner | amateur | pro
})

defineEmits(['update:holeDeg', 'update:playerLevel'])

const HOLE_DIRECTIONS = [
  { deg: 0, label: 'N', ko: '북' },
  { deg: 90, label: 'E', ko: '동' },
  { deg: 180, label: 'S', ko: '남' },
  { deg: 270, label: 'W', ko: '서' },
]

const PLAYER_LEVELS = [
  { value: 'beginner', label: '초급' },
  { value: 'amateur', label: '중급' },
  { value: 'pro', label: '상급' },
]
</script>

<template>
  <div class="picker">
    <span class="label">HOLE</span>
    <div class="options">
      <button
        v-for="dir in HOLE_DIRECTIONS"
        :key="dir.deg"
        :class="{ active: holeDeg === dir.deg }"
        @click="$emit('update:holeDeg', dir.deg)"
      >
        <span class="mark">{{ dir.label }}</span
        >{{ dir.ko }}
      </button>
    </div>
  </div>

  <div class="picker">
    <span class="label">PLAYER</span>
    <div class="options">
      <button
        v-for="lv in PLAYER_LEVELS"
        :key="lv.value"
        :class="{ active: playerLevel === lv.value }"
        @click="$emit('update:playerLevel', lv.value)"
      >
        {{ lv.label }}
      </button>
    </div>
  </div>

  <p class="picker-hint">실력이 낮을수록 탄도가 높아 바람 영향을 크게 받습니다.</p>
</template>

<style scoped>
/* ===== 세그먼트 컨트롤 : 누르는 맛 ===== */
.picker {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}
.picker .label {
  width: 54px;
  flex-shrink: 0;
}
.options {
  display: flex;
  gap: 5px;
  flex: 1;
  min-width: 0;
  max-width: 460px;
  padding: 5px;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
}
.options button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--c-ink-soft);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease),
    box-shadow 0.18s var(--ease);
}
.options button:hover {
  color: var(--c-ink);
}
.options button:active {
  transform: scale(0.93);
}
.options button.active {
  background: var(--c-paper);
  color: var(--c-ink);
  font-weight: 800;
  box-shadow: var(--shadow);
}
.mark {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--c-accent);
}
.picker-hint {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

@media (max-width: 520px) {
  .picker {
    flex-direction: column;
    align-items: stretch;
    gap: 7px;
  }
  .picker .label {
    width: auto;
  }
}
</style>
