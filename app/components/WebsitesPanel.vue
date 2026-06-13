<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

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

const props = defineProps<{
  websites: WebsiteRecord[]
}>()

const emit = defineEmits<{
  'add-website': [payload: { name: string, url: string, notes: string }]
  'update-website': [id: number, payload: { name: string, url: string, notes: string }]
  'add-website-account': [payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  'update-website-account': [id: number, payload: { websiteId: number, accountName: string, loginIdentifier: string, notes: string }]
  'remove-record': [endpoint: string, id: number, name: string]
}>()

const { t } = useI18n()

const websiteViewMode = ref<'pills' | 'cards'>('pills')
const selectedWebsiteId = ref<number | 'all'>('all')

const showWebsiteForm = ref(false)
const showWebsiteAccountForm = ref(false)
const editingWebsiteId = ref<number | null>(null)
const editingWebsiteAccountId = ref<number | null>(null)

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

const visibleWebsiteAccounts = computed(() => {
  return props.websites
    .filter(site => selectedWebsiteId.value === 'all' || site.id === selectedWebsiteId.value)
    .flatMap(site => site.accounts.map(account => ({ ...account, website: site })))
})

const websiteOptions = computed(() => props.websites.map(site => ({
  value: site.id,
  label: site.name,
})))

function toggleWebsiteViewMode() {
  websiteViewMode.value = websiteViewMode.value === 'pills' ? 'cards' : 'pills'
}

function scrollWebsiteSwitcher(event: WheelEvent) {
  const target = event.currentTarget as HTMLElement
  if (!target || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

  const maxScrollLeft = target.scrollWidth - target.clientWidth
  if (maxScrollLeft <= 0) return

  const nextScrollLeft = Math.min(Math.max(target.scrollLeft + event.deltaY, 0), maxScrollLeft)
  if (nextScrollLeft === target.scrollLeft) return

  event.preventDefault()
  target.scrollLeft = nextScrollLeft
}

function getWebsiteLogo(site: Pick<WebsiteRecord, 'url'>) {
  if (!site.url) return undefined
  let urlStr = site.url.trim()
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`
  }
  try {
    return `${new URL(urlStr).origin}/favicon.ico`
  }
  catch {
    return undefined
  }
}

function openAddWebsiteForm() {
  editingWebsiteId.value = null
  Object.assign(websiteForm, { name: '', url: '', notes: '' })
  showWebsiteForm.value = true
}

function openEditWebsiteForm(site: WebsiteRecord) {
  editingWebsiteId.value = site.id
  Object.assign(websiteForm, {
    name: site.name,
    url: site.url ? site.url.replace(/^https?:\/\//i, '') : '',
    notes: site.notes || '',
  })
  showWebsiteForm.value = true
}

function closeWebsiteForm() {
  showWebsiteForm.value = false
  editingWebsiteId.value = null
}

function submitWebsiteForm() {
  showWebsiteForm.value = false
  if (editingWebsiteId.value) {
    emit('update-website', editingWebsiteId.value, { ...websiteForm })
    editingWebsiteId.value = null
  }
  else {
    emit('add-website', { ...websiteForm })
  }
}

function openWebsiteAccountForm() {
  editingWebsiteAccountId.value = null
  Object.assign(websiteAccountForm, {
    websiteId: selectedWebsiteId.value === 'all' ? (props.websites[0]?.id || 0) : selectedWebsiteId.value,
    accountName: '',
    loginIdentifier: '',
    notes: '',
  })
  showWebsiteAccountForm.value = true
}

function openEditWebsiteAccountForm(account: WebsiteAccountRecord) {
  editingWebsiteAccountId.value = account.id
  Object.assign(websiteAccountForm, {
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

function submitWebsiteAccountForm() {
  showWebsiteAccountForm.value = false
  if (editingWebsiteAccountId.value) {
    emit('update-website-account', editingWebsiteAccountId.value, { ...websiteAccountForm })
    editingWebsiteAccountId.value = null
  }
  else {
    emit('add-website-account', { ...websiteAccountForm })
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 sm:gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ t('tabs.websites') }}
      </h2>
      <div class="flex items-center gap-2 flex-wrap">
        <UButton
          color="neutral"
          variant="outline"
          size="md"
          :icon="websiteViewMode === 'pills' ? 'i-lucide-layout-grid' : 'i-lucide-rows-3'"
          :aria-label="websiteViewMode === 'pills' ? t('actions.cardView') : t('actions.pillView')"
          :title="websiteViewMode === 'pills' ? t('actions.cardView') : t('actions.pillView')"
          square
          @click="toggleWebsiteViewMode"
        />
        <UButton
          color="primary"
          size="md"
          class="font-semibold"
          icon="i-lucide-plus"
          @click="openAddWebsiteForm"
        >
          {{ t('actions.addWebsite') }}
        </UButton>
        <UButton
          color="primary"
          size="md"
          class="font-semibold"
          icon="i-lucide-user-plus"
          :disabled="!websites.length"
          @click="openWebsiteAccountForm"
        >
          {{ t('actions.addAccount') }}
        </UButton>
      </div>
    </div>

    <!-- Website Switcher -->
    <div
      class="overflow-x-auto select-none py-1.5 px-0.5 no-scrollbar"
      @wheel="scrollWebsiteSwitcher"
    >
      <Transition
        name="switch-mode"
        mode="out-in"
      >
        <!-- Pills Mode -->
        <div
          v-if="websiteViewMode === 'pills'"
          key="pills"
          class="flex items-center gap-2.5 min-w-max"
        >
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all duration-150"
            :class="selectedWebsiteId === 'all'
              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'"
            @click="selectedWebsiteId = 'all'"
          >
            <UIcon name="i-lucide-globe" class="w-3.5 h-3.5" />
            <span>{{ t('actions.allWebsites') }}</span>
          </button>

          <button
            v-for="site of websites"
            :key="site.id"
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all duration-150"
            :class="selectedWebsiteId === site.id
              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'"
            @click="selectedWebsiteId = site.id"
          >
            <UAvatar
              :as="{ img: 'img' }"
              :src="getWebsiteLogo(site)"
              :alt="site.name"
              :text="site.name.charAt(0).toUpperCase()"
              size="xs"
              class="w-5 h-5 rounded-full flex-shrink-0"
            />
            <span>{{ site.name }}</span>
          </button>
        </div>

        <!-- Cards Mode -->
        <div
          v-else
          key="cards"
          class="flex items-stretch gap-3 min-w-max"
        >
          <div
            v-for="site of websites"
            :key="site.id"
            class="flex flex-col justify-between gap-2.5 sm:gap-3.5 p-3 sm:p-4 w-44 sm:w-52 min-h-[110px] sm:min-h-[128px] rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-150"
            :class="selectedWebsiteId === site.id
              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'"
            @click="selectedWebsiteId = site.id"
          >
            <div class="space-y-1.5 min-w-0">
              <div class="flex items-center gap-2">
                <UAvatar
                  :as="{ img: 'img' }"
                  :src="getWebsiteLogo(site)"
                  :alt="site.name"
                  :text="site.name.charAt(0).toUpperCase()"
                  size="xs"
                  class="w-5 h-5 rounded-full flex-shrink-0"
                />
                <strong class="font-bold text-slate-950 dark:text-white text-xs truncate">
                  {{ site.name }}
                </strong>
              </div>
              <a
                v-if="site.url"
                :href="site.url"
                target="_blank"
                rel="noreferrer"
                class="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                @click.stop
              >
                {{ site.url }}
              </a>
              <p
                v-if="site.notes"
                class="text-[10px] text-slate-500 dark:text-slate-400 truncate"
              >
                {{ site.notes }}
              </p>
            </div>
            <div class="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 mt-auto">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                size="md"
                square
                @click.stop="openEditWebsiteForm(site)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                size="md"
                square
                @click.stop="emit('remove-record', '/api/vault/websites', site.id, site.name)"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Accounts Grid List -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
      <p
        v-if="!visibleWebsiteAccounts.length"
        class="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ selectedWebsiteId === 'all' ? t('empty.websiteAccountsAll') : t('empty.websiteAccounts') }}
      </p>

      <div
        v-for="account of visibleWebsiteAccounts"
        :key="account.id"
        class="flex flex-col gap-2.5 sm:gap-3.5 p-3 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150"
      >
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <UAvatar
            :as="{ img: 'img' }"
            :src="getWebsiteLogo(account.website)"
            :alt="account.website.name"
            :text="account.website.name.charAt(0).toUpperCase()"
            size="xs"
            class="w-5 h-5 rounded-full flex-shrink-0"
          />
          <span class="truncate font-semibold">{{ account.website.name }}</span>
        </div>

        <div class="space-y-0.5">
          <strong class="block font-bold text-slate-900 dark:text-white text-sm truncate">
            {{ account.accountName }}
          </strong>
          <span class="block text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
            {{ account.loginIdentifier || '-' }}
          </span>
        </div>

        <p
          v-if="account.notes"
          class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2"
        >
          {{ account.notes }}
        </p>

        <div class="flex items-center justify-end gap-1 mt-auto pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            size="md"
            square
            @click="openEditWebsiteAccountForm(account)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="md"
            square
            @click="emit('remove-record', '/api/vault/website-accounts', account.id, account.accountName)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State for No Websites -->
    <p
      v-if="!websites.length"
      class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
    >
      {{ t('empty.websites') }}
    </p>

    <!-- Modals -->

    <!-- Add/Edit Website Modal -->
    <UModal
      v-model:open="showWebsiteForm"
      :title="editingWebsiteId ? t('actions.editWebsite') : t('actions.addWebsite')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitWebsiteForm"
        >
          <UFormField
            :label="t('fields.websiteName')"
            required
          >
            <UInput
              v-model="websiteForm.name"
              :placeholder="t('placeholders.websiteNameExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.websiteUrl')">
            <div class="flex items-stretch w-full">
              <span class="inline-flex items-center px-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 border-r-0 rounded-l-lg select-none font-semibold">
                https://
              </span>
              <UInput
                v-model="websiteForm.url"
                :placeholder="t('placeholders.domainExample')"
                type="text"
                class="flex-1"
                :ui="{ root: '!rounded-l-none' }"
              />
            </div>
          </UFormField>

          <UFormField :label="t('fields.notes')">
            <UInput
              v-model="websiteForm.notes"
              :placeholder="t('fields.notes')"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2.5 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              class="font-semibold"
              @click="closeWebsiteForm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="font-semibold"
            >
              {{ editingWebsiteId ? t('actions.save') : t('actions.addWebsite') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <!-- Add/Edit Website Account Modal -->
    <UModal
      v-model:open="showWebsiteAccountForm"
      :title="editingWebsiteAccountId ? t('actions.editAccount') : t('actions.addAccount')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitWebsiteAccountForm"
        >
          <UFormField
            :label="t('fields.selectWebsite')"
            required
          >
            <USelectMenu
              v-model="websiteAccountForm.websiteId"
              :items="websiteOptions"
              value-key="value"
              class="w-full"
              :placeholder="t('fields.selectWebsite')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.accountName')"
            required
          >
            <UInput
              v-model="websiteAccountForm.accountName"
              :placeholder="t('placeholders.accountNameExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.loginIdentifier')">
            <UInput
              v-model="websiteAccountForm.loginIdentifier"
              :placeholder="t('placeholders.loginIdentifierExample')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.notes')">
            <UInput
              v-model="websiteAccountForm.notes"
              :placeholder="t('fields.notes')"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2.5 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              class="font-semibold"
              @click="closeWebsiteAccountForm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="font-semibold"
            >
              {{ editingWebsiteAccountId ? t('actions.save') : t('actions.addAccount') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
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
.switch-mode-enter-active,
.switch-mode-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.switch-mode-enter-from,
.switch-mode-leave-to {
  opacity: 0;
  transform: translateY(2px);
}
</style>
