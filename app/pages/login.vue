<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({
  layout: false,
})

type User = {
  id: number
  username: string
  displayName: string
  role: string
  avatarUrl?: string
}

const { t } = useI18n()

// 1. Fetch user data to check if already logged in
const { data: authData } = await useFetch<{ user: User | null }>('/api/auth/me')
const user = computed(() => authData.value?.user || null)

if (user.value) {
  await navigateTo('/')
}

const authMode = ref<'login' | 'register'>('login')
const authForm = reactive({
  username: '',
  password: '',
})
const authError = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function submitAuth() {
  authError.value = ''
  loading.value = true
  try {
    const endpoint = authMode.value === 'login' ? '/api/auth/login' : '/api/register'
    await $fetch<{ user: User }>(endpoint, {
      method: 'POST',
      body: authForm,
    })
    authForm.password = ''
    // Redirect to home page
    await navigateTo('/')
  }
  catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }, statusMessage?: string }
    authError.value = fetchError.data?.message || fetchError.statusMessage || t('errors.authenticationFailed')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScreen
    v-model:auth-mode="authMode"
    v-model:auth-form="authForm"
    v-model:show-password="showPassword"
    :auth-error="authError"
    :loading="loading"
    @submit="submitAuth"
  />
</template>
