<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const isDarkMode = ref(false)
let themeObserver: MutationObserver | null = null

function syncThemeMode() {
  if (!import.meta.client) return
  isDarkMode.value = document.documentElement.classList.contains('theme-dark')
}

onMounted(() => {
  syncThemeMode()
  themeObserver = new MutationObserver(syncThemeMode)
  themeObserver.observe(document.documentElement, {
    attributeFilter: ['class'],
    attributes: true,
  })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      :class="{ 'modal-backdrop-dark': isDarkMode }"
      @click.self="emit('close')"
    >
      <section
        class="modal-panel"
        :class="{ 'modal-panel-dark': isDarkMode }"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button
            class="close-button"
            type="button"
            :aria-label="t('actions.cancel')"
            :title="t('actions.cancel')"
            @click="emit('close')"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 14px;
  background: rgb(15 23 42 / 42%);
  backdrop-filter: blur(4px);
}

.modal-panel {
  color-scheme: light;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  width: min(100%, 420px);
  max-width: calc(100vw - 28px);
  max-height: calc(100vh - 28px);
  overflow: hidden;
  border: 1px solid var(--ui-border, #dbe2ec);
  border-radius: 8px;
  padding: 16px;
  background: var(--ui-panel-bg-strong, #fff);
  box-shadow: 0 24px 80px rgb(15 23 42 / 22%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  color: var(--ui-heading, #101828);
  font-size: 18px;
}

.modal-body {
  min-width: 0;
  overflow: auto;
}

.close-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  min-height: 0;
  place-items: center;
  border: 1px solid var(--ui-border, #d1d9e4);
  border-radius: 999px;
  padding: 0;
  color: var(--ui-muted, #526071);
  background: var(--ui-control-bg-strong, #fff);
  cursor: pointer;
}

.close-button:hover {
  color: var(--ui-heading, #151b23);
  background: var(--ui-control-bg, #f5f7fb);
}

.close-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.modal-backdrop-dark,
:global(html.theme-dark) .modal-backdrop {
  background: rgb(2 6 23 / 66%);
}

.modal-panel-dark,
:global(html.theme-dark) .modal-panel {
  color-scheme: dark;
  border-color: var(--ui-border, #334155);
  color: var(--ui-text, #e5e7eb);
  background:
    linear-gradient(180deg, rgb(15 23 42 / 98%), rgb(15 23 42 / 94%)),
    var(--ui-panel-bg-strong, #0f172a);
  box-shadow: 0 24px 80px rgb(0 0 0 / 36%);
}

.modal-panel-dark .modal-header h2,
:global(html.theme-dark) .modal-header h2 {
  color: #f8fafc;
}

.modal-panel-dark .close-button,
:global(html.theme-dark) .close-button {
  border-color: #334155;
  color: var(--ui-text, #e5e7eb);
  background: var(--ui-control-bg, rgb(30 41 59 / 86%));
}

.modal-panel-dark .close-button:hover,
:global(html.theme-dark) .close-button:hover {
  color: #f8fafc;
  background: #1e293b;
}

.modal-panel-dark :deep(.form-field),
.modal-panel-dark :deep(.confirm-dialog p),
.modal-panel-dark :deep(.checkbox),
:global(html.theme-dark) .modal-body :deep(.form-field),
:global(html.theme-dark) .modal-body :deep(.confirm-dialog p),
:global(html.theme-dark) .modal-body :deep(.checkbox) {
  color: var(--ui-muted, #cbd5e1);
}

.modal-panel-dark :deep(.form-field span),
:global(html.theme-dark) .modal-body :deep(.form-field span) {
  color: var(--ui-text, #e5e7eb);
}

.modal-panel-dark :deep(input),
.modal-panel-dark :deep(textarea),
.modal-panel-dark :deep(select),
.modal-panel-dark :deep(.checkbox),
:global(html.theme-dark) .modal-body :deep(input),
:global(html.theme-dark) .modal-body :deep(textarea),
:global(html.theme-dark) .modal-body :deep(select),
:global(html.theme-dark) .modal-body :deep(.checkbox) {
  border-color: #334155;
  color: var(--ui-text, #e5e7eb);
  background: var(--ui-control-bg-strong, #1e293b) !important;
}

.modal-panel-dark :deep(option),
:global(html.theme-dark) .modal-body :deep(option) {
  color: #e5e7eb;
  background: #0f172a !important;
}

.modal-panel-dark :deep(.checkbox input),
:global(html.theme-dark) .modal-body :deep(.checkbox input) {
  accent-color: #818cf8;
  background: transparent !important;
}

.modal-panel-dark :deep(input::placeholder),
.modal-panel-dark :deep(textarea::placeholder),
:global(html.theme-dark) .modal-body :deep(input::placeholder),
:global(html.theme-dark) .modal-body :deep(textarea::placeholder) {
  color: #94a3b8;
}

.modal-panel-dark :deep(input:focus),
.modal-panel-dark :deep(textarea:focus),
.modal-panel-dark :deep(select:focus),
:global(html.theme-dark) .modal-body :deep(input:focus),
:global(html.theme-dark) .modal-body :deep(textarea:focus),
:global(html.theme-dark) .modal-body :deep(select:focus) {
  border-color: #818cf8;
  background: #1e293b !important;
  box-shadow: 0 0 0 4px rgb(129 140 248 / 18%);
}

.modal-panel-dark :deep(.app-button.app-button),
:global(html.theme-dark) .modal-body :deep(.app-button.app-button) {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%) !important;
}

.modal-panel-dark :deep(.app-button.app-button:hover),
:global(html.theme-dark) .modal-body :deep(.app-button.app-button:hover) {
  border-color: #475569;
  color: #f8fafc;
  background: #1e293b !important;
}

.modal-panel-dark :deep(.app-button-primary.app-button-primary),
:global(html.theme-dark) .modal-body :deep(.app-button-primary.app-button-primary) {
  border-color: #6366f1;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb) !important;
}

.modal-panel-dark :deep(.app-button-danger.app-button-danger),
:global(html.theme-dark) .modal-body :deep(.app-button-danger.app-button-danger) {
  border-color: #7f1d1d;
  color: #fecaca;
  background: #2f1518 !important;
}

.modal-panel-dark :deep(.app-button-danger.app-button-danger:hover),
:global(html.theme-dark) .modal-body :deep(.app-button-danger.app-button-danger:hover) {
  border-color: #991b1b;
  color: #fee2e2;
  background: #3f171b !important;
}
</style>
