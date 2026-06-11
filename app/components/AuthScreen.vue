<script setup lang="ts">
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
const { startThemeTransition } = useThemeTransition()
const themeMode = ref<'light' | 'dark'>('light')
const themeClass = computed(() => `theme-${themeMode.value}`)

onMounted(() => {
  const savedTheme = localStorage.getItem('mymatrix_theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setThemeMode(savedTheme)
    return
  }
  setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
})

async function changeLocale(code: 'zh-CN' | 'en') {
  await setLocale(code)
}

async function handleLocaleChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  await changeLocale(target.value as 'zh-CN' | 'en')
}

function toggleTheme() {
  startThemeTransition()
  setThemeMode(themeMode.value === 'dark' ? 'light' : 'dark')
  localStorage.setItem('mymatrix_theme', themeMode.value)
}

function setThemeMode(mode: 'light' | 'dark') {
  themeMode.value = mode
  document.documentElement.classList.toggle('theme-dark', mode === 'dark')
  document.documentElement.classList.toggle('theme-light', mode === 'light')
  document.documentElement.style.colorScheme = mode
}
</script>

<template>
  <main
    class="auth-page"
    :class="themeClass"
  >
    <section class="auth-layout">
      <div class="intro-panel">
        <div class="intro-actions">
          <button
            class="theme-toggle-button"
            type="button"
            :aria-label="themeMode === 'dark' ? t('theme.light') : t('theme.dark')"
            :title="themeMode === 'dark' ? t('theme.light') : t('theme.dark')"
            @click="toggleTheme"
          >
            <svg
              v-if="themeMode === 'dark'"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
              />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 12.8A8 8 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z" />
            </svg>
          </button>
          <label class="language-switch">
            <select
              :value="locale"
              @change="handleLocaleChange"
            >
              <option
                v-for="item of availableLocales"
                :key="item.code"
                :value="item.code"
              >
                {{ t(item.labelKey) }}
              </option>
            </select>
          </label>
        </div>

        <div class="intro-copy">
          <AppLogo class="intro-logo" />
          <p class="eyebrow">
            {{ t('app.eyebrow') }}
          </p>
          <h1>MyMatrix</h1>
          <p>{{ t('app.tagline') }}</p>
        </div>

        <div class="feature-grid">
          <span>{{ t('summary.websites') }}</span>
          <span>{{ t('summary.domains') }}</span>
          <span>{{ t('summary.servers') }}</span>
          <span>{{ t('summary.authenticators') }}</span>
          <span>{{ t('summary.backupCodes') }}</span>
        </div>
      </div>

      <form
        class="auth-card"
        @submit.prevent="$emit('submit')"
      >
        <div class="mode-switch">
          <button
            type="button"
            :class="{ active: authMode === 'login' }"
            @click="authMode = 'login'"
          >
            {{ t('auth.login') }}
          </button>
          <button
            type="button"
            :class="{ active: authMode === 'register' }"
            @click="authMode = 'register'"
          >
            {{ t('auth.register') }}
          </button>
        </div>

        <label>
          {{ t('auth.username') }}
          <input
            v-model="authForm.username"
            type="text"
            inputmode="text"
            autocomplete="username"
            required
          >
        </label>

        <label>
          {{ t('auth.password') }}
          <span class="password-field">
            <input
              v-model="authForm.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              minlength="10"
              required
            >
            <button
              type="button"
              class="icon-button"
              :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              :title="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="!showPassword"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m3 3 18 18" />
                <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8" />
                <path d="M7.1 7.1C4.2 8.8 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1" />
                <path d="M13.7 6.2c5 1 7.8 5.8 7.8 5.8a17 17 0 0 1-2.2 2.8" />
              </svg>
            </button>
          </span>
        </label>

        <p
          v-if="authError"
          class="error"
        >
          {{ authError }}
        </p>

        <button
          class="primary"
          type="submit"
          :disabled="loading"
        >
          {{ authMode === 'login' ? t('auth.login') : t('auth.createUser') }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 24px;
  color: #172033;
  background:
    radial-gradient(circle at 18% 12%, rgb(92 124 250 / 16%), transparent 28%),
    radial-gradient(circle at 84% 16%, rgb(20 184 166 / 11%), transparent 24%),
    #f5f7fb;
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  min-height: calc(100vh - 48px);
  overflow: hidden;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 24px 80px rgb(30 41 59 / 12%);
  backdrop-filter: blur(18px);
}

.intro-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 72%), rgb(239 244 255 / 86%)),
    linear-gradient(90deg, rgb(99 102 241 / 7%) 1px, transparent 1px),
    linear-gradient(0deg, rgb(99 102 241 / 7%) 1px, transparent 1px);
  background-size: auto, 36px 36px, 36px 36px;
}

