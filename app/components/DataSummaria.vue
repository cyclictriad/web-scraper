<template>
  <div class="bg-gray-900 p-6 rounded-lg shadow-xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-green-300">Metrics Dashboard</h2>
      <div v-if="liveMetricsState.loading" class="flex items-center space-x-2">
        <img src="/icons/Scan.gif" alt="Loading" class="w-6 h-6" />
        <span class="text-green-300">Updating quizzes</span>
      </div>
      <div v-else class="text-green-300">
        <div
          v-if="!showButton"
          class="inline-flex items-center gap-2 px-3 py-2 bg-green-950/10 rounded-md animate-pulse"
        >
          <svg
            class="w-4 h-4 text-green-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-green-300 font-medium">Data up to date</span>
        </div>

        <button
          v-else
          @click="updateCoursesandSubjects"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-slate-900 rounded-md transition-colors"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Run Update
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <MetricCard title="Selected Courses" :value="metrics.courses.length" />
      <MetricCard title="Total FlashCards" :value="metrics.flashcardSets.length" />
      <MetricCard title="Total Documents" :value="docs.length" />
      <MetricCard title="Total Uploaded" :value="uploadedDocs.length" />
      <MetricCard title="Selected Subjects" :value="metrics.subjects.length" />
      <MetricCard title="New FlashCards" :value="recentQuizzes.length" />
      <MetricCard title="New Documents" :value="recentDocs.length" />
      <MetricCard title="Newly Uploaded" :value="recentlyUploaded.length" />
    </div>
  </div>
</template>

<script setup>
import { liveMetricsState } from '~/store';

const metrics = ref({
  subjects: [],
  courses: [],
  flashcardSets: [],
});
const showButton = ref(false);

onMounted(() => {
  setTimeout(() => {
    showButton.value = true;
  }, 3000); // Shows button after 3 seconds
});


// Helper function to check if a quiz is recent (within the last 7 days)
const isRecent = (date) => {
  const createdAt = new Date(date);
  const aWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return createdAt.getTime() > aWeekAgo;
};

// Computed properties
const docs = computed(() =>
  metrics.value.flashcardSets.filter((set) =>
    set.statusHistory.some((history) => history.status === "PDF")
  )
);
const recentQuizzes = computed(() =>
  metrics.value.flashcardSets.filter((set) => isRecent(set.createdAt))
);
const recentDocs = computed(() =>
  docs.value.filter((doc) =>
    isRecent(doc.statusHistory.find((history) => history.status === "PDF").at)
  )
);
const uploadedDocs = computed(() =>
  docs.value.filter((doc) =>
    doc.statusHistory.some((history) => history.status === "UPLOADED")
  )
);
const recentlyUploaded = computed(() =>
  uploadedDocs.value.filter((doc) =>
    isRecent(
      doc.statusHistory.find((history) => history.status === "UPLOADED").at
    )
  )
);

const fetchStaticMetrics = async () => {
  try {
    metrics.value = await $fetch("/api/metrics");
  } catch (error) {
    console.error("Error fetching metrics:", error);
  }
};

const fetchMetrics = async () => {
  await fetchStaticMetrics();
  const setupRequired = useCookie("setup-flashcards");
  if (setupRequired.value) {
    updateCoursesandSubjects();
  }
};

onMounted(fetchMetrics);
</script>

