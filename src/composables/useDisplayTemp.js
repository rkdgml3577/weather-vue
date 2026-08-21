import { computed, unref } from 'vue'
import { useConfigStore } from '@/stores/configStore'

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

    if (configStore.unit === 'fahrenheit') {
      return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
    }
    return rawTemp // 'celsius'일 때는 원본 그대로 반환
  })

  const unitSymbol = computed(() => configStore.unitSymbol)

  return { displayTemp, unitSymbol }
}
