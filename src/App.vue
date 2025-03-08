<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Game, MainMenu, Hiscores, Settings, GameMenu, Debug, GameInterface, GameOver } from '@/components'
import { NyxProgress, NyxModal } from 'nyx-kit/components'
import useGameStore from './stores/game'
import useClientStore from './stores/client'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import useInterfaceStore from './stores/interface'
import useAuthStore from './stores/auth'
import { useHiscoresStore, useSettingsStore } from './stores'

const { currentVolume } = storeToRefs(useSettingsStore())
const { debug, isInMenu, isPreloading, preloadProgress } = storeToRefs(useGameStore())
const { setScreenSize } = useClientStore()
const { isSettingsVisible } = storeToRefs(useInterfaceStore())
const { watchAuthState } = useAuthStore()
const { hasDebugged } = storeToRefs(useHiscoresStore())

const version = import.meta.env.VITE_APP_VERSION

watch(debug, (newVal) => {
  if (!newVal.isEnabled) return
  hasDebugged.value = true
}, { immediate: true, deep: 1 })

onMounted(async () => {
  watchAuthState()
  const settings = JSON.parse(localStorage.getItem('settings') ?? '{}')
  currentVolume.value = settings.currentVolume !== undefined ? settings.currentVolume : 1
  window.addEventListener('resize', setScreenSize)
})

onBeforeUnmount(async () => {
  window.removeEventListener('resize', setScreenSize)
})

</script>

<template>
  <div class="preloader" v-if="isPreloading">
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
    <div class="interface" v-if="isInMenu">
      <MainMenu class="view" />
      <NyxModal v-model="isSettingsVisible">
        <Settings />
      </NyxModal>
      <Hiscores />
      <GameMenu />
    </div>
  </transition>
  
  <Debug v-if="debug.isEnabled" />
  <GameMenu />
  <Game />
  <GameInterface />
  <GameOver />
  <span class="version">{{ version }}</span>
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

.version {
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 12px;
  opacity: 0.7;
  z-index: 1000;
  padding: 1rem;
}
</style>
