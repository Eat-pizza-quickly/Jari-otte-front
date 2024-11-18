<template>
  <div class="page">
    <div class="content-wrapper">
      <!-- 사이드바 -->
      <aside class="sidebar">
        <nav>
          <ul>
            <li v-for="(category, index) in categories" :key="category" :class="{ active: index === 0 }">
              {{ category }}
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 검색바 -->
        <div class="search-container">
          <div class="search-wrapper">
            <input
              type="text"
              v-model="searchQuery"
              @input="debouncedFetchSuggestions"
              placeholder="검색어를 입력하세요"
              @keydown.enter="executeSearch"
              class="search-bar"
            />
            <button class="search-button" @click="executeSearch">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <!-- 추천 리스트 -->
          <ul v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.auto"
              @click="selectSuggestion(suggestion.auto)"
              class="suggestion-item"
            >
              {{ suggestion.auto }}
            </li>
          </ul>

          <!-- 로딩 인디케이터 -->
          <div v-if="isLoading" class="loading-indicator">검색 중...</div>

          <!-- 추천 결과 없음 -->
          <div v-else-if="showSuggestions && !isLoading && suggestions.length === 0" class="no-suggestions">
            추천 결과가 없습니다.
          </div>
        </div>

        <!-- 슬라이더 섹션 -->
        <section class="slider">
          <div class="slider-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(slide, index) in slides" :key="index" class="slide">
              {{ slide.content }}
            </div>
          </div>
          <div class="slider-dots">
            <span v-for="(slide, index) in slides" :key="index" class="dot" :class="{ active: currentSlide === index }"
                  @click="setSlide(index)"></span>
          </div>
        </section>

        <!-- 검색 결과 -->
        <section class="search-results" v-if="searchResults && searchResults.length > 0">
          <h2>검색 결과</h2>
          <div class="result-grid">
            <div v-for="result in searchResults" :key="result.concertId" class="result-item">
              <div class="poster">
                <img v-if="result.thumbnailUrl" :src="result.thumbnailUrl" alt="포스터" />
                <div v-else class="poster-placeholder">포스터 준비 중</div>
              </div>
              <div class="info">
                <p class="title">{{ result.title || '타이틀: 아직 준비 중' }}</p>
                <p class="perform-date">공연 날짜: {{ result.performDate || '아직 준비 중' }}</p>
                <p class="start-date">시작일: {{ result.startDate || '아직 준비 중' }}</p>
                <p class="end-date">종료일: {{ result.endDate || '아직 준비 중' }}</p>
              </div>
            </div>
          </div>
        </section>
        <div v-else>
          <p>검색 결과가 없습니다.</p>
        </div>

      </main>
    </div>

    <!-- 푸터 -->
    <footer class="footer">
      <a href="#" v-for="link in footerLinks" :key="link">{{ link }}</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axiosInstance from '@/plugins/axios'; // Axios 인스턴스 가져오기
import { useRoute, useRouter } from 'vue-router'
const router = useRouter(); // 라우터 사용

//
// 검색창 관련 상태 및 기능
//
const searchQuery = ref(''); // 검색 입력값
const suggestions = ref([]); // 추천 리스트
const isLoading = ref(false); // 로딩 상태
const showSuggestions = ref(false); // 추천 리스트 표시 여부

// 추천 리스트 가져오기 함수 (API 통신)
const fetchSuggestions = async (query) => {
  if (!query.trim()) {
    // 검색어가 없을 때 추천 초기화
    suggestions.value = [];
    return;
  }

  isLoading.value = true; // 로딩 상태 시작

  try {
    // API 호출
    const response = await axiosInstance.get('/concerts/search/autocomplete', {
      params: { query },
    });

    // 응답 데이터에서 autoList 추출
    suggestions.value = response.data?.data?.autoList || []; // 안전하게 데이터 접근
    showSuggestions.value = suggestions.value.length > 0; // 추천 리스트 표시 여부
  } catch (error) {
    console.error('추천 리스트를 가져오는 중 오류 발생:', error);
    suggestions.value = []; // 오류 발생 시 추천 리스트 초기화
  } finally {
    isLoading.value = false; // 로딩 상태 종료
  }
};

