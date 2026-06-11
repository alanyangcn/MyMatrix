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

const failedWebsites = ref<Record<number, boolean>>({})

function handleImageError(websiteId: number) {
  failedWebsites.value[websiteId] = true
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
    url: site.url || '',
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
  <div class="tab-body">
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
            <span class="website-logo-preview">
              <img
                v-if="getWebsiteLogo(site) && !failedWebsites[site.id]"
                :src="getWebsiteLogo(site)"
                alt=""
                @error="handleImageError(site.id)"
              >
              <svg
                v-else
                class="fallback-globe-icon"
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
                    v-if="getWebsiteLogo(site) && !failedWebsites[site.id]"
                    :src="getWebsiteLogo(site)"
                    alt=""
                    @error="handleImageError(site.id)"
                  >
                  <svg
                    v-else
                    class="fallback-globe-icon"
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
                @click.stop="emit('remove-record', '/api/vault/websites', site.id, site.name)"
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
          <span class="website-logo-preview">
            <img
              v-if="getWebsiteLogo(account.website) && !failedWebsites[account.website.id]"
              :src="getWebsiteLogo(account.website)"
              alt=""
              @error="handleImageError(account.website.id)"
            >
            <svg
              v-else
              class="fallback-globe-icon"
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
            @click="emit('remove-record', '/api/vault/website-accounts', account.id, account.accountName)"
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

    <!-- Modals -->
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
  </div>
</template>

<style scoped>
.tab-body {
  padding: 0;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.list-toolbar h2 {
  margin: 0;
  color: #101828;
  font-size: 20px;
  font-weight: 700;
}

.list-toolbar > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-button {
  min-height: 36px;
  padding: 8px 14px;
}

.round-icon-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  min-height: 0;
  place-items: center;
  border-radius: 8px;
  padding: 0;
  border: 1px solid #d1d9e4;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
}

.round-icon-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
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
  border: 1px solid #d1d9e4;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
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

.all-site-icon svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
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
  margin-top: 16px;
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

.account-card-site {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.website-logo-preview {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  overflow: hidden;
  font-size: 10px;
  font-weight: 800;
  color: #4f46e5;
  background: #eef2ff;
  flex-shrink: 0;
}

.website-logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.website-logo-preview .fallback-globe-icon {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.website-card-logo .fallback-globe-icon {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.account-card p {
  margin: 0;
}

.account-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 8px;
}

.account-card .danger {
  justify-self: end;
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

/* Dark mode styling overrides */

:global(.theme-dark) .round-icon-button,
:global(.theme-dark) .website-pill,
:global(.theme-dark) .website-card,
:global(.theme-dark) .account-card,
:global(.theme-dark) input,
:global(.theme-dark) select,
:global(.theme-dark) textarea {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

:global(.theme-dark) .round-icon-button:hover,
:global(.theme-dark) .website-pill:hover,
:global(.theme-dark) .website-card:hover,
:global(.theme-dark) .account-card:hover {
  border-color: #475569;
  background: #1e293b;
}

:global(.theme-dark) .website-pill.active,
:global(.theme-dark) .website-card.active {
  border-color: #818cf8;
  color: #c7d2fe;
  background: #1e293b;
}

:global(.theme-dark) .all-site-icon {
  color: #c7d2fe;
  background: #312e81;
}

:global(.theme-dark) .website-card-logo {
  color: #c7d2fe;
  background: #312e81;
}

:global(.theme-dark) .website-card-logo img,
:global(.theme-dark) .website-pill img,
:global(.theme-dark) .account-card-site img,
:global(.theme-dark) .website-logo-preview img {
  background: #1e293b;
}

:global(.theme-dark) .website-logo-preview {
  color: #c7d2fe;
  background: #312e81;
}

:global(.theme-dark) .website-card-main strong,
:global(.theme-dark) .account-card strong {
  color: #f8fafc;
}

:global(.theme-dark) .website-card-main a,
:global(.theme-dark) .website-card-note,
:global(.theme-dark) .account-card span,
:global(.theme-dark) .account-card p {
  color: #cbd5e1;
}

:global(.theme-dark) input:focus,
:global(.theme-dark) select:focus,
:global(.theme-dark) textarea:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}
</style>
