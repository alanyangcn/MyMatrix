<script setup lang="ts">
type IconButtonIcon = 'edit' | 'delete'
type IconButtonVariant = 'default' | 'danger'
type IconButtonType = 'button' | 'submit' | 'reset'

defineOptions({
  inheritAttrs: false,
})

withDefaults(defineProps<{
  icon: IconButtonIcon
  label: string
  title?: string
  type?: IconButtonType
  variant?: IconButtonVariant
}>(), {
  title: undefined,
  type: 'button',
  variant: 'default',
})
</script>

<template>
  <button
    v-bind="$attrs"
    class="app-icon-button"
    :class="[`app-icon-button-${variant}`]"
    :aria-label="label"
    :title="title || label"
    :type="type"
  >
    <svg
      v-if="icon === 'edit'"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  </button>
</template>

<style scoped>
.app-icon-button {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  min-height: 0;
  border: 1px solid var(--ui-border, #d1d9e4);
  border-radius: 999px;
  padding: 0;
  color: var(--ui-muted, #4b5563);
  background: var(--ui-control-bg, #f8fafc);
  box-shadow: none;
  cursor: pointer;
}

.app-icon-button:hover {
  color: var(--ui-accent-text, #3730a3);
  background: var(--ui-accent-soft, #eef2ff);
}

.app-icon-button-danger {
  border-color: var(--ui-danger-border, #efcaca);
  color: var(--ui-danger-text, #9c2f2f);
  background: var(--ui-danger-bg, #fff7f7);
}

.app-icon-button-danger:hover {
  color: var(--ui-danger-text-strong, #b42318);
  background: var(--ui-danger-bg-hover, #fff1f1);
}

.app-icon-button svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}
</style>
