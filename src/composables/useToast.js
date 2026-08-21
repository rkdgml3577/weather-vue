import { ElMessage, ElMessageBox } from 'element-plus'

/* 스타일은 main.js에서 한 번만 싣는다 (임포트 순서를 고정하기 위함) */

/* ===== 전역 알림 =====
 * 실제 구현은 Element Plus의 ElMessage / ElMessageBox 가 담당하고,
 * 이 파일은 앱 전체가 쓰는 얇은 창구 역할만 한다.
 * 덕분에 호출부는 toast.success(...) 한 줄로 유지된다.
 */

const DEFAULT_DURATION = 3000

const show = (type, message, duration = DEFAULT_DURATION) =>
  ElMessage({
    type,
    message,
    duration,
    showClose: true,
    /* 알림끼리 겹치지 않게 쌓이는 간격 */
    offset: 84,
    grouping: true,
    customClass: 'caddy-message',
  })

export const toast = {
  success: (message, duration) => show('success', message, duration),
  warning: (message, duration) => show('warning', message, duration),
  error: (message, duration) => show('error', message, duration),
  info: (message, duration) => show('info', message, duration),

  /* 되돌릴 수 없는 동작 전 확인창.
   * 확인하면 true, 취소하면 false 를 돌려준다. */
  confirm: async (message, title = '확인', options = {}) => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        type: 'warning',
        customClass: 'caddy-messagebox',
        ...options,
      })
      return true
    } catch {
      /* 취소 버튼이나 바깥 클릭으로 닫은 경우 */
      return false
    }
  },
}

export const useToast = () => ({ toast })
