import { computed, unref } from 'vue'
import { useConfigStore } from '@/stores/configStore'

/* 섭씨 원본 → 현재 단위 값 (목록처럼 여러 값을 한 번에 바꿀 때 쓰는 순수 함수) */
export const convertTemp = (rawTemp, unit) => {
  if (rawTemp === null || rawTemp === undefined) return ''
  return unit === 'fahrenheit' ? Math.round((rawTemp * 9) / 5 + 32) : rawTemp
}

/* ===== 온도 표시 변환 =====
 * 메인/상세/상태바가 모두 같은 변환을 쓰므로 composable로 한 번만 작성한다.
 * @param tempSource 섭씨 원본 온도 (숫자, ref, 또는 () => 숫자)
 */
export const useDisplayTemp = (tempSource) => {
  const configStore = useConfigStore()

  const displayTemp = computed(() => {
    // 기본 원본 데이터는 섭씨 숫자
    const rawTemp = typeof tempSource === 'function' ? tempSource() : unref(tempSource)
    if (rawTemp === null || rawTemp === undefined) return ''

    return convertTemp(rawTemp, configStore.unit) // 화씨 변환 / 섭씨 원본
  })

  const unitSymbol = computed(() => configStore.unitSymbol)

  return { displayTemp, unitSymbol }
}
