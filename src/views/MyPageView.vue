<template>
  <div class="my-page-view">
    <h1>마이 페이지</h1>
    <MyPage />
  </div>
</template>

<script setup>
import MyPage from '@/components/MyPage.vue'
</script>

<style>
.my-page-view {
  padding: 20px;
}

h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
}
</style>
