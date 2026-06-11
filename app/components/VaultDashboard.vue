<script setup lang="ts">
type User = {
  id: number
  username: string
  displayName: string
  role: string
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
const authenticatorForm = defineModel<{ issuer: string, accountName: string, secret: string, notes: string }>('authenticatorForm', { required: true })
const backupCodeForm = defineModel<{ provider: string, accountName: string, codes: string, notes: string }>('backupCodeForm', { required: true })
const serverForm = defineModel<{
  name: string
  provider: string
  ipAddress: string
  loginName: string
  panelUrl: string
  expiresAt: string
  remindAt: string
  notes: string
}>('serverForm', { required: true })
const domainForm = defineModel<{
  domain: string
  registrar: string
  accountName: string
  expiresAt: string
  autoRenew: boolean
  notes: string
}>('domainForm', { required: true })
const websiteForm = defineModel<{ name: string, url: string, notes: string }>('websiteForm', { required: true })
const websiteAccountForm = defineModel<{
  websiteId: number
  accountName: string
  loginIdentifier: string
  notes: string
}>('websiteAccountForm', { required: true })

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
  addAuthenticator: []
  updateAuthenticator: [id: number]
  addBackupCodes: []
  updateBackupCodes: [id: number]
  addServer: []
  updateServer: [id: number]
  addDomain: []
  updateDomain: [id: number]
  addWebsite: []
  updateWebsite: [id: number]
  addWebsiteAccount: []
  updateWebsiteAccount: [id: number]
  removeRecord: [endpoint: string, id: number]
}>()

const availableLocales = [
  { code: 'zh-CN', labelKey: 'language.zh' },
  { code: 'en', labelKey: 'language.en' },
] as const
const { startThemeTransition } = useThemeTransition()
const themeMode = ref<'light' | 'dark'>('light')
const themeClass = computed(() => `theme-${themeMode.value}`)
const showWebsiteForm = ref(false)
const showWebsiteAccountForm = ref(false)
const showDomainForm = ref(false)
const showServerForm = ref(false)
const showAuthenticatorForm = ref(false)
const showBackupCodeForm = ref(false)
const editingServerId = ref<number | null>(null)
const editingDomainId = ref<number | null>(null)
const editingWebsiteId = ref<number | null>(null)
const editingWebsiteAccountId = ref<number | null>(null)
const editingAuthenticatorId = ref<number | null>(null)
const editingBackupCodeId = ref<number | null>(null)
const selectedWebsiteId = ref<number | 'all'>('all')
const websiteViewMode = ref<'pills' | 'cards'>('pills')
const pendingDelete = ref<PendingDelete | null>(null)

const visibleWebsiteAccounts = computed(() => {
  return props.websites
    .filter(site => selectedWebsiteId.value === 'all' || site.id === selectedWebsiteId.value)
    .flatMap(site => site.accounts.map(account => ({ ...account, website: site })))
})

watch(() => props.websites.map(site => site.id), (ids) => {
  if (selectedWebsiteId.value !== 'all' && !ids.includes(selectedWebsiteId.value)) {
    selectedWebsiteId.value = 'all'
  }
})

onMounted(() => {
  const savedTheme = localStorage.getItem('mymatrix_theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setThemeMode(savedTheme)
    return
  }
  setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
})

function formatDate(value: number | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale.value)
}

