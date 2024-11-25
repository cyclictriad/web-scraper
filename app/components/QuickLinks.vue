<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2  w-full md:w-3/4 mx-auto mt-20 mb-20"
  >
    <h5 class="text-green-300 px-3 col-span-full text-2xl">Quick Links</h5>

    <NuxtLink
      v-for="route in filteredRoutes"
      :key="route.path"
      :to="route.path"
      class="text-green-200 hover:underline underline-offset-3 group flex items-center"
    >
      <span>{{ routeTextMap[route.path] || route.name }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="size-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <path
          fill-rule="evenodd"
          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </NuxtLink>
  </div>
</template>

<script setup>
const router = useRouter();
const allRoutes = router.getRoutes();

// Custom text mapping for routes
const routeTextMap = {
  "/upload": "Upload Files",
  "/analytics": "Charts and Analytics",
  "/chat": "Chat with AI",
  "/": "Home",
};

// Filter out routes you want to display
const filteredRoutes = computed(() => {
  return allRoutes.filter(
    (route) =>
      Object.keys(routeTextMap).includes(route.path) &&
      route.path !== router.currentRoute.value.path &&
      route.path != "/auth"
  );
});
</script>

<style lang="scss" scoped>
</style>