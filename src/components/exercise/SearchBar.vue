<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

/* 부모로부터 검색어를 props로 전달받아 표시하고,
 * 입력이 발생하면 update-query 이벤트로 부모에게 되돌려 준다. */
defineProps({
  query: { type: String, default: '' },
})

const emit = defineEmits(['update-query'])

const onInput = (e) => {
  emit('update-query', e.target.value)
}
</script>

<template>
  <div class="search-bar">
    <label class="field">
      <AppIcon name="search" :size="15" />
      <input
        class="search-input"
        :value="query"
        @input="onInput"
        placeholder="골프장 · 지역 이름으로 검색"
      />
    </label>
    <p class="search-hint">
      <span class="label">QUERY</span>
      <span class="num">{{ query || '\u2014' }}</span>
    </p>
  </div>
</template>

<style scoped>
/* ===== 검색 : 안쪽으로 파인 타일 ===== */
.field {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 18px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  color: var(--c-ink-faint);
  transition:
    background 0.2s var(--ease),
    box-shadow 0.2s var(--ease),
    color 0.2s var(--ease);
}
.field:focus-within {
  background: var(--c-paper);
  color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-soft);
}
.search-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--c-ink);
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.search-input::placeholder {
  color: var(--c-ink-faint);
  font-weight: 600;
}
.search-input:focus {
  outline: none;
}
.search-hint {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 10px 2px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-ink-soft);
}
</style>
