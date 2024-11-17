<template>
  <div class="login-container">
    <div class="login-form">
      <h2>관리자 로그인</h2>
      <form @submit.prevent="login">
        <input type="text" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit" class="login-button">Login</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import VueJwtDecode from 'vue-jwt-decode'

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('/users/login', {
          email: this.email,
          password: this.password
        });

        if (response.status === 200) { // 상태 코드가 200인지 확인합니다.
          const token = response.data.data;
          const decodedToken = VueJwtDecode.decode(token);

          if (decodedToken.userRole === 'ADMIN') {
            // 토큰을 로컬 스토리지에 저장합니다.
            localStorage.setItem('token', token);
            // ADMIN 페이지로 이동합니다.
            this.$router.push({ name: 'adminPage' });
          } else {
            this.errorMessage = '관리자 권한이 없습니다.';
          }
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        this.errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-form {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 350px;
  text-align: center;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
