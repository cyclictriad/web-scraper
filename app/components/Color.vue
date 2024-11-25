<template>
  <div class="color-picker">
    <div class="relative w-full h-40 border border-gray-600 rounded-md cursor-pointer" ref="pickerContainer">
      <canvas
        ref="canvasRef"
        class="absolute w-full h-full rounded-md"
        @mousedown="onMouseDown"
        @touchstart="onMouseDown"
      ></canvas>
      <div
        class="absolute w-5 h-5 border-2 border-white rounded-full shadow-md pointer-events-none"
        :style="`background-color: ${selectedColor}; left: ${bubbleX}px; top: ${bubbleY}px; transform: translate(-50%, -50%);`"
      ></div>
    </div>
    <div class="mt-2 flex items-center">
      <div class="w-8 h-8 rounded-md mr-2" :style="`background-color: ${selectedColor}`"></div>
      <div class="rounded px-2 py-1 w-1/4 h-8" :style="`background-color: ${selectedColor}`"></div>
      <!-- <input v-model="selectedColor"  @input="updateFromInput" class="border border-gray-300 rounded px-2 py-1"/> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const selectedColor = ref(props.modelValue);
const canvasX = ref(0);
const canvasY = ref(0);
const canvasRef = ref(null);
const pickerContainer = ref(null);

const bubbleX = computed(() => (canvasX.value / 100) * pickerContainer.value?.offsetWidth || 0);
const bubbleY = computed(() => (canvasY.value / 100) * pickerContainer.value?.offsetHeight || 0);

// Create a gradient color canvas
const createGradient = (canvas) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;

  // Create horizontal rainbow gradient
  const rainbowGradient = ctx.createLinearGradient(0, 0, width, 0);
  rainbowGradient.addColorStop(0, 'rgb(255, 0, 0)');
  rainbowGradient.addColorStop(1/6, 'rgb(255, 255, 0)');
  rainbowGradient.addColorStop(2/6, 'rgb(0, 255, 0)');
  rainbowGradient.addColorStop(3/6, 'rgb(0, 255, 255)');
  rainbowGradient.addColorStop(4/6, 'rgb(0, 0, 255)');
  rainbowGradient.addColorStop(5/6, 'rgb(255, 0, 255)');
  rainbowGradient.addColorStop(1, 'rgb(255, 0, 0)');
  ctx.fillStyle = rainbowGradient;
  ctx.fillRect(0, 0, width, height);

  // Apply vertical black to transparent gradient
  const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
  blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, width, height);

  // Apply vertical white to transparent gradient
  const whiteGradient = ctx.createLinearGradient(0, 0, 0, height);
  whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  whiteGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, width, height);
};

// Handle mouse/touch movement within the color picker
const handleMove = (event) => {
  if (!canvasRef.value || !pickerContainer.value) return;

  const canvas = canvasRef.value;
  const rect = pickerContainer.value.getBoundingClientRect();

  const clientX = event.clientX || (event.touches && event.touches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0].clientY);

  const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

  canvasX.value = (x / rect.width) * 100;
  canvasY.value = (y / rect.height) * 100;

  const canvasXPx = Math.round((canvasX.value / 100) * canvas.width);
  const canvasYPx = Math.round((canvasY.value / 100) * canvas.height);

  try {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(canvasXPx, canvasYPx, 1, 1).data;
    selectedColor.value = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    emit('update:modelValue', selectedColor.value);
  } catch (error) {
    console.error('Error getting image data:', error);
  }
};

// Mouse and touch event handlers
const onMouseDown = (event) => {
  event.preventDefault();
  handleMove(event);

  const moveHandler = (e) => {
    e.preventDefault();
    handleMove(e);
  };

  const upHandler = () => {
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('touchmove', moveHandler);
    window.removeEventListener('mouseup', upHandler);
    window.removeEventListener('touchend', upHandler);
  };

  window.addEventListener('mousemove', moveHandler);
  window.addEventListener('touchmove', moveHandler);
  window.addEventListener('mouseup', upHandler);
  window.addEventListener('touchend', upHandler);
};

// Update color from input field
const updateFromInput = () => {
  emit('update:modelValue', selectedColor.value);
  nextTick(() => {
    if (canvasRef.value && pickerContainer.value) {
      const canvas = canvasRef.value;
      const ctx = canvas.getContext('2d');
      let found = false;

      // Parse the RGB values from selectedColor
      const match = selectedColor.value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return;

      const targetR = parseInt(match[1]);
      const targetG = parseInt(match[2]);
      const targetB = parseInt(match[3]);

      // Sample points at regular intervals for better performance
      const sampleStep = 2; // Adjust this value for performance vs accuracy
      
      for (let i = 0; i < canvas.width && !found; i += sampleStep) {
        for (let j = 0; j < canvas.height && !found; j += sampleStep) {
          const imageData = ctx.getImageData(i, j, 1, 1).data;
          
          // Allow for some color tolerance due to sampling and rounding
          const colorMatch = Math.abs(imageData[0] - targetR) < 5 && 
                           Math.abs(imageData[1] - targetG) < 5 && 
                           Math.abs(imageData[2] - targetB) < 5;

          if (colorMatch) {
            canvasX.value = (i / canvas.width) * 100;
            canvasY.value = (j / canvas.height) * 100;
            found = true;
          }
        }
      }

      // If no exact match found, default to a reasonable position
      if (!found) {
        // Default to center position
        canvasX.value = 50;
        canvasY.value = 50;
      }
    }
  });
};

// Create the gradient when the component is mounted
onMounted(async () => {
  if (canvasRef.value) {
    // Ensure the canvas is properly sized before creating gradient
    const container = pickerContainer.value;
    if (container) {
      canvasRef.value.width = container.offsetWidth;
      canvasRef.value.height = container.offsetHeight;
    }
    
    createGradient(canvasRef.value);
    
    // Wait for next tick to ensure gradient is painted
    await nextTick();
    
    // Set initial position based on the provided color
    updateFromInput();
  }
});
// Watch for prop changes to sync with selectedColor
watch(() => props.modelValue, (newColor) => {
  console.log('New color', newColor)
  selectedColor.value = newColor;
  updateFromInput();
});
 

</script>

<style scoped>
.color-picker {
  /* Add any additional styles for the root container */
}
</style>