<template>
  <div class="h-screen flex items-center justify-center bg-gray-900 text-white">
    <div
      class="w-full max-w-6xl flex shadow-lg rounded-lg bg-gray-800 max-h-[90%] overflow-hidden"
    >
      <!-- Left Side: Form -->
      <div class="w-2/5 p-10 relative flex flex-col">
        <!-- Tab Navigation -->
        <div class="flex justify-around mb-6">
          <button
            @click="activeTab = 'signup'"
            :class="
              activeTab === 'signup'
                ? 'text-green-300 font-bold border-b-2 border-green-300 pb-1'
                : 'text-gray-400'
            "
          >
            Sign Up
          </button>
          <button
            @click="activeTab = 'login'"
            :class="
              activeTab === 'login'
                ? 'text-green-300 font-bold border-b-2 border-green-300 pb-1'
                : 'text-gray-400'
            "
          >
            Login
          </button>
        </div>

        <!-- Form Container with Fixed Height -->
        <div class="flex-1 min-h-0">
          <transition name="slide" mode="out-in">
            <div key="form" class="h-full">
              <!-- Signup Form -->
              <form
                v-if="activeTab === 'signup'"
                @submit.prevent="handleSignup"
                class="space-y-6 h-full w-full overflow-y-auto thin-scroll px-2"
              >
                <div class="relative">
                  <label class="block mb-1 text-gray-400">Name</label>
                  <input
                    type="text"
                    v-model="signupForm.name"
                    class="w-full px-4 py-2 bg-transparent border border-gray-400 rounded focus:border-green-300 focus:outline-none transition-all placeholder-gray-500 text-green-300"
                    placeholder="Your Name"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    id="name"
                    name="name"
                    autocomplete="name"
                    required
                  />
                </div>
                <div class="relative">
                  <label class="block mb-1 text-gray-400">Stuvia Email</label>
                  <input
                    type="email"
                    v-model="signupForm.stuvia.email"
                    class="w-full px-4 py-2 bg-transparent border border-gray-400 rounded focus:border-green-300 focus:outline-none transition-all placeholder-gray-500 text-green-300"
                    placeholder="you@stuvia.com"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    id="email"
                    name="email"
                    autocomplete="email"
                    required
                  />
                </div>
                <div class="relative">
                  <label class="block mb-1 text-gray-400">Password</label>
                  <input
                    type="password"
                    v-model="signupForm.stuvia.password"
                    class="w-full px-4 py-2 bg-transparent border border-gray-400 rounded focus:border-green-300 focus:outline-none transition-all placeholder-gray-500 text-green-300"
                    placeholder="Password"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    id="password"
                    name="password"
                    autocomplete="new-password"
                    required
                  />
                </div>
              
                  <button
                    type="submit"
                    class="w-full bg-green-300 text-gray-900 py-2 rounded"
                  >
                    Sign Up
                  </button>
                
              </form>

              <!-- Login Form -->
              <form
                v-if="activeTab === 'login'"
                @submit.prevent="handleLogin"
                class="space-y-6"
              >
                <div class="relative">
                  <label class="block mb-1 text-gray-400">Email</label>
                  <input
                    type="text"
                    v-model="loginForm.email"
                    class="w-full px-4 py-2 bg-transparent border border-gray-400 rounded focus:border-green-300 focus:outline-none transition-all placeholder-gray-500 text-green-300"
                    placeholder="Your Stuvia Email"
                    id="login-email"
                    name="email"
                    autocomplete="email"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="w-full bg-green-300 text-gray-900 py-2 rounded mt-4"
                >
                  Login
                </button>
              </form>
            </div>
          </transition>
        </div>
      </div>

      <!-- Right Side: Image and Info -->
      <div class="w-3/5 bg-gray-700 flex items-center justify-center p-10">
        <div class="text-center">
          <img
            src="/icons/bot.svg"
            alt="Illustration"
            class="mb-4 w-3/4 mx-auto"
          />
          <p class="text-gray-300">
            Welcome to Stuvia Bot! Sign up to access great bot tools, or login
            if you already have an account.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";

// Reactive state for active tab and form data
const activeTab = ref("signup");

// Signup form state
const signupForm = reactive({
  name: "",
  stuvia: {
    email: "",
    password: "",
  },
});

// Login form state
const loginForm = ref({
  email: "",
});

// Handle transitions between forms
const handleSignup = async () => {
  try {
    await $fetch("/api/auth?signup", {
      method: "POST",
      body: signupForm,
    });
    useRouter().push("/");
  } catch (error) {
    console.log(error.message);
  }
};

const handleLogin = async () => {
  try {
    await $fetch("/api/auth?signin", {
      method: "POST",
      body: loginForm.value,
    });
    useRouter().push("/");
  } catch (error) {
    console.log(error.message);
  }
};

// For handling the border detachment effect
const handleFocus = (event) => {
  event.target.classList.add(
    "border-b-4",
    "border-l-0",
    "border-r-0",
    "border-t-0"
  );
};

const handleBlur = (event) => {
  event.target.classList.remove(
    "border-b-4",
    "border-l-0",
    "border-r-0",
    "border-t-0"
  );
};

definePageMeta({
  layout: false, // No layout for this page
});
</script>
  
  <style scoped>
/* Sliding transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* For custom border focus effect */
input:focus {
  border-color: transparent;
  border-bottom-color: #38a169; /* green-300 */
  box-shadow: none;
}
</style>
  