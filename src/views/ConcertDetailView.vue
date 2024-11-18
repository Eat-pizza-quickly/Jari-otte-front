np<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from '@/plugins/axios'

const props = defineProps({ concertId: Number })
const router = useRouter()

// 초기 값 설정
const concertDetail = ref({
  concertId: null,
  title: '',
  location: '',
  description: '',
  seatCount: 0,
  startDate: '',
  endDate: '',
  thumbnailUrl: '',
})

const getConcert = () => {
  axios
    .get(`/api/v1/concerts/${props.concertId}`)
    .then((response) => {
      concertDetail.value = response.data.data
      console.log(concertDetail.value)
    })
    .catch((e) => {
      console.log('ERROR', e)
    })
}

// 날짜 포맷 함수
const formatDate = (date) => {
  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  getConcert()
})
</script>

<template>
  <div class="concert-detail-container">
    <!-- 이미지 섹션 -->
    <div class="concert-image">
      <img
        v-if="concertDetail.thumbnailUrl"
        :src="concertDetail.thumbnailUrl"
        class="thumbnail-image"
        alt="Concert Thumbnail"
      />
      <p v-else class="no-image-text">이미지를 불러올 수 없습니다.</p>
    </div>

    <!-- 정보 섹션 -->
    <div class="concert-info">
      <h1 class="concert-title">{{ concertDetail.title }}</h1>
      <ul class="info-list">
        <li><strong>장소:</strong> {{ concertDetail.location }}</li>
        <li><strong>공연 일자:</strong> {{ formatDate(concertDetail.startDate) }}</li>
        <li><strong>예매 기간:</strong> {{ formatDate(concertDetail.endDate) }}</li>
        <li><strong>남은 좌석:</strong> {{ concertDetail.seatCount }}</li>
      </ul>
      <button class="btn-reserve">예매하기</button>
    </div>
  </div>
</template>

<style scoped>
/* 메인 컨테이너 스타일 */
.concert-detail-container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  max-width: 1000px; /* 컨테이너 너비 */
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

/* 이미지 섹션 스타일 */
.concert-image {
  flex: 1 1 400px; /* flex 비율 조정 */
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 400px;
}

.thumbnail-image {
  width: 400px; /* 이미지 너비 */
  height: 500px; /* 이미지 높이 */
  border-radius: 8px;
  object-fit: cover; /* 작은 이미지는 확대, 큰 이미지는 자르기 */
  object-position: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.no-image-text {
  font-size: 16px;
  color: #888;
  text-align: center;
}

/* 정보 섹션 스타일 */
.concert-info {
  flex: 2 1 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 요소를 상하로 나눔 */
  height: 500px; /* 이미지와 높이를 동일하게 */
  padding: 10px; /* 내부 여백 추가 */
}

/* 제목 스타일 */
.concert-title {
  font-size: 28px; /* 제목 폰트 크기 증가 */
  font-weight: bold;
  color: #333;
  margin-bottom: 15px; /* 제목과 리스트 간격 */
}

/* 정보 리스트 스타일 */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 18px; /* 리스트 폰트 크기 증가 */
  color: #555;
  line-height: 1.8; /* 줄 간격 추가 */
}

.info-list li {
  margin-bottom: 10px; /* 리스트 간 여백 증가 */
}

/* 버튼 스타일 */
.btn-reserve {
  padding: 15px 25px; /* 버튼 크기 증가 */
  background-color: #d9a66c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px; /* 버튼 폰트 크기 증가 */
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.btn-reserve:hover {
  background-color: #b68855;
  transform: scale(1.05);
}
</style>
