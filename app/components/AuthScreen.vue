<script setup lang="ts">
import { computed } from 'vue'

const { t, locale, setLocale } = useI18n()

const authMode = defineModel<'login' | 'register'>('authMode', { required: true })
const showPassword = defineModel<boolean>('showPassword', { required: true })
const authForm = defineModel<{
  username: string
  password: string
}>('authForm', { required: true })

defineProps<{
  authError: string
  loading: boolean
}>()

defineEmits<{
  submit: []
}>()

const availableLocales = [
  { code: 'zh-CN', labelKey: 'language.zh' },
  { code: 'en', labelKey: 'language.en' },
] as const

const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')

const localeOptions = computed(() => availableLocales.map(item => ({
  value: item.code,
  label: t(item.labelKey),
})))

function toggleColorMode() {
  colorMode.preference = isDarkMode.value ? 'light' : 'dark'
}
</script>

<template>
  <main class="w-full min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-slate-950 flex items-center justify-center bg-[radial-gradient(circle_at_18%_12%,rgba(92,124,250,0.08),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(20,184,166,0.06),transparent_24%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(99,102,241,0.1),transparent_30%),radial-gradient(circle_at_84%_16%,rgba(20,184,166,0.05),transparent_28%)]">
    <section class="w-full max-w-5xl min-h-[550px] lg:h-[680px] grid grid-cols-1 lg:grid-cols-[1fr_420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
      <!-- Intro Panel -->
      <div class="flex flex-col justify-between p-8 md:p-10 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 dark:from-slate-900/40 dark:to-slate-950/20">
        <div class="flex items-center gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            :icon="isDarkMode ? 'i-lucide-sun' : 'i-lucide-moon'"
            :aria-label="isDarkMode ? t('theme.light') : t('theme.dark')"
            :title="isDarkMode ? t('theme.light') : t('theme.dark')"
            square
            @click="toggleColorMode"
          />
          <USelect
            :model-value="locale"
            :items="localeOptions"
            class="w-28"
            color="neutral"
            variant="outline"
            @update:model-value="val => setLocale(val as 'zh-CN' | 'en')"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-1 gap-8 items-center my-auto">
          <div class="space-y-4">
            <AppLogo class="w-12 h-12 text-primary-500" />
            <p class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {{ t('app.eyebrow') }}
            </p>
            <h1 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-none">
              MyMatrix
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {{ t('app.tagline') }}
            </p>
          </div>

          <!-- Vault Illustration -->
          <div class="hidden md:block lg:block w-72 lg:w-80 justify-self-center lg:justify-self-end">
            <svg
              viewBox="0 0 520 360"
              class="w-full h-auto drop-shadow-xl"
              role="img"
            >
              <defs>
                <linearGradient
                  id="vaultPanel"
                  x1="108"
                  x2="424"
                  y1="66"
                  y2="296"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FFFFFF" />
                  <stop
                    offset="1"
                    stop-color="#F1F5F9"
                  />
                </linearGradient>
                <linearGradient
                  id="vaultAccent"
                  x1="134"
                  x2="392"
                  y1="114"
                  y2="258"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#4F46E5" />
                  <stop
                    offset="1"
                    stop-color="#14B8A6"
                  />
                </linearGradient>
              </defs>

              <path
                class="stroke-slate-200 dark:stroke-slate-700 fill-none stroke-2"
                stroke-dasharray="4 4"
                d="M94 198c42-80 118-124 210-116 78 7 128 48 150 98"
              />
              <path
                class="stroke-slate-200 dark:stroke-slate-700 fill-none stroke-2"
                stroke-dasharray="4 4"
                d="M78 238c74 46 174 60 260 18 54-26 84-66 98-110"
              />

              <g>
                <rect
                  class="fill-white dark:fill-slate-800"
                  x="112"
                  y="76"
                  width="296"
                  height="212"
                  rx="18"
                  stroke="#E2E8F0"
                  stroke-width="1"
                />
                <rect
                  class="fill-slate-50 dark:fill-slate-900"
                  x="132"
                  y="100"
                  width="256"
                  height="164"
                  rx="14"
                  stroke="#E2E8F0"
                  stroke-width="1"
                />
                <rect
                  class="fill-slate-200 dark:fill-slate-700"
                  x="154"
                  y="122"
                  width="92"
                  height="12"
                  rx="6"
                />
                <rect
                  class="fill-slate-100 dark:fill-slate-800"
                  x="154"
                  y="148"
                  width="72"
                  height="8"
                  rx="4"
                />
                <rect
                  class="fill-slate-100 dark:fill-slate-800"
                  x="154"
                  y="166"
                  width="108"
                  height="8"
                  rx="4"
                />
                <rect
                  class="fill-slate-100 dark:fill-slate-800"
                  x="154"
                  y="184"
                  width="86"
                  height="8"
                  rx="4"
                />

                <circle
                  cx="318"
                  cy="180"
                  r="52"
                  fill="url(#vaultAccent)"
                  opacity=".12"
                />
                <circle
                  cx="318"
                  cy="180"
                  r="38"
                  fill="none"
                  stroke="url(#vaultAccent)"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="154 90"
                />
                <path
                  d="M302 180l12 12 24-28"
                  fill="none"
                  stroke="#10B981"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="8"
                />
              </g>

              <g class="drop-shadow-lg">
                <rect
                  class="fill-white dark:fill-slate-850"
                  x="62"
                  y="198"
                  width="132"
                  height="82"
                  rx="14"
                  stroke="#E2E8F0"
                  stroke-width="1"
                />
                <circle
                  cx="88"
                  cy="226"
                  r="12"
                  class="fill-indigo-50 dark:fill-indigo-950/40"
                />
                <path
                  d="M84 226h8M88 222v8"
                  class="stroke-indigo-600 dark:stroke-indigo-400"
                  stroke-linecap="round"
                  stroke-width="2.6"
                />
                <rect
                  class="fill-slate-200 dark:fill-slate-700"
                  x="112"
                  y="218"
                  width="54"
                  height="8"
                  rx="4"
                />
                <rect
                  class="fill-slate-100 dark:fill-slate-800"
                  x="88"
                  y="248"
                  width="78"
                  height="7"
                  rx="3.5"
                />
              </g>

              <g class="drop-shadow-lg">
                <rect
                  class="fill-white dark:fill-slate-850"
                  x="336"
                  y="48"
                  width="118"
                  height="78"
                  rx="14"
                  stroke="#E2E8F0"
                  stroke-width="1"
                />
                <path
                  d="M372 92V78a23 23 0 0 1 46 0v14"
                  fill="none"
                  class="stroke-teal-500"
                  stroke-linecap="round"
                  stroke-width="7"
                />
                <rect
                  x="360"
                  y="86"
                  width="70"
                  height="28"
                  rx="9"
                  class="fill-teal-50 dark:fill-teal-950/40"
                />
                <circle
                  cx="395"
                  cy="100"
                  r="4"
                  class="fill-teal-600 dark:fill-teal-400"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- Auth Form Card -->
      <form
        class="flex flex-col justify-center gap-6 p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        @submit.prevent="$emit('submit')"
      >
        <!-- Toggle Mode -->
        <div class="flex p-1 border border-slate-200 dark:border-slate-850 rounded-lg bg-slate-50 dark:bg-slate-950">
          <UButton
            type="button"
            class="flex-1 justify-center font-semibold text-xs"
            :variant="authMode === 'login' ? 'solid' : 'ghost'"
            :color="authMode === 'login' ? 'primary' : 'neutral'"
            @click="authMode = 'login'"
          >
            {{ t('auth.login') }}
          </UButton>
          <UButton
            type="button"
            class="flex-1 justify-center font-semibold text-xs"
            :variant="authMode === 'register' ? 'solid' : 'ghost'"
            :color="authMode === 'register' ? 'primary' : 'neutral'"
            @click="authMode = 'register'"
          >
            {{ t('auth.register') }}
          </UButton>
        </div>

        <!-- Inputs -->
        <div class="space-y-4">
          <UFormField
            :label="t('auth.username')"
            required
            size="md"
          >
            <UInput
              v-model="authForm.username"
              type="text"
              autocomplete="username"
              required
              class="w-full"
              :placeholder="t('placeholders.username')"
            />
          </UFormField>

          <UFormField
            :label="t('auth.password')"
            required
            size="md"
          >
            <UInput
              v-model="authForm.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              minlength="10"
              required
              class="w-full"
              :placeholder="t('placeholders.password')"
            >
              <template #trailing>
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  square
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>
        </div>

        <UAlert
          v-if="authError"
          color="error"
          variant="subtle"
          :title="authError"
          icon="i-lucide-alert-circle"
        />

        <UButton
          type="submit"
          block
          size="md"
          color="primary"
          :disabled="loading"
          class="justify-center py-2.5 font-bold"
        >
          {{ authMode === 'login' ? t('auth.login') : t('auth.createUser') }}
        </UButton>
      </form>
    </section>
  </main>
</template>
