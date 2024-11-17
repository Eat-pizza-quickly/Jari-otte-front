<template>
  <div class="login-container">
    <div class="login-form">
      <h1>환영합니다!</h1>
      <p>Jari-Otte에 로그인하세요</p>

      <div class="tab-container">
        <button @click="activeTab = 'login'" :class="{ active: activeTab === 'login' }">로그인</button>
        <button @click="activeTab = 'signup'" :class="{ active: activeTab === 'signup' }">회원가입</button>
      </div>

      <div v-if="activeTab === 'login'" class="form-content">
        <form @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="이메일" required>
          <input v-model="password" type="password" placeholder="비밀번호" required>
          <button type="submit" :disabled="isLoading">{{ isLoading ? '로그인 중...' : '로그인' }}</button>
        </form>
      </div>

      <div v-if="activeTab === 'signup'" class="form-content">
        <form @submit.prevent="handleSignup">
          <input v-model="email" type="email" placeholder="이메일" required>
          <div class="verification-container">
            <input v-model="verificationCode" type="text" placeholder="인증번호" required>
            <button @click.prevent="handleSendVerification" type="button" :disabled="isLoading">
              인증번호 전송
            </button>
          </div>
          <input v-model="password" type="password" placeholder="비밀번호" required>
          <input v-model="nickname" type="text" placeholder="닉네임" required>
          <button type="submit" :disabled="isLoading">{{ isLoading ? '회원가입 중...' : '회원가입' }}</button>
        </form>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <button @click="handleKakaoLogin" class="kakao-login">카카오 로그인</button>

      <p class="copyright">© 2024 Jari-Otte. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('login')
const email = ref('')
const password = ref('')
const nickname = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const error = ref('')

const API_BASE_URL = 'http://localhost:8080/api/v1/users'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', response.data.data)
    window.location.href = '/'  // Redirect to home view
  } catch (err) {
    error.value = err.response?.data?.message || '로그인에 실패했습니다.'
    console.error('Login failed:', err)
  } finally {
    isLoading.value = false
  }
}

const handleSignup = async () => {
  isLoading.value = true
  error.value = ''
  try {
    await api.post('', {
      email: email.value,
      password: password.value,
      nickname: nickname.value,
    }, {
      params: { token: verificationCode.value }
    })
    activeTab.value = 'login'
    error.value = '회원가입이 완료되었습니다. 로그인해주세요.'
  } catch (err) {
    error.value = err.response?.data?.message || '회원가입에 실패했습니다.'
    console.error('Signup failed:', err)
  } finally {
    isLoading.value = false
  }
}

const handleKakaoLogin = () => {
  window.location.href = `${API_BASE_URL}/oauth/kakao`
}

const handleSendVerification = async () => {
  isLoading.value = true
  error.value = ''
  try {
    await api.get(`/sendmail?email=${email.value}`)
    error.value = '인증 이메일이 전송되었습니다.'
  } catch (err) {
    error.value = err.response?.data?.message || '인증 이메일 전송에 실패했습니다.'
    console.error('Failed to send verification:', err)
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 1rem;
}

.login-form {
  background-color: #D9A66C;
  color: #000000;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

h1 {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
}

p {
  text-align: center;
  color: #000000;
  margin-bottom: 1.5rem;
}

.tab-container {
  display: flex;
  margin-bottom: 1rem;
}

.tab-container button {
  flex: 1;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  color: #000000;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.tab-container button.active {
  font-weight: bold;
  border-bottom: 2px solid #000000;
}

.form-content {
  margin-bottom: 1rem;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #000000;
  border-radius: 4px;
  background-color: #ffffff;
  color: #000000;
}

.verification-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.verification-container input {
  flex: 1;
  margin-bottom: 0;
}

.verification-container button {
  white-space: nowrap;
  width: auto;
  padding: 0.5rem 1rem;
}

button {
  width: 100%;
  padding: 0.5rem;
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  margin-bottom: 1rem;
  text-align: center;
}

.kakao-login {
  background-color: #FEE500;
  color: #000000;
  border: none;
  margin-top: 1rem;
}

.copyright {
  font-size: 0.75rem;
  text-align: center;
  margin-top: 1rem;
  color: #000000;
}

@media (max-width: 480px) {
  .login-form {
    padding: 1rem;
  }

  .verification-container {
    flex-direction: column;
  }

  .verification-container button {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
