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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const vaultTabs = ['websites', 'domains', 'servers', 'authenticators', 'backupCodes'] as const
type VaultTab = typeof vaultTabs[number]

function isVaultTab(value: unknown): value is VaultTab {
  return typeof value === 'string' && vaultTabs.includes(value as VaultTab)
}

function getRouteTab(value: typeof route.query.tab) {
  return Array.isArray(value) ? value[0] : value
}

const authMode = ref<'login' | 'register'>('login')
const authForm = reactive({
  username: '',
  password: '',
})
const authError = ref('')
const user = ref<User | null>(null)
const loading = ref(false)
const showPassword = ref(false)
const initialTab = getRouteTab(route.query.tab)
const activeTab = ref<VaultTab>(isVaultTab(initialTab) ? initialTab : 'websites')

const authenticators = ref<Authenticator[]>([])
const backupCodes = ref<BackupCodeSet[]>([])
const servers = ref<ServerRecord[]>([])
const domains = ref<DomainRecord[]>([])
const websites = ref<WebsiteRecord[]>([])

const authenticatorForm = reactive({
  issuer: '',
  accountName: '',
  secret: '',
  notes: '',
})

const backupCodeForm = reactive({
  provider: '',
  accountName: '',
  codes: '',
  notes: '',
})

const serverForm = reactive({
  name: '',
  provider: '',
  ipAddress: '',
  loginName: '',
  panelUrl: '',
  expiresAt: '',
  remindAt: '',
  notes: '',
})

const domainForm = reactive({
  domain: '',
  registrar: '',
  accountName: '',
  expiresAt: '',
  autoRenew: false,
  notes: '',
})

const websiteForm = reactive({
  name: '',
  url: '',
  notes: '',
})

const websiteAccountForm = reactive({
  websiteId: 0,
  accountName: '',
  loginIdentifier: '',
  notes: '',
})

function toTimestamp(value: string) {
  return value ? new Date(`${value}T00:00:00`).getTime() : null
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

onMounted(() => {
  if (!isVaultTab(getRouteTab(route.query.tab))) {
    router.replace({ query: { ...route.query, tab: activeTab.value } })
  }
})

watch(activeTab, (tab) => {
  if (getRouteTab(route.query.tab) === tab) return
  router.replace({ query: { ...route.query, tab } })
})

watch(() => route.query.tab, (tab) => {
  const nextTab = getRouteTab(tab)
  if (isVaultTab(nextTab) && activeTab.value !== nextTab) {
    activeTab.value = nextTab
    return
  }
  if (!isVaultTab(nextTab)) {
    router.replace({ query: { ...route.query, tab: activeTab.value } })
  }
})

async function loadMe() {
  const data = await $fetch<{ user: User | null }>('/api/auth/me')
  user.value = data.user
  if (user.value) await loadVault()
}

async function loadVault() {
  const [nextWebsites, nextAuthenticators, nextBackupCodes, nextServers, nextDomains] = await Promise.all([
    $fetch<WebsiteRecord[]>('/api/vault/websites'),
    $fetch<Authenticator[]>('/api/vault/authenticators'),
    $fetch<BackupCodeSet[]>('/api/vault/backup-codes'),
    $fetch<ServerRecord[]>('/api/vault/servers'),
    $fetch<DomainRecord[]>('/api/vault/domains'),
  ])

  websites.value = nextWebsites
  authenticators.value = nextAuthenticators
  backupCodes.value = nextBackupCodes
  servers.value = nextServers
  domains.value = nextDomains
}

async function submitAuth() {
  authError.value = ''
  loading.value = true
  try {
    const endpoint = authMode.value === 'login' ? '/api/auth/login' : '/api/auth/register'
    const data = await $fetch<{ user: User }>(endpoint, {
      method: 'POST',
      body: authForm,
    })
    user.value = data.user
    authForm.password = ''
    await loadVault()
  }
  catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }
    authError.value = fetchError.data?.message || fetchError.statusMessage || t('errors.authenticationFailed')
  }
  finally {
    loading.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  user.value = null
}

async function addAuthenticator() {
  await $fetch('/api/vault/authenticators', { method: 'POST', body: authenticatorForm })
  Object.assign(authenticatorForm, { issuer: '', accountName: '', secret: '', notes: '' })
  await loadVault()
}

async function updateAuthenticator(id: number) {
  await $fetch(`/api/vault/authenticators/${id}`, { method: 'PUT', body: authenticatorForm })
  Object.assign(authenticatorForm, { issuer: '', accountName: '', secret: '', notes: '' })
  await loadVault()
}

async function addBackupCodes() {
  await $fetch('/api/vault/backup-codes', { method: 'POST', body: backupCodeForm })
  Object.assign(backupCodeForm, { provider: '', accountName: '', codes: '', notes: '' })
  await loadVault()
}

