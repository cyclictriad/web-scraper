<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="px-4 pt-2 flex justify-between">
      <div>
        <img src="/icons/Bot.green.svg" alt="" class="size-14 inline-block" />
        <div class="inline-flex flex-col gap-y-0">
          <span
            class="bg-green-300 bg-opacity-15 text-green-300 -translate-y-4 rounded-xl font-bold -translate-x-1 px-2 max-w-[fit-content]"
            ><small>with</small> AI</span
          >
          <span class="text-green-300 text-lg">Stuvia Bot</span>
        </div>
      </div>
      <div class="flex justify-center">
        <button
          @click="logout"
          class="flex text-slate-900 border bg-green-300 h-[fit-content] rounded-lg px-2 py-1"
        >
          <img src="/icons/User.svg" alt="User Icon" class="my-auto size-4 inline-block" />
          <span>{{name}}</span>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- QuickLinks component -->
    <QuickLinks class="mt-auto" />
  </div>
</template>
  
  <script setup>
const name = useCookie("user_name").value; // Read the cookie value
const logout = async() => {
  await $fetch('/api/auth?logout')
  useRouter().push('/auth')
}
</script>