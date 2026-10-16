
<template>
  <main class="admin-page">
    <header class="admin-header">
      <p class="eyebrow">✦ YOUR PRIVATE SPACE ✦</p>
      <h1>Letter <span>Dashboard</span> ♡</h1>
      <p>Every little thing you want him to know.</p>
    </header>

    <section class="dashboard">
      <div class="toolbar">
        <div>
          <h2>Your letters</h2>
          <p>{{ letters.length }} letter(s) saved</p>
        </div>
        <button class="primary-button" @click="newLetter">
          + New letter
        </button>
      </div>

      <p v-if="loading" class="notice">Loading your letters... ♡</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div v-else class="workspace">
        <aside class="letter-list">
          <p v-if="!letters.length" class="empty">
            No letters yet. Create your first one! ♡
          </p>

          <Draggable
            v-model="letters"
            item-key="id"
            handle=".drag-handle"
            :animation="200"
            @end="saveOrder"
          >
            <template #item="{ element, index }">
              <article
                class="letter-item"
                :class="{ selected: editingId === element.id && !isNew }"
              >
                <button class="drag-handle" title="Drag to reorder">⠿</button>
                <button class="letter-select" @click="editLetter(element)">
                  <span class="letter-number">{{ index + 1 }}</span>
                  <span class="letter-info">
                    <strong>{{ element.title }}</strong>
                    <small>{{ formatDate(element.letter_date) }}</small>
                  </span>
                </button>
                <button
                  class="delete-button"
                  title="Delete letter"
                  @click="deleteLetter(element)"
                >×</button>
              </article>
            </template>
          </Draggable>
        </aside>

        <section class="editor">
          <h2>{{ isNew ? 'Write a new letter' : 'Edit your letter' }}</h2>

          <form @submit.prevent="saveLetter">
            <label for="letter-title">Letter title</label>
            <input
              id="letter-title"
              v-model.trim="form.title"
              placeholder="e.g. Open when you miss me"
              maxlength="150"
              required
            />

            <label for="letter-date">Letter date</label>
            <input
              id="letter-date"
              v-model="form.letter_date"
              type="date"
              required
            />

            <label for="letter-content">Letter contents</label>
            <textarea
              id="letter-content"
              v-model="form.content"
              placeholder="Write everything you want him to know..."
              rows="14"
              required
            />

            <label for="letter-closing">Letter closing</label>
            <input
              id="letter-closing"
              v-model="form.closing"
              placeholder="e.g. With all my love,"
              maxlength="200"
            />

            <label for="letter-signature">Signature</label>
            <input
              id="letter-signature"
              v-model="form.signature"
              placeholder="e.g. Your person ♡"
              maxlength="200"
            />

            <p v-if="editorError" class="error">{{ editorError }}</p>

            <div class="form-actions">
              <button type="button" class="secondary-button" @click="newLetter">
                Clear
              </button>
              <button class="primary-button" type="submit" :disabled="saving">
                {{ saving ? 'Saving...' : '♡ Save letter' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>

    <p class="footer-note">Made with love, just for him ♡</p>
    <button class="logout" @click="logout">Log out</button>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import { supabase } from '../lib/supabase'

const router = useRouter()
const letters = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const editorError = ref('')
const editingId = ref(null)
const isNew = ref(true)

const form = reactive({
  title: '',
  letter_date: new Date().toLocaleDateString('en-CA'),
  content: '',
  closing: 'With all my love,',
  signature: 'Your person',
})

function resetForm() {
  editingId.value = null
  isNew.value = true
  form.title = ''
  form.letter_date = new Date().toLocaleDateString('en-CA')
  form.content = ''
  form.closing = 'With all my love,'
  form.signature = 'Your person'
  editorError.value = ''
}

function newLetter() {
  resetForm()
}

function editLetter(letter) {
  editingId.value = letter.id
  isNew.value = false
  form.title = letter.title
  form.letter_date = letter.letter_date || ''
  form.content = letter.content
  form.closing = letter.closing ?? 'With all my love,'
  form.signature = letter.signature ?? 'Your person'
  editorError.value = ''
}

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function loadLetters() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = error.message
  } else {
    letters.value = data || []
  }

  loading.value = false
}

