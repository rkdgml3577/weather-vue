<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import { GOLF_COURSES, REGIONS } from '@/data/golfCourses'
import { useWeatherStore } from '@/stores/weatherStore'
import { toast } from '@/composables/useToast'

const weatherStore = useWeatherStore()

const query = ref('')
const region = ref('전체')
const typeFilter = ref('전체')

const regionOptions = ['전체', ...REGIONS]
const typeOptions = ['전체', '대중제', '회원제']

/* 이름 · 지역 · 시군구를 한 번에 검색한다 */
const filteredCourses = computed(() =>
  GOLF_COURSES.filter((course) => {
    const matchQuery =
      query.value === '' ||
      `${course.name}${course.region}${course.city}`.includes(query.value.trim())
    const matchRegion = region.value === '전체' || course.region === region.value
    const matchType = typeFilter.value === '전체' || course.type === typeFilter.value
    return matchQuery && matchRegion && matchType
  }),
)

/* 지역별로 묶어서 보여 준다 */
const groupedCourses = computed(() => {
  const groups = new Map()
  filteredCourses.value.forEach((course) => {
    if (!groups.has(course.region)) groups.set(course.region, [])
    groups.get(course.region).push(course)
  })
  return [...groups.entries()]
})

const addingId = ref('')

const onAdd = async (course) => {
  /* 한도를 넘으면 담지 않고 경고만 띄운다 */
  if (weatherStore.isFull) {
    toast.warning(
      `대시보드에는 최대 ${weatherStore.maxCourses}곳까지 담을 수 있습니다. 먼저 다른 골프장을 빼 주세요.`,
    )
    return
  }

  addingId.value = course.id
  const result = await weatherStore.addCourse(course.id)
  addingId.value = ''

  if (result.ok) {
    toast.success(
      `${course.name}을(를) 대시보드에 담았습니다. (${weatherStore.courseCount}/${weatherStore.maxCourses})`,
    )
  } else if (result.reason === 'full') {
    toast.warning(`대시보드에는 최대 ${result.max}곳까지 담을 수 있습니다.`)
  } else if (result.reason === 'duplicate') {
    toast.info('이미 대시보드에 담긴 골프장입니다.')
  }
}

const onRemove = async (course) => {
  const ok = await toast.confirm(
    `${course.name}을(를) 대시보드에서 빼시겠습니까?`,
    '대시보드에서 빼기',
  )
  if (!ok) return

  weatherStore.removeCourse(course.id)
  toast.info(`${course.name}을(를) 대시보드에서 뺐습니다.`)
}
</script>

<template>
  <div class="finder-view">
    <BaseDashboardCard icon="search" title="전국 골프장 찾기">
      <template #meta>
        검색 {{ filteredCourses.length }}곳 · 담김
        <strong :class="{ full: weatherStore.isFull }">
          {{ weatherStore.courseCount }}/{{ weatherStore.maxCourses }}
        </strong>
      </template>

      <SearchBar :query="query" @update-query="(v) => (query = v)" />

      <div class="filter-row">
        <span class="filter-label">지역</span>
        <button
          v-for="option in regionOptions"
          :key="option"
          class="chip"
          :class="{ active: region === option }"
          @click="region = option"
        >
          {{ option }}
        </button>
      </div>

      <div class="filter-row">
        <span class="filter-label">유형</span>
        <button
          v-for="option in typeOptions"
          :key="option"
          class="chip"
          :class="{ active: typeFilter === option }"
          @click="typeFilter = option"
        >
          {{ option }}
        </button>
      </div>

      <template v-if="groupedCourses.length > 0">
        <section v-for="[regionName, courses] in groupedCourses" :key="regionName" class="group">
          <h4 class="group-title">
            {{ regionName }} <span>({{ courses.length }})</span>
          </h4>

          <ul class="course-list">
            <li v-for="course in courses" :key="course.id" class="course-row">
              <div class="course-info">
                <RouterLink class="course-name" :to="`/weather/${course.id}`">
                  {{ course.name }}
                </RouterLink>
                <span class="course-meta">
                  {{ course.city }} · {{ course.holes }}홀 · {{ course.type }}
                </span>
              </div>

              <button
                v-if="!weatherStore.isOnDashboard(course.id)"
                class="add-btn"
                :disabled="addingId === course.id"
                @click="onAdd(course)"
              >
                {{ addingId === course.id ? '추가 중...' : '+ 대시보드' }}
              </button>
              <button v-else class="remove-btn" @click="onRemove(course)">담김 · 빼기</button>
            </li>
          </ul>
        </section>
      </template>
      <p v-else class="no-result">조건에 맞는 골프장이 없습니다.</p>

      <template #footer>
        <p class="notice">
          좌표는 시·군·구 단위 근사치입니다. 대시보드에 담으면 해당 좌표의 실시간 날씨를 함께
          조회하며, 최대 {{ weatherStore.maxCourses }}곳까지 담을 수 있습니다.
        </p>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.filter-label {
  margin-right: 4px;
  font-size: 12px;
  font-weight: 800;
  color: var(--c-ink-faint);
}
.chip {
  padding: 8px 15px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.chip:hover {
  background: var(--c-rule);
  color: var(--c-ink);
}
.chip:active {
  transform: scale(0.93);
}
.chip.active {
  background: var(--c-deep);
  color: #fff;
  font-weight: 800;
}

.group {
  margin-top: 28px;
}
.group-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.group-title span {
  font-weight: 700;
  color: var(--c-ink-faint);
}
.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.course-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.course-row:hover {
  transform: translateY(-2px);
  background: var(--c-rule);
}
.course-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.course-name {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}
.course-name:hover {
  color: var(--c-accent-deep);
}
.course-meta {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-faint);
}
.add-btn,
.remove-btn {
  flex-shrink: 0;
  padding: 9px 14px;
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.add-btn {
  background: var(--c-accent);
  color: #fff;
}
.add-btn:hover:not(:disabled) {
  background: #00b366;
}
.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.remove-btn {
  background: var(--c-paper);
  color: var(--c-ink-soft);
}
.remove-btn:hover {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.add-btn:active,
.remove-btn:active {
  transform: scale(0.93);
}
.no-result {
  padding: 48px 24px;
  margin-top: 20px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-faint);
}
.sheet-meta strong,
:deep(.sheet-meta) strong {
  font-weight: 800;
  color: var(--c-ink);
}
:deep(.sheet-meta) strong.full {
  color: var(--c-caution);
}
.notice {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.7;
  color: var(--c-ink-faint);
}
</style>
