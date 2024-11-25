<template>
  <div class="min-h-screen bg-gray-900 text-green-300 p-4">
    <div class="container mx-auto">
      <h1 class="text-4xl font-bold text-center mb-8">Analytics Dashboard</h1>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 lg:col-span-9">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ChartWrapper title="Subjects">
              <ChartSubjects />
            </ChartWrapper>
            <ChartWrapper title="Quizzes">
              <ChartQuizzes />
            </ChartWrapper>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ChartWrapper title="Activity">
              <ChartActivity />
            </ChartWrapper>
            <ChartWrapper title="PDFs">
              <ChartPDFs />
            </ChartWrapper>
            <ChartWrapper title="Uploads">
              <ChartUploads />
            </ChartWrapper>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <Search />
        </div>
      </div>
      <DataSummaria />

      <button
        @click="isChatting = !isChatting"
        class="fixed bottom-4 right-4 bg-green-300 text-gray-900 p-2 rounded-full"
      >
      </button>

      <Transition name="slide-fade">
        <div
          v-if="isChatting"
          class="fixed bottom-20 right-4 w-80 h-96 bg-gray-800 rounded-lg shadow-lg p-4"
        >
          <h3 class="text-xl font-semibold mb-4">Chat</h3>
          <ChatBox
            @update:open="isChatting = false"
            :open="isChatting"
            url="/analytics"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>

const isChatting = ref(false);
</script>

<style>
.chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>