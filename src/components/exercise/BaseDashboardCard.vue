<script setup>
/* 검색박스 / 리스트박스의 "박스 디자인"을 공통화한 재사용 컴포넌트.
 * 내용물은 부모(WeatherParent)가 <slot>으로 주입한다. */
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="dashboard-card">
    <header class="card-header">
      <h2 class="card-title">
        <span v-if="icon" class="card-icon">{{ icon }}</span
        >{{ title }}
      </h2>
      <!-- 이름 있는 슬롯: 헤더 우측 요약 정보 -->
      <span v-if="$slots.meta" class="card-meta"><slot name="meta" /></span>
    </header>

    <!-- 기본 슬롯: 부모가 SearchBar / WeatherCard 등을 꽂아 넣는 자리 -->
    <div class="card-body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.dashboard-card {
  padding: 14px 16px 16px;
  margin-bottom: 16px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface);
}
.dashboard-card:last-child {
  margin-bottom: 0;
}
.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 10px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--c-border);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-primary);
}
.card-icon {
  font-size: 15px;
}
.card-meta {
  font-size: 11px;
  color: var(--c-text-sub);
  text-align: right;
  white-space: nowrap;
}
.card-footer {
  margin-top: 14px;
}
</style>
