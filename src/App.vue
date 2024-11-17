<template>
  <div id="app">
    <LoginHeader v-if="$route.meta.requiresHeader" />
    <!-- 현재 경로에 따른 컴포넌트를 렌더링 -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import LoginHeader from '@/components/LoginHeader.vue'; // LoginHeader 경로
</script>
