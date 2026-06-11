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
  <NuxtPage />
</template>

<style>
:root {
  --ui-bg: #f4f7fb;
  --ui-panel-bg: #fff;
  --ui-panel-bg-strong: #fff;
  --ui-control-bg: #f8fafc;
  --ui-control-bg-strong: #fff;
  --ui-border: #d1d9e4;
  --ui-border-strong: #98a7bb;
  --ui-text: #151b23;
  --ui-heading: #101828;
  --ui-muted: #5f6d7e;
  --ui-subtle: #697789;
  --ui-accent-text: #3730a3;
  --ui-accent-soft: #eef2ff;
  --ui-danger-bg: #fff7f7;
  --ui-danger-bg-hover: #fff1f1;
  --ui-danger-border: #efcaca;
  --ui-danger-text: #9c2f2f;
  --ui-danger-text-strong: #b42318;
  --ui-focus: rgb(79 70 229 / 13%);
}

html,
body,
#__nuxt {
  min-height: 100%;
}

body,
#__nuxt {
  min-height: 100dvh;
}

html {
  background: #f4f7fb;
}

body {
  margin: 0;
  background: #f4f7fb;
}

html.theme-dark,
html.theme-dark body,
html.theme-dark #__nuxt {
  background: #020617;
}

html.theme-dark {
  --ui-bg: #020617;
  --ui-panel-bg: rgb(15 23 42 / 94%);
  --ui-panel-bg-strong: #0f172a;
  --ui-control-bg: rgb(30 41 59 / 86%);
  --ui-control-bg-strong: #1e293b;
  --ui-border: #334155;
  --ui-border-strong: #475569;
  --ui-text: #e5e7eb;
  --ui-heading: #f8fafc;
  --ui-muted: #cbd5e1;
  --ui-subtle: #94a3b8;
  --ui-accent-text: #c7d2fe;
  --ui-accent-soft: #1e293b;
  --ui-danger-bg: #2f1518;
  --ui-danger-bg-hover: #3f171b;
  --ui-danger-border: #7f1d1d;
  --ui-danger-text: #fecaca;
  --ui-danger-text-strong: #fee2e2;
  --ui-focus: rgb(129 140 248 / 18%);
}

html.theme-light,
html.theme-light body,
html.theme-light #__nuxt {
  background: #f4f7fb;
}

html.theme-transitioning,
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition:
    background-color .28s ease,
    background .28s ease,
    border-color .28s ease,
    box-shadow .28s ease !important;
}

@media (prefers-reduced-motion: reduce) {
  html.theme-transitioning,
  html.theme-transitioning *,
  html.theme-transitioning *::before,
  html.theme-transitioning *::after {
    transition: none !important;
  }
}
</style>
