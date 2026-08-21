<script setup>
import { computed } from 'vue'
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
  <footer class="status-bar" :class="{ stormy: isStormy, empty: !selectedCourse }">
    <span v-if="selectedCourse">
      ✅ <strong>{{ selectedCourse.name }}</strong
      >이(가) 선택되었습니다. ({{ selectedCourse.status }}, {{ displayTemp }}{{ unitSymbol }} · 습도
      {{ selectedCourse.humidity }}% · 풍속 {{ selectedCourse.windSpeed }}m/s · 낙뢰
      {{ selectedCourse.lightning }}%)
      <br />
      <small>현재 홀 방향: {{ holeText }}쪽</small>
      <strong v-if="isStormy" class="evacuate"><br />⛈️ 카트로 대피하세요!</strong>
    </span>
    <span v-else class="status-empty"> 카드를 클릭하거나 검색해 보세요. </span>
  </footer>
</template>

<style scoped>
.status-bar {
  padding: 12px 14px;
  border-radius: var(--radius);
  background: var(--c-primary-soft);
  text-align: center;
  font-size: 13px;
  line-height: 1.7;
}
.status-bar.empty {
  background: var(--c-good-bg);
}
.status-bar.stormy {
  background: var(--c-danger-bg);
}
.evacuate {
  color: var(--c-danger);
}
.status-empty {
  color: var(--c-good);
}
small {
  color: var(--c-text-sub);
  font-size: 11px;
}
</style>
