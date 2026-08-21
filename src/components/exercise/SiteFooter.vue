<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="site-footer">
    <div class="footer-main">
      <p class="footer-title">골프 캐디 어시스턴트</p>
      <nav class="footer-nav">
        <RouterLink to="/">대시보드</RouterLink>
        <RouterLink to="/courses">골프장 찾기</RouterLink>
        <RouterLink to="/club">클럽 계산기</RouterLink>
        <RouterLink to="/alerts">경보 현황</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
      </nav>
    </div>

    <ul class="footer-notes">
      <li>날씨 · 예보 · 대기질 데이터: OpenWeatherMap</li>
      <li>골프장 정보: 공개된 골프장 현황 자료 기반 (좌표는 시·군·구 단위 근사치)</li>
      <li>낙뢰 확률은 무료 플랜에 항목이 없어 날씨 상태코드와 강수확률로 추정한 값입니다.</li>
      <li>임팩트 가이드는 단순화된 교육용 자료이며 실제 스윙 교습을 대체하지 않습니다.</li>
    </ul>

    <p class="footer-copy">Vue 3 · Vue Router · Pinia · Axios 학습용 프로젝트</p>
  </footer>
</template>

<style scoped>
.site-footer {
  max-width: var(--site-width);
  width: 100%;
  margin: 24px auto 24px;
  padding: 28px 32px;
  border-radius: var(--radius-lg);
  background: var(--c-paper);
  box-shadow: var(--shadow-sm);
}
.footer-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.footer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.footer-nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 13px;
}
.footer-nav a {
  padding: 7px 13px;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
  font-weight: 700;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.footer-nav a:hover {
  background: var(--c-deep);
  color: #fff;
}
.footer-nav a:active {
  transform: scale(0.93);
}
.footer-notes {
  margin: 0 0 14px;
  padding: 18px 20px 18px 36px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  font-size: 12px;
  font-weight: 500;
  line-height: 2;
  color: var(--c-ink-faint);
}
.footer-copy {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

@media (max-width: 760px) {
  .site-footer {
    margin: 16px;
    padding: 22px 20px;
  }
}
</style>
