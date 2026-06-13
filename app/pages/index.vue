<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'

definePageMeta({
  layout: false,
})

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
  startTime: number | null
  expiresAt: number | null
  price: string | null
  currency: string | null
  remindAt: number | null
  autoRenew: boolean
  notes: string | null
}

type DomainRecord = {
  id: number
  domain: string
  registrar: string | null
  accountName: string | null
  startTime: number | null
  expiresAt: number | null
  price: string | null
  currency: string | null
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

const initialTab = getRouteTab(route.query.tab)
const activeTab = ref<VaultTab>(isVaultTab(initialTab) ? initialTab : 'websites')

// 1. Fetch user data with useFetch (SSR-friendly)
const { data: authData } = await useFetch<{ user: User | null }>('/api/auth/me')
const user = ref<User | null>(authData.value?.user || null)

if (!user.value) {
  await navigateTo('/login')
}

// 2. Define reactive properties for vault data
const authenticators = ref<Authenticator[]>([])
const backupCodes = ref<BackupCodeSet[]>([])
const servers = ref<ServerRecord[]>([])
const domains = ref<DomainRecord[]>([])
const websites = ref<WebsiteRecord[]>([])

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// 3. Create a custom $fetch instance that intercepts 401 Unauthorized errors to automatically log out the user
const vaultFetch = $fetch.create({
  headers,
  onResponseError({ response }) {
    if (response.status === 401) {
      user.value = null
      if (authData.value) {
        authData.value.user = null
      }
      authenticators.value = []
      backupCodes.value = []
      servers.value = []
      domains.value = []
      websites.value = []

      if (import.meta.client) {
        toast.add({
          title: t('errors.sessionExpiredTitle'),
          description: t('errors.sessionExpiredDesc'),
          color: 'error',
          icon: 'i-lucide-alert-circle',
        })
        navigateTo('/login')
      }
    }
  }
})

// 4. Fetch vault data with useAsyncData (SSR-friendly)
const { data: vaultData, refresh: refreshVault } = await useAsyncData('vault', async () => {
  if (!user.value) return null
  const [nextWebsites, nextAuthenticators, nextBackupCodes, nextServers, nextDomains] = await Promise.all([
    vaultFetch<WebsiteRecord[]>('/api/vault/websites'),
    vaultFetch<Authenticator[]>('/api/vault/authenticators'),
    vaultFetch<BackupCodeSet[]>('/api/vault/backup-codes'),
    vaultFetch<ServerRecord[]>('/api/vault/servers'),
    vaultFetch<DomainRecord[]>('/api/vault/domains'),
  ])
  return {
    websites: nextWebsites,
    authenticators: nextAuthenticators,
    backupCodes: nextBackupCodes,
    servers: nextServers,
    domains: nextDomains,
  }
})

// Watch for authData changes to keep state synced
watch(() => authData.value?.user, (newUser) => {
  user.value = newUser || null
  if (newUser) {
    refreshVault()
  }
})

// Watch for vaultData changes to sync panel states
watch(vaultData, (newData) => {
  if (newData) {
    websites.value = newData.websites
    authenticators.value = newData.authenticators
    backupCodes.value = newData.backupCodes
    servers.value = newData.servers
    domains.value = newData.domains
  } else {
    websites.value = []
    authenticators.value = []
    backupCodes.value = []
    servers.value = []
    domains.value = []
  }
}, { immediate: true })

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

async function loadVault() {
  await refreshVault()
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  user.value = null
  authData.value = { user: null }
  vaultData.value = null
  await navigateTo('/login')
}

async function addAuthenticator(body: { issuer: string, accountName: string, secret: string, notes: string }) {
  await vaultFetch('/api/vault/authenticators', { method: 'POST', body })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateAuthenticator(id: number, body: { issuer: string, accountName: string, secret: string, notes: string }) {
  await vaultFetch(`/api/vault/authenticators/${id}`, { method: 'PUT', body })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function addBackupCodes(body: { provider: string, accountName: string, codes: string, notes: string }) {
  await vaultFetch('/api/vault/backup-codes', { method: 'POST', body })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateBackupCodes(id: number, body: { provider: string, accountName: string, codes: string, notes: string }) {
  await vaultFetch(`/api/vault/backup-codes/${id}`, { method: 'PUT', body })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function addServer(body: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }) {
  await vaultFetch('/api/vault/servers', {
    method: 'POST',
    body: {
      ...body,
      startTime: toTimestamp(body.startTime),
      expiresAt: toTimestamp(body.expiresAt),
      remindAt: toTimestamp(body.remindAt),
    },
  })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateServer(id: number, body: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }) {
  await vaultFetch(`/api/vault/servers/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      startTime: toTimestamp(body.startTime),
      expiresAt: toTimestamp(body.expiresAt),
      remindAt: toTimestamp(body.remindAt),
    },
  })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function addDomain(body: { domain: string, registrar: string, accountName: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, notes: string }) {
  await vaultFetch('/api/vault/domains', {
    method: 'POST',
    body: {
      ...body,
      startTime: toTimestamp(body.startTime),
      expiresAt: toTimestamp(body.expiresAt),
    },
  })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateDomain(id: number, body: { domain: string, registrar: string, accountName: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, notes: string }) {
  await vaultFetch(`/api/vault/domains/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      startTime: toTimestamp(body.startTime),
      expiresAt: toTimestamp(body.expiresAt),
    },
  })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function addWebsite(body: { name: string, url: string, notes: string }) {
  await vaultFetch('/api/vault/websites', {
    method: 'POST',
    body: {
      ...body,
      url: normalizeWebsiteUrl(body.url),
    },
  })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateWebsite(id: number, body: { name: string, url: string, notes: string }) {
  await vaultFetch(`/api/vault/websites/${id}`, {
    method: 'PUT',
    body: {
      ...body,
      url: normalizeWebsiteUrl(body.url),
    },
  })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function addWebsiteAccount(body: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }) {
  await vaultFetch('/api/vault/website-accounts', { method: 'POST', body })
  toast.add({ title: t('actions.addSuccess'), color: 'success' })
  await loadVault()
}

async function updateWebsiteAccount(id: number, body: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }) {
  await vaultFetch(`/api/vault/website-accounts/${id}`, { method: 'PUT', body })
  toast.add({ title: t('actions.updateSuccess'), color: 'success' })
  await loadVault()
}

async function removeRecord(endpoint: string, id: number) {
  await vaultFetch(`${endpoint}/${id}`, { method: 'DELETE' })
  toast.add({ title: t('actions.deleteSuccess'), color: 'success' })
  await loadVault()
}
</script>

<template>
  <VaultDashboard
    v-if="user"
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
