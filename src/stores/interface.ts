import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import useGameStore from './game'

const useInterfaceStore = defineStore('interface', () => {
  const { isPlaying } = storeToRefs(useGameStore())
  const isHiscoresVisible = ref(false)
  const isSettingsVisible = ref(false)
  const isGameMenuVisible = ref(false)

  const toggleHiscores = () => isHiscoresVisible.value = !isHiscoresVisible.value
  const toggleSettings = () => isSettingsVisible.value = !isSettingsVisible.value
  const toggleGameMenu = () => {
    if (isPlaying.value) return
    isGameMenuVisible.value = !isGameMenuVisible.value
  }

  return {
    isGameMenuVisible,
    isHiscoresVisible,
    isSettingsVisible,
    toggleGameMenu,
    toggleHiscores,
    toggleSettings
  }
})

export default useInterfaceStore
