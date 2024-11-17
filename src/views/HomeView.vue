<template>
  <div class="home-view">
    <header>
      <h1>JariOtte</h1>
    </header>
    <main>
      <section v-if="username" class="welcome-section">
        <p>환영합니다, {{ username }}님!</p>
        <router-link to="/mypage" class="mypage-link">마이페이지로 이동</router-link>
      </section>
      <section v-else class="login-section">
        <p>로그인이 필요합니다.</p>
        <router-link to="/auth" class="login-link">로그인하기</router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

// Vue Router
const router = useRouter()
const route = useRoute()

// 반응형 데이터
const username = ref('')
const token = ref(localStorage.getItem('token')) // 반응형 토큰

// API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api/v1/users'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Axios 요청 인터셉터: Authorization 헤더에 토큰 추가
api.interceptors.request.use((config) => {
  if (token.value) {
    config.headers['Authorization'] = `Bearer ${token.value}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 사용자 정보 가져오기
const fetchUserInfo = async () => {
  try {
    const response = await api.get('/my')
    username.value = response.data.data.nickname
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    if (error.response && error.response.status === 401) {
      // 401 에러 발생 시 토큰 제거
      localStorage.removeItem('token')
      token.value = null
      username.value = ''
    }
  }
}

// URL에서 토큰 추출 및 반응형 데이터 업데이트
const saveTokenFromUrl = () => {
  const urlToken = route.query.token
  if (urlToken) {
    localStorage.setItem('token', urlToken)
    token.value = urlToken // 반응형 데이터 업데이트
    // URL에서 토큰 파라미터 제거
    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)
  }
}

// 반응형 토큰 변경 감지
watch(token, async (newToken) => {
  if (newToken) {
    await fetchUserInfo()
  } else {
    username.value = ''
  }
})

// 컴포넌트가 로드되었을 때 실행
onMounted(() => {
  // URL에서 토큰 추출 및 저장
  saveTokenFromUrl()

  // 저장된 토큰이 있으면 사용자 정보 요청
  if (token.value) {
    fetchUserInfo()
  }
})
</script>




<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 3rem;
  color: #3490dc;
  margin-bottom: 20px;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.welcome-section, .login-section {
  text-align: center;
}

p {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.mypage-link, .login-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3490dc;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.mypage-link:hover, .login-link:hover {
  background-color: #2779bd;
}
</style>
