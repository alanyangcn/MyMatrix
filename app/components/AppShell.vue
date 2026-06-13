<script setup lang="ts">
import { computed } from 'vue'

type User = {
  id: number
  username: string
  displayName: string
  role: string
  avatarUrl?: string
}

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()

const availableLocales = [
  { code: 'zh-CN', labelKey: 'language.zh' },
  { code: 'en', labelKey: 'language.en' },
] as const

const userDisplayName = computed(() => {
  return props.user.displayName || props.user.username
})

const userInitial = computed(() => {
  const name = props.user.displayName || props.user.username || 'U'
  return name.trim().charAt(0).toUpperCase()
})

const isDarkMode = computed(() => colorMode.value === 'dark')

const currentLanguageLabel = computed(() => {
  return t(availableLocales.find(item => item.code === locale.value)?.labelKey || 'language.zh')
})

const languageItems = computed(() => [
  availableLocales.map(item => ({
    label: t(item.labelKey),
    icon: locale.value === item.code ? 'i-lucide-check' : 'i-lucide-languages',
    onSelect: async () => {
      await setLocale(item.code)
    },
  })),
])

const userMenuItems = computed(() => [
  [
    {
      label: t('profile.personalInfo'),
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: () => emit('logout'),
    },
  ],
])

function toggleColorMode() {
  colorMode.preference = isDarkMode.value ? 'light' : 'dark'
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-6 overflow-x-hidden bg-[radial-gradient(circle_at_0%_0%,rgba(79,70,229,0.06),transparent_28%),radial-gradient(circle_at_100%_6%,rgba(37,99,235,0.06),transparent_24%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(79,70,229,0.1),transparent_30%),radial-gradient(circle_at_100%_6%,rgba(14,165,233,0.08),transparent_26%)]">
    <header class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-4 h-16 sm:h-[68px] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <NuxtLink
        class="flex items-center gap-2.5 min-w-0 select-none"
        to="/"
      >
        <AppLogo class="w-8 h-8 flex-shrink-0" />
        <h1 class="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
          MyMatrix
        </h1>
      </NuxtLink>

      <div class="flex items-center gap-2 min-w-0">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          :icon="isDarkMode ? 'i-lucide-sun' : 'i-lucide-moon'"
          :aria-label="isDarkMode ? t('theme.light') : t('theme.dark')"
          :title="isDarkMode ? t('theme.light') : t('theme.dark')"
          square
          class="h-10 w-10 flex items-center justify-center"
          @click="toggleColorMode"
        />

        <UDropdownMenu :items="languageItems">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            :aria-label="t('language.switch')"
            class="h-10 w-10 sm:w-auto flex items-center justify-center sm:px-3"
          >
            <template #leading>
              <UIcon name="i-lucide-languages" class="w-4 h-4" />
            </template>
            <span class="hidden sm:inline">{{ currentLanguageLabel }}</span>
            <template #trailing>
              <UIcon name="i-lucide-chevron-down" class="hidden sm:inline w-4 h-4" />
            </template>
          </UButton>
        </UDropdownMenu>

        <UDropdownMenu :items="userMenuItems">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            :aria-label="t('profile.accountMenu')"
            class="h-10 w-10 sm:w-auto flex items-center justify-center sm:px-3"
          >
            <template #leading>
              <UAvatar
                :src="user.avatarUrl"
                :alt="userDisplayName"
                :text="userInitial"
                size="xs"
                class="ring-1 ring-slate-200 dark:ring-slate-800"
              />
            </template>
            <span class="hidden sm:inline max-w-[128px] truncate font-medium text-sm">{{ userDisplayName }}</span>
          </UButton>
        </UDropdownMenu>
      </div>
    </header>

    <section class="pt-[80px] sm:pt-[88px] px-3 sm:px-6 max-w-7xl mx-auto w-full">
      <slot />
    </section>
  </main>
</template>
