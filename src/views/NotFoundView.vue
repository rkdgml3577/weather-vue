<script setup>
import { useRoute, RouterLink } from 'vue-router'

/* Catch-all Route로 들어온 잘못된 경로를 보여준다 */
const route = useRoute()
</script>

<template>
  <div class="not-found">
    <p class="emoji">⛳ ❓</p>
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
  padding: 52px 20px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface);
  text-align: center;
}
.emoji {
  margin: 0;
  font-size: 46px;
  letter-spacing: 8px;
}
.title {
  margin: 18px 0 8px;
  font-size: 19px;
  font-weight: 700;
}
.desc {
  margin: 0 0 22px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--c-text-sub);
}
code {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--c-surface-soft);
  color: var(--c-danger);
}
.home-btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.home-btn:hover {
  background: var(--c-primary-dark);
}
</style>