async function saveLetter() {
  saving.value = true
  editorError.value = ''

  try {
    if (isNew.value) {
      const { error } = await supabase.from('letters').insert({
        title: form.title,
        letter_date: form.letter_date || null,
        content: form.content,
        closing: form.closing,
        signature: form.signature,
        position: letters.value.length,
      })

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('letters')
        .update({
          title: form.title,
          letter_date: form.letter_date || null,
          content: form.content,
          closing: form.closing,
          signature: form.signature,
        })
        .eq('id', editingId.value)

      if (error) throw error
    }

    await loadLetters()
    resetForm()
  } catch (error) {
    editorError.value = error.message || 'Could not save your letter.'
  } finally {
    saving.value = false
  }
}

async function deleteLetter(letter) {
  if (!window.confirm(`Delete "${letter.title}"? This cannot be undone.`)) {
    return
  }

  const { error } = await supabase
    .from('letters')
    .delete()
    .eq('id', letter.id)

  if (error) {
    errorMessage.value = error.message
    return
  }

  if (editingId.value === letter.id) resetForm()
  await loadLetters()
}

async function saveOrder() {
  errorMessage.value = ''

  for (const [index, letter] of letters.value.entries()) {
    const { error } = await supabase
      .from('letters')
      .update({ position: index })
      .eq('id', letter.id)

    if (error) {
      errorMessage.value = `Could not save the new order: ${error.message}`
      await loadLetters()
      return
    }
  }
}

async function logout() {
  await supabase.auth.signOut()
  sessionStorage.removeItem('adminUnlocked')
  sessionStorage.removeItem('flowerGardenUnlocked')
  sessionStorage.removeItem('perspective')
  router.replace('/')
}

onMounted(loadLetters)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 48px 6%;
  color: #ffe8f1;
  background: #170f18;
  font-family: inherit;
}

.admin-header {
  text-align: center;
  margin-bottom: 42px;
}

.eyebrow {
  color: #e6a0bb;
  letter-spacing: 3px;
  font-size: 11px;
}

.admin-header h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  margin: 14px 0;
}

.admin-header h1 span {
  color: #e6a0bb;
  font-style: italic;
}

.admin-header > p:last-child,
.toolbar p {
  color: #bda7b3;
}

.dashboard {
  max-width: 1150px;
  margin: auto;
  padding: 28px;
  background: rgba(255, 235, 245, 0.035);
  border: 1px solid rgba(255, 190, 218, 0.16);
  border-radius: 22px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.toolbar h2,
.editor h2 {
  margin: 0 0 8px;
}

.toolbar p {
  margin: 0;
  font-size: 13px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(230px, 0.8fr) minmax(0, 1.4fr);
  gap: 28px;
}

.letter-list {
  min-width: 0;
}

.letter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  margin-bottom: 9px;
  border: 1px solid rgba(255, 190, 218, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.letter-item.selected {
  border-color: #d98eaf;
  background: rgba(217, 142, 175, 0.1);
}

.drag-handle,
.delete-button {
  color: #e6a0bb;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 20px;
}

.drag-handle {
  cursor: grab;
}

.letter-select {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  text-align: left;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.letter-number {
  color: #e6a0bb;
}

.letter-info {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.letter-info strong {
  overflow-wrap: anywhere;
}

.letter-info small {
  color: #bda7b3;
}

.editor {
  min-width: 0;
  padding: 24px;
  border: 1px solid rgba(255, 190, 218, 0.12);
  border-radius: 16px;
}

.editor form {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.editor label {
  color: #e6a0bb;
  font-size: 13px;
}

.editor input,
.editor textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  color: #ffe8f1;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 190, 218, 0.2);
  border-radius: 10px;
  font: inherit;
}

.editor input:focus,
.editor textarea:focus {
  outline: 1px solid #d98eaf;
  border-color: #d98eaf;
}

.editor textarea {
  resize: vertical;
  line-height: 1.7;
}

.primary-button,
.secondary-button {
  padding: 12px 18px;
  border-radius: 10px;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  color: #2a1420;
  background: #e6a0bb;
  border: 1px solid #e6a0bb;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.secondary-button {
  color: #ffe8f1;
  background: transparent;
  border: 1px solid rgba(255, 190, 218, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.notice,
.empty,
.footer-note {
  color: #bda7b3;
}

.error {
  color: #ff9cba;
  overflow-wrap: anywhere;
}

.footer-note {
  margin-top: 28px;
  text-align: center;
}

.logout {
  display: block;
  margin: 12px auto;
  color: #e6a0bb;
  background: transparent;
  border: 0;
  cursor: pointer;
}

@media (max-width: 760px) {
  .admin-page {
    padding: 30px 16px;
  }

  .dashboard {
    padding: 18px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .editor {
    padding: 16px;
  }

  .toolbar {
    align-items: flex-start;
  }
}
</style>
