<script setup>
defineProps({
  modelValue: String,
  result: String,
})

const emit = defineEmits(['update:modelValue', 'search'])

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
    <button class="search-btn" @click="emit('search')">검색</button>
    <p v-if="result" class="search-result">
      입력한 도시: <strong>{{ result }}</strong>
    </p>
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
  width: 60%;
  padding: 8px 10px;
  border: 1px solid #dcdde1;
  border-radius: 6px;
  font-size: 14px;
}
.search-btn {
  padding: 8px 14px;
  margin-left: 6px;
  border: none;
  border-radius: 6px;
  background: #0984e3;
  color: #fff;
  cursor: pointer;
}
.search-result {
  margin: 10px 0 0;
  font-size: 14px;
  color: #0984e3;
}
</style>
