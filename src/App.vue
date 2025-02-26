<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Game, MainMenu, Hiscores, Settings, GameMenu, Debug } from '@/components'
import useInterfaceStore from '@/stores/interface'
import useGameStore from './stores/game'
import useClientStore from './stores/client'

const { isPlaying } = storeToRefs(useInterfaceStore())
const { currentScene, setGameRef } = useGameStore()
const { setScreenSize } = useClientStore()

const gameRef = ref()

onMounted(() => {
  setGameRef(gameRef.value)
  window.addEventListener('resize', setScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setScreenSize)
})

</script>

<template>
  <MainMenu v-if="!isPlaying" class="view" />
  <Settings />
  <Hiscores />
  <GameMenu />
  <Debug />
  <Game ref="gameRef" @current-active-scene="currentScene" />
</template>

<style lang="scss">
#app {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
}

main, .view, canvas {
  width: 100%;
  height: 100%;
}

.view {
  position: fixed;
  z-index: 1;
}
</style>
