<script setup lang="ts">
import useGameStore from '@/stores/game'
import { storeToRefs } from 'pinia'
import { NyxButton } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'

const gameStore = useGameStore()
const { changeScene, moveSprite, addSprite } = gameStore
const { canMoveSprite, spritePosition } = storeToRefs(gameStore)

</script>

<template>
  <div class="debug">
    <div class="debug__wrapper">
      <NyxButton :size="NyxSize.Small" @click="changeScene">Change Scene</NyxButton>
      <NyxButton :size="NyxSize.Small" :disabled="canMoveSprite" @click="moveSprite">Toggle Movement</NyxButton>
      <NyxButton :size="NyxSize.Small" @click="addSprite">Add New Sprite</NyxButton>
      <pre>{{ spritePosition }}</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .debug {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 1rem;
    font-family: monospace;
    display: flex;
    flex-direction: column;

    pre {
      font-size: 12px;
      background-color: var(--nyx-c-bg);
      padding: 1rem;
      border-radius: 0.5rem;
    }

    &__wrapper {
      width: 20rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  }
</style>
