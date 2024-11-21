import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false); // 로그인 상태를 관리합니다. (이 부분은 추후 Vuex나 Pinia로 관리 가능)
const userRole = ref('USER'); // 사용자 역할 ('ADMIN' 또는 'USER')

const useLoginRedirect = () => {
  const router = useRouter();

  const redirectToLogin = () => {
    if (!isLoggedIn.value) {
      if (userRole.value === 'ADMIN') {
        // 관리자일 경우 관리자 로그인 페이지로 리다이렉트
        router.push({ name: 'AdminLogin' });
      } else {
        // 일반 사용자일 경우 일반 로그인 페이지로 리다이렉트
        router.push({ name: 'UserLogin' });
      }
    }
  };

  return {
    redirectToLogin,
  };
};

export default useLoginRedirect;
