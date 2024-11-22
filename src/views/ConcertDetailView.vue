<script setup>
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
  artists: '',
  seatCount: 0,
  performDate:'',
  startDate: '',
  endDate: '',
  thumbnailUrl: '',
})

const token = localStorage.getItem('token');

// userRole 초기화
const userRole = ref(null);

if (token) {
  try {
    // `Bearer`가 없는 경우도 처리
    const jwt = token.includes('Bearer ') ? token.split(' ')[1] : token;

    // JWT의 payload 파싱
    const payload = JSON.parse(atob(jwt.split('.')[1]));

    // userRole 추출
    userRole.value = payload.userRole;

    console.log('userRole:', userRole);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
  }
} else {
  console.error('No token found in localStorage');
}


// 댓글 데이터와 페이지 정보
const reviews = ref([]);
const pageInfo = ref({});

// 댓글 조회 함수
const fetchReviews = (page = 0) => {
  axios
    .get(`/reviews?concertId=${props.concertId}`)
    .then((response) => {
      reviews.value = response.data.data.content.reverse(); // 댓글 리스트
      pageInfo.value = {
        currentPage: response.data.data.pageable.pageNumber,
        totalPages: response.data.data.totalPages,
        totalElements: response.data.data.totalElements,
        size: response.data.data.size,
        first: response.data.data.first,
        last: response.data.data.last,
      }; // 페이지 정보
    })
    .catch((error) => {
      console.error('Failed to fetch reviews:', error);
    });
};

