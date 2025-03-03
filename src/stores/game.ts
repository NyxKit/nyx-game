import { Debug } from '@/classes'
import { GameState } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const useGameStore = defineStore('game', () => {
  const state = ref(GameState.Preload)
  const debug = ref(new Debug())
  const preloadProgress = ref(0)
  const currentScene = ref<Phaser.Scene>()
  const playerPosition = ref({ x: 0, y: 0 })
  const score = ref(0)
  const hp = ref(0)
  const energy = ref(0)

  const setGameState = (newState: GameState) => state.value = newState
  const increaseScore = (amount?: number) => score.value += amount ?? 1
  const decreaseHp = (amount?: number) => hp.value -= amount ?? 1
  const decreaseEnergy = (amount?: number) => energy.value -= amount ?? 1

  const setPreloadProgress = (progress: number) => preloadProgress.value = progress
  const setCurrentScene = (scene: Phaser.Scene) => currentScene.value = scene
  const togglePaused = (newVal?: boolean) => {
    if (![GameState.Playing, GameState.Paused].includes(state.value)) return
    if (newVal === undefined) {
      state.value = state.value === GameState.Playing ? GameState.Paused : GameState.Playing
    } else {
      state.value = newVal ? GameState.Paused : GameState.Playing
    }
  }

  const setPlayerPosition = (x: number, y: number) => playerPosition.value = { x, y }

  const isPaused = computed(() => state.value === GameState.Paused)
  const isPlaying = computed(() => state.value === GameState.Playing)
  const isPreloading = computed(() => state.value === GameState.Preload)
  const isInMenu = computed(() => state.value === GameState.Menu)
  const isGameOver = computed(() => state.value === GameState.GameOver)

  watch(hp, (newVal) => {
    if (state.value !== GameState.Playing) return
    if (newVal > 0) return
    setGameState(GameState.GameOver)
  })

  watch(state, (newVal, oldVal) => {
    if (oldVal === GameState.Paused) return
    if (newVal !== GameState.Playing) return
    hp.value = 100
    energy.value = 20
    score.value = 0
  })

  return {
    currentScene,
    debug,
    decreaseEnergy,
    decreaseHp,
    energy,
    hp,
    increaseScore,
    isGameOver,
    isInMenu,
    isPaused,
    isPlaying,
    isPreloading,
    playerPosition,
    preloadProgress,
    score,
    setCurrentScene,
    setGameState,
    setPreloadProgress,
    setPlayerPosition,
    state,
    togglePaused,
  }
})

export default useGameStore
