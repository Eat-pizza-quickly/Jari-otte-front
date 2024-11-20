<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/plugins/axios';

// Props에서 concertId를 받아옴
const props = defineProps({ concertId: Number });
const router = useRouter();

// 수정 폼 데이터 초기화
const editForm = ref({
  title: '',
  description: '',
  thumbnailUrl: '',
});

// 원본 데이터를 저장할 객체
const originalForm = ref({
  title: '',
  description: '',
  thumbnailUrl: '',
});

// 업로드 상태 및 이미지 파일 관리
const isUploading = ref(false);
const uploadedImageUrl = ref(null);

// 기존 공연 데이터를 가져와 수정 폼과 원본 데이터에 채움
const fetchConcertDetail = () => {
  axios
    .get(`/concerts/${props.concertId}`)
    .then((response) => {
      const concert = response.data.data;
      originalForm.value.title = concert.title || '';
      originalForm.value.description = concert.description || '';
      originalForm.value.thumbnailUrl = concert.thumbnailUrl || '';

      // 초기값 복사
      editForm.value.title = originalForm.value.title;
      editForm.value.description = originalForm.value.description;
      editForm.value.thumbnailUrl = originalForm.value.thumbnailUrl;
    })
    .catch((error) => {
      console.error('Failed to fetch concert detail:', error);
    });
};

// 수정 사항 제출 함수
const updateConcert = () => {
  if (!editForm.value.title.trim() || !editForm.value.description.trim()) {
    alert('제목과 설명을 입력하세요.');
    return;
  }

  axios
    .put(`/concerts/${props.concertId}`, {
      title: editForm.value.title,
      description: editForm.value.description,
      thumbnailUrl: uploadedImageUrl.value || editForm.value.thumbnailUrl,
    })
    .then(() => {
      alert('공연 정보가 성공적으로 수정되었습니다.');
      router.push(`/concerts/${props.concertId}`); // 수정 완료 후 상세 페이지로 이동
    })
    .catch((error) => {
      console.error('Failed to update concert:', error);
      alert('공연 정보를 수정하지 못했습니다.');
    });
};

// 이미지 업로드 함수
const uploadImage = (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert('이미지를 선택해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  isUploading.value = true;

  axios
    .post('/concerts/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => {
      uploadedImageUrl.value = response.data.imageUrl;
      alert('이미지가 성공적으로 업로드되었습니다.');
    })
    .catch((error) => {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
    })
    .finally(() => {
      isUploading.value = false;
    });
};

// 컴포넌트가 마운트될 때 기존 공연 정보를 불러옴
fetchConcertDetail();
</script>

<template>
  <div class="edit-container">
    <h1>공연 수정</h1>
    <form @submit.prevent="updateConcert" class="edit-form">
      <div class="form-group">
        <label for="title">공연 제목</label>
        <input
          id="title"
          v-model="editForm.title"
          type="text"
          placeholder="공연 제목을 입력하세요"
          required
        />
        <p class="original-value">원본: {{ originalForm.title }}</p>
      </div>
      <div class="form-group">
        <label for="description">공연 설명</label>
        <textarea
          id="description"
          v-model="editForm.description"
          placeholder="공연 설명을 입력하세요"
          required
        ></textarea>
        <p class="original-value">원본: {{ originalForm.description }}</p>
      </div>
      <div class="form-group">
        <label for="thumbnailUrl">현재 썸네일</label>
        <!-- 기존 썸네일 이미지 표시 -->
        <div class="thumbnail-container">
          <img
            :src="uploadedImageUrl || originalForm.thumbnailUrl"
            alt="Current Thumbnail"
            class="thumbnail-preview"
          />
        </div>
        <input
          id="thumbnailUrl"
          type="file"
          accept="image/*"
          @change="uploadImage"
        />
        <p class="original-value">원본 URL: {{ originalForm.thumbnailUrl }}</p>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">수정 완료</button>
        <button type="button" class="btn-cancel" @click="$router.back()">취소</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 16px;
  margin-bottom: 8px;
  color: #555;
}

input,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: none;
  height: 100px;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.thumbnail-preview {
  width: 400px; /* 공연 상세 페이지와 동일한 너비 */
  height: 500px; /* 공연 상세 페이지와 동일한 높이 */
  object-fit: cover; /* 이미지 비율 유지 */
  object-position: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.original-value {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  background-color: #d9a66c;
  color: white;
}

.btn-submit:hover {
  background-color: #b68855;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
}

.btn-cancel:hover {
  background-color: #aaa;
}
</style>

