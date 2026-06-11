<script setup lang="ts">
import { ref, reactive } from 'vue'

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

defineProps<{
  servers: ServerRecord[]
}>()

const emit = defineEmits<{
  'add-server': [payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }]
  'update-server': [id: number, payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, expiresAt: string, remindAt: string, notes: string }]
  'remove-record': [endpoint: string, id: number, name: string]
}>()

const { t, locale } = useI18n()

const showServerForm = ref(false)
const editingServerId = ref<number | null>(null)

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

function openAddServerForm() {
  editingServerId.value = null
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
  showServerForm.value = true
}

function openEditServerForm(server: ServerRecord) {
  editingServerId.value = server.id
  Object.assign(serverForm, {
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
}

function submitServerForm() {
  showServerForm.value = false
  if (editingServerId.value) {
    emit('update-server', editingServerId.value, { ...serverForm })
    editingServerId.value = null
  }
  else {
    emit('add-server', { ...serverForm })
  }
}
</script>

<template>
  <div class="tab-body">
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
            @click="emit('remove-record', '/api/vault/servers', item.id, item.name)"
          />
        </div>
      </article>
    </section>

    <!-- Modal -->
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

.domain-card a {
  text-decoration: none;
  color: #4f46e5;
}

.domain-card a:hover {
  color: #3730a3;
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
:global(.theme-dark) .domain-card a {
  color: #cbd5e1;
}

:global(.theme-dark) input:focus,
:global(.theme-dark) select:focus,
:global(.theme-dark) textarea:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}
</style>
