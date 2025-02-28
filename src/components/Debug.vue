<script setup lang="ts">
import useGameStore from '@/stores/game'
import { storeToRefs } from 'pinia'
import { NyxButton, NyxCard } from 'nyx-kit/components'
import { NyxPosition, NyxSize, NyxTheme } from 'nyx-kit/types'
import { useTeleportPosition } from 'nyx-kit/compositions'
import { ref, useTemplateRef, type DefineComponent } from 'vue'

const gameStore = useGameStore()
const { changeScene, idlePlayer, addSprite } = gameStore
const { canIdlePlayer, spritePosition } = storeToRefs(gameStore)

const nyxButton = useTemplateRef<DefineComponent>('nyxButton')
const nyxCard = useTemplateRef<DefineComponent>('nyxCard')

const isDebugVisible = ref(false)

const { cssVariables } = useTeleportPosition(nyxButton, nyxCard, {
  gap: ref(NyxSize.XLarge),
  position: ref(NyxPosition.TopLeft),
  offsetX: -5,
  offsetY: -10
})

const toggleDebug = (value?: boolean) => {
  isDebugVisible.value = value === undefined ? !isDebugVisible.value : value
}

</script>

<template>
  <div class="debug">
    <NyxButton
      ref="nyxButton"
      class="debug__button"
      :theme="NyxTheme.Danger"
      :size="NyxSize.Small"
      @click="toggleDebug"
    >Debug</NyxButton>
    <Teleport to="body">
      <NyxCard
        class="debug__card"
        :class="{ 'debug__card--visible': isDebugVisible }"
        :style="cssVariables"
        ref="nyxCard"
      >
        <div class="debug__card-content">
          <NyxButton :size="NyxSize.Small" @click="changeScene">Change Scene</NyxButton>
          <NyxButton :size="NyxSize.Small" :disabled="!canIdlePlayer" @click="idlePlayer">Toggle Movement</NyxButton>
          <NyxButton :size="NyxSize.Small" @click="addSprite">Add New Sprite</NyxButton>
          <pre>{{ spritePosition }}</pre>
        </div>
      </NyxCard>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
  .debug {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 100;
    padding: var(--nyx-pad-lg);

    &__button {
      width: 7.5rem;
    }
  }
  
  .debug__card {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
    position: fixed;
    top: var(--top, 0);
    left: var(--left, 0);
    z-index: 200;
    padding-top: 2rem;

    &--visible {
      opacity: 1;
      pointer-events: auto;
    }

    pre {
      font-size: 12px;
      background-color: var(--nyx-c-bg);
      padding: 1rem;
      border-radius: 0.5rem;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 0;
    }
  }
</style>
