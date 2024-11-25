<template>
  <div
    class="relative h-[fit-content] border border-gray-700 rounded-lg bg-gray-900 m-4 shadow w-full"
  >
    <div class="flex justify-between items-center p-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-gray-100">Log Output</h2>
      <div class="flex space-x-2">
        <button
          @click="copyLogs"
          class="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
          :title="copied ? 'Copied!' : 'Copy logs'"
        >
          <img
            :src="copied ? '/icons/Copied.svg' : '/icons/Copy.svg'"
            alt="Copy"
            class="w-5 h-5"
          />
        </button>
        <button
          @click="downloadLogs"
          class="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
          title="Download logs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>
    </div>
    <div
      ref="logContainer"
      class="overflow-y-auto p-4"
      style="max-height: 20rem"
    >
      <div class="font-mono text-sm">
        <p v-for="(log, index) in formattedLogs" :key="index" class="mb-1">
          <span :class="getTypeClass(log.status)">[{{ log.status }}]</span>
          <span class="text-yellow-300">[{{ log.duration }} ms]</span>
          <span class="text-gray-300">- {{ log.event }}</span>
          <span class="text-gray-300 underline">- {{ log.name }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
});

const logContainer = ref(null);
const copied = ref(false);

// Format logs for display
const formattedLogs = computed(() => {
  return props.logs.map((log, i, self) => ({
    status: log.status,
    duration: i > 0 ? log.date - self[i - 1].date : 0,
    event: log.event,
    name: log.name,
  }));
});

// Determine CSS class based on log type
const getTypeClass = (status) => {
  switch (status) {
    case "START":
      return "text-blue-400";
    case "COMPLETE":
      return "text-green-400";
    case "ERROR":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

// Scroll to bottom when logs update
watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  }
);

// Copy logs to clipboard
const copyLogs = async () => {
  const logText = formattedLogs.value
    .map((log) => `[${log.type}] [${log.duration} ms] - ${log.text}`)
    .join("\n");

  try {
    await navigator.clipboard.writeText(logText);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy logs:", err);
  }
};

// Download logs as a text file
const downloadLogs = () => {
  const logText = formattedLogs.value
    .map((log) => `[${log.type}] [${log.duration} ms] - ${log.text}`)
    .join("\n");

  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "logs.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #2d3748;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>