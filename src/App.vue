<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal } from 'nyx-kit'
import Game from './components/Game.vue'
import MainMenu from './components/MainMenu.vue'
import Hiscores from './components/Hiscores.vue'
import Settings from './components/Settings.vue'
import GameMenu from './components/GameMenu.vue'
import useInterfaceStore from '@/stores/interface'

const { isPlaying } = storeToRefs(useInterfaceStore())

</script>

<template>
  <MainMenu v-if="!isPlaying" class="view" />
  <Settings />
  <Hiscores />
  <GameMenu />
  <Game />
</template>

<style lang="scss">
#app {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
}

main, .view {
  width: 100%;
  height: 100%;
}

.view {
  position: fixed;
  z-index: 1;
}
</style>
