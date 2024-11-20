<template>
  <div class="login-container">
    <div class="login-form">
      <h2>관리자 로그인</h2>
      <form @submit.prevent="login">
        <input
          type="email"
          v-model="email"
          :class="{ error: emailError }"
          placeholder="Email"
          required
        />
        <input
          type="password"
          v-model="password"
          :class="{ error: passwordError }"
          placeholder="Password"
          required
        />
        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : 'Login' }}
        </button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false,
      emailError: false,
      passwordError: false,
    }
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(this.email)
    },
    async login() {
      this.isLoading = true
      this.errorMessage = ''

      if (!this.validateEmail()) {
        this.emailError = true
        this.errorMessage = '유효한 이메일 주소를 입력해주세요.'
        this.isLoading = false
        return
      }

      try {
        const response = await this.$store.dispatch('/users/login', {
          email: this.email,
          password: this.password,
        })

        if (response.status === 200) {
          // 상태 코드가 200인지 확인합니다.
          const token = response.data.data
          const decodedToken = VueJwtDecode.decode(token)

          if (decodedToken.userRole === 'ADMIN') {
            // 토큰을 로컬 스토리지에 저장합니다.
            localStorage.setItem('token', token)
            // ADMIN 페이지로 이동합니다.
            this.$router.push({ name: 'adminPage' })
          } else {
            this.errorMessage = '관리자 권한이 없습니다.'
          }
        } else {
          this.errorMessage = response.data.message
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #74ebd5, #acb6e5);
  font-family: 'Arial', sans-serif;
}

.login-form {
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-form h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 0.85rem;
  margin-bottom: 1.2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type='email']:focus,
input[type='password']:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

input.error {
  border-color: #e74c3c;
  background-color: #fdecea;
}

.login-button {
  width: 100%;
  padding: 0.85rem;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.login-button:disabled {
  background-color: #a3c4f3;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .login-form {
    padding: 2rem;
  }

  input[type='email'],
  input[type='password'],
  .login-button {
    font-size: 0.9rem;
  }

  .login-form h2 {
    font-size: 1.3rem;
  }
}
</style>