function toDateInputValue(value: number | null) {
  if (!value) return ''
  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

function submitAuthenticatorForm() {
  showAuthenticatorForm.value = false
  if (editingAuthenticatorId.value) {
    emit('updateAuthenticator', editingAuthenticatorId.value)
    editingAuthenticatorId.value = null
    return
  }
  emit('addAuthenticator')
}

function resetAuthenticatorForm() {
  Object.assign(authenticatorForm.value, {
    issuer: '',
    accountName: '',
    secret: '',
    notes: '',
  })
}

function openAddAuthenticatorForm() {
  editingAuthenticatorId.value = null
  resetAuthenticatorForm()
  showAuthenticatorForm.value = true
}

function openEditAuthenticatorForm(item: Authenticator) {
  editingAuthenticatorId.value = item.id
  Object.assign(authenticatorForm.value, {
    issuer: item.issuer,
    accountName: item.accountName,
    secret: item.secret,
    notes: item.notes || '',
  })
  showAuthenticatorForm.value = true
}

function closeAuthenticatorForm() {
  showAuthenticatorForm.value = false
  editingAuthenticatorId.value = null
  resetAuthenticatorForm()
}

function submitBackupCodeForm() {
  showBackupCodeForm.value = false
  if (editingBackupCodeId.value) {
    emit('updateBackupCodes', editingBackupCodeId.value)
    editingBackupCodeId.value = null
    return
  }
  emit('addBackupCodes')
}

function resetBackupCodeForm() {
  Object.assign(backupCodeForm.value, {
    provider: '',
    accountName: '',
    codes: '',
    notes: '',
  })
}

function openAddBackupCodeForm() {
  editingBackupCodeId.value = null
  resetBackupCodeForm()
  showBackupCodeForm.value = true
}

function openEditBackupCodeForm(item: BackupCodeSet) {
  editingBackupCodeId.value = item.id
  Object.assign(backupCodeForm.value, {
    provider: item.provider,
    accountName: item.accountName,
    codes: item.codes,
    notes: item.notes || '',
  })
  showBackupCodeForm.value = true
}

function closeBackupCodeForm() {
  showBackupCodeForm.value = false
  editingBackupCodeId.value = null
  resetBackupCodeForm()
}

function submitDomainForm() {
  showDomainForm.value = false
  if (editingDomainId.value) {
    emit('updateDomain', editingDomainId.value)
    editingDomainId.value = null
    return
  }
  emit('addDomain')
}

function submitServerForm() {
  showServerForm.value = false
  if (editingServerId.value) {
    emit('updateServer', editingServerId.value)
    editingServerId.value = null
    return
  }
  emit('addServer')
}

function resetServerForm() {
  Object.assign(serverForm.value, {
    name: '',
    provider: '',
    ipAddress: '',
    loginName: '',
    panelUrl: '',
    expiresAt: '',
    remindAt: '',
    notes: '',
  })
}

function openAddServerForm() {
  editingServerId.value = null
  resetServerForm()
  showServerForm.value = true
}

function openEditServerForm(server: ServerRecord) {
  editingServerId.value = server.id
  Object.assign(serverForm.value, {
    name: server.name,
    provider: server.provider || '',
    ipAddress: server.ipAddress,
    loginName: server.loginName || '',
    panelUrl: server.panelUrl || '',
    expiresAt: toDateInputValue(server.expiresAt),
    remindAt: toDateInputValue(server.remindAt),
    notes: server.notes || '',
  })
  showServerForm.value = true
}

function closeServerForm() {
  showServerForm.value = false
  editingServerId.value = null
  resetServerForm()
}

function openAddDomainForm() {
  editingDomainId.value = null
  Object.assign(domainForm.value, {
    domain: '',
    registrar: '',
    accountName: '',
    expiresAt: '',
    autoRenew: false,
    notes: '',
  })
  showDomainForm.value = true
}

function openEditDomainForm(domain: DomainRecord) {
  editingDomainId.value = domain.id
  Object.assign(domainForm.value, {
    domain: domain.domain,
    registrar: domain.registrar || '',
    accountName: domain.accountName || '',
    expiresAt: toDateInputValue(domain.expiresAt),
    autoRenew: domain.autoRenew,
    notes: domain.notes || '',
  })
  showDomainForm.value = true
}

function closeDomainForm() {
  showDomainForm.value = false
  editingDomainId.value = null
  Object.assign(domainForm.value, {
    domain: '',
    registrar: '',
    accountName: '',
    expiresAt: '',
    autoRenew: false,
    notes: '',
  })
}

function submitWebsiteForm() {
  showWebsiteForm.value = false
  if (editingWebsiteId.value) {
    emit('updateWebsite', editingWebsiteId.value)
    editingWebsiteId.value = null
    return
  }
  emit('addWebsite')
}

function submitWebsiteAccountForm() {
  showWebsiteAccountForm.value = false
  if (editingWebsiteAccountId.value) {
    emit('updateWebsiteAccount', editingWebsiteAccountId.value)
    editingWebsiteAccountId.value = null
    return
  }
  emit('addWebsiteAccount')
}

function openAddWebsiteForm() {
  editingWebsiteId.value = null
  Object.assign(websiteForm.value, { name: '', url: '', notes: '' })
  showWebsiteForm.value = true
}

function openEditWebsiteForm(site: WebsiteRecord) {
  editingWebsiteId.value = site.id
  Object.assign(websiteForm.value, {
    name: site.name,
    url: site.url || '',
    notes: site.notes || '',
  })
  showWebsiteForm.value = true
}

function closeWebsiteForm() {
  showWebsiteForm.value = false
  editingWebsiteId.value = null
}

function openWebsiteAccountForm() {
  editingWebsiteAccountId.value = null
  Object.assign(websiteAccountForm.value, {
    websiteId: selectedWebsiteId.value === 'all' ? 0 : selectedWebsiteId.value,
    accountName: '',
    loginIdentifier: '',
    notes: '',
  })
  showWebsiteAccountForm.value = true
}

function openEditWebsiteAccountForm(account: WebsiteAccountRecord) {
  editingWebsiteAccountId.value = account.id
  Object.assign(websiteAccountForm.value, {
    websiteId: account.websiteId,
    accountName: account.accountName,
    loginIdentifier: account.loginIdentifier || '',
    notes: account.notes || '',
  })
  showWebsiteAccountForm.value = true
}

function closeWebsiteAccountForm() {
  showWebsiteAccountForm.value = false
  editingWebsiteAccountId.value = null
}

function toggleWebsiteViewMode() {
  websiteViewMode.value = websiteViewMode.value === 'pills' ? 'cards' : 'pills'
}

function getWebsiteLogo(site: Pick<WebsiteRecord, 'url'>) {
  if (!site.url) return ''
  try {
    return `${new URL(site.url).origin}/favicon.ico`
  }
  catch {
    return ''
  }
}

function getWebsiteInitial(site: Pick<WebsiteRecord, 'name'>) {
  return site.name.trim().slice(0, 1).toUpperCase() || 'M'
}

function hideBrokenImage(event: Event) {
  const image = event.currentTarget
  if (image instanceof HTMLImageElement) image.style.display = 'none'
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
          <span class="user-pill">{{ user.displayName }} · {{ user.role }}</span>
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
        <section class="vault-panel">
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

          <Transition
            name="tab-panel"
            mode="out-in"
          >
            <div
              v-if="activeTab === 'websites'"
              key="websites"
              class="tab-body"
            >
              <div class="list-toolbar">
                <h2>{{ t('tabs.websites') }}</h2>
                <div>
                  <button
                    class="round-icon-button"
                    type="button"
                    :aria-label="websiteViewMode === 'pills' ? t('actions.cardView') : t('actions.pillView')"
                    :title="websiteViewMode === 'pills' ? t('actions.cardView') : t('actions.pillView')"
                    @click="toggleWebsiteViewMode"
                  >
                    <svg
                      v-if="websiteViewMode === 'pills'"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="7"
                        height="7"
                        rx="2"
                      />
                      <rect
                        x="13"
                        y="4"
                        width="7"
                        height="7"
                        rx="2"
                      />
                      <rect
                        x="4"
                        y="13"
                        width="7"
                        height="7"
                        rx="2"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="7"
                        height="7"
                        rx="2"
                      />
                    </svg>
                    <svg
                      v-else
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="5"
                        width="16"
                        height="4"
                        rx="2"
                      />
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="4"
                        rx="2"
                      />
                      <rect
                        x="4"
                        y="15"
                        width="16"
                        height="4"
                        rx="2"
                      />
                    </svg>
                  </button>
                  <button
                    class="primary compact-button"
                    type="button"
                    @click="openAddWebsiteForm"
                  >
                    {{ t('actions.addWebsite') }}
                  </button>
                  <button
                    class="primary compact-button"
                    type="button"
                    :disabled="!websites.length"
                    @click="openWebsiteAccountForm"
                  >
                    {{ t('actions.addAccount') }}
                  </button>
                </div>
              </div>

              <section class="website-switcher">
                <Transition
                  name="switch-mode"
                  mode="out-in"
                >
                  <div
                    v-if="websiteViewMode === 'pills'"
                    key="pills"
                    class="website-pill-row"
                  >
                    <button
                      type="button"
                      class="website-pill"
                      :class="{ active: selectedWebsiteId === 'all' }"
                      @click="selectedWebsiteId = 'all'"
                    >
                      <span class="all-site-icon">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                          />
                          <path d="M4 12h16" />
                          <path d="M12 4c2 2.1 3 4.7 3 8s-1 5.9-3 8" />
                          <path d="M12 4c-2 2.1-3 4.7-3 8s1 5.9 3 8" />
                        </svg>
                      </span>
                      <span>{{ t('actions.allWebsites') }}</span>
                    </button>
                    <button
                      v-for="site of websites"
                      :key="site.id"
                      type="button"
                      class="website-pill"
                      :class="{ active: selectedWebsiteId === site.id }"
                      @click="selectedWebsiteId = site.id"
                    >
                      <img
                        v-if="getWebsiteLogo(site)"
                        :src="getWebsiteLogo(site)"
                        alt=""
                        @error="hideBrokenImage"
                      >
                      <span>{{ site.name }}</span>
                    </button>
                  </div>

                  <div
                    v-else
                    key="cards"
                    class="website-card-row"
                  >
                    <article
                      v-for="site of websites"
                      :key="site.id"
                      class="website-card"
                      :class="{ active: selectedWebsiteId === site.id }"
                      @click="selectedWebsiteId = site.id"
                    >
                      <div class="website-card-main">
                        <div class="website-card-title">
                          <span class="website-card-logo">
                            <img
                              v-if="getWebsiteLogo(site)"
                              :src="getWebsiteLogo(site)"
                              alt=""
                              @error="hideBrokenImage"
                            >
                            <span v-else>{{ getWebsiteInitial(site) }}</span>
                          </span>
                          <strong>{{ site.name }}</strong>
                        </div>
                        <a
                          v-if="site.url"
                          :href="site.url"
                          target="_blank"
                          rel="noreferrer"
                          @click.stop
                        >
                          {{ site.url }}
                        </a>
                        <span
                          v-if="site.notes"
                          class="website-card-note"
                        >{{ site.notes }}</span>
                      </div>
                      <div class="website-card-actions">
                        <AppIconButton
                          icon="edit"
                          :label="t('actions.edit')"
                          @click.stop="openEditWebsiteForm(site)"
                        />
                        <AppIconButton
                          icon="delete"
                          :label="t('actions.delete')"
                          variant="danger"
                          @click.stop="requestRemoveRecord('/api/vault/websites', site.id, site.name)"
                        />
                      </div>
                    </article>
                  </div>
                </Transition>
              </section>

              <section class="account-card-list">
                <p
                  v-if="!visibleWebsiteAccounts.length"
                  class="empty-state"
                >
                  {{ selectedWebsiteId === 'all' ? t('empty.websiteAccountsAll') : t('empty.websiteAccounts') }}
                </p>
                <article
                  v-for="account of visibleWebsiteAccounts"
                  :key="account.id"
                  class="account-card"
                >
                  <div class="account-card-site">
                    <img
                      v-if="getWebsiteLogo(account.website)"
                      :src="getWebsiteLogo(account.website)"
                      alt=""
                      @error="hideBrokenImage"
                    >
                    <span>{{ account.website.name }}</span>
                  </div>
                  <strong>{{ account.accountName }}</strong>
                  <span>{{ account.loginIdentifier || '-' }}</span>
                  <p v-if="account.notes">
                    {{ account.notes }}
                  </p>
                  <div class="account-card-actions">
                    <AppIconButton
                      icon="edit"
                      :label="t('actions.edit')"
                      @click="openEditWebsiteAccountForm(account)"
                    />
                    <AppIconButton
                      icon="delete"
                      :label="t('actions.delete')"
                      variant="danger"
                      @click="requestRemoveRecord('/api/vault/website-accounts', account.id, account.accountName)"
                    />
                  </div>
                </article>
              </section>

              <p
                v-if="!websites.length"
                class="empty-state"
              >
                {{ t('empty.websites') }}
              </p>
            </div>

            <div
              v-else-if="activeTab === 'authenticators'"
              key="authenticators"
              class="tab-body"
            >
              <div class="list-toolbar">
                <h2>{{ t('tabs.authenticators') }}</h2>
                <div>
                  <button
                    class="primary compact-button"
                    type="button"
                    @click="openAddAuthenticatorForm"
                  >
                    {{ t('actions.addAuthenticator') }}
                  </button>
                </div>
              </div>
              <section class="domain-card-list">
                <p
                  v-if="!authenticators.length"
                  class="empty-state"
                >
                  {{ t('empty.authenticators') }}
                </p>
                <article
                  v-for="item of authenticators"
                  :key="item.id"
                  class="domain-card"
                >
                  <div class="domain-card-main">
                    <strong>{{ item.issuer }}</strong>
                    <span>{{ item.accountName }}</span>
                  </div>
                  <div class="domain-card-meta">
                    <span>{{ t('fields.totpSecret') }}</span>
                  </div>
                  <code>{{ item.secret }}</code>
                  <p v-if="item.notes">
                    {{ item.notes }}
                  </p>
                  <div class="record-actions">
                    <AppIconButton
                      icon="edit"
                      :label="t('actions.edit')"
                      @click="openEditAuthenticatorForm(item)"
                    />
                    <AppIconButton
                      icon="delete"
                      :label="t('actions.delete')"
                      variant="danger"
                      @click="requestRemoveRecord('/api/vault/authenticators', item.id, item.issuer)"
                    />
                  </div>
                </article>
              </section>
            </div>

            <div
              v-else-if="activeTab === 'backupCodes'"
              key="backupCodes"
              class="tab-body"
            >
              <div class="list-toolbar">
                <h2>{{ t('tabs.backupCodes') }}</h2>
                <div>
                  <button
                    class="primary compact-button"
                    type="button"
                    @click="openAddBackupCodeForm"
                  >
                    {{ t('actions.addBackupCodes') }}
                  </button>
                </div>
              </div>
              <section class="domain-card-list">
                <p
                  v-if="!backupCodes.length"
                  class="empty-state"
                >
                  {{ t('empty.backupCodes') }}
                </p>
                <article
                  v-for="item of backupCodes"
                  :key="item.id"
                  class="domain-card"
                >
                  <div class="domain-card-main">
                    <strong>{{ item.provider }}</strong>
                    <span>{{ item.accountName }}</span>
                  </div>
                  <pre>{{ item.codes }}</pre>
                  <p v-if="item.notes">
                    {{ item.notes }}
                  </p>
                  <div class="record-actions">
                    <AppIconButton
                      icon="edit"
                      :label="t('actions.edit')"
                      @click="openEditBackupCodeForm(item)"
                    />
                    <AppIconButton
                      icon="delete"
                      :label="t('actions.delete')"
                      variant="danger"
                      @click="requestRemoveRecord('/api/vault/backup-codes', item.id, item.provider)"
                    />
                  </div>
                </article>
              </section>
            </div>

            <div
              v-else-if="activeTab === 'servers'"
              key="servers"
              class="tab-body"
            >
              <div class="list-toolbar">
                <h2>{{ t('tabs.servers') }}</h2>
                <div>
                  <button
                    class="primary compact-button"
                    type="button"
                    @click="openAddServerForm"
                  >
                    {{ t('actions.addServer') }}
                  </button>
                </div>
              </div>
              <section class="domain-card-list">
                <p
                  v-if="!servers.length"
                  class="empty-state"
                >
                  {{ t('empty.servers') }}
                </p>
                <article
                  v-for="item of servers"
                  :key="item.id"
                  class="domain-card"
                >
                  <div class="domain-card-main">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.provider || '-' }}</span>
                  </div>
                  <div class="domain-card-meta">
                    <span>{{ t('fields.ipAddress') }}: {{ item.ipAddress }}</span>
                    <span>{{ t('fields.login') }}: {{ item.loginName || '-' }}</span>
                    <span>{{ t('fields.expiresAt') }}: {{ formatDate(item.expiresAt) }}</span>
                    <span>{{ t('fields.remindAt') }}: {{ formatDate(item.remindAt) }}</span>
                  </div>
                  <a
                    v-if="item.panelUrl"
                    :href="item.panelUrl"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {{ item.panelUrl }}
                  </a>
                  <p v-if="item.notes">
                    {{ item.notes }}
                  </p>
                  <div class="record-actions">
                    <AppIconButton
                      icon="edit"
                      :label="t('actions.edit')"
                      @click="openEditServerForm(item)"
                    />
                    <AppIconButton
                      icon="delete"
                      :label="t('actions.delete')"
                      variant="danger"
                      @click="requestRemoveRecord('/api/vault/servers', item.id, item.name)"
                    />
                  </div>
                </article>
              </section>
            </div>

            <div
              v-else-if="activeTab === 'domains'"
              key="domains"
              class="tab-body"
            >
              <div class="list-toolbar">
                <h2>{{ t('tabs.domains') }}</h2>
                <div>
                  <button
                    class="primary compact-button"
                    type="button"
                    @click="openAddDomainForm"
                  >
                    {{ t('actions.addDomain') }}
                  </button>
                </div>
              </div>
              <section class="domain-card-list">
                <p
                  v-if="!domains.length"
                  class="empty-state"
                >
                  {{ t('empty.domains') }}
                </p>
                <article
                  v-for="item of domains"
                  :key="item.id"
                  class="domain-card"
                >
                  <div class="domain-card-main">
                    <strong>{{ item.domain }}</strong>
                    <span>{{ item.registrar || '-' }}</span>
                  </div>
                  <div class="domain-card-meta">
                    <span>{{ t('fields.account') }}: {{ item.accountName || '-' }}</span>
                    <span>{{ t('reminders.expires') }}: {{ formatDate(item.expiresAt) }}</span>
                    <span>{{ t('fields.autoRenew') }}: {{ item.autoRenew ? t('status.autoRenew') : t('status.manualRenew') }}</span>
                  </div>
                  <p v-if="item.notes">
                    {{ item.notes }}
                  </p>
                  <div class="record-actions">
                    <AppIconButton
                      icon="edit"
                      :label="t('actions.edit')"
                      @click="openEditDomainForm(item)"
                    />
                    <AppIconButton
                      icon="delete"
                      :label="t('actions.delete')"
                      variant="danger"
                      @click="requestRemoveRecord('/api/vault/domains', item.id, item.domain)"
                    />
                  </div>
                </article>
              </section>
            </div>
          </Transition>
        </section>
      </section>
    </div>

    <AppModal
      :open="showAuthenticatorForm"
      :title="editingAuthenticatorId ? t('actions.editAuthenticator') : t('actions.addAuthenticator')"
      @close="closeAuthenticatorForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitAuthenticatorForm"
      >
        <label class="form-field">
          <span>{{ t('fields.issuer') }}</span>
          <input
            v-model="authenticatorForm.issuer"
            :placeholder="t('fields.issuer')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.account') }}</span>
          <input
            v-model="authenticatorForm.accountName"
            :placeholder="t('fields.account')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.totpSecret') }}</span>
          <input
            v-model="authenticatorForm.secret"
            :placeholder="t('fields.totpSecret')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="authenticatorForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingAuthenticatorId ? t('actions.save') : t('actions.addAuthenticator') }}
        </AppButton>
      </form>
    </AppModal>

    <AppModal
      :open="showBackupCodeForm"
      :title="editingBackupCodeId ? t('actions.editBackupCodes') : t('actions.addBackupCodes')"
      @close="closeBackupCodeForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitBackupCodeForm"
      >
        <label class="form-field">
          <span>{{ t('fields.provider') }}</span>
          <input
            v-model="backupCodeForm.provider"
            :placeholder="t('fields.provider')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.account') }}</span>
          <input
            v-model="backupCodeForm.accountName"
            :placeholder="t('fields.account')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.backupCodes') }}</span>
          <textarea
            v-model="backupCodeForm.codes"
            :placeholder="t('fields.backupCodes')"
            required
          />
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="backupCodeForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingBackupCodeId ? t('actions.save') : t('actions.addBackupCodes') }}
        </AppButton>
      </form>
    </AppModal>

    <AppModal
      :open="showServerForm"
      :title="editingServerId ? t('actions.editServer') : t('actions.addServer')"
      @close="closeServerForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitServerForm"
      >
        <label class="form-field">
          <span>{{ t('fields.name') }}</span>
          <input
            v-model="serverForm.name"
            :placeholder="t('fields.name')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.provider') }}</span>
          <input
            v-model="serverForm.provider"
            :placeholder="t('fields.provider')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.ipAddress') }}</span>
          <input
            v-model="serverForm.ipAddress"
            :placeholder="t('fields.ipAddress')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.login') }}</span>
          <input
            v-model="serverForm.loginName"
            :placeholder="t('fields.login')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.panelUrl') }}</span>
          <input
            v-model="serverForm.panelUrl"
            :placeholder="t('fields.panelUrl')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.expiresAt') }}</span>
          <input
            v-model="serverForm.expiresAt"
            type="date"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.remindAt') }}</span>
          <input
            v-model="serverForm.remindAt"
            type="date"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="serverForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingServerId ? t('actions.save') : t('actions.addServer') }}
        </AppButton>
      </form>
    </AppModal>

    <AppModal
      :open="showDomainForm"
      :title="editingDomainId ? t('actions.editDomain') : t('actions.addDomain')"
      @close="closeDomainForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitDomainForm"
      >
        <label class="form-field">
          <span>{{ t('fields.domain') }}</span>
          <input
            v-model="domainForm.domain"
            :placeholder="t('fields.domain')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.registrar') }}</span>
          <input
            v-model="domainForm.registrar"
            :placeholder="t('fields.registrar')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.account') }}</span>
          <input
            v-model="domainForm.accountName"
            :placeholder="t('fields.account')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.expiresAt') }}</span>
          <input
            v-model="domainForm.expiresAt"
            type="date"
          >
        </label>
        <label class="checkbox">
          <input
            v-model="domainForm.autoRenew"
            type="checkbox"
          >
          {{ t('fields.autoRenew') }}
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="domainForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingDomainId ? t('actions.save') : t('actions.addDomain') }}
        </AppButton>
      </form>
    </AppModal>

    <AppModal
      :open="showWebsiteForm"
      :title="editingWebsiteId ? t('actions.editWebsite') : t('actions.addWebsite')"
      @close="closeWebsiteForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitWebsiteForm"
      >
        <label class="form-field">
          <span>{{ t('fields.websiteName') }}</span>
          <input
            v-model="websiteForm.name"
            :placeholder="t('fields.websiteName')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.websiteUrl') }}</span>
          <input
            v-model="websiteForm.url"
            :placeholder="t('fields.websiteUrl')"
            inputmode="url"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="websiteForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingWebsiteId ? t('actions.save') : t('actions.addWebsite') }}
        </AppButton>
      </form>
    </AppModal>

    <AppModal
      :open="showWebsiteAccountForm"
      :title="editingWebsiteAccountId ? t('actions.editAccount') : t('actions.addAccount')"
      @close="closeWebsiteAccountForm"
    >
      <form
        class="modal-form"
        @submit.prevent="submitWebsiteAccountForm"
      >
        <label class="form-field">
          <span>{{ t('fields.selectWebsite') }}</span>
          <select
            v-model.number="websiteAccountForm.websiteId"
            required
          >
            <option
              :value="0"
              disabled
            >
              {{ t('fields.selectWebsite') }}
            </option>
            <option
              v-for="site of websites"
              :key="site.id"
              :value="site.id"
            >
              {{ site.name }}
            </option>
          </select>
        </label>
        <label class="form-field">
          <span>{{ t('fields.accountName') }}</span>
          <input
            v-model="websiteAccountForm.accountName"
            :placeholder="t('fields.accountName')"
            required
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.loginIdentifier') }}</span>
          <input
            v-model="websiteAccountForm.loginIdentifier"
            :placeholder="t('fields.loginIdentifier')"
          >
        </label>
        <label class="form-field">
          <span>{{ t('fields.notes') }}</span>
          <input
            v-model="websiteAccountForm.notes"
            :placeholder="t('fields.notes')"
          >
        </label>
        <AppButton
          align="end"
          size="sm"
          type="submit"
          variant="primary"
        >
          {{ editingWebsiteAccountId ? t('actions.save') : t('actions.addAccount') }}
        </AppButton>
      </form>
    </AppModal>

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

