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
  <div class="flex flex-col gap-3 sm:gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ t('tabs.backupCodes') }}
      </h2>
      <UButton
        color="primary"
        size="md"
        icon="i-lucide-plus"
        class="font-semibold"
        @click="openAddBackupCodeForm"
      >
        {{ t('actions.addBackupCodes') }}
      </UButton>
    </div>

    <!-- Cards List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <p
        v-if="!backupCodes.length"
        class="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ t('empty.backupCodes') }}
      </p>

      <div
        v-for="item of backupCodes"
        :key="item.id"
        class="flex flex-col gap-2.5 sm:gap-3 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150"
      >
        <div class="flex items-center justify-between gap-3 min-w-0">
          <strong class="font-bold text-slate-900 dark:text-white truncate text-sm">
            {{ item.provider }}
          </strong>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
            {{ item.accountName }}
          </span>
        </div>

        <pre class="block w-full overflow-x-auto p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">{{ item.codes }}</pre>

        <p
          v-if="item.notes"
          class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2"
        >
          {{ item.notes }}
        </p>

        <div class="flex items-center justify-end gap-1 mt-auto pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            size="md"
            square
            @click="openEditBackupCodeForm(item)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="md"
            square
            @click="emit('remove-record', '/api/vault/backup-codes', item.id, item.provider)"
          />
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal
      v-model:open="showBackupCodeForm"
      :title="editingBackupCodeId ? t('actions.editBackupCodes') : t('actions.addBackupCodes')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitBackupCodeForm"
        >
          <UFormField
            :label="t('fields.provider')"
            required
          >
            <UInput
              v-model="backupCodeForm.provider"
              :placeholder="t('placeholders.providerExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('fields.account')"
            required
          >
            <UInput
              v-model="backupCodeForm.accountName"
              :placeholder="t('placeholders.accountExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('fields.backupCodes')"
            required
          >
            <UTextarea
              v-model="backupCodeForm.codes"
              :placeholder="t('placeholders.backupCodesPrompt')"
              required
              class="w-full"
              :rows="5"
            />
          </UFormField>

          <UFormField :label="t('fields.notes')">
            <UInput
              v-model="backupCodeForm.notes"
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
              @click="closeBackupCodeForm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="font-semibold"
            >
              {{ editingBackupCodeId ? t('actions.save') : t('actions.addBackupCodes') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
