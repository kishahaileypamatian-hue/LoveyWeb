
<template>
  <span
    v-for="heart in hearts"
    :key="heart.id"
    class="cursor-heart"
    :style="{
      left: `${heart.x}px`,
      top: `${heart.y}px`,
      '--drift': `${heart.drift}px`,
      '--rotation': `${heart.rotation}deg`,
    }"
    aria-hidden="true"
  >
    {{ heart.symbol }}
  </span>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const hearts = ref([])

const symbols = ['♡', '♥', '💗', '💕']
let lastHeartTime = 0
let nextId = 0

function handleMouseMove(event) {
  if (window.matchMedia('(pointer: coarse)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const now = performance.now()

  // Prevent too many hearts from appearing
  if (now - lastHeartTime < 65) return
  lastHeartTime = now

  const heart = {
    id: nextId++,
    x: event.clientX,
    y: event.clientY,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    drift: Math.random() * 60 - 30,
    rotation: Math.random() * 50 - 25,
  }

  hearts.value.push(heart)

  // Remove the heart after its CSS animation finishes
  window.setTimeout(() => {
    hearts.value = hearts.value.filter(item => item.id !== heart.id)
  }, 950)
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>
