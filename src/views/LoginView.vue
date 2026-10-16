
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
          A little
          <span>
            {{ adminMode ? 'admin sign-in.' : guestMode ? 'your login.' : 'secret.' }}
          </span>
        </h1>

        <template v-if="!adminMode && !guestMode">
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
            {{
              adminMode
                ? 'Welcome back, sweetheart. Sign in to manage your letters. ♡'
                : 'Welcome back, my love. Sign in to open your letters. ♡'
            }}
          </p>

          <form
            class="password-form"
            @submit.prevent="adminMode ? adminLogin() : guestLogin()"
          >
            <label for="accountEmail">Email</label>
            <input
              id="accountEmail"
              v-model.trim="email"
              type="email"
              placeholder="Your email"
              autocomplete="username"
              required
            />

            <label for="accountPassword">Password</label>

            <div class="password-input-wrap">
              <input
                id="accountPassword"
                v-model="accountPassword"
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
              <span>
                {{
                  loading
                    ? 'Signing in...'
                    : adminMode
                      ? 'Enter my dashboard'
                      : 'Open my letters ♡'
                }}
              </span>
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
const guestMode = ref(false)

const email = ref('')
const accountPassword = ref('')
const loading = ref(false)

const ADMIN_UID = '35cdbed0-c2b7-4203-bcb7-1572c8491e22'

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
    guestMode.value = true
    adminMode.value = false
    password.value = ''
    email.value = ''
    accountPassword.value = ''
    showPassword.value = false
  } else if (enteredPassword === normalizeTitleCase(YOUR_PASSWORD)) {
    adminMode.value = true
    guestMode.value = false
    password.value = ''
    email.value = ''
    accountPassword.value = ''
    showPassword.value = false
  } else {
    errorMessage.value = 'Not quite! Try again, sweetheart. ♡'
    password.value = ''
  }
}

async function guestLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: accountPassword.value,
    })

    if (error) throw error

    if (!data.user || data.user.id === ADMIN_UID) {
      await supabase.auth.signOut()
      throw new Error('Please use a guest account to access your letters.')
    }

    sessionStorage.setItem('perspective', 'his')

    await router.push('/home')
  } catch (error) {
    errorMessage.value = error.message || 'Sign-in failed. Please try again.'
  } finally {
    loading.value = false
  }
}

async function adminLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: accountPassword.value,
    })

    if (error) throw error

    if (!data.user || data.user.id !== ADMIN_UID) {
      await supabase.auth.signOut()
      throw new Error(
        'This login is for the admin only. Please use Lovey to sign in.'
      )
    }

    sessionStorage.setItem('perspective', 'mine')

    await router.push('/admin')
  } catch (error) {
    errorMessage.value = error.message || 'Sign-in failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function backToMain() {
  adminMode.value = false
  guestMode.value = false
  email.value = ''
  accountPassword.value = ''
  errorMessage.value = ''
  showPassword.value = false
}
</script>

<style scoped>
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
