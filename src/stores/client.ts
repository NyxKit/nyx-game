import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const useClientStore = defineStore('client', () => {
  const SCREEN_WIDTH = ref(window.innerWidth)
  const SCREEN_HEIGHT = ref(window.innerHeight)
  const SCREEN_CENTER = computed(() => ({ x: SCREEN_WIDTH.value / 2, y: SCREEN_HEIGHT.value / 2 }))

  const setScreenSize = () => {
    SCREEN_WIDTH.value = window.innerWidth
    SCREEN_HEIGHT.value = window.innerHeight
  }
  
  return {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_CENTER,
    setScreenSize
  }
})

export default useClientStore
