<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type User = {
  id: number
  username: string
  displayName: string
  role: string
  avatarUrl?: string
}

type Authenticator = {
  id: number
  issuer: string
  accountName: string
  secret: string
  notes: string
}

type BackupCodeSet = {
  id: number
  provider: string
  accountName: string
  codes: string
  notes: string
}

type ServerRecord = {
  id: number
  name: string
  provider: string | null
  ipAddress: string
  loginName: string | null
  panelUrl: string | null
  expiresAt: number | null
  remindAt: number | null
  notes: string | null
}

type DomainRecord = {
  id: number
  domain: string
  registrar: string | null
  accountName: string | null
  expiresAt: number | null
  autoRenew: boolean
  notes: string | null
}

type WebsiteAccountRecord = {
  id: number
  websiteId: number
  accountName: string
  loginIdentifier: string | null
  notes: string | null
}

type WebsiteRecord = {
  id: number
  name: string
  url: string | null
  notes: string | null
  accounts: WebsiteAccountRecord[]
}

type PendingDelete = {
  endpoint: string
  id: number
  name: string
}

const { t, locale, setLocale } = useI18n()
const activeTab = defineModel<'websites' | 'authenticators' | 'backupCodes' | 'servers' | 'domains'>('activeTab', { required: true })

const props = defineProps<{
  user: User
  authenticators: Authenticator[]
  backupCodes: BackupCodeSet[]
  servers: ServerRecord[]
  domains: DomainRecord[]
  websites: WebsiteRecord[]
}>()

