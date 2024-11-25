<!-- ImageCard.vue -->
<template>
  <div
    class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700 hover:border-green-600 transition-all duration-300 grid grid-cols-1 md:grid-cols-2 gap-6 transform hover:scale-[1.01] items-center relative group"
  >
    <!-- Left Column: Input and Details -->
    <div class="flex flex-col justify-center space-y-4">
      <!-- Enhanced Header -->
      <div class="flex items-center space-x-3">
        <div
          class="bg-green-500/20 p-2 rounded-full transition-all duration-300 group-hover:bg-green-500/40 group-hover:rotate-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2
          class="text-lg font-semibold text-green-300 tracking-wide transition-colors duration-300 group-hover:text-green-200"
        >
          {{ label }}
        </h2>
      </div>

      <!-- Enhanced Input with Loading State -->
      <div class="relative">
        <!-- Add @paste="onPaste" to the input element -->
        <input
          type="text"
          :value="modelValue"
          @input="onInput"
          @paste="onPaste"
          :placeholder="placeholder"
          class="w-full px-4 py-3 pl-10 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        />
        <div
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300"
          :class="{ 'text-green-400': modelValue?.length > 0 }"
        >
          <svg
            v-if="!loading"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <!-- Clear button -->
        <button
          v-if="modelValue?.length > 0"
          @click="clearInput"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Enhanced Status Message -->
      <div
        class="text-sm transition-all duration-300 pl-2 flex items-center space-x-2"
        :class="{
          'text-green-400': isValidUrl,
          'text-red-400': !isValidUrl && modelValue?.length > 0,
          'opacity-0': !modelValue?.length,
        }"
      >
        <span class="text-xs">{{ statusMessage }}</span>
      </div>
    </div>

    <!-- Right Column: Preview -->
    <div class="flex items-center justify-center w-full">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isValidUrl"
          class="w-full max-w-[250px] aspect-square rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] relative group/preview"
        >
          <ImagePreview
            :url="modelValue"
            @error="handleImageError"
            @load="handleImageLoad"
            class="w-full h-full object-cover object-center"
          />
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <button
              @click="clearInput"
              class="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
            >
              Remove Image
            </button>
          </div>
        </div>
        <div
          v-else
          class="w-full max-w-[250px] aspect-square flex items-center justify-center bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-600 transition-colors duration-300 group-hover:border-green-500/50"
        >
          <div class="text-center space-y-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="text-xs text-gray-500">Enter a valid image URL above</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ImagePreview from "./ImagePreview.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "Image URL Input",
  },
  placeholder: {
    type: String,
    default: "Enter image URL",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const loading = ref(false);
const error = ref(null);

// URL Validation
const isValidUrl = computed(() => {
  try {
    return props.modelValue.length > 0 && new URL(props.modelValue);
  } catch {
    return false;
  }
});

// Status Message
const statusMessage = computed(() => {
  if (error.value) return error.value;
  if (!props.modelValue) return "";
  return isValidUrl.value
    ? "Valid image URL ✓"
    : "Please enter a valid image URL";
});

// Input handlers
const onInput = (event) => {
  const newValue = event.target.value;
  console.log('There was an input', newValue)
  console.log('previously', props.modelValue)
  emit("update:modelValue", newValue);
  console.log('now', props.modelValue)

  if (isValidUrl.value) {
    console.log("Updated from input", newValue);
    emit("change", newValue);
  }
};


// Function to handle paste event
const onPaste = (event) => {
  event.preventDefault();
  const pastedText = (event.clipboardData || window.clipboardData).getData('text');
  if (!pastedText) return;
  
  console.log('There was a paste', pastedText);
  
  // Check if the pasted text is a valid URL first
  const isPastedTextValidUrl = (() => {
    try {
      return pastedText.length > 0 && new URL(pastedText);
    } catch {
      return false;
    }
  })();
  
  // Set the input value directly
  event.target.value = pastedText;
  console.log('previously', props.modelValue);

  // Emit the update for modelValue
  emit('update:modelValue', pastedText);
  console.log('now', props.modelValue);

  // Emit the change event if the pasted content is a valid URL
  if (isPastedTextValidUrl) {
    console.log('Updated from paste', pastedText);
    emit('change', pastedText);
  }
}


const clearInput = () => {
  emit("update:modelValue", "");
  emit("change", "");
  error.value = null;
};

const handleImageError = () => {
  error.value = "Unable to load image from URL";
};

const handleImageLoad = () => {
  error.value = null;
};
</script>