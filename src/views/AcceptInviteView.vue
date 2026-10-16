
<template>
  <main class="invite-page">
    <section class="invite-card">
      <p class="eyebrow">A LITTLE SOMETHING FOR YOU ♡</p>
      <h1>Make yourself <span>at home.</span></h1>

      <p class="description">
        Set your password to open your personal little corner of our website.
      </p>

      <form v-if="!finished" @submit.prevent="setPassword">
        <label for="newPassword">Create your password</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          minlength="8"
          autocomplete="new-password"
          placeholder="At least 8 characters"
          required
        />

        <label for="confirmPassword">Confirm your password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          minlength="8"
          autocomplete="new-password"
          placeholder="Enter it again"
          required
        />

        <p v-if="message" class="message">{{ message }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Setting up your account...' : 'Open my letters ♡' }}
        </button>
      </form>

      <p v-else class="description">
        Your password is ready! You can now sign in to see your letters. ♡
      </p>

      <p v-if="!sessionReady && !loading" class="help">
        Open this page using a valid invitation link to set your password.
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)
const finished = ref(false)
const sessionReady = ref(false)

onMounted(async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    message.value = error.message
    return
  }

  sessionReady.value = Boolean(data.session)

  if (!sessionReady.value && window.location.hash.includes('access_token=')) {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hash.get('access_token')
    const refreshToken = hash.get('refresh_token')

    if (accessToken && refreshToken) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

      if (sessionError) {
        message.value = 'This invitation link may have expired. Request a new one.'
        return
      }

      sessionReady.value = Boolean(sessionData.session)
    }
  }

  if (window.location.hash.includes('error_description=')) {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    message.value = hash.get('error_description') || 'Your invitation link is invalid or expired.'
  }
})

async function setPassword() {
  message.value = ''

  if (newPassword.value.length < 8) {
    message.value = 'Please use at least 8 characters.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Your passwords do not match.'
    return
  }

  loading.value = true

  try {
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !data.session) {
      throw new Error('Your invitation session is missing or expired. Please request a new invitation.')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) throw error

    finished.value = true
    await supabase.auth.signOut()

    setTimeout(() => {
      router.replace('/')
    }, 2500)
  } catch (error) {
    message.value = error.message || 'Could not set your password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(ellipse at top, rgba(174, 86, 125, 0.2), transparent 60%),
    #170e18;
  color: #ffe8f1;
}

.invite-card {
  width: min(100%, 440px);
  padding: 32px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 174, 207, 0.25);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.25);
}

.eyebrow {
  color: #f5a2c5;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
}

h1 {
  font-size: clamp(2rem, 7vw, 3rem);
  line-height: 1.1;
}

h1 span {
  color: #f5a2c5;
}

.description,
.help {
  line-height: 1.7;
  color: rgba(255, 232, 241, 0.8);
}

form {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

label {
  margin-top: 8px;
  font-size: 0.9rem;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  color: #ffe8f1;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 174, 207, 0.3);
  border-radius: 12px;
  font: inherit;
}

button {
  margin-top: 12px;
  padding: 14px 18px;
  border: none;
  border-radius: 14px;
  color: #341525;
  background: #f5a2c5;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.message {
  color: #ffb9c8;
  overflow-wrap: anywhere;
}

.help {
  font-size: 0.8rem;
}
</style>
