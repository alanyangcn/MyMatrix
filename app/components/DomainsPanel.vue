<script setup lang="ts">
import { ref, reactive } from 'vue'

type DomainRecord = {
  id: number
  domain: string
  registrar: string | null
  accountName: string | null
  expiresAt: number | null
  autoRenew: boolean
  notes: string | null
}

defineProps<{
  domains: DomainRecord[]
}>()

const emit = defineEmits<{
  'add-domain': [payload: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }]
  'update-domain': [id: number, payload: { domain: string, registrar: string, accountName: string, expiresAt: string, autoRenew: boolean, notes: string }]
  'remove-record': [endpoint: string, id: number, name: string]
}>()

const { t, locale } = useI18n()

const showDomainForm = ref(false)
const editingDomainId = ref<number | null>(null)

const domainForm = reactive({
  domain: '',
  registrar: '',
  accountName: '',
  expiresAt: '',
  autoRenew: false,
  notes: '',
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

function openAddDomainForm() {
  editingDomainId.value = null
  Object.assign(domainForm, {
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
  Object.assign(domainForm, {
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
}

function submitDomainForm() {
  showDomainForm.value = false
  if (editingDomainId.value) {
    emit('update-domain', editingDomainId.value, { ...domainForm })
    editingDomainId.value = null
  }
  else {
    emit('add-domain', { ...domainForm })
  }
}
</script>

<template>
  <div class="tab-body">
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
            @click="emit('remove-record', '/api/vault/domains', item.id, item.domain)"
          />
        </div>
      </article>
    </section>

    <!-- Modal -->
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

.compact-button {
  min-height: 36px;
  padding: 8px 14px;
}

.domain-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
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

.record-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
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

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #354253;
}

.checkbox input {
  width: auto;
  min-height: 0;
  margin: 0;
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

/* Dark mode styling overrides */

:global(.theme-dark) .domain-card,
:global(.theme-dark) input,
:global(.theme-dark) select,
:global(.theme-dark) textarea {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

:global(.theme-dark) .domain-card:hover {
  border-color: #475569;
  background: #1e293b;
}

:global(.theme-dark) .domain-card-main strong {
  color: #f8fafc;
}

:global(.theme-dark) .domain-card-main span {
  color: #c7d2fe;
  background: #312e81;
}

:global(.theme-dark) .domain-card-meta span,
:global(.theme-dark) .domain-card p,
:global(.theme-dark) .checkbox {
  color: #cbd5e1;
}

:global(.theme-dark) input:focus,
:global(.theme-dark) select:focus,
:global(.theme-dark) textarea:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}
</style>