async function updateBackupCodes(id: number) {
  await $fetch(`/api/vault/backup-codes/${id}`, { method: 'PUT', body: backupCodeForm })
  Object.assign(backupCodeForm, { provider: '', accountName: '', codes: '', notes: '' })
  await loadVault()
}

async function addServer() {
  await $fetch('/api/vault/servers', {
    method: 'POST',
    body: {
      ...serverForm,
      expiresAt: toTimestamp(serverForm.expiresAt),
      remindAt: toTimestamp(serverForm.remindAt),
    },
  })
  Object.assign(serverForm, {
    name: '',
    provider: '',
    ipAddress: '',
    loginName: '',
    panelUrl: '',
    expiresAt: '',
    remindAt: '',
    notes: '',
  })
  await loadVault()
}

async function updateServer(id: number) {
  await $fetch(`/api/vault/servers/${id}`, {
    method: 'PUT',
    body: {
      ...serverForm,
      expiresAt: toTimestamp(serverForm.expiresAt),
      remindAt: toTimestamp(serverForm.remindAt),
    },
  })
  Object.assign(serverForm, {
    name: '',
    provider: '',
    ipAddress: '',
    loginName: '',
    panelUrl: '',
    expiresAt: '',
    remindAt: '',
    notes: '',
  })
  await loadVault()
}

async function addDomain() {
  await $fetch('/api/vault/domains', {
    method: 'POST',
    body: {
      ...domainForm,
      expiresAt: toTimestamp(domainForm.expiresAt),
    },
  })
  Object.assign(domainForm, {
    domain: '',
    registrar: '',
    accountName: '',
    expiresAt: '',
    autoRenew: false,
    notes: '',
  })
  await loadVault()
}

async function updateDomain(id: number) {
  await $fetch(`/api/vault/domains/${id}`, {
    method: 'PUT',
    body: {
      ...domainForm,
      expiresAt: toTimestamp(domainForm.expiresAt),
    },
  })
  Object.assign(domainForm, {
    domain: '',
    registrar: '',
    accountName: '',
    expiresAt: '',
    autoRenew: false,
    notes: '',
  })
  await loadVault()
}

async function addWebsite() {
  await $fetch('/api/vault/websites', {
    method: 'POST',
    body: {
      ...websiteForm,
      url: normalizeWebsiteUrl(websiteForm.url),
    },
  })
  Object.assign(websiteForm, { name: '', url: '', notes: '' })
  await loadVault()
}

async function updateWebsite(id: number) {
  await $fetch(`/api/vault/websites/${id}`, {
    method: 'PUT',
    body: {
      ...websiteForm,
      url: normalizeWebsiteUrl(websiteForm.url),
    },
  })
  Object.assign(websiteForm, { name: '', url: '', notes: '' })
  await loadVault()
}

async function addWebsiteAccount() {
  await $fetch('/api/vault/website-accounts', { method: 'POST', body: websiteAccountForm })
  Object.assign(websiteAccountForm, {
    websiteId: websiteAccountForm.websiteId,
    accountName: '',
    loginIdentifier: '',
    notes: '',
  })
  await loadVault()
}

async function updateWebsiteAccount(id: number) {
  await $fetch(`/api/vault/website-accounts/${id}`, { method: 'PUT', body: websiteAccountForm })
  Object.assign(websiteAccountForm, {
    websiteId: websiteAccountForm.websiteId,
    accountName: '',
    loginIdentifier: '',
    notes: '',
  })
  await loadVault()
}

async function removeRecord(endpoint: string, id: number) {
  await $fetch(`${endpoint}/${id}`, { method: 'DELETE' })
  await loadVault()
}

await loadMe()
</script>

<template>
  <AuthScreen
    v-if="!user"
    v-model:auth-mode="authMode"
    v-model:auth-form="authForm"
    v-model:show-password="showPassword"
    :auth-error="authError"
    :loading="loading"
    @submit="submitAuth"
  />

  <VaultDashboard
    v-else
    v-model:active-tab="activeTab"
    v-model:authenticator-form="authenticatorForm"
    v-model:backup-code-form="backupCodeForm"
    v-model:server-form="serverForm"
    v-model:domain-form="domainForm"
    v-model:website-form="websiteForm"
    v-model:website-account-form="websiteAccountForm"
    :user="user"
    :authenticators="authenticators"
    :backup-codes="backupCodes"
    :servers="servers"
    :domains="domains"
    :websites="websites"
    @logout="logout"
    @add-authenticator="addAuthenticator"
    @update-authenticator="updateAuthenticator"
    @add-backup-codes="addBackupCodes"
    @update-backup-codes="updateBackupCodes"
    @add-server="addServer"
    @update-server="updateServer"
    @add-domain="addDomain"
    @update-domain="updateDomain"
    @add-website="addWebsite"
    @update-website="updateWebsite"
    @add-website-account="addWebsiteAccount"
    @update-website-account="updateWebsiteAccount"
    @remove-record="removeRecord"
  />
</template>
