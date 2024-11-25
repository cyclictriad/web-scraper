<template>
  <div class="p-4 bg-gray-800 rounded-md">
    <label class="block text-green-300 text-sm font-medium mb-2">Choose Color:</label>
    <Color v-model="color"  />

    <!-- Hex Input -->
    <div class="mt-4">
      <label class="block text-green-300 text-sm mb-1">Hex:</label>
      <input
        v-model="hex"
        @input="updateFromHex"
        type="text"
        placeholder="#00FFFF"
        class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
      />
    </div>

    <!-- RGB Input -->
    <div class="mt-4 grid grid-cols-3 gap-4">
      <div>
        <label class="block text-green-300 text-sm mb-1">R:</label>
        <input
          v-model.number="rgb.r"
          @input="updateFromRgb"
          type="number"
          max="255"
          placeholder="255"
          class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
      <div>
        <label class="block text-green-300 text-sm mb-1">G:</label>
        <input
          v-model.number="rgb.g"
          @input="updateFromRgb"
          type="number"
          max="255"
          placeholder="255"
          class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
      <div>
        <label class="block text-green-300 text-sm mb-1">B:</label>
        <input
          v-model.number="rgb.b"
          @input="updateFromRgb"
          type="number"
          max="255"
          placeholder="255"
          class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
const props = defineProps({
  modelValue: {
    type: String,
    required:true
  },
});


// Function to convert RGB to hex
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// Function to convert RGB string to an object
const rgbStringToObject = (rgbString) => {
  const matches = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return matches ? { r: parseInt(matches[1]), g: parseInt(matches[2]), b: parseInt(matches[3]) } : null;
};


const emit = defineEmits(['update:modelValue']);

const color = ref(props.modelValue);


const hex = ref(rgbToHex(0, 255, 255)); // Default hex value for rgb(0, 255, 255)
const rgb = reactive({ r: 0, g: 255, b: 255 }); // Initialize with default RGB values

// Watch for changes in the modelValue prop to sync color and inputs
watch(() => props.modelValue, (newValue) => {
  color.value = newValue;
  const rgbObject = rgbStringToObject(newValue);
  if (rgbObject) {
    Object.assign(rgb, rgbObject);
    hex.value = rgbToHex(rgb.r, rgb.g, rgb.b); // Update hex value based on RGB
  }
});
// Watch for changes in the modelValue prop to sync color and inputs
watch(color, (newValue) => {
 updateColorFromColorPicker(newValue)
});


// Update the internal color and emit when the color picker changes
const updateColorFromColorPicker = (newColor) => {
  Object.assign(rgb, rgbStringToObject(newColor)); // Convert RGB string to RGB object
  hex.value = rgbToHex(rgb.r, rgb.g, rgb.b); // Update hex value based on RGB
  emit('update:modelValue', newColor); // Emit the new RGB value
};
 
// Update color when hex input changes
const updateFromHex = () => {
  if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
    // Convert hex to RGB
    const r = parseInt(hex.value.slice(1, 3), 16);
    const g = parseInt(hex.value.slice(3, 5), 16);
    const b = parseInt(hex.value.slice(5, 7), 16);
    rgb.r = r;
    rgb.g = g;
    rgb.b = b;

    color.value = `rgb(${r}, ${g}, ${b})`; // Update color as RGB string
    emit('update:modelValue', color.value); // Emit the new RGB value
  }
};

// Update color when RGB inputs change
const updateFromRgb = () => {
  // Ensure RGB values are clamped between 0 and 255
  rgb.r = Math.max(0, Math.min(255, rgb.r));
  rgb.g = Math.max(0, Math.min(255, rgb.g));
  rgb.b = Math.max(0, Math.min(255, rgb.b));

  color.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; // Update color as RGB string
  hex.value = rgbToHex(rgb.r, rgb.g, rgb.b); // Update hex value based on RGB
  emit('update:modelValue', color.value); // Emit the new RGB value
};
</script>

<style scoped>
/* Optional styling */
input[type="color"] {
  cursor: pointer;
}
</style>
