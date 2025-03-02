<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal, NyxButton } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import useGameStore from '@/stores/game'
import Settings from '@/components/Settings.vue'

const gameStore = useGameStore()
const { isPlaying, isPaused } = storeToRefs(gameStore)
const { togglePaused } = gameStore

const onKeyDown = (e: KeyboardEvent) => {
  if (!isPlaying.value) return
  if (e.key === 'Escape') {
    togglePaused()
  }
}

const customClass = computed(() => {
  let className = 'game-menu'
  if (isPaused.value) {
    className += ' game-menu--visible'
  }
  return className
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

</script>

<template>
  <NyxModal
    v-if="isPlaying && isPaused"
    :customClass="customClass"
    :size="NyxSize.Small"
    static
  >
    <Settings />
    <template #footer>
      <NyxButton @click="togglePaused">Resume</NyxButton>
    </template>
  </NyxModal>
</template>

<style lang="scss">
.game-menu {
  opacity: 0;
  transform: scale(1.1);
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;

  &--visible {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }
}
</style>
