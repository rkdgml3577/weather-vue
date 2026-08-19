<script setup>
defineProps({
  selectedCity: Object,
})
</script>

<template>
  <footer class="status-bar">
    <span v-if="selectedCity">
      ✅ <strong>{{ selectedCity.name }}</strong
      >이(가) 선택되었습니다. (현재 {{ selectedCity.status }}, {{ selectedCity.temp }}℃)
    </span>
    <span v-else class="status-empty"> 카드를 클릭해 도시를 선택해 보세요. </span>
  </footer>
</template>

<style scoped>
.status-bar {
  margin-top: 20px;
  padding: 12px 16px;
  background: #e8f5e9;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}
.status-empty {
  color: #95a5a6;
}
</style>
