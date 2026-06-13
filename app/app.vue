<script setup lang="ts">
useSeoMeta({
  title: 'MyMatrix',
  description: 'A private NuxtHub vault for account, server, and domain records.',
})

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
    { rel: 'alternate icon', href: '/favicon.ico' },
  ],
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
}

body {
  color: #1e293b; /* text-slate-800 */
  background-color: #f8fafc; /* bg-slate-50 */
}

html.dark body {
  color: #f1f5f9; /* text-slate-100 */
  background-color: #020617; /* bg-slate-950 */
}
</style>
