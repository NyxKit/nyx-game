import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const useInterfaceStore = defineStore('interface', () => {
  const isPlaying = ref(false)
  const isHiscoresVisible = ref(false)
  const isSettingsVisible = ref(false)
  const isGameMenuVisible = ref(false)

  const togglePlaying = () => isPlaying.value = !isPlaying.value
  const toggleHiscores = () => isHiscoresVisible.value = !isHiscoresVisible.value
  const toggleSettings = () => isSettingsVisible.value = !isSettingsVisible.value
  const toggleGameMenu = () => {
    console.log('qsdf')
    if (isPlaying.value) return
    isGameMenuVisible.value = !isGameMenuVisible.value
  }

  return {
    isGameMenuVisible,
    isHiscoresVisible,
    isPlaying,
    isSettingsVisible,
    toggleGameMenu,
    toggleHiscores,
    togglePlaying,
    toggleSettings
  }
})

export default useInterfaceStore
