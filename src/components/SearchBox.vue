<script setup>
defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const onInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <section class="search-box">
    <label class="search-label">🔍 도시 검색</label>
    <input
      class="search-input"
      :value="modelValue"
      @input="onInput"
      placeholder="검색할 도시 이름 입력"
    />
    <p class="search-hint">검색 중인 도시: {{ modelValue || '(없음)' }}</p>
  </section>
</template>

<style scoped>
.search-box {
  padding: 16px;
  background: #f5f6fa;
  border-radius: 10px;
  margin-bottom: 20px;
}
.search-label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}
.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
}
.search-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: #636e72;
}
</style>
