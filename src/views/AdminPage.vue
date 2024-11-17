<template>
  <div class="admin-page">
    <h2>Admin Page</h2>
    <div class="admin-buttons">
      <button @click="$router.push({ name: 'concertCreate' })" class="admin-button">Create Concert</button>
      <button @click="$router.push({ name: 'venueCreate' })" class="admin-button">Create Venue</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPage'
};
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  text-align: center;
}

.admin-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-button {
  width: 200px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.admin-button:hover {
  background-color: #0056b3;
}
</style>
