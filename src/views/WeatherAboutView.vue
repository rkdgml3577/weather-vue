<script setup>
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
</script>

<template>
  <div class="about-view">
    <BaseDashboardCard icon="ℹ️" title="서비스 소개">
      <p class="lead">
        본 앱은 <strong>Vue 3 + Vue Router 5</strong> 기반으로 제작한 실습용 골프 캐디
        어시스턴트입니다. 기온만 보는 일반 날씨 앱과 달리
        <strong>풍속 · 풍향 · 습도 · 낙뢰</strong> 4가지 변수로 라운딩 판단과 클럽 선택을
        도와줍니다.
      </p>

      <ul class="feature-list">
        <li><code>computed</code>로 맞바람 세기를 계산해 "몇 클럽 길게" 조언</li>
        <li><code>watch</code>로 낙뢰 확률을 감지해 "카트로 대피" 즉시 경고</li>
        <li><code>props / emits</code>로 부모-자식 단방향 데이터 흐름 구성</li>
        <li><code>slot</code>으로 대시보드 박스 디자인을 공통화</li>
        <li>URL 파라미터(<code>/weather/:cityId</code>)로 지역별 상세 페이지 라우팅</li>
        <li><code>Pinia</code> 스토어로 단위 설정 · 날씨 데이터를 전역 관리</li>
        <li><code>Axios</code>로 OpenWeatherMap 실시간 관측 · 예보 · 대기질 조회</li>
      </ul>

      <template #footer>
        <RouterLink class="link-btn" to="/">대시보드 홈으로 이동</RouterLink>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.lead {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.8;
}
.feature-list {
  margin: 0;
  padding: 12px 16px 12px 30px;
  border-radius: var(--radius);
  background: var(--c-surface-soft);
  font-size: 13px;
  line-height: 2;
  color: var(--c-text-sub);
}
code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--c-primary-soft);
  color: var(--c-primary);
  font-size: 12px;
}
.link-btn {
  display: block;
  padding: 10px;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}
.link-btn:hover {
  background: var(--c-primary-dark);
}
</style>
