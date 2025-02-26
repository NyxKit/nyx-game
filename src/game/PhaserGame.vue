<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { EventBus } from '@/classes/EventBus'
import StartGame from './main'
import Phaser from 'phaser'

// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits(['current-active-scene'])

onMounted(() => {
  game.value = StartGame('game-container')
  
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
  <div id="game-container"></div>
</template>
