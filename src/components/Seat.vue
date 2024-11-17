// Seat.vue
<template>
  <div
    :class="['seat', isReserved ? 'reserved' : (isSelected ? 'selected' : 'available')]"
    @click="handleClick"
  >
    <span>{{ seatNumber }}</span>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  seatNumber: Number,
  isReserved: Boolean,
  isSelected: Boolean,
});

const emit = defineEmits(['select']);

// 클릭 이벤트 처리
function handleClick() {
  if (!props.isReserved) {
    emit('select');
  }
}
</script>

<style scoped>
.seat {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
  font-size: 14px;
}

.seat.available {
  background-color: #f5f5f5;
}

.seat.reserved {
  background-color: #d1d1d1;
  cursor: not-allowed;
}

.seat.selected {
  background-color: #007BFF;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* 선택된 좌석에 시각적 강조 추가 */
  transform: scale(1.1); /* 선택된 좌석을 살짝 키워서 강조 */
}
</style>
