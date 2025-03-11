<script setup lang="ts">
import { NyxModal, NyxButton, NyxSpinner } from 'nyx-kit/components'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import useGameStore from '@/stores/game'
import { GameState } from '@/types'
import { storeToRefs } from 'pinia'
import { useHiscoresStore } from '@/stores'
import { ref, watch } from 'vue'
import useProfilesStore from '@/stores/profiles'
import type Hiscore from '@/classes/Hiscore'
import config from '@/config'

const store = useGameStore()
const { isGameOver, score, debug } = storeToRefs(store)
const { addNewHiscore } = useHiscoresStore()
const { profile } = storeToRefs(useProfilesStore())
const hiscore = ref<Hiscore|null>(null)

const onRestart = () => {
  store.setGameState(GameState.Playing)
}

const onMainMenu = () => {
  store.setGameState(GameState.Menu)
}

watch(isGameOver, async (newVal) => {
  hiscore.value = null
  if (!newVal || !profile.value?.id) return
  debug.value.isEnabled = false
  hiscore.value = await addNewHiscore(profile.value.id, score.value)
  store.reset()
})
</script>

<template>
  <NyxModal
    v-if="isGameOver"
    :size="NyxSize.Small"
    static
    title="Game Over"
  >
    <section v-if="hiscore" class="game-over__body">
      <p>Score: {{ hiscore.score }}</p>
      <p v-if="hiscore?.hasDebugged">
        You played with debug mode enabled. Hiscore will not be visible in the leaderboard.
      </p>
      <p v-if="hiscore.score < config.hiscores.threshold">
        You need a minimum score of {{ config.hiscores.threshold }} to make it into the leaderboard.
      </p>
    </section>
    <section v-else class="game-over__body game-over__body-spinner">
      <NyxSpinner :size="NyxSize.Large" />
    </section>
    <template #footer>
      <section class="game-over__footer">
        <NyxButton :theme="NyxTheme.Warning" @click="onRestart">Restart</NyxButton>
        <NyxButton :theme="NyxTheme.Danger" @click="onMainMenu">Quit</NyxButton>
      </section>
    </template>
  </NyxModal>
</template>

<style lang="scss">
.game-over {
  &__footer {
    display: flex;
    gap: 2rem;
  }

  &__body {
    min-height: 10rem;
    display: flex;
    flex-direction: column;

    &-spinner {
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
