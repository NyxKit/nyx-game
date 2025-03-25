<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useGameStore } from '@/stores'
import { NyxProgress } from 'nyx-kit/components'
import { NyxProgressVariant, NyxSize, NyxTheme } from 'nyx-kit/types'
import { storeToRefs } from 'pinia'

const { hp, energy, stamina, maxStamina, score, debug, isInGame } = storeToRefs(useGameStore())

const interval = ref<number | null>(null)
const numClicksDebug = ref(0)

onBeforeUnmount(() => {
  if (!interval.value) return
  window.clearInterval(interval.value)
})

const onClickHp = () => {
  if (debug.value.isEnabled) return
  numClicksDebug.value += 1
  if (numClicksDebug.value < 10) return
  debug.value.isEnabled = true
  numClicksDebug.value = 0
}

</script>

<template>
  <header class="game-interface" v-if="isInGame">
    <section class="game-interface__stats">
      <NyxProgress
        class="game-interface__progress-hp"
        :modelValue="hp"
        :max="100"
        :size="NyxSize.XLarge"
        :theme="NyxTheme.Danger"
        showValue="start"
        @click="onClickHp"
      />
      <NyxProgress
        class="game-interface__progress-energy"
        :modelValue="energy"
        :max="100"
        :size="NyxSize.Medium"
        :theme="NyxTheme.Secondary"
      />
      <NyxProgress
        class="game-interface__progress-stamina"
        :modelValue="stamina"
        :max="maxStamina"
        :size="NyxSize.Medium"
        :theme="NyxTheme.Success"
        :variant="NyxProgressVariant.Dots"
      />
    </section>
    <span class="game-interface__score">{{ Math.floor(score) }}</span>
  </header>
</template>

<style lang="scss">
.game-interface {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  pointer-events: none;
  user-select: none;

  &__stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 20rem;
    width: 33%;
  }

  &__progress-hp {
    pointer-events: all;
  }

  &__score {
    flex: 1;
    text-align: right;
    font-size: 2rem;
    font-weight: bold;
    color: var(--nyx-c-text);
    user-select: none;
  }
}
</style>
