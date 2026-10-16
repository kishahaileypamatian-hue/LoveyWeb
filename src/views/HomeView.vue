
<template>
  <main class="home-page">
    <div class="home-container">
      <div class="home-glow"></div>

      <p class="eyebrow">✦ A LITTLE SOMETHING FOR YOU ✦</p>

      <h1>For <br /><span>my person.</span></h1>

      <p class="home-description">
        Hello my lovey, I love you so much.
      </p>

      <div class="flower-decoration" aria-hidden="true">
        <span>🌷</span>
        <span>🌼</span>
        <span>🌸</span>
      </div>

      <div class="home-actions">
        <RouterLink to="/letter" class="primary-button">
          <span>Read my letter</span>
          <span class="button-arrow">♡</span>
        </RouterLink>

        <RouterLink to="/flowers" class="secondary-button">
          <span>Flowers for you!</span>
          <span class="button-arrow">↗</span>
        </RouterLink>
      </div>

      <p class="home-footer">Made with a little love ♡</p>

      <button class="logout-link" @click="logout">
        Log out
      </button>
    </div>
  </main>
</template>

```vue
<script setup>
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout failed:', error.message)
      return
    }

    sessionStorage.removeItem('flowerGardenUnlocked')
    sessionStorage.removeItem('perspective')

    await router.replace('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.home-page {
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 50% 42%, #38202f 0%, transparent 48%),
    var(--background, #100b10);
}

.home-container {
  width: min(90%, 680px);
  text-align: center;
  padding: 70px 20px;
  position: relative;
  z-index: 1;
  animation: fadeUp 1s ease both;
}

.home-glow {
  position: absolute;
  width: 350px;
  height: 350px;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  background: rgba(231, 119, 169, 0.09);
  filter: blur(85px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}

.eyebrow {
  color: var(--pink, #f5a6c8);
  font-size: 10px;
  letter-spacing: 4px;
  line-height: 1.8;
  font-weight: 600;
}

.home-container h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 500;
  font-size: clamp(55px, 9vw, 88px);
  line-height: 1.08;
  margin: 24px 0;
  letter-spacing: -2px;
  color: var(--text, #fff4f7);
}

.home-container h1 span {
  color: var(--pink, #f5a6c8);
  font-style: italic;
}

.home-description {
  max-width: 390px;
  margin: 0 auto;
  color: var(--muted, #bca8b5);
  font-size: 14px;
  line-height: 1.9;
}

.flower-decoration {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  margin: 36px 0;
}

.flower-decoration span {
  display: inline-block;
  font-size: 32px;
  filter: drop-shadow(0 0 14px rgba(255, 150, 205, 0.2));
  animation: float 3s ease-in-out infinite;
}

.flower-decoration span:nth-child(2) {
  animation-delay: 0.4s;
  font-size: 43px;
}

.flower-decoration span:nth-child(3) {
  animation-delay: 0.8s;
}

.home-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 30px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;
  width: min(100%, 270px);
  min-height: 54px;
  padding: 0 25px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  text-decoration: none;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.primary-button {
  border: none;
  background: var(--pink-light, #ffd4e5);
  color: #28131f;
  font-weight: 700;
  box-shadow: 0 0 35px rgba(245, 166, 200, 0.12);
}

.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 35px rgba(245, 166, 200, 0.23);
}

.secondary-button {
  border: 1px solid rgba(245, 166, 200, 0.3);
  color: var(--pink-light, #ffd4e5);
  background: rgba(245, 166, 200, 0.05);
  font-weight: 600;
}

.secondary-button:hover {
  background: rgba(245, 166, 200, 0.12);
  transform: translateY(-2px);
}

.button-arrow {
  font-size: 20px;
}

.home-footer {
  margin-top: 35px;
  color: #8f7889;
  font-size: 11px;
  letter-spacing: 1px;
}

.logout-link {
  display: block;
  margin: 16px auto 0;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: rgba(188, 168, 181, 0.5);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.25s ease;
}

.logout-link:hover {
  color: var(--pink, #f5a6c8);
}

.logout-link:focus-visible {
  outline: 1px solid var(--pink, #f5a6c8);
  outline-offset: 3px;
  border-radius: 4px;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

@media (max-width: 600px) {
  .home-container {
    padding: 50px 10px;
  }

  .home-container h1 {
    letter-spacing: -1px;
  }

  .flower-decoration {
    gap: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-container,
  .flower-decoration span {
    animation: none;
  }

  .primary-button,
  .secondary-button,
  .logout-link {
    transition: none;
  }
}
</style>
