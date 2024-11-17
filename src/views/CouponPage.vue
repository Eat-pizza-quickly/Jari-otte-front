<template>
  <div class="coupon-page">
    <h2>Create Coupon</h2>
    <form @submit.prevent="createCoupon">
      <!-- Coupon Name -->
      <div class="form-group">
        <label for="couponName">Coupon Name</label>
        <input type="text" id="couponName" v-model="coupon.couponName" required />
      </div>

      <!-- Coupon Code -->
      <div class="form-group">
        <label for="couponCode">Coupon Code</label>
        <input type="text" id="couponCode" v-model="coupon.couponCode" required />
      </div>

      <!-- Coupon Type -->
      <div class="form-group">
        <label for="couponType">Coupon Type</label>
        <select id="couponType" v-model="coupon.couponType" required>
          <option value="ALL">All Users</option>
          <option value="LIMIT">Limited Users</option>
        </select>
      </div>

      <!-- Discount Type -->
      <div class="form-group">
        <label for="discountType">Discount Type</label>
        <select id="discountType" v-model="coupon.discountType" required>
          <option value="PERCENTAGE">Percentage</option>
          <option value="AMOUNT">Fixed Amount</option>
        </select>
      </div>

      <!-- Discount Percentage -->
      <div class="form-group" v-if="coupon.discountType === 'PERCENTAGE'">
        <label for="discount">Discount Percentage (%)</label>
        <input type="number" id="discount" v-model="coupon.discount" min="1" max="100" required />
      </div>

      <!-- Discount Amount -->
      <div class="form-group" v-else-if="coupon.discountType === 'AMOUNT'">
        <label for="price">Discount Amount</label>
        <input type="number" id="price" v-model="coupon.price" min="1" required />
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label for="quantity">Quantity</label>
        <input type="number" id="quantity" v-model="coupon.quantity" min="1" required />
      </div>

      <!-- Expiry Date -->
      <div class="form-group">
        <label for="expiryDate">Expiry Date</label>
        <input type="date" id="expiryDate" v-model="coupon.expiryDate" required />
      </div>

      <!-- Submit Button -->
      <button type="submit">Create Coupon</button>
    </form>
  </div>
</template>

<script>
// axios를 import합니다.
import axios from '@/plugins/axios';

export default {
  name: 'CouponPage',
  data() {
    return {
      coupon: {
        couponCode: '',
        couponName: '',
        couponType: 'ALL',
        discountType: 'PERCENTAGE',
        discount: 0,
        price: 0,
        quantity: 1,
        expiryDate: '',
      },
    };
  },
  methods: {
    createCoupon() {
      // 유효성 검사
      if (this.coupon.discountType === 'PERCENTAGE') {
        if (this.coupon.discount <= 0 || this.coupon.discount > 100) {
          alert('Discount percentage must be between 1 and 100.');
          return;
        }
      } else if (this.coupon.discountType === 'AMOUNT') {
        if (this.coupon.price <= 0) {
          alert('Discount amount must be greater than 0.');
          return;
        }
      }

      if (this.coupon.quantity <= 0) {
        alert('Quantity must be greater than 0.');
        return;
      }

      if (!this.coupon.expiryDate) {
        alert('Please select an expiry date.');
        return;
      }

      // 서버로 보낼 데이터 생성
      const payload = { ...this.coupon };

      // 서버에 쿠폰 생성 요청 보내기
      axios
        .post('/coupons', payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminAuthToken')}`,
          },
        })
        .then((response) => {
          // 쿠폰 생성 성공 시 AdminPage로 이동
          this.$router.push({ name: 'adminPage' });
        })
        .catch((error) => {
          console.error(error);
          alert('Failed to create coupon.');
        });
    },
    resetForm() {
      // 폼 초기화
      this.coupon = {
        couponCode: '',
        couponName: '',
        couponType: 'ALL',
        discountType: 'PERCENTAGE',
        discount: 0,
        price: 0,
        quantity: 1,
        expiryDate: '',
      };
    },
  },
};
</script>

<style scoped>
.coupon-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input[type="text"],
input[type="number"],
input[type="date"],
select {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

button[type="submit"] {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}
</style>
