<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">⛳ 골프 캐디 어시스턴트</h1>

      <div class="nav-row">
        <!-- Navigation Bar -->
        <nav class="app-nav">
          <RouterLink to="/">🏠 날씨 대시보드</RouterLink>
          <span class="divider">|</span>
          <RouterLink to="/alerts">⛈️ 경보 현황</RouterLink>
          <span class="divider">|</span>
          <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
        </nav>

        <!-- Navigation Bar 옆의 단위 설정 영역 -->
        <UnitToggler />
      </div>
    </header>

    <!-- 메인 콘텐츠 영역: 현재 경로에 매칭된 View가 렌더링된다 -->
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.app-header {
  padding: 18px 20px 0;
  text-align: center;
}
.app-title {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--c-border);
  flex-wrap: wrap;
}
.app-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
/* 폭이 좁아 줄바꿈될 때도 단위 영역은 오른쪽에 붙는다 */
.nav-row > :last-child {
  margin-left: auto;
}
.app-nav a {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--c-text-sub);
}
.app-nav a:hover {
  background: var(--c-surface-soft);
  color: var(--c-text);
}
/* 현재 경로와 정확히 일치하는 링크에 vue-router가 붙여 주는 클래스 */
.app-nav a.router-link-exact-active {
  background: var(--c-primary-soft);
  color: var(--c-primary);
  font-weight: 700;
}
.divider {
  color: var(--c-border-strong);
  font-size: 11px;
}
.app-main {
  padding: 18px 20px 22px;
}
</style>
