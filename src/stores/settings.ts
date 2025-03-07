import { EventBus } from '@/classes'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const useSettingsStore = defineStore('settings', () => {
  const isFullscreen = ref(false)
  const _currentVolume = ref(1)
  const musicVolume = ref(1)
  const sfxVolume = ref(1)

  const currentVolume = computed({
    get () {
      return _currentVolume.value
    },
    set (volume: number) {
      _currentVolume.value = volume
      EventBus.emit('setVolume', volume)
    }
  })

  const setVolume = (volume: number) => {
    currentVolume.value = volume
    EventBus.emit('setVolume', volume)
  }

  const setMusicVolume = (volume: number) => {
    musicVolume.value = volume
    EventBus.emit('setMusicVolume', volume)
  }

  const setSfxVolume = (volume: number) => {
    sfxVolume.value = volume
    EventBus.emit('setSfxVolume', volume)
  }

  return {
    currentVolume,
    isFullscreen,
    musicVolume,
    sfxVolume,
    setVolume,
    setMusicVolume,
    setSfxVolume
  }
})

export default useSettingsStore
