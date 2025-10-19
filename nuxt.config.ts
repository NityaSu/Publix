// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt','@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Home',
      titleTemplate: '%s - Publixware',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        },
        {
          name: 'description',
          content: 'Publicware Platform - Your trusted fashion platform',
        },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          sizes: '32x32',
          href: '/favicon.ico' 
        },
        {
          rel: 'icon',
          type: 'image/x-icon',
          sizes: '16x16',
          href: '/favicon.ico' 
        },
        { rel: 'apple-touch-icon', sizes: '180x180',
          href: '/favicon.ico' 
        },
      ],
    },
  },
})
