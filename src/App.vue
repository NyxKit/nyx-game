<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Game, MainMenu, Hiscores, Settings, GameMenu, Debug } from '@/components'
import { NyxProgress } from 'nyx-kit/components'
import useGameStore from './stores/game'
import useClientStore from './stores/client'
import { NyxSize, NyxTheme } from 'nyx-kit/types'

const { isPlaying, isPreloadComplete, preloadProgress } = storeToRefs(useGameStore())
const { setScreenSize } = useClientStore()

const isDebug = computed(() => {
  const hash = window.location.hash.substring(1)
  return hash === 'debug'
})

onMounted(() => {
  window.addEventListener('resize', setScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setScreenSize)
})

</script>

<template>
  <div class="preloader" v-if="!isPreloadComplete">
    <NyxProgress
      class="preloader__progress"
      v-model="preloadProgress"
      :min="0"
      :max="1"
      :theme="NyxTheme.Primary"
      :size="NyxSize.XLarge"
    />
  </div>
  <transition name="fade">
    <div class="interface" v-if="isPreloadComplete && !isPlaying && !isDebug">
      <MainMenu class="view" />
      <Settings />
      <Hiscores />
      <GameMenu />
    </div>
  </transition>
  
  <Debug />
  <Game />
</template>

<style lang="scss">
#app {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
}

body, pre, code {
  font-family: var(--nyx-font-family-pixel);
}

main, .view, canvas {
  width: 100%;
  height: 100%;
}

.view {
  position: fixed;
  z-index: 1;
}

.preloader {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &__progress {
    max-width: 90dvw;
    width: 40rem;
  }
}

// .v-enter-active,
// .v-leave-active {
//   transition: opacity 0.5s ease;
// }

// .v-enter-to,
// .v-leave-from {
//   opacity: 1;
// }

// .v-enter-from,
// .v-leave-to {
//   opacity: 0;
// }
</style>