<style scoped>
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
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 0;
  border-bottom: 1px solid #dbe2ec;
  border-radius: 0;
  padding: 12px 24px;
  margin: 0;
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 14px 36px rgb(30 41 59 / 9%);
  backdrop-filter: blur(16px);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
}

h1,
h2 {
  margin: 0;
}

h1 {
  color: #101828;
  font-size: 24px;
  letter-spacing: 0;
}

.top-actions,
.language-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-pill {
  border: 1px solid #dbe2ec;
  border-radius: 999px;
  padding: 9px 12px;
  color: #354253;
  font-size: 13px;
  font-weight: 760;
  background: rgb(255 255 255 / 82%);
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

.language-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  padding: 6px 8px;
  color: #526071;
  font-size: 12px;
  font-weight: 760;
  background: rgb(255 255 255 / 82%);
}

.language-switch select {
  width: auto;
  min-height: 28px;
  border: 0;
  border-radius: 6px;
  padding: 4px 26px 4px 8px;
  color: #1d2937;
  font: inherit;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.theme-toggle-button,
.logout-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  min-height: 0;
  place-items: center;
  border-radius: 999px;
  padding: 0;
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
  padding-top: 84px;
}

.vault-panel {
  min-width: 0;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 18px 42px rgb(30 41 59 / 8%);
}

