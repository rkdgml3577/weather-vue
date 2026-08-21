<script setup>
import { useConfigStore } from '@/stores/configStore'

/* 스토어를 직접 구독한다: 부모에게 props를 받을 필요가 없다 */
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">
      날씨 단위: {{ configStore.unitLabel }}({{ configStore.unitSymbol }})
    </span>
    <button class="unit-btn" @click="configStore.toggleUnit()">단위 변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 6px;
}
.unit-label {
  font-size: 11px;
  color: var(--c-text-sub);
  white-space: nowrap;
}
.unit-btn {
  padding: 5px 10px;
  border: 1px solid var(--c-primary);
  border-radius: 999px;
  background: var(--c-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s;
}
.unit-btn:hover {
  background: var(--c-primary-dark);
  border-color: var(--c-primary-dark);
}
</style>
