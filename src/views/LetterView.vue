
<template>
  <main class="letter-page">
    <!-- Top navigation -->
    <header class="garden-header">
      <RouterLink to="/home" class="back-button">
        ← Back home
      </RouterLink>

      <p class="garden-label">✦ WORDS FROM MY HEART ✦</p>

      <div class="header-spacer"></div>
    </header>

    <div class="letters-page">
      <!-- Page heading -->
      <section class="letters-heading">
        <p class="eyebrow">A LITTLE COLLECTION OF LOVE</p>
        <h1>My <span>Letters</span> ♡</h1>
        <p>Little pieces of my heart, written just for you.</p>
      </section>

     
<!-- Loading and error messages -->
<p v-if="loading" class="letters-status">
  Gathering your letters... ♡
</p>

<p v-else-if="errorMessage" class="letters-status">
  {{ errorMessage }}
</p>

<p v-else-if="letters.length === 0" class="letters-status">
  No letters yet, but there is always more love to write. ♡
</p>

<!-- Sidebar and letter content -->
<section v-else class="letters-layout">

        <aside class="letters-sidebar">
          <h2>♡ My Letters</h2>

          <p class="sidebar-description">
            Every letter holds a little piece of us.
          </p>

          <button
            v-for="(letter, index) in letters"
            :key="letter.id"
            class="letter-tab"
            :class="{ active: selectedLetterId === letter.id }"
            :aria-pressed="selectedLetterId === letter.id"
            @click="selectLetter(letter.id)"
          >
            <span class="tab-icon">
              {{ selectedLetterId === letter.id ? '♥' : '♡' }}
            </span>

            <span class="tab-text">
            <span class="tab-title">{{ letter.title }}</span>
            <span class="tab-date">{{ letter.date }}</span>
            </span>

            <span class="tab-number">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </button>

          <div class="sidebar-footer">
            <span>✿</span>
            <p>{{ letters.length }} little pieces of my heart</p>
          </div>
        </aside>

        <!-- Selected letter -->
        <article
          v-if="selectedLetter"
          :key="selectedLetter.id"
          class="letter-display"
        >
          <div class="letter-paper">
            <div class="letter-decoration">♡ ✿ ♡</div>

            <p class="letter-date">
              {{ selectedLetter.date }}
            </p>

            <h2>{{ selectedLetter.title }}</h2>

            <div class="letter-content">
              <p
                v-for="(paragraph, index) in selectedLetter.paragraphs"
                :key="index"
              >
                {{ paragraph }}
              </p>
            </div>

            <div class="letter-signature">
            <p>{{ selectedLetter.closing }}</p>
            <span>{{ selectedLetter.signature }}</span>
            </div>

            <div class="letter-bottom-decoration">
              ✧ · · ♡ · · ✧
            </div>
          </div>

          <!-- Previous and next letter -->
          <div class="letter-navigation">
            <button
              class="nav-button"
              :disabled="selectedIndex === 0"
              @click="selectLetter(letters[selectedIndex - 1]?.id)"
            >
              ← Previous
            </button>

            <span>{{ selectedIndex + 1 }} / {{ letters.length }}</span>

            <button
              class="nav-button"
              :disabled="selectedIndex === letters.length - 1"
              @click="selectLetter(letters[selectedIndex + 1]?.id)"
            >
              Next →
            </button>
          </div>
        </article>
      </section>

      <footer class="letters-footer">
        <p>Written with love, always and forever. ♡</p>

        <RouterLink to="/flowers" class="flowers-button">
          A garden of flowers for you ✿
        </RouterLink>
      </footer>
    </div>
  </main>
</template>


<script setup>
import { computed, ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const letters = ref([])
const selectedLetterId = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const selectedIndex = computed(() =>
  letters.value.findIndex(letter => letter.id === selectedLetterId.value)
)

const selectedLetter = computed(() =>
  letters.value.find(letter => letter.id === selectedLetterId.value)
)

function selectLetter(id) {
  if (id !== undefined && letters.value.some(letter => letter.id === id)) {
    selectedLetterId.value = id
  }
}

function formatDate(date) {
  if (!date) return 'A LETTER FROM MY HEART'

  return new Date(`${date}T00:00:00`)
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase()
}

async function loadLetters() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('letters')
    .select('id, title, content, letter_date, created_at, position, closing, signature')    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = 'We could not load the letters. Please try again.'
    console.error('Error loading letters:', error)
    loading.value = false
    return
  }

  letters.value = (data || []).map(letter => ({
    ...letter,
    date: formatDate(letter.letter_date),
    paragraphs: (letter.content || '')
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean),
    closing: letter.closing ?? 'With all my love,',
    signature: letter.signature ?? 'Your person',
  }))

  if (!letters.value.some(letter => letter.id === selectedLetterId.value)) {
    selectedLetterId.value = letters.value[0]?.id ?? null
  }

  loading.value = false
}

onMounted(loadLetters)
</script>

<style scoped>
.letter-page {
  min-height: 100vh;
  color: #fff4f7;
  background:
    radial-gradient(ellipse at 50% 30%, #35202e 0%, transparent 65%),
    #100b10;
}

.letter-page * {
  box-sizing: border-box;
}

.garden-header {
  min-height: 76px;
  padding: 20px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);
}

.back-button {
  color: #bca8b5;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #ffd4e5;
}

