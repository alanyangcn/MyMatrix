<script setup lang="ts">
type ButtonVariant = 'default' | 'primary' | 'danger'
type ButtonSize = 'sm' | 'md'
type ButtonAlign = 'start' | 'end' | 'stretch'
type ButtonType = 'button' | 'submit' | 'reset'

defineOptions({
  inheritAttrs: false,
})

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  align?: ButtonAlign
  type?: ButtonType
}>(), {
  variant: 'default',
  size: 'md',
  align: 'start',
  type: 'button',
})
</script>

<template>
  <button
    v-bind="$attrs"
    class="app-button"
    :class="[
      `app-button-${variant}`,
      `app-button-${size}`,
      `app-button-align-${align}`,
    ]"
    :type="type"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border: 1px solid var(--ui-border, #d1d9e4);
  border-radius: 7px;
  color: var(--ui-text, #1d2937);
  font: inherit;
  font-size: 13px;
  font-weight: 760;
  line-height: 1;
  background: var(--ui-control-bg-strong, rgb(255 255 255 / 88%));
  box-shadow: none;
  cursor: pointer;
}

.app-button.app-button:hover {
  border-color: var(--ui-border-strong, #98a7bb);
  background: var(--ui-control-bg, #f8fafc);
}

.app-button.app-button:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.app-button-sm.app-button-sm {
  min-height: 34px;
  padding: 8px 12px;
}

.app-button-md.app-button-md {
  min-height: 38px;
  padding: 9px 14px;
}

.app-button-align-end.app-button-align-end {
  justify-self: end;
}

.app-button-align-stretch.app-button-align-stretch {
  width: 100%;
}

.app-button-primary.app-button-primary {
  border-color: #4f46e5;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 10px 20px rgb(79 70 229 / 16%);
}

.app-button-primary.app-button-primary:hover {
  border-color: #4338ca;
  box-shadow: 0 12px 24px rgb(79 70 229 / 22%);
}

.app-button-danger.app-button-danger {
  border-color: var(--ui-danger-border, #fecaca);
  color: var(--ui-danger-text-strong, #b42318);
  background: var(--ui-danger-bg, #fff5f5);
}

.app-button-danger.app-button-danger:hover {
  border-color: var(--ui-danger-border, #fca5a5);
  color: var(--ui-danger-text-strong, #991b1b);
  background: var(--ui-danger-bg-hover, #fee2e2);
}

:global(html.theme-dark) .app-button.app-button {
  border-color: #334155;
  color: #e5e7eb;
  background: rgb(30 41 59 / 86%);
}

:global(html.theme-dark) .app-button.app-button:hover {
  border-color: #475569;
  color: #f8fafc;
  background: #1e293b;
}

:global(html.theme-dark) .app-button-primary.app-button-primary {
  border-color: #6366f1;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #2563eb);
}

:global(html.theme-dark) .app-button-primary.app-button-primary:hover {
  border-color: #818cf8;
  box-shadow: 0 12px 24px rgb(99 102 241 / 24%);
}

:global(html.theme-dark) .app-button-danger.app-button-danger {
  border-color: #7f1d1d;
  color: #fecaca;
  background: #2f1518;
}

:global(html.theme-dark) .app-button-danger.app-button-danger:hover {
  border-color: #991b1b;
  color: #fee2e2;
  background: #3f171b;
}
</style>
