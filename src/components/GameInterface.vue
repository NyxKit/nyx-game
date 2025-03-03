<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useGameStore } from '@/stores'
import { NyxProgress } from 'nyx-kit/components'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import { storeToRefs } from 'pinia'

const { hp, energy, score, isPlaying, isPaused, debug } = storeToRefs(useGameStore())

const interval = ref<number | null>(null)
const numClicksDebug = ref(0)

onMounted(() => {
  interval.value = window.setInterval(() => {
    if (!isPlaying.value || isPaused.value) return
    score.value += 1
  }, 500)
})

onBeforeUnmount(() => {
  if (!interval.value) return
  window.clearInterval(interval.value)
})

const onClickHp = () => {
  if (debug.value.isEnabled) return
  numClicksDebug.value += 1
  if (numClicksDebug.value < 10) return
  debug.value.isEnabled = true
}

</script>

<template>
  <header class="game-interface">
    <NyxProgress
      class="game-interface__progress"
      :modelValue="hp"
      :max="100"
      :size="NyxSize.XLarge"
      :theme="NyxTheme.Danger"
    />
    <span class="game-interface__score" @click="onClickHp">{{ score }}</span>
    <NyxProgress
      class="game-interface__progress"
      :modelValue="energy"
      :max="100"
      :size="NyxSize.XLarge"
      :theme="NyxTheme.Secondary"
    />
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
  // background-color: var(--nyx-c-bg);
  gap: 1rem;

  &__progress {
    height: 2rem;
    flex: 1;
  }

  &__score {
    flex: 1;
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: var(--nyx-c-text);
    user-select: none;
  }
}
</style>