const getConcert = () => {
  axios
    .get(`/concerts/${props.concertId}`)
    .then((response) => {
      concertDetail.value = response.data.data
      console.log(concertDetail.value)
      // 대괄호 제거
      concertDetail.value.artists = concertDetail.value.artists.replace(/^\[|\]$/g, '');
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

const goToSeatSelection = () => {
  router.push(`/concerts/${props.concertId}/seat`)
}

// 수정 페이지로 이동
const goToEditConcert = () => {
  router.push(`/concerts/${props.concertId}/edit`)
}

// 댓글 입력 상태 관리
const newReview = ref({
  rating: 0, // 평점 (별점 등으로 구현 가능)
  content: '', // 댓글 내용
});

// 댓글 추가 함수
const addReview = () => {
  if (!newReview.value.content.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  axios
    .post(`/reviews?concertId=${props.concertId}`, {
      rating: newReview.value.rating,
      content: newReview.value.content,
    })
    .then((response) => {
      reviews.value.unshift(response.data.data); // 최신 댓글이 위로 오도록 리스트에 추가
      pageInfo.value.totalElements += 1; // 총 댓글 수 증가
      newReview.value.content = ''; // 입력 필드 초기화
      newReview.value.rating = 0; // 평점 초기화
    })
    .catch((error) => {
      console.error('Failed to add review:', error);
      alert('댓글 등록에 실패했습니다.');
    });
};

onMounted(() => {
  getConcert()
  fetchReviews()
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
      <p class="concert-description">{{ concertDetail.description }}</p>
      <ul class="info-list">
        <li><strong>출연자:</strong> {{ concertDetail.artists }}</li>
        <li><strong>장소:</strong> {{ concertDetail.location }}</li>
        <li><strong>공연 일자:</strong> {{ formatDate(concertDetail.performDate) }}</li>
        <li><strong>예매 시작일:</strong> {{ formatDate(concertDetail.startDate) }}</li>
        <li><strong>예매 종료일:</strong> {{ formatDate(concertDetail.endDate) }}</li>
      </ul>
      <!-- 수정하기 버튼 -->
      <button
        v-if="userRole === 'ADMIN'"
        class="btn-edit"
        @click="goToEditConcert"
      >
        수정하기
      </button>
      <!-- 예매하기 버튼 -->
      <button class="btn-reserve" @click="goToSeatSelection">예매하기</button>
    </div>

    <!-- 댓글 작성 섹션 -->
    <div class="review-input-container">
      <h3>댓글 작성</h3>
      <textarea
        v-model="newReview.content"
        placeholder="댓글을 입력하세요..."
        class="review-textarea"
      ></textarea>
      <div class="review-actions">
<!--        <input-->
<!--          v-model="newReview.rating"-->
<!--          type="number"-->
<!--          placeholder="평점 (1-5)"-->
<!--          min="1"-->
<!--          max="5"-->
<!--          class="review-rating"-->
<!--        />-->
        <button @click="addReview" class="btn-submit-review">댓글 등록</button>
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div class="reviews-container">
      <h2>댓글 ({{ pageInfo.totalElements }})</h2>

      <!-- 댓글 리스트 -->
      <ul class="review-list">
        <li v-for="(review, index) in reviews" :key="index" class="review-item">
          <p><strong>{{ review.nickname }}</strong> (평점: {{ review.rating }})</p>
          <p>{{ review.content }}</p>
        </li>
      </ul>

      <!-- 페이지네이션 -->
      <div class="pagination" v-if="pageInfo.totalPages > 1">
        <button
          :disabled="pageInfo.first"
          @click="fetchReviews(pageInfo.currentPage - 1)"
          class="pagination-btn"
        >
          이전
        </button>
        <span>페이지 {{ pageInfo.currentPage + 1 }} / {{ pageInfo.totalPages }}</span>
        <button
          :disabled="pageInfo.last"
          @click="fetchReviews(pageInfo.currentPage + 1)"
          class="pagination-btn"
        >
          다음
        </button>
      </div>
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
  font-size: 28px; /* 제목 크기 */
  font-weight: bold;
  color: #333;
  margin-bottom: 10px; /* 제목과 내용 간격 */
}

/* 내용 스타일 */
.concert-description {
  font-size: 16px; /* 내용 크기 */
  color: #666;
  margin-bottom: 20px; /* 내용과 정보 리스트 간격 */
  line-height: 1.5; /* 줄 간격 */
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

/* 댓글 섹션 */
.reviews-container {
  width: 100%; /* 메인 컨테이너와 동일한 너비 */
  margin-top: 40px;
  padding: 30px; /* 패딩을 늘려 여유 공간 확보 */
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.reviews-container h2 {
  font-size: 26px; /* 제목 폰트 크기 증가 */
  margin-bottom: 30px; /* 제목 아래 간격 확대 */
  color: #333;
}

/* 댓글 리스트 */
.review-list {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0; /* 리스트와 페이지네이션 사이 간격 확대 */
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 댓글 요소 간 간격 증가 */
  padding: 20px; /* 댓글 내부 패딩 확대 */
  border: 1px solid #eee;
  border-radius: 10px; /* 모서리를 더 둥글게 */
  margin-bottom: 20px; /* 댓글 간 간격 확대 */
  background-color: #f9f9f9;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 그림자를 조금 더 강조 */
}

.review-item p {
  margin: 0;
}

.review-item strong {
  color: #d9a66c; /* 작성자 이름 강조 색 */
  font-size: 18px; /* 작성자 이름 폰트 크기 증가 */
}

.review-item span {
  font-size: 14px;
  color: #888;
}

.review-item .review-content {
  font-size: 18px; /* 댓글 내용 폰트 크기 증가 */
  color: #444; /* 내용 텍스트 색상 약간 진하게 */
  line-height: 1.8; /* 줄 간격 확대 */
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px; /* 버튼 간 간격 확대 */
}

.pagination-btn {
  padding: 12px 25px; /* 버튼 크기 확대 */
  background-color: #d9a66c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px; /* 버튼 폰트 크기 증가 */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #b68855;
  transform: scale(1.05);
}

.pagination span {
  font-size: 18px; /* 페이지 정보 폰트 크기 증가 */
  color: #333;
}

/* 댓글 작성 섹션 */
.review-input-container {
  width: 100%; /* 메인 컨테이너와 동일한 너비 */
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.review-input-container h3 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #333;
}

.review-textarea {
  width: 100%; /* 컨테이너의 너비에 맞게 확장 */
  height: 100px; /* 높이를 약간 늘림 */
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  resize: none; /* 크기 조정 비활성화 */
  margin-bottom: 15px; /* 작성 버튼과 간격 추가 */
}

.review-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 버튼을 오른쪽으로 정렬 */
  gap: 15px;
}

.review-rating {
  width: 120px; /* 입력 칸을 약간 넓게 조정 */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.btn-submit-review {
  padding: 12px 25px; /* 버튼 크기를 약간 키움 */
  background-color: #d9a66c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-submit-review:hover {
  background-color: #b68855;
  transform: scale(1.05);
}

/* 버튼 스타일 */
.btn-reserve,
.btn-edit {
  padding: 15px 25px; /* 버튼 크기 */
  background-color: #d9a66c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px; /* 폰트 크기 */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-reserve:hover,
.btn-edit:hover {
  background-color: #b68855;
  transform: scale(1.05);
}


</style>
