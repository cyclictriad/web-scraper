<template>
  <div v-if="show" class="space-y-4">
    <!-- Header or Footer Label -->
    <div class="space-y-2">
      <label class="block text-sm text-green-500">
        Margin from {{ name === "Header" ? "top" : "bottom" }}:
      </label>
      <input
        type="number"
        v-model="content.margin"
        min="0"
        class="w-full bg-gray-900 border border-green-500 text-green-300 placeholder-gray-500 py-2 px-4 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
        placeholder="Set margin in pixels"
      />
    </div>

    <!-- Layout Selection Buttons -->
    <div class="flex items-center gap-2">
      <label class="block text-sm text-green-500">Select Layout:</label>
      <div class="flex gap-3">
        <button
          type="button"
          v-for="layout in layouts"
          :key="layout.value"
          @click="selectLayout(layout.value)"
          :class="[
            'flex items-center gap-2 px-3 py-1 border border-green-500 text-green-300 rounded-md focus:ring-2 focus:ring-green-400',
            selectedLayout === layout.value
              ? 'bg-green-500 text-black'
              : 'bg-gray-900',
          ]"
        >
          <Icon :icon="layout.icon" class="w-4 h-4" />
          <span class="text-xs">{{ layout.label }}</span>
        </button>
      </div>
    </div>

    <!-- Content Input -->
    <div class="space-y-2">
      <label class="block text-sm text-green-500">Content:</label>
      <div v-if="selectedLayout === 'Split'" class="grid grid-cols-2 gap-4">
        <input
          v-model="leftText"
          @input="updateContentText"
          class="w-full bg-gray-900 border border-green-500 text-green-300 placeholder-gray-500 py-2 px-4 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="#c - Course Name"
        />
        <input
          v-model="rightText"
          @input="updateContentText"
          class="w-full bg-gray-900 border border-green-500 text-green-300 placeholder-gray-500 py-2 px-4 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          placeholder="#p - Page Number"
        />
      </div>
      <div v-else>
        <input
          v-model="singleText"
          @input="updateContentText"
          class="w-full bg-gray-900 border border-green-500 text-green-300 placeholder-gray-500 py-2 px-4 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          :placeholder="getPlaceholder()"
        />
      </div>
      <small class="text-gray-500 text-xs block mt-1">
        Use #e for edition, #s for subject, #c for course, #y for year, #p for
        page number
      </small>
    </div>

    <!-- Font Component -->
    <Font :font="content.font" />

    <!-- Preview -->
    <div
      class="border border-green-500 p-4 rounded-md bg-gray-800 text-green-300 mt-4"
    >
      <div :class="getPreviewClass()">
        <span v-if="selectedLayout === 'Split'">{{ leftText }}</span>
        <span v-else>{{ singleText }}</span>
        <span v-if="selectedLayout === 'Split'">{{ rightText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { defineProps } from "vue";

// Define props
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Icon layout configuration
const layouts = [
  { value: "Left", icon: "mdi:format-align-left", label: "Left" },
  { value: "Center", icon: "mdi:format-align-center", label: "Center" },
  { value: "Right", icon: "mdi:format-align-right", label: "Right" },
  { value: "Split", icon: "mdi:view-column", label: "Split" },
];

const selectedLayout = ref(props.content.alignment || "Left");
const leftText = ref("");
const rightText = ref("");
const singleText = ref(props.content.text || "");

// Update content.text based on the selected layout
const updateContentText = () => {
  if (selectedLayout.value === "Split") {
    props.content.text = `${leftText.value};${rightText.value}`;
  } else {
    props.content.text = singleText.value;
  }
};

// Update the alignment on layout selection
const selectLayout = (layout) => {
  selectedLayout.value = layout;
  props.content.alignment = layout;
};

// Watch for changes to keep data synchronized
watch(selectedLayout, (newLayout) => {
  if (newLayout !== "Split") {
    singleText.value = props.content.text;
  } else {
    const [left, right] = props.content.text.split(";");
    leftText.value = left || "";
    rightText.value = right || "";
  }
});

// Placeholder and preview class functions
const getPlaceholder = () => {
  const placeholders = {
    left: "#e - Edition #y",
    center: "#c - Course Name",
    right: "Page #p",
  };
  return placeholders[selectedLayout.value] || "";
};

const getPreviewClass = () => {
  const classes = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    split: "flex justify-between",
  };
  return classes[selectedLayout.value];
};

if (props.content.alignment === "Split") {
  const [left, right] = props.content.text.split(";");
  leftText.value = left || "";
  rightText.value = right || "";
}
</script>

<style scoped>
/* Optional additional styling */
</style>
