// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  components: true,
  css: ['~/assets/css/tailwind.css', 'prismjs/themes/prism-tomorrow.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  nitro: {
    experimental: {
      websocket: true
    }
  },
  runtimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
    ARLIAI_API_KEY: process.env.ARLIAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY

  },
  plugins: [{ src: '~/plugins/iconify', mode: 'client' },
  ],
  
})
