<script setup>
import { useBagStore } from '@/stores/bagStore'

/* 사람마다 비거리가 다르므로 직접 입력해 두면 추천 정확도가 올라간다.
 * 입력값은 스토어를 통해 localStorage에 저장된다. */
const bagStore = useBagStore()
</script>

<template>
  <div class="bag-editor">
    <div class="bag-head">
      <p class="bag-hint">내 캐리 거리를 입력해 두면 추천이 정확해집니다. (단위: m)</p>
      <button class="reset-btn" @click="bagStore.resetBag()">기본값으로</button>
    </div>

    <ul class="club-list">
      <li v-for="club in bagStore.clubs" :key="club.id" class="club-row">
        <label :for="`club-${club.id}`">{{ club.name }}</label>
        <input
          :id="`club-${club.id}`"
          type="number"
          min="0"
          max="400"
          step="1"
          :value="club.distance"
          @input="bagStore.setDistance(club.id, $event.target.value)"
        />
        <span class="unit">m</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bag-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.bag-hint {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-faint);
}
.reset-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.reset-btn:hover {
  background: var(--c-rule);
  color: var(--c-ink);
}
.reset-btn:active {
  transform: scale(0.93);
}
.club-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.club-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
}
.club-row label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-ink-soft);
}
.club-row input {
  width: 62px;
  padding: 6px 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--c-paper);
  color: var(--c-ink);
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.club-row input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--c-accent-soft);
}
.unit {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-ink-faint);
}
</style>
