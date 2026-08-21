<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import SiteFooter from '@/components/exercise/SiteFooter.vue'
</script>

<template>
  <div class="app-shell">
    <!-- 노트 표지 — 스크롤해도 따라온다 -->
    <header class="app-header">
      <div class="header-inner">
        <RouterLink class="brand" to="/">
          <span class="brand-name">골프 캐디 어시스턴트</span>
          <span class="brand-sub">CADDIE NOTES · WIND &amp; PLAY</span>
        </RouterLink>

        <!-- Navigation Bar -->
        <nav class="app-nav">
          <RouterLink to="/">대시보드</RouterLink>
          <RouterLink to="/courses">골프장</RouterLink>
          <RouterLink to="/club">클럽 계산</RouterLink>
          <RouterLink to="/alerts">경보</RouterLink>
          <RouterLink to="/about">소개</RouterLink>
        </nav>

        <!-- Navigation Bar 옆의 단위 설정 영역 -->
        <UnitToggler />
      </div>
    </header>

    <!-- 메인 콘텐츠 영역: 현재 경로에 매칭된 View가 렌더링된다 -->
    <main class="app-main">
      <RouterView />
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ===== 벤토 셸 ===== */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ===== 헤더 : 선 없이 반투명 면으로만 떠 있는다 ===== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--c-page) 82%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
}
.header-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  max-width: var(--site-width);
  margin: 0 auto;
  padding: 16px 24px;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  color: var(--c-ink);
}
.brand-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
}
.brand-sub {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--c-ink-faint);
  white-space: nowrap;
}

/* ===== 내비 : 흰 알약 덩어리 하나 ===== */
.app-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: auto;
  flex-wrap: wrap;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--c-paper);
  box-shadow: var(--shadow-sm);
  font-size: 13px;
  font-weight: 700;
}
.app-nav a {
  padding: 8px 15px;
  border-radius: var(--radius-pill);
  color: var(--c-ink-soft);
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.app-nav a:hover {
  background: var(--c-paper-alt);
  color: var(--c-ink);
}
.app-nav a:active {
  transform: scale(0.94);
}
/* 현재 경로와 정확히 일치하는 링크에 vue-router가 붙여 주는 클래스 */
.app-nav a.router-link-exact-active {
  background: var(--c-deep);
  color: var(--c-paper);
  box-shadow: var(--shadow-sm);
}

/* ===== 본문 ===== */
.app-main {
  flex: 1;
  width: 100%;
  max-width: var(--site-width);
  margin: 0 auto;
  padding: 8px 24px 12px;
}

@media (max-width: 760px) {
  .header-inner {
    padding: 12px 16px;
    gap: 10px;
  }
  .brand {
    flex: 1;
  }
  .brand-name {
    font-size: 16px;
  }
  .app-nav {
    order: 3;
    flex: 0 0 100%;
    justify-content: space-between;
    font-size: 12px;
  }
  .app-nav a {
    padding: 8px 11px;
  }
  .app-main {
    padding: 4px 16px 12px;
  }
}
</style>