.garden-label {
  color: #f5a6c8;
  font-size: 10px;
  letter-spacing: 3px;
  text-align: center;
}

.header-spacer {
  width: 78px;
  flex-shrink: 0;
}

.letters-page {
  width: min(1100px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 55px;
}

.letters-heading {
  text-align: center;
  margin-bottom: 38px;
}

.eyebrow {
  color: #f5a6c8;
  font-size: 10px;
  letter-spacing: 4px;
  margin-bottom: 14px;
}

.letters-heading h1 {
  color: #fff4f7;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(38px, 6vw, 56px);
  font-weight: 500;
  line-height: 1.25;
  margin: 0 0 12px;
}

.letters-heading h1 span {
  color: #f5a6c8;
  font-style: italic;
}

.letters-heading > p:last-child {
  color: #bca8b5;
  font-size: 13px;
  line-height: 1.8;
}

.letters-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: start;
  gap: 26px;
}

.letters-sidebar {
  padding: 23px 15px;
  background: rgba(27, 17, 26, 0.85);
  border: 1px solid rgba(255, 220, 240, 0.13);
  border-radius: 15px;
}

.letters-sidebar h2 {
  color: #ffd4e5;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 8px 5px;
}

.sidebar-description {
  color: #bca8b5;
  font-size: 11px;
  line-height: 1.7;
  margin: 0 5px 22px;
}

.letter-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 10px;
  margin-bottom: 7px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #bca8b5;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.letter-tab:hover {
  background: rgba(245, 166, 200, 0.06);
}

.letter-tab.active {
  background: rgba(245, 166, 200, 0.1);
  border-color: rgba(245, 166, 200, 0.23);
  color: #ffd4e5;
}

.tab-icon {
  color: #f5a6c8;
  font-size: 17px;
  flex-shrink: 0;
}

.tab-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.tab-title {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.tab-date {
  color: #9f8a99;
  font-size: 9px;
  letter-spacing: 0.5px;
}

.tab-number {
  color: #806b7b;
  font-size: 10px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 20px;
  padding: 15px 5px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.sidebar-footer span {
  color: #f5a6c8;
  font-size: 19px;
}

.sidebar-footer p {
  color: #9f8a99;
  font-size: 10px;
  line-height: 1.6;
}

.letter-display {
  min-width: 0;
  animation: letterAppear 0.35s ease both;
}

.letter-paper {
  position: relative;
  padding: clamp(28px, 5vw, 52px);
  color: #654d5a;
  background:
    radial-gradient(ellipse at top right, rgba(255, 214, 228, 0.65), transparent 45%),
    #fff4ed;
  border: 1px solid rgba(255, 223, 231, 0.8);
  border-radius: 5px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.25);
}

.letter-decoration {
  text-align: center;
  color: #bd648a;
  font-size: 27px;
  letter-spacing: 8px;
  margin-bottom: 25px;
}

.letter-date {
  text-align: center;
  color: #a07d8e;
  font-size: 10px;
  letter-spacing: 1.5px;
  line-height: 1.8;
  margin-bottom: 25px;
}

.letter-paper h2 {
  color: #684052;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(26px, 3vw, 37px);
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 28px;
  text-align: center;
}

.letter-content {
  color: #654d5a;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 14px;
  line-height: 2;
}

.letter-content p {
  margin: 0 0 19px;
  white-space: pre-line;
}

.letter-signature {
  margin-top: 35px;
  color: #775366;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 14px;
  line-height: 1.9;
  text-align: right;
}

.letter-signature p {
  margin: 0;
}

.letter-signature span {
  display: block;
  color: #b35f83;
  font-size: 22px;
  font-style: italic;
  margin-top: 5px;
}

.letter-bottom-decoration {
  color: #c67c9a;
  font-size: 17px;
  letter-spacing: 4px;
  margin-top: 35px;
  text-align: center;
}

.letter-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  color: #bca8b5;
  font-size: 11px;
}

.nav-button {
  padding: 11px 15px;
  border: 1px solid rgba(245, 166, 200, 0.23);
  border-radius: 999px;
  background: rgba(245, 166, 200, 0.05);
  color: #ffd4e5;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(245, 166, 200, 0.13);
}

.nav-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.letters-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-top: 35px;
  text-align: center;
}

.letters-footer p {
  color: #b69aaa;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 13px;
  font-style: italic;
}

.flowers-button {
  display: inline-block;
  padding: 14px 22px;
  border-radius: 999px;
  background: #ffd4e5;
  color: #28131f;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.flowers-button:hover {
  transform: translateY(-2px);
}

@keyframes letterAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  .garden-header {
    padding: 17px 16px;
    gap: 10px;
  }

  .garden-label {
    font-size: 8px;
    letter-spacing: 1.5px;
  }

  .header-spacer {
    width: 65px;
  }

  .letters-page {
    width: calc(100% - 28px);
    padding-top: 32px;
  }

  .letters-heading {
    margin-bottom: 25px;
  }

  .letters-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .letters-sidebar {
    padding: 18px 12px;
  }

  .letter-tab {
    padding: 12px 10px;
  }

  .letter-paper {
    padding: 30px 23px;
  }

  .letter-content {
    font-size: 14px;
    line-height: 1.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-display {
    animation: none;
  }

  .nav-button,
  .letter-tab,
  .flowers-button {
    transition: none;
  }
}
</style>
