<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { ref, computed, onMounted } from 'vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import CaddyControls from '@/components/exercise/CaddyControls.vue'
import ClubBagEditor from '@/components/exercise/ClubBagEditor.vue'
import ImpactPointGuide from '@/components/exercise/ImpactPointGuide.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { useBagStore } from '@/stores/bagStore'
import { getPlaysLikeDistance, recommendClub } from '@/utils/club'
import { getImpactGuide } from '@/utils/impact'
import { degToText } from '@/utils/caddy'

const weatherStore = useWeatherStore()
const caddyStore = useCaddyStore()
const bagStore = useBagStore()

const selectedId = ref('')
const distance = ref(150)

onMounted(() => {
  if (!weatherStore.isLive) weatherStore.fetchLiveWeather()
  selectedId.value = weatherStore.courses[0]?.id ?? ''
})

const course = computed(() => weatherStore.courseById(selectedId.value) ?? null)

/* 바람·기온·노면을 반영한 "실제로 치는 거리" */
const playsLike = computed(() =>
  course.value
    ? getPlaysLikeDistance(
        distance.value,
        course.value,
        caddyStore.holeDeg,
        caddyStore.windSensitivity,
      )
    : { playsLike: 0, breakdown: [] },
)

const recommendation = computed(() => recommendClub(playsLike.value.playsLike, bagStore.clubs))

const impactGuide = computed(() =>
  course.value
    ? getImpactGuide(
        course.value,
        caddyStore.holeDeg,
        caddyStore.playerLevel,
        caddyStore.windSensitivity,
      )
    : null,
)

const diff = computed(() => playsLike.value.playsLike - (Number(distance.value) || 0))
</script>

<template>
  <div class="club-view">
    <BaseDashboardCard icon="calculator" title="클럽 추천 계산기">
      <template #meta v-if="course">
        {{ degToText(course.windDeg) }}풍 {{ course.windSpeed }}m/s · {{ course.temp }}℃
      </template>

      <div class="input-row">
        <label class="field">
          <span class="field-label">골프장</span>
          <select v-model="selectedId">
            <option v-for="c in weatherStore.courses" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.region }})
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">남은 거리 (m)</span>
          <input v-model.number="distance" type="number" min="10" max="350" step="5" />
        </label>
      </div>

      <CaddyControls
        :hole-deg="caddyStore.holeDeg"
        :player-level="caddyStore.playerLevel"
        @update:hole-deg="caddyStore.setHoleDeg"
        @update:player-level="caddyStore.setPlayerLevel"
      />

      <!-- 결과 -->
      <div v-if="course && recommendation" class="result-box">
        <p class="plays-like">
          {{ distance }}m가 <strong>{{ playsLike.playsLike }}m처럼</strong> 칩니다
          <span class="diff" :class="diff >= 0 ? 'up' : 'down'">
            {{ diff >= 0 ? '+' : '' }}{{ diff }}m
          </span>
        </p>

        <ul class="breakdown">
          <li v-for="item in playsLike.breakdown" :key="item.label">
            {{ item.label }}
            <strong :class="item.delta >= 0 ? 'up' : 'down'">
              {{ item.delta >= 0 ? '+' : '' }}{{ item.delta }}m
            </strong>
          </li>
          <li v-if="playsLike.breakdown.length === 0">보정 요소 없음 · 표기 거리 그대로</li>
        </ul>

        <p class="club-pick">
          <AppIcon name="club" :size="16" /> <strong>{{ recommendation.best.name }}</strong>
          <span class="club-dist">({{ recommendation.best.distance }}m)</span>
        </p>
        <p class="club-note">{{ recommendation.note }}</p>
        <p v-if="recommendation.alternative" class="club-alt">
          대안: {{ recommendation.alternative.name }} ({{ recommendation.alternative.distance }}m)
        </p>
      </div>
      <p v-else class="hint">골프장을 선택하면 계산됩니다.</p>

      <!-- 같은 조건의 임팩트 가이드 -->
      <section v-if="impactGuide" class="impact-section">
        <h4 class="section-title"><AppIcon name="target" :size="14" /> 이 조건에서의 타격 지점</h4>
        <ImpactPointGuide :guide="impactGuide" />
      </section>
    </BaseDashboardCard>

    <BaseDashboardCard icon="bag" title="내 클럽 거리">
      <ClubBagEditor />
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.input-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.field-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--c-ink-faint);
}
.field select,
.field input {
  padding: 15px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  color: var(--c-ink);
  font-family: inherit;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  transition: box-shadow 0.2s var(--ease);
}
.field select:focus,
.field input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--c-accent-soft);
}

/* ===== 결과 ===== */
.result-box {
  padding: 24px;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, var(--c-deep) 0%, var(--c-deep-2) 100%);
  color: #fff;
}
.plays-like {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.66);
}
.plays-like strong {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--c-accent);
}
.diff {
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 800;
}
.diff.up,
.up {
  color: #ff8f88;
}
.diff.down,
.down {
  color: #5fe0a3;
}
.breakdown {
  list-style: none;
  margin: 0 0 20px;
  padding: 16px 18px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.07);
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.66);
}
.breakdown li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
}
.club-pick {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}
.club-pick strong {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.035em;
}
.club-pick :deep(svg) {
  color: var(--c-accent);
  stroke-width: 2.2;
}
.club-dist {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}
.club-note {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
}
.club-alt {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}
.hint {
  padding: 20px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

.impact-section {
  margin-top: 28px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.section-title :deep(svg) {
  color: var(--c-accent);
  stroke-width: 2.2;
}

@media (max-width: 560px) {
  .input-row {
    grid-template-columns: 1fr;
  }
  .plays-like strong {
    font-size: 28px;
  }
}
</style>
