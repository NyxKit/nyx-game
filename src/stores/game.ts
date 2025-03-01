import type { GameScene } from '@/game/scenes'
import { defineStore } from 'pinia'
import { computed, ref, toRaw, watch } from 'vue'

const useGameStore = defineStore('game', () => {
  const isPlaying = ref(false)
  const isPreloadComplete = ref(false)
  const preloadProgress = ref(0)
  const currentScene = ref<Phaser.Scene>()
  const spritePosition = ref({ x: 0, y: 0 })

  const togglePlaying = () => isPlaying.value = !isPlaying.value
  const setPreloadComplete = (val: boolean) => isPreloadComplete.value = val
  const setPreloadProgress = (progress: number) => preloadProgress.value = progress
  const setCurrentScene = (scene: Phaser.Scene) => currentScene.value = scene

  const changeScene = () => {
    const scene = toRaw(currentScene.value) as GameScene
    scene?.changeScene()
  }
  
  const idlePlayer = () => {
    if (!currentScene.value) return
  
    const scene = toRaw(currentScene.value) as GameScene
    if (!scene) return
  
    // Get the update logo position
    scene.idlePlayer(({ x, y }: { x: number, y: number }) => {
      spritePosition.value = { x, y }
    })
  }
  
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
  
  const canIdlePlayer = computed(() => currentScene.value?.scene.key === 'Game')

  watch(currentScene, (newScene) => {
    if (newScene?.scene.key !== 'Game') return
    idlePlayer()
  })

  return {
    addSprite,
    canIdlePlayer,
    changeScene,
    currentScene,
    isPlaying,
    isPreloadComplete,
    idlePlayer,
    preloadProgress,
    setCurrentScene,
    setPreloadComplete,
    setPreloadProgress,
    spritePosition, 
    togglePlaying,
  }
})

export default useGameStore
