<script setup lang="ts">
import { NyxModal, NyxButton } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import useGameStore from '@/stores/game'
import { GameState } from '@/types'
import { storeToRefs } from 'pinia'
import { useHiscoresStore } from '@/stores'
import { watch } from 'vue'
import useProfilesStore from '@/stores/profiles'

const store = useGameStore()
const { isGameOver, score, debug } = storeToRefs(store)
const { addNewHiscore } = useHiscoresStore()
const { profile } = storeToRefs(useProfilesStore())

const onRestart = () => {
  store.reset()
  store.setGameState(GameState.Playing)
}

const onMainMenu = () => {
  store.reset()
  store.setGameState(GameState.Menu)
}

watch(isGameOver, (newVal) => {
  if (!newVal || !profile.value?.id) return
  debug.value.isEnabled = false
  addNewHiscore(profile.value.id, score.value)
})
</script>

<template>
  <NyxModal
    v-if="isGameOver"
    :size="NyxSize.Small"
    static
  >
    <h1>Game Over</h1>
    <p>Score: {{ score }}</p>
    <template #footer>
      <NyxButton @click="onRestart">Restart</NyxButton>
      <NyxButton @click="onMainMenu">Main Menu</NyxButton>
    </template>
  </NyxModal>
</template>
