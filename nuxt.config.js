export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Jira Timetracking Tool',
    htmlAttrs: {
      ['data-theme']: 'dmf'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/scss/main.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxt/postcss8'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    ['nuxt-vuex-localstorage', {
      localStorage: ['issues', 'break', 'bookmarks']  //  If not entered, “localStorage” is the default value
    }]
  ],

  auth: {
    plugins: [ '~/plugins/auth.js' ],
    strategies: {
      jira: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://auth.atlassian.com/authorize',
          token: '/server-middleware/auth'
        },
        audience: 'api.atlassian.com',
        token: {
          property: 'access_token',
          type: 'Bearer',
          required: true,
          maxAge: 3600
        },
        responseType: 'code',
        grantType: 'authorization_code',
        clientId: process.env.JIRA_CLIENT_ID,
        scope: [
          'read:me',
          'read:jira-work',
          'read:jira-user',
          'write:jira-work',
          'offline_access'
        ],
        codeChallengeMethod: 'S256',
        responseMode: '',
        acrValues: '',
      }
    }
  },

  env: {
    jiraResourceName: process.env.JIRA_RESOURCE_NAME || ''
  },

  dotenv: {
    only: [
      'JIRA_CLIENT_ID',
      'JIRA_RESOURCE_NAME'
    ],
    path: '~/..'
  },

  serverMiddleware: [
    { path: "/server-middleware/auth", handler: "~/server-middleware/auth.js" },
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    loaders: {
      sass: {
        implementation: require('sass'),
      },
      scss: {
        implementation: require('sass'),
      },
    },
  }
}
