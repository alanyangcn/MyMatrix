<script setup lang="ts">
import { computed, ref } from 'vue'

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

type PendingDelete = {
  endpoint: string
  id: number
  name: string
}

type VaultTab = 'websites' | 'authenticators' | 'backupCodes' | 'servers' | 'domains'

const { t, locale } = useI18n()
const activeTab = defineModel<VaultTab>('activeTab', { required: true })

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
  addServer: [payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }]
  updateServer: [id: number, payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }]
  addDomain: [payload: { domain: string, registrar: string, accountName: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, notes: string }]
  updateDomain: [id: number, payload: { domain: string, registrar: string, accountName: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, notes: string }]
  addWebsite: [payload: { name: string, url: string, notes: string }]
  updateWebsite: [id: number, payload: { name: string, url: string, notes: string }]
  addWebsiteAccount: [payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  updateWebsiteAccount: [id: number, payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  removeRecord: [endpoint: string, id: number]
}>()

const pendingDelete = ref<PendingDelete | null>(null)

const tabItems = computed<Array<{ key: VaultTab, label: string, count: number }>>(() => [
  { key: 'websites', label: t('tabs.websites'), count: props.websites.length },
  { key: 'domains', label: t('tabs.domains'), count: props.domains.length },
  { key: 'servers', label: t('tabs.servers'), count: props.servers.length },
  { key: 'authenticators', label: t('tabs.authenticators'), count: props.authenticators.length },
  { key: 'backupCodes', label: t('tabs.backupCodes'), count: props.backupCodes.length },
])

const expiredDomains = computed(() => {
  const now = Date.now()
  return props.domains.filter(domain => {
    if (!domain.expiresAt) return false
    return domain.expiresAt <= now && !domain.autoRenew
  })
})

const expiringSoonDomains = computed(() => {
  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return props.domains.filter(domain => {
    if (!domain.expiresAt) return false
    const diff = domain.expiresAt - now
    return diff > 0 && diff <= sevenDaysMs && !domain.autoRenew
  })
})

const expiredServers = computed(() => {
  const now = Date.now()
  return props.servers.filter(server => {
    if (!server.expiresAt) return false
    return server.expiresAt <= now && !server.autoRenew
  })
})

const expiringSoonServers = computed(() => {
  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return props.servers.filter(server => {
    if (!server.expiresAt) return false
    const diff = server.expiresAt - now
    return diff > 0 && diff <= sevenDaysMs && !server.autoRenew
  })
})

function formatDate(value: number | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale.value)
}

function shouldShowPrice(domain: DomainRecord) {
  if (!domain.price) return false
  const priceVal = parseFloat(domain.price)
  return !isNaN(priceVal) && priceVal !== 0
}

function shouldShowServerPrice(server: ServerRecord) {
  if (!server.price) return false
  const priceVal = parseFloat(server.price)
  return !isNaN(priceVal) && priceVal !== 0
}

import { nextTick } from 'vue'

const domainsPanelRef = ref<any>(null)
const serversPanelRef = ref<any>(null)

function editDomainFromWarning(domain: DomainRecord) {
  activeTab.value = 'domains'
  nextTick(() => {
    domainsPanelRef.value?.openEditDomainForm(domain)
  })
}

function editServerFromWarning(server: ServerRecord) {
  activeTab.value = 'servers'
  nextTick(() => {
    serversPanelRef.value?.openEditServerForm(server)
  })
}

