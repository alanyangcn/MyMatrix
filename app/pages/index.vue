<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'

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

async function addAuthenticator(body: { issuer: string, accountName: string, secret: string, notes: string }) {
  await $fetch('/api/vault/authenticators', { method: 'POST', body })
  await loadVault()
}

async function updateAuthenticator(id: number, body: { issuer: string, accountName: string, secret: string, notes: string }) {
  await $fetch(`/api/vault/authenticators/${id}`, { method: 'PUT', body })
  await loadVault()
}

async function addBackupCodes(body: { provider: string, accountName: string, codes: string, notes: string }) {
  await $fetch('/api/vault/backup-codes', { method: 'POST', body })
  await loadVault()
}

async function updateBackupCodes(id: number, body: { provider: string, accountName: string, codes: string, notes: string }) {
  await $fetch(`/api/vault/backup-codes/${id}`, { method: 'PUT', body })
  await loadVault()
}

async function addServer(body: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }) {
  await $fetch('/api/vault/servers', {
    method: 'POST',
    body: {
      ...body,
      expiresAt: toTimestamp(body.expiresAt),
      remindAt: toTimestamp(body.remindAt),
    },
  })
  await loadVault()
}

async function updateServer(id: number, body: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }) {
  await $fetch(`/api/vault/servers/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      expiresAt: toTimestamp(body.expiresAt),
      remindAt: toTimestamp(body.remindAt),
    },
  })
  await loadVault()
}

async function addDomain(body: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }) {
  await $fetch('/api/vault/domains', {
    method: 'POST',
    body: {
      ...body,
      expiresAt: toTimestamp(body.expiresAt),
    },
  })
  await loadVault()
}

async function updateDomain(id: number, body: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }) {
  await $fetch(`/api/vault/domains/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      expiresAt: toTimestamp(body.expiresAt),
    },
  })
  await loadVault()
}

async function addWebsite(body: { name: string, url: string, notes: string }) {
  await $fetch('/api/vault/websites', {
    method: 'POST',
    body: {
      ...body,
      url: normalizeWebsiteUrl(body.url),
    },
  })
  await loadVault()
}

async function updateWebsite(id: number, body: { name: string, url: string, notes: string }) {
  await $fetch(`/api/vault/websites/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      url: normalizeWebsiteUrl(body.url),
    },
  })
  await loadVault()
}

async function addWebsiteAccount(body: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }) {
  await $fetch('/api/vault/website-accounts', { method: 'POST', body })
  await loadVault()
}

async function updateWebsiteAccount(id: number, body: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }) {
  await $fetch(`/api/vault/website-accounts/${id}`, { method: 'PUT', body })
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
