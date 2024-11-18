<template>
  <div class="seat-selection">
    <h1>콘서트 좌석 선택</h1>
    <p>원하는 좌석을 선택해주세요.</p>

    <!-- 좌석 표시 -->
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

    <!-- 선택한 좌석 정보 -->
    <div class="selection-summary">
      <h2>좌석 예약하기</h2>
      <p>선택한 좌석: <strong>{{ selectedSeatDetails }}</strong></p>
      <p>가격: <strong>{{ totalPrice }}원</strong></p>
      <button @click="bookSeats" class="reserve-button" :disabled="!selectedSeat">
        예약하기
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Seat from "@/components/Seat.vue";
import axios from "@/plugins/axios"; // axios를 통해 API 통신

const router = useRouter();
const route = useRoute();

// 상태 정의
const seats = ref([]); // 좌석 리스트
const selectedSeat = ref(null); // 단일 선택된 좌석 ID
const concertId = route.params.concertId;

// 기본 좌석 가격
const seatPrice = 10000;

// 로딩 상태
const isLoading = ref(true);

// 선택한 좌석 상세 정보
const selectedSeatDetails = computed(() => {
  if (!selectedSeat.value) return "없음";
  const seat = seats.value.find((s) => s.id === selectedSeat.value);
  return seat ? `${seat.seatNumber} (ID: ${seat.id})` : "없음";
});

// 총 가격 계산
const totalPrice = computed(() => {
  return selectedSeat.value ? seatPrice : 0;
});

// 좌석 데이터 가져오기
async function fetchSeats() {
  isLoading.value = true;
  try {
    const response = await axios.get(`concerts/${concertId}/seats`);
    if (response.data.status === "success") {
      seats.value = response.data.data.seatDtoList.map((seat) => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        isReserved: seat.isReserved,
      }));
    } else {
      alert("좌석 조회에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    alert("API 요청에 실패했습니다. 네트워크 상태를 확인해주세요.");
  } finally {
    isLoading.value = false;
  }
}

// 좌석 선택 핸들러
function handleSeatSelect(seat) {
  if (seat.isReserved) return; // 예약된 좌석은 선택 불가
  if (selectedSeat.value === seat.id) {
    selectedSeat.value = null; // 동일 좌석 클릭 시 선택 해제
  } else {
    selectedSeat.value = seat.id; // 좌석 선택
  }
}

// 예약 버튼 클릭 이벤트
async function bookSeats() {
  if (!selectedSeat.value) {
    alert("좌석을 선택해주세요!");
    return;
  }

  try {
    await axios.post(`/concerts/${concertId}/seats/${selectedSeat.value}`, {
      price: seatPrice, // 바디에 가격 정보 포함
    });

    alert("예약이 성공적으로 완료되었습니다!");
    selectedSeat.value = null; // 선택 초기화
    fetchSeats(); // 최신 좌석 상태를 가져옵니다.
  } catch (error) {
    alert("예약에 실패했습니다. 다시 시도해주세요.");
  }
}

// 초기 데이터 로드
onMounted(() => {
  fetchSeats();
});
</script>


<style scoped>
/* 동일한 스타일 유지 */
.seat-selection {
  text-align: center;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr); /* 한 행에 10개 좌석 */
  gap: 10px;
  justify-content: center;
}

.selection-summary {
  margin-top: 40px;
}

.reserve-button {
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #007BFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.reserve-button:hover {
  background-color: #0056b3;
}

.reserve-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
