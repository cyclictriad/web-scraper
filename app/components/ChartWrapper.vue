<template>
  <div class="bg-gray-800 rounded-lg p-4">
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
    <div class="chart-wrapper">
      <slot></slot>
    </div>
  </div>
</template>
  
  <script setup>
defineProps(["title"]);
</script>
  
<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* Adjust this value to change the aspect ratio */
}
</style>