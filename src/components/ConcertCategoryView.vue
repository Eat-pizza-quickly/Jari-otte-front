<template>
  <div>
    <!-- 헤더 추가 -->
    <LoginHeader />

    <!-- 카테고리 뷰 섹션 -->
    <section class="concert-category-view">
      <h2>{{ selectedSidecategory }} 공연 목록</h2>
      <div v-if="loading">로딩 중...</div>
      <div v-if="concertList.length === 0 && !loading">조회된 결과가 없습니다.</div>
      <div v-else class="concert-list-wrapper">
        <div
          v-for="(concert, index) in concertList"
          :key="concert.concertId ? concert.concertId : `concert-${index}`"
          class="concert-item"
          @click="goToConcertDetail(concert.concertId)"
        >
          <img :src="concert.thumbnailUrl" alt="콘서트 포스터" class="concert-thumbnail" v-if="concert.thumbnailUrl" />
          <h3>{{ concert.title }}</h3>
          <p>공연 날짜: {{ formatDate(concert.performDate) }}</p>
          <p>시작 시간: {{ formatDate(concert.startDate) }}</p>
          <p>종료 시간: {{ formatDate(concert.endDate) }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/plugins/axios'

// LoginHeader 컴포넌트 임포트
import LoginHeader from '@/components/LoginHeader.vue'

// 라우터에서 파라미터 가져오기
const route = useRoute()
const router = useRouter()
const selectedSidecategory = ref(route.params.sidecategory) // 선택된 카테고리

// 상태 정의
const concertList = ref([]) // 콘서트 목록
const loading = ref(false) // 로딩 상태

// 날짜 형식 변환 함수
const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음'
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('ko-KR', options).replace(/\. /g, '-').replace('오전', '').replace('오후', '').trim();
}

// 카테고리 데이터 로드 함수
const fetchConcertData = async () => {
  loading.value = true

  try {
    // 카테고리 이름을 그대로 사용하여 API 호출
    const response = await axios.get(`/concerts/category/${selectedSidecategory.value}`)
    concertList.value = response.data?.data?.content || []
  } catch (error) {
    console.error('카테고리 조회 중 오류 발생:', error)
    concertList.value = [] // 오류 발생 시 결과 초기화
  } finally {
    loading.value = false
  }
}

// 상세 페이지로 이동하는 함수
const goToConcertDetail = (concertId) => {
  if (!concertId) {
    console.warn('콘서트 ID가 없습니다.')
    return
  }
  router.push({ name: 'concert', params: { concertId } }) // 상세 페이지로 이동
}

// 컴포넌트가 마운트될 때 데이터 로드
onMounted(() => {
  fetchConcertData()
})
</script>

<style scoped>
.concert-category-view {
  margin: 20px;
  text-align: center;
}

.concert-list-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding: 0 20px;
}

.concert-item {
  flex: 0 1 calc(14.28% - 20px); /* 한 줄에 7개씩, 각 카드 간 여백 계산 */
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  text-align: left;
  cursor: pointer; /* 클릭 가능하다는 것을 시각적으로 표시 */
}

.concert-item:hover {
  transform: translateY(-5px);
}

.concert-thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

h3 {
  font-size: 1em;
  margin-bottom: 10px;
}

p {
  font-size: 0.85em; /* 폰트 크기 축소 */
  color: #666;
  margin-bottom: 5px;
}
</style>
