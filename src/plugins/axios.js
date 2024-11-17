// src/plugins/axios.js
import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'https://localhost:8080/api/v1', // API의 기본 URL
  timeout: 10000, // 요청 타임아웃 (밀리초)
});

// 요청 인터셉터를 설정하여 JWT 토큰을 포함
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // LocalStorage에서 JWT 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
