<template>
  <div id="app">

    <!-- 현재 경로에 따른 컴포넌트를 렌더링 -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>
