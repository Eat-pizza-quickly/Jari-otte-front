<template>
  <div class="concert-creation">
    <h1>공연 생성</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="concertName">공연명</label>
        <input type="text" v-model="concert.title" placeholder="공연명을 입력해주세요" required />
      </div>
      <div class="form-group">
        <label for="venue">장소</label>
        <select v-model="selectedVenue" required>
          <option value="" disabled>공연장 선택</option>
          <option v-for="venue in venues" :key="venue.location" :value="venue">
            {{ venue.location }} (좌석 수: {{ venue.seatCount }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="date">공연 일자</label>
        <input type="datetime-local" v-model="concert.performDate" required />
      </div>
      <div class="form-group">
        <label for="startTime">예매 시작일</label>
        <input type="datetime-local" v-model="concert.startDate" required />
      </div>
      <div class="form-group">
        <label for="endTime">예매 종료일</label>
        <input type="datetime-local" v-model="concert.endDate" required />
      </div>
      <div class="form-group">
        <label for="price">가격</label>
        <input type="number" v-model="concert.price" placeholder="가격을 입력해주세요" required />
      </div>
      <div class="form-group">
        <label for="artists">아티스트</label>
        <input type="text" v-model="concert.artistsString" placeholder="아티스트 이름을 입력해주세요 (여러명 가능)" required />
      </div>
      <div class="form-group">
        <label for="category">카테고리</label>
        <select v-model="concert.category" required>
          <option value="MUSICAL">뮤지컬</option>
          <option value="CONCERT">콘서트</option>
          <option value="THEATER">연극</option>
          <option value="ESPORT">이스포츠</option>
        </select>
      </div>
      <div class="form-group">
        <label for="description">설명</label>
        <textarea v-model="concert.description" placeholder="설명 입력"></textarea>
      </div>
      <div class="form-group">
        <label for="thumbnail">썸네일</label>
        <input type="url" v-model="concert.thumbnailUrl" placeholder="썸네일 URL을 입력해주세요" />
      </div>
      <div class="form-group">
        <label for="host">호스트 ID</label>
        <input type="text" v-model="host" placeholder="호스트 ID를 입력해주세요" required />
      </div>
      <button type="submit">생성하기</button>
    </form>
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import router from '@/router';

export default {
  data() {
    return {
      concert: {
        title: '',
        performDate: '',
        startDate: '',
        endDate: '',
        price: '',
        artists: [],
        artistsString: '',
        description: '',
        thumbnailUrl: '',
        category: '',
      },
      selectedVenue: '',
      venues: [],
      host: '',
    };
  },
  created() {
    this.fetchVenues();
  },
  methods: {
    async fetchVenues() {
      try {
        const response = await axios.get('/venues');
        this.venues = response.data;
      } catch (error) {
        console.error('공연장 정보 가져오기 오류:', error);
      }
    },
    handleSubmit() {
      // artists 배열 생성
      this.concert.artists = this.concert.artistsString.split(',').map(artist => artist.trim());

      // API 요청을 위한 데이터 객체 생성
      const concertData = {
        ...this.concert,
        venueId: this.selectedVenue.id,
        location: this.selectedVenue.location,
      };

      // artistsString 제거
      delete concertData.artistsString;

      // 기본 썸네일 설정 (필요한 경우)
      if (!concertData.thumbnailUrl) {
        concertData.thumbnailUrl = require('@/assets/default-thumbnail.jpg');
      }

      try {
        axios.post(`/concerts?host=${this.host}`, concertData)
          .then(response => {
            console.log('공연이 성공적으로 생성되었습니다:', response.data);
            // 성공적으로 생성된 후 HomeView로 이동
            router.push({ name: 'home' });
          })
          .catch(error => {
            console.error('공연 생성 중 오류 발생:', error);
          });
      } catch (error) {
        console.error('예상치 못한 오류:', error);
      }
    },
  },
};
</script>

<style scoped>
.concert-creation {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  background-color: black;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #333;
}
</style>
