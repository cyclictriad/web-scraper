<template>
  <div class="bg-gray-800 py-6 rounded-lg shadow-md space-y-4">
    <!-- Font Size and Line Height in a Row for Smaller Screens -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Font Size -->
      <div class="flex flex-col">
        <label for="fontSize" class="text-green-300">Font Size (px):</label>
        <input
          type="number"
          v-model="font.size"
          id="fontSize"
          min="1"
          class="mt-1 p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring focus:ring-green-300"
        />
      </div>

      <!-- Line Height -->
      <div class="flex flex-col">
        <label for="lineHeight" class="text-green-300">Line Height:</label>
        <input
          type="number"
          v-model="font.line_height"
          step="0.1"
          min="0.1"
          id="lineHeight"
          class="mt-1 p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring focus:ring-green-300"
        />
      </div>

      <!-- Font Family (Custom Select) -->
      <div class="flex flex-col">
        <label for="fontFamily" class="text-green-300">Font Family:</label>
        <CustomSelect :options="fonts" v-model="font.family" id="fontFamily" />
        <div class="flex flex-wrap gap-2 p-2">
          <span
            v-for="(style, index) in styles"
            :key="index"
            class="bg-green-300 text-gray-900 py-1 px-3 rounded-full flex items-center space-x-2"
          >
            <span>{{ style }}</span>
            <button
              type="button"
              @click="removeStyle(style)"
              class="text-gray-900 hover:text-gray-700 focus:outline-none"
            >
              &times;
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Font Color (Color Picker) in its own row -->
    <div class="flex flex-col">
      <ColorPicker v-model="font.color"/>
    </div>
  </div>
</template>
  
<script setup>
import ColorPicker from "./ColorPicker.vue";
import CustomSelect from "./CustomSelect.vue"; // Assuming you have this component

// Define the prop `font` with a default structure and validation.
const props = defineProps({
  font: {
    type: Object,
    required: true,
    default: () => ({
      family: "Arial",
      size: 16,
      lineHeight: 1.5,
      color: "#000000",
    }),
  },
});

const styles = computed(() => {
  const family = props.font.family;

  // Use regex to find all style keywords (Bold, Italic) and remove them from the family string
  const styleMatches = family.match(/Bold|Italic/g) || [];
  const baseFamily = family.replace(/Bold|Italic/g, "").trim();

  // Prepare the styles array
  const _styles = [...styleMatches];

  // Push the base font family (if not empty)
  if (baseFamily) _styles.push(baseFamily);

  return _styles;
});

function removeStyle(style) {
    const family = props.font.family;

    // Create a regex pattern dynamically based on the style passed
    const regexPattern = new RegExp(style, 'g');

    // Replace the style in the family name and trim any extra whitespace
    props.font.family = family.replace(regexPattern, '').trim();

}


const fonts = [
  "Courier",
  "CourierBold",
  "CourierBoldOblique",
  "CourierOblique",
  "Helvetica",
  "HelveticaBold",
  "HelveticaBoldOblique",
  "HelveticaOblique",
  "Symbol",
  "TimesRoman",
  "TimesRomanBold",
  "TimesRomanBoldItalic",
  "TimesRomanItalic",
  "ZapfDingbats",
];
</script>
  
  <style scoped>
/* You can include any additional styles here if needed */
</style>
  