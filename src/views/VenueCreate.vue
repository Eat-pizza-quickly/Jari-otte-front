<template>
  <div class="container">
    <h1>공연장 이름을 입력해주세요</h1>
    <form @submit.prevent="createVenue">
      <div class="form-group">
        <label for="venueName">공연장 이름</label>
        <input
          type="text"
          id="venueName"
          v-model="venue.venueName"
          placeholder="상암경기장"
          required
        />
      </div>

      <div class="form-group">
        <label for="location">장소</label>
        <input
          type="text"
          id="location"
          v-model="venue.location"
          placeholder="서울 상암"
          required
        />
      </div>

      <div class="form-group">
        <label for="seatCount">좌석 수</label>
        <input
          type="number"
          id="seatCount"
          v-model="venue.seatCount"
          placeholder="1000"
          required
        />
      </div>

      <button type="submit" class="submit-button">생성하기</button>
    </form>
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import router from '@/router';
export default {
  data() {
    return {
      venue: {
        venueName: '',
        location: '',
        seatCount: null,
      },
    };
  },
  methods: {
    createVenue() {
      // 여기서 서버로 요청을 보낼 수 있습니다.
      console.log('Creating venue with data:', this.venue);
      axios.post('/venues', this.venue)
        .then(response => {
          console.log(response.data);
          router.push({ name: 'home' }); // HomeView로 이동
        })
        .catch(error => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: black;
  color: white;
  text-align: center;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #333;
}
</style>
