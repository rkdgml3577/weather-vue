<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import { useDisplayTemp } from '@/composables/useDisplayTemp'

const props = defineProps({
  selectedCourse: Object,
  holeText: String,
})

/* 선택한 골프장의 낙뢰 위험 여부 */
const isStormy = computed(() => (props.selectedCourse?.lightning ?? 0) >= 50)

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => props.selectedCourse?.temp)
</script>

<template>
  <aside class="memo" :class="{ stormy: isStormy, empty: !selectedCourse }">
    <span class="label">SELECTED</span>

    <template v-if="selectedCourse">
      <p class="memo-name">{{ selectedCourse.name }}</p>
      <p class="memo-line num">
        {{ selectedCourse.status }} · {{ displayTemp }}{{ unitSymbol }} ·
        {{ selectedCourse.humidity }}% · {{ selectedCourse.windSpeed }}m/s
      </p>
      <p class="memo-line">홀 방향 {{ holeText }}쪽</p>
      <p v-if="isStormy" class="memo-alert">
        <AppIcon name="alert" :size="14" /> 카트로 대피하세요
      </p>
    </template>

    <p v-else class="memo-empty">카드를 클릭하거나 검색해 보세요.</p>
  </aside>
</template>

<style scoped>
/* ===== 선택 요약 : 짙은 대비 타일 ===== */
.memo {
  padding: 20px;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, var(--c-deep) 0%, var(--c-deep-2) 100%);
  color: #fff;
  box-shadow: var(--shadow);
}
.memo :deep(.label) {
  color: rgba(255, 255, 255, 0.5);
}
.memo.empty {
  background: var(--c-paper);
  color: var(--c-ink);
}
.memo.empty :deep(.label) {
  color: var(--c-ink-faint);
}
.memo.stormy {
  background: var(--c-danger);
}
.memo-name {
  margin: 8px 0 4px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.035em;
}
.memo-line {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
}
.memo-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.16);
  font-size: 13px;
  font-weight: 800;
  color: #fff;
}
.memo-empty {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-faint);
}
</style>
