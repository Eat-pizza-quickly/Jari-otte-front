<template>
  <header class="header">
    <!-- 로고 -->
    <div class="logo" @click="navigateToHome" role="button" tabindex="0">
      <img src="../assets/logo.svg" alt="Jari-Otte" class="logo-img" />
      <span class="logo-text">Jari-Otte</span>
    </div>

    <!-- 토큰 만료 시간 표시 -->
    <div v-if="isLoggedIn" class="token-expiry">
      만료 시간: {{ Math.floor(remainingTime / 60) }}분 {{ remainingTime % 60 }}초
    </div>

    <!-- 사용자 메뉴 -->
    <nav class="user-menu">
      <ul>
        <li style="margin-right: 30px;"><a href="#" @click.prevent="handleLoginLogout">
          {{ isLoggedIn ? '로그아웃' : '로그인' }}
        </a>
        </li>
        <li v-if="isLoggedIn"><a href="#" @click.prevent="navigateToMyPage">마이 페이지</a></li>
        <li v-if="!isLoggedIn"><a href="#" @click.prevent="handleAdminLogin">관리자 로그인</a></li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(!!localStorage.getItem('token')); // 초기값은 로컬 스토리지 확인
const remainingTime = ref(0);
const router = useRouter();
let intervalId = null;

// 토큰 만료 시간 확인 함수
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (e) {
    return true; // 토큰이 유효하지 않으면 만료된 것으로 간주
  }
};

// 남은 만료 시간 계산 함수
const calculateRemainingTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp - currentTime;
  } catch (e) {
    return 0;
  }
};

// 로그인 상태 및 만료 시간 자동 체크
watch(isLoggedIn, (newValue) => {
  const token = localStorage.getItem('token');
  if (newValue && token && !isTokenExpired(token)) {
    remainingTime.value = calculateRemainingTime(token);
    startRemainingTimeCountdown();
  } else {
    clearInterval(intervalId);
    remainingTime.value = 0;
  }
});

// 남은 시간 카운트다운 시작 함수
const startRemainingTimeCountdown = () => {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value -= 1;
    } else {
      isLoggedIn.value = false;
      clearInterval(intervalId);
    }
  }, 1000);
};

// 컴포넌트가 마운트될 때 실행
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    isLoggedIn.value = true;
    remainingTime.value = calculateRemainingTime(token);
    startRemainingTimeCountdown();
  }
});

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

// 관리자 로그인 처리 함수
const handleAdminLogin = () => {
  router.push('/admin/login'); // '/admin-login' 경로로 이동
};

// 마이 페이지로 이동하는 함수
const navigateToMyPage = () => {
  router.push('/mypage');
};

// 홈으로 이동하는 함수
const navigateToHome = () => {
  router.push('/');
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #D9A66C;
  border-bottom: 1px solid #ddd;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-img {
  width: 80px;
  height: 80px;
  margin-right: 10px;
}

.logo-text {
  font-family: 'Arial', sans-serif;
  color: #333;
}

.token-expiry {
  font-size: 14px;
  color: #333;
  margin-right: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
}

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
