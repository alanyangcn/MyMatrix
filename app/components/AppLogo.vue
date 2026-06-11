<template>
  <span
    class="app-logo"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 64 64"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="app-logo-bg"
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#4f46e5" />
          <stop
            offset=".48"
            stop-color="#2563eb"
          />
          <stop
            offset="1"
            stop-color="#0f766e"
          />
        </linearGradient>
      </defs>
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="14"
        fill="url(#app-logo-bg)"
      />
      <path
        d="M19 43V21l13 13 13-13v22"
        fill="none"
        stroke="white"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5.2"
      />
      <circle
        cx="19"
        cy="21"
        r="3.5"
        fill="#a7f3d0"
      />
      <circle
        cx="32"
        cy="34"
        r="3.5"
        fill="#bfdbfe"
      />
      <circle
        cx="45"
        cy="21"
        r="3.5"
        fill="#c7d2fe"
      />
      <circle
        cx="45"
        cy="43"
        r="3.5"
        fill="#a7f3d0"
      />
    </svg>
  </span>
</template>

<style scoped>
.app-logo {
  display: inline-grid;
  flex: 0 0 auto;
  width: var(--app-logo-size, 36px);
  height: var(--app-logo-size, 36px);
  place-items: center;
  border-radius: 8px;
  box-shadow: 0 10px 22px rgb(79 70 229 / 22%);
}

.app-logo svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
