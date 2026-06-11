<script setup lang="ts">
import { ref, reactive } from 'vue'

type Authenticator = {
  id: number
  issuer: string
  accountName: string
  secret: string
  notes: string
}

defineProps<{
  authenticators: Authenticator[]
}>()

const emit = defineEmits<{
  'add-authenticator': [payload: { issuer: string, accountName: string, secret: string, notes: string }]
  'update-authenticator': [id: number, payload: { issuer: string, accountName: string, secret: string, notes: string }]
  'remove-record': [endpoint: string, id: number, name: string]
}>()

const { t } = useI18n()

const showAuthenticatorForm = ref(false)
const editingAuthenticatorId = ref<number | null>(null)

const authenticatorForm = reactive({
  issuer: '',
  accountName: '',
  secret: '',
  notes: '',
})

function openAddAuthenticatorForm() {
  editingAuthenticatorId.value = null
  Object.assign(authenticatorForm, { issuer: '', accountName: '', secret: '', notes: '' })
  showAuthenticatorForm.value = true
}

function openEditAuthenticatorForm(item: Authenticator) {
  editingAuthenticatorId.value = item.id
  Object.assign(authenticatorForm, {
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
}

function submitAuthenticatorForm() {
  showAuthenticatorForm.value = false
  if (editingAuthenticatorId.value) {
    emit('update-authenticator', editingAuthenticatorId.value, { ...authenticatorForm })
    editingAuthenticatorId.value = null
  }
  else {
    emit('add-authenticator', { ...authenticatorForm })
  }
}
</script>

<template>
  <div class="tab-body">
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
            @click="emit('remove-record', '/api/vault/authenticators', item.id, item.issuer)"
          />
        </div>
      </article>
    </section>

    <!-- Modal -->
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

code {
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
:global(.theme-dark) code {
  border-color: #334155;
  color: #cbd5e1;
  background: #111827;
}

:global(.theme-dark) input:focus,
:global(.theme-dark) select:focus,
:global(.theme-dark) textarea:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}
</style>
