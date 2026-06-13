<script setup lang="ts">
type User = {
  id: number
  username: string
  displayName: string
  role: string
  avatarUrl?: string
}

const router = useRouter()
const { data } = await useFetch<{ user: User | null }>('/api/auth/me')
const user = computed(() => data.value?.user || null)

if (!user.value) {
  await navigateTo('/login')
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <AppShell
    v-if="user"
    :user="user"
    @logout="logout"
  >
    <slot />
  </AppShell>
</template>
