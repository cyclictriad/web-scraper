<!-- components/BeautifyCode.client.vue -->
<template>
  <div
    class="border border-gray-300 rounded-lg overflow-hidden bg-gray-800 text-white relative transform transition-all duration-200 hover:shadow-lg"
    :class="language"
    :data-language="language"
  >
    <!-- Header with gradient background -->
    <div
      class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700"
    >
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full" :class="getLanguageColor"></div>
        <span class="text-sm text-gray-300 font-mono font-semibold">{{
          language
        }}</span>
      </div>
      <div class="flex space-x-4">
        <button
          class="text-gray-400 hover:text-white transition-colors duration-200 relative group"
          title="Copy"
          @click="copyCode"
        >
          <Icon
            :icon="copied ? 'mdi:check' : 'mdi:content-copy'"
            class="w-5 h-5"
          />
          <span
            class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {{ copied ? "Copied!" : "Copy code" }}
          </span>
        </button>
        <button
          class="text-gray-400 hover:text-white transition-colors duration-200 relative group"
          title="Save"
          @click="saveCode"
        >
          <Icon icon="mdi:content-save" class="w-5 h-5" />
          <span
            class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Save file
          </span>
        </button>
        <button
          class="text-gray-400 hover:text-white transition-colors duration-200 relative group"
          title="Toggle line numbers"
          @click="toggleLineNumbers"
        >
          <Icon
            :icon="showNumbers ? 'mdi:chevron-down' : 'mdi:chevron-up'"
            class="w-5 h-5"
          />
          <span
            class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {{ showNumbers ? "Hide" : "Show" }} line numbers
          </span>
        </button>
      </div>
    </div>

    <!-- Code Body -->
    <div
      class="relative p-4 overflow-auto transition-all duration-200"
      :class="{ 'pl-12': showNumbers }"
      style="max-height: 600px"
    >
      <div
        v-if="showNumbers"
        class="absolute left-4 top-4 text-gray-600 select-none transition-opacity duration-200"
        :class="{ 'opacity-50 hover:opacity-100': true }"
      >
        <span
          v-for="line in lines"
          :key="line"
          class="block text-right font-mono text-xs leading-relaxed"
        >
          {{ line }}
        </span>
      </div>
      <pre
        v-html="highlightedCode"
        class="font-mono text-sm leading-relaxed"
        :class="{ 'with-line-numbers': showNumbers }"
      ></pre>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, watch, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";

let Prism;

const copied = ref(false);
const showNumbers = ref(true);
const highlightedCode = ref("");

// Only import Prism on client side
onMounted(async () => {
  Prism = await import("prismjs");
  await import("prismjs/themes/prism-tomorrow.css");
  highlightedCode.value = highlightCodeSyntax(props.code);
});

const props = defineProps({
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

// Language-specific colors and file extensions
const languageConfig = {
  javascript: { color: "bg-yellow-400", ext: ".js" },
  typescript: { color: "bg-blue-400", ext: ".ts" },
  python: { color: "bg-green-400", ext: ".py" },
  java: { color: "bg-red-400", ext: ".java" },
  cpp: { color: "bg-purple-400", ext: ".cpp" },
  css: { color: "bg-pink-400", ext: ".css" },
  html: { color: "bg-orange-400", ext: ".html" },
  default: { color: "bg-gray-400", ext: ".txt" },
};

const getLanguageColor = computed(() => {
  return (languageConfig[props.language] || languageConfig.default).color;
});

const getFileExtension = computed(() => {
  return (languageConfig[props.language] || languageConfig.default).ext;
});

// Watch for changes in the code to re-highlight
watch(
  () => props.code,
  (newCode) => {
    if (Prism) {
      highlightedCode.value = highlightCodeSyntax(newCode);
    }
  }
);

const lines = computed(() => {
  return props.code.split("\n").map((_, index) => index + 1);
});

function highlightCodeSyntax(code) {
  if (!Prism) return code;
  try {
    return Prism.highlight(
      decodeURIComponent(code),
      Prism.languages[props.language] || Prism.languages.plaintext,
      props.language
    );
  } catch (e) {
    console.error(e);
    return decodeURIComponent(code);
  }
}

function copyCode() {
  navigator.clipboard.writeText(decodeURIComponent(props.code)).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}

function saveCode() {
  const blob = new Blob([decodeURIComponent(props.code)], {
    type: getMimeType(props.language),
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `code-snippet${getFileExtension.value}`;
  a.click();
}

function getMimeType(language) {
  const mimeTypes = {
    javascript: "application/javascript",
    typescript: "application/typescript",
    python: "text/x-python",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    css: "text/css",
    html: "text/html",
  };
  return mimeTypes[language] || "text/plain";
}

function toggleLineNumbers() {
  showNumbers.value = !showNumbers.value;
}
</script>
  
  <style scoped>
.with-line-numbers {
  counter-reset: line;
}

/* Add some custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>