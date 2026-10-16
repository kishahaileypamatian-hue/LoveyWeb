
<template>
  <main class="home-page">
    <div class="password-layout">
      <div class="home-glow"></div>

      <figure class="password-polaroid">
        <img src="/images/me.jpg" alt="A photo of me" />
        <figcaption>your favorite person ♡</figcaption>
      </figure>

      <section class="password-content">
        <p class="eyebrow">A LITTLE SOMETHING FOR YOU</p>

        <h1>
          A little <span>{{ adminMode ? 'admin sign-in.' : 'secret.' }}</span>
        </h1>

        <template v-if="!adminMode">
          <p class="home-description">
            You know me, don't you?
            So tell me, who am I to you? ♡
          </p>

          <form class="password-form" @submit.prevent="checkPassword">
            <label for="passwordInput">Who am I to you?</label>

            <div class="password-input-wrap">
              <input
                id="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Your answer, my love..."
                autocomplete="off"
                required
              />

              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <p class="password-error" aria-live="polite">
              {{ errorMessage }}
            </p>

            <button type="submit" class="primary-button password-submit">
              <span>Unlock my surprise</span>
              <span class="button-arrow">♡</span>
            </button>
          </form>
        </template>

        <template v-else>
          <p class="home-description">
            Welcome back, sweetheart. Sign in to manage your letters. ♡
          </p>

          <form class="password-form" @submit.prevent="adminLogin">
            <label for="adminEmail">Email</label>
            <input
              id="adminEmail"
              v-model.trim="email"
              type="email"
              placeholder="Your email"
              autocomplete="username"
              required
            />

            <label for="adminPassword">Password</label>
            <div class="password-input-wrap">
              <input
                id="adminPassword"
                v-model="adminPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Your password"
                autocomplete="current-password"
                required
              />

              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <p class="password-error" aria-live="polite">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="primary-button password-submit"
              :disabled="loading"
            >
              <span>{{ loading ? 'Signing in...' : 'Enter my dashboard' }}</span>
              <span class="button-arrow">♡</span>
            </button>

            <button type="button" class="back-button" @click="backToMain">
              ← Back
            </button>
          </form>
        </template>

        <p class="home-footer">A little surprise, made with love ♡</p>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const adminMode = ref(false)

const email = ref('')
const adminPassword = ref('')
const loading = ref(false)

const HIS_PASSWORD = 'Lovey'
const YOUR_PASSWORD = 'Covey'

function normalizeTitleCase(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase())
}

function checkPassword() {
  errorMessage.value = ''

  const enteredPassword = normalizeTitleCase(password.value)

  if (enteredPassword === normalizeTitleCase(HIS_PASSWORD)) {
    sessionStorage.setItem('flowerGardenUnlocked', 'true')
    sessionStorage.setItem('perspective', 'his')
    router.push('/home')
  } else if (enteredPassword === normalizeTitleCase(YOUR_PASSWORD)) {
    adminMode.value = true
    password.value = ''
    showPassword.value = false
  } else {
    errorMessage.value = 'Not quite! Try again, sweetheart. ♡'
    password.value = ''
  }
}

async function adminLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: adminPassword.value,
    })

    if (error) throw error

    if (!data.user) {
      throw new Error('Could not verify your account. Please try again.')
    }

    sessionStorage.setItem('adminUnlocked', 'true')
    sessionStorage.setItem('perspective', 'mine')

    await router.push('/admin')
  } catch (error) {
    errorMessage.value =
      error.message || 'Sign-in failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function backToMain() {
  adminMode.value = false
  email.value = ''
  adminPassword.value = ''
  errorMessage.value = ''
  showPassword.value = false
}
</script>


<style scoped>
/* Make the email input match the romantic password field */
.password-form input[type="email"] {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 14px 16px;
  color: #ffe8f1;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 174, 207, 0.25);
  border-radius: 14px;
  outline: none;
  font: inherit;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.password-form input[type="email"]:focus {
  border-color: #f5a2c5;
  box-shadow: 0 0 0 3px rgba(245, 162, 197, 0.12);
}

.password-form input[type="email"]::placeholder {
  color: rgba(255, 210, 228, 0.48);
}

/* Make the Back button match the page */
.back-button {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 0;
  color: #f5a2c5;
  background: transparent;
  border: none;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #ffe1ed;
}
</style>
