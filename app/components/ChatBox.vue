<template>
  <div
    v-if="isOpen"
    class="w-screen h-screen flex overflow-hidden absolute top-0 left-0 gap-0"
  >
    >
    <!-- Left side with semi-transparent background and border -->
    <div
      class="md:w-4/6 lg:w-5/7 h-full bg-gray-800 bg-opacity-60 border-r border-gray-600 hidden md:block"
    ></div>

    <!-- Right side iframe -->
    <div class="w-full md:w-2/6 lg:w-2/7 h-full relative">
      <span
        @click="emit('update:open')"
        class="absolute top-0 left-0 px-2 bg-green-300 rounded-full h-[40px] aspect-square text-center bg-opacity-30 text-green-300 text-3xl"
        >&times;</span
      >
      <iframe
        :src="`/chat?url=${encodeURIComponent(url)}`"
        class="w-full h-full z-10"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>
  
  <script setup>
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:open"]);
const isOpen = computed(() => props.open);
onMounted(()=>{
    window.scroll({top:0})
})
</script>
  
  <style lang="scss" scoped>
</style>
  