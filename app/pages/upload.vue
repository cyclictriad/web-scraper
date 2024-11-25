<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Main Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- Upload Card -->
        <div
          class="group hover:border-green-500/50 transition-all duration-500 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div class="p-6">
            <button
              @click="showForm = true"
              :disabled="isUploading"
              class="w-full h-64 rounded-lg relative overflow-hidden group-hover:shadow-lg group-hover:shadow-green-500/20 transition-all duration-500"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent"
              />
              <div
                class="absolute inset-0 flex flex-col items-center justify-center space-y-4"
              >
                <ProgressRing
                  v-if="isUploading"
                  :metrics="uploadMetrics"
                  class="w-16 h-16 text-green-500"
                />
                <img
                  v-else
                  src="/icons/cloud.gif"
                  class="w-16 h-16 text-green-500 group-hover:scale-110 transition-transform duration-500"
                />
                <span
                  v-if="!isUploading"
                  class="text-green-500 text-xl font-semibold"
                  >Upload Now</span
                >
              </div>
            </button>
          </div>
        </div>

        <!-- Settings Card -->
        <div
          class="group hover:border-blue-500/50 transition-all duration-500 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div class="p-6">
            <button
              @click="goToSettings"
              class="w-full h-64 rounded-lg relative overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent"
              />
              <div
                class="absolute inset-0 flex flex-col items-center justify-center space-y-4"
              >
                <div class="relative">
                  <!-- First Gear -->
                  <img
                    src="/icons/Gear.svg"
                    alt="Gear 1"
                    class="size-6 gear gear1 absolute"
                  />
                  <!-- Second Gear -->
                  <img
                    src="/icons/Gear.svg"
                    alt="Gear 2"
                    class="size-6 gear gear2 absolute ml-4"
                  />
                </div>
                <span class="text-blue-500 text-xl font-semibold mt-16"
                  >Settings</span
                >
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Logs Section -->
      <div
        v-if="uploadLogs.length"
        class="relative h-48 bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden mb-5"
      >
        <div class="absolute inset-0 pointer-events-none">
          <div
            class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10"
          ></div>
          <div
            class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10"
          ></div>
        </div>

        <div class="h-full flex items-center">
          <div
            ref="logsContainer"
            class="flex gap-4 px-32 transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(${-currentLogIndex * 320}px)` }"
          >
            <div
              v-for="(log, index) in uploadLogs"
              :key="index"
              class="flex-shrink-0 w-[300px] p-4 rounded-lg transition-all duration-300 relative"
              :class="[
                currentLogIndex === index
                  ? 'scale-100 opacity-100 bg-gray-700/80'
                  : 'scale-95 opacity-50 bg-gray-700/30',
                index < currentLogIndex ? '-translate-x-4' : '',
                index > currentLogIndex ? 'translate-x-4' : '',
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    log.status === 'COMPLETE'
                      ? 'bg-green-400'
                      : 'bg-blue-400 animate-pulse'
                  "
                ></div>
                <span
                  class="text-lg font-medium"
                  :class="
                    currentLogIndex === index
                      ? 'text-green-400'
                      : 'text-gray-400'
                  "
                >
                  {{ log.event }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-300">{{ log.status }}</p>
              <span class="absolute bottom-2 right-4 text-xs text-gray-500">
                {{ formatTime(log.timestamp) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <button
          v-if="currentLogIndex > 0"
          @click="previousLog"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all z-20"
        >
          ←
        </button>
        <button
          v-if="currentLogIndex < uploadLogs.length - 1"
          @click="nextLog"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all z-20"
        >
          →
        </button>
      </div>

      <!-- Progress Section -->
      <div
        v-if="isUploading"
        class="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg"
      >
        <div class="p-6">
          <h3 class="text-green-500 text-xl font-semibold mb-4">
            Upload Progress
          </h3>
          <div class="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div
              class="bg-green-500 h-4 rounded-full transition-all duration-300"
              :style="{
                width: `${(uploadMetrics.current / uploadMetrics.max) * 100}%`,
              }"
            />
          </div>
          <div class="text-green-500 text-sm">
            {{ uploadMetrics.event }}: {{ uploadMetrics.status }}
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
        @click.self="showForm = false"
      >
        <div
          id="form-container"
          class="bg-gray-800/90 rounded-xl shadow-2xl relative animate-bounce-in max-h-[90vh] overflow-y-auto w-full sm:w-[90%] md:w-[600px] border border-gray-700/50"
        >
          <!-- Close button -->
          <button
            @click="showForm = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors"
          >
            ×
          </button>

          <!-- Form Content -->
          <div class="p-8">
            <!-- Form Title -->
            <h2 class="text-green-400 text-2xl font-semibold mb-8 text-center">
              Upload Details
            </h2>

            <!-- Form Inputs -->
            <form @submit.prevent="uploadDocs" class="space-y-6">
              <CourseSelection v-model:selection="form" :limited="true" />

              <div class="form-group">
                <label class="block text-green-400 text-sm font-medium mb-2">
                  Number of Quizzes
                </label>
                <input
                  type="number"
                  v-model="form.batch"
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-green-400/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                />
              </div>

              <div class="form-group">
                <label class="block text-green-400 text-sm font-medium mb-2">
                  AI Model
                </label>
                <CustomSelect
                  :options="activeModels.map(model => model.id)"
                  v-model="form.ai_model"
                  placeholder="Select AI Model"
                  class="w-full bg-gray-700/50 border border-gray-600 focus:border-green-400/50 rounded-lg text-white"
                />
              </div>

              <div class="form-group">
                <label class="block text-green-400 text-sm font-medium mb-2">
                  Number of Keywords (Max 8)
                </label>
                <input
                  type="number"
                  v-model="form.keywords"
                  max="8"
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-green-400/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                />
              </div>

              <div class="form-group">
                <label class="block text-green-400 text-sm font-medium mb-2">
                  Minimum Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  v-model="form.min_price"
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-green-400/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                />
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  class="w-full py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-green-400/20"
                >
                  Start Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const query = computed(() => new Set(Object.keys(useRoute().query)));
const router = useRouter();

const isUploading = ref(false);
const uploadMetrics = ref({
  current: 0,
  max: 0,
  event: "",
  status: "",
});

const showForm = ref(false);
const uploadLogs = ref([]);
const activeModels= ref([])
activeModels.value = await $fetch('/api/chat-completion')
const form = ref({
  courses: [],
  subjects: [],
  batch: 0,
  ai_model: "",
  keywords: 0,
  min_price: 0,
});

const goToSettings = () => {
  router.push("/setup");
};

function uploadDocs() {
  showForm.value = false;
  isUploading.value = true;
  let ws = null;

  const connectWebSocket = () => {
    ws = new WebSocket(`ws://localhost:3000/api/upload-ws`);

    ws.onopen = () => {
      console.log("WebSocket connection opened.");
      ws.send(
        JSON.stringify({ userId: useCookie("_id").value, ...form.value })
      );
      uploadMetrics.value.max = form.value.quizzes;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          isUploading.value = false;
          console.error("Server error:", data.error);
        } else if (data.message === "Connected Successfully") {
          console.log("Successfully authenticated");
        } else if (data.event) {
          uploadMetrics.value.status = data.status;
          uploadMetrics.value.event = data.event;
          if (data.event === "UPLOAD" && data.status === "COMPLETE") {
            uploadMetrics.value.current++;
          }
          uploadLogs.value = [...uploadLogs.value, data];
        } else if (data.type === "close") {
          ws.close();
        }
      } catch (error) {
        isUploading.value = false;
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  connectWebSocket();
}

const prefillPreferences = async function () {
  const { data: preferences } = await useFetch("/api/preferences");
  form.value.courses = preferences.value.courses;
  form.value.subjects = preferences.value.subjects;
  form.value.keywords = preferences.value.upload.meta.keywords;
  form.value.ai_model = preferences.value.upload.meta.ai_model;
  form.value.min_price = preferences.value.upload.meta.min_price;
  form.value.batch = preferences.value.upload.meta.batch;
};

prefillPreferences();

const currentLogIndex = ref(0);
const logsContainer = ref(null);

// Auto-scroll to newest log
watch(
  () => uploadLogs.value.length,
  (newLength) => {
    if (newLength > 0) {
      currentLogIndex.value = newLength - 1;
    }
  }
);

const previousLog = () => {
  if (currentLogIndex.value > 0) {
    currentLogIndex.value--;
  }
};

const nextLog = () => {
  if (currentLogIndex.value < uploadLogs.value.length - 1) {
    currentLogIndex.value++;
  }
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Auto-advance logs every 3 seconds if not manually navigating
let autoScrollInterval;

const startAutoScroll = () => {
  autoScrollInterval = setInterval(() => {
    if (currentLogIndex.value < uploadLogs.value.length - 1) {
      currentLogIndex.value++;
    }
  }, 3000);
};

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
};

// Start auto-scroll when logs are updated
watch(
  () => uploadLogs.value,
  () => {
    stopAutoScroll();
    startAutoScroll();
  },
  { deep: true }
);

// Clean up interval on component unmount
onUnmounted(() => {
  stopAutoScroll();
});
</script>

<style scoped>
.gear1 {
  width: 32px;
  height: 32px;
  animation: spin 2s linear infinite;
}

.gear2 {
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite reverse;
  animation-delay: 0.5s;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Modal animation */

#form-container {
  scrollbar-width: thin;
  scrollbar-color: #4ade80 transparent;
}

#form-container::-webkit-scrollbar {
  width: 6px;
}

#form-container::-webkit-scrollbar-track {
  background: transparent;
  margin: 2px;
}

#form-container::-webkit-scrollbar-thumb {
  background: #4ade80;
  border-radius: 3px;
}

#form-container::-webkit-scrollbar-thumb:hover {
  background: #22c55e;
}

.form-group {
  @apply relative;
}

.form-group input:focus,
.form-group select:focus {
  @apply outline-none shadow-lg shadow-green-400/10;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.3s ease-out forwards;
}

/* Add to existing styles */
.log-enter-active,
.log-leave-active {
  transition: all 0.3s ease;
}

.log-enter-from,
.log-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>