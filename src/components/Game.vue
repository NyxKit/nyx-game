<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from '@/classes/EventBus'
import StartGame from '../game/main'
import Phaser from 'phaser'

// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits(['current-active-scene'])

onMounted(() => {
  game.value = StartGame('game')
  
  EventBus.on('current-scene-ready', (sceneInstance: Phaser.Scene) => { 
    emit('current-active-scene', sceneInstance)
    scene.value = sceneInstance
  })
})

onUnmounted(() => {
  if (!game.value) return
  game.value.destroy(true)
  game.value = null
})

defineExpose({ scene, game })
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
