<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

/* 검색박스 / 리스트박스의 "종이 시트" 디자인을 공통화한 재사용 컴포넌트.
 * 내용물은 부모(View)가 <slot>으로 주입한다. */
defineProps({
  /* AppIcon 이름 (없으면 아이콘 없이 제목만) */
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  /* 노트 좌상단에 찍히는 항목 번호 (예: 'No.01') */
  index: { type: String, default: '' },
})
</script>

<template>
  <section class="sheet">
    <header class="sheet-header">
      <h2 class="sheet-title">
        <span v-if="index" class="sheet-index">{{ index }}</span>
        <AppIcon v-if="icon" :name="icon" :size="15" />
        {{ title }}
      </h2>
      <!-- 이름 있는 슬롯: 헤더 우측 요약 정보 -->
      <span v-if="$slots.meta" class="sheet-meta"><slot name="meta" /></span>
    </header>

    <!-- 기본 슬롯: 부모가 SearchBar / WeatherCard 등을 꽂아 넣는 자리 -->
    <div class="sheet-body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="sheet-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
/* ===== 벤토 블록 : 선 없이 흰 덩어리 ===== */
.sheet {
  padding: 24px;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  background: var(--c-paper);
  box-shadow: var(--shadow);
}
.sheet:last-child {
  margin-bottom: 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px 14px;
  /* 좁은 화면에서는 요약 정보가 아랫줄로 내려간다 */
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.sheet-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}
/* 아이콘은 연한 타일 위에 얹는다 */
.sheet-title :deep(svg) {
  box-sizing: content-box;
  padding: 7px;
  border-radius: var(--radius-sm);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  stroke-width: 2.2;
}
.sheet-index {
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--c-ink-faint);
}
.sheet-meta {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--c-ink-faint);
  text-align: right;
}
.sheet-footer {
  margin-top: 20px;
}

@media (max-width: 640px) {
  .sheet {
    padding: 18px;
    border-radius: var(--radius);
  }
}
</style>
