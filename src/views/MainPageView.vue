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
              class="search-bar"
            />
            <button class="search-button">
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

        <!-- 인기 카테고리 순위 -->
        <section class="popular-categories">
          <h2>인기 순위</h2>

          <!-- 슬라이더 영역 -->
          <div class="slider-wrapper">
            <div class="slider-view">
              <div class="slider-track" :style="{ transform: `translateX(-${currentCategory * 100}%)` }">
                <div v-for="(category, index) in topCategories" :key="index" class="slider-item">
                  <!-- 포스터 -->
                  <div class="poster">
                    <img :src="category.thumbnailUrl || ''" alt="포스터" class="poster-image" v-if="category.thumbnailUrl" />
                  </div>
                  <!-- 텍스트 정보 -->
                  <div class="category-info">
                    <p>{{ index + 1 }}위</p>
                    <p>타이틀: {{ category.title || '아직 준비 중' }}</p>
                    <p>공연 날짜: {{ category.startDate || '아직 준비 중' }}</p>
                    <p>공연 끝나는 날짜: {{ category.endDate || '아직 준비 중' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="slider-button left" @click="prevCategory">&lt;</button>
            <button class="slider-button right" @click="nextCategory">&gt;</button>
          </div>

          <!-- 하단 순위 목록 -->
          <ul class="bottom-ranking">
            <li v-for="(category, index) in bottomCategories" :key="index">
              <!-- 작은 포스터 -->
              <div class="small-poster">
                <img :src="category.thumbnailUrl || ''" alt="포스터" class="small-poster-image" v-if="category.thumbnailUrl" />
              </div>
              <!-- 텍스트 정보 -->
              <div class="category-info">
                <p>{{ index + 6 }}위</p>
                <p>타이틀: {{ category.title || '아직 준비 중' }}</p>
                <p>공연 날짜: {{ category.startDate || '아직 준비 중' }}</p>
                <p>공연 끝나는 날짜: {{ category.endDate || '아직 준비 중' }}</p>
              </div>
            </li>
          </ul>
        </section>


        <!-- 추천 공연 섹션 -->
        <section class="recommended-events">
          <!-- 추천 공연 카드 -->
          <div class="event-card" v-for="event in events" :key="event.id || event.title">
            <!-- 포스터 이미지 -->
            <div class="event-image">
              <img :src="event.thumbnailUrl || ''" alt="포스터 이미지" v-if="event.thumbnailUrl" />
            </div>
            <!-- 텍스트 정보 -->
            <div class="event-info">
              <p class="event-category">{{ event.category }}</p>
              <h3 class="event-title">{{ event.title }}</h3>
              <p class="event-date">{{ event.date }}</p>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- 푸터 -->
    <footer class="footer">
      <a href="#" v-for="link in footerLinks" :key="link">{{ link }}</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axiosInstance from '@/plugins/axios'; // Axios 인스턴스 가져오기

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

// 검색창 외부 클릭 감지
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSuggestions.value = false; // 외부 클릭 시 추천 리스트 닫기
  }
};

// 클릭 이벤트 등록 및 해제
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

//
// 카테고리 및 인기 항목 관련 상태
//
const categories = ref(['콘서트', '전시/행사', '연극', 'ESPORT']);
// 초기 빈 데이터 생성
const createEmptyCategories = (count) =>
  Array(count).fill({
    thumbnailUrl: '', // 빈 포스터
    title: null, // 타이틀이 없을 때
    startDate: null, // 시작 날짜 없음
    endDate: null, // 종료 날짜 없음
  });

// 인기 콘서트 데이터 상태
const popularCategories = ref(createEmptyCategories()); // 초기에는 빈 데이터

// API 호출 함수
const fetchPopularConcerts = async () => {
  try {
    const response = await axiosInstance.get('/concerts/popular');
    const data = response.data?.data?.concertSimpleDtoList || [];

    // 데이터 개수가 10개 미만이면 나머지를 "빈 데이터"로 채움
    const filledData = [...data, ...createEmptyCategories(10 - data.length)];
    popularCategories.value = filledData;
  } catch (error) {
    console.error('인기 콘서트 데이터를 가져오는 중 오류 발생:', error);

    // API 호출 실패 시 빈 데이터로 초기화
    popularCategories.value = createEmptyCategories(10);
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchPopularConcerts();
});

// 슬라이더 및 하단 목록 계산
const topCategories = computed(() => popularCategories.value.slice(0, 5)); // 1~5위
const bottomCategories = computed(() => popularCategories.value.slice(5, 10)); // 6~10위

// 슬라이더 상태
const currentCategory = ref(0);

// 슬라이더 이동 계산
const nextCategory = () => {
  currentCategory.value = (currentCategory.value + 1) % topCategories.value.length; // 다음 슬라이드
};

const prevCategory = () => {
  currentCategory.value =
    (currentCategory.value - 1 + topCategories.value.length) % topCategories.value.length; // 이전 슬라이드
};

// 슬라이더 위치 업데이트
const updateSliderPosition = () => {
  const sliderTrack = document.querySelector('.slider-track');
  const translateValue = -currentCategory.value * 100; // 이동 거리 계산
  sliderTrack.style.transform = `translateX(${translateValue}%)`;
};

// 반응형 대응
window.addEventListener('resize', () => {
  currentCategory.value = 0; // 크기 변경 시 슬라이더 초기화
  updateSliderPosition(); // 위치 재설정
});

