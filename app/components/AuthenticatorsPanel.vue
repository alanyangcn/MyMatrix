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
  <div class="flex flex-col gap-3 sm:gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ t('tabs.authenticators') }}
      </h2>
      <UButton
        color="primary"
        size="md"
        icon="i-lucide-plus"
        class="font-semibold"
        @click="openAddAuthenticatorForm"
      >
        {{ t('actions.addAuthenticator') }}
      </UButton>
    </div>

    <!-- Cards List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <p
        v-if="!authenticators.length"
        class="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ t('empty.authenticators') }}
      </p>

      <div
        v-for="item of authenticators"
        :key="item.id"
        class="flex flex-col gap-2.5 sm:gap-3 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150"
      >
        <div class="flex items-center justify-between gap-3 min-w-0">
          <strong class="font-bold text-slate-900 dark:text-white truncate text-sm">
            {{ item.issuer }}
          </strong>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
            {{ item.accountName }}
          </span>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {{ t('fields.totpSecret') }}
          </span>
          <code class="block w-full overflow-x-auto p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {{ item.secret }}
          </code>
        </div>

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
            @click="openEditAuthenticatorForm(item)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="md"
            square
            @click="emit('remove-record', '/api/vault/authenticators', item.id, item.issuer)"
          />
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal
      v-model:open="showAuthenticatorForm"
      :title="editingAuthenticatorId ? t('actions.editAuthenticator') : t('actions.addAuthenticator')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitAuthenticatorForm"
        >
          <UFormField
            :label="t('fields.issuer')"
            required
          >
            <UInput
              v-model="authenticatorForm.issuer"
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
              v-model="authenticatorForm.accountName"
              :placeholder="t('placeholders.accountExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('fields.totpSecret')"
            required
          >
            <UInput
              v-model="authenticatorForm.secret"
              :placeholder="t('placeholders.totpSecretExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.notes')">
            <UInput
              v-model="authenticatorForm.notes"
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
              @click="closeAuthenticatorForm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="font-semibold"
            >
              {{ editingAuthenticatorId ? t('actions.save') : t('actions.addAuthenticator') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