const emit = defineEmits<{
  logout: []
  addAuthenticator: [payload: { issuer: string, accountName: string, secret: string, notes: string }]
  updateAuthenticator: [id: number, payload: { issuer: string, accountName: string, secret: string, notes: string }]
  addBackupCodes: [payload: { provider: string, accountName: string, codes: string, notes: string }]
  updateBackupCodes: [id: number, payload: { provider: string, accountName: string, codes: string, notes: string }]
  addServer: [payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }]
  updateServer: [id: number, payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }]
  addDomain: [payload: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }]
  updateDomain: [id: number, payload: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }]
  addWebsite: [payload: { name: string, url: string, notes: string }]
  updateWebsite: [id: number, payload: { name: string, url: string, notes: string }]
  addWebsiteAccount: [payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  updateWebsiteAccount: [id: number, payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  removeRecord: [endpoint: string, id: number]
}>()

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

const languageDropdownRef = ref<HTMLElement | null>(null)
const isLanguageDropdownOpen = ref(false)

function toggleLanguageDropdown() {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
}

function closeLanguageDropdown() {
  isLanguageDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (
    languageDropdownRef.value
    && !languageDropdownRef.value.contains(event.target as Node)
  ) {
    closeLanguageDropdown()
  }
}

async function selectLocale(code: 'zh-CN' | 'en') {
  await changeLocale(code)
  closeLanguageDropdown()
}

const { startThemeTransition } = useThemeTransition()
const themeMode = ref<'light' | 'dark'>('light')
const themeClass = computed(() => `theme-${themeMode.value}`)

const pendingDelete = ref<PendingDelete | null>(null)

onMounted(() => {
  const savedTheme = localStorage.getItem('mymatrix_theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setThemeMode(savedTheme)
  }
  else {
    setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})

async function changeLocale(code: 'zh-CN' | 'en') {
  await setLocale(code)
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

function requestRemoveRecord(endpoint: string, id: number, name: string) {
  pendingDelete.value = { endpoint, id, name }
}

function closeDeleteConfirm() {
  pendingDelete.value = null
}

function confirmRemoveRecord() {
  if (!pendingDelete.value) return
  emit('removeRecord', pendingDelete.value.endpoint, pendingDelete.value.id)
  pendingDelete.value = null
}
</script>

<template>
  <main
    class="dashboard-page"
    :class="themeClass"
  >
    <div class="dashboard-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <AppLogo />
          <h1>MyMatrix</h1>
        </div>
        <div class="top-actions">
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
          <div
            ref="languageDropdownRef"
            class="lang-dropdown-wrapper"
            :class="{ open: isLanguageDropdownOpen }"
          >
            <button
              class="lang-toggle-btn"
              type="button"
              :aria-label="t('language.switch')"
              @click="toggleLanguageDropdown"
            >
              <svg
                class="lang-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>{{ t(availableLocales.find(item => item.code === locale)?.labelKey || 'language.zh') }}</span>
              <svg
                class="dropdown-chevron"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="m6 9 6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <div
              v-show="isLanguageDropdownOpen"
              class="lang-dropdown-menu"
            >
              <button
                v-for="item of availableLocales"
                :key="item.code"
                type="button"
                class="lang-dropdown-item"
                :class="{ active: locale === item.code }"
                @click="selectLocale(item.code)"
              >
                {{ t(item.labelKey) }}
              </button>
            </div>
          </div>
          <span class="user-pill">
            <span class="user-avatar">
              <img
                v-if="user.avatarUrl"
                :src="user.avatarUrl"
                alt=""
              >
              <span v-else>{{ userInitial }}</span>
            </span>
            <span class="user-name">{{ userDisplayName }}</span>
          </span>
          <button
            class="logout-button"
            type="button"
            :aria-label="t('auth.logout')"
            :title="t('auth.logout')"
            @click="$emit('logout')"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
            </svg>
          </button>
        </div>
      </header>

      <section class="workspace">
        <nav class="tabs">
          <button
            :class="{ active: activeTab === 'websites' }"
            @click="activeTab = 'websites'"
          >
            <span>{{ t('tabs.websites') }}</span>
            <strong>{{ websites.length }}</strong>
          </button>
          <button
            :class="{ active: activeTab === 'domains' }"
            @click="activeTab = 'domains'"
          >
            <span>{{ t('tabs.domains') }}</span>
            <strong>{{ domains.length }}</strong>
          </button>
          <button
            :class="{ active: activeTab === 'servers' }"
            @click="activeTab = 'servers'"
          >
            <span>{{ t('tabs.servers') }}</span>
            <strong>{{ servers.length }}</strong>
          </button>
          <button
            :class="{ active: activeTab === 'authenticators' }"
            @click="activeTab = 'authenticators'"
          >
            <span>{{ t('tabs.authenticators') }}</span>
            <strong>{{ authenticators.length }}</strong>
          </button>
          <button
            :class="{ active: activeTab === 'backupCodes' }"
            @click="activeTab = 'backupCodes'"
          >
            <span>{{ t('tabs.backupCodes') }}</span>
            <strong>{{ backupCodes.length }}</strong>
          </button>
        </nav>

        <section class="vault-panel">
          <Transition
            name="tab-panel"
            mode="out-in"
          >
            <WebsitesPanel
              v-if="activeTab === 'websites'"
              key="websites"
              :websites="websites"
              @add-website="payload => emit('addWebsite', payload)"
              @update-website="(id, payload) => emit('updateWebsite', id, payload)"
              @add-website-account="payload => emit('addWebsiteAccount', payload)"
              @update-website-account="(id, payload) => emit('updateWebsiteAccount', id, payload)"
              @remove-record="requestRemoveRecord"
            />
            <DomainsPanel
              v-else-if="activeTab === 'domains'"
              key="domains"
              :domains="domains"
              @add-domain="payload => emit('addDomain', payload)"
              @update-domain="(id, payload) => emit('updateDomain', id, payload)"
              @remove-record="requestRemoveRecord"
            />
            <ServersPanel
              v-else-if="activeTab === 'servers'"
              key="servers"
              :servers="servers"
              @add-server="payload => emit('addServer', payload)"
              @update-server="(id, payload) => emit('updateServer', id, payload)"
              @remove-record="requestRemoveRecord"
            />
            <AuthenticatorsPanel
              v-else-if="activeTab === 'authenticators'"
              key="authenticators"
              :authenticators="authenticators"
              @add-authenticator="payload => emit('addAuthenticator', payload)"
              @update-authenticator="(id, payload) => emit('updateAuthenticator', id, payload)"
              @remove-record="requestRemoveRecord"
            />
            <BackupCodesPanel
              v-else-if="activeTab === 'backupCodes'"
              key="backupCodes"
              :backup-codes="backupCodes"
              @add-backup-codes="payload => emit('addBackupCodes', payload)"
              @update-backup-codes="(id, payload) => emit('updateBackupCodes', id, payload)"
              @remove-record="requestRemoveRecord"
            />
          </Transition>
        </section>
      </section>
    </div>

    <AppModal
      :open="Boolean(pendingDelete)"
      :title="t('actions.confirmDeleteTitle')"
      @close="closeDeleteConfirm"
    >
      <div class="confirm-dialog">
        <p>
          {{ t('actions.confirmDeleteMessage', { name: pendingDelete?.name || '' }) }}
        </p>
        <div class="confirm-actions">
          <AppButton
            size="sm"
            type="button"
            @click="closeDeleteConfirm"
          >
            {{ t('actions.cancel') }}
          </AppButton>
          <AppButton
            size="sm"
            type="button"
            variant="danger"
            @click="confirmRemoveRecord"
          >
            {{ t('actions.confirmDelete') }}
          </AppButton>
        </div>
      </div>
    </AppModal>
  </main>
</template>

<style>
.dashboard-page {
  min-height: 100vh;
  padding: 0 24px 24px;
  overflow-x: hidden;
  color: #151b23;
  background:
    radial-gradient(circle at 0% 0%, rgb(79 70 229 / 10%), transparent 28%),
    radial-gradient(circle at 100% 6%, rgb(37 99 235 / 10%), transparent 24%),
    #f4f7fb;
}

.dashboard-page *,
.dashboard-page *::before,
.dashboard-page *::after {
  box-sizing: border-box;
}

.dashboard-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1180px;
  height: 68px;
  border-bottom: 1px solid #dbe2ec;
  padding: 12px 24px;
  margin: 0 auto;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 8px;
}

h1 {
  color: #101828;
  font-size: 24px;
  letter-spacing: 0;
}

.top-actions,
.lang-dropdown-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 38px;
  border: 1px solid #d1d9e4;
  border-radius: 8px;
  padding: 0 14px 0 6px;
  color: #354253;
  font-size: 13px;
  font-weight: 760;
  background: rgb(255 255 255 / 88%);
}

.user-avatar {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  margin-right: 8px;
  overflow: hidden;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

button:not(.app-icon-button) {
  border: 1px solid #d1d9e4;
  border-radius: 7px;
  padding: 10px 13px;
  color: #1d2937;
  font: inherit;
  font-weight: 760;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
}

button:not(.app-icon-button):hover {
  border-color: #98a7bb;
}

button:not(.app-icon-button):disabled {
  cursor: not-allowed;
  opacity: .6;
}

.lang-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.lang-toggle-btn {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 38px;
  border: 1px solid #d1d9e4;
  border-radius: 8px;
  padding: 0 12px;
  color: #526071;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 760;
  transition: border-color 0.2s, background-color 0.2s;
  outline: none;
}

.lang-toggle-btn:hover {
  border-color: #98a7bb;
  background: #f8fafc;
}

.lang-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
  margin-right: 6px;
  flex-shrink: 0;
}

.lang-toggle-btn .dropdown-chevron {
  width: 14px;
  height: 14px;
  margin-left: 6px;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.lang-dropdown-wrapper.open .dropdown-chevron {
  transform: rotate(180deg);
}

.lang-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 150;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  border: 1px solid var(--ui-border, #dbe2ec);
  border-radius: 8px;
  padding: 4px;
  background: var(--ui-panel-bg-strong, #fff);
  box-shadow: 0 10px 24px rgb(15 23 42 / 12%);
}

@media (max-width: 900px) {
  .lang-dropdown-menu {
    left: 0;
    right: 0;
  }
}

.lang-dropdown-wrapper button.lang-dropdown-item {
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--ui-text, #151b23);
  font: inherit;
  font-size: 13px;
  font-weight: 760;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s, color 0.15s;
}

.lang-dropdown-wrapper button.lang-dropdown-item:hover {
  border: 0;
  color: var(--ui-accent-text, #3730a3);
  background: var(--ui-accent-soft, #eef2ff);
}

.lang-dropdown-wrapper button.lang-dropdown-item.active {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
}

button.theme-toggle-button,
button.logout-button {
  display: inline-grid;
  width: 38px;
  height: 38px;
  min-height: 0;
  place-items: center;
  border: 1px solid #d1d9e4;
  border-radius: 8px;
  padding: 0;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

button.theme-toggle-button:hover,
button.logout-button:hover {
  border-color: #98a7bb;
  background: #f8fafc;
}

.theme-toggle-button svg,
.logout-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.workspace {
  display: block;
  padding-top: 80px;
}

.vault-panel {
  min-width: 0;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 18px 42px rgb(30 41 59 / 8%);
  padding: 18px;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(110px, 1fr));
  gap: 6px;
  overflow-x: auto;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  padding: 5px;
  margin-bottom: 12px;
  background: #f1f5fb;
}

.tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 48px;
  border-color: transparent;
  background: transparent;
  white-space: normal;
  overflow-wrap: anywhere;
}

.tabs button.active {
  border-color: #cfd9ff;
  color: #3730a3;
  background: #fff;
  box-shadow: 0 10px 24px rgb(79 70 229 / 12%);
}

.tabs strong {
  min-width: 24px;
  border-radius: 999px;
  padding: 2px 7px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.5;
  background: #e5eaf2;
}

.tabs button.active strong {
  color: #fff;
  background: #4f46e5;
}

.confirm-dialog {
  display: grid;
  gap: 16px;
}

.confirm-dialog p {
  margin: 0;
  color: #5f6d7e;
  line-height: 1.7;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Transitions */
.tab-panel-enter-active,
.tab-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 1000px) {
  .top-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar {
    align-items: flex-start;
    height: auto;
  }

  .workspace {
    padding-top: 150px;
  }

  .entry-form,
  .record-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-page {
    padding: 0 16px 16px;
  }

  .topbar {
    padding: 12px 16px;
  }

  .workspace {
    padding-top: 190px;
  }

  .tabs {
    grid-template-columns: 1fr;
  }

  .top-actions {
    width: 100%;
  }

  .user-pill,
  .lang-dropdown-wrapper {
    width: 100%;
  }

  .top-actions > .theme-toggle-button,
  .top-actions > .logout-button {
    width: 38px;
    height: 38px;
  }

  .primary {
    justify-self: stretch;
  }

  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .list-toolbar > div,
  .list-toolbar .compact-button {
    width: 100%;
  }

  .list-toolbar .round-icon-button {
    width: 36px;
  }
}

/* Dark mode styling overrides */
.dashboard-page.theme-dark {
  color: #e5e7eb;
  background:
    radial-gradient(circle at 0% 0%, rgb(79 70 229 / 12%), transparent 30%),
    radial-gradient(circle at 100% 6%, rgb(14 165 233 / 10%), transparent 28%),
    #020617;
}

.dashboard-page.theme-dark .topbar,
.dashboard-page.theme-dark .vault-panel,
.dashboard-page.theme-dark .website-card,
.dashboard-page.theme-dark .account-card,
.dashboard-page.theme-dark .domain-card {
  border-color: #334155;
  background: rgb(15 23 42 / 92%);
  box-shadow: 0 18px 42px rgb(0 0 0 / 22%);
}

.dashboard-page.theme-dark h1,
.dashboard-page.theme-dark .list-toolbar h2,
.dashboard-page.theme-dark .website-card-main strong,
.dashboard-page.theme-dark .account-card strong,
.dashboard-page.theme-dark .domain-card-main strong {
  color: #f8fafc;
}

.dashboard-page.theme-dark button:not(.app-icon-button),
.dashboard-page.theme-dark .lang-toggle-btn,
.dashboard-page.theme-dark .user-pill,
.dashboard-page.theme-dark .website-pill {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

.dashboard-page.theme-dark .tabs {
  border-color: #334155;
  background: #111827;
}

.dashboard-page.theme-dark .tabs button.active,
.dashboard-page.theme-dark .website-pill.active,
.dashboard-page.theme-dark .website-card.active {
  border-color: #818cf8;
  color: #c7d2fe;
  background: #1e293b;
}

.dashboard-page.theme-dark .tabs strong,
.dashboard-page.theme-dark .all-site-icon,
.dashboard-page.theme-dark .website-card-logo,
.dashboard-page.theme-dark .domain-card-main span {
  color: #c7d2fe;
  background: #312e81;
}

.dashboard-page.theme-dark .website-pill img,
.dashboard-page.theme-dark .account-card-site img,
.dashboard-page.theme-dark .website-card-logo img {
  background: #1e293b;
}

.dashboard-page.theme-dark .tabs button.active strong,
.dashboard-page.theme-dark .primary {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb);
}

.dashboard-page.theme-dark .website-card-main a,
.dashboard-page.theme-dark .website-card-note,
.dashboard-page.theme-dark .account-card span,
.dashboard-page.theme-dark .account-card p,
.dashboard-page.theme-dark .confirm-dialog p,
.dashboard-page.theme-dark .domain-card-meta span,
.dashboard-page.theme-dark .domain-card a,
.dashboard-page.theme-dark .domain-card p,
.dashboard-page.theme-dark .empty-state {
  color: #cbd5e1;
}

.dashboard-page.theme-dark .danger {
  border-color: #7f1d1d;
  color: #fecaca;
  background: #2f1518;
}

.dashboard-page.theme-dark button.theme-toggle-button:hover,
.dashboard-page.theme-dark button.logout-button:hover,
.dashboard-page.theme-dark .lang-toggle-btn:hover {
  border-color: #475569;
  background: #1e293b;
}

.dashboard-page.theme-dark .lang-dropdown-menu {
  box-shadow: 0 10px 24px rgb(0 0 0 / 36%);
}

/* Base styles for sub-components (unscoped) */
button.primary {
  justify-self: end;
  min-height: 42px;
  border-color: #4f46e5;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 14px 30px rgb(79 70 229 / 20%);
}

button.primary:hover {
  border-color: #4338ca;
  box-shadow: 0 16px 36px rgb(79 70 229 / 26%);
}

button.compact-button {
  min-height: 36px;
  padding: 8px 12px;
  font-size: 13px;
  box-shadow: 0 10px 20px rgb(79 70 229 / 16%);
}

button.round-icon-button {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  min-height: 0;
  border-radius: 8px;
  padding: 0;
  border: 1px solid #d1d9e4;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

button.round-icon-button:hover {
  border-color: #98a7bb;
  background: #f8fafc;
}

button.round-icon-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.empty-state {
  margin: 0;
  padding: 18px;
  color: #697789;
  text-align: center;
}

.modal-form {
  display: grid;
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-field span {
  font-size: 13px;
  font-weight: 600;
  color: #354253;
}

input,
select,
textarea {
  width: 100%;
  min-height: 38px;
  border: 1px solid #d1d9e4;
  border-radius: 8px;
  padding: 8px 12px;
  font: inherit;
  font-size: 14px;
  background: #fff;
  outline: none;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

code,
pre {
  overflow: auto;
  max-width: 100%;
  margin: 0;
  border: 1px solid #dde4eb;
  border-radius: 7px;
  padding: 8px;
  color: #233142;
  background: #f3f6f9;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

/* Dark mode overrides for child components */
.dashboard-page.theme-dark button:not(.app-icon-button),
.dashboard-page.theme-dark input,
.dashboard-page.theme-dark textarea,
.dashboard-page.theme-dark select,
.dashboard-page.theme-dark code,
.dashboard-page.theme-dark pre {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

.dashboard-page.theme-dark button.round-icon-button {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

.dashboard-page.theme-dark button.round-icon-button:hover {
  border-color: #475569;
  background: #1e293b;
}

.dashboard-page.theme-dark input:focus,
.dashboard-page.theme-dark textarea:focus,
.dashboard-page.theme-dark select:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}

.dashboard-page.theme-dark option {
  color: #e5e7eb;
  background: #0f172a;
}

.dashboard-page.theme-dark code,
.dashboard-page.theme-dark pre {
  border-color: #334155;
  background: #111827;
}

.dashboard-page.theme-dark button.primary {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb);
}
</style>
