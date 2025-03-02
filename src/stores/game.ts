import type { GameScene } from '@/scenes'
import { GameState } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref, toRaw, watch } from 'vue'

const useGameStore = defineStore('game', () => {
  const state = ref(GameState.Init)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const isPreloadComplete = ref(false)
  const preloadProgress = ref(0)
  const currentScene = ref<Phaser.Scene>()
  const spritePosition = ref({ x: 0, y: 0 })
  const score = ref(0)
  const hp = ref(50)

  const setGameState = (newState: GameState) => state.value = newState

  const togglePlaying = (newVal?: boolean) => {
    isPlaying.value = (newVal === undefined) ? !isPlaying.value : newVal
    isPaused.value = !isPlaying.value
  }

  const incrementScore = (amount?: number) => score.value += amount ?? 1
  const decrementHp = (amount?: number) => hp.value -= amount ?? 1

  const setPreloadComplete = (val: boolean) => isPreloadComplete.value = val
  const setPreloadProgress = (progress: number) => preloadProgress.value = progress
  const setCurrentScene = (scene: Phaser.Scene) => currentScene.value = scene
  const togglePaused = (newVal?: boolean) => isPaused.value = (newVal === undefined) ? !isPaused.value : newVal

  const addSprite = () => {
  
    const scene = toRaw(currentScene.value) as Phaser.Scene
    if (!scene) return
  
    // Add a new sprite to the current scene at a random position
    const x = Phaser.Math.Between(64, scene.scale.width - 64)
    const y = Phaser.Math.Between(64, scene.scale.height - 64)
  
    // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
    const star = scene.add.sprite(x, y, 'star')
  
    //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
    //  You could, of course, do this from within the Phaser Scene code, but this is just an example
    //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
    scene.add.tween({
      targets: star,
      duration: 500 + Math.random() * 1000,
      alpha: 0,
      yoyo: true,
      repeat: -1
    })
  }

  return {
    addSprite,
    currentScene,
    decrementHp,
    hp,
    incrementScore,
    isPaused,
    isPlaying,
    isPreloadComplete,
    preloadProgress,
    score,
    setCurrentScene,
    setGameState,
    setPreloadComplete,
    setPreloadProgress,
    spritePosition, 
    state,
    togglePaused,
    togglePlaying,
  }
})

export default useGameStore
