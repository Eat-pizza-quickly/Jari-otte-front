<template>
  <div class="admin-page">
    <h2>Admin Page</h2>
    <div class="admin-buttons">
      <button @click="navigateTo('concertCreate')" class="admin-button">Create Concert</button>
      <button @click="navigateTo('venueCreate')" class="admin-button">Create Venue</button>
      <button @click="navigateTo('couponPage')" class="admin-button">Create Coupon</button>
      <button @click="logout" class="admin-button logout-button">Logout</button>
    </div>
  </div>
</template>

<script>
// 커스텀 axios 인스턴스 import
import axios from '@/plugins/axios';

export default {
  name: 'AdminPage',
  methods: {
    logout() {
      // 서버에 로그아웃 요청 전송
      axios.post('/users/logout')
        .then(() => {
          // 'token'을 localStorage에서 제거하여 로그아웃 처리
          localStorage.removeItem('token');
          // 로그인 페이지로 리다이렉트
          this.$router.push({ name: 'home' });
        })
        .catch(error => {
          console.error('로그아웃 실패:', error);
          // 에러 처리 (예: 사용자에게 에러 메시지 표시)
        });
    },
  },
  created() {
    const token = localStorage.getItem('token');
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      this.$router.push({ name: 'login' });
    } else {
      // 토큰이 있으면 axios 인스턴스에 토큰 설정
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
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
