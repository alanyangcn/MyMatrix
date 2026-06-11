// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
  ],
  devtools: { enabled: true },

  compatibilityDate: '2025-12-11',

  hub: {
    db: 'sqlite',
    kv: true,
    blob: true,
    cache: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  i18n: {
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      {
        code: 'zh-CN',
        name: '简体中文',
        language: 'zh-CN',
        file: 'zh-CN.json',
      },
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
        file: 'en.json',
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mymatrix_locale',
      redirectOn: 'root',
    },
  },
})
