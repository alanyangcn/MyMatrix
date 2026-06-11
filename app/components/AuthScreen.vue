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

        <div class="intro-showcase">
          <div class="intro-copy">
            <AppLogo class="intro-logo" />
            <p class="eyebrow">
              {{ t('app.eyebrow') }}
            </p>
            <h1>MyMatrix</h1>
            <p>{{ t('app.tagline') }}</p>
          </div>

          <div
            class="vault-illustration"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 520 360"
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
                    stop-color="#E8EEF9"
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
                <filter
                  id="softShadow"
                  x="28"
                  y="34"
                  width="464"
                  height="294"
                  color-interpolation-filters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feDropShadow
                    dx="0"
                    dy="20"
                    flood-color="#1E293B"
                    flood-opacity=".14"
                    stdDeviation="18"
                  />
                </filter>
              </defs>

              <path
                class="illustration-orbit orbit-one"
                d="M94 198c42-80 118-124 210-116 78 7 128 48 150 98"
              />
              <path
                class="illustration-orbit orbit-two"
                d="M78 238c74 46 174 60 260 18 54-26 84-66 98-110"
              />

              <g filter="url(#softShadow)">
                <rect
                  x="112"
                  y="76"
                  width="296"
                  height="212"
                  rx="18"
                  fill="url(#vaultPanel)"
                />
                <rect
                  x="132"
                  y="100"
                  width="256"
                  height="164"
                  rx="14"
                  fill="#F8FAFC"
                  stroke="#D9E2EF"
                />
                <rect
                  x="154"
                  y="122"
                  width="92"
                  height="12"
                  rx="6"
                  fill="#CBD5E1"
                />
                <rect
                  x="154"
                  y="148"
                  width="72"
                  height="8"
                  rx="4"
                  fill="#E2E8F0"
                />
                <rect
                  x="154"
                  y="166"
                  width="108"
                  height="8"
                  rx="4"
                  fill="#E2E8F0"
                />
                <rect
                  x="154"
                  y="184"
                  width="86"
                  height="8"
                  rx="4"
                  fill="#E2E8F0"
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
                  stroke="#0F766E"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="8"
                />
              </g>

              <g class="floating-card floating-card-left">
                <rect
                  x="62"
                  y="198"
                  width="132"
                  height="82"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#D8E1ED"
                />
                <circle
                  cx="88"
                  cy="226"
                  r="12"
                  fill="#EEF2FF"
                />
                <path
                  d="M84 226h8M88 222v8"
                  stroke="#4F46E5"
                  stroke-linecap="round"
                  stroke-width="2.6"
                />
                <rect
                  x="112"
                  y="218"
                  width="54"
                  height="8"
                  rx="4"
                  fill="#CBD5E1"
                />
                <rect
                  x="88"
                  y="248"
                  width="78"
                  height="7"
                  rx="3.5"
                  fill="#E2E8F0"
                />
              </g>

              <g class="floating-card floating-card-right">
                <rect
                  x="336"
                  y="48"
                  width="118"
                  height="78"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#D8E1ED"
                />
                <path
                  d="M372 92V78a23 23 0 0 1 46 0v14"
                  fill="none"
                  stroke="#14B8A6"
                  stroke-linecap="round"
                  stroke-width="7"
                />
                <rect
                  x="360"
                  y="86"
                  width="70"
                  height="28"
                  rx="9"
                  fill="#CCFBF1"
                />
                <circle
                  cx="395"
                  cy="100"
                  r="4"
                  fill="#0F766E"
                />
              </g>
            </svg>
          </div>
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
  box-sizing: border-box;
  height: 100dvh;
  padding: 24px;
  overflow: hidden;
  color: #172033;
  background:
    radial-gradient(circle at 18% 12%, rgb(92 124 250 / 16%), transparent 28%),
    radial-gradient(circle at 84% 16%, rgb(20 184 166 / 11%), transparent 24%),
    #f5f7fb;
}

.auth-page *,
.auth-page *::before,
.auth-page *::after {
  box-sizing: border-box;
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  height: 100%;
  min-height: 0;
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

.intro-showcase {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(260px, .78fr);
  gap: clamp(20px, 4vw, 44px);
  align-items: center;
  min-height: 0;
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

.vault-illustration {
  width: min(100%, 430px);
  justify-self: end;
}

.vault-illustration svg {
  display: block;
  width: 100%;
  height: auto;
}

.illustration-orbit {
  fill: none;
  stroke-linecap: round;
  stroke-width: 2;
}

.orbit-one {
  stroke: rgb(79 70 229 / 22%);
}

.orbit-two {
  stroke: rgb(20 184 166 / 24%);
}

.floating-card {
  filter: drop-shadow(0 18px 24px rgb(30 41 59 / 12%));
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

  .intro-panel {
    justify-content: flex-start;
    gap: 18px;
  }

  .intro-showcase {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .vault-illustration {
    display: none;
  }

  .intro-logo {
    --app-logo-size: 40px;
    margin-bottom: 12px;
  }

  .intro-copy p:last-child {
    margin: 8px 0 0;
    line-height: 1.55;
  }

  .auth-card {
    border-left: 0;
    border-top: 1px solid #dce3ee;
  }

  h1 {
    font-size: 40px;
  }
}

@media (max-width: 520px) {
  .intro-copy p:last-child {
    display: none;
  }
}

@media (max-height: 720px) and (min-width: 901px) {
  .vault-illustration {
    width: min(100%, 340px);
  }

  .intro-logo {
    --app-logo-size: 46px;
    margin-bottom: 14px;
  }

  h1 {
    font-size: 54px;
  }

  .intro-copy p:last-child {
    line-height: 1.62;
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
.auth-page.theme-dark input {
  border-color: #334155;
  background: rgb(15 23 42 / 88%);
}

.auth-page.theme-dark h1 {
  color: #f8fafc;
}

.auth-page.theme-dark label,
.auth-page.theme-dark .language-switch,
.auth-page.theme-dark .intro-copy p:last-child {
  color: #cbd5e1;
}

.auth-page.theme-dark .vault-illustration rect[fill="#FFFFFF"],
.auth-page.theme-dark .vault-illustration rect[fill="#F8FAFC"] {
  fill: #111827;
}

.auth-page.theme-dark .vault-illustration rect[stroke="#D8E1ED"],
.auth-page.theme-dark .vault-illustration rect[stroke="#D9E2EF"] {
  stroke: #334155;
}

.auth-page.theme-dark .vault-illustration rect[fill="#CBD5E1"],
.auth-page.theme-dark .vault-illustration rect[fill="#E2E8F0"] {
  fill: #475569;
}

.auth-page.theme-dark .vault-illustration circle[fill="#EEF2FF"] {
  fill: #1e293b;
}

.auth-page.theme-dark .vault-illustration circle[fill="#CCFBF1"],
.auth-page.theme-dark .vault-illustration rect[fill="#CCFBF1"] {
  fill: #134e4a;
}

.auth-page.theme-dark .floating-card {
  filter: drop-shadow(0 18px 24px rgb(0 0 0 / 24%));
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
