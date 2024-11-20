<template>
  <div class="seat-selection-container">
    <!-- 좌석 영역 -->
    <div class="seat-section">
      <h2 class="stage-title">STAGE</h2>
      <div class="seat-grid">
        <Seat
          v-for="seat in seats"
          :key="seat.id"
          :seatNumber="seat.seatNumber"
          :isReserved="seat.isReserved"
          :isSelected="selectedSeat === seat.id"
          @select="handleSeatSelect(seat)"
        />
      </div>
    </div>

    <!-- 이미지 및 정보 영역 -->
    <div class="info-section">
      <img
        src="@/assets/default_thumbnail.png"
        alt="Concert Thumbnail"
        class="concert-image"
      />
      <div class="selection-summary">
        <h3 class="selected-seat-title">선택한 좌석</h3>
        <p class="selected-seat">{{ selectedSeatDetails }}</p>
        <p class="seat-price">가격: <strong>{{ totalPrice }}원</strong></p>
        <button @click="bookSeats" class="reserve-button" :disabled="!selectedSeat">
          예약하기
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import Seat from "@/components/Seat.vue";
import axios from "@/plugins/axios";

const route = useRoute();
const seats = ref([]);
const selectedSeat = ref(null);
const concertId = route.params.concertId;

const seatPrice = 10000;

const selectedSeatDetails = computed(() => {
  if (!selectedSeat.value) return "없음";
  const seat = seats.value.find((s) => s.id === selectedSeat.value);
  return seat ? `${seat.seatNumber}` : "없음"; // ID 제거
});

const totalPrice = computed(() => {
  return selectedSeat.value ? seatPrice : 0;
});

async function fetchSeats() {
  try {
    const response = await axios.get(`/concerts/${concertId}/seats`);
    seats.value = response.data.data.seatDtoList.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      isReserved: seat.isReserved,
    }));
  } catch (error) {
    console.error("Failed to fetch seats:", error);
  }
}

function handleSeatSelect(seat) {
  if (!seat.isReserved) {
    selectedSeat.value = selectedSeat.value === seat.id ? null : seat.id;
  }
}

async function bookSeats() {
  if (!selectedSeat.value) {
    alert("좌석을 선택해주세요!");
    return;
  }

  const seat = seats.value.find((s) => s.id === selectedSeat.value); // 선택한 좌석 정보 가져오기

  if (!seat) {
    alert("선택한 좌석 정보를 찾을 수 없습니다.");
    return;
  }

  try {
    await axios.post(`/concerts/${concertId}/seats`, {
      price: seatPrice,          // 좌석 가격
      seatId: seat.id,           // 좌석 ID
      seatNumber: seat.seatNumber, // 좌석 번호
      isReserved: seat.isReserved, // 예약 상태
    });
    alert("예약이 완료되었습니다.");
    selectedSeat.value = null;
    fetchSeats();
  } catch (error) {
    console.error("Failed to book seat:", error);
  }
}

onMounted(fetchSeats);
</script>

<style scoped>
/* 전체 컨테이너 */
.seat-selection-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  height: 700px;
  margin: 0 auto;
}

/* 좌석 섹션 */
.seat-section {
  flex: 2;
  height: 100%;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  background-color: #f9f9f9;
}

.seat-section h2 {
  text-align: center;
  margin-bottom: 10px;
}

/* 좌석 그리드 */
.seat-grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 2px;
}

.seat-grid .seat {
  width: 35px;
  height: 35px;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
}

.seat-grid .seat:hover {
  background-color: #B68855;
}

.seat-grid .seat.selected {
  background-color: #D9A66C;
  color: white;
}

.seat-grid .seat.reserved {
  background-color: #999;
  cursor: not-allowed;
}

/* 정보 섹션 */
.info-section {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #ddd;
  padding: 20px;
  background-color: #f9f9f9;
}

.concert-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 선택한 좌석 스타일 */
.selection-summary {
  text-align: center;
}

.selected-seat {
  font-size: 18px; /* 글씨 크기 증가 */
  margin: 5px 0; /* 여백 줄임 */
}

.seat-price {
  font-size: 18px; /* 글씨 크기 증가 */
  margin: 5px 0; /* 여백 줄임 */
}

.reserve-button {
  margin-top: 15px; /* 버튼 상단 여백 감소 */
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 선택한 좌석 제목 스타일 */
.selected-seat-title {
  font-size: 24px; /* 제목 크기 증가 */
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

/* 선택한 좌석 정보 스타일 */
.selected-seat {
  font-size: 20px; /* 글씨 크기 증가 */
  font-weight: bold;
  margin: 10px 0;
  color: #D9A66C; /* 강조 색상 */
}

/* 좌석 가격 스타일 */
.seat-price {
  font-size: 20px; /* 글씨 크기 증가 */
  font-weight: bold;
  margin: 10px 0;
  color: #444;
}

/* 예약 버튼 스타일 */
.reserve-button {
  margin-top: 20px;
  padding: 15px 30px; /* 버튼 크기 증가 */
  font-size: 18px; /* 버튼 글씨 크기 증가 */
  background-color: #D9A66C;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.reserve-button:hover {
  background-color: #B68855;
  transform: scale(1.05); /* 호버 시 약간 확대 */
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* STAGE 스타일 */
.stage-title {
  font-size: 28px; /* 텍스트 크기 증가 */
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px; /* 내부 여백 추가 */
  border: 3px solid #D9A66C; /* 테두리 추가 */
  border-radius: 8px; /* 모서리 둥글게 */
  background-color: #f9f9f9; /* 배경색 추가 */
  color: #D9A66C; /* 글씨 색상 적용 */
  width: 100%; /* 텍스트 크기에 맞게 너비 설정 */
  margin: 0 auto 20px; /* 수평 가운데 정렬 및 아래 여백 */
}

</style>
