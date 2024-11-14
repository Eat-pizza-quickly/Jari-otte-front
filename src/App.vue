<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div>
      <nav>
        <RouterLink to="/"> </RouterLink>
        <RouterLink to="/concerts"> </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style>
</style>
