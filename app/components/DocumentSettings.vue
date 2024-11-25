<template>
  <div v-if="!isLoading" class="bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 class="text-2xl font-semibold mb-4 text-green-300">
      Document Customization
    </h3>

    <!-- Page Numbers -->
    <div class="mb-4">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="includePageNumbers"
          class="mr-2 text-green-300"
        />
        <span class="text-green-300">Include Page Numbers</span>
      </label>

      <div v-if="includePageNumbers" class="space-y-4">
        <div>
          <label class="block text-green-300 mb-2">Number Style</label>
          <CustomSelect
            :options="['Numeric', 'Roman']"
            v-model="document.page.style"
            placeholder="Select a style"
          />
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="mb-4">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="includeHeader"
          class="mr-2 text-green-300"
        />
        <span class="text-green-300">Include Header</span>
      </label>

      <HF
        :show="includeHeader"
        :content="document.header"
        :name="'Header'"
      ></HF>
    </div>

    <!-- Footer -->
    <div class="mb-4">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="includeFooter"
          class="mr-2 text-green-300"
        />
        <span class="text-green-300">Include Footer</span>
      </label>
      <HF
        :name="'Footer'"
        :content="document.footer"
        :show="includeFooter"
      ></HF>
    </div>

    <!-- Page Margins -->
    <div class="mb-4">
      <label class="block text-green-300 mb-2">Left Margin:</label>
      <input
        type="number"
        v-model="document.margin.left"
        class="w-full bg-black border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />

      <label class="block text-green-300 mb-2">Right Margin:</label>
      <input
        type="number"
        v-model="document.margin.right"
        class="w-full bg-black border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />
      <label class="block text-green-300 mb-2">Top Margin:</label>
      <input
        type="number"
        v-model="document.margin.top"
        class="w-full bg-black border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />

      <label class="block text-green-300 mb-2">Bottom Margin:</label>
      <input
        type="number"
        v-model="document.margin.bottom"
        class="w-full bg-black border border-green-300 text-green-300 py-2 px-3 rounded-md"
      />
    </div>

    <!-- Text Highlighting Options -->
    <div class="mb-4">
      <CustomSelect
        :options="['Highlight', 'Circle']"
        v-model="document.mark"
        label="Highlight or Circle MCQs"
      />
    </div>
    <!-- Sub Headings Text Customization -->
    <h5 class="text-base text-green-300">Subheadings</h5>
    <Font :font="document.sub_heading"></Font>

    <!-- Body Text Customization -->
    <h5 class="text-base text-green-300">Body Text</h5>
    <Font :font="document.font"></Font>

    <!-- Cover Page Option -->
    <div class="mb-4">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="document.cover_page.consent"
          class="mr-2 text-green-300"
        />
        <span class="text-green-300">Include Cover Page</span>
      </label>
      <CoverPage :document="document"/>

    </div>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
});

// Reactive properties for document settings
const includePageNumbers = ref(false);
const includeHeader = ref(false);
const includeFooter = ref(false);
const isLoading = computed(() => !Object.keys(props.document).length > 0);


</script>
  
  <style scoped>
/* Additional styles if necessary */
</style>
  