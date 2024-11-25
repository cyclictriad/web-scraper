<template>
  <div class="relative w-full h-full flex justify-center items-center group">
    <!-- Main Progress Circle -->
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <!-- Background Glow Effect -->
      <div 
        class="absolute inset-0 bg-green-500/10 rounded-full blur-xl transform scale-110 transition-all duration-500 opacity-50 group-hover:opacity-70"
        :style="{ transform: `scale(${1 + progress.value/200})` }"
      ></div>
      
      <!-- Central Content -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center transform transition-transform duration-300 group-hover:scale-105">
        <span v-if="metrics.event" 
          class="text-base font-medium text-green-500 mb-1 opacity-90">
          {{ metrics.event }}
        </span>
        
        <div class="flex items-baseline space-x-1">
          <span class="text-4xl font-bold text-green-500">
            {{ metrics.current }}
          </span>
          <span class="text-xl text-green-600 opacity-75">/</span>
          <span class="text-xl text-green-600 opacity-75">
            {{ metrics.max }}
          </span>
        </div>
        
        <span class="text-sm text-green-400 mt-1 opacity-80">
          {{ metrics.status }}
        </span>
        
        <!-- Progress Percentage -->
        <span class="absolute -bottom-8 text-sm text-green-500/70 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {{ Math.round(progress.value) }}%
        </span>
      </div>

      <!-- SVG Progress Circle -->
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="transform transition-transform duration-300 group-hover:rotate-180"
      >
        <!-- Background Circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          class="stroke-green-100/20"
          :stroke-width="strokeWidth"
          fill="none"
        />
        
        <!-- Progress Circle -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          class="stroke-green-500 transition-all duration-700 ease-out"
          :stroke-width="strokeWidth"
          fill="none"
          stroke-linecap="round"
          :style="circleStyle"
        />
        
        <!-- Additional decorative circles -->
        <circle
          v-for="(_, index) in 8"
          :key="index"
          :cx="center + radius * Math.cos(index * Math.PI / 4)"
          :cy="center + radius * Math.sin(index * Math.PI / 4)"
          r="2"
          class="fill-green-500/50 transition-opacity duration-300"
          :class="progress.value > (index * 12.5) ? 'opacity-100' : 'opacity-0'"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
    default: () => ({
      event: '',
      current: 0,
      max: 100,
      status: ''
    })
  },
  size: {
    type: Number,
    default: 180
  }
});

const strokeWidth = 8;
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const progress = computed(() => ({
  value: (props.metrics.current / props.metrics.max || 0) * 100,
  offset: circumference.value - ((props.metrics.current / props.metrics.max || 0) * circumference.value)
}));

const circleStyle = computed(() => ({
  strokeDasharray: `${circumference.value} ${circumference.value}`,
  strokeDashoffset: progress.value.offset,
  transform: 'rotate(-90deg)',
  transformOrigin: 'center'
}));
</script>

<style scoped>
.group:hover circle {
  transition-duration: 700ms;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>