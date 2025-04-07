export default defineNuxtConfig({
  // App Config
  app: {
    head: {
      title: 'Jira Timetracking Tool',
      htmlAttrs: {
        'data-theme': 'dmf'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
    }
  },

  // CSS
  css: ['~/assets/scss/main.scss'],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  // Runtime Config für Umgebungsvariablen
  runtimeConfig: {
    jira: {
      clientId: process.env.JIRA_CLIENT_ID,
      clientSecret: process.env.JIRA_CLIENT_SECRET,
      resourceName: process.env.JIRA_RESOURCE_NAME || '',
      authOrigin: process.env.AUTH_ORIGIN
    },
    public: {}
  },

  // Auto-Import Components
  components: true,

  // Tailwind CSS Config
  tailwindcss: {
    cssPath: '~/assets/scss/main.scss',
    configPath: 'tailwind.config.js',
  },

  nitro: {
    routeRules: {
      '/api/auth/**': { cors: false }
    }
  },

  // Dev Tools
  devtools: { enabled: true },

  compatibilityDate: '2025-03-28'
})