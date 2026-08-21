<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { useConfigStore } from '@/stores/configStore'
import { useDisplayTemp, convertTemp } from '@/composables/useDisplayTemp'
import { getForecast, getAirPollution } from '@/api/weatherApi'
import { mapForecast, mapAirPollution } from '@/utils/weatherMapper'
import { judgePlay, degToText } from '@/utils/caddy'

/* 동적 경로 /weather/:cityId 의 파라미터를 props로 받는다 (router의 props: true) */
const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const weatherStore = useWeatherStore()
const caddyStore = useCaddyStore()
const configStore = useConfigStore()

const course = ref(null)
const forecast = ref([])
const air = ref(null)
const isLoading = ref(false)
const error = ref('')

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => course.value?.temp)

/* Mount 시점에 cityId로 지역을 선택하고, 그 좌표로 추가 API 2개를 호출 */
onMounted(async () => {
  course.value = weatherStore.courseById(props.cityId) ?? null
  console.log('[onMounted] cityId:', props.cityId, '→', course.value?.name ?? '조회 실패')
  if (!course.value) return

  isLoading.value = true
  try {
    // 현재 날씨 + 예보 + 대기오염을 동시에 요청한다
    const [, forecastData, airData] = await Promise.all([
      weatherStore.fetchCourseWeather(props.cityId),
      getForecast(course.value.lat, course.value.lon, 6),
      getAirPollution(course.value.lat, course.value.lon),
    ])
    course.value = weatherStore.courseById(props.cityId) ?? course.value
    forecast.value = mapForecast(forecastData, 6)
    air.value = mapAirPollution(airData)
  } catch (err) {
    error.value = err.friendlyMessage ?? err.message
    console.error('[WeatherDetailView] 추가 정보 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
})

const play = computed(() =>
  course.value ? judgePlay(course.value, caddyStore.holeDeg, caddyStore.windSensitivity) : null,
)

/* 예보 슬롯도 현재 날씨와 똑같은 기준으로 판정한다 */
const teeTimes = computed(() =>
  forecast.value.map((slot) => ({
    ...slot,
    play: judgePlay(slot, caddyStore.holeDeg, caddyStore.windSensitivity),
  })),
)

/* 추천 티타임: 가장 이른 '최적' 시간, 없으면 '주의' 중 첫 번째 */
const bestTeeTime = computed(
  () =>
    teeTimes.value.find((t) => t.play.level === 'good') ??
    teeTimes.value.find((t) => t.play.level === 'caution') ??
    null,
)

/* 예보 목록의 온도도 단위 설정을 따른다 */
const slotTemp = (temp) => convertTemp(temp, configStore.unit)

const goHome = () => router.push('/')
</script>

<template>
  <div class="detail-view">
    <BaseDashboardCard v-if="course" icon="📊" title="지역별 상세 기상 관측 정보">
      <template #meta>{{ course.id }}</template>

      <h3 class="course-name">📍 {{ course.name }} · {{ course.course }}</h3>
      <p class="region">{{ course.region }} · {{ course.lat }}, {{ course.lon }}</p>

      <dl class="observe-list">
        <div class="observe-row">
          <dt>실시간 기온</dt>
          <dd>{{ displayTemp }}{{ unitSymbol }}</dd>
        </div>
        <div class="observe-row">
          <dt>기상 현황</dt>
          <dd>{{ course.description ?? course.status }}</dd>
        </div>
        <div class="observe-row">
          <dt>대기 습도</dt>
          <dd>{{ course.humidity }}%</dd>
        </div>
        <div class="observe-row">
          <dt>현재 풍속</dt>
          <dd>{{ course.windSpeed }}m/s</dd>
        </div>
        <div class="observe-row">
          <dt>풍향</dt>
          <dd>{{ degToText(course.windDeg) }}풍 ({{ course.windDeg }}°)</dd>
        </div>
        <div class="observe-row" :class="{ alert: course.lightning >= 50 }">
          <dt>낙뢰 확률</dt>
          <dd>{{ course.lightning }}%</dd>
        </div>
        <!-- 추가 API: 대기 오염 -->
        <div v-if="air" class="observe-row" :class="{ alert: air.aqi >= 4 }">
          <dt>대기질 (미세먼지)</dt>
          <dd>{{ air.aqiText }} · PM10 {{ air.pm10 }} / PM2.5 {{ air.pm25 }}</dd>
        </div>
      </dl>

      <div class="advice-box">
        <p class="advice-head">
          <span class="badge" :class="play.className">{{ play.icon }} {{ play.label }}</span>
          <span class="condition">
            홀 방향 {{ caddyStore.holeText }}쪽 · {{ caddyStore.levelText }}
          </span>
        </p>
        <p class="advice">⛳ {{ play.message }}</p>
        <p class="advice club">🏌️ {{ play.club.text }}</p>
        <p v-if="play.aim" class="advice">🎯 {{ play.aim }}</p>
        <p class="advice">💧 {{ play.humidityAdvice }}</p>
      </div>

      <!-- 추가 API: 3시간 단위 예보 → 티타임 추천 -->
      <section class="forecast-section">
        <h4 class="forecast-title">⏰ 티타임 추천 (3시간 단위 예보)</h4>

        <p v-if="isLoading" class="hint">⏳ 예보와 대기질 정보를 불러오는 중...</p>
        <p v-else-if="error" class="error-msg">⚠️ {{ error }}</p>

        <template v-else-if="teeTimes.length > 0">
          <p v-if="bestTeeTime" class="best-tee">
            👍 <strong>{{ bestTeeTime.timeText }}</strong> 티오프를 추천합니다 ·
            {{ bestTeeTime.play.label }}
          </p>
          <p v-else class="best-tee warn">😥 향후 18시간 내 추천할 만한 시간대가 없습니다.</p>

          <ul class="tee-list">
            <li
              v-for="slot in teeTimes"
              :key="slot.at"
              class="tee-row"
              :class="slot.play.className"
            >
              <span class="tee-time">{{ slot.timeText }}</span>
              <span class="tee-info">
                {{ slot.play.icon }} {{ slot.description }} · {{ slotTemp(slot.temp)
                }}{{ unitSymbol }} · 🌬️{{ slot.windSpeed }}m/s · ☔{{ slot.pop }}%
              </span>
            </li>
          </ul>
        </template>
      </section>

      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>

    <!-- 존재하지 않는 cityId로 접근한 경우 -->
    <BaseDashboardCard v-else icon="❓" title="조회할 수 없는 지역">
      <p class="empty">'{{ cityId }}' 코드에 해당하는 관측 지역이 없습니다.</p>
      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.course-name {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 700;
}
.region {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--c-text-sub);
}
.observe-list {
  margin: 0 0 14px;
  padding: 6px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface-soft);
}
.observe-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--c-border);
}
.observe-row:last-child {
  border-bottom: none;
}
.observe-row dt {
  color: var(--c-text-sub);
}
.observe-row dd {
  margin: 0;
  font-weight: 700;
}
.observe-row.alert dd {
  color: var(--c-danger);
}
.advice-box {
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-primary-soft);
}
.advice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 8px;
}
.condition {
  font-size: 11px;
  color: var(--c-text-sub);
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.play-good {
  background: var(--c-good-bg);
  color: var(--c-good);
}
.play-caution {
  background: var(--c-caution-bg);
  color: var(--c-caution);
}
.play-danger {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.advice {
  margin: 0 0 4px;
  font-size: 13px;
}
.advice:last-child {
  margin-bottom: 0;
}
.advice.club {
  font-weight: 700;
}
.empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--c-text-sub);
}
.back-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}
.back-btn:hover {
  background: var(--c-primary-dark);
}

.forecast-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--c-border);
}
.forecast-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-primary);
}
.hint {
  margin: 0;
  font-size: 12px;
  color: var(--c-text-sub);
}
.error-msg {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--c-danger);
  border-radius: 8px;
  background: var(--c-danger-bg);
  color: var(--c-danger);
  font-size: 12px;
}
.best-tee {
  margin: 0 0 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--c-good-bg);
  color: var(--c-good);
  font-size: 13px;
}
.best-tee.warn {
  background: var(--c-caution-bg);
  color: var(--c-caution);
}
.tee-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tee-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  margin-bottom: 5px;
  border-radius: 8px;
  font-size: 12px;
}
.tee-row:last-child {
  margin-bottom: 0;
}
.tee-time {
  font-weight: 700;
  white-space: nowrap;
}
.tee-info {
  color: var(--c-text-sub);
  text-align: right;
}
</style>
