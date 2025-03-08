import { EventBus } from '@/classes'
import { GameEvents } from '@/classes/EventBus'
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
      localStorage.setItem('settings', JSON.stringify({ currentVolume: volume }))
      EventBus.emit(GameEvents.SetVolume, volume)
    }
  })

  const setVolume = (volume: number) => {
    currentVolume.value = volume
  }

  const setMusicVolume = (volume: number) => {
    musicVolume.value = volume
    EventBus.emit(GameEvents.SetMusicVolume, volume)
  }

  const setSfxVolume = (volume: number) => {
    sfxVolume.value = volume
    EventBus.emit(GameEvents.SetSfxVolume, volume)
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
