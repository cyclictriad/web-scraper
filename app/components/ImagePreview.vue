<template>
    <div class="relative group w-full">
      <template v-if="url">
        <!-- Loading State -->
        <div 
          v-if="isLoading" 
          class="w-full aspect-video rounded-lg border-2 border-dashed border-green-300 
                 flex items-center justify-center bg-gray-800/50 
                 transition-all duration-300"
        >
          <div class="text-center text-green-300 space-y-2">
            <div 
              class="w-12 h-12 mx-auto rounded-full bg-green-300/20 
                     flex items-center justify-center animate-pulse"
            >
              <div 
                class="w-8 h-8 bg-green-400 rounded-full 
                       animate-spin"
              ></div>
            </div>
            <p class="text-sm font-medium">Loading image...</p>
          </div>
        </div>
  
        <!-- Error State -->
        <div 
          v-else-if="imageError" 
          class="w-full aspect-video rounded-lg border-2 border-dashed border-red-400 
                 flex items-center justify-center bg-gray-800/50 
                 transition-all duration-300"
        >
          <div class="text-center text-red-400 space-y-2">
            <div 
              class="w-12 h-12 mx-auto rounded-full bg-red-400/20 
                     flex items-center justify-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-8 w-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <p class="text-sm font-medium">Invalid image URL</p>
          </div>
        </div>
  
        <!-- Image Loaded State -->
        <div 
          v-else-if="fetchedImage" 
          class="relative w-full aspect-video rounded-lg overflow-hidden 
                 bg-gray-800/50 border border-green-300 
                 transition-all duration-300 
                 group"
        >
          <img
            :src="fetchedImage"
            alt="Preview"
            @error="handleImageError"
            @load="handleImageLoad"
            class="w-full h-full object-contain 
                   transition-transform duration-300 
                   group-hover:scale-105"
          />
          
          <!-- Hover Overlay -->
          <div 
            class="absolute inset-0 bg-black/0 group-hover:bg-black/10 
                   flex items-center justify-center 
                   transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <span 
              class="text-xs text-white/50 
                     bg-gray-800/50 px-2 py-1 rounded-full"
            >
              Preview
            </span>
          </div>
        </div>
      </template>
  
      <!-- Empty State -->
      <div 
        v-else 
        class="w-full aspect-video rounded-lg border-2 border-dashed border-green-300 
               flex items-center justify-center bg-gray-800/50 
               transition-all duration-300"
      >
        <div class="text-center text-green-300 space-y-2">
          <div 
            class="w-12 h-12 mx-auto rounded-full bg-green-300/20 
                   flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-8 w-8" 
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
          <p class="text-sm font-medium">Enter URL to preview image</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  
  const props = defineProps({
    url: {
      type: String,
      required: true,
    },
  });
  
  const isLoading = ref(false);
  const imageError = ref(false);
  const fetchedImage = ref('');
  
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
  
  const handleImageError = () => {
    imageError.value = true;
    isLoading.value = false;
  };
  
  const handleImageLoad = () => {
    imageError.value = false;
    isLoading.value = false;
  };
  
  const fetchImage = async () => {
    try {
      if (imageRegex.test(props.url)) {
        isLoading.value = true;
        imageError.value = false;
  
        const response = await $fetch('/api/file', {
          method: 'POST',
          body: { filePath: props.url },
        });
  
        fetchedImage.value = URL.createObjectURL(new Blob([response]));
      } else {
        fetchedImage.value = '';
        imageError.value = true;
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      imageError.value = true;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Watch for URL changes
  watch(() => props.url, async (newUrl) => {
    if (newUrl) {
      await fetchImage();
    } else {
      fetchedImage.value = '';
    }
  });
  
  // Initial fetch if URL exists
  onMounted(() => {
    if (props.url) {
      fetchImage();
    }
  });
  
  // Cleanup blob URL on component unmount
  onBeforeUnmount(() => {
    if (fetchedImage.value) {
      URL.revokeObjectURL(fetchedImage.value);
    }
  });
  </script>