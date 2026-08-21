<script setup>
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
</script>

<template>
  <div class="about-view">
    <BaseDashboardCard icon="info" title="서비스 소개">
      <p class="lead">
        본 앱은 <strong>Vue 3 + Vue Router 5</strong> 기반으로 제작한 실습용 골프 캐디
        어시스턴트입니다. 기온만 보는 일반 날씨 앱과 달리
        <strong>풍속 · 풍향 · 습도 · 낙뢰</strong> 4가지 변수로 라운딩 판단과 클럽 선택을
        도와줍니다.
      </p>

      <h4 class="sub-title">주요 기능</h4>
      <ul class="feature-list">
        <li>
          <strong>임팩트 포인트 가이드</strong> — 바람과 실력에 맞춰 공의 어느 지점을 때려야 하는지
          그림으로 안내 (초급은 중앙 정타, 중급은 상하 탄도, 상급은 좌우 커브까지)
        </li>
        <li>
          <strong>클럽 추천 계산기</strong> — 바람·기온·노면을 보정한 실제 플레이 거리로 클럽 선택
        </li>
        <li><strong>마지막 티오프</strong> — 일몰까지 남은 시간으로 소화 가능한 홀 수 계산</li>
        <li><strong>전국 골프장 찾기</strong> — 지역·유형으로 골라 내 대시보드에 담기</li>
        <li><strong>경보 현황</strong> — 낙뢰·강풍 위험 골프장만 모아 보기</li>
      </ul>

      <h4 class="sub-title">사용한 기술</h4>
      <ul class="feature-list">
        <li><code>computed</code>로 맞바람 세기를 계산해 "몇 클럽 길게" 조언</li>
        <li><code>watch</code>로 낙뢰 확률을 감지해 "카트로 대피" 즉시 경고</li>
        <li><code>props / emits</code>로 부모-자식 단방향 데이터 흐름 구성</li>
        <li><code>slot</code>으로 대시보드 박스 디자인을 공통화</li>
        <li>URL 파라미터(<code>/weather/:cityId</code>)로 골프장별 상세 페이지 라우팅</li>
        <li><code>Pinia</code> 스토어로 단위 설정 · 날씨 · 내 클럽 거리를 전역 관리</li>
        <li><code>Axios</code>로 OpenWeatherMap 실시간 관측 · 예보 · 대기질 조회</li>
        <li>
          인라인 <code>SVG</code>로 임팩트 지점과 탄도를 직접 그림 (외부 차트 라이브러리 없음)
        </li>
      </ul>

      <h4 class="sub-title">데이터 출처와 한계</h4>
      <ul class="feature-list">
        <li>날씨 · 예보 · 대기질: <strong>OpenWeatherMap</strong> (무료 플랜)</li>
        <li>
          골프장 정보: 공개된 골프장 현황 자료 기반. 좌표는
          <strong>시·군·구 단위 근사치</strong>로, 코스 내 홀 위치를 뜻하지 않습니다.
        </li>
        <li>
          낙뢰 확률: 무료 플랜에 해당 항목이 없어 날씨 상태코드와 강수확률로
          <strong>추정</strong>한 값입니다.
        </li>
        <li>임팩트 가이드: 단순화된 교육용 자료이며 실제 스윙 교습을 대체하지 않습니다.</li>
      </ul>

      <template #footer>
        <RouterLink class="link-btn" to="/">대시보드 홈으로 이동</RouterLink>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.lead {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.85;
  color: var(--c-ink-soft);
}
.lead strong {
  font-weight: 800;
  color: var(--c-ink);
}
.sub-title {
  margin: 28px 0 12px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.feature-list {
  margin: 0;
  padding: 20px 22px 20px 38px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.9;
  color: var(--c-ink-soft);
}
.feature-list strong {
  font-weight: 800;
  color: var(--c-ink);
}
code {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--c-accent-soft);
  color: var(--c-accent-deep);
  font-size: 13px;
  font-weight: 700;
}
.link-btn {
  display: block;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-deep);
  color: #fff;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  transition: transform 0.18s var(--ease);
}
.link-btn:hover {
  background: var(--c-deep-2);
  color: #fff;
}
.link-btn:active {
  transform: scale(0.98);
}
</style>
