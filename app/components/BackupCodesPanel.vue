<script setup lang="ts">
import { ref, reactive } from 'vue'

type BackupCodeSet = {
  id: number
  provider: string
  accountName: string
  codes: string
  notes: string
}

defineProps<{
  backupCodes: BackupCodeSet[]
}>()

const emit = defineEmits<{
  'add-backup-codes': [payload: { provider: string, accountName: string, codes: string, notes: string }]
  'update-backup-codes': [id: number, payload: { provider: string, accountName: string, codes: string, notes: string }]
  'remove-record': [endpoint: string, id: number, name: string]
}>()

const { t } = useI18n()

const showBackupCodeForm = ref(false)
const editingBackupCodeId = ref<number | null>(null)

const backupCodeForm = reactive({
  provider: '',
  accountName: '',
  codes: '',
  notes: '',
})

function openAddBackupCodeForm() {
  editingBackupCodeId.value = null
  Object.assign(backupCodeForm, {
    provider: '',
    accountName: '',
    codes: '',
    notes: '',
  })
  showBackupCodeForm.value = true
}

function openEditBackupCodeForm(item: BackupCodeSet) {
  editingBackupCodeId.value = item.id
  Object.assign(backupCodeForm, {
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
}

function submitBackupCodeForm() {
  showBackupCodeForm.value = false
  if (editingBackupCodeId.value) {
    emit('update-backup-codes', editingBackupCodeId.value, { ...backupCodeForm })
    editingBackupCodeId.value = null
  }
  else {
    emit('add-backup-codes', { ...backupCodeForm })
  }
}
</script>

<template>
  <div class="tab-body">
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
            @click="emit('remove-record', '/api/vault/backup-codes', item.id, item.provider)"
          />
        </div>
      </article>
    </section>

    <!-- Modal -->
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

textarea {
  min-height: 80px;
  resize: vertical;
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

:global(.theme-dark) pre,
:global(.theme-dark) .domain-card p {
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
