<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import SearchBox from './components/SearchBox.vue'
import WeatherCard from './components/WeatherCard.vue'
import StatusBar from './components/StatusBar.vue'

// ── 요구사항 1: 반응형 상태 ──
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 31, status: '맑음' },
  { id: 'city_05', name: '제주', temp: 22, status: '바람' },
])
const searchQuery = ref('')
const selectedCityInfo = ref(null)

// ── 요구사항 5: 본인 추가 상태 ──
const clickCount = ref(0)

// ── 요구사항 2: computed (검색어 필터링) ──
const filteredWeatherList = computed(() => {
  if (searchQuery.value === '') return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(searchQuery.value))
})

// ── 요구사항 5: 본인 추가 computed ──
const hotCityCount = computed(() => weatherList.value.filter((c) => c.temp >= 30).length)

// ── 요구사항 3: watch (selectedCityInfo 감시) ──
watch(selectedCityInfo, (newVal, oldVal) => {
  console.log('[watch] 선택 도시 변경:', oldVal?.name ?? '없음', '→', newVal?.name)
})

// ── 요구사항 3: watchEffect (searchQuery 추적) ──
watchEffect(() => {
  console.log('[watchEffect] 현재 검색어:', searchQuery.value || '(비어있음)')
})

// ── 요구사항 5: 본인 추가 watch ──
watch(clickCount, (n) => {
  console.log('[watch] 카드 클릭 누적:', n, '회')
})

// 카드 클릭 → 선택
const onSelect = (name) => {
  const found = weatherList.value.find((c) => c.name === name)
  selectedCityInfo.value = found
  clickCount.value++
}

// 1번 과제 기능 유지: 상세보기 버튼 → alert
const onDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-app">
    <h1 class="app-title">🌤️ 날씨 (Composition)</h1>

    <SearchBox v-model="searchQuery" />

    <section class="card-list">
      <div class="section-head">
        <h2 class="section-title">📍 지역별 날씨 현황</h2>
        <span class="meta">30도↑ {{ hotCityCount }}곳 · 클릭 {{ clickCount }}회</span>
      </div>

      <!-- 요구사항 4: 검색 결과 표시 -->
      <template v-if="filteredWeatherList.length > 0">
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          @select="onSelect"
          @detail="onDetail"
        />
      </template>
      <p v-else class="no-result">'{{ searchQuery }}'와(과) 일치하는 도시가 없습니다.</p>
    </section>

    <StatusBar :selected-city="selectedCityInfo" />
  </div>
</template>

<style scoped>
.weather-app {
  max-width: 480px;
  margin: 24px auto;
  padding: 20px;
  font-family:
    'Pretendard',
    -apple-system,
    sans-serif;
  color: #2d3436;
}
.app-title {
  font-size: 22px;
  margin-bottom: 20px;
}
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 2px solid #dfe6e9;
  margin-bottom: 14px;
}
.section-title {
  font-size: 16px;
  margin: 0;
}
.meta {
  font-size: 12px;
  color: #95a5a6;
}
.no-result {
  padding: 24px;
  text-align: center;
  color: #95a5a6;
  background: #f5f6fa;
  border-radius: 10px;
}
</style>
