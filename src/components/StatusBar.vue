<script setup>
defineProps({
  selectedCity: String,
})
</script>

<template>
  <footer class="status-bar">
    <span v-if="selectedCity">
      ✅ <strong>{{ selectedCity }}</strong
      >(이)가 선택되었습니다.
    </span>
    <span v-else class="status-empty"> 카드를 클릭하거나 검색해 보세요. </span>
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
