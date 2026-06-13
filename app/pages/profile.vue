<script setup lang="ts">
import { computed } from 'vue'

type User = {
  id: number
  username: string
  displayName: string
  role: string
  avatarUrl?: string
}

const { t } = useI18n()

definePageMeta({
  layout: 'authenticated',
})

const { data } = await useFetch<{ user: User | null }>('/api/auth/me')
const user = computed(() => data.value?.user || null)
</script>

<template>
  <section
    v-if="user"
    class="max-w-2xl mx-auto w-full pt-4"
  >
    <UButton
      color="neutral"
      variant="link"
      to="/"
      icon="i-lucide-arrow-left"
      class="p-0 mb-4 font-bold text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      {{ t('profile.back') }}
    </UButton>

    <UCard class="shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <UAvatar
          :src="user.avatarUrl"
          :text="(user.displayName || user.username).charAt(0).toUpperCase()"
          size="lg"
          class="font-black text-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-white"
        />
        <div class="space-y-1">
          <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ t('profile.personalInfo') }}
          </h1>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
            {{ user.displayName || user.username }}
          </p>
        </div>
      </div>

      <dl class="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
        <div class="py-3.5 grid grid-cols-[140px_1fr] gap-4 items-center">
          <dt class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {{ t('profile.username') }}
          </dt>
          <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ user.username }}
          </dd>
        </div>
        <div class="py-3.5 grid grid-cols-[140px_1fr] gap-4 items-center">
          <dt class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {{ t('profile.displayName') }}
          </dt>
          <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ user.displayName || user.username }}
          </dd>
        </div>
        <div class="py-3.5 grid grid-cols-[140px_1fr] gap-4 items-center">
          <dt class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {{ t('profile.role') }}
          </dt>
          <dd class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ user.role }}
          </dd>
        </div>
      </dl>
    </UCard>
  </section>
</template>
