<script setup>
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
    <input
      class="search-input"
      :value="query"
      @input="onInput"
      placeholder="검색할 지역 이름 입력"
    />
    <p class="search-hint">검색 중인 지역: {{ query || '(없음)' }}</p>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--c-border-strong);
  border-radius: 8px;
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 14px;
}
.search-input::placeholder {
  color: #a9b3c0;
}
.search-input:focus {
  outline: none;
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-soft);
}
.search-hint {
  margin: 8px 2px 0;
  font-size: 12px;
  color: var(--c-text-sub);
}
</style>
