import { defineStore } from 'pinia'
import { ref } from 'vue'

const useClientStore = defineStore('client', () => {
  const SCREEN_WIDTH = ref(window.innerWidth)
  const SCREEN_HEIGHT = ref(window.innerHeight)

  const setScreenSize = () => {
    SCREEN_WIDTH.value = window.innerWidth
    SCREEN_HEIGHT.value = window.innerHeight
  }
  
  return {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    setScreenSize
  }
})

export default useClientStore
