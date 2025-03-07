<script setup lang="ts">
import { NyxModal, NyxButton } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import useGameStore from '@/stores/game'
import { GameState } from '@/types'
import { storeToRefs } from 'pinia'
import { useHiscoresStore } from '@/stores'
import { ref, watch } from 'vue'
import useProfilesStore from '@/stores/profiles'
import type Hiscore from '@/classes/Hiscore'

const store = useGameStore()
const { isGameOver, score, debug } = storeToRefs(store)
const { addNewHiscore } = useHiscoresStore()
const { profile } = storeToRefs(useProfilesStore())
const hiscore = ref<Hiscore|null>(null)

const onRestart = () => {
  store.reset()
  store.setGameState(GameState.Playing)
}

const onMainMenu = () => {
  store.reset()
  store.setGameState(GameState.Menu)
}

watch(isGameOver, async (newVal) => {
  hiscore.value = null
  if (!newVal || !profile.value?.id) return
  debug.value.isEnabled = false
  // debug.value.isEnabled = import.meta.env.DEV ? debug.value.isEnabled : false
  hiscore.value = await addNewHiscore(profile.value.id, score.value)
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
    <p v-if="hiscore?.hasDebugged">
      You played with debug mode enabled. Hiscore will not be visible in the leaderboard.
    </p>
    <template #footer>
      <NyxButton @click="onRestart">Restart</NyxButton>
      <NyxButton @click="onMainMenu">Main Menu</NyxButton>
    </template>
  </NyxModal>
</template>