// 디바운스 처리 (짧은 시간 내 반복 입력 방지)
let debounceTimeout;
const debouncedFetchSuggestions = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchSuggestions(searchQuery.value);
  }, 300);
};

// 추천 항목 선택
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion; // 선택 항목을 검색창에 반영
  showSuggestions.value = false; // 추천 리스트 숨기기
};

// 검색 실행 함수 (검색 결과 페이지로 이동)
const executeSearch = () => {
  if (!searchQuery.value.trim()) return; // 빈 검색어 방지
  showSuggestions.value = false; // 추천 리스트 숨기기
  router.push({ name: 'searchResults', query: { query: searchQuery.value } }); // 검색 결과 페이지로 이동
};

// 검색창 외부 클릭 감지
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSuggestions.value = false; // 외부 클릭 시 추천 리스트 닫기
  }
};

const route = useRoute();

// 라우트 변경 감지 및 처리
watch(
  () => route.query.query, // 감시할 값: query 파라미터
  (newQuery) => {
    if (newQuery) {
      fetchSearchResults(); // 새로운 query로 데이터 요청
    }
  }
);

// 클릭 이벤트 등록 및 해제
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

//
// 사이드 바
//
const categories = ref(['콘서트', '전시/행사', '연극', 'ESPORT']);

//
// 검색 결과
//
// 검색 관련 상태
const searchResults = ref([]);

// API 호출 함수
const fetchSearchResults = async () => {
  const query = route.query.query || '';
  if (!query.trim()) return;

  searchQuery.value = query;
  isLoading.value = true;

  try {
    const response = await axiosInstance.get('/concerts/search', {
      params: { query },
    });

    console.log(response.data); // 전체 응답 구조 확인
    searchResults.value = response.data?.data?.concertList || []; // `concertList`로 접근
  } catch (error) {
    console.error('검색 결과를 가져오는 중 오류 발생:', error);
    searchResults.value = []; // 오류 발생 시 빈 배열로 초기화
  } finally {
    isLoading.value = false;
  }
};

// 컴포넌트 마운트 시 검색 결과 요청
onMounted(fetchSearchResults);

//
// 푸터 링크
//
const footerLinks = ref(['이용약관', '개인정보 처리방침', '고객센터']);

//
// 슬라이더 관련 로직
//
const slides = ref([
  { content: '최신 공연 정보를 나의 취향에 맞게 추천해드려요!' },
  { content: '인기 있는 공연 티켓을 놓치지 마세요!' },
  { content: '특별 할인 이벤트 중입니다. 지금 확인하세요!' },
]);

const currentSlide = ref(0); // 현재 슬라이드 인덱스
const slideInterval = ref(null); // 자동 전환 타이머

// 다음 슬라이드로 이동
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

// 특정 슬라이드로 설정
const setSlide = (index) => {
  currentSlide.value = index;
};

// 슬라이더 자동 전환 등록 및 해제
onMounted(() => {
  slideInterval.value = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
  }
});
</script>

<style scoped>
/* 페이지 전체 레이아웃 */
.page {
  all: unset; /* 글로벌 스타일 초기화 */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background-color: white;
  color: black; /* 글로벌 텍스트 색상 덮어쓰기 */
}

/* 콘텐츠 래퍼 */
.content-wrapper {
  display: flex;
  flex: 1;
}

/* 사이드바 스타일 */
.sidebar {
  width: 220px;
  background-color: #D9A66C;
  padding: 20px;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  padding: 12px 0;
  font-size: 1.1em;
  cursor: pointer;
}

.sidebar li.active {
  font-weight: bold;
}

