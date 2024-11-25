<template>
  <div>
    <label class="block text-green-300 text-lg font-medium mb-2" for="course">{{
      label
    }}</label>
    <div class="custom-select">
      <!-- Dropdown trigger -->
      <div class="custom-select__trigger" @click="toggleDropdown">
        <span>{{ selectedOption || placeholder }}</span>
        <img src="/icons/Down.svg" alt="" class="custom-select__icon" />
      </div>

      <!-- Dropdown options list -->
      <ul v-if="isOpen" class="custom-select__dropdown">
        <!-- Input field for typing the query -->
        <li class="relative">
          <!-- Search input -->
          <input
            v-model="query"
            ref="searchBox"
            placeholder="Search..."
            @keydown.enter="selectOption()"
            class="border-b-2 border-b-gray-800 mb-2 bg-transparent min-h-[50px] placeholder:text-gray-700 pl-5 pr-10 w-full rounded outline-0"
          />

          <!-- Search Icon -->
          <img
            src="/icons/Search.svg"
            alt="search icon"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
          />
        </li>

        <li
          v-for="(option, index) in sortedOptions"
          :key="option"
          @click="selectOption(option)"
          class="custom-select__option"
          :class="{
            'bg-green-200 text-slate-900 bg-opacity-90': query && !index,
          }"
        >
          {{ option }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  selectId: {
    type: String,
    default: "custom-select",
  },
});

const emit = defineEmits(["update:modelValue"]);

const searchBox = ref(null);
const isOpen = ref(false);
const query = ref(""); // To store the user's search query
const selectedOption = ref(props.modelValue);

// Toggle the dropdown open/close
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Close the dropdown
const closeDropdown = () => {
  isOpen.value = false;
};

// Select an option
const selectOption = (option) => {
  if (!option && query.value) {
    option = sortedOptions.value[0];
  }
  selectedOption.value = option;
  emit("update:modelValue", option);
  closeDropdown();
};

const sortedOptions = computed(() => {
  return props.options
    .map((option) => {
      // Calculate how well the option matches the query using regex
      const matchScore = calculateMatchScoreWithRegex(option, query.value);
      return { option, matchScore };
    })
    .sort((a, b) => {
      // Sort by match score (higher score first)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // If scores are equal, sort alphabetically
      return a.option.localeCompare(b.option);
    })
    .map((item) => item.option); // Extract the sorted options
});

// Function to calculate the match score using regex
const calculateMatchScoreWithRegex = (option, query) => {
  if (!query) return 0; // If no query, score is 0

  let optionLower = option.toLowerCase();
  let queryLower = query.toLowerCase();

  // Regex pattern to match the characters in the query
  let pattern = queryLower
    .split("")
    .map((char) => `${char}`)
    .join(".*");
  let regex = new RegExp(pattern, "i"); // Case-insensitive matching

  // Check if the option matches the regex pattern
  if (regex.test(optionLower)) {
    // Calculate score based on the length of the matched query in sequence
    const match = optionLower.match(regex);
    return match ? match[0].length : 0; // Match length as score
  }

  return 0; // No match
};

function startSearching(){
    if (searchBox.value && document.activeElement !== searchBox.value) {
      searchBox.value.focus(); // Focus the input
      console.log("focusing")
    }
  }
onMounted(() => {
  window.addEventListener("keydown", startSearching) ;
});
// Clean up the event listener
onBeforeUnmount(() => {
  window.removeEventListener("keydown", startSearching);
});
</script>

<style scoped>
.custom-select__dropdown {
  max-height: 200px;
  overflow-y: auto;
}

.custom-select__option {
  transition: background-color 0.25s ease;
}

.custom-select__dropdown::-webkit-scrollbar {
  width: 4px;
}

.custom-select__dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.custom-select__dropdown::-webkit-scrollbar-thumb {
  background: #a7f3d0;
  border-radius: 3px;
  height: 4px;
}

.custom-select__dropdown::-webkit-scrollbar-thumb:hover {
  background: #86efac;
}

.custom-select__dropdown::-webkit-scrollbar-button {
  display: none;
}
</style>