.vault-panel {
  min-width: 0;
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
  margin-bottom: 18px;
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

.tab-body {
  display: grid;
  gap: 16px;
}

.tab-panel-enter-active,
.tab-panel-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list-toolbar h2 {
  font-size: 18px;
}

.list-toolbar > div {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.entry-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: start;
  border: 1px solid #dde5f0;
  border-radius: 8px;
  padding: 14px;
  background: linear-gradient(180deg, #f9fbff, #f4f7fb);
}

.form-field {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: #354253;
  font-size: 13px;
  font-weight: 760;
}

.form-field span {
  line-height: 1.35;
}

input,
textarea,
select {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  border: 1px solid #d2dce8;
  border-radius: 7px;
  padding: 11px 12px;
  color: #151b23;
  font: inherit;
  background: #fff;
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgb(79 70 229 / 13%);
}

textarea {
  min-height: 78px;
  resize: vertical;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid #d2dce8;
  border-radius: 7px;
  padding: 0 12px;
  background: #fff;
}

.checkbox input {
  width: auto;
  accent-color: #4f46e5;
}

.primary {
  justify-self: end;
  min-height: 42px;
  border-color: #4f46e5;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 14px 30px rgb(79 70 229 / 20%);
}

.compact-button {
  min-height: 36px;
  padding: 8px 12px;
  font-size: 13px;
  box-shadow: 0 10px 20px rgb(79 70 229 / 16%);
}

.round-icon-button {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  min-height: 0;
  border-radius: 999px;
  padding: 0;
  color: #394255;
  background: #fff;
}

.round-icon-button {
  flex: 0 0 auto;
}

.round-icon-button svg,
.all-site-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.mini-button {
  min-height: 30px;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  box-shadow: none;
}

.danger {
  border-color: #efcaca;
  color: #9c2f2f;
  background: #fff7f7;
}

.record-list {
  display: grid;
  overflow: hidden;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  background: #fff;
}

.website-switcher {
  overflow-x: auto;
  margin: -4px -8px -10px;
  padding: 4px 8px 14px;
}

.website-pill-row,
.website-card-row {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  gap: 10px;
  min-width: max-content;
  padding: 1px;
}

.website-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 13px;
  white-space: nowrap;
  transition: border-color .18s ease, box-shadow .18s ease, color .18s ease, transform .18s ease;
}

.website-pill:hover,
.website-card:hover,
.account-card:hover {
  transform: translateY(-1px);
}

.website-pill.active,
.website-card.active {
  border-color: #4f46e5;
  color: #3730a3;
  box-shadow: 0 10px 24px rgb(79 70 229 / 12%);
}

.website-pill img,
.account-card-site img {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  object-fit: cover;
  background: #eef2f7;
}

.all-site-icon {
  display: inline-grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  color: #4f46e5;
  background: #eef2ff;
}

.website-card {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 8px;
  width: 220px;
  min-height: 118px;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.website-card-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.website-card-title {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
}

.website-card-logo {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 999px;
  color: #3730a3;
  font-size: 15px;
  font-weight: 850;
  background: #eef2ff;
  overflow: hidden;
}

.website-card-title strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.website-card-logo img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  background: #eef2f7;
}

.website-card-main strong,
.account-card strong {
  color: #151b23;
}

.website-card-main a,
.website-card-note,
.account-card span,
.account-card p {
  overflow-wrap: anywhere;
  color: #5f6d7e;
  font-size: 13px;
}

.website-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}

