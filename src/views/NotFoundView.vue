<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { useRoute, RouterLink } from 'vue-router'

/* Catch-all Route로 들어온 잘못된 경로를 보여준다 */
const route = useRoute()
</script>

<template>
  <div class="not-found">
    <p class="emoji"><AppIcon name="flag" :size="46" /><AppIcon name="help" :size="46" /></p>
    <h2 class="title">페이지를 찾을 수 없습니다.</h2>
    <p class="desc">
      요청하신 주소 <code>{{ route.fullPath }}</code> 는 존재하지 않거나,<br />
      아직 개발되지 않았습니다.
    </p>
    <RouterLink class="home-btn" to="/">날씨 메인으로 이동</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  padding: 80px 24px;
  border-radius: var(--radius-lg);
  background: var(--c-paper);
  box-shadow: var(--shadow);
  text-align: center;
}
.emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 0;
  color: var(--c-ink-faint);
}
.emoji :deep(svg) {
  stroke-width: 1.5;
}
.title {
  margin: 24px 0 10px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.desc {
  margin: 0 0 28px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.8;
  color: var(--c-ink-faint);
}
code {
  padding: 3px 9px;
  border-radius: 6px;
  background: var(--c-paper-alt);
  color: var(--c-danger);
  font-weight: 700;
}
.home-btn {
  display: inline-block;
  padding: 15px 28px;
  border-radius: var(--radius-pill);
  background: var(--c-accent);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 10px 24px -12px var(--c-accent);
  transition: transform 0.18s var(--ease);
}
.home-btn:hover {
  background: #00b366;
  color: #fff;
  transform: translateY(-2px);
}
.home-btn:active {
  transform: scale(0.96);
}
</style>
