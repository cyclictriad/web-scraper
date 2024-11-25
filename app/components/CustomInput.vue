<template>
  <div class="flex justify-center items-center h-screen bg-gray-900"> <!-- Fullscreen container -->
    <div class="relative w-80"> <!-- Input container with fixed width -->
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="type"
        :placeholder="placeholder"
        class="w-full bg-transparent text-green-300 placeholder-gray-500 border-2 rounded-lg border-green-300 transition-all duration-300"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// Props for the component
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: 'Enter text...',
  },
})
</script>

<style scoped>
/* Additional styles can go here */
</style>
