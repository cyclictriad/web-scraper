<template>
  <div class="h-full max-h-[100vh]  flex flex-col bg-gray-900 p-4 rounded-lg shadow-xl">
    <h5 class="text-green-300 text-2xl mb-4 flex items-center">
      <Search class="mr-2" />
      Search Quizzes
    </h5>
    <div class="relative mb-4">
      <input
        type="text"
        v-model="query"
        @input="debouncedSearch"
        class="w-full h-12 rounded-md border border-green-300 bg-gray-800 placeholder-gray-400 px-4 pr-10 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
        placeholder="Type to search..."
      />
      <X
        v-if="query"
        @click="clearSearch"
        class="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-green-300"
      />
    </div>
    <div class="flex justify-between items-center mb-2">
      <div class="text-green-300">
        <span v-if="query">Found {{ filteredResults.length }} results</span>
      </div>
      <div class="flex items-center">
        <label class="text-green-300 mr-2">Sort by:</label>
        <select
          v-model="sortBy"
          class="bg-gray-800 text-green-300 border border-green-300 rounded px-2 py-1"
        >
          <option value="relevance">Relevance</option>
          <option value="title">Title</option>
          <option value="date">Date</option>
        </select>
      </div>
    </div>
    <div class="flex-grow overflow-y-auto" id="query-result">
      <div
        v-for="quiz in sortedResults"
        :key="quiz.id"
        class="border border-green-200 rounded-lg m-2 p-4 hover:bg-gray-800 transition-colors duration-200"
      >
        <div class="flex justify-between items-center">
          <div class="flex-grow mr-4">
            <div
              class="text-lg font-semibold text-green-300 mb-1"
              v-html="highlightText(quiz.title, query)"
            ></div>
            <div class="text-sm text-gray-400">
              Created: {{ formatDate(quiz.creationDate) }}
            </div>
            <div class="text-sm text-gray-400 mt-1">
              Status: {{ getLatestStatus(quiz) }}
            </div>
          </div>
          <button
            class="border border-green-300 rounded-md text-green-300 px-4 py-2 hover:bg-green-300 hover:text-gray-900 transition-colors duration-200"
            @click="upload(quiz.id)"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, X } from 'lucide-vue-next';
import debounce from 'lodash/debounce';

const {data:subjects} = await useFetch("/api/subjects");
const {data:quizzes} = await useFetch("/api/quizzes");
const query = ref("");
const sortBy = ref("relevance");

const debouncedSearch = debounce(() => {
  // This function will be called after the user stops typing for 300ms
}, 300);

const filteredResults = computed(() => {
  if (!query.value) return quizzes.value;
  const lowercaseQuery = query.value.toLowerCase();
  return quizzes.value.filter((quiz) => {
    const titleMatch = quiz.title.toLowerCase().includes(lowercaseQuery);
    const keywordMatch = quiz.keywords?.some(keyword => 
      keyword.toLowerCase().includes(lowercaseQuery)
    );
    return titleMatch || keywordMatch;
  });
});

const sortedResults = computed(() => {
  let results = [...filteredResults.value];
  switch (sortBy.value) {
    case 'title':
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'date':
      results.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
      break;
    case 'relevance':
    default:
      // For relevance, we'll prioritize title matches over keyword matches
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = query.value.toLowerCase();
        const aTitleIndex = aTitle.indexOf(queryLower);
        const bTitleIndex = bTitle.indexOf(queryLower);
        if (aTitleIndex !== -1 && bTitleIndex !== -1) {
          return aTitleIndex - bTitleIndex;
        } else if (aTitleIndex !== -1) {
          return -1;
        } else if (bTitleIndex !== -1) {
          return 1;
        }
        return 0;
      });
  }
  return results;
});

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark class='bg-yellow-200 text-gray-900'>$1</mark>");
}

function clearSearch() {
  query.value = "";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getLatestStatus(quiz) {
  const history = quiz.statushistory;
  if (!history || history.length === 0) return 'Unknown';
  return history[history.length - 1].status;
}

async function upload(id) {
  try {
    let sub = subjects.value.find(
      (s) => s._id === quizzes.value.find((quiz) => quiz.id === id).subject
    ).name;
    console.log({ sub, id });
    await fetch(`api/upload?id=${id}&sub=${sub}`, {
      method: 'POST'
    });
    // You might want to update the local state or show a success message here
  } catch (error) {
    console.error('Upload error:', error);
    // Show an error message to the user
  }
}

onMounted(() => {
  // Any initialization code can go here
});
</script>

<style scoped>
#query-result {
  scrollbar-width: thin;
  scrollbar-color: rgba(75, 192, 192, 1) transparent;
}

#query-result::-webkit-scrollbar {
  width: 6px;
}

#query-result::-webkit-scrollbar-thumb {
  background-color: rgba(75, 192, 192, 1);
  border-radius: 3px;
}

#query-result::-webkit-scrollbar-track {
  background: transparent;
}
</style>