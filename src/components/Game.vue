<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from '@/classes/EventBus'
import StartGame from '../game'
import Phaser from 'phaser'
import useGameStore from '@/stores/game'

const { setCurrentScene, setPreloadComplete } = useGameStore()

const game = ref()

const init = () => {
  game.value = StartGame('game')
  EventBus.on('current-scene-ready', (scene: Phaser.Scene) => setCurrentScene(scene))
  EventBus.on('preload-complete', () => setPreloadComplete(true))
}

onMounted(init)
onUnmounted(() => {
  if (!game.value) return
  game.value.destroy(true)
  game.value = null
})

</script>

<template>
  <main id="game" class="game"></main>
</template>

<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
  position: relative;

  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    opacity: 0.05;
    background-image:
      linear-gradient(45deg, #b0b0b0 25%, transparent 25%),
      linear-gradient(-45deg, #b0b0b0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #b0b0b0 75%),
      linear-gradient(-45deg, transparent 75%, #b0b0b0 75%);
    background-size: 2rem 2rem;
    background-position: 0 0, 0 1rem, 1rem -1rem, -1rem 0px;
  }
}
</style>
