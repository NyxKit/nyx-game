import { defineStore } from 'pinia'
import { ref } from 'vue'

const useSettingsStore = defineStore('settings', () => {
  const isFullscreen = ref(false)
  const musicVolume = ref(1)
  const sfxVolume = ref(1)

  return {
    isFullscreen,
    musicVolume,
    sfxVolume
  }
})

export default useSettingsStore