function scrollHorizontalArea(event: WheelEvent) {
  const target = event.currentTarget as HTMLElement
  if (!target || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

  const maxScrollLeft = target.scrollWidth - target.clientWidth
  if (maxScrollLeft <= 0) return

  const nextScrollLeft = Math.min(Math.max(target.scrollLeft + event.deltaY, 0), maxScrollLeft)
  if (nextScrollLeft === target.scrollLeft) return

  event.preventDefault()
  target.scrollLeft = nextScrollLeft
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
  <AppShell
    :user="user"
    @logout="$emit('logout')"
  >
    <section class="flex flex-col gap-3 sm:gap-4">
      <!-- Expired Warning Alert (Red) -->
      <Transition name="fade-slide">
        <div 
          v-if="expiredDomains.length > 0"
          class="p-4 border border-rose-200/50 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 rounded-2xl flex items-start gap-3.5 shadow-xs backdrop-blur-md transition-all duration-300"
        >
          <div class="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex-shrink-0">
            <UIcon name="i-lucide-alert-octagon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <h3 class="text-sm font-semibold tracking-tight text-rose-900 dark:text-rose-100">
              {{ t('reminders.expiredDomainsTitle', { count: expiredDomains.length }) }}
            </h3>
            <ul class="text-xs space-y-1.5 list-disc list-inside opacity-90">
              <li v-for="domain of expiredDomains" :key="domain.id" class="leading-relaxed">
                <span class="font-bold underline decoration-rose-400/50 decoration-2 underline-offset-2 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400" @click="editDomainFromWarning(domain)">{{ domain.domain }}</span>
                <span v-if="shouldShowPrice(domain)" class="ml-1 text-xs font-semibold opacity-90">({{ domain.price }} {{ domain.currency || '' }})</span>
                {{ t('reminders.expiredDomainsDesc', { date: formatDate(domain.expiresAt) }) }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>

      <!-- Expired Server Warning Alert (Red) -->
      <Transition name="fade-slide">
        <div 
          v-if="expiredServers.length > 0"
          class="p-4 border border-rose-200/50 dark:border-rose-800/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 rounded-2xl flex items-start gap-3.5 shadow-xs backdrop-blur-md transition-all duration-300"
        >
          <div class="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex-shrink-0">
            <UIcon name="i-lucide-alert-octagon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <h3 class="text-sm font-semibold tracking-tight text-rose-900 dark:text-rose-100">
              {{ t('reminders.expiredServersTitle', { count: expiredServers.length }) }}
            </h3>
            <ul class="text-xs space-y-1.5 list-disc list-inside opacity-90">
              <li v-for="server of expiredServers" :key="server.id" class="leading-relaxed">
                <span class="font-bold underline decoration-rose-400/50 decoration-2 underline-offset-2 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400" @click="editServerFromWarning(server)">{{ server.name }}</span>
                <span v-if="shouldShowServerPrice(server)" class="ml-1 text-xs font-semibold opacity-90">({{ server.price }} {{ server.currency || '' }})</span>
                {{ t('reminders.expiredServersDesc', { date: formatDate(server.expiresAt) }) }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>

      <!-- Expiring Soon Warning Alert (Orange/Yellow) -->
      <Transition name="fade-slide">
        <div 
          v-if="expiringSoonDomains.length > 0"
          class="p-4 border border-amber-200/50 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-2xl flex items-start gap-3.5 shadow-xs backdrop-blur-md transition-all duration-300"
        >
          <div class="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <h3 class="text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-100">
              {{ t('reminders.expiringSoonDomainsTitle', { count: expiringSoonDomains.length }) }}
            </h3>
            <ul class="text-xs space-y-1.5 list-disc list-inside opacity-90">
              <li v-for="domain of expiringSoonDomains" :key="domain.id" class="leading-relaxed">
                <span class="font-bold underline decoration-amber-400/50 decoration-2 underline-offset-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400" @click="editDomainFromWarning(domain)">{{ domain.domain }}</span>
                <span v-if="shouldShowPrice(domain)" class="ml-1 text-xs font-semibold opacity-90">({{ domain.price }} {{ domain.currency || '' }})</span>
                {{ t('reminders.expiringSoonDomainsDesc', { date: formatDate(domain.expiresAt) }) }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>

      <!-- Expiring Soon Server Warning Alert (Orange/Yellow) -->
      <Transition name="fade-slide">
        <div 
          v-if="expiringSoonServers.length > 0"
          class="p-4 border border-amber-200/50 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-2xl flex items-start gap-3.5 shadow-xs backdrop-blur-md transition-all duration-300"
        >
          <div class="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <h3 class="text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-100">
              {{ t('reminders.expiringSoonServersTitle', { count: expiringSoonServers.length }) }}
            </h3>
            <ul class="text-xs space-y-1.5 list-disc list-inside opacity-90">
              <li v-for="server of expiringSoonServers" :key="server.id" class="leading-relaxed">
                <span class="font-bold underline decoration-amber-400/50 decoration-2 underline-offset-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400" @click="editServerFromWarning(server)">{{ server.name }}</span>
                <span v-if="shouldShowServerPrice(server)" class="ml-1 text-xs font-semibold opacity-90">({{ server.price }} {{ server.currency || '' }})</span>
                {{ t('reminders.expiringSoonServersDesc', { date: formatDate(server.expiresAt) }) }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>

      <!-- Tabs Navigation -->
      <nav
        class="flex overflow-x-auto select-none gap-2 py-1 px-0.5 no-scrollbar"
        aria-label="Vault sections"
        @wheel="scrollHorizontalArea"
      >
        <button
          v-for="item of tabItems"
          :key="item.key"
          type="button"
          class="relative flex items-center justify-center sm:justify-between gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border whitespace-nowrap cursor-pointer transition-all duration-150 flex-initial"
          :class="activeTab === item.key 
            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-xs' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/50'"
          @click="activeTab = item.key"
        >
          <span class="truncate pr-1 sm:pr-0">{{ item.label }}</span>
          <span 
            class="inline-flex items-center justify-center min-w-[18px] h-[18px] sm:min-w-[22px] sm:h-[22px] px-1 sm:px-1.5 text-[10px] sm:text-xs font-bold rounded-full transition-colors duration-150 absolute -top-1 -right-1 sm:static"
            :class="activeTab === item.key 
              ? 'bg-white text-indigo-600 dark:text-indigo-500' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
          >
            {{ item.count }}
          </span>
        </button>
      </nav>

      <!-- Panel Surface -->
      <div class="p-3.5 sm:p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/80 shadow-xs backdrop-blur-md">
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
            ref="domainsPanelRef"
            :domains="domains"
            @add-domain="payload => emit('addDomain', payload)"
            @update-domain="(id, payload) => emit('updateDomain', id, payload)"
            @remove-record="requestRemoveRecord"
          />
          <ServersPanel
            v-else-if="activeTab === 'servers'"
            key="servers"
            ref="serversPanelRef"
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
      </div>
    </section>

    <!-- Delete Confirmation Modal -->
    <UModal
      :open="Boolean(pendingDelete)"
      :title="t('actions.confirmDeleteTitle')"
      :close="false"
      @update:open="val => { if (!val) closeDeleteConfirm() }"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('actions.confirmDeleteMessage', { name: pendingDelete?.name || '' }) }}
          </p>
          <div class="flex justify-end gap-2.5">
            <UButton
              color="neutral"
              variant="outline"
              size="md"
              class="font-semibold"
              @click="closeDeleteConfirm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              color="error"
              variant="solid"
              size="md"
              class="font-semibold"
              @click="confirmRemoveRecord"
            >
              {{ t('actions.confirmDelete') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </AppShell>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Transitions */
.tab-panel-enter-active,
.tab-panel-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Fade slide transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
