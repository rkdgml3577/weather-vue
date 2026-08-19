<script setup>
import { ref } from 'vue'
import SearchBox from './components/SearchBox.vue'
import WeatherCard from './components/WeatherCard.vue'
import StatusBar from './components/StatusBar.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 31, status: '맑음' },
  { id: 'city_05', name: '제주', temp: 22, status: '바람' },
  { id: 'city_06', name: '광주', temp: 29, status: '맑음' },
  { id: 'city_07', name: '대전', temp: 27, status: '비' },
  { id: 'city_08', name: '강릉', temp: 30, status: '맑음' },
  { id: 'city_09', name: '울산', temp: 25, status: '구름' },
  { id: 'city_10', name: '인천', temp: 23, status: '비' },
])

const searchCity = ref('')
const searchResult = ref('')
const selectedCity = ref('')

const onSearch = () => {
  searchResult.value = searchCity.value
}

const onSelect = (name) => {
  selectedCity.value = name
}

const onDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-app">
    <h1 class="app-title">🌤️ 날씨 (Mockup)</h1>

    <SearchBox v-model="searchCity" :result="searchResult" @search="onSearch" />

    <section class="card-list">
      <h2 class="section-title">📍 지역별 날씨 현황</h2>

      <WeatherCard
        v-for="city in weatherList"
        :key="city.id"
        :city="city"
        @select="onSelect"
        @detail="onDetail"
      />
    </section>

    <StatusBar :selected-city="selectedCity" />
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
.section-title {
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dfe6e9;
  margin-bottom: 14px;
}
</style>