//
// 공연 이벤트 상태
//
// 추천 공연 데이터 상태
const events = ref([]);

// API 호출 함수
const fetchRecommendedEvents = async () => {
  try {
    const response = await axiosInstance.get('/concerts', {
      params: {
        page: 0, // 첫 번째 페이지
        size: 10, // 최대 10개 가져오기
      },
    });

    // 데이터가 있으면 상태 업데이트, 없으면 빈 상태 유지
    const concertData = response.data?.data?.concertSimpleDtoList || [];
    events.value = concertData.map((concert) => ({
      id: concert.concertId || null,
      category: '공연', // 카테고리가 없으므로 기본값 설정
      title: concert.title || '아직 준비 중',
      date: concert.startDate || '아직 준비 중',
      thumbnailUrl: concert.thumbnailUrl || '', // 포스터 이미지
    }));
  } catch (error) {
    console.error('추천 공연 데이터를 가져오는 중 오류 발생:', error);
    // 에러 발생 시 빈 데이터를 기본 상태로 설정
    events.value = Array(10).fill({
      id: null,
      category: '공연',
      title: '아직 준비 중',
      date: '아직 준비 중',
      thumbnailUrl: '',
    });
  }
};

// 컴포넌트 마운트 시 API 호출
onMounted(() => {
  fetchRecommendedEvents();
});

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

.suggestion-icon {
  margin-right: 12px;
  color: #888;
}

.suggestion-arrow {
  margin-left: auto;
  color: #aaa; /* 기본 색상 변경 */
  transition: color 0.3s ease; /* 전환 효과 추가 */
}

.suggestion-item:hover .suggestion-arrow {
  color: #555; /* 호버 시 강조 */
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

/* 인기 카테고리 스타일 */
/* 인기 순위 제목 스타일 */
.popular-categories h2 {
  text-align: center; /* 텍스트 중앙 정렬 */
  font-size: 24px; /* 폰트 크기 */
  margin-bottom: 20px; /* 하단 여백 */
  font-weight: bold; /* 텍스트 굵게 */
}

/* 순위 텍스트 스타일 */
.slider-item .category-info p:first-child {
  font-size: 20px; /* 순위 텍스트 크기 */
  font-weight: bold; /* 텍스트 굵게 */
  color: #333; /* 색상 */
  margin-bottom: 10px; /* 순위와 나머지 텍스트 간격 */
}

/* 전체 래퍼 */
.slider-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1400px; /* 슬라이더 최대 너비 */
  margin: 0 auto; /* 중앙 정렬 */
}

/* 슬라이더 뷰 */
.slider-view {
  position: relative;
  width: 100%; /* 부모의 전체 너비 */
  overflow: hidden; /* 넘치는 콘텐츠 숨김 */
}

/* 슬라이더 트랙 */
.slider-track {
  display: flex; /* 슬라이더 아이템 가로 배치 */
  transition: transform 0.5s ease; /* 이동 효과 */
  transform: translateX(0); /* 초기 위치 */
  gap: 0; /* 아이템 간 간격 제거 */
}

/* 슬라이더 아이템 */
.slider-item {
  flex: 0 0 100%; /* 아이템이 부모의 100% 차지 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center; /* 텍스트 중앙 정렬 */
  padding: 20px;
}

/* 큰 포스터 스타일 */
.poster {
  width: 500px;
  height: 750px;
  background-color: #f0f0f0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 18px;
}

/* 텍스트 정보 */
.category-info {
  font-size: 18px;
  color: #333;
  line-height: 1.6; /* 줄 간격 */
}

/* 버튼 */
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); /* 버튼 그림자 */
  z-index: 10;
}

.slider-button.left {
  left: 10px; /* 왼쪽 버튼 */
}

.slider-button.right {
  right: 10px; /* 오른쪽 버튼 */
}

/* 하단 순위 목록 */
.bottom-ranking {
  display: flex;
  flex-wrap: wrap; /* 화면 크기에 따라 줄바꿈 */
  justify-content: center; /* 중앙 정렬 */
  gap: 50px; /* 포스터 간 간격 */
  padding: 20px 0;
  margin-top: 40px; /* 상단과 간격 증가 */
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

/* 작은 포스터 스타일 */
.small-poster {
  width: 240px;
  height: 360px;
  background-color: #f0f0f0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 16px;
}

.category-info p {
  color: #555;
}

/* 하단 텍스트 */
.bottom-ranking .category-info {
  font-size: 16px; /* 텍스트 크기 */
  color: #555;
  line-height: 1.6; /* 줄 간격 */
}

/* 슬라이더와 하단 간격 */
.popular-categories {
  margin-bottom: 50px; /* 슬라이더와 하단 목록 간격 */
}

/* 하단 순위와 푸터 사이 간격 */
.footer {
  margin-top: 40px; /* 푸터 상단 간격 */
  padding: 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}


/* 추천 공연 스타일 */
/* 추천 공연 섹션 */
.recommended-events {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

/* 개별 카드 */
.event-card {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 10px;
}

/* 포스터 이미지 */
.event-image {
  width: 100%;
  height: 150px;
  background-color: #f0f0f0; /* 포스터 없는 경우 배경 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

/* 텍스트 정보 */
.event-info {
  margin-top: 10px;
}

.event-category {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.event-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.event-date {
  font-size: 14px;
  color: #666;
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
