<template>
  <div class="HomeView">
    <h1>JariOtte</h1>
    <p>환영합니다, {{ username }}님!</p>
    <router-link to="/mypage" class="mypage-link">마이페이지로 이동</router-link>
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
      router.push('/auth')
    }
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/auth')
  } else {
    fetchUserInfo()
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.mypage-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3490dc;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.mypage-link:hover {
  background-color: #2779bd;
}
</style>
