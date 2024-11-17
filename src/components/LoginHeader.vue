<template>
  <header class="header">
    <!-- 로고 -->
    <div class="logo">
      <img src="@/assets/logo.svg" alt="Jari-Otte" class="logo-img" />
      <span class="logo-text">Jari-Otte</span>
    </div>

    <!-- 검색창 -->
    <div class="search-bar">
      <input
        type="text"
        class="search-input"
        placeholder="Search in site"
      />
      <button class="search-button">🔍</button>
    </div>

    <!-- 사용자 메뉴 -->
    <nav class="user-menu">
      <ul>
        <li>
          <a href="#" @click.prevent="handleLoginLogout">
            {{ isLoggedIn ? '로그아웃' : '로그인' }}
          </a>
        </li>
        <li v-if="isLoggedIn"><a href="#">내 프로필</a></li>
        <li v-if="isLoggedIn"><a href="#">예매내역</a></li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 로그인 상태 관리
const isLoggedIn = ref(!!localStorage.getItem('token')); // 초기값은 로컬 스토리지 확인
const router = useRouter();

// 로그인/로그아웃 처리 함수
const handleLoginLogout = () => {
  if (isLoggedIn.value) {
    // 로그아웃 처리
    localStorage.removeItem('token'); // 토큰 제거
    isLoggedIn.value = false;
    alert('로그아웃 되었습니다.');
    router.push('/'); // 홈으로 이동
  } else {
    // 로그인 페이지로 이동
    router.push('/auth'); // '/auth' 경로로 이동
  }
};
</script>

<style scoped>
/* 헤더 스타일 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

/* 로고 */
.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-family: 'Arial', sans-serif;
  color: #333;
}

/* 검색창 */
.search-bar {
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-button {
  margin-left: 8px;
  height: 40px;
  padding: 0 15px;
  font-size: 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #555;
}

/* 사용자 메뉴 */
.user-menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.user-menu li {
  margin-left: 15px;
}

.user-menu a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

.user-menu a:hover {
  color: #007BFF;
}
</style>