.intro-actions,
.language-switch,
.mode-switch {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 5px;
  background: rgb(255 255 255 / 76%);
}

.intro-actions {
  align-self: flex-start;
}

.language-switch {
  color: #657287;
  font-size: 13px;
  font-weight: 760;
}

button {
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 10px 13px;
  color: #1f2937;
  font: inherit;
  font-weight: 760;
  background: transparent;
  cursor: pointer;
}

.language-switch select {
  width: auto;
  min-height: 30px;
  border: 0;
  border-radius: 6px;
  padding: 5px 28px 5px 9px;
  color: #1f2937;
  font: inherit;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.theme-toggle-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  min-height: 0;
  place-items: center;
  padding: 0;
}

.theme-toggle-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.mode-switch button.active {
  color: #fff;
  background: #4f46e5;
}

.eyebrow {
  margin: 0 0 12px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
  text-transform: uppercase;
}

.intro-logo {
  --app-logo-size: 52px;
  margin-bottom: 18px;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 64px;
  line-height: .94;
}

.intro-copy p:last-child {
  max-width: 620px;
  color: #5b667a;
  line-height: 1.8;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-width: 520px;
}

.feature-grid span {
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 12px;
  color: #334155;
  font-size: 13px;
  font-weight: 760;
  background: rgb(255 255 255 / 78%);
}

.auth-card {
  display: grid;
  align-content: center;
  gap: 16px;
  border-left: 1px solid #dce3ee;
  padding: 34px;
  background: #fff;
}

label:not(.language-switch) {
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 13px;
  font-weight: 760;
}

input {
  width: 100%;
  border: 1px solid #d3dce8;
  border-radius: 7px;
  padding: 12px 13px;
  color: #111827;
  font: inherit;
  background: #fbfcff;
  outline: none;
}

input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgb(79 70 229 / 14%);
}

.password-field {
  position: relative;
  display: block;
}

.password-field input {
  padding-right: 46px;
}

.icon-button {
  position: absolute;
  top: 50%;
  right: 6px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  color: #64748b;
  transform: translateY(-50%);
}

.icon-button svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.primary {
  min-height: 46px;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 16px 34px rgb(37 99 235 / 22%);
}

.error {
  margin: 0;
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 10px 12px;
  color: #991b1b;
  font-size: 13px;
  background: #fff1f2;
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .intro-panel,
  .auth-card {
    padding: 24px;
  }

  .auth-card {
    border-left: 0;
    border-top: 1px solid #dce3ee;
  }

  h1 {
    font-size: 48px;
  }
}

.auth-page.theme-dark {
  color: #e5e7eb;
  background:
    radial-gradient(circle at 18% 12%, rgb(99 102 241 / 12%), transparent 30%),
    radial-gradient(circle at 84% 16%, rgb(20 184 166 / 9%), transparent 28%),
    #020617;
}

.auth-page.theme-dark .auth-layout {
  border-color: #334155;
  background: rgb(15 23 42 / 74%);
  box-shadow: 0 24px 80px rgb(0 0 0 / 28%);
}

.auth-page.theme-dark .intro-panel {
  background:
    linear-gradient(135deg, rgb(15 23 42 / 82%), rgb(30 41 59 / 88%)),
    linear-gradient(90deg, rgb(148 163 184 / 8%) 1px, transparent 1px),
    linear-gradient(0deg, rgb(148 163 184 / 8%) 1px, transparent 1px);
  background-size: auto, 36px 36px, 36px 36px;
}

.auth-page.theme-dark .auth-card,
.auth-page.theme-dark .intro-actions,
.auth-page.theme-dark .language-switch,
.auth-page.theme-dark .mode-switch,
.auth-page.theme-dark input,
.auth-page.theme-dark .feature-grid span {
  border-color: #334155;
  background: rgb(15 23 42 / 88%);
}

.auth-page.theme-dark h1 {
  color: #f8fafc;
}

.auth-page.theme-dark label,
.auth-page.theme-dark .language-switch,
.auth-page.theme-dark .intro-copy p:last-child,
.auth-page.theme-dark .feature-grid span {
  color: #cbd5e1;
}

.auth-page.theme-dark button,
.auth-page.theme-dark input,
.auth-page.theme-dark .language-switch select {
  color: #e5e7eb;
}

.auth-page.theme-dark input,
.auth-page.theme-dark .language-switch select {
  background: #111827;
}

.auth-page.theme-dark input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}

.auth-page.theme-dark .mode-switch button.active,
.auth-page.theme-dark .primary {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb);
}

.auth-page.theme-dark .error {
  border-color: #7f1d1d;
  color: #fecaca;
  background: #2f1518;
}
</style>