/* 메인 콘텐츠 스타일 */
.main-content {
  flex: 1;
  padding: 30px;
  background-color: #ffffff;
}

/* 검색바 스타일 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc; /* 기존 #ddd보다 더 명확한 색상 */
  border-radius: 24px;
  overflow: hidden;
  background-color: white;
}

.search-bar {
  flex-grow: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333; /* 텍스트 색상 명확히 */
}

.search-bar::placeholder {
  color: #aaa; /* 플레이스홀더 색상 추가 */
}

.search-button {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  color: #666; /* 기존 #888보다 더 강한 대비 */
  transition: color 0.3s ease;
}

.search-button:hover {
  color: #000; /* 버튼 호버 시 색 변경 */
}

.suggestions-list {
  position: absolute;
  top: calc(100% + 4px); /* 검색창 아래 약간의 간격 추가 */
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 16px 16px; /* 하단 모서리 둥글게 */
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1500; /* 다른 요소 위로 올리기 */
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15); /* 더 명확한 그림자 */
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s, color 0.3s; /* 부드러운 전환 효과 */
}

.suggestion-item:hover {
  background-color: #f0f0f0; /* 더 어두운 배경 */
  color: #000; /* 텍스트 색상 변경 */
}

.loading-indicator {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fafafa; /* 약간의 회색 배경 */
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 16px 16px;
  padding: 12px;
  text-align: center;
  color: #666;
  font-size: 14px;
  z-index: 1600; /* 다른 요소 위로 올리기 */
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1); /* 그림자 개선 */
}

.no-suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 16px 16px;
  padding: 12px;
  text-align: center;
  color: #888;
  font-size: 14px;
  z-index: 1500;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

/* 추가: 키보드 탐색 상태 */
.suggestion-item:focus {
  background-color: #e6e6e6; /* 키보드 탐색 시 강조 */
  outline: none; /* 기본 아웃라인 제거 */
}

/* 슬라이더 스타일 */
.slider {
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.slider-container {
  display: flex;
  transition: transform 0.5s ease;
}

.slide {
  flex: 0 0 100%;
  background-color: #e0e0e0;
  padding: 40px;
  text-align: center;
  font-size: 1.2em;
  color: #333;
}

.slider-dots {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.dot {
  height: 10px;
  width: 10px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 0 5px;
  cursor: pointer;
}

.dot.active {
  background-color: #717171;
}

/*
** 검색 결과
*/

.search-results {
  margin-top: 30px;
}

.result-grid {
  display: flex;
  flex-wrap: wrap; /* 한 줄에 5개, 초과 시 줄바꿈 */
  gap: 20px; /* 카드 간격 */
  justify-content: center; /* 가운데 정렬 */
}

.result-item {
  width: 200px; /* 카드 고정 너비 */
  background: #fff; /* 배경색 */
  border-radius: 8px; /* 둥근 모서리 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 */
  text-align: center; /* 텍스트 중앙 정렬 */
  padding: 10px;
}

/* 포스터 스타일 */
.poster {
  width: 100%;
  height: 150px; /* 고정 높이 */
  background-color: #f0f0f0; /* 포스터 없는 경우 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.poster img {
  max-width: 100%; /* 포스터 크기 조정 */
  max-height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  font-size: 14px;
  color: #888;
}

/* 텍스트 정보 */
.info {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.info .title {
  font-weight: bold;
  margin-bottom: 5px;
}

.info .date,
.info .end-date {
  font-size: 13px;
}

/* 하단 순위 항목 */
.bottom-ranking li {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 260px; /* 항목 너비 증가 */
  text-align: center; /* 텍스트 중앙 정렬 */
  margin-bottom: 30px; /* 목록 하단 간격 */
}

/* 하단 순위와 푸터 사이 간격 */
.footer {
  margin-top: 40px; /* 푸터 상단 간격 */
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.event-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

/* 푸터 스타일 */
.footer {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.footer a {
  color: #555;
  text-decoration: none;
}
</style>

