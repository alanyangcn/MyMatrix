<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

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

const props = defineProps<{
  servers: ServerRecord[]
}>()

const emit = defineEmits<{
  'add-server': [payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }]
  'update-server': [id: number, payload: { name: string, provider: string, ipAddress: string, loginName: string, panelUrl: string, startTime: string, expiresAt: string, price: string, currency: string, autoRenew: boolean, remindAt: string, notes: string }]
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
  startTime: '',
  expiresAt: '',
  price: '',
  currency: 'CNY',
  autoRenew: false,
  remindAt: '',
  notes: '',
})

const providerOptions = computed(() => {
  const existing = props.servers
    .map(s => s.provider)
    .filter((p): p is string => !!p)

  const predefined = [
    'Alibaba Cloud',
    'Tencent Cloud',
    'Huawei Cloud',
    'AWS',
    'Google Cloud',
    'Azure',
    'DigitalOcean',
    'Linode',
    'Vultr',
    'Cloudflare',
    'BandwagonHost',
    'Tencent Cloud Lighthouse'
  ]

  const all = [...existing, ...predefined]
  const seen = new Set<string>()
  const unique: string[] = []
  for (const item of all) {
    const trimmed = item.trim()
    const lower = trimmed.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      unique.push(trimmed)
    }
  }
  return unique
})

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedDay = ref(new Date().getDate())

const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  const list = []
  const suffix = locale.value === 'zh-CN' ? '年' : ''
  for (let y = current - 10; y <= current + 10; y++) {
    list.push({ label: `${y}${suffix}`, value: y })
  }
  return list
})

