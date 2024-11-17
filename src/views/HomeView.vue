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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')

const API_BASE_URL = 'http://localhost:8080/api/v1/users'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add an interceptor to include the token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

const fetchUserInfo = async () => {
  try {
    const response = await api.get('/my')
    username.value = response.data.data.nickname
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      username.value = ''
    }
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
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
