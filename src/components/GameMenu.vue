<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal, NyxButton } from 'nyx-kit/components'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import useGameStore from '@/stores/game'
import FormSettings from '@/components/FormSettings.vue'
import { GameState } from '@/types'

const gameStore = useGameStore()
const { isPaused } = storeToRefs(gameStore)

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    gameStore.togglePaused()
  }
}

const customClass = computed(() => {
  let className = 'game-menu'
  if (isPaused.value) {
    className += ' game-menu--visible'
  }
  return className
})

const onRestart = () => {
  gameStore.reset()
  gameStore.togglePaused()
}

const onQuit = () => {
  gameStore.reset()
  gameStore.setGameState(GameState.Menu)
}

const onResume = () => {
  gameStore.togglePaused()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

</script>

<template>
  <NyxModal
    v-if="isPaused"
    :customClass="customClass"
    :size="NyxSize.Small"
    static
  >
    <FormSettings />
    <template #footer>
      <div class="game-menu__buttons">
        <NyxButton @click="onRestart" :theme="NyxTheme.Warning">Restart</NyxButton>
        <NyxButton @click="onQuit" :theme="NyxTheme.Danger">Quit</NyxButton>
        <NyxButton @click="onResume" :theme="NyxTheme.Primary">Resume</NyxButton>
      </div>
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

  &__buttons {
    width: 100%;
    display: flex;
    gap: 2rem;
    justify-content: space-between;
  }
}
</style>
