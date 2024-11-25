<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-md mt-6">
    <h3 class="text-2xl font-semibold mb-4 text-green-300">Meta Settings</h3>
    <div class="mb-4">
      <h4 class="text-green-300 text-xl">
        Streams <sup class="text-white">*</sup> 
      </h4>
      <div class="space-x-3">
        <label>
          <input
            v-model="selectedStreams"
            type="checkbox"
            name="streams"
            value="brainscape"
          />
          BrainScape.com
        </label>
        <label>
          <input
            v-model="selectedStreams"
            type="checkbox"
            name="streams"
            value="studystack"
          />
          Studystack.com
        </label>
        <label>
          <input
            v-model="selectedStreams"
            type="checkbox"
            name="streams"
            value="cram"
          />
          Cram.com
        </label>
      </div>
      <p class="text-red-600" v-if="setupState.error.messages.streams && !meta.streams.length ">Select atleast one</p>
    </div>

    <div class="mb-4">
      <label class="block text-green-300 mb-2"
        >Number of Keywords (Max 8):</label
      >
      <input
        type="number"
        v-model="meta.keywords"
        max="8"
        class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />
    </div>

    <div class="mb-4">
      <label class="block text-green-300 mb-2">AI Model to Generate:</label>
      <CustomSelect
        :options="activeModels.map((model) => model.id)"
        v-model="meta.ai_model"
        placeholder="Select AI Model"
      />
    </div>

    <div class="mb-4">
      <label class="block text-green-300 mb-2">Minimum Price:</label>
      <input
        type="number"
        step="0.01"
        v-model="meta.min_price"
        class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />
    </div>
    <div class="mb-4">
      <label class="block text-green-300 mb-2">Minimum Price:</label>
      <input
        type="number"
        min="1"
        v-model="meta.batch"
        class="w-full bg-transparent border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />
    </div>

    <div class="mb-4">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="meta.link_book"
          class="mr-2 text-green-300"
        />
        <span class="text-green-300">Link to Book</span>
      </label>
    </div>
  </div>
</template>
  
  <script setup>
import { setupState } from '~/store';

const props = defineProps({
  meta: {
    type: Object,
    required: true,
  },
});

const activeModels = ref([]);
activeModels.value = await $fetch("/api/chat-completion");

// Local state
const selectedStreams = ref([]);

selectedStreams.value = props.meta.streams

// Watch selectedStreams and update meta.streams when it changes
watch(selectedStreams, (newSelectedStreams) => {
  props.meta.streams = [...newSelectedStreams];
});
</script>
  
  <style scoped>
/* Additional styles if necessary */
</style>
  