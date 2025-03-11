import { Debug } from '@/classes'
import config from '@/config'
import { GameState } from '@/types'
import { isGameScene } from '@/utils'
import { clamp } from 'nyx-kit/utils'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const useGameStore = defineStore('game', () => {
  const state = ref(GameState.Preload)
  const debug = ref(new Debug())
  const preloadProgress = ref(0)
  const currentScene = ref<Phaser.Scene>()
  const playerPosition = ref({ x: 0, y: 0 })
  const score = ref(0)
  const hp = ref(config.player.hpStart)
  const energy = ref(config.player.energyStart)
  const stamina = ref(config.player.staminaStart)
  const playStart = ref(0)

  const increaseScore = (amount: number = 1) => score.value += amount

  const setPlayerHp = (value: number) => hp.value = clamp(value, 0, config.player.hpMax)
  const setPlayerEnergy = (value: number) => energy.value = clamp(value, 0, config.player.energyMax)
  const setPlayerStamina = (value: number) => stamina.value = value

  const maxStamina = computed(() => {
    const total = config.player.maxStaminaStart + Math.floor(score.value / config.player.maxStaminaScoreInterval)
    return clamp(total, config.player.maxStaminaStart, config.player.maxStaminaEnd)
  })

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
  const isInGame = computed(() => isPlaying.value || isPaused.value)

  const reset = () => {
    hp.value = config.player.hpStart
    energy.value = config.player.energyStart
    stamina.value = config.player.staminaStart
    score.value = 0
    playStart.value = Date.now()
    if (currentScene.value && isGameScene(currentScene.value)) {
      currentScene.value.reset()
    }
  }

  const setGameState = (newState: GameState) => {
    const oldState = state.value
    if (oldState !== GameState.Paused && newState === GameState.Playing) {
      reset()
    }
    state.value = newState
  }

  watch(hp, (newVal) => {
    if (state.value !== GameState.Playing) return
    if (newVal > 0) return
    setGameState(GameState.GameOver)
  })

  return {
    currentScene,
    debug,
    energy,
    hp,
    increaseScore,
    isGameOver,
    isInGame,
    isInMenu,
    isPaused,
    isPlaying,
    isPreloading,
    playerPosition,
    playStart,
    preloadProgress,
    reset,
    score,
    setCurrentScene,
    setGameState,
    setPlayerEnergy,
    setPlayerHp,
    setPlayerStamina,
    setPreloadProgress,
    setPlayerPosition,
    state,
    stamina,
    maxStamina,
    togglePaused,
  }
})

export default useGameStore
