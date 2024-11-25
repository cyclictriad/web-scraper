<template>
  <div class="min-w-[fit-content]">
    <!-- Header -->
    <label class="block text-green-300 text-lg font-medium mb-3">
      {{ label }}s:
    </label>

    <!-- Mode Toggle -->
    <div class="flex items-center space-x-3 mb-6">
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none',
          !include ? inactiveClass : activeClass,
        ]"
        @click="toggleMode"
      >
        Only
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none',
          !include ? activeClass : inactiveClass,
        ]"
        @click="toggleMode"
      >
        Except
      </button>
    </div>

    <!-- Dropdown -->
    <div class="relative mb-6">
      <div
        class="w-full p-3 bg-gray-900/40 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-900/60 transition-colors duration-200"
        @click="dropdownOpen = !dropdownOpen"
      >
        <span class="text-gray-400">Select a {{ label.toLowerCase() }}</span>
        <img
          src="/icons/Down.svg"
          alt=""
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': dropdownOpen }"
        />
      </div>

      <ul
        v-if="dropdownOpen"
        class="absolute w-full mt-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg custom-select__dropdown z-10"
      >
        <li class="relative border-b border-gray-700/50">
          <input
            v-model="query"
            ref="searchBox"
            placeholder="Search..."
            @keydown.enter="add()"
            class="w-full bg-transparent min-h-[50px] placeholder:text-gray-700 px-5 pr-10 rounded outline-none text-green-300"
          />
          <img
            src="/icons/Search.svg"
            alt="search icon"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-40"
          />
        </li>

        <li
          v-for="(option, index) in sortedOptions"
          :key="option"
          @click="addOption(option.name)"
          class="px-4 py-3 cursor-pointer hover:bg-green-500/20 transition-colors duration-200"
          :class="{
            'bg-green-300 text-slate-900 bg-opacity-90': index === selectedIndex,
          }"
        >
          {{ option.name }}
        </li>
      </ul>
    </div>

    <!-- Selected Items -->
    <div v-if="selectedOptions.length > 0" class="mb-2 text-sm text-green-300">
      {{ !include ? "All except" : "Include" }}:
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="(selectedOption, index) in selectedOptions"
        :key="index"
        class="bg-green-300 text-gray-900 py-1.5 px-3 rounded-full flex items-center space-x-2 group hover:bg-green-400 transition-colors duration-200"
      >
        <span>{{ selectedOption.name }}</span>
        <button
          type="button"
          @click="removeSelectedOption(selectedOption.name)"
          class="text-gray-900 opacity-60 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none"
        >
          ×
        </button>
      </span>
    </div>
  </div>
</template>

<script setup>
import Fuse from "fuse.js";

const props = defineProps({
  availableOptions: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const include = ref(null);
const emit = defineEmits(["update:modelValue"]);
const selectedIndex = ref(0);
const query = ref("");
const dropdownOpen = ref(false);
const searchBox = ref(null);

//initialize  data
include.value = props.modelValue.include;
const sortedOptions = computed(() => {
  const availableOptions = props.availableOptions.filter(
    (option) => !props.modelValue.list.includes(option.name)
  );
  if (query.value) {
    // Fuse.js configuration
    const options = {
      keys: ["name", "keywords"], // Fields to consider for scoring
      threshold: 0.4, // Adjust for strictness of match (0 = exact, 1 = very loose)
      includeScore: true, // Include score for sorting
    };

    // Create a Fuse instance
    const fuse = new Fuse(availableOptions, options);

    // Search using the query
    const results = fuse.search(query.value);

    // Extract and return sorted results
    return results.map((result) => result.item);
  } else {
    return availableOptions.sort((a, b) => a.name.localeCompare(b.name));
  }
});

const selectedOptions = computed(() =>
  props.availableOptions.filter((option) =>
    props.modelValue.list.includes(option.name)
  )
);

function toggleMode() {
  include.value = !include.value;
}

//functions to update value
function removeSelectedOption(selectedOption) {
  console.log(selectedOption)
  emit("update:modelValue", ({
    ...props.modelValue,
    list: props.modelValue.list.filter((option) => option !== selectedOption),
  }));
}
function addOption(option) {
  if (dropdownOpen.value) {
    dropdownOpen.value = false;
  }

  if (!option) {
    option = sortedOptions.value[selectedIndex.value]?.name;
    if (!option) return;
  }

  const uniqueOptions = new Set([...props.modelValue.list, option]);
  // console.log(uniqueOptions)


  emit("update:modelValue", {
    ...props.modelValue,
    list: [...uniqueOptions],
  });
}
watch(include, (newValue) =>
  emit("update:modelValue", { ...props.modelValue, include: newValue })
);


 // Handle arrow key navigation for the dropdown
 const startSearching = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedIndex.value < sortedOptions.value.length - 1) {
        selectedIndex.value += 1;
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value -= 1;
      }
    } else if (event.key === "Enter" && dropdownOpen.value) {
      event.preventDefault();
      addOption();
    }
    
  };

onMounted(() => {

  // console.log(JSON.stringify({
  //   available: props.availableOptions,
  //   sorted:selectedOptions.value,
  //   model:props.modelValue
  // }))
   window.addEventListener("keydown", startSearching);
});

// Computed classes for active/inactive buttons
const activeClass =
  "bg-green-300 text-gray-900 py-2 px-4 rounded-md font-semibold transition ease-in-out duration-300";
const inactiveClass =
  "bg-black border border-green-300 text-green-300 py-2 px-4 rounded-md font-semibold hover:bg-green-300 hover:text-gray-900 transition ease-in-out duration-300";
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
  background: transparent; /* Background of the track */
}

.custom-select__dropdown::-webkit-scrollbar-thumb {
  background: #a7f3d0; /* Color of the thumb */
  border-radius: 3px; /* Rounded corners for the thumb */
  height: 4px;
}

.custom-select__dropdown::-webkit-scrollbar-thumb:hover {
  background: #86efac; /* Color on hover */
}

.custom-select__dropdown::-webkit-scrollbar-button {
  display: none; /* Hides scrollbar buttons */
}
</style>
