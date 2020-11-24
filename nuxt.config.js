import pkg from './package'

export default {
    ssr: true,

    // Env. Variables
    env: {
        BASE_DOMAIN: process.env.BASE_DOMAIN || 'https://<YOUR-JIRA-DOMAIN>/',
        ENDPOINT_BROWSE: process.env.ENDPOINT_BROWSE || 'browse/',
        ENDPOINT_REST: process.env.ENDPOINT_REST || 'rest/api/2/',
        ENDPOINT_AUTH: process.env.ENDPOINT_AUTH || 'rest/auth/1/session',
        VERCEL_URL: process.env.VERCEL_URL
    },
    /*
     ** Headers of the page
     */
    head: {
        title: 'Jira Timetracking Tool',
        htmlAttrs: {
            lang: 'en'
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: pkg.description }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
    },

    /*
     ** Customize the progress-bar color
     */
    loading: { color: 'blue' },

    /*
     ** Global CSS
     */
    css: [
        '~/assets/scss/all.scss'
    ],

    router: {
        middleware: ['auth']
    },

    serverMiddleware: ['~/api/login', '~/api/logout', '~/api/getTickets', '~/api/addWorklog', '~/api/getProjects', '~/api/getProjectRelatedTickets', '~/api/getAssignedTickets', '~/api/getSmartPickedIssues'],

    /*
     ** Plugins to load before mounting the App
     */
    plugins: [
        '~/plugins/global.js',
        '~/plugins/retrieveFromStorage.js',
    ],

    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        // Doc: https://bootstrap-vue.js.org/docs/
        'localforage-nuxt',
        'nuxt-mq',
        'cookie-universal-nuxt'
    ],
    buildModules: [
        ['@nuxtjs/dotenv', {
            only: ['BASE_DOMAIN', 'ENDPOINT_BROWSE', 'ENDPOINT_REST', 'ENDPOINT_AUTH', 'VERCEL_URL']
        }]
    ],
    /*
     ** Axios module configuration
     */
    axios: {
        // See https://github.com/nuxt-community/axios-module#options
    },
    'mq': {
        defaultBreakpoint: 'plg',
        breakpoints: {
            sm: 768,
            md: 1024,
            mdp: 1300, // todo
            plg: 1800, // todo
            lg: Infinity
        }
    },
    /*
     ** Build configuration
     */
    build: {
        /*
         ** You can extend webpack config here
         */
        extend(config, ctx) {
            // Run ESLint on save
            //if (ctx.isDev && ctx.isClient) {
            //  config.module.rules.push({
            //    enforce: 'pre',
            //    test: /\.(js|vue)$/,
            //    loader: 'eslint-loader',
            //    exclude: /(node_modules)/
            //  })
            //}

            config.node = {
                fs: 'empty'
            }
        }
    }
}
