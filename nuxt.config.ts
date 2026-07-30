// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/fontaine'],
  css: ['~/assets/css/main.css'],
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: ['node'],
        },
      },
    },
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || '',
  },
  app: {
    head: {
      title: 'Home',
      titleTemplate: 'Nitya Suon | Software Engineer',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        },
        {
          name: 'description',
          content: 'Personal portfolio of SUON NITYA — Bronze Medalist, National Math Olympiad. Building systems that solve real problems.',
        },
        { name: 'theme-color', content: '#111111' },
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
        // Preload self-hosted fonts so the browser fetches them immediately
        // (in parallel with CSS/JS). The head script below then hides the body
        // until document.fonts.load() finishes for these families, so the user
        // never sees a fallback-font swap on the initial paint.
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/inter-400.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/inter-500.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/inter-600.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/montserrat-600.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/montserrat-700.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/montserrat-800.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/space-grotesk.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/dm-mono-400.woff2',
          crossorigin: 'anonymous',
        },
      ],
      style: [
        {
          key: 'font-loading-guard',
          // We inline the critical @font-face rules here (before the main CSS
          // arrives from Vite) so document.fonts.load() can resolve the real
          // fonts before the body is unhidden. This prevents the NITYA SUON
          // logo and other above-the-fold text from painting with a fallback
          // font first in dev mode.
          innerHTML: "@font-face{font-family:'Inter';src:url('/fonts/inter-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}@font-face{font-family:'Inter';src:url('/fonts/inter-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap}@font-face{font-family:'Inter';src:url('/fonts/inter-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap}@font-face{font-family:'Montserrat';src:url('/fonts/montserrat-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap}@font-face{font-family:'Montserrat';src:url('/fonts/montserrat-700.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}@font-face{font-family:'Montserrat';src:url('/fonts/montserrat-800.woff2') format('woff2');font-weight:800;font-style:normal;font-display:swap}@font-face{font-family:'Space Grotesk';src:url('/fonts/space-grotesk.woff2') format('woff2');font-weight:300 700;font-style:normal;font-display:swap}html.fonts-loading body{opacity:0;pointer-events:none}html.fonts-loaded body{opacity:1;transition:opacity .2s ease}",
          tagPosition: 'head',
        },
      ],
      script: [
        {
          key: 'font-loader',
          innerHTML: `(function(){if(typeof document==='undefined')return;var h=document.documentElement;h.classList.add('fonts-loading');var fonts=['400 1em Inter','500 1em Inter','600 1em Inter','600 1em Montserrat','700 1em Montserrat','800 1em Montserrat','400 1em Space Grotesk','700 1em Space Grotesk'];function done(){h.classList.remove('fonts-loading');h.classList.add('fonts-loaded');}if(document.fonts&&document.fonts.load){Promise.all(fonts.map(function(f){return document.fonts.load(f);})).catch(function(){}).finally(done);}else{done();}setTimeout(done,2000);})();`,
          type: 'text/javascript',
          tagPosition: 'head',
        },
      ],
    },
  },
})