.website-card-actions button {
  flex: 0 0 auto;
}

.website-card-actions :deep(.app-icon-button) {
  flex: 0 0 auto;
}

.account-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.domain-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.account-card {
  display: grid;
  gap: 5px;
  align-content: start;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.domain-card {
  display: grid;
  gap: 8px;
  align-content: start;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.domain-card:hover {
  border-color: #c9d3e1;
  box-shadow: 0 12px 28px rgb(30 41 59 / 8%);
  transform: translateY(-1px);
}

.domain-card-main {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.domain-card-main strong {
  min-width: 0;
  overflow: hidden;
  color: #151b23;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain-card-main span {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 3px 8px;
  color: #4b5563;
  font-size: 12px;
  background: #eef2f7;
}

.domain-card-meta {
  display: grid;
  gap: 4px;
}

.domain-card-meta span,
.domain-card a,
.domain-card p {
  margin: 0;
  overflow-wrap: anywhere;
  color: #5f6d7e;
  font-size: 13px;
}

.domain-card a {
  text-decoration: none;
}

.domain-card a:hover {
  color: #3730a3;
}

.account-card-site {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.account-card p {
  margin: 0;
}

.account-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 0;
}

.account-card .danger {
  justify-self: end;
}

.switch-mode-enter-active,
.switch-mode-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.switch-mode-enter-from,
.switch-mode-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.record-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  align-items: center;
  min-height: 64px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf1f5;
}

.record-row:last-child {
  border-bottom: 0;
}

.record-row strong {
  color: #151b23;
}

.record-row span {
  color: #5f6d7e;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
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

.empty-state {
  margin: 0;
  padding: 18px;
  color: #697789;
  text-align: center;
}

.empty-state.compact {
  padding: 12px;
}

.modal-form {
  display: grid;
  gap: 12px;
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

@media (max-width: 1000px) {
  .top-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar {
    align-items: flex-start;
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
  .language-switch {
    width: 100%;
  }

  .language-switch select {
    flex: 1;
  }

  .top-actions > .theme-toggle-button,
  .top-actions > .logout-button {
    width: 36px;
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

.dashboard-page.theme-dark {
  color: #e5e7eb;
  background:
    radial-gradient(circle at 0% 0%, rgb(79 70 229 / 12%), transparent 30%),
    radial-gradient(circle at 100% 6%, rgb(14 165 233 / 10%), transparent 28%),
    #020617;
}

.dashboard-page.theme-dark .topbar,
.dashboard-page.theme-dark .vault-panel,
.dashboard-page.theme-dark .record-list,
.dashboard-page.theme-dark .website-card,
.dashboard-page.theme-dark .account-card,
.dashboard-page.theme-dark .domain-card {
  border-color: #334155;
  background: rgb(15 23 42 / 92%);
  box-shadow: 0 18px 42px rgb(0 0 0 / 22%);
}

.dashboard-page.theme-dark h1,
.dashboard-page.theme-dark .website-card-main strong,
.dashboard-page.theme-dark .account-card strong,
.dashboard-page.theme-dark .domain-card-main strong,
.dashboard-page.theme-dark .record-row strong {
  color: #f8fafc;
}

.dashboard-page.theme-dark button:not(.app-icon-button),
.dashboard-page.theme-dark input,
.dashboard-page.theme-dark textarea,
.dashboard-page.theme-dark select,
.dashboard-page.theme-dark .language-switch,
.dashboard-page.theme-dark .user-pill,
.dashboard-page.theme-dark .checkbox,
.dashboard-page.theme-dark .website-pill {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
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

.dashboard-page.theme-dark .tabs,
.dashboard-page.theme-dark .entry-form,
.dashboard-page.theme-dark code,
.dashboard-page.theme-dark pre {
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
.dashboard-page.theme-dark .record-row span,
.dashboard-page.theme-dark .form-field,
.dashboard-page.theme-dark .empty-state {
  color: #cbd5e1;
}

.dashboard-page.theme-dark .danger {
  border-color: #7f1d1d;
  color: #fecaca;
  background: #2f1518;
}
</style>
