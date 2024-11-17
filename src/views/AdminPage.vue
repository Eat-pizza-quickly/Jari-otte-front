<template>
  <div class="admin-page">
    <h2>Admin Page</h2>
    <div class="admin-buttons">
      <button @click="$router.push({ name: 'concertCreate' })" class="admin-button">Create Concert</button>
      <button @click="$router.push({ name: 'venueCreate' })" class="admin-button">Create Venue</button>
      <button @click="$router.push({ name: 'couponPage' })" class="admin-button">Create Coupon</button>
      <button @click="logout" class="admin-button logout-button">Logout</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  methods: {
    logout() {
      // 'token'을 localStorage에서 제거하여 로그아웃 처리
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트
      this.$router.push({ name: 'home' });
    },
  },
};
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  text-align: center;
}

.admin-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-button {
  width: 200px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.admin-button:hover {
  background-color: #0056b3;
}

/* 로그아웃 버튼에 추가적인 스타일을 적용하려면 클래스 추가 */
.logout-button {
  background-color: #dc3545;
}

.logout-button:hover {
  background-color: #c82333;
}
</style>