const monthOptions = computed(() => {
  const suffix = locale.value === 'zh-CN' ? '月' : ''
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}${suffix}`,
    value: i + 1,
  }))
})

const dayOptions = computed(() => {
  const suffix = locale.value === 'zh-CN' ? '日' : ''
  const count = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  return Array.from({ length: count }, (_, i) => ({
    label: `${i + 1}${suffix}`,
    value: i + 1,
  }))
})

watch([selectedYear, selectedMonth], () => {
  const maxDay = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
  }
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

const durationUnit = ref<'year' | 'month'>('year')
const durationValue = ref<number>(1)
const autoCalculate = ref(true)

const expiresYear = ref(new Date().getFullYear())
const expiresMonth = ref(new Date().getMonth() + 1)
const expiresDay = ref(new Date().getDate())

const calculatedExpiresDate = computed(() => {
  const start = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value)
  if (durationUnit.value === 'year') {
    start.setFullYear(start.getFullYear() + durationValue.value)
  }
  else {
    start.setMonth(start.getMonth() + durationValue.value)
  }
  return start
})

const expiresYearOptions = computed(() => {
  const current = new Date().getFullYear()
  const list = []
  const suffix = locale.value === 'zh-CN' ? '年' : ''
  for (let y = current - 10; y <= current + 15; y++) {
    list.push({ label: `${y}${suffix}`, value: y })
  }
  return list
})

const expiresDayOptions = computed(() => {
  const suffix = locale.value === 'zh-CN' ? '日' : ''
  const count = new Date(expiresYear.value, expiresMonth.value, 0).getDate()
  return Array.from({ length: count }, (_, i) => ({
    label: `${i + 1}${suffix}`,
    value: i + 1,
  }))
})

// Keep day valid when year/month changes for expiration date
watch([expiresYear, expiresMonth], () => {
  const maxDay = new Date(expiresYear.value, expiresMonth.value, 0).getDate()
  if (expiresDay.value > maxDay) {
    expiresDay.value = maxDay
  }
})

watch([calculatedExpiresDate, autoCalculate], () => {
  if (autoCalculate.value) {
    const end = calculatedExpiresDate.value
    expiresYear.value = end.getFullYear()
    expiresMonth.value = end.getMonth() + 1
    expiresDay.value = end.getDate()
  }
}, { immediate: true })

function openAddServerForm() {
  editingServerId.value = null
  Object.assign(serverForm, {
    name: '',
    provider: '',
    ipAddress: '',
    loginName: '',
    panelUrl: '',
    startTime: '',
    expiresAt: '',
    price: '',
    currency: 'CNY',
    autoRenew: false,
    remindAt: '',
    notes: '',
  })
  const d = new Date()
  selectedYear.value = d.getFullYear()
  selectedMonth.value = d.getMonth() + 1
  selectedDay.value = d.getDate()

  expiresYear.value = d.getFullYear() + 1
  expiresMonth.value = d.getMonth() + 1
  expiresDay.value = d.getDate()

  durationUnit.value = 'year'
  durationValue.value = 1
  autoCalculate.value = true
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
    startTime: toDateInputValue(server.startTime),
    expiresAt: toDateInputValue(server.expiresAt),
    price: server.price || '',
    currency: server.currency || 'CNY',
    autoRenew: server.autoRenew,
    remindAt: toDateInputValue(server.remindAt),
    notes: server.notes || '',
  })

  if (server.startTime) {
    const d = new Date(server.startTime)
    selectedYear.value = d.getFullYear()
    selectedMonth.value = d.getMonth() + 1
    selectedDay.value = d.getDate()
  }
  else if (server.expiresAt) {
    const d = new Date(server.expiresAt)
    selectedYear.value = d.getFullYear()
    selectedMonth.value = d.getMonth() + 1
    selectedDay.value = d.getDate()
  }
  else {
    const d = new Date()
    selectedYear.value = d.getFullYear()
    selectedMonth.value = d.getMonth() + 1
    selectedDay.value = d.getDate()
  }

  if (server.expiresAt) {
    const d = new Date(server.expiresAt)
    expiresYear.value = d.getFullYear()
    expiresMonth.value = d.getMonth() + 1
    expiresDay.value = d.getDate()
  }
  else {
    const d = new Date()
    expiresYear.value = d.getFullYear() + 1
    expiresMonth.value = d.getMonth() + 1
    expiresDay.value = d.getDate()
  }

  durationUnit.value = 'year'
  durationValue.value = 1
  if (server.startTime && server.expiresAt) {
    autoCalculate.value = true
    const start = new Date(server.startTime)
    const end = new Date(server.expiresAt)
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    if (diffMonths > 0) {
      if (diffMonths % 12 === 0) {
        durationUnit.value = 'year'
        durationValue.value = diffMonths / 12
      }
      else {
        durationUnit.value = 'month'
        durationValue.value = diffMonths
      }
    }
  }
  else {
    autoCalculate.value = false
  }

  showServerForm.value = true
}

function onCreateProvider(arg1: any, arg2?: any) {
  const item = arg2 !== undefined ? arg2 : arg1
  serverForm.provider = typeof item === 'string' ? item : (item?.value || item?.label || String(item))
}

function onCreateCurrency(arg1: any, arg2?: any) {
  const item = arg2 !== undefined ? arg2 : arg1
  serverForm.currency = typeof item === 'string' ? item : (item?.value || item?.label || String(item))
}

function formatPriceOnBlur() {
  if (serverForm.price) {
    const parsed = parseFloat(serverForm.price)
    if (!isNaN(parsed)) {
      serverForm.price = parsed.toFixed(2)
    }
  }
}

function closeServerForm() {
  showServerForm.value = false
  editingServerId.value = null
}

function submitServerForm() {
  const start = new Date(selectedYear.value, selectedMonth.value - 1, selectedDay.value)
  const end = new Date(expiresYear.value, expiresMonth.value - 1, expiresDay.value)

  serverForm.startTime = toDateInputValue(start.getTime())
  serverForm.expiresAt = toDateInputValue(end.getTime())

  showServerForm.value = false
  if (editingServerId.value) {
    emit('update-server', editingServerId.value, { ...serverForm })
    editingServerId.value = null
  }
  else {
    emit('add-server', { ...serverForm })
  }
}

defineExpose({
  openEditServerForm,
})
</script>

<template>
  <div class="flex flex-col gap-3 sm:gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ t('tabs.servers') }}
      </h2>
      <UButton
        color="primary"
        size="md"
        icon="i-lucide-plus"
        class="font-semibold"
        @click="openAddServerForm"
      >
        {{ t('actions.addServer') }}
      </UButton>
    </div>

    <!-- Cards List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <p
        v-if="!servers.length"
        class="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {{ t('empty.servers') }}
      </p>

      <div
        v-for="item of servers"
        :key="item.id"
        class="flex flex-col gap-2.5 sm:gap-3 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150"
      >
        <div class="flex items-center justify-between gap-3 min-w-0">
          <strong class="font-bold text-slate-900 dark:text-white truncate text-sm">
            {{ item.name }}
          </strong>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
            {{ item.provider || '-' }}
          </span>
        </div>

        <div class="text-xs space-y-1 text-slate-500 dark:text-slate-400">
          <div>
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.ipAddress') }}:</span>
            {{ item.ipAddress }}
          </div>
          <div>
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.login') }}:</span>
            {{ item.loginName || '-' }}
          </div>
          <div>
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.expiresAt') }}:</span>
            {{ formatDate(item.expiresAt) }}
          </div>
          <div v-if="item.price">
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.price') }}:</span>
            {{ item.price }}<span v-if="item.currency" class="ml-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-90">{{ item.currency }}</span>
          </div>
          <div>
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.autoRenew') }}:</span>
            <span :class="item.autoRenew ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-500 dark:text-slate-400'">
              {{ item.autoRenew ? t('status.autoRenew') : t('status.manualRenew') }}
            </span>
          </div>
          <div v-if="item.remindAt">
            <span class="font-medium text-slate-400 dark:text-slate-500">{{ t('fields.remindAt') }}:</span>
            {{ formatDate(item.remindAt) }}
          </div>
        </div>

        <a
          v-if="item.panelUrl"
          :href="item.panelUrl"
          target="_blank"
          rel="noreferrer"
          class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate"
        >
          {{ item.panelUrl }}
        </a>

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
            @click="openEditServerForm(item)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="md"
            square
            @click="emit('remove-record', '/api/vault/servers', item.id, item.name)"
          />
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal
      v-model:open="showServerForm"
      :title="editingServerId ? t('actions.editServer') : t('actions.addServer')"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submitServerForm"
        >
          <UFormField
            :label="t('fields.name')"
            required
          >
            <UInput
              v-model="serverForm.name"
              :placeholder="t('placeholders.serverNameExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.provider')">
            <UInputMenu
              v-model="serverForm.provider"
              :items="providerOptions"
              :placeholder="t('placeholders.serverProviderExample')"
              create-item
              class="w-full"
              @create="onCreateProvider"
            />
          </UFormField>

          <UFormField
            :label="t('fields.ipAddress')"
            required
          >
            <UInput
              v-model="serverForm.ipAddress"
              :placeholder="t('placeholders.ipExample')"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.login')">
            <UInput
              v-model="serverForm.loginName"
              :placeholder="t('placeholders.loginNameExample')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.panelUrl')">
            <UInput
              v-model="serverForm.panelUrl"
              :placeholder="t('placeholders.panelUrlExample')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.startTime')">
            <div class="grid grid-cols-3 gap-2 w-full">
              <USelect
                v-model="selectedYear"
                :items="yearOptions"
              />
              <USelect
                v-model="selectedMonth"
                :items="monthOptions"
              />
              <USelect
                v-model="selectedDay"
                :items="dayOptions"
              />
            </div>
          </UFormField>

          <div class="flex items-center h-9">
            <USwitch
              v-model="autoCalculate"
              :label="t('fields.autoCalculate')"
            />
          </div>

          <UFormField v-if="autoCalculate" :label="t('fields.duration')">
            <div class="grid grid-cols-2 gap-2 w-full">
              <UInput
                v-model.number="durationValue"
                type="number"
                min="1"
                required
                class="w-full"
              />
              <USelect
                v-model="durationUnit"
                :items="[
                  { label: t('fields.yearUnit'), value: 'year' },
                  { label: t('fields.monthUnit'), value: 'month' },
                ]"
              />
            </div>
          </UFormField>

          <UFormField :label="t('fields.expiresAt')">
            <div class="grid grid-cols-3 gap-2 w-full">
              <USelect
                v-model="expiresYear"
                :items="expiresYearOptions"
                :disabled="autoCalculate"
              />
              <USelect
                v-model="expiresMonth"
                :items="monthOptions"
                :disabled="autoCalculate"
              />
              <USelect
                v-model="expiresDay"
                :items="expiresDayOptions"
                :disabled="autoCalculate"
              />
            </div>
          </UFormField>

          <div class="grid grid-cols-3 gap-3 w-full">
            <UFormField :label="t('fields.price')" class="col-span-2">
              <UInput
                v-model="serverForm.price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full"
                @blur="formatPriceOnBlur"
              />
            </UFormField>
            <UFormField :label="t('fields.currency')">
              <UInputMenu
                v-model="serverForm.currency"
                :items="['CNY', 'USD']"
                create-item
                class="w-full"
                @create="onCreateCurrency"
              />
            </UFormField>
          </div>

          <div class="flex items-center h-9">
            <USwitch
              v-model="serverForm.autoRenew"
              :label="t('fields.autoRenew')"
            />
          </div>

          <UFormField :label="t('fields.remindAt')">
            <UInput
              v-model="serverForm.remindAt"
              type="date"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('fields.notes')">
            <UInput
              v-model="serverForm.notes"
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
              @click="closeServerForm"
            >
              {{ t('actions.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              class="font-semibold"
            >
              {{ editingServerId ? t('actions.save') : t('actions.addServer') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
