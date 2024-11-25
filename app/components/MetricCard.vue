<template>
    <div class="bg-gray-800 p-4 rounded-lg shadow transition-all duration-300 hover:shadow-lg hover:scale-105">
      <h3 class="text-lg font-semibold text-green-300 mb-2">{{ title }}</h3>
      <p class="text-2xl font-bold text-white">{{ value }}</p>
    </div>
</template>

<script setup>
const props = defineProps(['title', 'value'])
</script>
