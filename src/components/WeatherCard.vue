<script setup>
const props = defineProps({
  city: Object,
})

const emit = defineEmits(['select', 'detail'])

const onDetail = (e) => {
  e.stopPropagation()
  emit('detail', props.city)
}
</script>

<template>
  <div class="weather-card" @click="emit('select', city.name)">
    <div class="card-head">
      <span class="city-name">{{ city.name }}</span>

      <button class="detail-btn" @click="onDetail">상세보기</button>
    </div>

    <p class="city-temp">현재 기온: {{ city.temp }}℃</p>

    <span v-if="city.temp >= 30" class="badge badge-hot"> 🔥 더움 (30도 이상) </span>
    <span v-else class="badge badge-cool"> ❄️ 선선함 (30도 미만) </span>
  </div>
</template>

<style scoped>
.weather-card {
  padding: 14px 16px;
  margin-bottom: 12px;
  border: 1px solid #dfe6e9;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    transform 0.15s;
}
.weather-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.city-name {
  font-size: 17px;
  font-weight: bold;
}
.badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: bold;
}
.badge-hot {
  background: #ffeaa7;
  color: #d63031;
}
.badge-cool {
  background: #dff9fb;
  color: #0984e3;
}
.city-temp {
  margin: 6px 0 10px;
  color: #636e72;
  font-size: 14px;
}
.detail-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: #00b894;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.detail-btn:hover {
  background: #00a884;
}
</style>
